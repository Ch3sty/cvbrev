'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import VerbalResultsHero from '@/components/tests/verbal-shared/VerbalResultsHero';
import VerbalResultsBody, {
  type SavedAnswer,
  type ResultsPassage,
} from '@/components/tests/verbal-shared/VerbalResultsBody';
import {
  selectPassagesForSession,
  TOTAL_STATEMENTS,
} from '@/lib/verbalTestV1/selectPassages.v1';

interface SessionData {
  id: string;
  score: number | null;
  time_spent: number | null;
  completed_at: string | null;
  answers?: SavedAnswer[];
}

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function ResultsPage({ params }: PageProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setSessionId(p.sessionId));
  }, [params]);

  useEffect(() => {
    if (!sessionId) return;
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/verbalTestV1/session');
        if (response.ok) {
          const data = await response.json();
          const current = data.sessions?.find((s: SessionData) => s.id === sessionId);
          setSession(current ?? null);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  if (loading) {
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

  if (!session) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-md text-center">
        <p className="text-slate-600 mb-4">Sessionen kunde inte hittas.</p>
        <button
          onClick={() => router.push('/dashboard/tester')}
          className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-white font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
        >
          Tillbaka till tester
        </button>
      </div>
    );
  }

  const score = session.score ?? 0;
  const timeSpent = session.time_spent ?? 0;
  const percentage = Math.min(100, Math.round((score / TOTAL_STATEMENTS) * 100));
  // Samma seedade urval som test-sidan visade.
  const passages = (sessionId ? selectPassagesForSession(sessionId) : []) as ResultsPassage[];
  const completedDate = session.completed_at
    ? new Date(session.completed_at).toLocaleDateString('sv-SE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const answers = session.answers ?? [];

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-3xl">
      <div className="space-y-5 sm:space-y-6">
        <VerbalResultsHero
          variant="v1"
          score={score}
          totalStatements={TOTAL_STATEMENTS}
          percentage={percentage}
          completedDate={completedDate}
          timeSpent={timeSpent}
        />
        <VerbalResultsBody
          score={score}
          totalStatements={TOTAL_STATEMENTS}
          timeSpent={timeSpent}
          answers={answers}
          passages={passages}
          restartPath="/dashboard/tester/verbal-resonemang"
        />
      </div>
    </div>
  );
}
