'use client';

import { useEffect, useState } from 'react';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import VaggLaddar from '@/components/rum/VaggLaddar';
import Golv from '@/components/rum/Golv';
import ResultsView from '@/components/personalityTest/ResultsView';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function PersonlighetGrundResultsPage({ params }: PageProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setSessionId(p.sessionId));
  }, [params]);

  if (!sessionId) {
    return (
      <>
        <VaggLaddar label="Resultatet laddas" />
        <Golv>
          <div className="w-full max-w-3xl">
            <LoadingSkeleton variant="card" label="Resultatet laddas" />
          </div>
        </Golv>
      </>
    );
  }

  return (
    <ResultsView
      sessionId={sessionId}
      testType="personlighet-grund"
      hubPath="/dashboard/tester/personlighet-grund"
    />
  );
}
