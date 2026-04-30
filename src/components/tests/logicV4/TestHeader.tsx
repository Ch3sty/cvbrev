'use client';

import { motion } from 'framer-motion';
import { Clock, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TestHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredCount: number;
  startedAt: Date;
}

export function TestHeader({
  currentQuestion,
  totalQuestions,
  answeredCount,
  startedAt,
}: TestHeaderProps) {
  const [elapsedTime, setElapsedTime] = useState('00:00');

  useEffect(() => {
    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setElapsedTime(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const progressPercent = (answeredCount / totalQuestions) * 100;

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
        {/* Top row */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          {/* Timer */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-50 rounded-full border border-orange-200/60"
          >
            <Clock className="w-3.5 h-3.5 text-orange-600" strokeWidth={2.5} />
            <span className="text-xs sm:text-sm font-mono font-bold text-orange-700 tabular-nums">
              {elapsedTime}
            </span>
          </motion.div>

          {/* Question number (center) */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold leading-none mb-0.5">
              Fråga
            </p>
            <p className="text-base sm:text-lg font-bold text-slate-900 tabular-nums leading-none">
              {currentQuestion + 1}
              <span className="text-slate-400 font-medium"> / {totalQuestions}</span>
            </p>
          </motion.div>

          {/* Answered count */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 rounded-full border border-emerald-200/60"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
            <span className="text-xs sm:text-sm font-bold text-emerald-700 tabular-nums">
              {answeredCount}
              <span className="hidden sm:inline"> / {totalQuestions}</span>
            </span>
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #F97316, #DC2626, #BE185D)' }}
          />
        </div>
      </div>
    </div>
  );
}
