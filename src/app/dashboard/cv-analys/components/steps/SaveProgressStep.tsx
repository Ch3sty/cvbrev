'use client';

import FlowProgress, { type FlowStage } from '@/components/shell/FlowProgress';

interface SaveProgressStepProps {
  progress: number; // 0-100
}

const STAGES: FlowStage[] = [
  { threshold: 0, text: 'Sparar ditt CV', body: 'Vi lägger ditt förbättrade CV i biblioteket.' },
  { threshold: 40, text: 'Genererar PDF', body: 'Vi formaterar enligt din valda mall.' },
  { threshold: 80, text: 'Snart klart', body: 'Vi sätter de sista detaljerna på plats.' },
];

/**
 * Steg 5b: medan vi sparar och gör PDF:en.
 *
 * Bort: illustrationen av ett papper som byggs upp, rubriker som tonade in
 * och ut för varje etapp, orange progressbar och tre färgade streck under.
 * FlowProgress gör det här överallt annars, alltså gör den det här också.
 */
export default function SaveProgressStep({ progress }: SaveProgressStepProps) {
  return (
    <FlowProgress
      progress={progress}
      stages={STAGES}
      estimatedTimeRemaining={Math.max(0, Math.round((100 - progress) / 10))}
    />
  );
}
