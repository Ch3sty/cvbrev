/**
 * Texterna i mallflödet. Ordagrant ur skissen (docs/design/skiss-mallar-2026-11-15.html,
 * version 4) där de finns; resten skrivna av copywritern (svensk-ux-copywriter,
 * 2026-11-16). Inga antal, mallnamn eller priser som siffror här: de kommer ur
 * katalogen (src/lib/cv/mallval/katalog.ts) och plans.ts via funktionerna.
 *
 * Klientsäker, ren data.
 */
import type { Familj, Ordning, Sektion } from '@/lib/cv/mallar/kontrakt'
import type { ForslagSkal } from '@/lib/cv/mallval/forslag'

const ORD = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv']

/** Antal 1 till 12 som ord, siffror från 13 (copywriterns regel). */
export function antalOrd(n: number, versal = false): string {
  const o = n >= 0 && n <= 12 ? ORD[n] : String(n)
  return versal ? o.charAt(0).toUpperCase() + o.slice(1) : o
}

/**
 * Tillägget om Word efter nivån. Sedan 2026-11-16 är Word gratis i
 * gratismallarna och ingår i Premium i de övriga, så "även som Word" är
 * sant i båda nivåerna. Parametern gratis står kvar för anroparna.
 */
export function wordTillagg(_gratis: boolean, word: boolean): string {
  return word ? ', även som Word' : ''
}

/** "a, b och c" */
export function lista(delar: readonly string[]): string {
  if (delar.length <= 1) return delar[0] ?? ''
  return `${delar.slice(0, -1).join(', ')} och ${delar[delar.length - 1]}`
}

const versal = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

export const DOK = {
  tips: 'Tryck på en rubrik för att byta den',
  klickaHelskarm: 'Klicka på arket för att läsa i helskärm',
  sidan2: 'Sidan 2 börjar här',
  sidanBorjar: (n: number) => `Sidan ${n} börjar här`,
  sidaAv: (i: number, n: number) => `Sida ${i} av ${n}`,
  /** Helskärmen medan sidorna ur PDF:en hämtas (skissen V4b). */
  sidorLaddar: 'Delar upp i sidor, precis som i PDF:en',
  /** Helskärmen när sidorna inte gick att hämta: hela CV:t i ett stycke. */
  sidorFel: 'Sidorna gick inte att visa just nu. Här är hela CV:t i ett stycke.',
  nypZoom: 'Nyp för att zooma. Svep på miniatyrerna för nästa mall.',
  mallAv: (namn: string, i: number, n: number) => `${namn}, ${i} av ${n}`,
  svep: 'svep för nästa mall',
  /** Raden under arket (granskningen B3): mobil med svep, dator utan. */
  radMobil: (namn: string, i: number, n: number) => `${namn}, ${i} av ${n} · svep för nästa mall`,
  radDator: (namn: string, i: number, n: number) => `${namn}, ${i} av ${n}`,
  stang: 'Stäng',
  zooma: 'Zooma',
  helskarm: 'Läs i helskärm',
  sidor: (n: number) => (n === 1 ? '1 sida' : `${n} sidor`),
} as const

export const KOLUMN = {
  visaAlla: (n: number) => `Visa alla ${n} mallar`,
  visaFarre: 'Visa färre',
} as const

export const REMSA = {
  foreslagna: 'Föreslagna för dig',
  gratis: 'Gratis',
  alla: (n: number) => `Alla ${n}`,
  niva: { gratis: 'Gratis', premium: 'Premium' },
} as const

export const SKAL: Record<ForslagSkal, string> = {
  intyg: 'Du har många intyg, så de visas först.',
  kort: 'Du är tidigt i yrkeslivet, så utbildningen visas först.',
  system: 'Du har många system och verktyg, så kompetenserna visas först.',
  lang: 'Du har lång erfarenhet, så mallar med plats för mer visas först.',
  ingen: 'Ett urval som passar de flesta CV:n, gratismallen först.',
}

export const VERKTYG = {
  typsnitt: 'Typsnitt',
  typsnittUnder: 'Byts direkt i dokumentet bakom. Alla är gratis.',
  typsnittFot: 'Elva typsnitt i tre grupper. I Word-filen används de som finns i Word.',
  typsnittAts: 'läses av alla system',
  farg: 'Färg',
  foto: 'Foto',
  fotoPa: 'Foto på',
  ordning: {
    standard: 'Standard',
    intyg: 'Intyg först',
    utbildning: 'Utbildning först',
    kompetenser: 'Kompetenser först',
  } satisfies Record<Ordning, string>,
} as const

