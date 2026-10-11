/**
 * Reklamkortens texter i artiklarna och artikellistan
 * (docs/design/analys-artiklar-2026-09-23.html, avsnitt 6, "Texterna, kort
 * för kort"), med ägarens justering 2026-09-23: "Gör provet innan
 * rekryteraren gör det" utgår och ersätts. Slutgranskade av copywritern
 * 2026-09-23: brevet är ett per rullande sju dagar, aldrig "ett om dagen".
 *
 * Gratisnivån i testerna (spec-rummen 23.3): fem frågor i artikeln utan
 * konto, mätningen och första passet med konto, resten i Premium. Testerna
 * beskrivs aldrig med en daglig gratisgräns.
 *
 * Vi-form, verbet först, gratis före pris, priset som tal, aldrig
 * "obegränsat" (vi säger "utan tak"), aldrig "AI-driven". Knapptexten säger
 * vad som händer. Belopp ur PLANS, mallantal ur TEMPLATE_COUNT, gratisgränser
 * ur kvottjänsten. Inga talstreck, inga ogaranterade siffror.
 *
 * Bara Jobbcoach Premium säljs (spec-rummen 17.3, copy-premium 2026-10-11).
 * Klustret styr fortfarande vinkeln (tester, CV och brev, intervju och lön),
 * men varje kort säljer samma sak. Fulla namnet står en gång per kort, i
 * etiketten; resten säger Premium. Knappen läser kopKnapp().
 */

