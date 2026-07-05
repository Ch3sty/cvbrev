'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import ExpertTestHero from './components/ExpertTestHero';
import ExpertInfoCard from './components/ExpertInfoCard';
import StartTestCTA from '../matrislogik-grund/components/StartTestCTA';
import PreviousResultsCard from '../matrislogik-grund/components/PreviousResultsCard';
import QuotaLockCard from '@/components/quota/QuotaLockCard';

interface Session {
  id: string;
  score: number | null;
  time_spent: number | null;
  completed_at: string;
  test_type?: string | null;
}

interface QuotaLock {
  feature: string;
  nextResetAt: string;
}

export default function MatrislogikExpertPage() {
  const router = useRouter();
  const [previousSessions, setPreviousSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quotaLock, setQuotaLock] = useState<QuotaLock | null>(null);

  useEffect(() => {
    fetch('/api/logicTestV4/session?test_type=matrislogik-expert')
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
      const response = await fetch('/api/logicTestV4/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_type: 'matrislogik-expert' }),
      });
      if (response.status === 429) {
        const data = await response.json().catch(() => null);
        if (data?.code === 'quota_exceeded') {
          setQuotaLock({
            feature: data.feature ?? 'test:matrislogik-expert',
            nextResetAt: data.nextResetAt ?? new Date().toISOString(),
          });
        }
        setIsLoading(false);
        return;
      }
      const data = await response.json();
      if (data.session) {
        router.push(`/dashboard/tester/matrislogik-expert/test/${data.session.id}`);
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
  const bestPercentage = bestScore > 0 ? Math.round((bestScore / 15) * 100) : 0;

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-3xl">
      <div className="space-y-5 sm:space-y-6">
        <ExpertTestHero bestScore={bestScore} bestPercentage={bestPercentage} />
        <ExpertInfoCard />
        {quotaLock ? (
          <QuotaLockCard
            feature={quotaLock.feature}
            title="Du har gjort dagens test"
            description="Som gratisanvändare gör du varje test en gång per dag."
            nextResetAt={quotaLock.nextResetAt}
          />
        ) : (
          <StartTestCTA onStart={handleStartTest} isLoading={isLoading} />
        )}
        <PreviousResultsCard sessions={previousSessions} bestScore={bestScore} />
      </div>
    </div>
  );
}