/** Valen som fungerar i alla mallar (skissen, yta 6), som arket från ordningschippen. */
export const VAL_ARK = {
  rubrik: 'Ordning i ditt CV',
  under: 'Vad som kommer först. Fungerar i alla mallar.',
  ordning: {
    standard: { namn: 'Standard', text: 'Profil och erfarenhet först, som de flesta CV:n.' },
    intyg: { namn: 'Intyg först', text: 'Legitimation, behörigheter och körkort som första avsnitt.' },
    utbildning: { namn: 'Utbildning först', text: 'Utbildning före erfarenhet, för dig med kort yrkesliv.' },
    kompetenser: { namn: 'Kompetenser först', text: 'Kompetenserna i spalter högst upp, erfarenheten under.' },
  } satisfies Record<Ordning, { namn: string; text: string }>,
  enSida: { namn: 'Få plats på en sida', text: 'Tätare marginaler och mindre text, samma mall.' },
  rubriker: { namn: 'Rubriker efter yrke', text: 'Rubriker som din bransch känner igen, byts med ett tryck.' },
  fargTypsnitt: { namn: 'Färg och typsnitt', text: 'Mallens färger och alla typsnitt. Gratis.' },
} as const

export const RUBRIK_ARK = {
  over: {
    profil: 'Rubrik över din profil',
    erfarenhet: 'Rubrik över din erfarenhet',
    utbildning: 'Rubrik över din utbildning',
    kompetenser: 'Rubrik över dina kompetenser',
    intyg: 'Rubrik över dina intyg',
    sprak: 'Rubrik över dina språk',
    projekt: 'Rubrik över dina projekt',
    intressen: 'Rubrik över dina intressen',
    referenser: 'Rubrik över dina referenser',
  } satisfies Record<Sektion, string>,
  egen: 'Skriv egen rubrik',
  egenPlats: 'Din egen rubrik, högst 40 tecken',
  tillbaka: 'Tillbaka till förslagen',
  foljer: 'Rubriken följer med i PDF och Word.',
  klar: 'Klar',
} as const

export const UPPSATTNING_ARK = {
  rubrik: 'Rubriker efter yrke',
  under: 'Välj det yrkesområde som ligger närmast, så byts alla rubriker på en gång. Varje rubrik går att ändra för sig efteråt.',
} as const

export const MALL_ARK = {
  passar: 'Passar bäst för',
  word: 'Finns som PDF och Word. Mallen och båda formaten ingår i Premium.',
  wordGratis: 'Finns som PDF och Word. Du väljer format när du laddar ner, båda är gratis i den här mallen.',
  baraPdf: 'Finns som PDF. De konstnärliga mallarna finns bara som PDF, de övriga också som Word.',
  valj: 'Välj mallen',
} as const

export const ALLA_ARK = {
  rubrik: 'Alla mallar',
  sok: 'Sök mall eller yrke',
  tom: 'Ingen mall matchar din sökning. Prova ett annat ord, eller',
  tomLank: 'visa alla',
  filter: { alla: 'Alla', gratis: 'Gratis', word: 'Word', foto: 'Foto', tva: 'Två spalter', enSida: 'En sida' },
  familj: {
    'en-spalt': 'En spalt',
    marginal: 'Period i marginalen',
    sidospalt: 'Två spalter',
    konstnarlig: 'Mer form och färg',
  } satisfies Record<Familj, string>,
  visa: 'Visa',
  visaRubrik: 'Visa mallar',
} as const

export const FORMAT = {
  pdf: 'PDF',
  word: 'Word',
  klar: 'klar att skicka',
  wordPremium: 'ingår i Premium',
  wordIngarPremium: 'Word ingår i Premium',
} as const

export const KNAPP = {
  laddaNer: (format: 'pdf' | 'docx') => (format === 'docx' ? 'Ladda ner Word' : 'Ladda ner PDF'),
  laddaNerIPremium: (format: 'pdf' | 'docx', mall: string, pris: string) =>
    `Ladda ner ${format === 'docx' ? 'Word' : 'PDF'} i ${mall}, Premium ${pris}`,
  /** Premiumknappen i två avsiktliga rader (granskningen V3): handlingen, sedan priset. */
  laddaNerIMall: (format: 'pdf' | 'docx', mall: string) => `Ladda ner ${format === 'docx' ? 'Word' : 'PDF'} i ${mall}`,
  premiumPris: (pris: string) => `Premium ${pris}`,
  laddaNerIPremiumInloggad: (format: 'pdf' | 'docx', mall: string, pris: string) =>
    `Ladda ner ${format === 'docx' ? 'Word' : 'PDF'} i ${mall} med Premium, ${pris}`,
  gratisI: (mall: string) => `Ladda ner gratis i ${mall}`,
  gratisUnder: 'Samma CV, samma rubriker',
  skaparPdf: 'Skapar PDF',
  skaparWord: 'Skapar Word',
  fortsatt: 'Fortsätt med ditt CV',
  sparaOchLaddaNer: 'Spara och ladda ner PDF',
} as const

