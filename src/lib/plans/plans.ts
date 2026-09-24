/**
 * Paketen (docs/plan-paket-och-onboarding.md, ägarens beslut 2026-09-22,
 * och namnen ur docs/rapporter/beslut-paketnamn-2026-09-24.md).
 *
 * Sex nycklar, tre paket för besökaren och ett engångspass: CV-paketet,
 * Träningspaketet och Hela paketet, plus Dagspasset. CV-paketet och
 * Träningspaketet finns bara som vecka. Hela paketet är ett namn med tre
 * längder, och Dagspasset är det enda engångsköpet. Perioden är aldrig en
 * del av namnet, den står alltid bredvid ("CV-paketet, 79 kr i veckan").
 *
 * Den här filen är enda källan till namnen. All annan kod läser dem via
 * paketNamn(), paketNamnForScope() och prisPeriod() nedan, aldrig som fasta
 * strängar. Testet i src/lib/plans/__tests__/paketnamn.test.ts faller om de
 * gamla namnen dyker upp igen.
 *
 * Klientsäker: inga env-variabler här. Server-mappning till Stripe-priser
 * ligger i src/lib/stripe/planPrices.ts.
 */

import { TEMPLATE_COUNT } from '@/lib/cv/template-antal'

export type PlanKey = 'cv_week' | 'test_week' | 'all_day' | 'all_week' | 'all_month' | 'all_quarter'

/** Vad paketet låser upp. Speglar profiles.premium_scope. */
export type PlanScope = 'cv' | 'tester' | 'allt'

/** Hur länge paketet gäller. Styr texten i kassan, inte behörigheten. */
export type PlanLength = 'dag' | 'vecka' | 'månad' | 'kvartal'

/** Stripe-läget. Dagspasset är engångs, resten löpande. */
export type PlanMode = 'payment' | 'subscription'

