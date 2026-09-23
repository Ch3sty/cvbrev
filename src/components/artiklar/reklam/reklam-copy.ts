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
 */

import { PLAN_BY_KEY } from '@/lib/plans/plans'
import { FREE_TEMPLATE_COUNT, TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { FREE_TIER_JOB_LIMIT } from '@/lib/jobmatching/freeLimit'
import { FREE_CHAT_MESSAGES_PER_ACCOUNT, LETTER_WINDOW_DAYS } from '@/lib/quota/quotaService'
import type { InlineVerktyg } from '@/lib/cta/clusters'

const CV = PLAN_BY_KEY.cv_week.amount
const TEST = PLAN_BY_KEY.test_week.amount
const ALLT = PLAN_BY_KEY.all_week.amount
const ALLT_MANAD = PLAN_BY_KEY.all_month.amount

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
    paketrad: `Alla nivåer och provläge mot klockan ingår i Testveckan, ${TEST} kr.`,
  },
  mallar: {
    rubrik: 'Bygg CV:t på en mall som rekryteringssystem läser',
    text: `${Ord(FREE_TEMPLATE_COUNT)} mallar och en nedladdning utan att betala, byggda så att rekryteringssystem läser dem rätt. Du fyller i, vi formaterar.`,
    knapp: 'Välj en mall',
    href: '/verktyg/cv-mallar',
    paketrad: `Alla ${TEMPLATE_COUNT} mallar och hela CV-analysen ingår i CV-veckan, ${CV} kr.`,
  },
  analys: {
    rubrik: 'Se varför CV:t fastnar innan du skickar det',
    text: 'Ladda upp CV:t, så läser vi det som en rekryterare gör i första urvalet. Poängen och det tyngsta fyndet är gratis.',
    knapp: 'Analysera mitt CV',
    href: '/verktyg/cv-analys',
    paketrad: `Hela analysen med varje fynd och åtgärd ingår i CV-veckan, ${CV} kr.`,
  },
  brev: {
    rubrik: 'Skriv brevet på annonsen, inte på mallen',
    text: `Klistra in annonsen, välj ton, vi skriver utkastet utifrån ditt CV. Ett brev ${BREVFONSTER} att läsa på skärmen, gratis.`,
    knapp: 'Skriv mitt brev',
    href: '/skapa-brev/start',
    paketrad: `Brev utan tak, som PDF, ingår i CV-veckan, ${CV} kr.`,
  },
  coach: {
    rubrik: 'Träna svaret innan du sitter i rummet',
    text: `Bolla dina svar med Jobbcoachen och få följdfrågorna en rekryterare hade ställt. ${Ord(FREE_CHAT_MESSAGES_PER_ACCOUNT)} frågor utan att betala.`,
    knapp: 'Träna intervjufrågor',
    href: '/verktyg/jobbcoachen',
    paketrad: `Coachen utan tak ingår i Allt, ${ALLT} kr i veckan.`,
  },
}

/** Karriär med lön, uppsägning eller jobbyte: räknarna först, coachen sedan. */
export const INLINE_RAKNARE = {
  rubrik: 'Räkna på det själv, fråga sedan',
  text: 'Uppsägningstid och lön efter skatt räknar du ut gratis här. Löneförhandlingen förbereder du med Jobbcoachen, som utgår från ditt CV.',
  lankar: [
    { text: 'Räkna ut lönen efter skatt', href: '/rakna-ut/lon-efter-skatt' },
    { text: 'Räkna ut uppsägningstiden', href: '/rakna-ut/uppsagningstid' },
    { text: 'Fråga coachen', href: '/verktyg/jobbcoachen' },
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
    etikett: 'Testveckan',
    rubrik: 'Träna med klockan på innan kallelsen kommer',
    text: 'Alla nivåer, provläge, personlighetstest med tolkning.',
    belopp: `${TEST} kr`,
    under: 'i veckan, ingen bindningstid',
    gratisrad: 'Grundnivån är gratis, en gång per dygn.',
  },
  cv: {
    etikett: 'CV-veckan',
    rubrik: 'Sju dagar till ett CV som går igenom',
    text: `Alla ${TEMPLATE_COUNT} mallar, hela analysen, brev utan tak.`,
    belopp: `${CV} kr`,
    under: 'i veckan, ingen bindningstid',
    gratisrad: `${Ord(FREE_TEMPLATE_COUNT)} mallar och ett brev ${BREVFONSTER} är gratis.`,
  },
  allt: {
    etikett: 'Allt',
    rubrik: 'Förberedd in i intervjun och löneförhandlingen',
    text: 'Jobbcoachen utan tak, CV, brev, tester och matchning.',
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
    etikett: 'Testveckan',
    rubrik: 'Sju dagar. Alla nivåer. Klockan på.',
    rader: [
      'Logik, verbalt och numeriskt i grund, avancerad och expert, med förklaring till varje svar',
      'Provläge med 25 till 40 minuter och automatisk inlämning, samma tidspress som hos rekryteraren',
      'Personlighetstest med tolkning',
      'Din utveckling, test för test',
    ],
    prisrad: `${TEST} kr i veckan, säg upp när du vill.`,
    knapp: 'Börja Testveckan',
    href: '/register?paket=test_week',
    sekundar: { text: `Eller Allt för ${ALLT} kr, med CV och brev`, href: '/priser' },
  },
  cv: {
    etikett: 'CV-veckan',
    rubrik: 'Sju dagar. Ett CV som går igenom. Brev som svarar på annonsen.',
    rader: [
      'Hela CV-analysen med varje fynd och åtgärd',
      `Alla ${TEMPLATE_COUNT} mallar, nedladdning utan tak`,
      'Personliga brev utan tak, som PDF',
      'LinkedIn-profilen omskriven',
    ],
    prisrad: `${CV} kr i veckan, säg upp när du vill.`,
    knapp: 'Börja CV-veckan',
    href: '/register?paket=cv_week',
    sekundar: { text: `Eller Allt för ${ALLT} kr, med testerna`, href: '/priser' },
  },
  allt: {
    etikett: 'Allt',
    rubrik: 'Allt. Från första annonsen till löneförhandlingen.',
    rader: [
      'Allt i CV-veckan och allt i Testveckan',
      'Jobbmatchning varje natt, med skälen utskrivna',
      'Jobbcoachen utan tak',
      'Bli upptäckt av rekryterare',
    ],
    prisrad: `${ALLT} kr i veckan eller ${ALLT_MANAD} kr i månaden.`,
    knapp: 'Börja med Allt',
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
    `${Ord(FREE_TIER_JOB_LIMIT)} matchade jobb och ${ord(FREE_CHAT_MESSAGES_PER_ACCOUNT)} frågor till coachen`,
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
      namn: 'CV-veckan',
      text: `Alla ${TEMPLATE_COUNT} mallar, hela CV-analysen, brev utan tak som PDF, LinkedIn-profilen.`,
      pris: `${CV} kr`,
      under: 'i veckan',
    },
    {
      etikett: 'Rekryteringstester',
      namn: 'Testveckan',
      text: 'Alla nivåer i logik, verbalt och numeriskt, provläge mot klockan, personlighetstest med tolkning.',
      pris: `${TEST} kr`,
      under: 'i veckan',
    },
    {
      etikett: 'Rekommenderas',
      namn: 'Allt',
      text: 'Allt i båda, plus jobbmatchning varje natt, Jobbcoachen utan tak och Bli upptäckt.',
      pris: `${ALLT} kr`,
      under: `i veckan, eller ${ALLT_MANAD} kr i månaden`,
    },
  ],
  knapp: 'Se paketen',
  href: '/priser',
} as const
