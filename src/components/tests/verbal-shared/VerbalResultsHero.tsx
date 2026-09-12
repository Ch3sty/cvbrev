'use client';

import { motion } from 'framer-motion';
import { Trophy, TrendingUp } from 'lucide-react';

interface VerbalResultsHeroProps {
  score: number;
  totalStatements: number;
  percentage: number;
  completedDate: string;
  timeSpent: number;
  variant: 'v1' | 'v2';
}

export default function VerbalResultsHero({
  score,
  totalStatements,
  percentage,
  completedDate,
  timeSpent,
  variant,
}: VerbalResultsHeroProps) {
  const isExcellent = percentage >= 80;
  const versionLabel = variant === 'v2' ? 'Resultat, avancerad' : 'Resultat';

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-xl bg-white border border-neutral-200 text-neutral-900"
    >
      <div className="relative p-6 sm:p-8 md:p-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 mb-4">
          {isExcellent ? <Trophy className="w-3.5 h-3.5" strokeWidth={2.5} /> : <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />}
          {versionLabel}
        </div>

        <div className="flex items-baseline justify-center gap-3 mb-2 flex-wrap">
          <span className="text-5xl sm:text-6xl md:text-7xl font-semibold tabular-nums leading-none">
            {score}
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-neutral-500">
            / {totalStatements}
          </span>
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-base sm:text-lg font-bold tabular-nums bg-orange-600 text-white ml-1">
            {percentage}%
          </span>
        </div>

        <p className="text-sm sm:text-base text-neutral-600">
          Slutfört på {Math.floor(timeSpent / 60)} min {timeSpent % 60} sek · {completedDate}
        </p>
      </div>
    </motion.section>
  );
}
