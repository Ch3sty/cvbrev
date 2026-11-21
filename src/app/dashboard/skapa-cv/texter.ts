/**
 * Texterna i CV-byggaren "Direkt på arket". Ordagrant ur skissen
 * (docs/design/skiss-cv-byggare-2026-11-16.html) där de finns; resten i
 * samma ton. Svenska facktermer, inga tankstreck, aldrig ordet AI.
 * Klientsäker, ren data.
 */
import type { Sektion } from '@/lib/cv/mallar/kontrakt'
import type { FlerAvsnitt } from '@/lib/cv/bygg/modell'
import { antalOrd } from '@/components/cv/Dokument/texter'

export const BYGG = {
  titel: 'Bygg ditt CV',
  sparar: 'Sparar',
  sparat: 'Sparat',
  sparFel: 'Kunde inte spara',
  forsokIgen: 'Försök igen',
  testdata: 'Fyll i testdata',
  /** Raden ovanför arket första gången (skissen yta 2). */
  tips: 'Grå text är exempel och följer inte med i filen. Tryck på ett avsnitt för att fylla i.',
  fler: '+ Fler avsnitt: intyg, projekt, intressen',
  tillbakaMinaCv: 'Tillbaka till Ditt CV',
} as const

export const START = {
  rubrik: 'Vilket jobb söker du?',
  under: 'Rubrikerna och förslagen följer titeln.',
  titel: 'Yrkestitel',
  titelPlats: 'Till exempel Kundtjänstmedarbetare',
  ladda: 'Ladda upp ett CV du har',
  laddaUnder: 'PDF eller Word, även din LinkedIn-PDF. Vi fyller i avsnitten åt dig.',
  laddaUnderDator: 'Dra hit filen eller välj den. PDF eller Word, även din LinkedIn-PDF.',
  skriv: 'Skriv från början',
  stangUppladdning: 'Skriv från början i stället',
  laddar: 'Läser ditt CV',
  minaCv: 'Tillbaka till Ditt CV',
} as const

/** Den guidade luckan i den fasta raden (skissen yta 2). */
export const LUCKA = {
  nasta: 'Nästa',
  rad: {
    namn: 'Ditt namn och din e-post',
    innehall: 'Ett jobb, eller en utbildning',
  },
  knapp: {
    namn: 'Fyll i namn och e-post',
    erfarenhet: 'Lägg till ett jobb',
    utbildning: 'Lägg till utbildning',
  },
} as const

/** Ett förslag i taget ovanför den fasta raden, med Hoppa över (skissen yta 4). */
export const FORSLAG: Record<'erfarenhet' | 'utbildning' | 'kompetenser' | 'profil' | 'sprak', string> = {
  erfarenhet: 'Lägg till ett jobb, även extrajobb och praktik räknas.',
  utbildning: 'Lägg till din utbildning, även gymnasiet räknas.',
  kompetenser: 'Lägg till kompetenser, så hittar fler system dig.',
  profil: 'Skriv några rader om dig, det är det första rekryteraren läser.',
  sprak: 'Lägg till språken du kan.',
}
export const HOPPA_OVER = 'Hoppa över'

export const BLAD = {
  avsnittAv: (i: number, n: number) => `Avsnitt ${i} av ${n}`,
  valfritt: 'Valfritt.',
  spara: 'Spara',
  sparar: 'Sparar',
  angra: 'Ångra',
  andra: 'Ändra',
  taBort: {
    erfarenhet: 'Ta bort jobbet',
    utbildning: 'Ta bort utbildningen',
    intyg: 'Ta bort intyget',
    projekt: 'Ta bort projektet',
    sprak: 'Ta bort',
  },
  borttagen: {
    erfarenhet: 'Jobbet är borttaget.',
    utbildning: 'Utbildningen är borttagen.',
    intyg: 'Intyget är borttaget.',
    projekt: 'Projektet är borttaget.',
  },
  lista: {
    erfarenhet: 'Dina jobb',
    utbildning: 'Din utbildning',
  },
  listaUnder: 'Tryck på ett för att ändra det.',
  utanNamn: { erfarenhet: 'Jobb utan titel', utbildning: 'Utbildning utan namn' },
} as const

export const ERF = {
  titel: 'Titel',
  arbetsgivare: 'Arbetsgivare',
  ort: 'Ort (valfritt)',
  fran: 'Från',
  till: 'Till',
  manad: 'Månad',
  ar: 'År',
  pagaende: 'Pågående',
  punkter: 'Punkter (en per rad)',
  arFel: 'Skriv året med fyra siffror, till exempel 2022.',
} as const

