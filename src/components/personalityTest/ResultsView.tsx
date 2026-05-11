'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Home, RotateCcw } from 'lucide-react';

import ResultsHero from './ResultsHero';
import BigFiveChart from './BigFiveChart';
import DimensionCard from './DimensionCard';
import InterviewTipsCard from './InterviewTipsCard';
import FacetsBreakdown from './FacetsBreakdown';
import type {
  BigFiveScores,
  FacetScores,
  PersonalityTestType,
  Dimension,
} from '@/lib/personalityTest/types';

interface SessionData {
  id: string;
  test_type: PersonalityTestType;
  scores: BigFiveScores | null;
  facet_scores: FacetScores | null;
  completed_at: string | null;
  time_spent: number | null;
}

interface ResultsViewProps {
  sessionId: string;
  testType: PersonalityTestType;
  hubPath: string;
}

const ORDER: Dimension[] = [
  'openness',
  'conscientiousness',
  'extraversion',
  'agreeableness',
  'neuroticism',
];

export default function ResultsView({
  sessionId,
  testType,
  hubPath,
}: ResultsViewProps) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/personalityTest/session?testType=${testType}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.sessions)) {
          const match = data.sessions.find((s: SessionData) => s.id === sessionId);
          if (match) {
            setSession(match);
          } else {
            setError('Resultatet kunde inte hittas.');
          }
        }
      })
      .catch((e) => {
        console.error(e);
        setError('Något gick fel när vi hämtade resultatet.');
      })
      .finally(() => setIsLoading(false));
  }, [sessionId, testType]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-3 max-w-3xl">
        <div className="space-y-4">
          <div className="rounded-3xl bg-indigo-50/40 h-48 animate-pulse" />
          <div className="rounded-3xl bg-indigo-50/40 h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !session || !session.scores || !session.completed_at) {
    return (
      <div className="container mx-auto py-8 px-3 max-w-3xl">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center">
          <p className="text-slate-700">{error ?? 'Resultatet är inte tillgängligt än.'}</p>
          <Link
            href={hubPath}
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 font-semibold text-sm"
          >
            <Home className="w-4 h-4" strokeWidth={2.5} />
            Tillbaka
          </Link>
        </div>
      </div>
    );
  }

  const scores = session.scores;
  const facetScores = session.facet_scores;

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-3xl">
      <div className="space-y-5 sm:space-y-6">
        <ResultsHero
          testType={testType}
          completedAt={session.completed_at}
          timeSpent={session.time_spent}
        />

        <BigFiveChart scores={scores} />

        {ORDER.map((dim, i) => (
          <DimensionCard key={dim} dimension={dim} score={scores[dim]} index={i} />
        ))}

        <InterviewTipsCard scores={scores} />

        {testType === 'personlighet-avancerad' && facetScores && (
          <FacetsBreakdown facetScores={facetScores} />
        )}

        {/* Footer-CTA */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Link
            href={hubPath}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:border-indigo-300 hover:text-indigo-700 transition-colors min-h-[48px]"
          >
            <Home className="w-4 h-4" strokeWidth={2.5} />
            Till testhuben
          </Link>
          <Link
            href={hubPath}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-bold text-sm transition-all hover:-translate-y-0.5 min-h-[48px]"
            style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)',
              boxShadow: '0 8px 20px -6px rgba(139, 92, 246, 0.45)',
            }}
          >
            <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
            Gör om testet
          </Link>
        </motion.section>
      </div>
    </div>
  );
}
