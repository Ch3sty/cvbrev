'use client';

import { use } from 'react';
import { MatrixTestSession } from '@/components/tests/matrix/MatrixTestSession';
import { selectExpertQuestionsForSession } from '@/lib/logicTestV7/selectQuestions.v7';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function TestSessionPage({ params }: PageProps) {
  const { sessionId } = use(params);

  return (
    <MatrixTestSession
      sessionId={sessionId}
      level="expert"
      selectQuestions={selectExpertQuestionsForSession}
      answerEndpoint="/api/logicTestV4/answer"
      completeEndpoint="/api/logicTestV4/complete"
      sessionEndpoint="/api/logicTestV4/session"
      resultsPath={(id) => `/dashboard/tester/matrislogik-expert/test/${id}/results`}
    />
  );
}
