/**
 * Paketen (docs/plan-paket-och-onboarding.md, ägarens beslut 2026-09-22).
 *
 * Sex nycklar, tre val i gränssnittet: spåret väljs först, längden efteråt.
 * CV-veckan och Testveckan finns bara som vecka. Allt har fyra längder, och
 * Allt-dagen är det enda engångsköpet.
 *
 * Klientsäker: inga env-variabler här. Server-mappning till Stripe-priser
 * ligger i src/lib/stripe/planPrices.ts.
 */

import { TEMPLATE_COUNT } from '@/lib/cv/simple-templates'

export type PlanKey = 'cv_week' | 'test_week' | 'all_day' | 'all_week' | 'all_month' | 'all_quarter'

/** Vad paketet låser upp. Speglar profiles.premium_scope. */
export type PlanScope = 'cv' | 'tester' | 'allt'

/** Hur länge paketet gäller. Styr texten i kassan, inte behörigheten. */
export type PlanLength = 'dag' | 'vecka' | 'månad' | 'kvartal'

/** Stripe-läget. Allt-dagen är engångs, resten löpande. */
export type PlanMode = 'payment' | 'subscription'

export interface Plan {
  key: PlanKey
  /** Namnet i bestämd form, samma i Stripe, kvitton och mejl (beslut 6). */
  name: string
  /** Pris i kronor, inklusive moms, som det visas i kassan. */
  amount: number
  scope: PlanScope
  length: PlanLength
  mode: PlanMode
  /** Antal dagar för engångsköp. Bara Allt-dagen har det. */
  grantDays?: number
  /** Etikett efter beloppet */
  suffix: string
  /** Vem paketet passar. */
  audience: string
  /** Jämförpris, visas under beloppet */
  perMonth?: string
  badge?: string
  body: string
  ctaLabel: string
  highlights: readonly string[]
}

export const PLANS: readonly Plan[] = [
  {
    key: 'cv_week',
    name: 'CV-veckan',
    amount: 79,
    scope: 'cv',
    length: 'vecka',
    mode: 'subscription',
    suffix: 'i veckan',
    audience: 'Du ska få ordning på CV och brev',
    body: '79 kr i veckan. Alla mallar, full CV-analys och nedladdning av allt du skriver. Dras varje vecka tills du säger upp.',
    ctaLabel: 'Välj CV-veckan',
    highlights: [
      `Alla ${TEMPLATE_COUNT} CV-mallar`,
      'Full CV-analys, obegränsat antal omkörningar',
      'Ladda ner CV och brev i Word och PDF',
      'Säg upp när du vill',
    ],
  },
  {
    key: 'test_week',
    name: 'Testveckan',
    amount: 79,
    scope: 'tester',
    length: 'vecka',
    mode: 'subscription',
    suffix: 'i veckan',
    audience: 'Du har ett rekryteringstest framför dig',
    body: '79 kr i veckan. Alla testnivåer, provläget och hela din resultathistorik. Dras varje vecka tills du säger upp.',
    ctaLabel: 'Välj Testveckan',
    highlights: [
      'Alla testnivåer, obegränsat antal försök',
      'Provläge med tidsgräns',
      'Resultathistorik och utveckling över tid',
      'Säg upp när du vill',
    ],
  },
  {
    key: 'all_day',
    name: 'Allt-dagen',
    amount: 49,
    scope: 'allt',
    length: 'dag',
    mode: 'payment',
    grantDays: 1,
    suffix: 'engångs',
    audience: 'En ansökan som ska in ikväll',
    body: '24 timmar med allt upplåst. Ett engångsköp, inget dras igen.',
    ctaLabel: 'Köp Allt-dagen',
    highlights: [
      'Allt i CV-spåret och testspåret',
      'Gäller i 24 timmar',
      'Ingen prenumeration',
      'Inget dras automatiskt',
    ],
  },
  {
    key: 'all_week',
    name: 'Allt-veckan',
    amount: 99,
    scope: 'allt',
    length: 'vecka',
    mode: 'subscription',
    suffix: 'i veckan',
    audience: 'Du söker brett och vill ha allt',
    badge: 'Mest vald',
    body: '99 kr i veckan. Båda spåren, jobbmatchningen och obegränsad chatt med jobbcoachen. Dras varje vecka tills du säger upp.',
    ctaLabel: 'Välj Allt-veckan',
    highlights: [
      'Allt i CV-veckan och Testveckan',
      'Obegränsad jobbmatchning',
      'Obegränsad chatt med jobbcoachen',
      'Säg upp när du vill',
    ],
  },
  {
    key: 'all_month',
    name: 'Allt-månaden',
    amount: 149,
    scope: 'allt',
    length: 'månad',
    mode: 'subscription',
    suffix: 'i månaden',
    audience: 'Ett sök som pågår några månader',
    body: '149 kr i månaden, alltså billigare än fyra veckor. Allt ingår. Dras varje månad tills du säger upp.',
    ctaLabel: 'Välj Allt-månaden',
    highlights: [
      'Allt i Allt-veckan',
      'Billigare än fyra veckor i rad',
      'Dras en gång i månaden',
      'Säg upp när du vill',
    ],
  },
  {
    key: 'all_quarter',
    name: 'Allt-kvartalet',
    amount: 299,
    scope: 'allt',
    length: 'kvartal',
    mode: 'subscription',
    suffix: 'för 3 månader',
    audience: 'Ett längre sök eller ett byte av bransch',
    perMonth: '100 kr per månad',
    badge: 'Bäst värde',
    body: '299 kr för tre månader. Allt ingår, och du betalar drygt hundra kronor i månaden.',
    ctaLabel: 'Välj Allt-kvartalet',
    highlights: [
      'Allt i Allt-månaden',
      'Drygt 100 kr per månad i stället för 149',
      'Förnyas var tredje månad',
      'Säg upp när du vill',
    ],
  },
] as const

export const PLAN_BY_KEY: Record<PlanKey, Plan> = Object.fromEntries(
  PLANS.map((p) => [p.key, p])
) as Record<PlanKey, Plan>

const PLAN_KEYS: readonly string[] = PLANS.map((p) => p.key)

export function isPlanKey(value: unknown): value is PlanKey {
  return typeof value === 'string' && PLAN_KEYS.includes(value)
}

/** De fyra prenumerationspaketen, i den ordning kassan visar längderna. */
export const SUBSCRIPTION_PLAN_KEYS: readonly PlanKey[] = PLANS.filter(
  (p) => p.mode === 'subscription'
).map((p) => p.key)
