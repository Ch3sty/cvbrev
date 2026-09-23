/**
 * Serverhämtningen bakom testhubben.
 *
 * Förut hämtade hubben sina siffror med tretton separata HTTP-anrop från
 * webbläsaren: useAllTestStats körde ett fetch per kognitivt test (nio
 * stycken), varje ProvCard fetchade sitt eget prov (tre stycken) och
 * usePersonalityTestStats ett till. Varje sådant anrop landade i en
 * session-route som först gjorde auth.getUser() och därefter sin fråga, alltså
 * två seriella rundturer per kort. Mätningen landade på 28 rundturer och 5424
 * ms LCP på Pixel 7 över LTE.
 *
 * Alla tolv kognitiva anrop läser i själva verket SAMMA tabell,
 * logic_test_v4_sessions, och skiljer sig bara på test_type. De blir därför en
 * enda fråga med .in('test_type', ...). Personlighetstesten ligger i
 * personality_test_sessions och blir den andra frågan. Två frågor i en
 * parallell omgång, efter ett getUser som layouten ändå gör.
 *
 * Ingen rättning, ingen slumpning och ingen frågelogik finns här. Filen läser
 * bara färdiga sessionsrader och räknar exakt som hookarna räknade.
 */
import { getTestConfig } from './testConfig';
import type { TestSlug } from '@/hooks/use-all-test-stats';
import type { BigFiveScores, PersonalityTestType } from '@/lib/personalityTest/types';
import type { Scope } from '@/lib/access/features';

/**
 * Slug i UI mot test_type i logic_test_v4_sessions.
 *
 * Verifierat rad för rad mot GET-grenen i respektive session-route:
 *   matrislogik-grund        src/app/api/logicTestV4/session/route.ts    ('matrislogik' när test_type-param saknas)
 *   matrislogik-avancerad    src/app/api/logicTestV6/session/route.ts
 *   matrislogik-expert       src/app/api/logicTestV4/session/route.ts    (?test_type=matrislogik-expert)
 *   verbal-resonemang        src/app/api/verbalTestV1/session/route.ts
 *   verbal-resonemang-v2     src/app/api/verbalTestV2/session/route.ts
 *   verbal-resonemang-expert src/app/api/verbalTestExpert/session/route.ts
 *   numeriskt-test           src/app/api/numericalTest/session/route.ts  ('numerical-reasoning')
 *   numeriskt-test-v2        src/app/api/numericalTestV2/session/route.ts
 *   numeriskt-test-expert    src/app/api/numericalTestExpert/session/route.ts
 * Prov-typerna kommer ur PROV_TEST_TYPES i src/lib/prov/allowance.ts, som
 * prov-routerna själva importerar.
 */
export const COGNITIVE_TEST_TYPE: Record<TestSlug, string> = {
  'matrislogik-grund': 'matrislogik',
  'matrislogik-avancerad': 'matrislogik-avancerad',
  'matrislogik-expert': 'matrislogik-expert',
  'verbal-resonemang': 'verbal-resonemang',
  'verbal-resonemang-v2': 'verbal-resonemang-v2',
  'verbal-resonemang-expert': 'verbal-resonemang-expert',
  'numeriskt-test': 'numerical-reasoning',
  'numeriskt-test-v2': 'numerical-reasoning-v2',
  'numeriskt-test-expert': 'numerical-reasoning-expert',
};

/** Provets test_type per grupp, samma värden som PROV_TEST_TYPES. */
export const PROV_TEST_TYPE_BY_ENDPOINT: Record<string, string> = {
  '/api/logicTestProv/session': 'matrislogik-prov',
  '/api/verbalTestProv/session': 'verbal-resonemang-prov',
  '/api/numericalTestProv/session': 'numerical-reasoning-prov',
};

export interface TestAttempt {
  score: number;
  percentage: number;
  timeSpent: number;
  completedAt: string;
}

export interface PerTestStats {
  attempts: number;
  bestScore: number;
  bestPercentage: number;
  totalTimeSeconds: number;
  lastAttempt: string | null;
  history: TestAttempt[];
}

export interface PersonalityStat {
  hasProfile: boolean;
  lastCompletedAt: string | null;
  attempts: number;
  completedDates: string[];
  latestSessionId: string | null;
  latestScores: BigFiveScores | null;
}

export interface TesterHubData {
  perTest: Record<TestSlug, PerTestStats>;
  aggregate: {
    totalCompleted: number;
    completedTestCount: number;
    averageBestPercentage: number;
    totalTimeSeconds: number;
    hasAnyData: boolean;
  };
  personality: {
    grund: PersonalityStat;
    avancerad: PersonalityStat;
  };
  /** Bästa provresultat i procent per provets session-endpoint. */
  provBestPercent: Record<string, number | null>;
  isPremium: boolean;
  /**
   * Sann när kontot har featuren test_history, alltså Träningspaketet eller Hela paketet.
   *
   * Gratisnivån ser senaste sessionen, aldrig serien (avsnitt 4: "Senaste
   * sessionen fri, historik premium"). Utvecklingen över tid är
   * veckoprenumerationens själva argument, så trimningen sker här i
   * serverhämtningen och inte i vyn: en historik som aldrig lämnar servern
   * går inte att läsa ur nätverksfliken heller.
   */
  hasHistory: boolean;
  /** Paketet kontot bär, null på gratisnivån. Driver betalväggens förslag. */
  scope: Scope | null;
}

