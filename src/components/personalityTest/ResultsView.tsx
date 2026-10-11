'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Home, RotateCcw } from '@/components/illustrations/RumIkoner';

import RumHuvud from '@/components/rum/RumHuvud';
import Golv from '@/components/rum/Golv';
import { KNAPP_PRIMAR, KNAPP_SEKUNDAR } from '@/components/shell/knappar';
import { NIVA_I_RAD, RUBRIK, resultatRad } from '@/lib/rum/copy';
import { KIND_LABEL } from '@/app/dashboard/tester/testConfig';
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

  // Rubriken är "Ditt resultat" och raden testet, nivån och datumet, som på
  // alla resultatsidor (spec 16.2 fråga 18). Samma vägg i alla tillstånd:
  // innan datumet är känt hålls dess plats med osynlig text, så raden har
  // samma höjd och golvet inte hoppar när sessionen landat.
  const niva = testType === 'personlighet-grund' ? NIVA_I_RAD.grund : NIVA_I_RAD.avancerad
  const datum = session?.completed_at
    ? new Date(session.completed_at).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })
    : null
  const vagg = (
    <RumHuvud
      title={RUBRIK.resultat}
      description={
        datum ? (
          resultatRad(KIND_LABEL.personlighet, niva, datum)
        ) : (
          <>
            {resultatRad(KIND_LABEL.personlighet, niva, null)}{' '}
            <span className="invisible" aria-hidden="true">
              Genomfört 30 september 2026.
            </span>
          </>
        )
      }
    />
  )

  if (isLoading) {
    return (
      <>
        {vagg}
        <Golv>
          <div className="w-full max-w-3xl space-y-4" role="status" aria-busy="true" aria-label="Resultatet laddas">
            <div className="loading-thread h-48 rounded-2xl border border-kant bg-papper" />
            <div className="h-64 rounded-2xl border border-kant bg-papper" />
          </div>
        </Golv>
      </>
    );
  }

  if (error || !session || !session.scores || !session.completed_at) {
    return (
      <>
        {vagg}
        <Golv>
          <div className="w-full max-w-3xl rounded-2xl border border-kant bg-papper p-6 text-center">
            <p className="text-ink-2">{error ?? 'Resultatet är inte tillgängligt än.'}</p>
            <Link href={hubPath} className={`mt-4 ${KNAPP_SEKUNDAR} sm:w-auto`}>
              Tillbaka
            </Link>
          </div>
        </Golv>
      </>
    );
  }

  const scores = session.scores;
  const facetScores = session.facet_scores;

  return (
    <>
      {vagg}
      <Golv>
      <div className="w-full max-w-3xl space-y-5 sm:space-y-6">
        <BigFiveChart scores={scores} />

        {ORDER.map((dim, i) => (
          <DimensionCard key={dim} dimension={dim} score={scores[dim]} index={i} />
        ))}

        <InterviewTipsCard scores={scores} />

        {testType === 'personlighet-avancerad' && facetScores && (
          <FacetsBreakdown facetScores={facetScores} />
        )}

        {/* Foten: vyns enda kopparknapp. */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Link href={hubPath} className={`${KNAPP_SEKUNDAR} flex-1 gap-2`}>
            <Home className="h-4 w-4" strokeWidth={2.5} />
            Till testhuben
          </Link>
          <Link href={hubPath} className={`${KNAPP_PRIMAR} flex-1`}>
            <RotateCcw className="h-4 w-4" strokeWidth={2.5} />
            Gör om testet
          </Link>
        </motion.section>
      </div>
      </Golv>
    </>
  );
}
