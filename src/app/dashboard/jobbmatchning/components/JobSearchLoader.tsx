'use client';

import { useEffect, useState } from 'react';
import FlowProgress, { type FlowStage } from '@/components/shell/FlowProgress';
import FlowError from '@/components/shell/FlowError';

interface JobSearchLoaderProps {
  isSearching: boolean;
  jobsFound: boolean | null;
  error: string | null;
}

const STAGES: FlowStage[] = [
  { threshold: 0, text: 'Läser ditt CV', body: 'Vi hittar dina yrkesroller och kompetenser.' },
  { threshold: 20, text: 'Söker jobb', body: 'Vi hämtar tusentals annonser.' },
  { threshold: 40, text: 'Matchar mot din profil', body: 'Relevansen räknas ut per annons.' },
  { threshold: 60, text: 'Rangordnar resultat', body: 'De bästa träffarna sätts först.' },
  { threshold: 80, text: 'Förbereder vyn', body: 'Snart är vi klara.' },
];

/** Varje etapp får ungefär två sekunder, som tidigare. */
const STAGE_DURATION_MS = 2000;
const TOTAL_SECONDS = (STAGES.length * STAGE_DURATION_MS) / 1000;

/**
 * Väntan medan vi söker och matchar. Samma etapper som förr, men i flödets
 * gemensamma väntläge: tråden i 2 px, rubrik, etapptext och en tid. Ingen
 * spinner, inga pulserande cirklar, ingen illustration som rör sig.
 */
export default function JobSearchLoader({
  isSearching,
  jobsFound,
  error,
}: JobSearchLoaderProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (error || jobsFound) {
      setStage(STAGES.length - 1);
      return;
    }
    if (!isSearching) return;

    const timer = setInterval(() => {
      setStage((prev) => Math.min(prev + 1, STAGES.length - 1));
    }, STAGE_DURATION_MS);

    return () => clearInterval(timer);
  }, [isSearching, jobsFound, error]);

  if (error) {
    return <FlowError message={error} />;
  }

  const progress = Math.round(((stage + 1) / STAGES.length) * 100);
  const remaining = Math.max(
    0,
    Math.round(TOTAL_SECONDS * (1 - (stage + 1) / STAGES.length))
  );

  return (
    <FlowProgress
      progress={progress}
      estimatedTimeRemaining={remaining}
      stages={STAGES}
    />
  );
}
