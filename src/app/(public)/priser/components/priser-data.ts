/**
 * Priser-data: serversäkra konstanter för /priser.
 *
 * Prisstegen bor i src/lib/plans/plans.ts och kortens copy i
 * src/components/pricing/paket-copy.ts. Här ligger bara det som är sidans
 * eget: gratisnivån, jämförelsetabellen och frågorna.
 *
 * Omskriven för paketen (docs/plan-paket-och-onboarding.md, Fas 2B avsnitt 3
 * och Fas 2E). Dagspass och jobbsökarveckan finns inte längre som egna
 * produkter, och trial är borta enligt ägarens beslut 3.
 */

import {
  TEMPLATE_COUNT,
  FREE_TEMPLATE_COUNT,
} from '@/lib/cv/simple-templates'
import { PLAN_BY_KEY } from '@/lib/plans/plans'

export const PREMIUM_CURRENCY = 'SEK'

// === Gratisnivån ===

/**
 * GR-serien i listform, alltså vad gratisnivån faktiskt ger
 * (Fas 2B avsnitt 8, med den hårdare CV-analysen ur ägarens beslut 2).
 *
 * Ändras en gräns i quotaService måste raderna ändras i samma omgång,
 * annars säger sidan en sak och spärren en annan.
 */
export const FREE_HIGHLIGHTS = [
  `${FREE_TEMPLATE_COUNT} CV-mallar`,
  'En CV-analys med poängen, antalet fynd och det tyngsta fyndet',
  'Ett personligt brev, sedan ett i veckan',
  'En CV-nedladdning',
  'Grundnivån i varje testtyp, en gång per dygn',
  'Tio meddelanden med jobbcoachen',
  'De tre bästa jobbträffarna',
] as const

/** D2: gratisnivån i en mening. Följer den hårdare CV-analysen. */
export const GRATIS_RAD =
  'Tre mallar, en CV-analys, ett brev och grundnivån i testerna ingår.'

// === Jämförelsetabellen ===

/** PR8. */
export const COMPARISON_INTRO =
  'Spårpaketen ger allt i sitt spår. Allt ger båda, plus jobbmatchning, jobbcoachen och Bli upptäckt.'

export interface ComparisonRow {
  label: string
  free: string
  cv: string
  test: string
  allt: string
}

export interface ComparisonGroup {
  title: string
  rows: ComparisonRow[]
}

/** Bock och punkt skrivs som tecken och ritas av tabellen. */
const JA = '✓'
const NEJ = '·'

