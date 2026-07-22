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
  | 'industri'
  | 'ekonomi'
  | 'service'
  | 'logistik'
  | 'utbildning'
  | 'offentlig-sektor'
  | 'hantverk'
  | 'student'

export interface Kategori {
  slug: KategoriSlug
  namn: string
  iconKey:
    | 'vard'
    | 'tech'
    | 'industri'
    | 'ekonomi'
    | 'service'
    | 'logistik'
    | 'utbildning'
    | 'offentlig'
    | 'hantverk'
    | 'student'
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
      'lss-handlaggare',
      'stodpedagog',
    ],
  },
  {
    slug: 'tech',
    namn: 'IT och utveckling',
    iconKey: 'tech',
    kortBeskrivning: 'Utvecklare, IT-drift, produkt och agila roller',
    introIngress:
      'IT-branschen är där lönerna stiger snabbast och konkurrensen om talangerna är som hårdast. Här hittar du exempel på CV och personliga brev för utvecklare, IT-tekniker, agila roller och produktansvariga. Vi har tagit hänsyn till hur både ATS-system och tekniska rekryterare läser ansökningar. Nyckelord, mätbara resultat och tekniska stackar är på plats.',
    yrken: [
      'systemutvecklare',
      'devops-engineer',
      'scrum-master',
      'projektledare-it',
      'it-konsult',
      'produktchef',
      'it-tekniker',
    ],
  },
  {
    slug: 'industri',
    namn: 'Teknik och industri',
    iconKey: 'industri',
    kortBeskrivning: 'Civilingenjörer, konstruktion och automation',
    introIngress:
      'Ingenjörsyrkena kräver ansökningar som visar både tekniskt djup och förmåga att driva projekt i tvärfunktionella team. Här hittar du exempel för civilingenjörer, konstruktörer och automationsingenjörer, med CAD-system, beräkningsmetoder och kvantifierade projektresultat skrivna som svenska teknikrekryterare vill läsa dem.',
    yrken: ['civilingenjor', 'ingenjor', 'automationsingenior', 'konstruktor'],
  },
  {
    slug: 'ekonomi',
    namn: 'Ekonomi och HR',
    iconKey: 'ekonomi',
    kortBeskrivning: 'Redovisning, controlling, lön, HR och rådgivning',
    introIngress:
      'Ekonomiroller kräver tydliga ansökningar där siffror och resultat står i centrum. Vi har samlat exempel på CV och personliga brev för redovisningsekonomer, controllers, ekonomiassistenter, löneadministratörer och kundrådgivare. Varje exempel visar hur du presenterar både den tekniska kompetensen och affärsförståelsen som rekryterare letar efter.',
    yrken: [
      'ekonom',
      'redovisningsekonom',
      'controller',
      'ekonomiassistent',
      'loneadministrator',
      'kundradgivare',
      'administrativ-assistent',
      'hr-specialist',
    ],
  },
  {
    slug: 'service',
    namn: 'Butik, restaurang och service',
    iconKey: 'service',
    kortBeskrivning: 'Butik, restaurang, hotell, kundtjänst och säkerhet',
    introIngress:
      'Service- och handelsyrken handlar om människor, och det ska din ansökan visa. Våra exempel för butikssäljare, kundtjänstmedarbetare, servitriser, kockar, baristas och receptionister visar hur du lyfter fram social kompetens, försäljningsförmåga och servicekänsla på ett sätt som rekryterare uppskattar. Många av exemplen passar både för dig som söker första jobbet och för dig med flera års erfarenhet.',
    yrken: [
      'butikssaljare',
      'butiksbitrade',
      'butikschef',
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
      'account-manager',
      'teamledare',
      'diskare',
      'stadare',
      'lokalvardare',
      'vaktare',
    ],
  },
  {
    slug: 'logistik',
    namn: 'Lager, logistik och transport',
    iconKey: 'logistik',
    kortBeskrivning: 'Lager, truck, terminal, transport och flödesansvar',
    introIngress:
      'Lager- och logistikyrkena bemannar en av Sveriges snabbast växande sektorer, och ansökningarna vinner på exakthet: truckkort med klass, system du plockat i, volymer du hanterat och leveransprecision du hållit. Här hittar du exempel för lagerarbetare, truckförare, terminalarbetare, chaufförer och logistikroller med samordningsansvar.',
    yrken: [
      'lagerarbetare',
      'truckforare',
      'terminalarbetare',
      'lagerchef',
      'logistiker',
      'logistikassistent',
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
    ],
  },
  {
    slug: 'offentlig-sektor',
    namn: 'Administration och offentlig sektor',
    iconKey: 'offentlig',
    kortBeskrivning: 'Handläggare, chefer, socialt arbete och administration',
    introIngress:
      'Offentlig sektor och administrativa roller kräver ansökningar med tydlig struktur, formell ton och konkreta exempel på handlingskraft. Vi har samlat exempel för handläggare, administratörer, socialsekreterare, chefer, projektledare och kontorsassistenter. Mallarna är anpassade för både stat, kommun, region och privata bolag.',
    yrken: [
      'handlaggare',
      'administrator',
      'kontorsassistent',
      'chef',
      'enhetschef',
      'projektledare',
      'socialsekreterare',
      'socionom',
    ],
  },
  {
    slug: 'hantverk',
    namn: 'Hantverk, bygg och fastighet',
    iconKey: 'hantverk',
    kortBeskrivning: 'Snickare, elektriker, fastighetsskötsel och vaktmästeri',
    introIngress:
      'Hantverks-, bygg- och fastighetsyrken rekryterar på yrkesbevis, säkerhetsutbildningar och dokumenterat hantverk. Här hittar du exempel på CV och personliga brev för snickare, elektriker, fastighetsskötare och vaktmästare, skrivna med branschens egna begrepp: yrkesbevis via BYN, ECY-certifikat, ID06 och säkerhetsutbildningar som Heta arbeten. Exemplen fungerar för både utbildade hantverkare, lärlingar och dig som arbetar med drift och skötsel av fastigheter.',
    yrken: [
      'snickare',
      'elektriker',
      'fastighetsskotare',
      'vaktmastare',
    ],
  },
  {
    slug: 'student',
    namn: 'Student och första jobbet',
    iconKey: 'student',
    kortBeskrivning: 'Sommarjobb, extrajobb och det första riktiga CV:t',
    introIngress:
      'Utan lång arbetslivserfarenhet skrivs ansökan på det du faktiskt har: studier, föreningsliv, prao och tydlig tillgänglighet. Här hittar du exempel för studenter, gymnasieelever och dig som söker sommarjobb, byggda för att visa ansvar och arbetsvilja i stället för att be om ursäkt för en kort meritlista.',
    yrken: ['student', 'gymnasieelev', 'sommarjobb'],
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
  { slug: 'ingenjor', namn: 'Ingenjör', kategoriSlug: 'industri', kategoriNamn: 'Teknik', iconKey: 'industri', hasCV: true, hasBrev: true },
  { slug: 'ekonomiassistent', namn: 'Ekonomiassistent', kategoriSlug: 'ekonomi', kategoriNamn: 'Ekonomi', iconKey: 'ekonomi', hasCV: true, hasBrev: true },
  { slug: 'redovisningsekonom', namn: 'Redovisningsekonom', kategoriSlug: 'ekonomi', kategoriNamn: 'Ekonomi', iconKey: 'ekonomi', hasCV: true, hasBrev: true },
  { slug: 'butikssaljare', namn: 'Butikssäljare', kategoriSlug: 'service', kategoriNamn: 'Service', iconKey: 'service', hasCV: true, hasBrev: true },
  { slug: 'receptionist', namn: 'Receptionist', kategoriSlug: 'service', kategoriNamn: 'Service', iconKey: 'service', hasCV: true, hasBrev: true },
  { slug: 'projektledare', namn: 'Projektledare', kategoriSlug: 'offentlig-sektor', kategoriNamn: 'Administration', iconKey: 'offentlig', hasCV: true, hasBrev: true },
  { slug: 'hr-specialist', namn: 'HR-specialist', kategoriSlug: 'ekonomi', kategoriNamn: 'Ekonomi och HR', iconKey: 'ekonomi', hasCV: true, hasBrev: true },
]

// FAQ for hub-sidan
export const EXEMPEL_FAQ_ITEMS = [
  {
    q: 'Hur många yrkes-exempel har ni?',
    a: 'Vi har 89 CV-exempel och 89 personliga brev-exempel, totalt 178 yrkesspecifika mallar fördelade över tio kategorier. Mallarna täcker allt från vård, IT och teknik till ekonomi, butik och restaurang, logistik, utbildning, offentlig sektor, hantverk och student. Varje yrke har dessutom egen tips-lista och vanliga frågor som hjälper dig att skräddarsy din egen ansökan.',
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
