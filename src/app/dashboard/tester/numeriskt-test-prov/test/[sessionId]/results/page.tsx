'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RotateCw } from 'lucide-react';

import {
  selectProvPassagesForSession,
  PROV_TOTAL_QUESTIONS,
} from '@/lib/numericalTestProv/selectProv';
import {
  getScoreByDifficulty,
  getScoreByType,
} from '@/lib/numericalTestProv/validator.prov';
import type { TestAnswer } from '@/lib/numericalTest/types';
import type { Passage as V1Passage } from '@/lib/numericalTest/types';

import NumericalResultsHero from '@/components/tests/numerical-shared/NumericalResultsHero';
import PercentileCard from '@/app/dashboard/tester/components/PercentileCard';
import NumericalResultsBody from '@/components/tests/numerical-shared/NumericalResultsBody';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function NumericalProvResultsPage({ params }: PageProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setSessionId(p.sessionId));
  }, [params]);

  useEffect(() => {
    if (!sessionId) return;
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/numericalTestProv/session');
        if (response.ok) {
          const data = await response.json();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const current = data.sessions.find((s: any) => s.id === sessionId);
          setSession(current);
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600 mx-auto mb-4" />
          <p className="text-slate-600">Laddar resultat...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Session kunde inte hittas</p>
          <Link
            href="/dashboard/tester"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold"
            style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            Tillbaka till tester
          </Link>
        </div>
      </div>
    );
  }

  const answers: TestAnswer[] = session.answers || [];
  const passages = (sessionId ? selectProvPassagesForSession(sessionId) : []) as unknown as V1Passage[];
  const score = session.score ?? 0;
  const percentage = PROV_TOTAL_QUESTIONS > 0 ? Math.round((score / PROV_TOTAL_QUESTIONS) * 100) : 0;
  const timeSpent = session.time_spent ?? 0;
  const completedDate = session.completed_at
    ? new Date(session.completed_at).toLocaleDateString('sv-SE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  const byDifficulty = getScoreByDifficulty(answers);
  const byType = getScoreByType(answers);

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-3xl">
      <div className="space-y-5 sm:space-y-6">
        <NumericalResultsHero
          variant="v1"
          score={score}
          totalQuestions={PROV_TOTAL_QUESTIONS}
          percentage={percentage}
          completedDate={completedDate}
          timeSpent={timeSpent}
        />

        {/* Jämförelse mot andra provresultat (renderas bara vid nog stort underlag) */}
        {sessionId && <PercentileCard sessionId={sessionId} />}

        <NumericalResultsBody
          passages={passages}
          answers={answers}
          byDifficulty={byDifficulty}
          byType={byType}
          showExplanations={false}
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard/tester"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-base text-white min-h-[52px] transition-all hover:-translate-y-0.5 active:translate-y-0 touch-manipulation"
            style={{
              background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              boxShadow: '0 12px 28px -8px rgba(220, 38, 38, 0.45)',
            }}
          >
            <RotateCw className="w-4 h-4" strokeWidth={2.5} />
            Tillbaka till tester
          </Link>
          <button
            onClick={() => router.push('/dashboard/tester')}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-base text-orange-700 bg-white border-2 border-orange-200 min-h-[52px] hover:bg-orange-50 hover:border-orange-300 transition-colors touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            Alla tester
          </button>
        </div>
      </div>
    </div>
  );
}
