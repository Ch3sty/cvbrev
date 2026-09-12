'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface PassageNavigationProps {
  totalPassages: number;
  currentPassage: number;
  // För varje passage: hur många statements har besvarats?
  answeredPerPassage: number[];
  statementsPerPassage: number;
  onNavigate: (index: number) => void;
}

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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="bg-white rounded-xl border border-orange-100 p-4 sm:p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
          Navigera mellan passager
        </p>
        <p className="text-xs text-neutral-500 tabular-nums">
          {totalAnswered} / {totalStatements} besvarade
        </p>
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 sm:gap-2">
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
    </motion.div>
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
  // Bestäm bakgrund
  let bgClass: string | undefined;
  let textColor: string;
  let borderClass = 'border border-neutral-200';

  if (isCurrent && isComplete) {
    bgClass = 'bg-orange-600';
    textColor = 'text-white';
    borderClass = 'ring-2 ring-emerald-400';
  } else if (isCurrent) {
    bgClass = 'bg-orange-600';
    textColor = 'text-white';
  } else if (isComplete) {
    bgClass = 'bg-emerald-600';
    textColor = 'text-white';
    borderClass = '';
  } else if (hasProgress) {
    bgClass = 'bg-amber-500';
    textColor = 'text-white';
    borderClass = '';
  } else {
    textColor = 'text-neutral-600 hover:text-orange-700';
  }

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative aspect-square rounded-lg font-bold text-xs sm:text-sm transition-all
        flex items-center justify-center min-h-[44px] touch-manipulation
        ${textColor}
        ${bgClass ? `${bgClass} ${borderClass}` : `bg-white ${borderClass} hover:border-orange-300`}
      `}
      aria-label={`Gå till passage ${index + 1}${isComplete ? ' (klar)' : hasProgress ? ` (${answered}/${total} besvarade)` : ''}${isCurrent ? ' (aktuell)' : ''}`}
      aria-current={isCurrent ? 'step' : undefined}
    >
      {isComplete && !isCurrent ? (
        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={3} />
      ) : (
        <span>{index + 1}</span>
      )}
    </motion.button>
  );
}
