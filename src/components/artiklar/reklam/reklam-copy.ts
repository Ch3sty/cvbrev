/**
 * Reklamkortens texter i artiklarna och artikellistan
 * (docs/design/analys-artiklar-2026-09-23.html, avsnitt 6, "Texterna, kort
 * för kort"), med ägarens justering 2026-09-23: "Gör provet innan
 * rekryteraren gör det" utgår och ersätts. Slutgranskade av copywritern
 * 2026-09-23: brevet är ett per rullande sju dygn, aldrig "ett om dagen".
 *
 * Vi-form, verbet först, gratis före pris, priset som tal, aldrig
 * "obegränsat" (vi säger "utan tak"), aldrig "AI-driven". Knapptexten säger
 * vad som händer. Belopp ur PLANS, mallantal ur TEMPLATE_COUNT, gratisgränser
 * ur kvottjänsten. Inga talstreck, inga ogaranterade siffror.
 *
 * Paketnamnen (beslut-paketnamn 2026-09-24): namnen ur PLANS, alltid med
 * pris och period i samma rad, ordningen CV-paketet, Träningspaketet, Hela
 * paketet, och Hela paketets egna rader före hänvisningen till de andra två.
 */

import { PLAN_BY_KEY, paketMedPris, paketNamn } from '@/lib/plans/plans'
import { FREE_TEMPLATE_COUNT, TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { FREE_TIER_JOB_LIMIT } from '@/lib/jobmatching/freeLimit'
import { FREE_CHAT_MESSAGES_PER_ACCOUNT, LETTER_WINDOW_DAYS } from '@/lib/quota/quotaService'
import type { InlineVerktyg } from '@/lib/cta/clusters'

const CV = PLAN_BY_KEY.cv_week.amount
const TEST = PLAN_BY_KEY.test_week.amount
const ALLT = PLAN_BY_KEY.all_week.amount
const ALLT_MANAD = PLAN_BY_KEY.all_month.amount

const CV_NAMN = paketNamn('cv_week')
const TRANING_NAMN = paketNamn('test_week')
const HELA_NAMN = paketNamn('all_week')
/** "CV-paketet, 79 kr i veckan" */
const CV_PRIS = paketMedPris('cv_week')
const TRANING_PRIS = paketMedPris('test_week')
const HELA_PRIS = paketMedPris('all_week')

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
  /** Raden under knappen: vad paketet lägger till. */
  paketrad: string
}

