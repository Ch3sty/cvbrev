'use client';

import { use } from 'react';
import { VerbalTestSession } from '@/components/tests/verbal/VerbalTestSession';
import { selectPassagesForSession } from '@/lib/verbalTestV2/selectPassages.v2';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function VerbalTestV2Page({ params }: PageProps) {
  const { sessionId } = use(params);

  return (
    <VerbalTestSession
      sessionId={sessionId}
      level="avancerad"
      selectPassages={selectPassagesForSession}
      answerEndpoint="/api/verbalTestV2/answer"
      completeEndpoint="/api/verbalTestV2/complete"
      sessionEndpoint="/api/verbalTestV2/session"
      resultsPath={(id) => `/dashboard/tester/verbal-resonemang-v2/test/${id}/results`}
    />
  );
}
