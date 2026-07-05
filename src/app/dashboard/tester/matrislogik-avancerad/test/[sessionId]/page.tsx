'use client';

import { use } from 'react';
import { MatrixTestSession } from '@/components/tests/matrix/MatrixTestSession';
import { selectAvanceradQuestionsForSession } from '@/lib/logicTestV7/selectQuestions.v7';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function TestSessionPage({ params }: PageProps) {
  const { sessionId } = use(params);

  return (
    <MatrixTestSession
      sessionId={sessionId}
      level="avancerad"
      selectQuestions={selectAvanceradQuestionsForSession}
      answerEndpoint="/api/logicTestV6/answer"
      completeEndpoint="/api/logicTestV6/complete"
      sessionEndpoint="/api/logicTestV6/session"
      resultsPath={(id) => `/dashboard/tester/matrislogik-avancerad/test/${id}/results`}
    />
  );
}
