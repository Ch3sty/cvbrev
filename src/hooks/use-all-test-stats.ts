'use client';

import { useEffect, useState } from 'react';

export type TestSlug =
  | 'matrislogik-grund'
  | 'matrislogik-avancerad'
  | 'verbal-resonemang'
  | 'verbal-resonemang-v2'
  | 'numeriskt-test'
  | 'numeriskt-test-v2';

interface SessionRow {
  id: string;
  score: number | null;
  time_spent: number | null;
  completed_at: string | null;
}

export interface PerTestStats {
  attempts: number;
  bestScore: number;
  bestPercentage: number;
  totalTimeSeconds: number;
  lastAttempt: string | null;
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

const TEST_ENDPOINTS: Record<TestSlug, string> = {
  'matrislogik-grund': '/api/logicTestV4/session',
  'matrislogik-avancerad': '/api/logicTestV6/session',
  'verbal-resonemang': '/api/verbalTestV1/session',
  'verbal-resonemang-v2': '/api/verbalTestV2/session',
  'numeriskt-test': '/api/numericalTest/session',
  'numeriskt-test-v2': '/api/numericalTestV2/session',
};

// Antalet poäng-bärande frågor per test (för procent-beräkning).
// Verbalen har 12 passages × 4 statements = 48. Numeriska har 5 frågor.
// Matrislogik har 15 frågor.
const TEST_TOTAL_QUESTIONS: Record<TestSlug, number> = {
  'matrislogik-grund': 15,
  'matrislogik-avancerad': 15,
  'verbal-resonemang': 48,
  'verbal-resonemang-v2': 48,
  'numeriskt-test': 24,
  'numeriskt-test-v2': 24,
};

const EMPTY_STATS: PerTestStats = {
  attempts: 0,
  bestScore: 0,
  bestPercentage: 0,
  totalTimeSeconds: 0,
  lastAttempt: null,
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

  return {
    attempts: completed.length,
    bestScore,
    bestPercentage,
    totalTimeSeconds,
    lastAttempt: sortedByDate[0]?.completed_at ?? null,
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
        acc[slug] = summarizeSessions(results[i], TEST_TOTAL_QUESTIONS[slug]);
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
