/**
 * Texterna i CV-rummets nya formspråk (omgång 1, skissen Main, Hem-ny,
 * Hem-oanalyserat och Mobil-hem). Priser, kvoter och betalväggstexter kommer
 * aldrig härifrån: de står i paywall-copy och KampanjPrisKontext.
 *
 * Inga tankstreck, inga engelska gränssnittsord, tal som huvudtal.
 */
import { PAKETRADER } from '@/components/paywall/paywall-copy'
import { FREE_TEMPLATE_COUNT, TEMPLATE_COUNT, talSomOrd } from '@/lib/cv/template-antal'

const stor = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const ANTAL = TEMPLATE_COUNT

const TALORD = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv']
export const talord = (n: number) => TALORD[n] ?? String(n)

/**
 * Siffrorna som står kvar i CV:t (efterrättning A 2026-11-21): [antal] där
 * hon ska skriva sitt eget tal. Ditt CV:s nästa steg, raden vid
 * nedladdningen och arket som frågar före filen. Räknar rader, inte
 * platshållare.
 */
export const SIFFROR = {
  ogon: 'Nästa steg',
  rubrik: 'Fyll i dina siffror',
  text: (n: number) =>
    n === 1
      ? 'En rad väntar på din siffra. Där det står [antal] skriver du ditt eget tal.'
      : `${stor(talord(n))} rader väntar på dina siffror. Där det står [antal] skriver du ditt eget tal.`,
  knapp: 'Fyll i siffrorna',
  rad: (n: number) => (n === 1 ? 'En rad har [antal] kvar.' : `${stor(talord(n))} rader har [antal] kvar.`),
  arkRubrik: (n: number) => `Det står [antal] kvar i ${n === 1 ? 'en rad' : `${talord(n)} rader`}`,
  arkText: 'Arbetsgivaren ser texten precis som den står. Fyll i dina egna siffror först.',
  laddaAnda: 'Ladda ner ändå',
} as const

export const CV_RAD = {
  cv: 'CV:',
  byt: 'Byt CV',
  skapa: 'Skapa nytt',
} as const

export const BYT_ARK = {
  rubrik: 'Byt CV',
  under: 'Välj vilket CV du arbetar med. Det följer med mellan Ditt CV, Mallar och Analys.',
  visasNu: 'Visas nu',
  visa: 'Visa',
  ratext: 'Råtext',
  taBort: 'Ta bort',
  tarBort: 'Tar bort',
  last: PAKETRADER.lastCv,
  utkast: 'Utkast.',
  poang: (p: number) => `${p} av 100.`,
  inteAnalyserat: 'Inte analyserat.',
  andrat: (nar: string) => `Ändrat ${nar}.`,
  nytt: 'Skapa nytt CV',
  bekraftaRubrik: 'Ta bort CV',
  bekrafta: (namn: string) => `${namn} raderas permanent och kan inte återställas.`,
  bekraftaKnapp: 'Ta bort',
} as const

export const NYTT_ARK = {
  rubrik: 'Ett CV till',
  under: 'Ladda upp ett CV du har, eller skriv ett från början på arket.',
  ladda: 'Ladda upp ett CV du har',
  laddaText: 'PDF eller Word, även din LinkedIn-PDF. Vi fyller i avsnitten åt dig.',
  skriv: 'Skriv ditt CV från början',
  skrivText: 'Du skriver direkt på arket, ett avsnitt i taget. Jobbcoachen kan föreslå punkterna.',
  jobb: 'Vilket jobb söker du?',
  jobbPlatshallare: 'Till exempel Kundtjänstmedarbetare',
  borja: 'Börja skriva',
  valjFil: 'Välj fil',
  uppladdningRubrik: 'Ladda upp ett CV',
} as const