export const UTB = {
  utbildning: 'Utbildning',
  skola: 'Skola',
  fran: 'Från (år)',
  till: 'Till (år)',
  beskrivning: 'Lägg till beskrivning',
  beskrivningEtikett: 'Beskrivning (valfritt)',
} as const

export const KOMP = {
  falt: 'Lägg till en kompetens',
  plats: 'Skriv och tryck Enter',
  laggTill: 'Lägg till',
  foreslagna: 'Föreslagna',
  taBort: (k: string) => `Ta bort ${k}`,
  tomt: 'Inga kompetenser än. Skriv en, eller tryck på ett förslag.',
} as const

export const SPRAK = {
  sprak: 'Språk',
  niva: 'Nivå',
  ingenNiva: 'Ingen nivå angiven',
  lagg: '+ Lägg till språk',
} as const

export const HUVUD_BLAD = {
  telefonHint: 'Rekryteraren ringer oftast.',
  namnFel: 'Skriv ditt namn, så kommer det med i filen.',
  epostFel: 'Skriv din e-post, till exempel namn@exempel.se.',
} as const

export const PROFIL_BLAD = {
  etikett: 'Några rader om dig',
} as const

/** Jobbcoachen i bladen (skissen yta 3). Pennan är symbolen, aldrig ordet AI. */
export const COACH = {
  punkter: 'Skriv punkter åt mig',
  punkterOm: 'Skriv om punkterna',
  punkterKlar: (n: number) => `Jobbcoachen skrev ${antalOrd(n)} ${n === 1 ? 'punkt' : 'punkter'}. Ändra fritt.`,
  punkterKraver: 'Fyll i titel och arbetsgivare först, så vet Jobbcoachen vad jobbet gällde.',
  profil: 'Skriv ett förslag åt mig',
  profilOm: 'Skriv om förslaget',
  profilKlar: 'Jobbcoachen skrev ett förslag. Ändra fritt.',
  profilKraver: 'Fyll i en titel eller ett jobb först, så har Jobbcoachen något att utgå från.',
  komp: 'Föreslå kompetenser utifrån mina jobb',
  kompKlar: (n: number) => `Jobbcoachen föreslår ${antalOrd(n)} till. Tryck på dem du vill ha.`,
  skriver: 'Skriver',
  tid: 'Det tog för lång tid, försök igen.',
  fel: 'Jobbcoachen kunde inte skriva just nu. Försök igen.',
  /** Gratis: förslag kvar på kontot (tre per konto). */
  kvar: (n: number) => `${n === 1 ? 'Ett förslag' : `${antalOrd(n, true)} förslag`} kvar i gratisnivån.`,
  /** Premiums dygnstak. */
  tak: 'Dagens förslag är använda. I morgon skriver Jobbcoachen igen, och du kan skriva själv direkt.',
  /** Kortet i bladet (arbetsläget, byggspecen avsnitt 7). */
  kort: {
    punkter: 'Jobbcoachen skriver punkterna åt dig',
    punkterUnder: 'Utifrån titeln och arbetsgivaren. Du ändrar fritt efteråt.',
    punkterOm: 'Låt Jobbcoachen skriva om punkterna',
    punkterOmUnder: 'Med resultat och nyckelord, utifrån det du har skrivit.',
    profil: 'Jobbcoachen skriver profilen åt dig',
    profilOm: 'Låt Jobbcoachen skriva om profilen',
    komp: 'Jobbcoachen föreslår kompetenser',
    kompUnder: 'Utifrån din titel och dina jobb. Du väljer vilka som kommer med.',
  },
  kvotRad: (kvar: number, av: number) => `${kvar} av ${av} gratis förslag kvar.`,
  kvotBild: (anvanda: number, av: number) => `${anvanda} av ${av} gratis förslag är använda`,
  premium: 'Premium',
  premiumText: 'Jobbcoachen skriver punkter till alla dina jobb, profilen och kompetenserna.',
  premiumTextKort: 'Punkter till alla jobb, profilen och kompetenserna.',
} as const

export const FLER_BLAD = {
  rubrik: 'Fler avsnitt',
  under: 'Lägg till det som passar ditt yrke.',
  val: {
    intyg: { namn: 'Intyg och behörigheter', text: 'Körkort, legitimation, certifikat och kurser' },
    projekt: { namn: 'Projekt', text: 'Egna projekt, uppdrag och praktikarbeten' },
    intressen: { namn: 'Intressen', text: 'Det du gör på fritiden, kort' },
  } satisfies Record<FlerAvsnitt, { namn: string; text: string }>,
  intygNamn: 'Intyg',
  intygUtfardare: 'Utfärdare',
  intygAr: 'År',
  projektNamn: 'Projekt',
  projektText: 'Beskrivning',
  intressen: 'Intressen, med komma emellan',
  laggIntyg: '+ Lägg till intyg',
  laggProjekt: '+ Lägg till ett projekt',
} as const

