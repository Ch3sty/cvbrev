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

import type { SupabaseClient } from '@supabase/supabase-js'

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
  }
): Promise<GrantPremiumDaysResult> {
  const { userId, days, stripeEventId } = params
  const source = params.source ?? `onetime_${days}d`

  // Idempotensspärren först: vinner insert-racet gör vi jobbet, annars inte.
  const { error: insertError } = await admin.from('premium_grants').insert({
    user_id: userId,
    stripe_event_id: stripeEventId,
    days,
    source,
  })

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
