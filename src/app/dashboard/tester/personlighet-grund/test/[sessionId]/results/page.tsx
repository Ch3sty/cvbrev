'use client';

import { useEffect, useState } from 'react';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
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
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <LoadingSkeleton variant="card" label="Resultatet laddas" />
      </div>
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
