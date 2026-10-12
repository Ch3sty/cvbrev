/**
 * Paketen (docs/plan-paket-och-onboarding.md, ägarens beslut 2026-09-22,
 * namnen ur docs/rapporter/beslut-paketnamn-2026-09-24.md och ägarens
 * beslut 2026-10-11 i spec-rummen avsnitt 17.3 och 17.4).
 *
 * Sex nycklar, men bara en säljs: Jobbcoach Premium, 149 kr i månaden
 * (all_month). CV-paketet, Träningspaketet, Dagspasset och Premium per vecka
 * och kvartal har saljs: false. De står kvar så att webhooken, kvitton,
 * admin och befintliga prenumeranter känner igen dem tills de löpt ut.
 * Perioden är aldrig en del av namnet, den står alltid bredvid
 * ("Jobbcoach Premium, 149 kr i månaden").
 *
 * Skrivregeln (docs/design/copy-premium-2026-10-11.md): fulla namnet
 * "Jobbcoach Premium" där pengar byter ägare och en gång per yta, kortformen
 * "Premium" (paketKort()) i knappar, låsta rader och brickor.
 *
 * Den här filen är enda källan till namnen. All annan kod läser dem via
 * paketNamn(), paketKort(), paketNamnForScope() och prisPeriod() nedan,
 * aldrig som fasta strängar. Testet i
 * src/lib/plans/__tests__/paketnamn.test.ts faller om de gamla namnen dyker
 * upp igen.
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
   * Säljs paketet i dag? Bara all_month (spec-rummen 17.3). Ett osålt paket
   * finns kvar för befintliga prenumeranter men visas aldrig som ett val,
   * och create-plan-session avvisar det med 400.
   */
  saljs: boolean
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
const HELA_PAKETET = 'Jobbcoach Premium'
const DAGSPASSET = 'Dagspasset'

/**
 * Kortformen (copy-premium avsnitt 1): knappar, låsta rader, brickor och
 * brödtext efter att fulla namnet stått en gång på ytan.
 */
const PREMIUM_KORT = 'Premium'

/**
 * Det som ingår i Premium, i den ordning prissidan och betalväggen visar det.
 * Rekryteringstesterna står först (spec-publikt-v2 del A 5.1, ägarens krav
 * 2026-10-12: testerna först där verktyg räknas upp). Startsidans och
 * prissidans Premiumblock läser listan härifrån.
 */
export const HELA_PAKETET_RADER = [
  'Alla rekryteringstester, övningsprov och det fördjupade personlighetstestet',
  'Alla CV-mallar, CV-analysen, personliga brev och LinkedIn',
  'Jobbmatchning varje natt, alla träffar med skälen',
  'Jobbcoachen, fråga så mycket du vill',
  'Bli upptäckt av rekryterare, anonymt',
] as const

export const PLANS: readonly Plan[] = [
  {
    key: 'cv_week',
    saljs: false,
    name: CV_PAKETET,
    beskrivning: 'CV-mallar, CV-analys, personliga brev som PDF, LinkedIn',
    amount: 79,
    scope: 'cv',
    length: 'vecka',
    mode: 'subscription',
    suffix: 'i veckan',
    audience: 'Du ska få ordning på CV och personliga brev',
    body: '79 kr i veckan. Alla mallar, full CV-analys och nedladdning av allt du skriver. Dras varje vecka tills du säger upp.',
    ctaLabel: `Köp ${CV_PAKETET}, 79 kr i veckan`,
    highlights: [
      `Alla ${TEMPLATE_COUNT} CV-mallar`,
      'Full CV-analys, obegränsat antal omkörningar',
      'Ladda ner CV och personliga brev i Word och PDF',
      'Säg upp när du vill',
    ],
  },
  {
    key: 'test_week',
    saljs: false,
    name: TRANINGSPAKETET,
    beskrivning: 'Alla rekryteringstester, personlighetstestet, intervjuprovet',
    amount: 79,
    scope: 'tester',
    length: 'vecka',
    mode: 'subscription',
    suffix: 'i veckan',
    audience: 'Du har ett rekryteringstest framför dig',
    body: '79 kr i veckan. Alla testnivåer, övningsprov, det fördjupade personlighetstestet och hela din resultathistorik. Dras varje vecka tills du säger upp.',
    ctaLabel: `Köp ${TRANINGSPAKETET}, 79 kr i veckan`,
    highlights: [
      'Alla testnivåer, obegränsat antal försök',
      'Övningsprov med tidsgräns',
      'Fördjupade personlighetstestet, 120 påståenden (grundtestet är gratis)',
      'Resultathistorik och utveckling över tid',
      'Intervjuprovet: öva svar utan begränsning',
      'Säg upp när du vill',
    ],
  },
  {
    key: 'all_day',
    saljs: false,
    name: DAGSPASSET,
    beskrivning: `${HELA_PAKETET} i 24 timmar. Engångsköp, förnyas inte.`,
    amount: 49,
    scope: 'allt',
    length: 'dag',
    mode: 'payment',
    grantDays: 1,
    suffix: 'engångs',
    audience: 'En ansökan som ska in ikväll',
    body: `24 timmar med ${HELA_PAKETET}. Ett engångsköp, inget dras igen.`,
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
    saljs: false,
    name: HELA_PAKETET,
    beskrivning: 'CV, personliga brev, tester, jobbmatchning och Jobbcoachen',
    amount: 99,
    scope: 'allt',
    length: 'vecka',
    mode: 'subscription',
    suffix: 'i veckan',
    audience: 'Du söker brett och vill ha allt',
    body: '99 kr i veckan. Allt ingår. Dras varje vecka tills du säger upp.',
    ctaLabel: `Köp ${PREMIUM_KORT}, 99 kr i veckan`,
    highlights: [...HELA_PAKETET_RADER, 'Säg upp när du vill'],
  },
  {
    key: 'all_month',
    saljs: true,
    name: HELA_PAKETET,
    beskrivning: 'CV, personliga brev, tester, jobbmatchning och Jobbcoachen',
    amount: 149,
    scope: 'allt',
    length: 'månad',
    mode: 'subscription',
    suffix: 'i månaden',
    audience: 'Allt du behöver i jobbsöket, en månad i taget',
    body: '149 kr i månaden. Allt ingår. Dras varje månad tills du säger upp.',
    ctaLabel: `Köp ${PREMIUM_KORT}, 149 kr i månaden`,
    highlights: [...HELA_PAKETET_RADER, 'Säg upp när du vill'],
  },
  {
    key: 'all_quarter',
    saljs: false,
    name: HELA_PAKETET,
    beskrivning: 'CV, personliga brev, tester, jobbmatchning och Jobbcoachen',
    amount: 299,
    scope: 'allt',
    length: 'kvartal',
    mode: 'subscription',
    suffix: 'för 3 månader',
    audience: 'Ett längre sök eller ett byte av bransch',
    body: '299 kr för tre månader. Allt ingår. Dras var tredje månad tills du säger upp.',
    ctaLabel: `Köp ${PREMIUM_KORT}, 299 kr per kvartal`,
    highlights: [...HELA_PAKETET_RADER, 'Säg upp när du vill'],
  },
] as const