export interface Plan {
  key: PlanKey
  /**
   * Namnet i bestämd form, samma i Stripe, kvitton och mejl (beslut 6).
   * Hela paketets tre längder delar namn; längden står alltid bredvid.
   */
  name: string
  /** Förklaringsraden under namnet första gången det syns (R2), högst 60 tecken. */
  beskrivning: string
  /** Pris i kronor, inklusive moms, som det visas i kassan. */
  amount: number
  scope: PlanScope
  length: PlanLength
  mode: PlanMode
  /** Antal dagar för engångsköp. Bara Dagspasset har det. */
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

/** Namnen. Enda stället de står som fasta strängar. */
const CV_PAKETET = 'CV-paketet'
const TRANINGSPAKETET = 'Träningspaketet'
const HELA_PAKETET = 'Hela paketet'
const DAGSPASSET = 'Dagspasset'

/** Hela paketets egna rader först, hänvisningen till de andra två sist (R3). */
const HELA_PAKETET_RADER = [
  'Jobbmatchning varje natt, alla träffar med skälen',
  'Jobbcoachen, fråga så mycket du vill',
  'Bli upptäckt av rekryterare, anonymt',
  `Allt i ${CV_PAKETET} och ${TRANINGSPAKETET}, även fördjupade personlighetstestet`,
] as const

export const PLANS: readonly Plan[] = [
  {
    key: 'cv_week',
    name: CV_PAKETET,
    beskrivning: 'CV-mallar, CV-analys, personliga brev som PDF, LinkedIn',
    amount: 79,
    scope: 'cv',
    length: 'vecka',
    mode: 'subscription',
    suffix: 'i veckan',
    audience: 'Du ska få ordning på CV och personliga brev',
    body: '79 kr i veckan. Alla mallar, full CV-analys och nedladdning av allt du skriver. Dras varje vecka tills du säger upp.',
    ctaLabel: `Välj ${CV_PAKETET}, 79 kr i veckan`,
    highlights: [
      `Alla ${TEMPLATE_COUNT} CV-mallar`,
      'Full CV-analys, obegränsat antal omkörningar',
      'Ladda ner CV och personliga brev i Word och PDF',
      'Säg upp när du vill',
    ],
  },
  {
    key: 'test_week',
    name: TRANINGSPAKETET,
    beskrivning: 'Alla rekryteringstester, personlighetstestet, intervjuprovet',
    amount: 79,
    scope: 'tester',
    length: 'vecka',
    mode: 'subscription',
    suffix: 'i veckan',
    audience: 'Du har ett rekryteringstest framför dig',
    body: '79 kr i veckan. Alla testnivåer, provläget, det fördjupade personlighetstestet och hela din resultathistorik. Dras varje vecka tills du säger upp.',
    ctaLabel: `Välj ${TRANINGSPAKETET}, 79 kr i veckan`,
    highlights: [
      'Alla testnivåer, obegränsat antal försök',
      'Provläge med tidsgräns',
      'Fördjupade personlighetstestet, 120 påståenden (grundtestet är gratis)',
      'Resultathistorik och utveckling över tid',
      'Intervjuprovet: öva svar utan begränsning',
      'Säg upp när du vill',
    ],
  },
  {
    key: 'all_day',
    name: DAGSPASSET,
    beskrivning: 'Hela paketet i 24 timmar. Engångsköp, förnyas inte.',
    amount: 49,
    scope: 'allt',
    length: 'dag',
    mode: 'payment',
    grantDays: 1,
    suffix: 'engångs',
    audience: 'En ansökan som ska in ikväll',
    body: '24 timmar med Hela paketet. Ett engångsköp, inget dras igen.',
    ctaLabel: `Köp ${DAGSPASSET}, 49 kr`,
    highlights: [
      `Allt i ${HELA_PAKETET}`,
      'Gäller i 24 timmar',
      'Ingen prenumeration',
      'Inget dras automatiskt',
    ],
  },
  {
    key: 'all_week',
    name: HELA_PAKETET,
    beskrivning: 'Allt ingår: CV, tester, matchning, Jobbcoachen, Bli upptäckt',
    amount: 99,
    scope: 'allt',
    length: 'vecka',
    mode: 'subscription',
    suffix: 'i veckan',
    audience: 'Du söker brett och vill ha allt',
    badge: 'Mest vald',
    body: '99 kr i veckan. Jobbmatchningen, Jobbcoachen, Bli upptäckt och allt i de andra två paketen. Dras varje vecka tills du säger upp.',
    ctaLabel: `Välj ${HELA_PAKETET}, 99 kr i veckan`,
    highlights: [...HELA_PAKETET_RADER, 'Säg upp när du vill'],
  },
  {
    key: 'all_month',
    name: HELA_PAKETET,
    beskrivning: 'Allt ingår: CV, tester, matchning, Jobbcoachen, Bli upptäckt',
    amount: 149,
    scope: 'allt',
    length: 'månad',
    mode: 'subscription',
    suffix: 'i månaden',
    audience: 'Ett sök som pågår några månader',
    body: '149 kr i månaden, alltså billigare än fyra veckor. Allt ingår. Dras varje månad tills du säger upp.',
    ctaLabel: `Välj ${HELA_PAKETET}, 149 kr i månaden`,
    highlights: [...HELA_PAKETET_RADER, 'Billigare än fyra veckor i rad', 'Säg upp när du vill'],
  },
  {
    key: 'all_quarter',
    name: HELA_PAKETET,
    beskrivning: 'Allt ingår: CV, tester, matchning, Jobbcoachen, Bli upptäckt',
    amount: 299,
    scope: 'allt',
    length: 'kvartal',
    mode: 'subscription',
    suffix: 'för 3 månader',
    audience: 'Ett längre sök eller ett byte av bransch',
    perMonth: '100 kr per månad',
    badge: 'Bäst värde',
    body: '299 kr för tre månader. Allt ingår, och du betalar drygt hundra kronor i månaden.',
    ctaLabel: `Välj ${HELA_PAKETET}, 299 kr per kvartal`,
    highlights: [...HELA_PAKETET_RADER, 'Drygt 100 kr per månad i stället för 149', 'Säg upp när du vill'],
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

/* ------------------------------------------------------------ namnen */

/** Paketets namn: "CV-paketet", "Träningspaketet", "Hela paketet", "Dagspasset". */
export function paketNamn(plan: PlanKey): string {
  return PLAN_BY_KEY[plan].name
}

/**
 * Namnet för en behörighet (profiles.premium_scope). Scope allt är Hela
 * paketet; Dagspasset går inte att skilja ut ur scopet och heter här
 * därför Hela paketet, vilket är vad det ger.
 */
export function paketNamnForScope(scope: PlanScope): string {
  if (scope === 'cv') return PLAN_BY_KEY.cv_week.name
  if (scope === 'tester') return PLAN_BY_KEY.test_week.name
  return PLAN_BY_KEY.all_week.name
}

/** Längden i ord, för kvitton och admin: "en vecka", "en månad". */
export function langdOrd(plan: PlanKey): string {
  switch (PLAN_BY_KEY[plan].length) {
    case 'dag':
      return 'en dag'
    case 'vecka':
      return 'en vecka'
    case 'månad':
      return 'en månad'
    case 'kvartal':
      return 'ett kvartal'
  }
}

/** Pris och period som följeord (R1): "79 kr i veckan", "49 kr, ett dygn". */
export function prisPeriod(plan: PlanKey): string {
  const p = PLAN_BY_KEY[plan]
  switch (p.length) {
    case 'dag':
      return `${p.amount} kr, ett dygn`
    case 'vecka':
      return `${p.amount} kr i veckan`
    case 'månad':
      return `${p.amount} kr i månaden`
    case 'kvartal':
      return `${p.amount} kr per kvartal`
  }
}

/** Kalendermånader i en period. Veckan och dygnet räknas i dagar. */
const MANADER: Partial<Record<PlanLength, number>> = { 'månad': 1, 'kvartal': 3 }
const DAGAR: Partial<Record<PlanLength, number>> = { dag: 1, vecka: 7 }

/**
 * Nästa dragning räknat från en dragning, som Stripe räknar den: veckan sju
 * dagar senare, månaden samma datum nästa kalendermånad och kvartalet samma
 * datum tre månader senare. Finns inte datumet i målmånaden (31 till en
 * månad med 30 dagar) blir det månadens sista dag. Räknas i UTC, som Stripes
 * billing_cycle_anchor.
 *
 * Används där prenumerationen inte finns än (köpsteget). När den finns är
 * current_period_end från Stripe facit.
 */
export function nastaDragningEfter(plan: PlanKey, fran: Date): Date {
  const langd = PLAN_BY_KEY[plan].length
  const dagar = DAGAR[langd]
  if (dagar) return new Date(fran.getTime() + dagar * 86_400_000)
  return laggTillManader(fran, MANADER[langd] ?? 1)
}

/** Föregående dragning, för när bara periodens slut är känt. Samma regel baklänges. */
export function foregaendeDragning(plan: PlanKey, slut: Date): Date {
  const langd = PLAN_BY_KEY[plan].length
  const dagar = DAGAR[langd]
  if (dagar) return new Date(slut.getTime() - dagar * 86_400_000)
  return laggTillManader(slut, -(MANADER[langd] ?? 1))
}

function laggTillManader(d: Date, antal: number): Date {
  const ar = d.getUTCFullYear()
  const man = d.getUTCMonth() + antal
  const sistaDag = new Date(Date.UTC(ar, man + 1, 0)).getUTCDate()
  const ut = new Date(d.getTime())
  ut.setUTCDate(1)
  ut.setUTCFullYear(ar, man, Math.min(d.getUTCDate(), sistaDag))
  return ut
}

/** Namnet med pris och period: "CV-paketet, 79 kr i veckan". */
export function paketMedPris(plan: PlanKey): string {
  return `${paketNamn(plan)}, ${prisPeriod(plan)}`
}

/**
 * Namnet med längd, där längden behövs för att skilja paketen åt (admin,
 * kvitton): "Hela paketet, en månad". Veckopaketen och Dagspasset står
 * ensamma, de finns bara i en längd.
 */
export function paketMedLangd(plan: PlanKey): string {
  const p = PLAN_BY_KEY[plan]
  if (p.scope === 'allt' && p.mode === 'subscription') return `${p.name}, ${langdOrd(plan)}`
  return p.name
}

/* ------------------------------------------------- de gamla namnen */

/**
 * Namnen före 2026-09-24. De finns kvar i data som skrevs innan bytet:
 * mejlmetadata (planName), Stripe-kvitton och gamla händelser. Enda stället
 * i src utanför migreringar och tester där de får stå, så att en ny läsare
 * alltid får det nya namnet.
 */
const GAMLA_NAMN: Record<string, PlanKey> = {
  'CV-veckan': 'cv_week',
  Testveckan: 'test_week',
  'Allt-dagen': 'all_day',
  'Allt-veckan': 'all_week',
  'Allt-månaden': 'all_month',
  'Allt-manaden': 'all_month',
  'Allt-kvartalet': 'all_quarter',
}

/** Paketnyckeln för ett gammalt namn, annars null. */
export function planKeyFranGammaltNamn(namn: string | null | undefined): PlanKey | null {
  if (!namn) return null
  return GAMLA_NAMN[namn.trim()] ?? null
}

/**
 * Namnet ur ett mejls metadata. planKey vinner; annars översätts ett gammalt
 * planName till det nya. Ett schemalagt mejl från före bytet skriver då
 * det nya namnet vid utskick.
 */
export function paketNamnUrMetadata(
  meta: Record<string, unknown> | null | undefined,
  reserv: PlanKey = 'cv_week'
): string {
  const key = meta?.planKey
  if (isPlanKey(key)) return paketMedLangd(key)
  const namn = typeof meta?.planName === 'string' ? meta.planName : null
  const gammal = planKeyFranGammaltNamn(namn)
  if (gammal) return paketMedLangd(gammal)
  return namn || paketNamn(reserv)
}
