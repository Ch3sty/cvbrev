/**
 * Prissidans strängar, D-serien och P-serien
 * (docs/plan-paket-och-onboarding.md, Fas 2B avsnitt 2 och 3, Fas 2E).
 *
 * En fil, delad mellan publika prissidan och den inloggade vyn. Skälet är
 * detsamma som för paketkortet: två kopior av samma rad glider isär, och då
 * säger kassan en sak och kortet en annan.
 *
 * Alla belopp läses ur PLANS, aldrig som fasta tal i en sträng (Fas 2E,
 * öppen punkt 4). Detsamma gäller besparingarna i D47.
 *
 * Klientsäker: ren data och rena funktioner, ingen env och ingen Supabase.
 */

import { PLAN_BY_KEY, type PlanKey, type PlanLength } from '@/lib/plans/plans'
import { TEMPLATE_COUNT } from '@/lib/cv/simple-templates'
import type { Feature } from '@/lib/access/features'

/* ------------------------------------------------------------------ paket */

/** Raden under paketnamnet. P1A, P2A, P3A, P4B, P7A, P8A. */
export const PAKET_RAD: Record<PlanKey, string> = {
  cv_week: 'Hela ansökan klar: CV, analys, mallar och brevet.',
  test_week: 'Alla nivåer, alla testtyper, förklaring till varje fråga.',
  all_day: 'Allt i ett dygn. Ett engångsköp, ingenting dras igen.',
  all_week: 'Båda spåren plus jobbmatchning, jobbcoachen och Bli upptäckt.',
  all_month: 'För dig som vet att söket tar mer än en vecka.',
  all_quarter: 'Tre månader, för ett sök som du vet tar tid.',
}

/** Tre punkter per paket. P1a till P8c. */
export const PAKET_PUNKTER: Record<PlanKey, readonly string[]> = {
  cv_week: [
    `Alla ${TEMPLATE_COUNT} CV-mallar`,
    'Full CV-analys, alla fynd och poängen',
    'Personligt brev, skrivet och nedladdat',
  ],
  test_week: [
    'Alla 19 tester, grundnivå till expert',
    'Tidsatt provläge med automatisk inlämning',
    'Förklaring per fråga och din utveckling',
  ],
  all_day: [
    'Allt i Allt-veckan, i 24 timmar',
    'Engångsköp, ingen prenumeration',
    'Dygnet räknas från köpet',
  ],
  all_week: [
    'Allt i CV-veckan och Testveckan',
    'Alla 25 jobbträffar med skälen utskrivna',
    'Jobbcoachen utan tak och Bli upptäckt',
  ],
  all_month: [
    'Allt i Allt-veckan, i trettio dagar',
    'Billigare än fyra veckor i rad',
    'Säg upp när som helst, ett klick',
  ],
  all_quarter: [
    'Allt i Allt-veckan, i tre månader',
    'Billigare än tretton veckor i rad',
    'Säg upp när som helst, ett klick',
  ],
}

/** P5 och P6: vad spårpaketet inte ger. Lagkrav, avsnitt 8. */
export const PAKET_INGAR_INTE: Partial<Record<PlanKey, string>> = {
  cv_week: 'Testerna över grundnivå ingår inte.',
  test_week: 'CV-mallar och brev ingår inte.',
}

/** D13 och D15: intervallraden under beloppet. Dagen förnyas inte. */
export const INTERVALL_RAD: Record<PlanKey, string> = {
  cv_week: 'i veckan, förnyas var sjunde dag',
  test_week: 'i veckan, förnyas var sjunde dag',
  all_day: 'i 24 timmar, förnyas inte',
  all_week: 'i veckan, förnyas var sjunde dag',
  all_month: 'i månaden, förnyas var trettionde dag',
  all_quarter: 'i kvartalet, förnyas var tredje månad',
}

/** D14 och D16: knapptexten. Samma verb som i betalväggarna. */
export function knappText(plan: PlanKey): string {
  return `Ta ${PLAN_BY_KEY[plan].name}`
}

/** Allt-kortets fyra längder, i den ordning Segmentet visar dem. */
export const ALLT_LANGDER: readonly { length: PlanLength; plan: PlanKey; label: string }[] = [
  { length: 'dag', plan: 'all_day', label: 'Dag' },
  { length: 'vecka', plan: 'all_week', label: 'Vecka' },
  { length: 'månad', plan: 'all_month', label: 'Månad' },
  { length: 'kvartal', plan: 'all_quarter', label: 'Kvartal' },
] as const

/* --------------------------------------------------------- publika sidan */

/** PR1A, slutgiltig enligt Fas 2E avsnitt 0. */
export const PR_H1 = 'Välj spåret du söker på. Börja med en vecka.'

