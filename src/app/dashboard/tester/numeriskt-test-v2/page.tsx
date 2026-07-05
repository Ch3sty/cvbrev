'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import NumericalTestHero from '@/components/tests/numerical-shared/NumericalTestHero';
import NumericalInfoCard from '@/components/tests/numerical-shared/NumericalInfoCard';
import NumericalStartCTA from '@/components/tests/numerical-shared/NumericalStartCTA';
import NumericalPreviousResults from '@/components/tests/numerical-shared/NumericalPreviousResults';
import QuotaLockCard from '@/components/quota/QuotaLockCard';

interface Session {
  id: string;
  score: number | null;
  time_spent: number | null;
  completed_at: string;
}

interface QuotaLock {
  feature: string;
  nextResetAt: string;
}

const TOTAL_QUESTIONS = 24;

export default function NumericalTestV2LandingPage() {
  const router = useRouter();
  const [previousSessions, setPreviousSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quotaLock, setQuotaLock] = useState<QuotaLock | null>(null);

  useEffect(() => {
    fetch('/api/numericalTestV2/session')
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
      const response = await fetch('/api/numericalTestV2/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.status === 429) {
        const data = await response.json().catch(() => null);
        if (data?.code === 'quota_exceeded') {
          setQuotaLock({
            feature: data.feature ?? 'test:numerical-reasoning-v2',
            nextResetAt: data.nextResetAt ?? new Date().toISOString(),
          });
        }
        setIsLoading(false);
        return;
      }
      const data = await response.json();
      if (data.session) {
        router.push(`/dashboard/tester/numeriskt-test-v2/test/${data.session.id}`);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to start test:', error);
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
          variant="v2"
          bestScore={bestScore}
          bestPercentage={bestPercentage}
          totalQuestions={TOTAL_QUESTIONS}
        />
        <NumericalInfoCard variant="v2" />
        {quotaLock ? (
          <QuotaLockCard
            feature={quotaLock.feature}
            title="Du har gjort dagens test"
            description="Som gratisanvändare gör du varje test en gång per dag."
            nextResetAt={quotaLock.nextResetAt}
          />
        ) : (
          <NumericalStartCTA onStart={handleStartTest} isLoading={isLoading} variant="v2" />
        )}
        <NumericalPreviousResults
          variant="v2"
          sessions={previousSessions}
          bestScore={bestScore}
          totalQuestions={TOTAL_QUESTIONS}
        />
      </div>
    </div>
  );
}
