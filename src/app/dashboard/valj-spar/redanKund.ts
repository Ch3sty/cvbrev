/**
 * Har kontot redan en levande prenumeration på det köpsteget säljer?
 *
 * Samma regel som kassans spärr (guard-existing-subscription.ts): levande
 * status, och samma behörighet som planen ger. Känns priset inte igen räknas
 * det som samma, precis som i spärren. Den som har ett äldre spårpaket och
 * köper Premium är en uppgradering och släpps fram.
 *
 * Läser bara profilen. Kassan frågar Stripe och är facit; det här avgör bara
 * om köpsteget ska visas.
 */
import { PLAN_BY_KEY, type PlanKey } from '@/lib/plans/plans'
import { priceIdToPlanKey } from '@/lib/stripe/planPrices'

const LEVANDE = ['active', 'trialing', 'past_due', 'unpaid']

export function harRedanPlanen(
  profil: { subscription_status?: unknown; price_id?: unknown } | null | undefined,
  plan: PlanKey
): boolean {
  const status = profil?.subscription_status
  if (typeof status !== 'string' || !LEVANDE.includes(status)) return false
  const har = priceIdToPlanKey(typeof profil?.price_id === 'string' ? profil.price_id : null)
  if (!har) return true
  return PLAN_BY_KEY[har].scope === PLAN_BY_KEY[plan].scope
}
