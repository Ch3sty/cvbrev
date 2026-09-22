// Behörigheten en prenumeration ger (docs/plan-paket-och-onboarding.md
// avsnitt 5). Egen fil för att webhooken inte går att ladda i ett test utan
// Stripe-nycklar, och det här är den enda regel i webhooken som är värd att
// testa för sig.

import { PLAN_BY_KEY, isPlanKey, type PlanScope } from '@/lib/plans/plans'
import { priceIdToPlanKey } from '@/lib/stripe/planPrices'

/** Så lite av en Stripe-prenumeration som regeln behöver. */
export interface ScopeUnderlag {
  metadata?: Record<string, string> | null
  priceId?: string | null
}

/**
 * Metadata är förstahandskällan: checkout-rutterna sätter scope och planKey
 * på prenumerationen. Priset är reserven för abonnemang tecknade före
 * paketsläppet och för rader som ändrats direkt i Stripes gränssnitt.
 *
 * Känns ingetdera igen faller vi tillbaka på 'allt'. Regeln är att ingen
 * befintlig kund får mindre än i dag, och en levande prenumeration med ett
 * okänt pris är just en sådan kund.
 */
export function scopeFromSubscription(underlag: ScopeUnderlag): PlanScope {
  const fromMetadata = underlag.metadata?.scope
  if (fromMetadata === 'cv' || fromMetadata === 'tester' || fromMetadata === 'allt') {
    return fromMetadata
  }

  const metaPlan = underlag.metadata?.planKey ?? underlag.metadata?.plan
  if (isPlanKey(metaPlan)) return PLAN_BY_KEY[metaPlan].scope

  const planFromPrice = priceIdToPlanKey(underlag.priceId ?? null)
  if (planFromPrice) return PLAN_BY_KEY[planFromPrice].scope

  return 'allt'
}
