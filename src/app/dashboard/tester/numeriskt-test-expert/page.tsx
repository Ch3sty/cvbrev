'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import NumericalTestHero from '@/components/tests/numerical-shared/NumericalTestHero';
import NumericalInfoCard from '@/components/tests/numerical-shared/NumericalInfoCard';
import NumericalStartCTA from '@/components/tests/numerical-shared/NumericalStartCTA';
import NumericalPreviousResults from '@/components/tests/numerical-shared/NumericalPreviousResults';
import { TOTAL_QUESTIONS } from '@/lib/numericalTestExpert/selectPassages';

interface Session {
  id: string;
  score: number | null;
  time_spent: number | null;
  completed_at: string;
}

export default function NumeriskExpertPage() {
  const router = useRouter();
  const [previousSessions, setPreviousSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/api/numericalTestExpert/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.sessions) {
          const completed = data.sessions.filter((s: Session) => s.completed_at);
          completed.sort(
            (a: Session, b: Session) =>
              new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
          );
          setPreviousSessions(completed);
        }
      })
      .catch(console.error);
  }, []);

  const handleStartTest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/numericalTestExpert/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.status === 403) {
        router.push('/priser');
        return;
      }
      const data = await response.json();
      if (data.session) {
        router.push(`/dashboard/tester/numeriskt-test-expert/test/${data.session.id}`);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to start expert test:', error);
      setIsLoading(false);
    }
  };

  const bestScore =
    previousSessions.length > 0
      ? Math.max(...previousSessions.map((s) => s.score ?? 0))
      : 0;
  const bestPercentage = bestScore > 0 ? Math.round((bestScore / TOTAL_QUESTIONS) * 100) : 0;

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-3xl">
      <div className="space-y-5 sm:space-y-6">
        <NumericalTestHero
          variant="expert"
          bestScore={bestScore}
          bestPercentage={bestPercentage}
          totalQuestions={TOTAL_QUESTIONS}
        />
        <NumericalInfoCard variant="expert" />
        <NumericalStartCTA onStart={handleStartTest} isLoading={isLoading} variant="expert" />
        <NumericalPreviousResults
          variant="expert"
          sessions={previousSessions}
          bestScore={bestScore}
          totalQuestions={TOTAL_QUESTIONS}
        />
      </div>
    </div>
  );
}
