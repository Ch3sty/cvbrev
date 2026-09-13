'use client';

interface AnalysisFlowStepHeaderProps {
  stepNumber: number;
  totalSteps?: number;
  title: string;
  description: string;
  isDone: boolean;
  rightSlot?: React.ReactNode;
}

/**
 * Rubriken för ett steg i CV-analysen.
 *
 * Bort: den fyllda sifferbubblan med pulserande ring i orange, den gröna
 * klarmarkeringen och rubriken i 24 px fet. Kvar: stegetiketten i versaler
 * och frågan i 22 px, samma form som i de andra flödena.
 */
export default function AnalysisFlowStepHeader({
  stepNumber,
  totalSteps = 7,
  title,
  description,
  isDone,
  rightSlot,
}: AnalysisFlowStepHeaderProps) {
  return (
    <header className="mb-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-steg uppercase text-ink-3">
          Steg {stepNumber} av {totalSteps}
          {isDone ? ' · Klart' : ''}
        </p>
        <h2 className="mt-1.5 text-fraga text-ink-1">{title}</h2>
        <p className="mt-1.5 text-sm leading-[22px] text-ink-2">{description}</p>
      </div>
      {rightSlot && <div className="flex-shrink-0">{rightSlot}</div>}
    </header>
  );
}
