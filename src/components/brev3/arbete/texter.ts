/**
 * Texterna i arbetsläget (Skriv brev, Brevet, Målgången) som skissen inte
 * har eller som används på flera ställen. Skissens texter står ordagrant.
 * Spärrtexter, pris och köpknapp kommer aldrig härifrån, utan ur
 * paywall-copy.ts och plans.ts.
 */

export const TONER = [
  { id: 'balanced', namn: 'Balanserad', rad: 'Saklig men varm' },
  { id: 'professional', namn: 'Professionell', rad: 'Saklig och formell' },
  { id: 'confident', namn: 'Självsäker', rad: 'Leder med resultat' },
  { id: 'enthusiastic', namn: 'Entusiastisk', rad: 'Varm, energisk' },
  { id: 'creative', namn: 'Kreativ', rad: 'Vågar sticka ut' },
] as const

export type TonId = (typeof TONER)[number]['id'] | 'auto'

export const TON_AUTO = {
  namn: 'Vi väljer ton åt dig',
  radPremium: 'Efter annonsens ton',
  lasRad: (premium: string) => `Automatiskt tonval ingår i ${premium}.`,
  lasLank: 'Se vad som ingår',
}

/** "första", "andra" ... för raden "Meningen läggs sist i tredje stycket." */
const ORDNINGSTAL = ['första', 'andra', 'tredje', 'fjärde', 'femte', 'sjätte', 'sjunde', 'åttonde', 'nionde', 'tionde']
export function ordningstal(i: number): string {
  return ORDNINGSTAL[i] ?? `${i + 1}:e`
}

export const SKRIV = {
  rubrik: 'Nytt brev',
  underradTom: 'Klistra in annonsen',
  bladRubrik: 'Annonsen och valen',
  bladSidorad: 'Allt går att ändra efteråt',
  annons: 'Annonsen',
  bytAnnons: 'Byt annons',
  platshallare: 'Klistra in annonsen här, hela texten. Vi läser ut kraven och skriver brevet mot ditt CV.',
  forKort: 'Fortsätt skriva. Mer av annonsen ger ett bättre brev.',
  franMatchning: (titel: string, foretag: string) => `Annonsen kom från jobbmatchningen: ${titel} hos ${foretag}.`,
  franMatchningUtanForetag: (titel: string) => `Annonsen kom från jobbmatchningen: ${titel}.`,
  kravRubrik: 'Krav vi läst ut ur annonsen',
  kravRubrikMobil: 'Krav ur annonsen',
  kravSvar: (n: number, av: number) => `${n} av ${av} har fått svar`,
  tonen: 'Tonen',
  byggerPa: 'Brevet bygger på',
  bytCv: 'Byt CV',
  valjCv: 'Välj CV',
  skrivBrevet: 'Skriv brevet',
  vantar: 'Läser annonsens krav mot ditt CV. Tar 10 till 15 sekunder.',
  /** Raden under mätaren medan brevet spelas upp stycke för stycke. */
  spelar: 'Brevet skrivs mot kraven i annonsen.',
  skriverBrevet: 'Skriver brevet',
  skriverStycke: (n: number, av: number) => `Skriver stycke ${n} av ${av}`,
  arkRadSamma: (mall: string) => `${mall}, samma mall som ditt CV.`,
  arkRadAnnan: (mall: string) => `Brevet skrivs i ${mall}.`,
  arkRadSlut: 'Du provar andra mallar när brevet är klart.',
  telefonArkRad: (mall: string) => `Brevet skrivs i mallen ${mall}. Du provar andra mallar när det är klart.`,
  kvotDetHar: 'Det här är veckans gratisbrev.',
  kvotNasta: (dag: string) => `Nästa ${dag}.`,
  kvotSlut: (dag: string) => `Nästa gratisbrev ${dag}.`,
  kvotSlutRubrik: 'Veckans gratisbrev är skrivet.',
  utanTak: (premium: string) => `Utan tak i ${premium}`,
  felRad: 'Brevet kunde inte skrivas. Annonsen ligger kvar.',
  natverksfel: 'Nätverket svarade inte. Annonsen ligger kvar.',
  forsokIgen: 'Försök igen',
  arkEtikett: (mall: string) => `Brevet i mallen ${mall}`,
  arkEtikettSkriver: (mall: string, n: number, av: number) => `Brevet skrivs i mallen ${mall}. ${n} av ${av} stycken är klara.`,
  arbetsgivaren: 'Arbetsgivaren',
  tjanstenDuSoker: 'tjänsten du söker',
  cvLast: 'Låst på gratisnivån',
  namnRubrik: 'Vilket namn ska stå under brevet?',
  namnText: 'Det står i brevhuvudet och under hälsningen.',
  namnKnapp: 'Spara och skriv brevet',
}

