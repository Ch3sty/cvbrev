'use client';

import { motion } from 'framer-motion';
import { Trophy, TrendingUp } from 'lucide-react';

interface NumericalResultsHeroProps {
  score: number;
  totalQuestions: number;
  percentage: number;
  completedDate: string;
  timeSpent: number;
  variant: 'v1' | 'v2';
}

export default function NumericalResultsHero({
  score,
  totalQuestions,
  percentage,
  completedDate,
  timeSpent,
  variant,
}: NumericalResultsHeroProps) {
  const isExcellent = percentage >= 80;
  const versionLabel = variant === 'v2' ? 'Resultat — avancerad' : 'Resultat';

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl text-white"
      style={{
        background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        boxShadow: '0 20px 60px -20px rgba(220, 38, 38, 0.45)',
      }}
    >
      <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" aria-hidden="true">
        <pattern id={`results-num-dots-${variant}`} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="0.8" fill="white" />
        </pattern>
        <rect width="100%" height="100%" fill={`url(#results-num-dots-${variant})`} />
      </svg>

      <div className="relative p-6 sm:p-8 md:p-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white/20 backdrop-blur-sm mb-4">
          {isExcellent ? (
            <Trophy className="w-3.5 h-3.5" strokeWidth={2.5} />
          ) : (
            <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />
          )}
          {versionLabel}
        </div>

        <div className="flex items-baseline justify-center gap-3 mb-2 flex-wrap">
          <span className="text-5xl sm:text-6xl md:text-7xl font-black tabular-nums leading-none">
            {score}
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-white/80">
            / {totalQuestions}
          </span>
          <span
            className="inline-flex items-center justify-center px-3 py-1 rounded-full text-base sm:text-lg font-bold tabular-nums bg-white text-orange-700 ml-1"
            style={
              isExcellent ? { boxShadow: '0 0 20px 4px rgba(251, 191, 36, 0.5)' } : undefined
            }
          >
            {percentage}%
          </span>
        </div>

        <p className="text-sm sm:text-base opacity-95">
          Slutfört på {Math.floor(timeSpent / 60)} min {timeSpent % 60} sek · {completedDate}
        </p>
      </div>
    </motion.section>
  );
}
