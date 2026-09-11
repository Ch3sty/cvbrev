// Serverside-mappning från produktsteg till Stripe-pris (A5/A6 i
// docs/plan-konvertering.md). Klienten skickar bara en PlanKey, aldrig ett
// price id, så det här är den enda platsen där priserna bor.

import type { PlanKey } from '@/lib/plans/plans'

const ENV_BY_PLAN: Record<PlanKey, string> = {
  daypass: 'STRIPE_PRICE_DAYPASS',
  week: 'STRIPE_PRICE_WEEK',
  month: 'NEXT_PUBLIC_STRIPE_PRICE_ID',
  quarter: 'STRIPE_PRICE_QUARTER',
}

/**
 * Hämtar Stripe-price-id för ett produktsteg. Kastar med tydligt
 * felmeddelande om env-variabeln saknas, så felet syns i loggen i stället
 * för att bli en trasig checkout.
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

/** Alla price-id som får användas i prenumerationscheckout (månad, kvartal). */
export function getSubscriptionPriceAllowlist(): string[] {
  return [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID, process.env.STRIPE_PRICE_QUARTER].filter(
    (id): id is string => Boolean(id)
  )
}
