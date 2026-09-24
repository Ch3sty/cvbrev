/**
 * Priser-data: serversäkra konstanter för /priser
 * (docs/design/spec-prissida-2026-09-22.html).
 *
 * Prisstegen bor i src/lib/plans/plans.ts och all copy i
 * src/components/pricing/paket-copy.ts. Här ligger bara det som är sidans
 * eget: gratisnivån i listform, jämförelsetabellen och frågorna.
 *
 * Tabellen skriver ord i stället för prickar: "Alla 41", "Utan tak",
 * "Ingår inte". Ändras en gräns i quotaService måste raderna ändras i samma
 * omgång, annars säger sidan en sak och spärren en annan.
 */

import { TEMPLATE_COUNT, FREE_TEMPLATE_COUNT } from '@/lib/cv/template-antal'

export const PREMIUM_CURRENCY = 'SEK'

// === Gratisnivån ===

/** Gratisnivån i listform, för kontosidan. */
export const FREE_HIGHLIGHTS = [
  `${FREE_TEMPLATE_COUNT} CV-mallar och en nedladdning`,
  'En CV-analys med poängen och det tyngsta fyndet',
  'Ett personligt brev att läsa, sedan ett i veckan',
  'Tre matchade jobb',
  'Tio frågor till jobbcoachen',
  'Grundnivån i alla fyra testtyperna, en gång per typ och dygn',
] as const

/** Gratisnivån i en mening, för startsidan. */
export const GRATIS_RAD = `${FREE_TEMPLATE_COUNT} mallar, en CV-analys, ett personligt brev och grundnivån i testerna ingår utan att betala.`

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
  cv: ComparisonCell
  test: ComparisonCell
  allt: ComparisonCell
}

export interface ComparisonGroup {
  title: string
  rows: ComparisonRow[]
}

const ja = (text: string, sub?: string): ComparisonCell => ({ text, sub, ton: 'ja' })
const g = (text: string, sub?: string): ComparisonCell => ({ text, sub, ton: 'g' })
const NEJ: ComparisonCell = { text: 'Ingår inte', ton: 'nej' }

export const COMPARISON: ComparisonGroup[] = [
  {
    title: 'CV och personliga brev',
    rows: [
      {
        label: 'CV-mallar',
        sub: 'som rekryteringssystem läser',
        free: g(`${FREE_TEMPLATE_COUNT} mallar`),
        cv: ja(`Alla ${TEMPLATE_COUNT}`),
        test: g(`${FREE_TEMPLATE_COUNT} mallar`),
        allt: ja(`Alla ${TEMPLATE_COUNT}`),
      },
      {
        label: 'CV-analys',
        sub: 'poäng, fynd, nyckelord',
        free: g('Poäng och tyngsta fyndet', 'en gång'),
        cv: ja('Hela rapporten', 'kör om utan tak'),
        test: g('Poäng och tyngsta fyndet', 'en gång'),
        allt: ja('Hela rapporten', 'kör om utan tak'),
      },
      {
        label: 'CV-nedladdning',
        sub: 'som PDF',
        free: g('1 gång'),
        cv: ja('Utan tak'),
        test: g('1 gång'),
        allt: ja('Utan tak'),
      },
      {
        label: 'Personliga brev',
        sub: 'skrivna på annonsen',
        free: g('1, sedan 1 i veckan', 'läsa, inte ladda ned'),
        cv: ja('Utan tak', 'nedladdning som PDF'),
        test: g('1, sedan 1 i veckan', 'läsa, inte ladda ned'),
        allt: ja('Utan tak', 'nedladdning som PDF'),
      },
      {
        label: 'LinkedIn-profilen',
        sub: 'rubrik och sammanfattning',
        free: NEJ,
        cv: ja('Ingår'),
        test: NEJ,
        allt: ja('Ingår'),
      },
    ],
  },
  {
    title: 'Rekryteringstester',
    rows: [
      {
        label: 'Grundnivå',
        sub: 'matrislogik, verbalt, numeriskt, personlighet',
        free: g('1 per typ och dygn'),
        cv: g('1 per typ och dygn'),
        test: ja('Utan tak'),
        allt: ja('Utan tak'),
      },
      {
        label: 'Avancerad och expertnivå',
        free: NEJ,
        cv: NEJ,
        test: ja('Ingår'),
        allt: ja('Ingår'),
      },
      {
        label: 'Tidsatt provläge',
        sub: '25 till 40 min, automatisk inlämning',
        free: NEJ,
        cv: NEJ,
        test: ja('Ingår'),
        allt: ja('Ingår'),
      },
      {
        label: 'Förklaring efter varje fråga',
        free: g('Grundnivå'),
        cv: g('Grundnivå'),
        test: ja('Alla nivåer'),
        allt: ja('Alla nivåer'),
      },
      {
        label: 'Din utveckling',
        sub: 'alla sessioner i en kurva',
        free: g('Senaste sessionen'),
        cv: g('Senaste sessionen'),
        test: ja('Hela historiken'),
        allt: ja('Hela historiken'),
      },
    ],
  },
  {
    title: 'Jobb och coachning',
    rows: [
      {
        label: 'Matchade jobb',
        sub: 'kompetens mot alla branscher',
        free: g('3 träffar'),
        cv: g('3 träffar'),
        test: g('3 träffar'),
        allt: ja('25 träffar', 'med skälen utskrivna'),
      },
      {
        label: 'Jobbcoachen',
        sub: 'lön, intervju, avtal',
        free: g('10 meddelanden'),
        cv: g('10 meddelanden'),
        test: g('10 meddelanden'),
        allt: ja('Utan tak'),
      },
      {
        label: 'Bli upptäckt',
        sub: 'rekryterare hittar dig, anonymt',
        free: NEJ,
        cv: NEJ,
        test: NEJ,
        allt: ja('Ingår'),
      },
    ],
  },
]

export const JAMFORELSE_RUBRIK = 'Vad som ingår, rad för rad'

// === FAQ ===

export const PRISER_FAQ_ITEMS = [
  {
    id: 'varfor-vecka',
    q: 'Varför säljer ni veckor och inte månader?',
    a: 'För att det mesta du behöver bygger du på en vecka: CV:t, de personliga breven, träningen inför testet. Sedan använder du det i varje ansökan. Söker du länge är Hela paketet per månad billigare per vecka, 149 kr i månaden, och det finns där när du vill ha det.',
  },
  {
    id: 'nar-veckan-ar-slut',
    q: 'Vad händer när veckan är slut?',
    a: 'Den förnyas var sjunde dag tills du säger upp, med samma pris. Dagen innan visar vi vad du gjort och vad som är kvar, och där kan du avsluta med ett klick. Ingen påminnelse i smyg.',
  },
  {
    id: 'byta-spar',
    q: 'Kan jag byta paket mitt i veckan?',
    a: 'Ja. Från CV-paketet eller Träningspaketet till Hela paketet betalar du bara mellanskillnaden för dagarna som är kvar. Mellan CV-paketet och Träningspaketet byter du direkt, priset är detsamma och dragningsdagen står kvar. Från Hela paketet till ett av de andra byter du vid nästa förnyelse.',
  },
  {
    id: 'saga-upp',
    q: 'Hur säger jag upp?',
    a: 'I ditt konto, under Profil och prenumeration, ett klick. Lika enkelt som att köpa. Veckan du redan betalat gäller ut.',
  },
] as const