export const EMPTY_STATS: PerTestStats = {
  attempts: 0,
  bestScore: 0,
  bestPercentage: 0,
  totalTimeSeconds: 0,
  lastAttempt: null,
  history: [],
};

export const EMPTY_PERSONALITY: PersonalityStat = {
  hasProfile: false,
  lastCompletedAt: null,
  attempts: 0,
  completedDates: [],
  latestSessionId: null,
  latestScores: null,
};

interface SessionRow {
  id: string;
  test_type: string | null;
  score: number | null;
  time_spent: number | null;
  completed_at: string | null;
}

/** Speglar totalQuestionsFor i use-all-test-stats.ts. */
function totalQuestionsFor(slug: string): number {
  return getTestConfig(slug)?.totalQuestions ?? 0;
}

/**
 * Identisk med summarizeSessions i src/hooks/use-all-test-stats.ts.
 * Ändras räkningen där ska den ändras här också.
 */
function summarizeSessions(sessions: SessionRow[], totalQuestions: number): PerTestStats {
  const completed = sessions.filter((s) => s.completed_at);
  if (completed.length === 0) return EMPTY_STATS;

  const bestScore = Math.max(...completed.map((s) => s.score ?? 0));
  const bestPercentage = Math.max(
    0,
    Math.min(100, Math.round((bestScore / totalQuestions) * 100))
  );
  const totalTimeSeconds = completed.reduce((acc, s) => acc + (s.time_spent ?? 0), 0);

  const sortedByDate = [...completed].sort(
    (a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()
  );

  const history: TestAttempt[] = [...completed]
    .sort((a, b) => new Date(a.completed_at!).getTime() - new Date(b.completed_at!).getTime())
    .map((s) => {
      const score = s.score ?? 0;
      return {
        score,
        percentage: Math.max(0, Math.min(100, Math.round((score / totalQuestions) * 100))),
        timeSpent: s.time_spent ?? 0,
        completedAt: s.completed_at!,
      };
    });

  return {
    attempts: completed.length,
    bestScore,
    bestPercentage,
    totalTimeSeconds,
    lastAttempt: sortedByDate[0]?.completed_at ?? null,
    history,
  };
}

/** Identisk med summarize i src/hooks/use-personality-test-stats.ts. */
function summarizePersonality(
  rows: Array<{
    id: string;
    test_type: PersonalityTestType;
    completed_at: string | null;
    scores: BigFiveScores | null;
  }>,
  testType: PersonalityTestType
): PersonalityStat {
  const completed = rows.filter((r) => r.test_type === testType && r.completed_at);
  if (completed.length === 0) return EMPTY_PERSONALITY;

  const sorted = [...completed].sort(
    (a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()
  );

  return {
    hasProfile: true,
    lastCompletedAt: sorted[0].completed_at,
    attempts: completed.length,
    completedDates: sorted.map((s) => s.completed_at!),
    latestSessionId: sorted[0].id,
    latestScores: sorted[0].scores ?? null,
  };
}

const COGNITIVE_SLUGS = Object.keys(COGNITIVE_TEST_TYPE) as TestSlug[];

function emptyPerTest(): Record<TestSlug, PerTestStats> {
  return COGNITIVE_SLUGS.reduce(
    (acc, slug) => {
      acc[slug] = EMPTY_STATS;
      return acc;
    },
    {} as Record<TestSlug, PerTestStats>
  );
}

export function emptyHubData(
  isPremium = false,
  hasHistory = false,
  scope: Scope | null = null
): TesterHubData {
  return {
    perTest: emptyPerTest(),
    aggregate: {
      totalCompleted: 0,
      completedTestCount: 0,
      averageBestPercentage: 0,
      totalTimeSeconds: 0,
      hasAnyData: false,
    },
    personality: { grund: EMPTY_PERSONALITY, avancerad: EMPTY_PERSONALITY },
    provBestPercent: {},
    isPremium,
    hasHistory,
    scope,
  };
}

/**
 * Trimmar serien till senaste sessionen för den som saknar test_history.
 *
 * Talen står kvar orörda: antal försök, bästa resultat och total tid är
 * summeringar och inte historik, och de är dessutom argumentet för att köpa
 * serien. Det som faller bort är raderna och kurvan, alltså utvecklingen.
 */
function utanHistorik(stats: PerTestStats): PerTestStats {
  if (stats.history.length <= 1) return stats;
  return { ...stats, history: stats.history.slice(-1) };
}

/**
 * Allt hubben behöver, i två parallella frågor.
 *
 * supabase: en klient från createServerClient, redan bunden till användarens
 * cookies. Anroparen har redan autentiserat och skickar in userId. Den här
 * funktionen gör ingen egen auth-kontroll och fattar inga kvot- eller
 * premiumbeslut, den läser bara.
 */
export async function getTesterHubData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  isPremium: boolean,
  hasHistory = false,
  scope: Scope | null = null
): Promise<TesterHubData> {
  const provTypes = Object.values(PROV_TEST_TYPE_BY_ENDPOINT);
  const allCognitiveTypes = [...Object.values(COGNITIVE_TEST_TYPE), ...provTypes];

  const [cognitiveRes, personalityRes] = await Promise.all([
    supabase
      .from('logic_test_v4_sessions')
      .select('id, test_type, score, time_spent, completed_at')
      .eq('user_id', userId)
      .in('test_type', allCognitiveTypes)
      .order('created_at', { ascending: false }),
    supabase
      .from('personality_test_sessions')
      .select('id, test_type, scores, time_spent, completed_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ]);

  if (cognitiveRes.error) {
    console.error('Testhubben: kunde inte läsa testsessioner', cognitiveRes.error);
  }
  if (personalityRes.error) {
    console.error('Testhubben: kunde inte läsa personlighetssessioner', personalityRes.error);
  }

  const rows = (cognitiveRes.data ?? []) as SessionRow[];

  // Gruppera en gång, slå upp per test_type i stället för att filtrera
  // listan tolv gånger.
  const byType = new Map<string, SessionRow[]>();
  for (const row of rows) {
    if (!row.test_type) continue;
    const bucket = byType.get(row.test_type);
    if (bucket) bucket.push(row);
    else byType.set(row.test_type, [row]);
  }

  const perTestFull = COGNITIVE_SLUGS.reduce(
    (acc, slug) => {
      acc[slug] = summarizeSessions(
        byType.get(COGNITIVE_TEST_TYPE[slug]) ?? [],
        totalQuestionsFor(slug)
      );
      return acc;
    },
    {} as Record<TestSlug, PerTestStats>
  );

  // Aggregaten räknas på hela serien, även för den som inte får se den:
  // talen är summeringar, inte historik, och de är dessutom köpskälet.
  const all = Object.values(perTestFull);

  // Historiken trimmas först efter aggregaten, och bara för gratisnivån.
  const perTest = hasHistory
    ? perTestFull
    : (Object.fromEntries(
        Object.entries(perTestFull).map(([slug, stats]) => [slug, utanHistorik(stats)])
      ) as Record<TestSlug, PerTestStats>);
  const totalCompleted = all.reduce((a, s) => a + s.attempts, 0);
  const completedTestCount = all.filter((s) => s.attempts > 0).length;
  const totalTimeSeconds = all.reduce((a, s) => a + s.totalTimeSeconds, 0);
  const withBest = all.filter((s) => s.attempts > 0);
  const averageBestPercentage =
    withBest.length > 0
      ? Math.round(withBest.reduce((a, s) => a + s.bestPercentage, 0) / withBest.length)
      : 0;

  // Proven: samma uträkning som ProvCard gjorde efter sitt eget fetch, alltså
  // bästa slutförda score räknad mot provets frågeantal.
  const PROV_SLUG_BY_TYPE: Record<string, string> = {
    'matrislogik-prov': 'matrislogik-prov',
    'verbal-resonemang-prov': 'verbal-resonemang-prov',
    'numerical-reasoning-prov': 'numeriskt-test-prov',
  };
  const provBestPercent: Record<string, number | null> = {};
  for (const [endpoint, type] of Object.entries(PROV_TEST_TYPE_BY_ENDPOINT)) {
    const completed = (byType.get(type) ?? []).filter(
      (s) => s.completed_at && s.score != null
    );
    if (completed.length === 0) {
      provBestPercent[endpoint] = null;
      continue;
    }
    const top = completed.reduce((a, b) => ((b.score ?? 0) > (a.score ?? 0) ? b : a));
    const total = totalQuestionsFor(PROV_SLUG_BY_TYPE[type]);
    provBestPercent[endpoint] =
      total > 0 ? Math.round(((top.score ?? 0) / total) * 100) : null;
  }

  const personalityRows = (personalityRes.data ?? []) as Array<{
    id: string;
    test_type: PersonalityTestType;
    completed_at: string | null;
    scores: BigFiveScores | null;
  }>;

  return {
    perTest,
    aggregate: {
      totalCompleted,
      completedTestCount,
      averageBestPercentage,
      totalTimeSeconds,
      hasAnyData: totalCompleted > 0,
    },
    personality: {
      grund: summarizePersonality(personalityRows, 'personlighet-grund'),
      avancerad: summarizePersonality(personalityRows, 'personlighet-avancerad'),
    },
    provBestPercent,
    isPremium,
    hasHistory,
    scope,
  };
}
