/**
 * Konfigurationstabellen för hela testområdet
 * (docs/plan-inloggat-omdesign.md, avsnitt 5 "Tester", våg 3 punkt 22).
 *
 * Varje test är fortfarande en egen upplevelse: eget namn, egen nivå, egen
 * beskrivning, egen progression och egna resultat. Det som delas är koden.
 * Femton nästan identiska kataloger ersätts av en dynamisk route som läser
 * sin slug ur den här tabellen.
 *
 * Slugarna är oförändrade, så alla befintliga URL:er fortsätter fungera.
 * Ändras en slug här måste en redirect läggas i next.config.ts.
 */

export type TestKind = 'matris' | 'verbal' | 'numerisk' | 'personlighet'
export type TestLevel = 'grund' | 'avancerad' | 'expert' | 'prov'

/** Nivåns etikett i UI. Prov är inte en svårighetsgrad utan ett läge. */
export const LEVEL_LABEL: Record<TestLevel, string> = {
  grund: 'Grund',
  avancerad: 'Avancerad',
  expert: 'Expert',
  prov: 'Prov',
}

/** Testtypens namn i UI, används i sidhuvud och brödsmulor. */
export const KIND_LABEL: Record<TestKind, string> = {
  matris: 'Logiktest',
  verbal: 'Verbalt resonemang',
  numerisk: 'Numeriskt test',
  personlighet: 'Personlighetstest',
}

export interface TestConfig {
  /** Route-parametern. Får aldrig ändras utan redirect i next.config.ts. */
  slug: string
  kind: TestKind
  level: TestLevel

  /** Testets namn i sidhuvudet. Egen identitet per nivå. */
  title: string
  /** En rad som säger vad sidan gör, enligt sidmallen. */
  description: string
  /** Vad nivån kräver av dig. Visas i infokortet, en egen text per nivå. */
  levelBlurb: string

  /** API-basen. answer/complete/session ligger under samma bas. */
  api: string
  /**
   * Body till POST /session. Endast de test vars endpoint inte ensam avgör
   * varianten skickar något (matrislogik-expert och personlighetstesten).
   */
  startBody?: Record<string, string>
  /** Query till GET /session när endpointen delas av flera nivåer. */
  sessionQuery?: string

  /** Antal poängbärande frågor. Källa för procent och "X frågor". */
  totalQuestions: number
  /** Ungefärlig tid i minuter, som text i metadata. */
  minutes: number

  /**
   * Kvotnyckeln serversidan svarar med i quota_exceeded. Klienten hittar
   * bara på den som fallback, den skarpa spärren räknas i quotaService.
   */
  quotaFeature: string
  /** Kräver premium för att ens starta. Gaten sitter serverside. */
  requiresPremium: boolean

  /** Nästa nivå att puffa för på resultatsidan. Expert och prov saknar. */
  nextSlug?: string
}