export const VAGG = {
  /** Dokumentets väg: gjort i perfekt particip, nästa och kommande som verb. */
  gjord: { uppladdat: 'uppladdat', utkast: 'utkast', analyserat: 'analyserat', atgardat: 'åtgärdat', nedladdat: 'nedladdat' },
  kommer: { borja: 'börja', analysera: 'analysera', atgarda: 'åtgärda', laddaNer: 'ladda ner' },
  lasbarhet: ['av 100 i', 'läsbarhet'] as const,
  inteMatt: ['läsbarheten,', 'inte mätt än'] as const,
  steg: ['steg till ett CV', 'du kan skicka'] as const,
  seMallar: `Se det i ${ANTAL} mallar`,
  exempelMallar: (n: number) => `Exempel-CV i ${talord(n)} av ${ANTAL} mallar`,
  mallChip: (namn: string) => `Mallen ${namn}`,
  inteNedladdat: 'Inte nedladdat än',
  nedladdat: 'Nedladdat',
  bytMall: 'Byt mall',
  arkAlt: (mall: string) => `Ditt CV i mallen ${mall}`,
  exempelAlt: (mall: string) => `Ett exempel-CV i mallen ${mall}`,
  poangAria: (mall: string, p: number) => `Ditt CV i mallen ${mall}. Läsbarhetspoäng ${p} av 100.`,
} as const

export const NASTA = {
  ny: { ogon: 'Börja här', rubrik: 'Två sätt att börja' },
  /**
   * Inga hämtade förslag (lägena analysera och analysera-sparr). Sedan
   * 2026-11-21 är genomgången öppen för alla CV och poängen följer CV:t
   * direkt; det som kostar är att hämta Jobbcoachens förslag.
   */
  analysera: {
    ogon: 'Nästa steg',
    rubrik: 'Se ditt CV som rekryteraren ser det',
    text: 'Rekryterare letar först efter senaste rollen och vad du uppnådde. Genomgången visar vad som drar ner, del för del.',
    knapp: 'Se genomgången',
    sidorad: 'Jobbcoachens förslag ingår en gång gratis.',
    sidoradPremium: 'Jobbcoachens förslag ingår, så ofta du vill.',
    sidoradSparr: 'Poängen räknas om när du sparar.',
  },
  atgarda: {
    ogon: (plus: number) => `Åtgärda först · ger ${plus} poäng`,
    knapp: 'Åtgärda i CV:t',
    sidorad: 'Förslaget är redan skrivet. Du väljer vad som följer med.',
  },
  laddaNer: {
    ogon: 'Nästa steg',
    rubrik: 'Ladda ner ditt CV',
    text: `Välj mall och ladda ner som PDF eller Word. Texten följer med i alla ${ANTAL}.`,
    knapp: 'Välj mall och ladda ner',
    sidorad: 'Du provar fritt och betalar först när du laddar ner en Premiummall.',
  },
  brev: {
    ogon: 'Använd CV:t',
    rubrik: 'Skriv ett personligt brev',
    text: 'Klistra in annonsen, så matchar vi brevet mot ditt CV.',
    knapp: 'Skriv brev',
    sidorad: 'CV:t är nedladdat och klart att skicka.',
    /** Under 100: aldrig klart, pekar på genomgången. */
    sidoradKvar: 'CV:t är nedladdat.',
  },
  utkast: {
    ogon: 'Utkast',
    rubrik: 'Skriv klart ditt CV',
    text: 'Utkastet är sparat. Fortsätt där du slutade, ett avsnitt i taget.',
    sidorad: 'Du laddar ner det när avsnitten är ifyllda.',
  },
} as const

