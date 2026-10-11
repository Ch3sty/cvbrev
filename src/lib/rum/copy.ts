// src/lib/rum/copy.ts
//
// Rummens strängar (spec-rummen-2026-10-10 avsnitt 8, 9 och 16).
// Copywriterns granskning av våg 1b (docs/design/copy-rummen-1b-2026-10-11.md)
// är inarbetad. Ändra här, aldrig i JSX.

import type { Rum } from './rum'

/**
 * Dörrarnas etiketter. Aldrig "Brev" (beslut 4).
 *
 * Två uppsättningar, så att testrummets namn kan bytas på ett ställe och
 * heta olika på mobil och dator. Ägarens beslut 2026-10-11 (ersätter
 * copywriterns "Testträning"):
 *   mobil  dörrnavet längst ner, 11 px under ikonen i en 87 px bred plats
 *          på 360 px: "Tester".
 *   dator  sidomenyns dörrrad, och samma namn överallt där rummet nämns
 *          (toppradens brand, sidomenyns grupprubrik): "Rekryteringstester".
 * Rummet heter fortfarande `tran` i koden.
 */
export const DORR_ETIKETT: Record<'mobil' | 'dator', Record<Exclude<Rum, 'neutral'>, string>> = {
  mobil: {
    tran: 'Tester',
    cv: 'CV',
    brev: 'Personliga brev',
    jobb: 'Jobbsöket',
  },
  dator: {
    tran: 'Rekryteringstester',
    cv: 'CV',
    brev: 'Personliga brev',
    jobb: 'Jobbsöket',
  },
}

/** Rummets namn: toppradens brand. Testrummet följer dörren på dator. */
export const RUM_NAMN: Record<Rum, string> = {
  tran: DORR_ETIKETT.dator.tran,
  cv: 'CV',
  brev: 'Personliga brev',
  jobb: 'Jobbsöket',
  neutral: 'Konto',
}

/**
 * Grupprubriken ovanför rummets undersidor i sidomenyn: rummets namn, utan
 * "I" (copywritern: "I CV" och "I Konto" är inte svenska).
 */
export const GRUPP_RUBRIK: Record<Rum, string> = { ...RUM_NAMN }

/** Testrummets första förklarande rad (ägarens beslut 2026-10-11). */
export const TRAN_RAD = 'Träna inför ditt rekryteringstest.'

/** Undersidornas etiketter (spec 4.3). */
export const UNDERSIDA = {
  allaTester: 'Alla tester',
  provlaget: 'Provläget',
  minaCv: 'Mina CV',
  analyseraCv: 'Analysera CV',
  cvMallar: 'CV-mallar',
  linkedin: 'LinkedIn-profilen',
  minaBrev: 'Mina brev',
  skrivNyttBrev: 'Skriv nytt brev',
  oversikt: 'Översikt',
  soktaTjanster: 'Sökta tjänster',
  inforIntervjun: 'Inför intervjun',
  matchadeJobb: 'Matchade jobb',
  jobbcoachen: 'Jobbcoachen',
  bliUpptackt: 'Bli upptäckt',
  profil: 'Profil',
  prenumeration: 'Prenumeration',
  utseende: 'Utseende',
} as const

/** Chip-texter i sidomenyn. */
export const CHIP = {
  nyhet: 'Nyhet',
  nya: (n: number) => `${n} nya`,
  vantar: (n: number) => `${n} väntar`,
  lastEtikett: 'Öppnas med ett paket',
} as const

/** Toppraden. */
export const TOPPRAD = {
  kontoKnapp: 'Konto och inställningar',
  stang: 'Stäng',
} as const

/** Navets tillgängliga namn. globals.css pekar på nav[aria-label="Huvudmeny"]. */
export const NAV = {
  dorrar: 'Huvudmeny',
  sidomeny: 'Sidomeny',
} as const

/** Utseende-väljaren på profilen (spec 4.3 och 9, våg 1b). */
export const UTSEENDE = {
  rubrik: 'Utseende',
  val: {
    system: 'Följer systemet',
    ljust: 'Ljust',
    morkt: 'Mörkt',
  },
} as const

/**
 * Jobbsökets handling som ersätter Skapa-arkets rad (spec 2.1). "Tjänst",
 * inte "jobb": knappen landar i Sökta tjänster (copywriterns rad 7).
 */
export const JOBBSOK = {
  loggaSoktJobb: 'Logga sökt tjänst',
} as const

/**
 * Kontoraden längst ner i sidomenyn, på två rader (spec 16.3.5): namnet
 * 13/500 och paketet 12 under. Paketnamnet kommer ur PLANS.name.
 */
export const KONTORAD = {
  utanPaket: 'Gratisnivån',
} as const

/**
 * Sidornas h1 (spec 16.3.2): undersidans namn i sidomenyn. Undantag är
 * Jobbsökets hem (hälsningen), Träningens hem (datumrubriken i våg 2) och
 * detaljsidor (brev, ansökan, test, resultat).
 */
