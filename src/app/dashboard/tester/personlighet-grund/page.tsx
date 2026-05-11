'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import PersonlighetHero from './components/PersonlighetHero';
import PersonlighetInfoCard from './components/PersonlighetInfoCard';
import PersonlighetStartCTA from './components/PersonlighetStartCTA';
import ProfileSummaryCard from './components/ProfileSummaryCard';
import type { BigFiveScores } from '@/lib/personalityTest/types';

interface Session {
  id: string;
  test_type: string;
  scores: BigFiveScores | null;
  time_spent: number | null;
  completed_at: string | null;
  started_at: string;
}

export default function PersonlighetGrundPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/api/personalityTest/session?testType=personlighet-grund')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.sessions)) {
          const completed = data.sessions.filter((s: Session) => s.completed_at);
          completed.sort(
            (a: Session, b: Session) =>
              new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()
          );
          setSessions(completed);
        }
      })
      .catch(console.error);
  }, []);

  const handleStartTest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/personalityTest/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType: 'personlighet-grund' }),
      });
      const data = await response.json();
      if (data.session) {
        router.push(`/dashboard/tester/personlighet-grund/test/${data.session.id}`);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to start test:', error);
      setIsLoading(false);
    }
  };

  const latest = sessions[0] ?? null;

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-3xl">
      <div className="space-y-5 sm:space-y-6">
        <PersonlighetHero
          variant="grund"
          hasProfile={!!latest}
          lastCompletedAt={latest?.completed_at ?? null}
        />
        <PersonlighetInfoCard variant="grund" />
        <PersonlighetStartCTA
          onStart={handleStartTest}
          isLoading={isLoading}
          hasProfile={!!latest}
        />
        {latest?.scores && latest.completed_at && (
          <ProfileSummaryCard
            scores={latest.scores}
            lastCompletedAt={latest.completed_at}
            attempts={sessions.length}
            resultsHref={`/dashboard/tester/personlighet-grund/test/${latest.id}/results`}
          />
        )}
      </div>
    </div>
  );
}
