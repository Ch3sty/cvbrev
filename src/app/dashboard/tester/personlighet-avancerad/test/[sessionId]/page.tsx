'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import TestSessionView from '@/components/personalityTest/TestSessionView';
import { ITEMS_AVANCERAD } from '@/lib/personalityTest/itemsAvancerad';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function PersonlighetAvanceradTestPage({ params }: PageProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setSessionId(p.sessionId));
  }, [params]);

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <TestSessionView
      sessionId={sessionId}
      testType="personlighet-avancerad"
      items={ITEMS_AVANCERAD}
      resultsBasePath="/dashboard/tester/personlighet-avancerad/test"
    />
  );
}
