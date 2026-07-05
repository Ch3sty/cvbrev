'use client';

// Tunn wrapper: all testlogik (rehydrering, robust svarssparning, avsluta-
// bekräftelse) bor i den delade NumericalTestSession-komponenten.

import { useEffect, useState } from 'react';

import { selectPassagesForSession } from '@/lib/numericalTest/selectPassages';
import { NumericalTestSession } from '@/components/tests/numerical/NumericalTestSession';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function NumericalTestPage({ params }: PageProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setSessionId(p.sessionId));
  }, [params]);

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600 mx-auto mb-4" />
          <p className="text-slate-600">Laddar test...</p>
        </div>
      </div>
    );
  }

  return (
    <NumericalTestSession
      sessionId={sessionId}
      level="grund"
      selectPassages={selectPassagesForSession}
      answerEndpoint="/api/numericalTest/answer"
      completeEndpoint="/api/numericalTest/complete"
      sessionEndpoint="/api/numericalTest/session"
      resultsPath={(id) => `/dashboard/tester/numeriskt-test/test/${id}/results`}
    />
  );
}
