// src/lib/konto/raderaKonto.server.ts
// ====================================
// Radera den inloggades konto, på servern. Webbens Inställningar och appens
// kontovy använder samma väg.
//
// Bakgrund: webbens radering anropade auth.admin.deleteUser från webbläsaren.
// Det kräver service role och nekades alltid med användarens nyckel, och
// reserven delete_user_account har aldrig funnits i databasen. Ingen kunde
// alltså radera sitt konto själv. Google Play kräver en fungerande radering
// (Testklar, docs/plan-app.md).
//
// Ordning:
//  1. Levande Stripe-prenumerationer avslutas direkt, så att ingen dras för
//     ett konto som inte finns. Går det inte avbryts raderingen hellre än att
//     kunden fortsätter betala för ett borttaget konto.
//  2. Auth-användaren tas bort. Raderingen kaskaderar via foreign keys till
//     profiles, premium_grants, app_enheter och resten, som admins radering i
//     api/admin/users/[id].
//
// En prenumeration i Google Play avslutas inte här; den hanteras i Play och
// kontovyn i appen säger det före bekräftelsen.

import type { SupabaseClient } from '@supabase/supabase-js'

const LEVANDE = new Set(['active', 'trialing', 'past_due', 'unpaid', 'incomplete'])

export type RaderaResultat =
  | { ok: true }
  | { ok: false; fel: 'stripe' | 'radering'; detalj: string }

/** Avslutar kundens levande Stripe-prenumerationer. Kastar vid fel. */
async function avslutaStripe(customerId: string): Promise<void> {
  const { stripe } = await import('@/lib/stripe/server')
  const lista = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 20 })
  for (const sub of lista.data) {
    if (LEVANDE.has(sub.status)) await stripe.subscriptions.cancel(sub.id)
  }
}

export async function raderaKonto(admin: SupabaseClient, userId: string): Promise<RaderaResultat> {
  const { data: profil } = await admin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .maybeSingle()

  const customerId = (profil as { stripe_customer_id?: string | null } | null)?.stripe_customer_id
  if (customerId) {
    try {
      await avslutaStripe(customerId)
    } catch (e) {
      const detalj = e instanceof Error ? e.message : String(e)
      console.error('[raderaKonto] Stripe', detalj)
      return { ok: false, fel: 'stripe', detalj }
    }
  }

  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) {
    console.error('[raderaKonto] deleteUser', error.message)
    return { ok: false, fel: 'radering', detalj: error.message }
  }
  return { ok: true }
}
