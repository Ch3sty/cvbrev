'use client';

import { Check } from 'lucide-react';

interface PassageNavigationProps {
  totalPassages: number;
  currentPassage: number;
  // För varje passage: hur många statements har besvarats?
  answeredPerPassage: number[];
  statementsPerPassage: number;
  onNavigate: (index: number) => void;
}

/**
 * Hopp mellan passager. Aktuell = kant i ink (valt), klar = bock i positiv,
 * påbörjad = siffra i ink-1 med starkare kant. Ingen fylld yta.
 */
export default function PassageNavigation({
  totalPassages,
  currentPassage,
  answeredPerPassage,
  statementsPerPassage,
  onNavigate,
}: PassageNavigationProps) {
  const totalAnswered = answeredPerPassage.reduce((a, b) => a + b, 0);
  const totalStatements = totalPassages * statementsPerPassage;

  return (
    <nav className="rounded-xl border border-kant bg-panel p-4" aria-label="Navigera mellan passager">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink-3">Passager</p>
        <p className="text-meta tabular-nums text-ink-3">
          {totalAnswered} / {totalStatements} besvarade
        </p>
      </div>

      <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
        {Array.from({ length: totalPassages }).map((_, i) => {
          const isCurrent = currentPassage === i;
          const answered = answeredPerPassage[i] || 0;
          const isComplete = answered === statementsPerPassage;
          const hasProgress = answered > 0 && !isComplete;

          return (
            <PassageButton
              key={i}
              index={i}
              isCurrent={isCurrent}
              isComplete={isComplete}
              hasProgress={hasProgress}
              answered={answered}
              total={statementsPerPassage}
              onClick={() => onNavigate(i)}
            />
          );
        })}
      </div>
    </nav>
  );
}

function PassageButton({
  index,
  isCurrent,
  isComplete,
  hasProgress,
  answered,
  total,
  onClick,
}: {
  index: number;
  isCurrent: boolean;
  isComplete: boolean;
  hasProgress: boolean;
  answered: number;
  total: number;
  onClick: () => void;
}) {
  const tone = isCurrent
    ? 'border-ink-1 font-medium text-ink-1 shadow-val'
    : isComplete
      ? 'border-kant text-positiv hover:border-kant-stark'
      : hasProgress
        ? 'border-kant-stark text-ink-1 hover:border-ink-1'
        : 'border-kant text-ink-2 hover:border-kant-stark';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-11 touch-manipulation items-center justify-center rounded-lg border bg-panel text-sm tabular-nums transition-colors active:bg-insunken ${tone}`}
      aria-label={`Gå till passage ${index + 1}${isComplete ? ' (klar)' : hasProgress ? ` (${answered}/${total} besvarade)` : ''}${isCurrent ? ' (aktuell)' : ''}`}
      aria-current={isCurrent ? 'step' : undefined}
    >
      {isComplete && !isCurrent ? (
        <Check className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
      ) : (
        <span>{index + 1}</span>
      )}
    </button>
  );
}
