/**
 * /exempel-hubens server-safe konstanter.
 * Speglar yrkes-listan i /cv-exempel/[yrke] och /personligt-brev-exempel/[yrke].
 */

export const TOTAL_CV_YRKEN = 89
export const TOTAL_BREV_YRKEN = 89
export const TOTAL_EXEMPEL = TOTAL_CV_YRKEN + TOTAL_BREV_YRKEN

// Kategori-konstanter
export type KategoriSlug =
  | 'vard'
  | 'tech'
  | 'ekonomi'
  | 'service'
  | 'utbildning'
  | 'offentlig-sektor'
  | 'hantverk'

export interface Kategori {
  slug: KategoriSlug
  namn: string
  iconKey: 'vard' | 'tech' | 'ekonomi' | 'service' | 'utbildning' | 'offentlig' | 'hantverk'
  kortBeskrivning: string
  introIngress: string
  yrken: string[] // slugs som finns i båda gallerierna
  cvBaraYrken?: string[] // bara i CV-galleriet
  brevBaraYrken?: string[] // bara i brev-galleriet
}

export const KATEGORIER: Kategori[] = [
  {
    slug: 'vard',
    namn: 'Vård och omsorg',
    iconKey: 'vard',
    kortBeskrivning: 'Sveriges största arbetsgivare med hög efterfrågan',
    introIngress:
      'Vården och omsorgen är Sveriges största arbetsmarknad och en av de mest stabila branscherna. Här hittar du exempel på CV och personliga brev för 20+ yrken inom vård, omsorg och socialt arbete. Alla våra exempel är skrivna med svenska rekryterare i åtanke och innehåller de kompetenser och erfarenheter som faktiskt efterfrågas i jobbannonserna.',
    yrken: [
      'underskoterska',
      'sjukskoterska',
      'specialistsjukskoterska',
      'lakare',
      'barnmorska',
      'fysioterapeut',
      'psykolog',
      'kurator',
      'personlig-assistent',
      'hemtjanst',
      'hemtjanstpersonal',
      'vardbitrade',
      'aldreboende',
      'vardadministrator',
      'boendestod',
      'socialsekreterare',
      'lss-handlaggare',
      'barnskotare',
      'stodpedagog',
    ],
  },
  {
    slug: 'tech',
    namn: 'Tech och IT',
    iconKey: 'tech',
    kortBeskrivning: 'Mjukvara, devops, ingenjörsroller och digital produkt',
    introIngress:
      'Tech-branschen är där lönerna stiger snabbast och konkurrensen om talangerna är som hårdast. Här hittar du exempel på CV och personliga brev för utvecklare, ingenjörer, projektledare och produktansvariga. Vi har tagit hänsyn till hur både ATS-system och tekniska rekryterare läser ansökningar. Nyckelord, mätbara resultat och tekniska stackar är på plats.',
    yrken: [
      'systemutvecklare',
      'devops-engineer',
      'scrum-master',
      'projektledare-it',
      'it-konsult',
      'produktchef',
      'ingenjor',
      'civilingenjor',
      'automationsingenior',
      'konstruktor',
      'it-tekniker',
    ],
  },
  {
    slug: 'ekonomi',
    namn: 'Ekonomi och finans',
    iconKey: 'ekonomi',
    kortBeskrivning: 'Redovisning, controlling, lön och rådgivning',
    introIngress:
      'Ekonomiroller kräver tydliga ansökningar där siffror och resultat står i centrum. Vi har samlat exempel på CV och personliga brev för redovisningsekonomer, controllers, ekonomiassistenter, löneadministratörer och kundrådgivare. Varje exempel visar hur du presenterar både den tekniska kompetensen och affärsförståelsen som rekryterare letar efter.',
    yrken: [
      'ekonom',
      'redovisningsekonom',
      'controller',
      'ekonomiassistent',
      'loneadministrator',
      'kundradgivare',
      'account-manager',
    ],
  },
  {
    slug: 'service',
    namn: 'Handel och service',
    iconKey: 'service',
    kortBeskrivning: 'Butik, restaurang, hotell, kundtjänst och servicemedarbetare',
    introIngress:
      'Service- och handelsyrken handlar om människor, och det ska din ansökan visa. Våra exempel för butikssäljare, kundtjänstmedarbetare, servitriser, kockar, baristas och receptionister visar hur du lyfter fram social kompetens, försäljningsförmåga och servicekänsla på ett sätt som rekryterare uppskattar. Många av exemplen passar både för dig som söker första jobbet och för dig med flera års erfarenhet.',
    yrken: [
      'butikssaljare',
      'butiksbitrade',
      'butikschef',
      'sommarjobb',
      'gymnasieelev',
      'kassorska',
      'servitris-restaurangbitrade',
      'kock',
      'koksbitrade',
      'konditor',
      'bartender',
      'barista',
      'receptionist',
      'hotellvard',
      'kundtjanst',
      'kundtjanstmedarbetare',
      'servicemedarbetare',
      'saljare',
      'telefonforsaljare',
      'diskare',
      'stadare',
      'vaktare',
      'vaktmastare',
      'chauffor',
    ],
  },
  {
    slug: 'utbildning',
    namn: 'Utbildning och pedagogik',
    iconKey: 'utbildning',
    kortBeskrivning: 'Lärare, förskola, fritids och specialpedagogik',
    introIngress:
      'Pedagogiska yrken kräver ansökningar som visar både ämneskompetens och människoförståelse. Vi har samlat exempel för förskollärare, grundskollärare, specialpedagoger, fritidspedagoger och elevassistenter. Varje exempel speglar Skolverkets riktlinjer och hur svenska kommuner och friskolor faktiskt sållar bland ansökningarna.',
    yrken: [
      'forskollarare',
      'grundskollarare',
      'larare',
      'specialpedagog',
      'fritidspedagog',
      'fritidsledare',
      'elevassistent',
      'barnskotare',
      'student',
    ],
  },
  {
    slug: 'offentlig-sektor',
    namn: 'Administration och offentlig sektor',
    iconKey: 'offentlig',
    kortBeskrivning: 'Handläggare, assistent, HR och chefspositioner',
    introIngress:
      'Offentlig sektor och administrativa roller kräver ansökningar med tydlig struktur, formell ton och konkreta exempel på handlingskraft. Vi har samlat exempel för handläggare, administrativa assistenter, HR-specialister, chefer, projektledare och kontorsassistenter. Mallarna är anpassade för både stat, kommun, region och privata bolag.',
    yrken: [
      'handlaggare',
      'administrator',
      'administrativ-assistent',
      'kontorsassistent',
      'hr-specialist',
      'chef',
      'enhetschef',
      'lagerchef',
      'teamledare',
      'projektledare',
      'logistiker',
      'logistikassistent',
      'lagerarbetare',
      'truckforare',
      'terminalarbetare',
      'fastighetsskotare',
      'lokalvardare',
      'socionom',
    ],
  },
  {
    slug: 'hantverk',
    namn: 'Hantverk och bygg',
    iconKey: 'hantverk',
    kortBeskrivning: 'Snickare, elektriker och andra yrken med yrkesbevis',
    introIngress:
      'Hantverks- och byggyrken rekryterar på yrkesbevis, säkerhetsutbildningar och dokumenterat hantverk. Här hittar du exempel på CV och personliga brev för snickare och elektriker, skrivna med branschens egna begrepp: yrkesbevis via BYN, ECY-certifikat, ID06 och säkerhetsutbildningar som Heta arbeten. Exemplen fungerar för både utbildade hantverkare, lärlingar och dig som söker till byggservice.',
    yrken: [
      'snickare',
      'elektriker',
    ],
  },
]