export const UPPLADDNING = {
  rubrikMobil: 'Ladda upp ditt CV',
  underMobil: 'Släpp filen här eller välj den. PDF eller Word.',
  rubrikDator: 'Dra hit ditt CV',
  underDator: 'eller välj en fil. PDF eller Word, högst 5 MB.',
  slapp: 'Släpp filen här',
  valjFil: 'Välj fil',
  bytFil: 'Byt fil',
  ellerNamn: 'eller skriv ditt namn och börja från början',
  ellerNamnKort: 'eller skriv ditt namn',
  namn: 'Ditt namn',
  titel: 'Din titel',
  namnSaknas: 'Skriv ditt namn högst upp, så kommer det med i filen.',
  laddar: 'Läser ditt CV',
  laddarLangsamt: 'Det tar lite längre än vanligt, några sekunder till.',
  forStor: 'Filen är över 5 MB. Spara om den som en mindre PDF och försök igen, eller skriv ditt namn och fyll i direkt.',
  felTyp: 'Vi läser PDF och Word. Välj en sådan fil, eller skriv ditt namn och fyll i direkt.',
  kvotRubrik: 'Dagens uppladdningar är slut',
  kvotSlut: 'I morgon går det igen. Du kan skriva ditt namn och fylla i direkt, eller skapa ett konto och ladda upp där.',
  takRubrik: 'Många laddar upp just nu',
  tak: 'Vi har nått dagens tak, i morgon går det igen. Skriv ditt namn och fyll i direkt, eller skapa ett konto och ladda upp där.',
  skapaKonto: 'Skapa konto',
  bildPdfRubrik: 'Den här PDF:en är en bild',
  bildPdfText: 'Skannade filer läser vi först när du har ett konto. Du kan fylla i ditt CV direkt, eller skapa konto så läser vi filen.',
  bildPdfFyll: 'Fyll i direkt',
  bildPdfKonto: 'Skapa konto så läser vi filen',
  delvis: (hittade: string, saknas: string) =>
    `Vi hittade ${hittade}. ${versal(saknas)} saknas. Tryck på plusset i dokumentet för att fylla i, eller ladda upp en annan fil.`,
  annanFil: 'Ladda upp en annan fil',
  natfel: 'Filen kom inte fram. Försök igen, eller skriv ditt namn och fyll i direkt.',
  forsokIgen: 'Försök igen',
  robot: 'Robotkontrollen gick inte igenom. Ladda om sidan och försök igen, eller skriv ditt namn och fyll i direkt.',
  klar: (hittade: string) => `Vi hittade ${hittade}.`,
  /** Delarna i "Vi hittade ...", i dokumentets ordning. */
  delar: {
    kontakt: 'kontaktuppgifter',
    erfarenhet: 'erfarenhet',
    utbildning: 'utbildning',
    kompetenser: 'kompetenser',
    intyg: 'intyg',
    sprak: 'språk',
  },
} as const

export const KONTO_ARK = {
  rubrik: 'Ladda ner ditt CV',
  under: 'Skapa ett konto, så följer ditt CV med.',
  google: 'Fortsätt med Google',
  googleOppnar: 'Öppnar Google',
  googleFel: 'Google-inloggningen gick inte att starta. Försök igen.',
  eller: 'eller',
  epost: 'E-post',
  losen: 'Lösenord',
  losenHjalp: 'Minst 8 tecken',
  knapp: 'Skapa konto och ladda ner',
  knappKop: 'Skapa konto och gå till kassan',
  harKonto: 'Har du redan ett konto?',
  loggaIn: 'Logga in',
  vagGratis: (mall: string) => `Ditt CV i ${mall}, gratis. Filen kommer direkt när kontot är klart.`,
  vagKop: (mall: string, pris: string) =>
    `När kontot är klart går du till kassan. Premium ger dig ${mall} och alla andra mallar för ${pris}.`,
  /** Under kampanjen (affärsgranskningen R6). */
  kampanjFotnot: 'Kampanjpriset gäller konton som inte haft Premium tidigare.',
  sparar: 'Sparar ditt CV och skapar filen',
  fel: {
    epost: 'Skriv en e-postadress, till exempel namn@exempel.se.',
    losen: 'Lösenordet behöver vara minst 8 tecken.',
    finns: 'Det finns redan ett konto med den här adressen. Logga in, så följer ditt CV med.',
    allman: 'Det gick inte att skapa kontot just nu. Försök igen om en stund.',
  },
} as const