export const PANEL = {
  ogon: 'Så ligger ditt CV till',
  rubrik: 'Tre mått på ditt CV',
  helaAnalysen: 'Hela genomgången',
  lasbarhet: 'Läsbarheten',
  attHamta: (n: number) => `${n} poäng att hämta`,
  inteMatt: 'inte mätt än',
  medForslag: (p: number) => `Med våra förslag: ${p} av 100`,
  medSiffror: (p: number) => `Med dina siffror: ${p} av 100`,
  siffrorSaknas: (n: number) => (n === 1 ? 'Siffran saknas i en rad.' : `Siffrorna saknas i ${talord(n)} rader.`),
  idag: 'i dag',
  idagAria: (nu: number) => `Läsbarhetspoängen är ${nu} av 100 i dag.`,
  potentialAria: (nu: number, med: number) => `Läsbarhetspoängen är ${nu} av 100 i dag och ${med} med våra förslag.`,
  finnsAttHamta: (n: number) => `${n} poäng finns att hämta.`,
  drarNer: (n: number) =>
    n === 0 ? 'Inget drar ner just nu.' : n === 1 ? 'En sak drar ner, och den går att åtgärda på en kväll.' : `${talord(n).charAt(0).toUpperCase()}${talord(n).slice(1)} saker drar ner, alla går att åtgärda på en kväll.`,
  drarNerKort: (n: number) => (n === 0 ? 'Inget drar ner.' : n === 1 ? 'En sak drar ner.' : `${talord(n).charAt(0).toUpperCase()}${talord(n).slice(1)} saker drar ner.`),
  luckaText: 'av 100, så väl ett rekryteringssystem läser ditt CV',
  /** Poängen är under 100 och inget förslag återstår: genomgången visar resten (2026-11-21). */
  kvar: (n: number) => `${n} poäng kvar.`,
  seGenomgangen: 'Se genomgången.',
  /** Bara när CV:t saknar inlästa avsnitt: annars står poängen där (2026-11-21). */
  matsIAnalysen: 'Mäts när avsnitten är inlästa.',
  matsIAnalysenRad: 'De flesta arbetsgivare låter ett rekryteringssystem sortera ansökningarna först.',
  innehall: 'Innehållet',
  avAvsnitt: (n: number) => `av ${n} avsnitt`,
  sprakSaknas: 'Språk saknas.',
  sprakSaknasRad: 'Lägg till språken du kan.',
  allaAvsnitt: 'Alla avsnitt finns.',
  allaAvsnittRad: 'Rekryteraren hittar det hon letar efter.',
  saknas: (namn: string) => `${namn} saknas.`,
  saknasRad: 'Lägg till det i CV:t.',
  oStrukturerat: 'Vi har inte läst in avsnitten än.',
  oStruktureratRad: 'Strukturera CV:t, så ser du vilka avsnitt som finns.',
  strukturera: 'Strukturera nu',
  strukturerar: 'Strukturerar',
  struktureraFel: 'Det gick inte att strukturera CV:t. Försök igen.',
  avsnittNamn: { profil: 'Profil', erfarenhet: 'Erfarenhet', utbildning: 'Utbildning', kompetenser: 'Kompetenser', sprak: 'Språk' },
  mallen: 'Mallen',
  atsSaker: 'ATS-säker',
  dinMallNu: 'Din mall nu',
  testad: 'Testad för rekryteringssystem.',
  bytBland: `Byt bland ${ANTAL} mallar`,
  textenFoljer: ', texten följer med.',
  fler: (n: number) => `+${n}`,
  flerAria: (n: number) => `Byt mall, ${n} mallar till`,
} as const

export const DRAR_NER = {
  rubrik: 'Vad som drar ner, i ordning',
  rad: 'Störst effekt först. Den tyngsta åtgärden ingår gratis, de övriga ingår i Premium.',
  radKort: 'Den tyngsta åtgärden ingår gratis, de övriga ingår i Premium.',
  radPremium: 'Störst effekt först. Alla åtgärder är öppna, med färdiga formuleringar.',
  plus: (n: number) => `+${n} poäng`,
  plusKort: (n: number) => `+${n}`,
  plusAria: (n: number) => `${n} poäng till om det åtgärdas`,
  gratis: 'Ingår gratis',
  premium: 'Premium',
  malTal: (p: number) => `${p}`,
  malRad: (n: number) => `av 100 när ${n === 1 ? 'den' : `alla ${talord(n)}`} är åtgärdade.`.replace('den är åtgärdade', 'den är åtgärdad'),
  malKort: (p: number) => `${p} av 100`,
  malKortRad: (n: number) => (n === 1 ? 'när den är åtgärdad.' : `när alla ${talord(n)} är åtgärdade.`),
  kopRubrik: (n: number) => (n === 1 ? 'Öppna åtgärden, med färdiga formuleringar' : `Öppna alla ${talord(n)} åtgärder, med färdiga formuleringar`),
} as const