// Hjalp-funktion: hitta kategori for en yrkes-slug
export function getKategoriForYrke(yrkesSlug: string): Kategori | null {
  for (const kat of KATEGORIER) {
    if (kat.yrken.includes(yrkesSlug)) return kat
  }
  return null
}

// Populara yrken pa hub-sidan (12 utvalda for grid)
export interface PopulartYrke {
  slug: string
  namn: string
  kategoriSlug: KategoriSlug
  kategoriNamn: string
  iconKey: Kategori['iconKey']
  hasCV: boolean
  hasBrev: boolean
}

export const POPULARA_YRKEN: PopulartYrke[] = [
  { slug: 'underskoterska', namn: 'Undersköterska', kategoriSlug: 'vard', kategoriNamn: 'Vård', iconKey: 'vard', hasCV: true, hasBrev: true },
  { slug: 'sjukskoterska', namn: 'Sjuksköterska', kategoriSlug: 'vard', kategoriNamn: 'Vård', iconKey: 'vard', hasCV: true, hasBrev: true },
  { slug: 'larare', namn: 'Lärare', kategoriSlug: 'utbildning', kategoriNamn: 'Utbildning', iconKey: 'utbildning', hasCV: true, hasBrev: true },
  { slug: 'forskollarare', namn: 'Förskollärare', kategoriSlug: 'utbildning', kategoriNamn: 'Utbildning', iconKey: 'utbildning', hasCV: true, hasBrev: true },
  { slug: 'systemutvecklare', namn: 'Systemutvecklare', kategoriSlug: 'tech', kategoriNamn: 'Tech', iconKey: 'tech', hasCV: true, hasBrev: true },
  { slug: 'ingenjor', namn: 'Ingenjör', kategoriSlug: 'tech', kategoriNamn: 'Tech', iconKey: 'tech', hasCV: true, hasBrev: true },
  { slug: 'ekonomiassistent', namn: 'Ekonomiassistent', kategoriSlug: 'ekonomi', kategoriNamn: 'Ekonomi', iconKey: 'ekonomi', hasCV: true, hasBrev: true },
  { slug: 'redovisningsekonom', namn: 'Redovisningsekonom', kategoriSlug: 'ekonomi', kategoriNamn: 'Ekonomi', iconKey: 'ekonomi', hasCV: true, hasBrev: true },
  { slug: 'butikssaljare', namn: 'Butikssäljare', kategoriSlug: 'service', kategoriNamn: 'Service', iconKey: 'service', hasCV: true, hasBrev: true },
  { slug: 'receptionist', namn: 'Receptionist', kategoriSlug: 'service', kategoriNamn: 'Service', iconKey: 'service', hasCV: true, hasBrev: true },
  { slug: 'projektledare', namn: 'Projektledare', kategoriSlug: 'offentlig-sektor', kategoriNamn: 'Administration', iconKey: 'offentlig', hasCV: true, hasBrev: true },
  { slug: 'hr-specialist', namn: 'HR-specialist', kategoriSlug: 'offentlig-sektor', kategoriNamn: 'Administration', iconKey: 'offentlig', hasCV: true, hasBrev: true },
]

