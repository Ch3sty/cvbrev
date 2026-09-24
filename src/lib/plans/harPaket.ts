/**
 * Paketet den betalande kunden faktiskt har.
 *
 * Scopet säger spåret, inte längden. Längden står i prenumerationens prisid
 * (profiles.price_id), och det är den som avgör när den finns: webhooken
 * nollar premium_until för prenumerationer, så en gissning ur sluttiden blev
 * alltid vecka och menyn sa "99 kr" för Hela paketet månad och kvartal
 * (docs/qa/qa-kop-testlage-2026-09-24.md, bugg 2).
 *
 * Gissningen ur premium_until står kvar som reserv för det som saknar prisid:
 * Dagspasset, manuellt tilldelad premium och prenumerationer vars pris inte
 * längre känns igen. Den som förnyas om mindre än tio dagar har en vecka,
 * resten en månad eller ett kvartal. Saknas underlag faller vi tillbaka på
 * veckan, som är det de flesta har.
 *
 * Delad mellan kontosidan, hemskärmens summering, menyn, mallarna, testerna
 * och mejlrunnern, så de aldrig säger olika paket. Bara för servern: prisid
 * mappas via env-variablerna i planPrices.ts.
 */
import type { Scope } from '@/lib/access/features'
import { priceIdToPlanKey } from '@/lib/stripe/planPrices'
import { PLAN_BY_KEY, type PlanKey } from './plans'

/** Prenumerationen på profilen. Bara en levande prenumeration får avgöra. */
export interface PaketPrenumeration {
  priceId?: string | null
  status?: string | null
}

const LEVANDE = ['active', 'trialing', 'past_due', 'unpaid']

export function harPaket(
  scope: Scope | null,
  premiumUntil: Date | null,
  now: Date = new Date(),
  prenumeration?: PaketPrenumeration | null
): PlanKey | null {
  if (!scope) return null

  // Prisid:t först. Det måste höra till en levande prenumeration och ge samma
  // scope som kunden har i dag: en gammal, avslutad månad ska inte göra ett
  // Dagspass till "Hela paketet, 149 kr".
  const status = prenumeration?.status ?? null
  if (prenumeration?.priceId && (status === null || LEVANDE.includes(status))) {
    const plan = priceIdToPlanKey(prenumeration.priceId)
    if (plan && PLAN_BY_KEY[plan].scope === scope && PLAN_BY_KEY[plan].mode === 'subscription') {
      return plan
    }
  }

  if (scope === 'cv') return 'cv_week'
  if (scope === 'tester') return 'test_week'

  if (!premiumUntil) return 'all_week'
  const dagar = (premiumUntil.getTime() - now.getTime()) / 86400000
  if (dagar <= 1.5) return 'all_day'
  if (dagar <= 10) return 'all_week'
  if (dagar <= 45) return 'all_month'
  return 'all_quarter'
}