export const PLAN_BY_KEY: Record<PlanKey, Plan> = Object.fromEntries(
  PLANS.map((p) => [p.key, p])
) as Record<PlanKey, Plan>

const PLAN_KEYS: readonly string[] = PLANS.map((p) => p.key)

export function isPlanKey(value: unknown): value is PlanKey {
  return typeof value === 'string' && PLAN_KEYS.includes(value)
}

/**
 * Alla prenumerationspaket, sålda och osålda, i den ordning kassan visade
 * längderna. Webhooken och Stripes prislista behöver alla; gränssnittet
 * läser SALJBARA_PLANER.
 */
export const SUBSCRIPTION_PLAN_KEYS: readonly PlanKey[] = PLANS.filter(
  (p) => p.mode === 'subscription'
).map((p) => p.key)

/** Paketet som säljs (spec-rummen 17.3). Varje köpknapp leder hit. */
export const SALD_PLAN: PlanKey = 'all_month'

/** De paket som säljs i dag: en rad, all_month. */
export const SALJBARA_PLANER: readonly Plan[] = PLANS.filter((p) => p.saljs)

/** Säljs paketet? Falskt för okända nycklar. */
export function saljs(plan: unknown): plan is PlanKey {
  return isPlanKey(plan) && PLAN_BY_KEY[plan].saljs
}

/**
 * Ett säljbart paket ur vad som helst: nyckeln om den säljs, annars
 * SALD_PLAN. För köpknappar och köpsteget, så att en gammal länk med
 * ?paket=cv_week landar på Premium och aldrig på ett osålt paket.
 */
export function saljbarPlan(plan: unknown): PlanKey {
  return saljs(plan) ? plan : SALD_PLAN
}

/* ------------------------------------------------------------ namnen */

/** Paketets fulla namn: "Jobbcoach Premium", eller ett osålt pakets ("CV-paketet"). */
export function paketNamn(plan: PlanKey): string {
  return PLAN_BY_KEY[plan].name
}

/** Kortformen "Premium" (copy-premium avsnitt 1). Hårdkoda aldrig ordet. */
export function paketKort(): string {
  return PREMIUM_KORT
}

/**
 * Namnet för en behörighet (profiles.premium_scope). Scope allt är
 * Jobbcoach Premium; Dagspasset går inte att skilja ut ur scopet och heter
 * här därför Jobbcoach Premium, vilket är vad det ger.
 */
export function paketNamnForScope(scope: PlanScope): string {
  if (scope === 'cv') return PLAN_BY_KEY.cv_week.name
  if (scope === 'tester') return PLAN_BY_KEY.test_week.name
  return PLAN_BY_KEY.all_month.name
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

/** Namnet med pris och period: "Jobbcoach Premium, 149 kr i månaden". */
export function paketMedPris(plan: PlanKey): string {
  return `${paketNamn(plan)}, ${prisPeriod(plan)}`
}

/**
 * Köpknappen (copy-premium avsnitt 8): "Köp Premium, 149 kr i månaden".
 * Kortformen, aldrig fulla namnet, så att knappen ryms på 360 px.
 */
export function kopKnapp(plan: PlanKey = SALD_PLAN): string {
  return `Köp ${PREMIUM_KORT}, ${prisPeriod(plan)}`
}

/**
 * Namnet med längd, där längden behövs (admin, kvitton): "Jobbcoach
 * Premium, en månad", och för befintliga veckokunder "Jobbcoach Premium,
 * en vecka". Veckopaketen och Dagspasset står ensamma, de finns bara i en
 * längd.
 */
export function paketMedLangd(plan: PlanKey): string {
  const p = PLAN_BY_KEY[plan]
  if (p.scope === 'allt' && p.mode === 'subscription') return `${p.name}, ${langdOrd(plan)}`
  return p.name
}

/* ------------------------------------------------- de gamla namnen */

/**
 * Namnen före 2026-09-24, och "Hela paketet" före 2026-10-11. De finns kvar
 * i data som skrevs innan bytet: mejlmetadata (planName), Stripe-kvitton och
 * gamla händelser. Enda stället i src utanför migreringar och tester där de
 * får stå, så att en ny läsare alltid får det nya namnet.
 */
const GAMLA_NAMN: Record<string, PlanKey> = {
  'Hela paketet': 'all_month',
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
