'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import VerbalResultsHero from '@/components/tests/verbal-shared/VerbalResultsHero';
import PercentileCard from '@/app/dashboard/tester/components/PercentileCard';
import VerbalResultsBody, {
  type SavedAnswer,
  type ResultsPassage,
} from '@/components/tests/verbal-shared/VerbalResultsBody';
import {
  selectProvPassagesForSession,
  PROV_TOTAL_STATEMENTS,
} from '@/lib/verbalTestProv/selectProv';

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

export default function VerbalProvResultsPage({ params }: PageProps) {
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
        const response = await fetch('/api/verbalTestProv/session');
        if (response.ok) {
          const data = await response.json();
          const current = data.sessions?.find((s: SessionData) => s.id === sessionId);
          setSession(current ?? null);
        }
      } catch (error) {
        console.error('Error fetching prov session:', error);
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
  const percentage = Math.min(100, Math.round((score / PROV_TOTAL_STATEMENTS) * 100));
  const completedDate = session.completed_at
    ? new Date(session.completed_at).toLocaleDateString('sv-SE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';
  const passages = (sessionId ? selectProvPassagesForSession(sessionId) : []) as ResultsPassage[];
  const answers = session.answers ?? [];

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-3xl">
      <div className="space-y-5 sm:space-y-6">
        <VerbalResultsHero
          variant="v1"
          score={score}
          totalStatements={PROV_TOTAL_STATEMENTS}
          percentage={percentage}
          completedDate={completedDate}
          timeSpent={timeSpent}
        />
        <VerbalResultsBody
          score={score}
          totalStatements={PROV_TOTAL_STATEMENTS}
          timeSpent={timeSpent}
          answers={answers}
          passages={passages}
          restartPath="/dashboard/tester"
          isProv
          afterStatsSlot={
            /* Jämförelse mot andra provresultat (renderas bara vid nog stort underlag) */
            sessionId ? <PercentileCard sessionId={sessionId} /> : undefined
          }
        />
      </div>
    </div>
  );
}
