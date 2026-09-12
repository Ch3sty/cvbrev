'use client';

import { useEffect, useState } from 'react';
import { TEST_CONFIGS, getTestConfig } from '@/app/dashboard/tester/testConfig';

export type TestSlug =
  | 'matrislogik-grund'
  | 'matrislogik-avancerad'
  | 'matrislogik-expert'
  | 'verbal-resonemang'
  | 'verbal-resonemang-v2'
  | 'verbal-resonemang-expert'
  | 'numeriskt-test'
  | 'numeriskt-test-v2'
  | 'numeriskt-test-expert';

interface SessionRow {
  id: string;
  score: number | null;
  time_spent: number | null;
  completed_at: string | null;
}

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
  /** Slutförda försök, sorterade äldst→nyast (för trendgrafer). */
  history: TestAttempt[];
}

export interface AllTestStats {
  perTest: Record<TestSlug, PerTestStats>;
  aggregate: {
    totalCompleted: number;
    completedTestCount: number; // antal *unika* tester användaren slutfört minst en gång
    averageBestPercentage: number;
    totalTimeSeconds: number;
    hasAnyData: boolean;
  };
  isLoading: boolean;
}

/**
 * Endpoints och frågeantal härleds ur testConfig, som är enda sanningen
 * (docs/plan-inloggat-omdesign.md, våg 3 punkt 22). Tidigare fanns egna
 * konstanter här, och de hade glidit isär från testsidorna: verbalen räknades
 * på 60 i stället för 48 och numeriskt grund/avancerad på 32 i stället för 24,
 * så hubbens kort visade en annan procent än testet för samma session.
 */
const COGNITIVE_TESTS = TEST_CONFIGS.filter(
  (c) => c.kind !== 'personlighet' && c.level !== 'prov'
);

const TEST_ENDPOINTS: Record<TestSlug, string> = Object.fromEntries(
  COGNITIVE_TESTS.map((c) => [
    c.slug,
    c.sessionQuery ? `${c.api}/session?${c.sessionQuery}` : `${c.api}/session`,
  ])
) as Record<TestSlug, string>;

/** Antalet poängbärande frågor per test, för procentberäkningen. */
export function totalQuestionsFor(slug: TestSlug): number {
  return getTestConfig(slug)?.totalQuestions ?? 0;
}

const EMPTY_STATS: PerTestStats = {
  attempts: 0,
  bestScore: 0,
  bestPercentage: 0,
  totalTimeSeconds: 0,
  lastAttempt: null,
  history: [],
};

function summarizeSessions(sessions: SessionRow[], totalQuestions: number): PerTestStats {
  const completed = sessions.filter((s) => s.completed_at);
  if (completed.length === 0) return EMPTY_STATS;

  const bestScore = Math.max(...completed.map((s) => s.score ?? 0));
  // Clampa till 0-100 för att undvika konstiga värden vid datafel
  const bestPercentage = Math.max(
    0,
    Math.min(100, Math.round((bestScore / totalQuestions) * 100))
  );
  const totalTimeSeconds = completed.reduce((acc, s) => acc + (s.time_spent ?? 0), 0);

  const sortedByDate = [...completed].sort(
    (a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()
  );

  // Äldst→nyast för trendgrafer
  const history: TestAttempt[] = [...completed]
    .sort(
      (a, b) => new Date(a.completed_at!).getTime() - new Date(b.completed_at!).getTime()
    )
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

async function fetchSessions(endpoint: string): Promise<SessionRow[]> {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data.sessions) ? data.sessions : [];
  } catch {
    return [];
  }
}

export function useAllTestStats(): AllTestStats {
  const [stats, setStats] = useState<AllTestStats>(() => ({
    perTest: Object.keys(TEST_ENDPOINTS).reduce(
      (acc, slug) => ({ ...acc, [slug]: EMPTY_STATS }),
      {} as Record<TestSlug, PerTestStats>
    ),
    aggregate: {
      totalCompleted: 0,
      completedTestCount: 0,
      averageBestPercentage: 0,
      totalTimeSeconds: 0,
      hasAnyData: false,
    },
    isLoading: true,
  }));

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const slugs = Object.keys(TEST_ENDPOINTS) as TestSlug[];
      const results = await Promise.all(
        slugs.map((slug) => fetchSessions(TEST_ENDPOINTS[slug]))
      );

      if (cancelled) return;

      const perTest = slugs.reduce((acc, slug, i) => {
        acc[slug] = summarizeSessions(results[i], totalQuestionsFor(slug));
        return acc;
      }, {} as Record<TestSlug, PerTestStats>);

      const totalCompleted = Object.values(perTest).reduce((a, s) => a + s.attempts, 0);
      const completedTestCount = Object.values(perTest).filter((s) => s.attempts > 0).length;
      const totalTimeSeconds = Object.values(perTest).reduce((a, s) => a + s.totalTimeSeconds, 0);

      const testsWithBestScore = Object.values(perTest).filter((s) => s.attempts > 0);
      const averageBestPercentage =
        testsWithBestScore.length > 0
          ? Math.round(
              testsWithBestScore.reduce((a, s) => a + s.bestPercentage, 0) /
                testsWithBestScore.length
            )
          : 0;

      setStats({
        perTest,
        aggregate: {
          totalCompleted,
          completedTestCount,
          averageBestPercentage,
          totalTimeSeconds,
          hasAnyData: totalCompleted > 0,
        },
        isLoading: false,
      });
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return stats;
}
