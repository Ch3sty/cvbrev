'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import AvanceradTestHero from './components/AvanceradTestHero';
import TestInfoCard from './components/TestInfoCard';
import StartTestCTA from './components/StartTestCTA';
import PreviousResultsCard from './components/PreviousResultsCard';

interface Session {
  id: string;
  score: number | null;
  time_spent: number | null;
  completed_at: string;
}

export default function MatrislogikAvanceradPage() {
  const router = useRouter();
  const [previousSessions, setPreviousSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/api/logicTestV6/session')
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
      const response = await fetch('/api/logicTestV6/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.session) {
        router.push(`/dashboard/tester/matrislogik-avancerad/test/${data.session.id}`);
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
        <AvanceradTestHero bestScore={bestScore} bestPercentage={bestPercentage} />
        <TestInfoCard />
        <StartTestCTA onStart={handleStartTest} isLoading={isLoading} />
        <PreviousResultsCard sessions={previousSessions} bestScore={bestScore} />
      </div>
    </div>
  );
}
