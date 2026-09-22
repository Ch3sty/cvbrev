/**
 * Paketet den betalande kunden faktiskt har, ur scope och sluttid.
 *
 * Scopet säger spåret, inte längden. Längden ligger i prenumerationens
 * prisid, och den läses av Stripe-vyn. Här räcker scopet plus längden ur
 * premium_until: den som förnyas om mindre än tio dagar har en vecka, resten
 * en månad eller ett kvartal. Saknas underlag faller vi tillbaka på veckan,
 * som är det de flesta har.
 *
 * Delad mellan kontosidan, hemskärmens summering och menyn, så de tre aldrig
 * säger olika paket.
 */
import type { Scope } from '@/lib/access/features'
import type { PlanKey } from './plans'

export function harPaket(scope: Scope | null, premiumUntil: Date | null, now: Date = new Date()): PlanKey | null {
  if (!scope) return null
  if (scope === 'cv') return 'cv_week'
  if (scope === 'tester') return 'test_week'

  if (!premiumUntil) return 'all_week'
  const dagar = (premiumUntil.getTime() - now.getTime()) / 86400000
  if (dagar <= 1.5) return 'all_day'
  if (dagar <= 10) return 'all_week'
  if (dagar <= 45) return 'all_month'
  return 'all_quarter'
}
