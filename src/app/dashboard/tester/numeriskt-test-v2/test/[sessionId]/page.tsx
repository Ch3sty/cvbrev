'use client';

// Tunn wrapper: all testlogik (rehydrering, robust svarssparning, avsluta-
// bekräftelse) bor i den delade NumericalTestSession-komponenten.

import { useEffect, useState } from 'react';

import { selectPassagesForSession } from '@/lib/numericalTestV2/selectPassages';
import type { Passage as V1Passage } from '@/lib/numericalTest/types';
import { NumericalTestSession } from '@/components/tests/numerical/NumericalTestSession';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

// V2-passager har samma fält-struktur som V1 så casten är säker.
// Modul-scope → stabil referens för den delade komponentens memo.
const selectPassages = (sessionId: string) =>
  selectPassagesForSession(sessionId) as unknown as V1Passage[];

export default function NumericalTestV2Page({ params }: PageProps) {
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
      level="avancerad"
      selectPassages={selectPassages}
      answerEndpoint="/api/numericalTestV2/answer"
      completeEndpoint="/api/numericalTestV2/complete"
      sessionEndpoint="/api/numericalTestV2/session"
      resultsPath={(id) => `/dashboard/tester/numeriskt-test-v2/test/${id}/results`}
    />
  );
}
