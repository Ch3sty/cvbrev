'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RotateCw } from 'lucide-react';

import {
  getScoreByDifficulty,
  getScoreByType,
  getAllPassages,
} from '@/lib/numericalTestV2/validator';
import type { TestAnswer } from '@/lib/numericalTestV2/types';
import type { Passage as V1Passage } from '@/lib/numericalTest/types';

import NumericalResultsHero from '@/components/tests/numerical-shared/NumericalResultsHero';
import NumericalResultsBody from '@/components/tests/numerical-shared/NumericalResultsBody';

const passages = getAllPassages() as unknown as V1Passage[];
const TOTAL_QUESTIONS = passages.reduce((sum, p) => sum + p.questions.length, 0);

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function ResultsV2Page({ params }: PageProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setSessionId(p.sessionId));
  }, [params]);

  useEffect(() => {
    if (!sessionId) return;
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/numericalTestV2/session');
        if (response.ok) {
          const data = await response.json();
          const currentSession = data.sessions.find((s: any) => s.id === sessionId);
          setSession(currentSession);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const handleRetry = async () => {
    try {
      const response = await fetch('/api/numericalTestV2/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.session) {
        router.push(`/dashboard/tester/numeriskt-test-v2/test/${data.session.id}`);
      }
    } catch (error) {
      console.error('Failed to start new test:', error);
    }
  };

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
  const score = session.score ?? 0;
  const percentage = TOTAL_QUESTIONS > 0 ? Math.round((score / TOTAL_QUESTIONS) * 100) : 0;
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
          variant="v2"
          score={score}
          totalQuestions={TOTAL_QUESTIONS}
          percentage={percentage}
          completedDate={completedDate}
          timeSpent={timeSpent}
        />

        <NumericalResultsBody
          passages={passages}
          answers={answers as any}
          byDifficulty={byDifficulty}
          byType={byType}
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRetry}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl
                       font-bold text-base text-white min-h-[52px]
                       transition-all hover:-translate-y-0.5 active:translate-y-0
                       touch-manipulation"
            style={{
              background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              boxShadow: '0 12px 28px -8px rgba(220, 38, 38, 0.45)',
            }}
          >
            <RotateCw className="w-4 h-4" strokeWidth={2.5} />
            Gör om testet
          </button>
          <Link
            href="/dashboard/tester"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl
                       font-bold text-base text-orange-700 bg-white border-2 border-orange-200
                       min-h-[52px] hover:bg-orange-50 hover:border-orange-300 transition-colors
                       touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            Till alla tester
          </Link>
        </div>
      </div>
    </div>
  );
}
