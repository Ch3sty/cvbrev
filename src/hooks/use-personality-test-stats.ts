'use client';

import { useEffect, useState } from 'react';
import type { PersonalityTestType, BigFiveScores } from '@/lib/personalityTest/types';

interface SessionRow {
  id: string;
  test_type: PersonalityTestType;
  completed_at: string | null;
  scores: BigFiveScores | null;
}

export interface PersonalityStat {
  hasProfile: boolean;
  lastCompletedAt: string | null;
  attempts: number;
  /** Slutförda profil-datum, nyast först. */
  completedDates: string[];
  /** Senaste slutförda sessionens id (för länk till resultatsidan). */
  latestSessionId: string | null;
  /** Senaste slutförda sessionens Big Five-resultat. */
  latestScores: BigFiveScores | null;
}

export interface PersonalityTestStats {
  grund: PersonalityStat;
  avancerad: PersonalityStat;
  isLoading: boolean;
}

const EMPTY: PersonalityStat = {
  hasProfile: false,
  lastCompletedAt: null,
  attempts: 0,
  completedDates: [],
  latestSessionId: null,
  latestScores: null,
};

function summarize(rows: SessionRow[], testType: PersonalityTestType): PersonalityStat {
  const completed = rows.filter((r) => r.test_type === testType && r.completed_at);
  if (completed.length === 0) return EMPTY;

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

export function usePersonalityTestStats(): PersonalityTestStats {
  const [stats, setStats] = useState<PersonalityTestStats>({
    grund: EMPTY,
    avancerad: EMPTY,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    fetch('/api/personalityTest/session')
      .then((res) => (res.ok ? res.json() : { sessions: [] }))
      .then((data) => {
        if (cancelled) return;
        const sessions: SessionRow[] = Array.isArray(data.sessions) ? data.sessions : [];
        setStats({
          grund: summarize(sessions, 'personlighet-grund'),
          avancerad: summarize(sessions, 'personlighet-avancerad'),
          isLoading: false,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setStats({ grund: EMPTY, avancerad: EMPTY, isLoading: false });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return stats;
}