export const ANNAN_MALL = {
  rubrik: 'Samma CV, annan mall',
  rad: (mall: string, n: number) => `Du har ${mall}. Så här ser ditt CV ut i ${talord(n)} ${n === 1 ? 'annan' : 'andra'}. Du provar fritt och betalar först när du laddar ner.`,
  radKort: 'Du provar fritt och betalar först när du laddar ner.',
  alla: `Alla ${ANTAL} mallar`,
  allaKort: `Alla ${ANTAL}`,
  dinMall: (kort: string) => `Din mall nu. ${kort}.`,
  gratis: 'Gratis',
  premium: 'Premium',
} as const

export const RADER = {
  brevOgon: 'Använd CV:t',
  brev: 'Skriv ett personligt brev',
  brevText: 'Klistra in annonsen, så matchar vi brevet mot ditt CV.',
  brevTextKort: 'Vi matchar brevet mot ditt CV.',
  brevKnapp: 'Skriv brev',
  sparadeOgon: (n: number, max: number | null) => (max ? `Sparade CV · ${n} av ${max}` : `Sparade CV · ${n}`),
  nytt: 'Ett CV till, för en annan roll',
  nyttText: 'Ladda upp, eller skriv från början på arket.',
  nyttTextKort: 'Ladda upp eller skriv från början.',
  nyttKnapp: 'Skapa nytt CV',
  nyttKnappKort: 'Skapa nytt',
  fulltOgon: 'Sparade CV · fullt',
  byggOgon: 'CV-byggaren',
  bygg: 'Byggt i CV-byggaren',
  byggText: 'Ändra texten och avsnitten där du skrev CV:t.',
} as const

export const NY = {
  panelOgon: 'När CV:t är inne',
  panelRubrik: 'Tre saker du får direkt',
  poang: 'Läsbarhetspoäng',
  poangAv: 'av 100',
  poangRad: 'Så väl läser ett rekryteringssystem ditt CV.',
  poangRad2: 'Du får den direkt, för varje CV.',
  mallar: 'Mallar',
  mallarRad: `Ditt CV i ${ANTAL} mallar.`,
  mallarRad2: `${stor(talSomOrd(FREE_TEMPLATE_COUNT))} är gratis, och du ser alla med ditt eget innehåll innan du väljer.`,
  brev: 'Personligt brev',
  brevRad: 'Brev som utgår från ditt CV.',
  brevRad2: 'Klistra in annonsen, så matchar vi brevet mot det.',
} as const

/**
 * Mallar (steg 2, skissen Mallar och Mobil-mallar). Antal räknas alltid ur
 * katalogen av anroparen; inga tal står här.
 */
