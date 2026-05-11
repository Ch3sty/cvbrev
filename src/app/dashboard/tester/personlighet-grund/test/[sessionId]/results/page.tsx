'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
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