export const BREVET = {
  rubrik: (foretag: string | null) => (foretag ? `Ditt brev till ${foretag}` : 'Ditt brev'),
  rubrikMobil: (foretag: string | null) => foretag ?? 'Ditt brev',
  klart: 'Brevet klart',
  avsnitt: [
    { id: 'kraven', namn: 'Kraven' },
    { id: 'texten', namn: 'Texten' },
    { id: 'ton', namn: 'Ton och språk' },
    { id: 'typsnitt', namn: 'Typsnitt' },
    { id: 'info', namn: 'Titel och företag' },
  ] as const,
  // Kraven
  kravRubrik: 'Kraven i annonsen',
  kravRubrikUtanAnnons: 'Kraven',
  kravSidorad: (n: number, av: number) => `${n} av ${av} har fått svar i brevet`,
  kravSidoradMobil: (n: number, av: number) => `${n} av ${av}`,
  saknasRad: 'Står i annonsen men inte i brevet.',
  saknasPlats: 'En mening med ett exempel ur ditt CV räcker.',
  saknasEtikett: (krav: string) => `Skriv en mening om ${krav.toLocaleLowerCase('sv-SE')}`,
  saknasLaggs: (stycke: string) => `Meningen läggs sist i ${stycke} stycket. Du ser den på arket direkt.`,
  laggTill: 'Lägg till i brevet',
  laggerTill: 'Lägger till',
  laggTillFel: 'Meningen kunde inte läggas till. Försök igen.',
  allaSvar: 'Brevet svarar på alla krav vi hittade i annonsen.',
  ingaKrav:
    'Vi kunde inte läsa ut tydliga krav ur den här annonsen. Läs annonsen en gång till och se att brevet svarar på det viktigaste.',
  /** Brev utan annons (startflödet): det finns inga krav att mäta mot. */
  ingenAnnons:
    'Brevet skrevs utan annons, så det finns inga krav att mäta det mot. Klistra in annonsen när du skriver nästa brev, så visar vi var brevet svarar på kraven.',
  arkRadKrav: 'Siffrorna visar var brevet svarar på kraven.',
  arkRadKravSlut: 'Tryck på ett stycke på arket för att ändra texten.',
  arkRadText: 'Arket följer texten medan du skriver.',
  arkRadTextSlut: 'Tryck på ett stycke för att ändra det.',
  // Texten
  textRubrik: 'Texten',
  textSidorad: 'Sparas av sig själv',
  halsning: 'Hälsningen',
  stycke: (i: number) => `Stycke ${i + 1}`,
  laggTillStycke: 'Lägg till ett stycke',
  taBortStycket: 'Ta bort stycket',
  ord: 'ord',
  langdEtikett: (andel: number) =>
    andel > 1 ? 'Brevet går över till sida två.' : `Brevet fyller ${Math.round(andel * 100)} procent av en sida.`,
  overSida: 'Går över till sida två',
  overSidaRad: 'Rekryterare läser sällan längre än en sida. Korta ett stycke.',
  textFot: 'Ändringen sparas av sig själv och gäller i alla mallar.',
  // Ton och språk
  tonRubrik: 'Ton och språk',
  tonSidorad: 'Brevet skrivs om med AI',
  sprak: 'Språket',
  skrivOmRad: 'Brevet skrivs om från början i den nya tonen. Ändringar du gjort i texten ersätts.',
  skrivOm: 'Skriv om brevet',
  skriverOm: 'Skriver om brevet',
  kvotRaknas: 'Det räknas som veckans gratisbrev.',
  skrivOmFel: 'Brevet kunde inte skrivas om. Texten är oförändrad.',
  annonsSaknas: 'Annonsen finns inte kvar i brevet, så det går inte att skriva om det.',
  /** Skriv om på ett brev som aldrig hade någon annons (startflödet). */
  annonsSaknasFranStart: 'Brevet skrevs utan annons, och en omskrivning behöver annonsen. Skriv ett nytt brev med annonsen, eller ändra texten för hand.',
  cvSaknas: 'CV:t brevet byggde på finns inte kvar, så det går inte att skriva om det.',
  // Typsnitt
  typsnittRubrik: 'Typsnitt',
  typsnittSidorad: 'Gäller PDF och Word',
  mallensEget: 'Mallens eget',
  mallensEgetRad: (mall: string) => `Typsnittet som hör till ${mall}`,
  typsnittWord: 'Moderna typsnitt syns i PDF. I Word krävs att typsnittet finns på datorn.',
  // Titel och företag
  infoRubrik: 'Titel och företag',
  titel: 'Titel',
  titelHjalp: 'Namnet du ser i listan över dina brev.',
  titelPlats: 'Ansökningsbrev',
  foretag: 'Företag',
  foretagPlats: 'Företagsnamn',
  tjanst: 'Tjänst',
  tjanstPlats: 'Jobbtitel',
  foretagHjalp: 'Företag och tjänst följer med när du loggar brevet i Sökta tjänster.',
  mottagare: 'Mottagare',
  mottagareHjalp: 'Namn på den du skriver till, om det står i annonsen',
  mottagarePlats: 'Till exempel Maria Ekström, rekryterande chef',
  taBort: 'Ta bort brevet',
  taBortTitel: 'Ta bort brevet?',
  taBortText: (titel: string) => `Brevet ${titel} raderas permanent och kan inte återställas.`,
  taBortKnapp: 'Ta bort',
  taBortFel: 'Brevet kunde inte tas bort. Försök igen.',
  // Foten
  kopiera: 'Kopiera text',
  kopierad: 'Texten är kopierad',
  kopieraFel: 'Texten kunde inte kopieras. Markera den på arket i stället.',
  word: 'Word',
  pdf: 'Ladda ner PDF',
  skaparFil: 'Skapar filen',
  barePdf: 'Den här mallen finns som PDF',
  gratisRad: 'Läs och kopiera ingår gratis.',
  gratisRadSlut: 'PDF och Word.',
  gratisRadMobil: (premium: string) => `Läs och kopiera ingår gratis. PDF och Word ingår i ${premium}.`,
  filFel: 'Filen kunde inte skapas. Försök igen om en stund.',
  kopEjRegistrerat: 'Vi väntar på bekräftelsen av ditt köp. Ladda om sidan om en liten stund, så hämtas filen.',
  // Sökt
  harDuSkickat: 'Har du skickat ansökan?',
  harDuSkickatRad: 'Brevet, annonsen och datumet hamnar i Sökta tjänster.',
  harDuSkickatRadUtanAnnons: 'Brevet och datumet hamnar i Sökta tjänster.',
  markeraSokt: 'Markera som sökt',
  markerar: 'Sparar',
  soktFel: 'Det gick inte att spara. Försök igen.',
  soktSedan: (dag: string) => `Brevet ligger i Sökta tjänster sedan ${dag}.`,
  oppna: 'Öppna',
  // Låst
  lastRad: 'Det här brevet är låst på gratisnivån. Du kan läsa och kopiera det.',
  // Sparning
  sparFel: 'Ändringen kunde inte sparas. Vi försöker igen när du skriver nästa gång.',
  sparFelLast: 'Brevet är låst och kan inte ändras.',
  sparFelPremium: (premium: string) => `Det valet ingår i ${premium} och sparades inte.`,
  gammaltBrev: 'Brevet är skrivet i en äldre mall. När du ändrar något flyttas det till den nya brevmallen.',
}

