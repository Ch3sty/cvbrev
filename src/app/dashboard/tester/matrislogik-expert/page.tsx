'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import StartTestCTA from '../matrislogik-grund/components/StartTestCTA';
import PreviousResultsCard from '../matrislogik-grund/components/PreviousResultsCard';

interface Session {
  id: string;
  score: number | null;
  time_spent: number | null;
  completed_at: string;
  test_type?: string | null;
}

export default function MatrislogikExpertPage() {
  const router = useRouter();
  const [previousSessions, setPreviousSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-3xl">
      <div className="space-y-5 sm:space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wide mb-3">
            Expert
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Matrislogik – expertnivå
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-xl mx-auto">
            Den svåraste nivån. Mönster som roterar och förflyttas i flera steg,
            med tre olika figurtyper. 15 frågor, varje gång nya. Tänk noga – här
            räcker det inte att gissa.
          </p>
        </div>
        <StartTestCTA onStart={handleStartTest} isLoading={isLoading} />
        <PreviousResultsCard sessions={previousSessions} bestScore={bestScore} />
      </div>
    </div>
  );
}