/** PR2A, justerad med samma ord som H1. */
export const PR_INGRESS =
  'De flesta söker jobb intensivt i några veckor. Vissa sitter med CV, mallar och brev. Andra har fått en kallelse till ett urvalstest. Välj ditt spår, börja med en vecka, säg upp när du är klar.'

export const PR_SEKTIONER = {
  /** PR3B */
  paket: 'Välj ditt paket',
  /** PR4A */
  gratis: 'Vad du kan göra utan att betala',
  /** PR5A */
  jamforelse: 'Vad som ingår i vilket paket',
  /** PR6A */
  faq: 'Frågor vi får om veckorna',
} as const

/** PR7A, uppsägningsraden under korten. */
export const PR_UPPSAGNING =
  'Säg upp när som helst i ditt konto. Veckan du betalat för gäller ut.'

/** PR8, ingressen över jämförelsetabellen. */
export const PR_JAMFORELSE_INGRESS =
  'Spårpaketen ger allt i sitt spår. Allt ger båda, plus jobbmatchning, jobbcoachen och Bli upptäckt.'

/** D17, gratisnivåns länk. */
export const D_GRATIS_LANK = 'Skapa konto gratis'

/** D18 till D20, förtroenderaden. */
export const FORTROENDE_RADER = [
  { key: 'uppsagning', text: 'Säg upp när som helst, ett klick' },
  { key: 'stripe', text: 'Kortbetalning via Stripe' },
  { key: 'moms', text: 'Priser i kronor, moms ingår' },
] as const

/** D12a till D12c, spårväljarens tre lägen. */
export const SPAR_LAGEN = [
  { value: 'cv', label: 'CV', plan: 'cv_week' as PlanKey },
  { value: 'tester', label: 'Tester', plan: 'test_week' as PlanKey },
  { value: 'allt', label: 'Allt', plan: 'all_week' as PlanKey },
] as const

export type SparVal = (typeof SPAR_LAGEN)[number]['value']

/* ------------------------------------------------------- inloggade sidan */

export const D_PRENUMERATION = {
  /** D21 */
  ingress: 'Vad du har i dag, och vad som öppnar resten.',
  /** D22 */
  statusGratis: 'Du är på gratisnivån',
  /** D23 och D35 */
  stoppRubrik: 'Det här har tagit stopp',
  /** D30 */
  seAllaPaket: 'Se alla paket',
  /** D31 */
  allaPaket: 'Alla paket',
  /** D32 */
  gratisRubrik: 'Vad gratisnivån ger',
  /** D34 */
  ingarRubrik: 'Det här ingår',
  /** D37 */
  bytTillAllt: 'Byt till Allt-veckan',
  /** D39 */
  hantera: 'Hantera',
  /** D40 till D42 */
  bytKort: 'Byt betalkort',
  kvitton: 'Kvitton',
  sagUpp: 'Säg upp',
  /** D44 */
  alltIngar: 'Allt ingår',
  /** D45 */
  bytLangd: 'Byt längd',
  /** D48 */
  byterVidFornyelse: 'Byter vid nästa förnyelse',
  /** Fas 2E öppen punkt 1, dirigentens beslut: dagläget är inaktivt. */
  dagInaktiv: 'Allt-dagen kan inte väljas härifrån',
} as const

/** D24 till D26, en etikett per feature. Substantiv, aldrig en uppmaning. */
export const FEATURE_ETIKETT: Record<Feature, string> = {
  cv_templates_all: 'Fler CV-mallar',
  cv_export: 'Fler CV-nedladdningar',
  cv_analysis_full: 'Hela CV-analysen',
  letter_download: 'Brevnedladdning',
  tests_above_base: 'Testnivå över grundnivån',
  test_exam_mode: 'Tidsatt provläge',
  test_history: 'Din testhistorik',
  chat_unlimited: 'Fler meddelanden i chatten',
  job_matches_all: 'Fler jobbträffar',
  bli_upptackt: 'Bli upptäckt',
}

/** Antalsraden bredvid etiketten. Korrekt svensk förkortning (Fas 2E). */
export function gangerText(antal: number): string {
  return antal === 1 ? '1 gg' : `${antal} ggr`
}

/** D27, förslagspanelens rubrik. */
export function forslagRubrik(plan: PlanKey): string {
  return `Vi föreslår ${PLAN_BY_KEY[plan].name}`
}

/** D29, förslagspanelens knapp. Samma text som på prissidan. */
export function forslagKnapp(plan: PlanKey): string {
  return knappText(plan)
}