/**
 * Arbetsläget (skisserna Redigera-1440, Bygg-1440, Mobil-redigera): EN vy
 * för att ändra ett CV eller skriva ett nytt. Ordagrant ur skissen där den
 * har text.
 */
export const ARBETE = {
  redigera: 'Redigera ditt CV',
  bygg: 'Bygg ditt CV',
  klar: 'Klar',
  bytMall: 'Byt mall',
  mallBricka: (mall: string) => `Mallen ${mall}. Byt mall`,
  tillbaka: {
    mallar: 'Tillbaka till mallarna',
    'ditt-cv': 'Tillbaka till Ditt CV',
    analys: 'Tillbaka till analysen',
  },
  stang: 'Stäng och gå till Ditt CV',
  avsnittAv: (i: number) => `Avsnitt ${i} av 5`,
  stapel: (klara: number, nu: string | null) =>
    `${klara === 0 ? 'Inget' : klara === 1 ? 'Ett' : antalOrd(klara, true)} av fem avsnitt ifyllda${nu ? `, du skriver ${nu}` : ''}.`,
  avsnittsrad: 'Avsnitt i ditt CV',
  flikar: {
    kontakt: 'Kontakt',
    profil: 'Profil',
    erfarenhet: 'Erfarenhet',
    utbildning: 'Utbildning',
    kompetenser: 'Kompetenser',
    sprak: 'Språk',
    fler: '+ Fler',
  },
  flerEtikett: 'Fler avsnitt',
  duAndrar: 'Du ändrar här',
  synsDirekt: 'Syns direkt',
  underArk: (mall: string, i: number, n: number) => `${mall}, ${i} av ${n}.`,
  underArkRad: 'Tryck på ett annat avsnitt på arket för att ändra det.',
  gratText: 'Grå text är exempel',
  gratTextRad: 'och följer inte med i filen.',
  arkTitel: (mall: string) => `Ditt CV i mallen ${mall}`,
  fotRedigera: 'Ändringen syns direkt på arket och gäller i alla mallar.',
  fotBygg: 'Du kan ladda ner när namn, e-post och ett jobb eller en utbildning finns.',
  fotByggKlar: 'Ändringen syns direkt på arket.',
  sparaJobbet: 'Spara jobbet',
  avbryt: 'Avbryt',
  jobbAntal: (n: number) => `${n} jobb, det senaste först`,
  utbAntal: (n: number) => `${n === 1 ? 'En utbildning' : `${antalOrd(n, true)} utbildningar`}, den senaste först`,
  jobbAv: (i: number, n: number) => `Jobb ${i} av ${n}`,
  utbAv: (i: number, n: number) => `Utbildning ${i} av ${n}`,
  nyttJobb: 'Nytt jobb',
  nyUtb: 'Ny utbildning',
  extrajobb: 'Även extrajobb och praktik räknas',
  gymnasiet: 'Även gymnasiet räknas',
  laggJobb: 'Lägg till ett jobb',
  laggUtb: 'Lägg till en utbildning',
  taBortJobbPa: (f: string) => (f ? `Ta bort jobbet på ${f}` : 'Ta bort jobbet'),
  taBortUtbPa: (s: string) => (s ? `Ta bort utbildningen på ${s}` : 'Ta bort utbildningen'),
  nastaJobb: (namn: string) => `Nästa jobb, ${namn}`,
  nastaUtb: (namn: string) => `Nästa utbildning, ${namn}`,
  nasta: 'Nästa',
  nastaKontakt: 'Fyll i ditt namn och din e-post.',
  visaBladet: 'Visa bladet',
  fallIhop: 'Fäll ihop bladet',
  ort: 'Ort',
} as const

/** Ångra-raden efter en borttagning, i åtta sekunder. */
export const ANGRA_SEK = 8

export function sektionsnamn(s: Sektion): string {
  const n: Record<Sektion, string> = {
    profil: 'Profil',
    erfarenhet: 'Erfarenhet',
    utbildning: 'Utbildning',
    kompetenser: 'Kompetenser',
    intyg: 'Intyg',
    sprak: 'Språk',
    projekt: 'Projekt',
    intressen: 'Intressen',
    referenser: 'Referenser',
  }
  return n[s]
}
