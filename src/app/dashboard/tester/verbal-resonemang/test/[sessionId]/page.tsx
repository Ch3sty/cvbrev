'use client';

import { use } from 'react';
import { VerbalTestSession } from '@/components/tests/verbal/VerbalTestSession';
import { selectPassagesForSession } from '@/lib/verbalTestV1/selectPassages.v1';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function VerbalTestPage({ params }: PageProps) {
  const { sessionId } = use(params);

  return (
    <VerbalTestSession
      sessionId={sessionId}
      level="grund"
      selectPassages={selectPassagesForSession}
      answerEndpoint="/api/verbalTestV1/answer"
      completeEndpoint="/api/verbalTestV1/complete"
      sessionEndpoint="/api/verbalTestV1/session"
      resultsPath={(id) => `/dashboard/tester/verbal-resonemang/test/${id}/results`}
    />
  );
}
