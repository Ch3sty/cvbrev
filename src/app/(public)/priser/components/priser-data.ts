/**
 * Priser-data: server-safe konstanter for /priser-sidan.
 * Prisstegen bor i src/lib/plans/plans.ts och speglas av kortraden här.
 * Driver gratisrad, jamforelsetabell, FAQ och vad-ingar-sektionen.
 */

export const PREMIUM_PRICE = 149
export const PREMIUM_CURRENCY = 'SEK'
export const PREMIUM_STRIPE_PRICE_ID = 'price_1SQSVlPWMWdjmTDjx1yo9m00'
export const TRIAL_DAYS = 7
/** Dagar full Premium varje nytt konto får vid registrering, utan kort. */
export const SIGNUP_TRIAL_DAYS = 5

// === Hero ===

export const PRISER_HERO_TITLE = 'Betala för veckan du söker. Inte för året.'
export const PRISER_HERO_INGRESS =
  'De flesta söker jobb intensivt i några veckor och slutar sedan. Därför säljer vi både korta pass och månadsplan. Välj det som matchar din situation.'

// === Gratisnivån, en textrad under korten ===

export const GRATIS_RAD =
  'Du kan använda Jobbcoach gratis med ett brev om dagen, en CV-analys var tredje dag, alla tester och 12 CV-mallar. Nedladdning och full CV-analys ingår i Premium.'

// === Pris-kort (behålls för vad-ingår-sektionen) ===

export const FREE_HIGHLIGHTS = [
  '1 personligt brev per dag',
  '1 CV-analys var tredje dag',
  '1 LinkedIn-optimering per vecka',
  '12 gratis CV-mallar',
  'Alla tester, en gång per dag och nivå',
  'Jobbcoachen: 10 meddelanden per dag',
  'Jobbmatchning: de 10 bästa träffarna',
] as const

export const PREMIUM_HIGHLIGHTS = [
  'Obegränsade brev och analyser',
  'Alla 42 CV-mallar (30 exklusiva)',
  'Obegränsat testande',
  'Obegränsad jobbcoach-chatt',
  'Smart-anpassad ton (vi läser CV och annons)',
  'Helt obegränsad jobbmatchning',
  'Spara allt du skapar utan tak',
  'Professionell export i Word och PDF',
] as const

// === Jamforelsetabell (full feature-matris) ===

export const COMPARISON_INTRO =
  'Alla fyra alternativen ger samma funktioner. Skillnaden är hur länge.'

export interface ComparisonRow {
  label: string
  free: string
  premium: string
}

export interface ComparisonGroup {
  title: string
  rows: ComparisonRow[]
}

export const COMPARISON: ComparisonGroup[] = [
  {
    title: 'Personliga brev',
    rows: [
      { label: 'Brev per dag', free: '1 brev', premium: 'Obegränsat' },
      { label: 'Sparade brev åt gången', free: '2 brev', premium: 'Obegränsat' },
      { label: 'Brevmallar', free: '3 mallar', premium: 'Alla 7 mallar' },
      {
        label: 'Tonaliteter',
        free: '5 toner',
        premium: '6 toner inkl. Smart-anpassad',
      },
      { label: 'Ladda ner brev som PDF och Word', free: 'Nej', premium: 'Ja' },
    ],
  },
  {
    title: 'CV',
    rows: [
      { label: 'CV-analys', free: '1 var tredje dag', premium: 'Obegränsat' },
      {
        label: 'CV-analys, alla förbättringsförslag',
        free: 'De tre största',
        premium: 'Alla',
      },
      { label: 'Sparade CV-versioner', free: '2 CV', premium: 'Obegränsat' },
      { label: 'CV-mallar', free: '12 mallar', premium: 'Alla 42 mallar' },
      { label: 'Export PDF + Word', free: 'Ett CV, sedan Premium', premium: 'Obegränsat' },
      {
        label: 'CV-byggare med live-förhandsvisning',
        free: 'Ja',
        premium: 'Ja',
      },
    ],
  },
  {
    title: 'LinkedIn',
    rows: [
      {
        label: 'LinkedIn-optimering',
        free: '1 per vecka',
        premium: 'Obegränsat',
      },
      {
        label: 'CV-baserad autofyll',
        free: 'Ja',
        premium: 'Ja',
      },
    ],
  },
  {
    title: 'Rekrytering & matchning',
    rows: [
      {
        label: 'Rekryteringstester',
        free: 'Alla tester, 1 gång per dag och nivå',
        premium: 'Obegränsat testande',
      },
      {
        label: 'Jobbmatchning',
        free: 'De 10 bästa matchningarna',
        premium: 'Helt obegränsad',
      },
      { label: 'Jobbcoachen', free: '10 meddelanden per dag', premium: 'Obegränsat' },
    ],
  },
  {
    title: 'Övrigt',
    rows: [
      { label: 'Svenska arbetsmarknaden', free: 'Ja', premium: 'Ja' },
      { label: 'GDPR-säker, data i EU', free: 'Ja', premium: 'Ja' },
      {
        label: 'Fem dagar Premium vid registrering',
        free: 'Ingår i alla nya konton',
        premium: 'Ja',
      },
    ],
  },
]

// === FAQ ===