export const RUBRIK = {
  minaCv: UNDERSIDA.minaCv,
  minaBrev: UNDERSIDA.minaBrev,
  soktaTjanster: UNDERSIDA.soktaTjanster,
  matchadeJobb: UNDERSIDA.matchadeJobb,
  analyseraCv: UNDERSIDA.analyseraCv,
  cvMallar: UNDERSIDA.cvMallar,
  linkedin: UNDERSIDA.linkedin,
  bliUpptackt: UNDERSIDA.bliUpptackt,
  profil: UNDERSIDA.profil,
  prenumeration: UNDERSIDA.prenumeration,
  inforIntervjun: UNDERSIDA.inforIntervjun,
  /** Alla resultatsidor tills Resultatvy i våg 2 (spec 16.2 fråga 18). */
  resultat: 'Ditt resultat',
} as const

/** Nivån i resultatraden: "grundnivå", "avancerad nivå", "expertnivå", "provläget". */
export const NIVA_I_RAD = {
  grund: 'grundnivå',
  avancerad: 'avancerad nivå',
  expert: 'expertnivå',
  prov: 'provläget',
} as const

/** Raden under resultatets rubrik: "Logiktest, grundnivå. Genomfört 26 september 2026." */
export function resultatRad(test: string, niva: string | null, datum: string | null): string {
  const forsta = niva ? `${test}, ${niva}.` : `${test}.`
  return datum ? `${forsta} Genomfört ${datum}.` : forsta
}

/**
 * Provlägets låsta rad i sidomenyn bär formatet i klartext, så att värdet
 * syns före köpet (spec 16.2 fråga 2, testansvarigs villkor). Aldrig bara
 * "Provläget" med ett lås, aldrig "samma test".
 */
export function provlageFormat(uppgifter: number, minuter: number): string {
  return `Vårt provläge. ${uppgifter} uppgifter, ${minuter} minuter.`
}

/** Bli upptäckt (spec 16.2 fråga 10 och copywriterns rad 8). */
export const BLI_UPPTACKT = {
  rubrik: UNDERSIDA.bliUpptackt,
  radFore:
    'Rekryterare som söker din bakgrund kan hitta dig i kandidatpoolen. Du är anonym tills du själv godkänner en kontakt.',
  radEfter: 'Profilen är anonym och visas för rekryterare.',
  /** Läggs efter radEfter när någon tittat. */
  tittat: (n: number) => (n === 1 ? 'En rekryterare har sett den.' : `${n} rekryterare har sett den.`),
} as const

/** Det lyfta kortet först på golvet, per vy (spec 16.3.2). */
export const LYFT = {
  minaCv: {
    eyebrow: 'Nytt CV',
    titel: 'Ladda upp ett CV',
    text: 'PDF eller Word. Vi använder det i brev, analys och mallar.',
    handling: 'Ladda upp CV',
  },
  minaBrev: {
    eyebrow: 'Nytt brev',
    titel: 'Skriv ett brev mot en annons',
    text: 'Klistra in annonsen, så skriver vi utifrån ditt CV.',
    handling: 'Skapa nytt brev',
  },
  soktaTjanster: {
    eyebrow: 'Nytt',
    titel: 'Logga en sökt tjänst',
    text: 'Företag, tjänst och datum räcker. Vi påminner när det är dags att följa upp.',
  },
  test: {
    titel: (antal: number, minuter: number | string) => `${antal} frågor, cirka ${minuter} minuter`,
    text: 'Du kan pausa. Svaren sparas medan du gör testet.',
  },
  prov: {
    eyebrow: 'Prov',
    titel: (antal: number, minuter: number | string) => `${antal} frågor, cirka ${minuter} minuter, mot klockan`,
    text: 'Ingen förklaring under tiden. Genomgången kommer efter provet.',
  },
  /** Jobbsökets hem i tillstånd A (inget CV), spec 18.3 punkt 2. Barnet är uppladdningen. */
  jobbForstaCv: {
    eyebrow: 'Börja här',
    titel: 'Ladda upp ditt CV',
    text: 'PDF, Word eller text. Namn, telefon och adress maskas innan texten går vidare till någon AI.',
    byggLank: 'Har du inget CV? Bygg ett här',
  },
  /** Jobbsökets hem i tillstånd B (CV finns, inget brev). Kopparknappen flyttad från väggen. */
  jobbForstaBrev: {
    titel: 'Ditt första personliga brev',
    text: 'Ditt CV ligger inne. Klistra in en annons så skriver vi utkastet utifrån det.',
    handling: 'Skapa ditt första brev',
  },
  /** Eyebrow är nivåns namn ("Grund"), titeln till exempel "50 påståenden, cirka 10 minuter". */
  personlighet: {
    titel: (antal: number, minuter: number | string) => `${antal} påståenden, cirka ${minuter} minuter`,
    text: 'Inga rätta svar. Du får en profil, inte ett betyg.',
  },
} as const

/** Brevvyn, B1-skelettet (spec 16.3.2). */
export const BREVVY = {
  redigera: 'Redigera',
  kopiera: 'Kopiera text',
  kopierad: 'Kopierad',
  pdf: 'Ladda ner PDF',
  word: 'Ladda ner Word',
  taBort: 'Ta bort',
  allaBrev: 'Alla dina brev',
} as const