/** Talet i D28 variant 1. Ett skrivs ut, över nio med siffra. */
function antalOrd(antal: number): string {
  const ord = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio']
  return antal <= 9 ? ord[antal] : String(antal)
}

/**
 * D28, förslagets skäl. Fyra varianter enligt förslagslogiken i Fas 2D.
 *
 * Talet kommer ur samma räkning som blockeringslistan (dirigentens beslut:
 * D28 och listan räknas ur samma källa), annars säger panelen en sak och
 * listan en annan.
 */
export function forslagSkal(input: {
  plan: PlanKey
  /** Summan av blockeringslistan. Noll betyder inga blockeringar. */
  antal: number
  /** Sant när blockeringarna spänner båda spåren. */
  badaSparen: boolean
  /** Spåret ur onboarding_track, när det finns. */
  track: 'cv' | 'tester' | 'allt' | null
}): string {
  const { plan, antal, badaSparen, track } = input

  if (antal > 0 && badaSparen) {
    return 'Du har stoppats både på CV-sidan och i testerna. Allt-veckan öppnar båda, så du slipper välja.'
  }

  if (antal > 0) {
    const var_ = plan === 'test_week' ? 'i testerna' : 'på CV-sidan'
    const gang = antal === 1 ? 'en gång' : `${antalOrd(antal)} gånger`
    return `Du har slagit i taket ${var_} ${gang} den här veckan. ${PLAN_BY_KEY[plan].name} öppnar allt du stoppades av.`
  }

  if (track === 'cv') {
    return 'Du sa att du vill jobba med ditt CV. CV-veckan ger mallarna, hela analysen och brevet.'
  }

  if (track === 'tester') {
    return 'Du sa att du vill träna på testerna. Testveckan ger alla nivåer, provläget och förklaringarna.'
  }

  return 'Vi vet inte vad du behöver än, så vi visar det som rymmer allt. Välj ett spår i stället om du vet.'
}

/** D38, uppgraderingspanelens text. Skrivs ur användarens blockeringar. */
export function uppgraderingSkal(antal: number): string {
  if (antal <= 0) {
    return 'Allt-veckan lägger testerna ovanpå det du redan har: alla nivåer, tidsatt provläge och förklaringarna.'
  }
  const gang = antal === 1 ? 'en gång' : `${antalOrd(antal)} gånger`
  return `Du har stoppats av testnivåerna ${gang}. Allt-veckan öppnar dem, och du behåller allt du har i dag.`
}

/** T81 och T82, mellanskillnaden. Räknas ur PLANS, aldrig som fast tal. */
export function mellanskillnad(fran: PlanKey, till: PlanKey = 'all_week'): number {
  return Math.max(0, PLAN_BY_KEY[till].amount - PLAN_BY_KEY[fran].amount)
}

/** D46, prisraden i längdvalet. Fyra varianter. */
export function langdPrisRad(plan: PlanKey): string {
  const p = PLAN_BY_KEY[plan]
  switch (p.length) {
    case 'dag':
      return `${p.amount} kr för ett dygn`
    case 'vecka':
      return `${p.amount} kr i veckan`
    case 'månad':
      return `${p.amount} kr i månaden`
    case 'kvartal':
      return `${p.amount} kr i kvartalet`
  }
}

/**
 * D47, besparingsraden. Visas bara när den är sann, och talet räknas.
 *
 * Månaden mot fyra veckor, kvartalet mot tretton. Går priserna isär följer
 * raden med i stället för att ljuga.
 */
export function besparing(plan: PlanKey): string | null {
  const vecka = PLAN_BY_KEY.all_week.amount
  if (plan === 'all_month') {
    const diff = vecka * 4 - PLAN_BY_KEY.all_month.amount
    return diff > 0 ? `Sparar ${diff} kr mot fyra veckor i rad` : null
  }
  if (plan === 'all_quarter') {
    const diff = vecka * 13 - PLAN_BY_KEY.all_quarter.amount
    return diff > 0 ? `Sparar ${diff} kr mot tretton veckor i rad` : null
  }
  return null
}

/** D49, knappen i längdvalet. Namnger målet. */
export function bytLangdKnapp(plan: PlanKey): string {
  return `Byt till ${PLAN_BY_KEY[plan].name}`
}

/** D33 och D43, statusraden. Dagen bär klockslag, resten datum. */
export function statusRadText(plan: PlanKey, slut: Date | null): string {
  const namn = PLAN_BY_KEY[plan].name
  if (!slut) return namn

  if (PLAN_BY_KEY[plan].length === 'dag') {
    const tid = slut.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
    return `${namn}, gäller till ${tid} i dag`
  }

  const datum = slut.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })
  return `${namn}, förnyas ${datum}`
}
