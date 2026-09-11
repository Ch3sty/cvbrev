/**
 * Produktstegen (docs/plan-konvertering.md, spår A).
 * Klientsäker: inga env-variabler här. Server-mappning till Stripe-priser
 * ligger i src/lib/stripe/planPrices.ts.
 */

export type PlanKey = 'daypass' | 'week' | 'month' | 'quarter'

export interface Plan {
  key: PlanKey
  name: string
  amount: number
  /** 'one_time' ger premium_until + days, 'recurring' är Stripe-prenumeration */
  kind: 'one_time' | 'recurring'
  /** Antal dagar för engångsköp */
  days?: number
  /** Etikett efter beloppet */
  suffix: string
  /** Jämförpris, visas under beloppet */
  perMonth?: string
  badge?: string
  body: string
  ctaLabel: string
  highlights: readonly string[]
}

export const PLANS: readonly Plan[] = [
  {
    key: 'daypass',
    name: 'Dagspass',
    amount: 49,
    kind: 'one_time',
    days: 1,
    suffix: 'engångs',
    body: '24 timmar med allt upplåst. För dig som ska skicka in en ansökan ikväll.',
    ctaLabel: 'Köp dagspass',
    highlights: ['Ladda ner brev och CV', 'Alla 42 mallar', 'Full CV-analys', 'Ingen prenumeration'],
  },
  {
    key: 'week',
    name: 'Jobbsökarveckan',
    amount: 99,
    kind: 'one_time',
    days: 7,
    suffix: 'engångs',
    body: 'Sju dagar med allt. Ingen prenumeration, ingen uppsägning. För dig som söker flera jobb den här veckan.',
    ctaLabel: 'Köp veckan',
    highlights: ['Obegränsade brev i sju dagar', 'Ladda ner allt du skapar', 'Alla mallar och tester', 'Inget dras automatiskt'],
  },
  {
    key: 'month',
    name: 'Månad',
    amount: 149,
    kind: 'recurring',
    suffix: '/ månad',
    badge: 'Mest vald',
    body: '149 kr i månaden. Ett jobb du missar kostar mer. Avsluta när du vill.',
    ctaLabel: 'Starta Premium',
    highlights: ['Obegränsade brev och analyser', 'Alla 42 CV-mallar', 'Obegränsad jobbcoach-chatt', 'Avsluta med ett klick'],
  },
  {
    key: 'quarter',
    name: 'Kvartal',
    amount: 299,
    kind: 'recurring',
    suffix: 'för 3 månader',
    perMonth: '99 kr per månad',
    badge: 'Bäst värde',
    body: '299 kr för tre månader, alltså 99 kr i månaden. För dig som vet att sökandet tar tid.',
    ctaLabel: 'Välj kvartal',
    highlights: ['Allt i Månad', 'Betala 99 kr i månaden i stället för 149', 'Förnyas var tredje månad', 'Avsluta när du vill'],
  },
] as const

export const PLAN_BY_KEY: Record<PlanKey, Plan> = Object.fromEntries(
  PLANS.map((p) => [p.key, p])
) as Record<PlanKey, Plan>

export function isPlanKey(value: unknown): value is PlanKey {
  return value === 'daypass' || value === 'week' || value === 'month' || value === 'quarter'
}
