/**
 * Priser-data: serversäkra konstanter för /priser
 * (docs/design/spec-prissida-2026-09-22.html, ägarens beslut 2026-10-11 i
 * spec-rummen 17.3: bara Jobbcoach Premium säljs).
 *
 * Priset bor i src/lib/plans/plans.ts och kortets copy i
 * src/components/pricing/paket-copy.ts. Här ligger bara det som är sidans
 * eget: gratisnivån i listform, jämförelsetabellen och frågorna.
 *
 * Tabellen har två kolumner, gratis och Premium, och skriver ord i stället
 * för prickar: "Alla 41", "Utan tak", "Ingår inte". Ändras en gräns i
 * quotaService måste raderna ändras i samma omgång, annars säger sidan en
 * sak och spärren en annan.
 */

import { TEMPLATE_COUNT, FREE_TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { FREE_TIER_JOB_LIMIT, JOB_MATCHES_PER_RUN } from '@/lib/jobmatching/freeLimit'
import { TESTTAL } from '@/components/publikt/testtal'
import { PLAN_BY_KEY, SALD_PLAN, paketKort, paketMedPris, paketNamn, prisPeriod } from '@/lib/plans/plans'

export const PREMIUM_CURRENCY = 'SEK'

const PREMIUM = paketKort()
const PRIS = prisPeriod(SALD_PLAN)
/** "Jobbcoach Premium", ur PLANS. */
const HELA = paketNamn(SALD_PLAN)

// === Gratisnivån ===

/** Gratisnivån i listform, för kontosidan. */
export const FREE_HIGHLIGHTS = [
  `${FREE_TEMPLATE_COUNT} CV-mallar och en nedladdning`,
  'En CV-analys med poängen och det tyngsta fyndet',
  'Ett personligt brev att läsa, sedan ett i veckan',
  'Tre matchade jobb',
  'Tio frågor till Jobbcoachen',
  'En nivåkoll i testerna med genomgång, och ett första träningspass',
] as const

/** Gratisnivån i en mening, för startsidan. */
export const GRATIS_RAD = `${FREE_TEMPLATE_COUNT} mallar, en CV-analys, ett personligt brev och en nivåkoll i testerna ingår utan att betala.`

// === Jämförelsetabellen ===

/** ja: fet ink-1. g: gräns i ink-3. nej: "Ingår inte" i ink-3. */
export type CellTon = 'ja' | 'g' | 'nej'

export interface ComparisonCell {
  text: string
  sub?: string
  ton: CellTon
}

export interface ComparisonRow {
  label: string
  sub?: string
  free: ComparisonCell
  premium: ComparisonCell
}

export interface ComparisonGroup {
  title: string
  rows: ComparisonRow[]
}

const ja = (text: string, sub?: string): ComparisonCell => ({ text, sub, ton: 'ja' })
const g = (text: string, sub?: string): ComparisonCell => ({ text, sub, ton: 'g' })
const NEJ: ComparisonCell = { text: 'Ingår inte', ton: 'nej' }

/** Tabellens kolumnhuvuden och skärmläsarens rubrik. */
export const JAMFORELSE_KOLUMNER = {
  caption: `Vad som ingår gratis och i ${PREMIUM}`,
  funktion: 'Funktion',
  gratis: 'Gratis',
  premium: PREMIUM,
} as const

const TESTER: ComparisonGroup = {
  title: 'Rekryteringstester',
  rows: [
    {
      label: 'Nivåkollen och första passet',
      sub: 'matrislogik, verbalt, numeriskt',
      free: g('En gång, med genomgång'),
      premium: ja('Pass varje dag, utan tak'),
    },
    {
      label: 'Avancerad och expertnivå',
      free: NEJ,
      premium: ja('Ingår'),
    },
    {
      label: 'Övningsprov mot klockan',
      sub: 'samma format och tid som ditt test',
      free: NEJ,
      premium: ja('Ingår'),
    },
    {
      label: 'Personlighetstestet',
      sub: 'profilen, kravprofilerna och frågorna rekryteraren lär ställa',
      free: g('Grundtestet', `${TESTTAL.personlighetGrund.fragor} påståenden`),
      premium: ja('Fördjupade testet', `${TESTTAL.personlighetFordjupad.fragor} påståenden, 30 delfaktorer, din arbetsstil`),
    },
    {
      label: 'Förklaring efter varje fråga',
      free: g('Det du har gjort'),
      premium: ja('Alla nivåer'),
    },
    {
      label: 'Din utveckling',
      sub: 'alla sessioner i en kurva',
      free: g('Senaste sessionen'),
      premium: ja('Hela historiken'),
    },
    {
      label: 'Extrapass och övningsprov',
      sub: 'på det du tappar, och i samma format som ditt test',
      free: NEJ,
      premium: ja('Ingår'),
    },
  ],
}

/** Rekryteringstesterna står först (ägarens krav 2026-10-12). */
export const COMPARISON: ComparisonGroup[] = [
  TESTER,
  {
    title: 'CV och personliga brev',
    rows: [
      {
        label: 'CV-mallar',
        sub: 'som rekryteringssystem läser',
        free: g(`${FREE_TEMPLATE_COUNT} mallar`),
        premium: ja(`Alla ${TEMPLATE_COUNT}`),
      },
      {
        label: 'CV-analys',
        sub: 'poäng, fynd, nyckelord',
        free: g('Poäng och tyngsta fyndet', 'en gång'),
        premium: ja('Hela rapporten', 'kör om utan tak'),
      },
      {
        label: 'CV-nedladdning',
        sub: 'som PDF',
        free: g('1 gång'),
        premium: ja('Utan tak'),
      },
      {
        label: 'Personliga brev',
        sub: 'skrivna på annonsen',
        free: g('1, sedan 1 i veckan', 'läsa, inte ladda ner'),
        premium: ja('Utan tak', 'nedladdning som PDF'),
      },
      {
        label: 'LinkedIn-profilen',
        sub: 'rubrik och sammanfattning',
        free: NEJ,
        premium: ja('Ingår'),
      },
    ],
  },
  {
    title: 'Jobb och coachning',
    rows: [
      {
        label: 'Matchade jobb',
        sub: 'kompetens mot alla branscher',
        free: g(`${FREE_TIER_JOB_LIMIT} träffar`),
        premium: ja(`${JOB_MATCHES_PER_RUN} träffar`, 'med skälen utskrivna'),
      },
      {
        label: 'Jobbcoachen',
        sub: 'lön, intervju, avtal',
        free: g('10 meddelanden'),
        premium: ja('Utan tak'),
      },
      {
        label: 'Bli upptäckt',
        sub: 'rekryterare hittar dig, anonymt',
        free: NEJ,
        premium: ja('Ingår'),
      },
    ],
  },
]

export const JAMFORELSE_RUBRIK = 'Vad som ingår, rad för rad'

// === FAQ ===

/** Rubriken ovanför frågorna (ersätter "Fler frågor om paketen?"). */
export const PRISER_FAQ_RUBRIK = 'Fler frågor om priset?'

export const PRISER_FAQ_ITEMS = [
  {
    id: 'vad-ingar',
    // Fulla namnet: frågan blir FAQPage-schema och visas fristående i
    // Google, där "Premium" utan varumärke är vem som helst (copy-vag5 6.1).
    q: `Vad ingår i ${HELA}?`,
    a: `Allt vi gör: alla CV-mallar, CV-analysen, personliga brev och LinkedIn, alla rekryteringstester med övningsprov och personlighetstestet, jobbmatchning varje natt, Jobbcoachen och Bli upptäckt. ${PRIS}, och inget av det kostar extra.`,
  },
  {
    id: 'nar-manaden-ar-slut',
    q: 'Vad händer när månaden är slut?',
    a: 'Den förnyas på samma datum varje månad tills du säger upp, med samma pris. Dagen innan visar vi vad du gjort och vad som är kvar, och där kan du avsluta med ett klick. Ingen förnyelse i smyg.',
  },
  {
    id: 'borja-gratis',
    q: 'Kan jag börja gratis?',
    a: `Ja. Gratisnivån kräver inget kort och ligger kvar så länge du vill. Där ser du hur CV-analysen, de personliga breven och testernas nivåkoll fungerar, och köper ${PREMIUM} först när du vill ha resten.`,
  },
  {
    id: 'saga-upp',
    q: 'Hur säger jag upp?',
    a: 'I ditt konto, under Profil och Prenumeration, ett klick. Lika enkelt som att köpa. Månaden du redan betalat gäller ut.',
  },
] as const

// === Metadata ===

/**
 * title, description, openGraph, twitter och OG-bilden (copy-premium
 * avsnitt 3). Talen ur PLANS. Title 58 tecken, description 148.
 */
export const PRISER_META = {
  url: 'https://www.jobbcoach.ai/priser',
  title: `Priser: ${paketMedPris(SALD_PLAN)} | Jobbcoach.ai`,
  description: `${HELA} kostar ${PRIS}. CV-analys, personliga brev, rekryteringstester, jobbmatchning och Jobbcoachen ingår. Säg upp när du vill.`,
  keywords:
    'Jobbcoach Premium, jobbcoach pris, cv-analys pris, rekryteringstester pris, personligt brev pris, jobbmatchning',
  ogTitle: paketMedPris(SALD_PLAN),
  ogEyebrow: 'Priser',
  ogSubtitle: `${PLAN_BY_KEY[SALD_PLAN].beskrivning}. Säg upp när du vill.`,
  ogAlt: `Priser för Jobbcoach.ai: ${paketMedPris(SALD_PLAN)}`,
} as const