// FAQ for hub-sidan
export const EXEMPEL_FAQ_ITEMS = [
  {
    q: 'Hur många yrkes-exempel har ni?',
    a: 'Vi har 75 CV-exempel och 75 personliga brev-exempel, totalt 150 yrkes-specifika mallar fördelade över sex stora kategorier. Mallarna täcker allt från vård och omsorg till tech, ekonomi, handel, utbildning och offentlig sektor. Varje yrke har dessutom egen tips-lista och vanliga frågor som hjälper dig att skräddarsy din egen ansökan.',
  },
  {
    q: 'Är exemplen gratis att använda?',
    a: 'Ja. Alla våra exempel är helt kostnadsfria att läsa och inspireras av. Du behöver inte skapa konto för att se dem. Vill du sedan bygga ditt eget CV eller personliga brev med våra verktyg så registrerar du dig gratis och får två brev per dag och en CV-analys var tredje dag utan att betala något.',
  },
  {
    q: 'Hur väljer jag rätt exempel för mitt yrke?',
    a: 'Sök efter ditt exakta yrke i listan eller välj den kategori som passar bäst. Hittar du inte just din titel kan du välja ett närliggande yrke i samma bransch. En förskollärare och grundskollärare kan till exempel hämta inspiration från varandras exempel, och en kundrådgivare kan kika på exemplet för account manager. Strukturen och språket är ofta överförbart inom samma område.',
  },
  {
    q: 'Vad menar ni med ATS-optimerade exempel?',
    a: 'ATS står för Applicant Tracking System och är de program som flesta större arbetsgivare använder för att sålla bland ansökningar. Våra exempel är skrivna med tydliga rubriker, vanlig text utan svår formattering, och de nyckelord som rekryterare faktiskt söker efter. Det betyder att din ansökan har större chans att nå hela vägen till en mänsklig läsare.',
  },
  {
    q: 'Kan jag kopiera exemplen rakt av?',
    a: 'Vi rekommenderar att du använder dem som inspiration, inte som färdiga mallar. Rekryterare läser hundratals brev och känner snabbt igen kopior. Bygg ditt eget innehåll utifrån strukturen, men byt ut detaljerna mot dina egna erfarenheter, dina egna siffror och dina egna styrkor.',
  },
  {
    q: 'Hur ofta uppdateras exemplen?',
    a: 'Vi går igenom samtliga exempel minst en gång per år och uppdaterar dem så att de speglar nuvarande språkbruk, branschtermer och de krav som syns i aktuella jobbannonser. När en ny standard etableras (till exempel inom ATS-optimering) uppdaterar vi alla relevanta exempel på en gång.',
  },
  {
    q: 'Skiljer sig CV-exempel och personligt brev-exempel?',
    a: 'Ja, de fyller olika roller. CV:t är en strukturerad lista över din kompetens och erfarenhet. Exemplen visar hur du sätter rätt rubriker, kvantifierar resultat och får med relevanta nyckelord. Det personliga brevet är din chans att förklara varför just du passar för rollen. Där visar exemplen tonalitet, struktur och hur du knyter ditt CV mot annonsens krav.',
  },
  {
    q: 'Har ni exempel på hur jag skiljer mig från andra sökande?',
    a: 'Varje yrkes-sida har en sektion som heter "Varför detta fungerar" där vi förklarar exakt vad som gör just det exemplet starkt. Du får också konkreta tips för det specifika yrket: vilka mätbara resultat som imponerar, vilka termer som rekryterare letar efter, och vilka klassiska misstag du bör undvika.',
  },
]