export const TEST_CONFIGS: TestConfig[] = [
  /* ------------------------------- Matrislogik ------------------------------ */
  {
    slug: 'matrislogik-grund',
    kind: 'matris',
    level: 'grund',
    title: 'Logiktest, grundnivå',
    description: 'Mönsterigenkänning i matriser. Nivån där mönstret bygger på en regel i taget.',
    levelBlurb:
      'Varje fråga bygger på en enda regel, till exempel en rotation eller en räkning. Du ser hela mönstret på en gång och behöver inte hålla flera trådar i huvudet.',
    api: '/api/logicTestV4',
    totalQuestions: 15,
    minutes: 20,
    quotaFeature: 'test:matrislogik',
    requiresPremium: false,
    nextSlug: 'matrislogik-avancerad',
  },
  {
    slug: 'matrislogik-avancerad',
    kind: 'matris',
    level: 'avancerad',
    title: 'Logiktest, avancerad nivå',
    description: 'Mönsterigenkänning i matriser. Nivån där två regler verkar samtidigt.',
    levelBlurb:
      'Två regler verkar samtidigt i samma matris, till exempel rotation och räkning. Du måste se båda för att landa rätt, och alternativen är byggda för att belöna halva svaret med fel.',
    api: '/api/logicTestV6',
    totalQuestions: 15,
    minutes: 25,
    quotaFeature: 'test:matrislogik-avancerad',
    requiresPremium: false,
    nextSlug: 'matrislogik-expert',
  },
  {
    slug: 'matrislogik-expert',
    kind: 'matris',
    level: 'expert',
    title: 'Logiktest, expertnivå',
    description: 'Mönsterigenkänning i matriser. Nivån som motsvarar de svåraste rekryteringstesten.',
    levelBlurb:
      'Tre lager av regler och distraktorer som stämmer på två av tre. Det här är nivån konsultbolag och trainee-program använder för att skilja de sista kandidaterna åt.',
    api: '/api/logicTestV4',
    startBody: { test_type: 'matrislogik-expert' },
    sessionQuery: 'test_type=matrislogik-expert',
    totalQuestions: 15,
    minutes: 30,
    quotaFeature: 'test:matrislogik-expert',
    requiresPremium: false,
  },
  {
    slug: 'matrislogik-prov',
    kind: 'matris',
    level: 'prov',
    title: 'Logikprov',
    description: 'Skarpt prov med frågor från alla nivåer, blandade. Ingen hjälp under provet.',
    levelBlurb:
      'Frågor från alla tre nivåer, blandade i den ordning ett riktigt prov använder. Ingen förklaring under tiden och ingen möjlighet att se regeln, precis som hos en rekryterare.',
    api: '/api/logicTestProv',
    totalQuestions: 18,
    minutes: 25,
    quotaFeature: 'test:matrislogik-prov',
    requiresPremium: false,
  },

  /* ---------------------------- Verbalt resonemang -------------------------- */
  {
    slug: 'verbal-resonemang',
    kind: 'verbal',
    level: 'grund',
    title: 'Verbalt resonemang, grundnivå',
    description: 'Läs en text och avgör om påståenden stämmer. Nivån där svaret står i texten.',
    levelBlurb:
      'Påståendena går att avgöra direkt mot texten. Fällan är att svara utifrån vad du redan vet i stället för vad som faktiskt står.',
    api: '/api/verbalTestV1',
    totalQuestions: 48,
    minutes: 25,
    quotaFeature: 'test:verbal-resonemang',
    requiresPremium: false,
    nextSlug: 'verbal-resonemang-v2',
  },
  {
    slug: 'verbal-resonemang-v2',
    kind: 'verbal',
    level: 'avancerad',
    title: 'Verbalt resonemang, avancerad nivå',
    description: 'Läs en text och avgör om påståenden stämmer. Nivån med längre texter och fler nyanser.',
    levelBlurb:
      'Längre texter och påståenden som ligger nära varandra. Skillnaden mellan "falskt" och "går inte att avgöra" är där de flesta poängen tappas.',
    api: '/api/verbalTestV2',
    totalQuestions: 48,
    minutes: 30,
    quotaFeature: 'test:verbal-resonemang-v2',
    requiresPremium: false,
    nextSlug: 'verbal-resonemang-expert',
  },
  {
    slug: 'verbal-resonemang-expert',
    kind: 'verbal',
    level: 'expert',
    title: 'Verbalt resonemang, expertnivå',
    description: 'Argumentationsanalys och felslut. Nivån som prövar hur ett resonemang håller ihop.',
    levelBlurb:
      'Här räcker det inte att läsa noggrant. Du ska hitta vad ett argument vilar på, var det brister och vilket antagande som bär slutsatsen.',
    api: '/api/verbalTestExpert',
    totalQuestions: 32,
    minutes: 35,
    quotaFeature: 'test:verbal-resonemang-expert',
    requiresPremium: false,
  },
  {
    slug: 'verbal-resonemang-prov',
    kind: 'verbal',
    level: 'prov',
    title: 'Verbalt prov',
    description: 'Skarpt prov med tidsgräns. Klockan går och obesvarade frågor räknas som fel.',
    levelBlurb:
      'Tidsgräns som i ett riktigt prov. Provet lämnas in automatiskt när tiden tar slut, så tempot är en del av det som mäts.',
    api: '/api/verbalTestProv',
    totalQuestions: 48,
    minutes: 40,
    quotaFeature: 'test:verbal-resonemang-prov',
    requiresPremium: false,
  },

  /* ------------------------------ Numeriskt test ---------------------------- */
  {
    slug: 'numeriskt-test',
    kind: 'numerisk',
    level: 'grund',
    title: 'Numeriskt test, grundnivå',
    description: 'Tolka tabeller och diagram. Nivån där siffran du behöver står i underlaget.',
    levelBlurb:
      'Du läser av ett värde och räknar en andel eller en förändring. Räknaren är tillåten, och det som mäts är att du hittar rätt siffra i rätt kolumn.',
    api: '/api/numericalTest',
    totalQuestions: 24,
    minutes: 25,
    quotaFeature: 'test:numerical-reasoning',
    requiresPremium: false,
    nextSlug: 'numeriskt-test-v2',
  },
  {
    slug: 'numeriskt-test-v2',
    kind: 'numerisk',
    level: 'avancerad',
    title: 'Numeriskt test, avancerad nivå',
    description: 'Tolka tabeller och diagram. Nivån där svaret kräver flera steg.',
    levelBlurb:
      'Svaret ligger två eller tre räkneoperationer bort och underlaget innehåller siffror du inte ska använda. Att välja bort rätt data är halva uppgiften.',
    api: '/api/numericalTestV2',
    totalQuestions: 24,
    minutes: 35,
    quotaFeature: 'test:numerical-reasoning-v2',
    requiresPremium: false,
    nextSlug: 'numeriskt-test-expert',
  },
  {
    slug: 'numeriskt-test-expert',
    kind: 'numerisk',
    level: 'expert',
    title: 'Numeriskt test, expertnivå',
    description: 'Investeringskalkyl och optimering. Nivån för tjänster med budget och analys.',
    levelBlurb:
      'Kalkyler med flera variabler, marginaler och villkor som ska vägas mot varandra. Nivån som används för controller-, analytiker- och konsultroller.',
    api: '/api/numericalTestExpert',
    totalQuestions: 32,
    minutes: 35,
    quotaFeature: 'test:numerical-reasoning-expert',
    requiresPremium: false,
  },
  {
    slug: 'numeriskt-test-prov',
    kind: 'numerisk',
    level: 'prov',
    title: 'Numeriskt prov',
    description: 'Skarpt prov med frågor från alla nivåer. Ingen hjälp under provet.',
    levelBlurb:
      'Blandade frågor från alla nivåer i följd. Du ser aldrig hur du ligger till under tiden, bara resultatet efteråt.',
    api: '/api/numericalTestProv',
    totalQuestions: 36,
    minutes: 40,
    quotaFeature: 'test:numerical-reasoning-prov',
    requiresPremium: false,
  },

  /* ----------------------------- Personlighetstest -------------------------- */
  // Personlighetstesten har annan struktur (ingen poäng, ingen percentil, en
  // Big Five-profil i stället för rätt och fel). De ligger kvar på egna sidor
  // men på samma sidmall, och står med här så hubben har en enda källa.
  {
    slug: 'personlighet-grund',
    kind: 'personlighet',
    level: 'grund',
    title: 'Personlighetstest, grundnivå',
    description: 'Femtio påståenden om hur du är. Du får en profil, inte ett betyg.',
    levelBlurb:
      'Big Five på fem dimensioner. Svara som du faktiskt är, inte som du tror att en rekryterare vill ha det, annars blir profilen oanvändbar för dig.',
    api: '/api/personalityTest',
    startBody: { testType: 'personlighet-grund' },
    sessionQuery: 'testType=personlighet-grund',
    totalQuestions: 50,
    minutes: 10,
    quotaFeature: 'test:personlighet-grund',
    requiresPremium: false,
    nextSlug: 'personlighet-avancerad',
  },
  {
    slug: 'personlighet-avancerad',
    kind: 'personlighet',
    level: 'avancerad',
    title: 'Personlighetstest, avancerad nivå',
    description: 'Etthundratjugo påståenden som bryter ner varje dimension i facetter.',
    levelBlurb:
      'Samma fem dimensioner, men uppdelade i facetter. Två personer med samma grundprofil kan skilja sig helt här, och det är den skillnaden en rekryterare läser.',
    api: '/api/personalityTest',
    startBody: { testType: 'personlighet-avancerad' },
    sessionQuery: 'testType=personlighet-avancerad',
    totalQuestions: 120,
    minutes: 25,
    quotaFeature: 'test:personlighet-avancerad',
    requiresPremium: true,
  },
]

const BY_SLUG = new Map(TEST_CONFIGS.map((c) => [c.slug, c]))

export function getTestConfig(slug: string): TestConfig | undefined {
  return BY_SLUG.get(slug)
}

/** Slugarna den dynamiska routen renderar. Personlighet har egna sidor. */
export const DYNAMIC_TEST_SLUGS = TEST_CONFIGS.filter(
  (c) => c.kind !== 'personlighet'
).map((c) => c.slug)

export const ALL_TEST_SLUGS = TEST_CONFIGS.map((c) => c.slug)

/** Testets sidor. En enda plats som vet hur testets URL:er ser ut. */
export const testPaths = {
  hub: (slug: string) => `/dashboard/tester/${slug}`,
  run: (slug: string, sessionId: string) =>
    `/dashboard/tester/${slug}/test/${sessionId}`,
  results: (slug: string, sessionId: string) =>
    `/dashboard/tester/${slug}/test/${sessionId}/results`,
}