import { PLAN_BY_KEY, SALD_PLAN, kopKnapp, paketKort, paketNamn, prisPeriod } from '@/lib/plans/plans'
import { FREE_TEMPLATE_COUNT, TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { FREE_TIER_JOB_LIMIT } from '@/lib/jobmatching/freeLimit'
import { FREE_CHAT_MESSAGES_PER_ACCOUNT, LETTER_WINDOW_DAYS } from '@/lib/quota/quotaService'
import type { InlineVerktyg } from '@/lib/cta/clusters'

const PLAN = PLAN_BY_KEY[SALD_PLAN]
/** "Jobbcoach Premium" */
const NAMN = paketNamn(SALD_PLAN)
/** "Premium" */
const KORT = paketKort()
/** "149 kr i månaden" */
const PRIS = prisPeriod(SALD_PLAN)
/** "Premium, 149 kr i månaden" */
const KORT_PRIS = `${KORT}, ${PRIS}`
/** Prisraden när fulla namnet redan står på kortet (copy-premium avsnitt 3). */
const PRISRAD = `${PRIS}, säg upp när du vill.`
const KOP_HREF = `/register?paket=${SALD_PLAN}`

/** Talord för små tal i löptext: "tre matchade jobb". */
const ORD = ['noll', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio']
const ord = (n: number) => ORD[n] ?? String(n)
const Ord = (n: number) => {
  const s = ord(n)
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Brevfönstret i ord: "var sjunde dag". Faller tillbaka på "var N:e dag". */
const ORDNING: Record<number, string> = { 7: 'sjunde', 14: 'fjortonde', 30: 'trettionde' }
const BREVFONSTER = ORDNING[LETTER_WINDOW_DAYS]
  ? `var ${ORDNING[LETTER_WINDOW_DAYS]} dag`
  : `var ${LETTER_WINDOW_DAYS}:e dag`

export interface InlineCopy {
  rubrik: string
  text: string
  knapp: string
  href: string
  /** Raden under knappen: vad Premium lägger till. */
  paketrad: string
}

/** Inline-kortet efter andra stycket: verktyget, gratis först. */
export const INLINE: Record<Exclude<InlineVerktyg, 'raknare' | 'lankrad'>, InlineCopy> = {
  test: {
    rubrik: 'Öva på frågorna innan de räknas',
    text: 'Matrislogik, verbalt och numeriskt med facit och förklaring till varje fråga. Fem frågor gratis här. Nivåkollen och första passet gratis med konto.',
    knapp: 'Gör ett övningstest',
    href: '/verktyg/rekryteringstester',
    paketrad: `Alla nivåer, övningsprov mot klockan och fördjupade personlighetstestet ingår i ${KORT_PRIS}.`,
  },
  mallar: {
    rubrik: 'Bygg CV:t på en mall som rekryteringssystem läser',
    text: `${Ord(FREE_TEMPLATE_COUNT)} mallar och en nedladdning utan att betala, byggda så att rekryteringssystem läser dem rätt. Du fyller i, vi formaterar.`,
    knapp: 'Välj en mall',
    href: '/verktyg/cv-mallar',
    paketrad: `Alla ${TEMPLATE_COUNT} mallar och hela CV-analysen ingår i ${KORT_PRIS}.`,
  },
  analys: {
    rubrik: 'Se varför CV:t fastnar innan du skickar det',
    text: 'Ladda upp CV:t, så läser vi det som en rekryterare gör i första urvalet. Poängen och det tyngsta fyndet är gratis.',
    knapp: 'Analysera mitt CV',
    href: '/verktyg/cv-analys',
    paketrad: `Hela analysen med varje fynd och åtgärd ingår i ${KORT_PRIS}.`,
  },
  brev: {
    rubrik: 'Skriv det personliga brevet på annonsen, inte på mallen',
    text: `Klistra in annonsen, välj ton, vi skriver utkastet utifrån ditt CV. Ett personligt brev ${BREVFONSTER} att läsa på skärmen, gratis.`,
    knapp: 'Skriv mitt personliga brev',
    href: '/skapa-brev/start',
    paketrad: `Personliga brev utan tak, som PDF, ingår i ${KORT_PRIS}.`,
  },
  coach: {
    rubrik: 'Träna svaret innan du sitter i rummet',
    text: `Bolla dina svar med Jobbcoachen och få följdfrågorna en rekryterare hade ställt. ${Ord(FREE_CHAT_MESSAGES_PER_ACCOUNT)} frågor utan att betala.`,
    knapp: 'Träna intervjufrågor',
    href: '/verktyg/jobbcoachen',
    paketrad: `Jobbcoachen, så mycket du vill, ingår i ${KORT_PRIS}.`,
  },
}

/** Karriär med lön, uppsägning eller jobbyte: räknarna först, coachen sedan. */
export const INLINE_RAKNARE = {
  rubrik: 'Räkna på det själv, fråga sedan',
  text: 'Uppsägningstid och lön efter skatt räknar du ut gratis här. Löneförhandlingen förbereder du med Jobbcoachen, som utgår från ditt CV.',
  lankar: [
    { text: 'Räkna ut lönen efter skatt', href: '/rakna-ut/lon-efter-skatt' },
    { text: 'Räkna ut uppsägningstiden', href: '/rakna-ut/uppsagningstid' },
    { text: 'Fråga Jobbcoachen', href: '/verktyg/jobbcoachen' },
  ],
} as const

/** Övriga karriärartiklar: bara länkraden, som förut. */
export const LANKRAD = {
  text: 'Räkna på det själv:',
  lankar: [
    { text: 'Räkna ut din uppsägningstid', href: '/rakna-ut/uppsagningstid' },
    { text: 'Räkna ut lönen efter skatt', href: '/rakna-ut/lon-efter-skatt' },
  ],
} as const

export interface SidoCopy {
  etikett: string
  rubrik: string
  text: string
  belopp: string
  under: string
  gratisrad?: string
}

/** Sidokolumnens kort, desktop. Samma produkt, klustrets vinkel i rubriken. */
export const SIDO: Record<'cv' | 'test' | 'allt', SidoCopy> = {
  test: {
    etikett: NAMN,
    rubrik: 'Träna med klockan på innan kallelsen kommer',
    text: PLAN.beskrivning,
    belopp: `${PLAN.amount} kr`,
    under: `${PLAN.suffix}, ingen bindningstid`,
    gratisrad: `Fem frågor gratis här. Nivåkollen och första passet gratis med konto. Resten ingår i ${KORT}.`,
  },
  cv: {
    etikett: NAMN,
    rubrik: 'Ett CV som går igenom första urvalet',
    text: PLAN.beskrivning,
    belopp: `${PLAN.amount} kr`,
    under: `${PLAN.suffix}, ingen bindningstid`,
    gratisrad: `${Ord(FREE_TEMPLATE_COUNT)} mallar och ett personligt brev ${BREVFONSTER} är gratis.`,
  },
  allt: {
    etikett: NAMN,
    rubrik: 'Förberedd in i intervjun och löneförhandlingen',
    text: PLAN.beskrivning,
    belopp: `${PLAN.amount} kr`,
    under: `${PLAN.suffix}, ingen bindningstid`,
  },
}

export interface SlutCopy {
  etikett: string
  rubrik: string
  rader: readonly string[]
  prisrad: string
  knapp: string
  href: string
  sekundar: { text: string; href: string }
}

/** Raderna som säger att resten också ingår (copy-premium avsnitt 3). */
const CV_RAD = 'Alla CV-mallar, CV-analysen, personliga brev och LinkedIn'
const TEST_RAD = 'Alla rekryteringstester, övningsprov och personlighetstestet'
const SEKUNDAR = { text: 'Se vad som ingår', href: '/priser' }

/** Slutkortet i bläck, efter brödtexten. */
export const SLUT: Record<'cv' | 'test' | 'allt', SlutCopy> = {
  test: {
    etikett: NAMN,
    rubrik: 'Alla nivåer. Klockan på.',
    rader: [
      'Logik, verbalt och numeriskt i grund, avancerad och expert, med förklaring till varje svar',
      'Övningsprov på 25 till 40 minuter och automatisk inlämning, samma tidspress som hos rekryteraren',
      'Fördjupade personlighetstestet, 120 påståenden',
      'Dessutom CV-analysen, alla mallar, personliga brev, jobbmatchning och Jobbcoachen',
    ],
    prisrad: PRISRAD,
    knapp: kopKnapp(),
    href: KOP_HREF,
    sekundar: SEKUNDAR,
  },
  cv: {
    etikett: NAMN,
    rubrik: 'Ett CV som går igenom. Personliga brev som svarar på annonsen.',
    rader: [
      'Hela CV-analysen med varje fynd och åtgärd',
      `Alla ${TEMPLATE_COUNT} mallar, nedladdning utan tak`,
      'Personliga brev utan tak, som PDF',
      'LinkedIn-profilen omskriven',
      'Dessutom alla rekryteringstester, jobbmatchning och Jobbcoachen',
    ],
    prisrad: PRISRAD,
    knapp: kopKnapp(),
    href: KOP_HREF,
    sekundar: SEKUNDAR,
  },
  allt: {
    etikett: NAMN,
    rubrik: 'Allt ingår. Från första annonsen till löneförhandlingen.',
    rader: [
      'Jobbmatchning varje natt, med skälen utskrivna',
      'Jobbcoachen, så mycket du vill',
      'Bli upptäckt av rekryterare',
      CV_RAD,
      TEST_RAD,
    ],
    prisrad: PRISRAD,
    knapp: kopKnapp(),
    href: KOP_HREF,
    sekundar: SEKUNDAR,
  },
}

/** Gratiskortet: plats 7 i listan och generic-artiklarnas slutkort. */
export const GRATIS_KORT = {
  etikett: 'Utan att betala',
  rubrik: 'Vill du prova innan du läser vidare?',
  rader: [
    `${Ord(FREE_TEMPLATE_COUNT)} CV-mallar och en nedladdning`,
    'En CV-analys med poäng och tyngsta fyndet',
    `Ett personligt brev ${BREVFONSTER}, att läsa på skärmen`,
    `${Ord(FREE_TIER_JOB_LIMIT)} matchade jobb och ${ord(FREE_CHAT_MESSAGES_PER_ACCOUNT)} frågor till Jobbcoachen`,
    'En nivåkoll i testerna med genomgång, och ett första träningspass',
  ],
  knapp: 'Skapa konto gratis',
  href: '/register',
  sekundar: { text: 'Se vad som ingår i Premium', href: '/priser' },
} as const

/** Listans slutkort i bläck: Premium och det som ingår. */
export const LISTA_SLUT = {
  etikett: NAMN,
  rubrik: 'Läs klart, gör sedan.',
  text: `Allt i en prenumeration, ${PRIS}. Ingen bindningstid, säg upp med ett klick.`,
  rader: PLAN.highlights.filter((r) => r !== 'Säg upp när du vill'),
  knapp: 'Se vad som ingår',
  href: '/priser',
} as const
