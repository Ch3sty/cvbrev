'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import VerbalTestHero from '@/components/tests/verbal-shared/VerbalTestHero';
import VerbalInfoCard from '@/components/tests/verbal-shared/VerbalInfoCard';
import VerbalStartCTA from '@/components/tests/verbal-shared/VerbalStartCTA';
import VerbalPreviousResults from '@/components/tests/verbal-shared/VerbalPreviousResults';
import QuotaLockCard from '@/components/quota/QuotaLockCard';

const TOTAL_STATEMENTS = 48;

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

export default function VerbalResonemangV2Page() {
  const router = useRouter();
  const [previousSessions, setPreviousSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quotaLock, setQuotaLock] = useState<QuotaLock | null>(null);

  useEffect(() => {
    fetch('/api/verbalTestV2/session')
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
      const response = await fetch('/api/verbalTestV2/session', {
        method: 'POST',
      });
      if (response.status === 429) {
        const data = await response.json().catch(() => null);
        if (data?.code === 'quota_exceeded') {
          setQuotaLock({
            feature: data.feature ?? 'test:verbal-resonemang-v2',
            nextResetAt: data.nextResetAt ?? new Date().toISOString(),
          });
        }
        setIsLoading(false);
        return;
      }
      if (!response.ok) throw new Error('Failed to create session');
      const data = await response.json();
      if (data.session) {
        router.push(`/dashboard/tester/verbal-resonemang-v2/test/${data.session.id}`);
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
  const bestPercentage =
    bestScore > 0 ? Math.min(100, Math.round((bestScore / TOTAL_STATEMENTS) * 100)) : 0;

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-3xl">
      <div className="space-y-5 sm:space-y-6">
        <VerbalTestHero
          variant="v2"
          bestScore={bestScore}
          bestPercentage={bestPercentage}
          totalStatements={TOTAL_STATEMENTS}
        />
        <VerbalInfoCard variant="v2" />
        {quotaLock ? (
          <QuotaLockCard
            feature={quotaLock.feature}
            title="Du har gjort dagens test"
            description="Som gratisanvändare gör du varje test en gång per dag."
            nextResetAt={quotaLock.nextResetAt}
          />
        ) : (
          <VerbalStartCTA onStart={handleStartTest} isLoading={isLoading} variant="v2" />
        )}
        <VerbalPreviousResults
          sessions={previousSessions}
          bestScore={bestScore}
          totalStatements={TOTAL_STATEMENTS}
        />
      </div>
    </div>
  );
}