export const MALLAR = {
  ogon: (i: number, n: number) => `Vald mall · ${i} av ${n}`,
  gratis: 'Gratis',
  premium: 'Premium',
  foljer: 'Texten följer med när du byter mall, och du ändrar den direkt på arket.',
  exempelFoljer: 'Ett exempel-CV. Lägg in ditt eget, så ser du det i varje mall.',
  andra: 'Ändra texten',
  andraUnder: 'Alla avsnitt',
  typsnitt: 'Typsnitt',
  farg: 'Färg',
  fargVald: (i: number) => `Färg ${i}, vald`,
  ordning: 'Ordning',
  foto: 'Foto',
  laggTill: 'Lägg till',
  fotoPa: 'Foto på',
  verktyg: 'Anpassa mallen',
  format: 'Format',
  wordLast: 'Word, ingår i Premium',
  wordSaknas: 'Word finns inte i den här mallen',
  forra: 'Föregående mall',
  nasta: 'Nästa mall',
  svep: ['Svep för', 'nästa mall'] as const,
  tipsDator: 'Tryck på ett avsnitt för att ändra texten',
  tipsMobil: 'Tryck på en rubrik för att byta den. Tryck på arket för helskärm.',
  arkAlt: (mall: string) => `Ditt CV i mallen ${mall}. Klicka för att läsa i helskärm.`,
  exempelAlt: (mall: string) => `Ett exempel-CV i mallen ${mall}`,
  panelOgon: (n: number) => `Alla ${n} mallar`,
  panelRubrik: 'Ditt eget CV i varje mall',
  panelRubrikExempel: 'Ett exempel-CV i varje mall',
  panelRad: 'Innehållet följer med när du byter mall. Du betalar först när du laddar ner en Premiummall.',
  panelRadKort: 'Du betalar först när du laddar ner en Premiummall.',
  filter: 'Filtrera mallar',
  baraPdf: 'Finns som PDF.',
  sidaAv: (i: number, n: number) => `Sida ${i} av ${n}.`,
  lasHelskarm: 'Läs i helskärm',
  gratisVag: (mall: string) => `Ladda ner gratis i ${mall}`,
  gratisVagRad: 'Samma CV, samma rubriker.',
  premOgon: 'Jobbcoach Premium',
  premRubrik: (n: number) => `Alla ${n} mallar, så ofta du vill`,
  premPunkter: [
    'Ladda ner på nytt varje gång CV:t ändras, som PDF eller Word',
    'Hela CV-analysen, med åtgärden bakom varje rubrik',
    'Personliga brev och alla rekryteringstester',
  ] as const,
  valdMall: 'Vald mall',
  tillArket: 'Till arket',
  exempelLadda: 'Ladda upp ditt CV',
  exempelSkriv: 'Skriv från början',
  exempelRad: 'Nedladdningen öppnar när ditt CV finns här.',
} as const

/** CV-raden under flikarna på telefonen, när det finns fler än ett CV. */
export const CV_RAD_MOBIL = {
  aria: (namn: string) => `CV: ${namn}. Byt CV`,
} as const

/**
 * Spärrarna vid nedladdning i nya utseendet (skissen Sparr-mall-1440 och
 * Mobil-sparr). Eyebrow, brödtext, prisrad och knapp kommer ur paywall-copy;
 * här står bara rubriken per variant, talrutorna och punkterna.
 */
export const SPARR = {
  ditt: (mall: string) => `Ditt CV i ${mall}`,
  exempel: (mall: string) => `Exempel-CV i ${mall}`,
  rubrik: {
    mall: 'Skicka CV:t precis som det ser ut här',
    'cv-export-word': 'Ändra CV:t själv, i Word',
    'cv-export': 'Ladda ner igen, i vilken mall du vill',
  },
  mallar: 'mallar, alla med ditt CV',
  word: 'finns också som Word',
  poang: 'poäng att hämta i analysen',
  talAria: (mallar: number, word: number, poang: number | null) =>
    `${mallar} mallar med ditt CV. ${word} finns också som Word.${poang ? ` ${poang} poäng finns att hämta i analysen.` : ''}`,
  punktFil: (mall: string, word: boolean) => (word ? `${mall} som PDF eller Word` : `${mall} som PDF`),
  punktFilRad: ', filen laddas ner direkt efter köpet',
  punktNy: 'Ladda ner på nytt',
  punktNyRad: ' varje gång CV:t ändras, i vilken mall du vill',
  punktNyRadKort: ' varje gång CV:t ändras',
  punktAnalys: 'Åtgärden bakom varje rubrik',
  punktAnalysRad: ' i analysen, med färdiga formuleringar',
  punktAnalysRadKort: ' i analysen',
  friaRad: (namn: string) => `${namn}. Samma CV, samma rubriker.`,
  stang: 'Stäng',
} as const