export const SKICKAT = {
  ogon: (dag: string, foretag: string | null) => (foretag ? `Sökt ${dag} · ${foretag}` : `Sökt ${dag}`),
  rubrik: 'Ansökan är skickad',
  ingress: 'Brevet, annonsen och datumet ligger i Sökta tjänster, så du kan följa upp när det är dags.',
  ingressUtanAnnons: 'Brevet och datumet ligger i Sökta tjänster, så du kan följa upp när det är dags.',
  skrivNasta: 'Skriv nästa brev',
  oppnaSokta: 'Öppna Sökta tjänster',
  ansokningar: (n: number) => (n === 1 ? 'ansökan skickad' : 'ansökningar skickade'),
  manad: (m: string) => `i ${m}`,
  pipsEtikett: (skickade: number, totalt: number) => `${skickade} av dina ${totalt} brev är skickade`,
  stampel: (dag: string) => `Sökt ${dag}`,
  vantar: 'Medan du väntar på svar',
  tester: { rubrik: 'Träna inför testet', text: 'Kommer det ett rekryteringstest före intervjun är du förberedd. Tio minuter om dagen.' },
  intervju: { rubrik: 'Förbered intervjun', text: 'Öva på frågorna som brukar komma, så att du har svaren klara när de ringer.' },
  nastaBrev: { rubrik: 'Skriv nästa brev', text: 'Klistra in nästa annons, så skriver vi brevet mot ditt CV.' },
  nastaGratis: (dag: string) => `Nästa gratisbrev ${dag}.`,
  arkEtikett: 'Brevets väg är klar: annonsen, brevet, genomläsningen och skickat.',
  arkEtikettUtanAnnons: 'Brevets väg är klar: tjänsten, brevet, genomläsningen och skickat.',
}

export type FlikId = (typeof BREVET.avsnitt)[number]['id']
const FLIKAR: readonly string[] = BREVET.avsnitt.map((a) => a.id)
export function arFlik(v: unknown): v is FlikId {
  return typeof v === 'string' && FLIKAR.includes(v)
}