export const PRISER_FAQ_ITEMS = [
  {
    q: 'Vad ingår i Premium?',
    a: 'Allt vi har att erbjuda, oavsett vilket av de fyra alternativen du väljer. Obegränsade personliga brev och CV-analyser, alla 42 CV-mallar varav 30 exklusiva, alla sju brevmallar, Smart-anpassad ton, obegränsat testande, obegränsad jobbcoach-chatt, helt obegränsad jobbmatchning och nedladdning i både Word och PDF. Skillnaden mellan alternativen är bara hur länge du har tillgången.',
  },
  {
    q: 'Vad är skillnaden mellan dagspass och prenumeration?',
    a: 'Dagspass och jobbsökarveckan är engångsköp. Du betalar en gång, får full tillgång i 24 timmar respektive sju dagar, och sedan går kontot tillbaka till gratisnivån av sig självt. Inget dras automatiskt. Månads- och kvartalsplanen förnyas tills du säger upp dem.',
  },
  {
    q: 'Får jag testa Premium innan jag betalar?',
    a: 'Ja. Alla nya konton får fem dagar med Premium direkt vid registreringen, utan kort. Efter fem dagar går kontot över till gratisnivån automatiskt. Vill du hellre prova med kort i sju dagar finns det <a href="/trial-signup">här</a>.',
  },
  {
    q: 'Finns det bindningstid eller uppsägningstid?',
    a: 'Nej. Engångsköpen tar slut av sig själva. Prenumerationerna säger du upp när som helst med ett klick i ditt konto. Premium löper då till slutet av perioden du redan betalat för, sedan rullar kontot tillbaka till gratisnivån.',
  },
  {
    q: 'Vad räcker gratisversionen till?',
    a: 'Gratisnivån räcker för att testa verktygen och skicka en ansökan om dagen. Du kan bygga och spara CV, se din ATS-poäng och träna på testerna. Söker du flera jobb i veckan tar kvoterna slut, och då är Premium det som gör skillnad.',
  },
  {
    q: 'Vad händer om jag avslutar Premium?',
    a: 'Inget dramatiskt. Brev och CV du redan skapat finns kvar. Du kan hantera två sparade brev och två CV på gratisnivå. Nya skapanden begränsas till gratis-kvoterna. Du kan när som helst aktivera Premium igen, eller köpa ett dagspass när du behöver ladda ner något.',
  },
  {
    q: 'Är det säkert att lämna mina personliga uppgifter?',
    a: 'Ja. Vi följer GDPR, all data lagras i EU och vi säljer aldrig din information vidare. Du kan radera ditt konto med ett klick. Då försvinner allt, även våra kopior. Vi använder inte ditt CV eller dina brev för att träna någon modell.',
  },
  {
    q: 'Hur skiljer sig Jobbcoach.ai från ChatGPT?',
    a: 'ChatGPT är ett generellt språkverktyg utan koll på svenska arbetsmarknaden, ATS-system eller hur rekryterare faktiskt sållar ansökningar. Vi är byggda för exakt det. Våra verktyg läser ditt CV, matchar mot annonsens krav och optimerar för de system som svenska arbetsgivare använder.',
  },
]

// === Vad ingar i Premium (8 funktioner) ===

export interface VadIngarItem {
  iconKey:
    | 'cv'
    | 'analys'
    | 'brev'
    | 'linkedin'
    | 'jobbmatch'
    | 'tester'
    | 'coach'
    | 'mallar'
  title: string
  body: string
}

export const VAD_INGAR: VadIngarItem[] = [
  {
    iconKey: 'cv',
    title: 'CV-byggare',
    body:
      'Steg-för-steg-flöde med live-förhandsvisning. 12 mallar gratis, alla 42 i Premium.',
  },
  {
    iconKey: 'analys',
    title: 'CV-analys',
    body:
      'ATS-poäng, nyckelords-koll och konkreta förbättringsförslag på struktur och språk.',
  },
  {
    iconKey: 'brev',
    title: 'Personligt brev',
    body:
      'Vi läser annonsen och ditt CV och skriver brev som matchar. Sju mallar, sex toner.',
  },
  {
    iconKey: 'linkedin',
    title: 'LinkedIn-optimering',
    body:
      'Profil som matchar drömrollen, baserat på ditt CV. Hjälper rekryterare hitta dig.',
  },
  {
    iconKey: 'jobbmatch',
    title: 'Jobbmatchning',
    body:
      'Vi matchar dig mot annonser från Arbetsförmedlingen och JobTech med procentuell träffsäkerhet.',
  },
  {
    iconKey: 'tester',
    title: 'Rekryteringstester',
    body:
      'Tester som speglar de vanligaste på svenska arbetsmarknaden. Träna varje dag, obegränsat i Premium.',
  },
  {
    iconKey: 'coach',
    title: 'Jobbcoachen',
    body:
      'Vår karriärcoach svarar på frågor om CV, brev, intervju och förhandling. Obegränsad chatt i Premium.',
  },
  {
    iconKey: 'mallar',
    title: 'Alla mallar',
    body:
      '42 CV-mallar och sju brevmallar, från klassisk och minimalistisk till executive och kreativ. 30 av mallarna är exklusiva för Premium.',
  },
]
