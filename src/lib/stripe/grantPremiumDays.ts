// Ger premium-dagar efter ett engångsköp (A5 i docs/plan-konvertering.md).
//
// Tre regler som inte får brytas:
// 1. Idempotent. premium_grants.stripe_event_id är unik, så ett omsänt
//    webhook-event ger aldrig dubbla dagar.
// 2. Förlängning räknas från max(nu, premium_until), så ett köp under
//    reverse trial lägger dagar ovanpå i stället för att kapa bort dem.
// 3. subscription_status rörs aldrig, och premium_source skrivs inte om
//    kontot har en aktiv prenumeration (webhookens prenumerationsgren
//    nollar annars premium_until nästa gång den kör).

// 4. profiles.premium_scope rörs aldrig här. Den kolumnen speglar
//    prenumerationen. Engångsköpet bär sitt scope på premium_grants-raden,
//    så att nedtrappningen vet vad som ska gälla när dygnet gått ut
//    (docs/plan-paket-och-onboarding.md avsnitt 5, noten om överlappande köp).

import type { SupabaseClient } from '@supabase/supabase-js'
import type { PlanScope } from '@/lib/plans/plans'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any, any, any>

export interface GrantPremiumDaysResult {
  granted: boolean
  /** 'duplicate' när eventet redan var bokfört, 'no_profile' när kontot saknas */
  reason?: 'duplicate' | 'no_profile'
  premiumUntil?: string
}

export async function grantPremiumDays(
  admin: AnySupabase,
  params: {
    userId: string
    days: number
    stripeEventId: string
    /** t.ex. 'onetime_1d' */
    source?: string
    /** Behörigheten dagarna ger. Dagspasset är alltid 'allt'. */
    scope?: PlanScope
  }
): Promise<GrantPremiumDaysResult> {
  const { userId, days, stripeEventId } = params
  const source = params.source ?? `onetime_${days}d`
  const scope: PlanScope = params.scope ?? 'allt'

  // Raden bär sitt eget scope. Typerna i database.types.ts kan släpa efter
  // migrationen som lägger till kolumnen, så insert-nyttolasten typas lokalt.
  const grantRow: Record<string, unknown> = {
    user_id: userId,
    stripe_event_id: stripeEventId,
    days,
    source,
    scope,
  }

  // Idempotensspärren först: vinner insert-racet gör vi jobbet, annars inte.
  const { error: insertError } = await admin.from('premium_grants').insert(grantRow)

  if (insertError) {
    // 23505 = unique violation, alltså ett event vi redan bokfört.
    if ((insertError as { code?: string }).code === '23505') {
      return { granted: false, reason: 'duplicate' }
    }
    throw new Error(`Kunde inte skriva premium_grants: ${insertError.message}`)
  }

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('premium_until, subscription_status')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    return { granted: false, reason: 'no_profile' }
  }

  const current = (profile as { premium_until?: string | null }).premium_until
  const status = (profile as { subscription_status?: string | null }).subscription_status
  const hasLiveSubscription = status === 'active' || status === 'trialing'

  const now = new Date()
  const currentUntil = current ? new Date(current) : null
  const base = currentUntil && currentUntil > now ? currentUntil : now
  const premiumUntil = new Date(base.getTime() + days * 24 * 60 * 60 * 1000).toISOString()

  const update: Record<string, unknown> = {
    subscription_tier: 'premium',
    premium_until: premiumUntil,
  }
  // Skriv aldrig över premium_source på ett konto med levande prenumeration.
  if (!hasLiveSubscription) {
    update.premium_source = source
  }

  const { error: updateError } = await admin.from('profiles').update(update).eq('id', userId)
  if (updateError) {
    throw new Error(`Kunde inte uppdatera profilen: ${updateError.message}`)
  }

  await admin
    .from('premium_grants')
    .update({ premium_until_after: premiumUntil })
    .eq('stripe_event_id', stripeEventId)

  return { granted: true, premiumUntil }
}
