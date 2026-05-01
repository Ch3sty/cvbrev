'use client';

import { motion } from 'framer-motion';
import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

interface VerbalTestHeaderProps {
  currentPassage: number;
  totalPassages: number;
  answeredCount: number;
  totalStatements: number;
  timeRemaining: number; // sekunder
}

export default function VerbalTestHeader({
  currentPassage,
  totalPassages,
  answeredCount,
  totalStatements,
  timeRemaining,
}: VerbalTestHeaderProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeLabel = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Färgkoda timer baserat på tid kvar
  const isLowTime = timeRemaining < 5 * 60; // sista 5 min
  const isCriticalTime = timeRemaining < 60; // sista minuten

  const progressPercent = (answeredCount / totalStatements) * 100;

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          {/* Timer */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border ${
              isCriticalTime
                ? 'bg-red-50 border-red-200 animate-pulse'
                : isLowTime
                ? 'bg-amber-50 border-amber-200'
                : 'bg-orange-50 border-orange-200/60'
            }`}
          >
            {isCriticalTime ? (
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" strokeWidth={2.5} />
            ) : (
              <Clock
                className={`w-3.5 h-3.5 ${
                  isLowTime ? 'text-amber-600' : 'text-orange-600'
                }`}
                strokeWidth={2.5}
              />
            )}
            <span
              className={`text-xs sm:text-sm font-mono font-bold tabular-nums ${
                isCriticalTime
                  ? 'text-red-700'
                  : isLowTime
                  ? 'text-amber-700'
                  : 'text-orange-700'
              }`}
            >
              {timeLabel}
            </span>
          </motion.div>

          {/* Passage-räknare */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold leading-none mb-0.5">
              Passage
            </p>
            <p className="text-base sm:text-lg font-bold text-slate-900 tabular-nums leading-none">
              {currentPassage + 1}
              <span className="text-slate-400 font-medium"> / {totalPassages}</span>
            </p>
          </motion.div>

          {/* Besvarade påståenden */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 rounded-full border border-emerald-200/60"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
            <span className="text-xs sm:text-sm font-bold text-emerald-700 tabular-nums">
              {answeredCount}
              <span className="hidden sm:inline"> / {totalStatements}</span>
            </span>
          </motion.div>
        </div>

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