export const COMPARISON: ComparisonGroup[] = [
  {
    title: 'CV och ansökan',
    rows: [
      {
        label: 'CV-mallar',
        free: String(FREE_TEMPLATE_COUNT),
        cv: String(TEMPLATE_COUNT),
        test: String(FREE_TEMPLATE_COUNT),
        allt: String(TEMPLATE_COUNT),
      },
      { label: 'CV-analyser', free: '1', cv: 'Utan tak', test: '1', allt: 'Utan tak' },
      { label: 'Alla fynd i analysen', free: NEJ, cv: JA, test: NEJ, allt: JA },
      {
        label: 'Läsbarhet i rekryteringssystem (ATS)',
        free: NEJ,
        cv: JA,
        test: NEJ,
        allt: JA,
      },
      { label: 'CV-nedladdning', free: '1', cv: 'Utan tak', test: '1', allt: 'Utan tak' },
      { label: 'Personligt brev', free: '1 i veckan', cv: 'Utan tak', test: '1 i veckan', allt: 'Utan tak' },
      { label: 'Brevnedladdning', free: NEJ, cv: JA, test: NEJ, allt: JA },
    ],
  },
  {
    title: 'Rekryteringstester',
    rows: [
      { label: 'Grundnivån', free: '1 per dygn', cv: '1 per dygn', test: 'Utan tak', allt: 'Utan tak' },
      { label: 'Nivåer över grundnivån', free: NEJ, cv: NEJ, test: JA, allt: JA },
      { label: 'Tidsatt provläge', free: NEJ, cv: NEJ, test: JA, allt: JA },
      { label: 'Testhistorik och utveckling', free: NEJ, cv: NEJ, test: JA, allt: JA },
      { label: 'Förklaring per fråga', free: NEJ, cv: NEJ, test: JA, allt: JA },
    ],
  },
  {
    title: 'Jobb och coachning',
    rows: [
      { label: 'Jobbträffar', free: '3', cv: '3', test: '3', allt: '25' },
      { label: 'Skälen bakom varje träff', free: NEJ, cv: NEJ, test: NEJ, allt: JA },
      { label: 'Jobbcoachen', free: '10 meddelanden', cv: '10 meddelanden', test: '10 meddelanden', allt: 'Utan tak' },
      { label: 'Bli upptäckt av rekryterare', free: NEJ, cv: NEJ, test: NEJ, allt: JA },
    ],
  },
  {
    title: 'Villkor',
    rows: [
      {
        label: 'Pris',
        free: '0 kr',
        cv: `${PLAN_BY_KEY.cv_week.amount} kr`,
        test: `${PLAN_BY_KEY.test_week.amount} kr`,
        allt: `${PLAN_BY_KEY.all_week.amount} kr`,
      },
      { label: 'Bindningstid', free: NEJ, cv: NEJ, test: NEJ, allt: NEJ },
      { label: 'Uppsägning i ditt konto', free: NEJ, cv: JA, test: JA, allt: JA },
      { label: 'Data i EU, GDPR', free: JA, cv: JA, test: JA, allt: JA },
    ],
  },
]

// === FAQ, PR9 till PR13 ===

export const PRISER_FAQ_ITEMS = [
  {
    id: 'varfor-vecka',
    q: 'Varför säljer ni en vecka och inte en månad?',
    a: 'De flesta söker jobb i korta intensiva perioder och slutar när de fått jobbet. En månad är då för mycket betalt för för lite användning. Veckan matchar hur ett sök faktiskt ser ut: du har en annons som ska besvaras, eller ett urvalstest på fredag. Behöver du längre tid finns Allt-månaden, som kostar mindre per vecka än fyra veckor i rad.',
  },
  {
    id: 'nar-veckan-ar-slut',
    q: 'Vad händer när veckan är slut?',
    a: 'Veckan förnyas automatiskt med samma belopp, och du behåller ditt spår. Vill du inte fortsätta säger du upp i ditt konto, och då gäller veckan du betalat för till sista dagen innan kontot går tillbaka till gratisnivån. Allt du skapat finns kvar att läsa och kopiera, även på gratisnivån.',
  },
  {
    id: 'byta-spar',
    q: 'Kan jag byta spår?',
    a: 'Ja. Säg upp det spår du har och köp det andra, så börjar en ny vecka. Vill du ha båda samtidigt byter du till Allt-veckan direkt, och då betalar du bara mellanskillnaden för de dagar som är kvar av veckan du redan köpt.',
  },
  {
    id: 'utan-att-betala',
    q: 'Vad ingår utan att betala?',
    a: 'Tre CV-mallar, en CV-analys med poängen och det tyngsta fyndet, ett personligt brev, en CV-nedladdning och grundnivån i varje testtyp en gång per dygn. Det räcker för att se hur verktygen arbetar och för att skicka en ansökan. Söker du flera jobb i veckan, eller ska du göra ett urvalstest på riktigt, tar gratisnivån slut.',
  },
  {
    id: 'saga-upp',
    q: 'Hur säger jag upp?',
    a: 'Under Profil och Prenumeration, ett klick, utan att uppge skäl och utan att kontakta oss. Uppsägningen gäller från nästa förnyelse, och veckan du redan betalat för gäller ut. Vi skickar ett mail dagen innan varje förnyelse från och med den tredje, så att ingen dragning kommer som en överraskning.',
  },
] as const
