'use client';

import { useEffect, useState } from 'react';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import TestSessionView from '@/components/personalityTest/TestSessionView';
import { ITEMS_GRUND } from '@/lib/personalityTest/itemsGrund';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function PersonlighetGrundTestPage({ params }: PageProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setSessionId(p.sessionId));
  }, [params]);

  if (!sessionId) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <LoadingSkeleton variant="card" label="Testet laddas" />
      </div>
    );
  }

  return (
    <TestSessionView
      sessionId={sessionId}
      testType="personlighet-grund"
      items={ITEMS_GRUND}
      resultsBasePath="/dashboard/tester/personlighet-grund/test"
    />
  );
}