export const FOTO_ARK = {
  rubrik: 'Foto',
  text: 'Lägg till foto när du skapat konto. Du kan ladda ner utan foto nu.',
  konto: 'Skapa konto och lägg till foto',
  utan: 'Fortsätt utan foto',
  nu: 'Kontot är klart. Nu kan du lägga till foto.',
  valj: 'Välj foto',
  byt: 'Byt foto',
  taBort: 'Ta bort',
  fel: 'Fotot gick inte att ladda upp. Försök igen eller välj en annan bild.',
} as const

export const AVSNITT = {
  tomma: {
    profil: '+ Skriv några rader om dig',
    erfarenhet: '+ Lägg till ett jobb',
    utbildning: '+ Lägg till utbildning',
    kompetenser: '+ Lägg till kompetenser',
    intyg: '+ Lägg till intyg',
    sprak: '+ Lägg till språk',
    projekt: '+ Lägg till ett projekt',
    intressen: '+ Lägg till intressen',
    referenser: '+ Lägg till referenser',
  } satisfies Record<Sektion, string>,
  rubrik: {
    profil: 'Profil',
    erfarenhet: 'Erfarenhet',
    utbildning: 'Utbildning',
    kompetenser: 'Kompetenser',
    intyg: 'Intyg',
    sprak: 'Språk',
    projekt: 'Projekt',
    intressen: 'Intressen',
    referenser: 'Referenser',
  } satisfies Record<Sektion, string>,
  spara: 'Spara',
  taBort: 'Ta bort',
  laggTill: 'Lägg till',
  avbryt: 'Avbryt',
  taBortAvsnitt: 'Avsnittet tas bort från CV:t. Du kan lägga till det igen.',
} as const

export const FINAL = {
  klar: 'Klart. Ditt CV är nedladdat.',
  fil: (filnamn: string, mall: string, sidor: number) => `${filnamn}, ${mall}, ${DOK.sidor(sidor)}`,
  oppna: 'Öppna',
  dela: 'Dela',
  forstaJobbet: 'Första jobbet som matchar ditt CV',
  flerJobb: 'Se fler jobb som matchar',
  brevTillAnnons: 'Skriv personligt brev till annonsen',
  brevRubrik: 'Ditt CV är klart. Nu brevet.',
  brevRad: 'Klistra in annonsen, så matchar vi brevet mot ditt CV.',
  brevKnapp: 'Skriv ett personligt brev',
  jobbEtikett: (titel: string, var_: string, lank: boolean) =>
    `${[titel, var_].filter(Boolean).join(', ')}. ${lank ? 'Öppna annonsen i ny flik' : 'Se jobbet i Dina matchningar'}`,
} as const

export const MERFORSALJNING = {
  rubrik: 'Ditt CV i en annan mall?',
  under: (filnamn: string, mall: string, antal: number) =>
    `Du har ${filnamn} i ${mall}. Så här ser samma CV ut i ${antalOrd(antal)} andra. Tryck på den du vill ha.`,
  kampanj: (pris: string, ordinarie: string) => `Just nu ${pris}. Ordinarie ${ordinarie}.`,
  allaPaEnSida: 'Allt på en sida',
  wordRad: 'I Premium laddar du ner på nytt varje gång CV:t ändras, som PDF eller Word.',
  knapp: (mall: string, pris: string) => `Ladda ner i ${mall}, Premium ${pris}`,
  nejTack: (mall: string) => `Nej tack, behåll ${mall}`,
} as const

export const BYT_CV = {
  chip: (namn: string) => `CV: ${namn}`,
  rubrik: 'Byt CV',
  under: 'Välj vilket CV du vill se i mallarna.',
  last: 'Låst. Fler CV:n ingår i Premium.',
  tomt: 'Du har inget CV än. Ladda upp ett, eller skapa ett från början.',
  ladda: 'Ladda upp CV',
  skapa: 'Skapa CV',
} as const

export const ARTIKEL = {
  ey: 'Så ser ditt CV ut i våra mallar',
  under: 'Skriv ditt namn så ser du det direkt.',
  uppladdning: 'Har du redan ett CV? Se det i alla mallar.',
  laddaUpp: 'Ladda upp',
  fotrad: (gratis: number) => `${antalOrd(gratis, true)} ${gratis === 1 ? 'mall är' : 'mallar är'} gratis. Alla ingår i Premium.`,
  mallrad: (gratis: boolean, word: boolean) =>
    `${gratis ? 'Gratis' : 'Ingår i Premium'}${wordTillagg(gratis, word)}`,
  yrkesrad: (yrke: string) =>
    `Rubrikerna för ${yrke} följer med i alla mallar, även de som ingår i Premium. Svep för att se fler.`,
} as const

export const PROVA = {
  ey: 'CV-mallar',
  rubrik: 'Se ditt CV i våra mallar',
  ingress: (n: number, g: number) => `Ladda upp ditt CV så ser du det i ${n} ATS-säkra mallar. ${antalOrd(g, true)} är gratis.`,
} as const