/** Inline-kortet efter andra stycket: verktyget, gratis först. */
export const INLINE: Record<Exclude<InlineVerktyg, 'raknare' | 'lankrad'>, InlineCopy> = {
  test: {
    rubrik: 'Öva på frågorna innan de räknas',
    text: 'Matrislogik, verbalt och numeriskt med facit och förklaring till varje fråga. Grundnivån är gratis, en gång per dygn och testtyp.',
    knapp: 'Gör ett övningstest',
    href: '/verktyg/rekryteringstester',
    paketrad: `Alla nivåer, provläge mot klockan och fördjupade personlighetstestet ingår i ${TRANING_PRIS}.`,
  },
  mallar: {
    rubrik: 'Bygg CV:t på en mall som rekryteringssystem läser',
    text: `${Ord(FREE_TEMPLATE_COUNT)} mallar och en nedladdning utan att betala, byggda så att rekryteringssystem läser dem rätt. Du fyller i, vi formaterar.`,
    knapp: 'Välj en mall',
    href: '/verktyg/cv-mallar',
    paketrad: `Alla ${TEMPLATE_COUNT} mallar och hela CV-analysen ingår i ${CV_PRIS}.`,
  },
  analys: {
    rubrik: 'Se varför CV:t fastnar innan du skickar det',
    text: 'Ladda upp CV:t, så läser vi det som en rekryterare gör i första urvalet. Poängen och det tyngsta fyndet är gratis.',
    knapp: 'Analysera mitt CV',
    href: '/verktyg/cv-analys',
    paketrad: `Hela analysen med varje fynd och åtgärd ingår i ${CV_PRIS}.`,
  },
  brev: {
    rubrik: 'Skriv det personliga brevet på annonsen, inte på mallen',
    text: `Klistra in annonsen, välj ton, vi skriver utkastet utifrån ditt CV. Ett personligt brev ${BREVFONSTER} att läsa på skärmen, gratis.`,
    knapp: 'Skriv mitt personliga brev',
    href: '/skapa-brev/start',
    paketrad: `Personliga brev utan tak, som PDF, ingår i ${CV_PRIS}.`,
  },
  coach: {
    rubrik: 'Träna svaret innan du sitter i rummet',
    text: `Bolla dina svar med Jobbcoachen och få följdfrågorna en rekryterare hade ställt. ${Ord(FREE_CHAT_MESSAGES_PER_ACCOUNT)} frågor utan att betala.`,
    knapp: 'Träna intervjufrågor',
    href: '/verktyg/jobbcoachen',
    paketrad: `Jobbcoachen, så mycket du vill, ingår i ${HELA_PRIS}.`,
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

/** Sidokolumnens paketkort, desktop. */
export const SIDO: Record<'cv' | 'test' | 'allt', SidoCopy> = {
  test: {
    etikett: TRANING_NAMN,
    rubrik: 'Träna med klockan på innan kallelsen kommer',
    text: PLAN_BY_KEY.test_week.beskrivning,
    belopp: `${TEST} kr`,
    under: 'i veckan, ingen bindningstid',
    gratisrad: 'Grundnivån är gratis, en gång per dygn.',
  },
  cv: {
    etikett: CV_NAMN,
    rubrik: 'Sju dagar till ett CV som går igenom',
    text: PLAN_BY_KEY.cv_week.beskrivning,
    belopp: `${CV} kr`,
    under: 'i veckan, ingen bindningstid',
    gratisrad: `${Ord(FREE_TEMPLATE_COUNT)} mallar och ett personligt brev ${BREVFONSTER} är gratis.`,
  },
  allt: {
    etikett: HELA_NAMN,
    rubrik: 'Förberedd in i intervjun och löneförhandlingen',
    text: PLAN_BY_KEY.all_week.beskrivning,
    belopp: `${ALLT} kr`,
    under: `i veckan, eller ${ALLT_MANAD} kr i månaden`,
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

/** Slutkortet i bläck, efter brödtexten. */
export const SLUT: Record<'cv' | 'test' | 'allt', SlutCopy> = {
  test: {
    etikett: TRANING_NAMN,
    rubrik: 'Sju dagar. Alla nivåer. Klockan på.',
    rader: [
      'Logik, verbalt och numeriskt i grund, avancerad och expert, med förklaring till varje svar',
      'Provläge med 25 till 40 minuter och automatisk inlämning, samma tidspress som hos rekryteraren',
      'Fördjupade personlighetstestet, 120 påståenden',
      'Din utveckling, test för test',
    ],
    prisrad: `${TEST} kr i veckan, säg upp när du vill.`,
    knapp: `Börja med ${TRANING_PRIS}`,
    href: '/register?paket=test_week',
    sekundar: { text: `Eller ${HELA_PRIS}, med CV och personliga brev`, href: '/priser' },
  },
  cv: {
    etikett: CV_NAMN,
    rubrik: 'Sju dagar. Ett CV som går igenom. Personliga brev som svarar på annonsen.',
    rader: [
      'Hela CV-analysen med varje fynd och åtgärd',
      `Alla ${TEMPLATE_COUNT} mallar, nedladdning utan tak`,
      'Personliga brev utan tak, som PDF',
      'LinkedIn-profilen omskriven',
    ],
    prisrad: `${CV} kr i veckan, säg upp när du vill.`,
    knapp: `Börja med ${CV_PRIS}`,
    href: '/register?paket=cv_week',
    sekundar: { text: `Eller ${HELA_PRIS}, med testerna`, href: '/priser' },
  },
  allt: {
    etikett: HELA_NAMN,
    rubrik: 'Allt ingår. Från första annonsen till löneförhandlingen.',
    rader: [
      'Jobbmatchning varje natt, med skälen utskrivna',
      'Jobbcoachen, så mycket du vill',
      'Bli upptäckt av rekryterare',
      `Allt i ${CV_NAMN} och ${TRANING_NAMN}`,
    ],
    prisrad: `${ALLT} kr i veckan eller ${ALLT_MANAD} kr i månaden.`,
    knapp: `Börja med ${HELA_PRIS}`,
    href: '/register?paket=all_week',
    sekundar: { text: 'Se alla tre paketen', href: '/priser' },
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
    'Testernas grundnivå, en gång per dygn',
  ],
  knapp: 'Skapa konto gratis',
  href: '/register',
  sekundar: { text: 'Se paketen', href: '/priser' },
} as const

/** Listans slutkort i bläck: de tre paketen. */
export const LISTA_SLUT = {
  etikett: 'Paketen',
  rubrik: 'Läs klart, gör sedan.',
  text: 'Tre paket, alla per vecka, ingen bindningstid. Välj det som matchar det du söker på just nu. Säg upp med ett klick.',
  paket: [
    {
      etikett: 'CV och personliga brev',
      namn: CV_NAMN,
      text: `Alla ${TEMPLATE_COUNT} mallar, hela CV-analysen, personliga brev utan tak som PDF, LinkedIn-profilen.`,
      pris: `${CV} kr`,
      under: 'i veckan',
    },
    {
      etikett: 'Rekryteringstester',
      namn: TRANING_NAMN,
      text: 'Alla nivåer i logik, verbalt och numeriskt, provläge mot klockan, fördjupade personlighetstestet.',
      pris: `${TEST} kr`,
      under: 'i veckan',
    },
    {
      etikett: 'Rekommenderas',
      namn: HELA_NAMN,
      text: 'Jobbmatchning varje natt, Jobbcoachen och Bli upptäckt. Och allt i de andra två paketen.',
      pris: `${ALLT} kr`,
      under: `i veckan, eller ${ALLT_MANAD} kr i månaden`,
    },
  ],
  knapp: 'Se paketen',
  href: '/priser',
} as const
