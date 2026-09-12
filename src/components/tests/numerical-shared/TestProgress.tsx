'use client';

import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface TestProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  elapsedSeconds: number;
}

export default function TestProgress({
  currentQuestion,
  totalQuestions,
  elapsedSeconds,
}: TestProgressProps) {
  const percentage = Math.min(100, Math.round(((currentQuestion - 1) / totalQuestions) * 100));
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const timeLabel = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <div
      className="bg-white rounded-xl border border-orange-200/60 p-3 sm:p-4"
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="text-xs sm:text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
          Fråga {currentQuestion} / {totalQuestions}
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 tabular-nums">
          <Clock className="w-3.5 h-3.5 text-orange-600" strokeWidth={2.5} />
          {timeLabel}
        </div>
      </div>
      <div className="h-2 rounded-full bg-orange-100 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-orange-600"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
