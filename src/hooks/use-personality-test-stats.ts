'use client';

import { useEffect, useState } from 'react';
import type { PersonalityTestType } from '@/lib/personalityTest/types';

interface SessionRow {
  id: string;
  test_type: PersonalityTestType;
  completed_at: string | null;
}

export interface PersonalityStat {
  hasProfile: boolean;
  lastCompletedAt: string | null;
  attempts: number;
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
