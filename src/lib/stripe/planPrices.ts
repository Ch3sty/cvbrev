// Serverside-mappning från paket till Stripe-pris
// (docs/plan-paket-och-onboarding.md avsnitt 5). Klienten skickar bara en
// PlanKey, aldrig ett price id, så det här är den enda platsen där priserna
// bor.
//
// De tre befintliga priserna behåller sina price-id och byter bara nyckelnamn
// i koden: STRIPE_PRICE_DAYPASS blir Allt-dagen, NEXT_PUBLIC_STRIPE_PRICE_ID
// blir Allt-månaden och STRIPE_PRICE_QUARTER blir Allt-kvartalet. Inga kvitton
// eller befintliga köp påverkas. De tre veckopriserna är nya och skapas med
// scripts/stripe-skapa-paket.ts.

import type { PlanKey } from '@/lib/plans/plans'

const ENV_BY_PLAN: Record<PlanKey, string> = {
  cv_week: 'STRIPE_PRICE_CV_WEEK',
  test_week: 'STRIPE_PRICE_TEST_WEEK',
  all_day: 'STRIPE_PRICE_DAYPASS',
  all_week: 'STRIPE_PRICE_ALL_WEEK',
  all_month: 'NEXT_PUBLIC_STRIPE_PRICE_ID',
  all_quarter: 'STRIPE_PRICE_QUARTER',
}

/** Env-variabeln som bär price-id för ett paket. */
export function getPlanEnvName(plan: PlanKey): string {
  return ENV_BY_PLAN[plan]
}

/**
 * Hämtar Stripe-price-id för ett paket. Kastar med tydligt felmeddelande om
 * env-variabeln saknas, så felet syns i loggen i stället för att bli en
 * trasig checkout.
 */
export function getStripePriceId(plan: PlanKey): string {
  const envName = ENV_BY_PLAN[plan]
  const value = process.env[envName]
  if (!value) {
    throw new Error(
      `Saknar env-variabeln ${envName}. Skapa priset i Stripe och lägg in id:t innan ${plan} kan säljas.`
    )
  }
  return value
}

/**
 * Slår tillbaka från price-id till paket. Webhooken använder den när
 * metadata saknas, alltså för prenumerationer tecknade före paketsläppet
 * och för abonnemang som ändrats direkt i Stripes gränssnitt.
 */
export function priceIdToPlanKey(priceId: string | null | undefined): PlanKey | null {
  if (!priceId) return null
  for (const [plan, envName] of Object.entries(ENV_BY_PLAN) as [PlanKey, string][]) {
    if (process.env[envName] && process.env[envName] === priceId) return plan
  }
  return null
}

/** Alla price-id som får tecknas i prenumerationscheckout. */
export function getSubscriptionPriceAllowlist(): string[] {
  const subscriptionPlans: PlanKey[] = ['cv_week', 'test_week', 'all_week', 'all_month', 'all_quarter']
  return subscriptionPlans
    .map((plan) => process.env[ENV_BY_PLAN[plan]])
    .filter((id): id is string => Boolean(id))
}
