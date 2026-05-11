'use client';

import { motion } from 'framer-motion';

interface TestHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredCount: number;
}

export default function TestHeader({
  currentQuestion,
  totalQuestions,
  answeredCount,
}: TestHeaderProps) {
  const progressPct = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/60">
      <div className="container mx-auto max-w-3xl px-3 sm:px-4 py-3">
        <div className="flex items-center justify-between gap-3 text-xs sm:text-sm mb-2">
          <span className="font-bold text-slate-900 tabular-nums">
            Fråga {currentQuestion + 1}{' '}
            <span className="font-normal text-slate-500">av {totalQuestions}</span>
          </span>
          <span className="font-semibold tabular-nums px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
            {answeredCount} svar · {progressPct}%
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #FB923C, #DC2626, #BE185D)',
            }}
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}
