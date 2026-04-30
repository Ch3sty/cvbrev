'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import AnalyzingCvIllustration from '../illustrations/AnalyzingCvIllustration';

interface AnalysisProgressStepProps {
  progress: number; // 0-100
  currentActivity: string;
  estimatedTimeRemaining: number; // seconds
}

const STAGES = [
  { threshold: 0, text: 'Läser ditt CV', body: 'Vi går igenom struktur, sektioner och innehåll.' },
  { threshold: 20, text: 'Identifierar nyckelord', body: 'Vi plockar ut de viktigaste begreppen från din erfarenhet.' },
  { threshold: 45, text: 'Analyserar mot ATS-kriterier', body: 'Vi jämför mot mönster som rekryterarsystem letar efter.' },
  { threshold: 70, text: 'Genererar förbättringar', body: 'Vi formulerar konkreta förslag för varje sektion.' },
  { threshold: 90, text: 'Slutför analysen', body: 'Vi sätter ihop allt till en komplett rapport.' },
];

/**
 * Steg 1: Stor live-scan-animation av CV:t medan AI:n analyserar.
 * Inga maskoter — bara en spektakulär custom SVG-illustration.
 */
export default function AnalysisProgressStep({
  progress,
  estimatedTimeRemaining,
}: AnalysisProgressStepProps) {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    let idx = 0;
    for (let i = STAGES.length - 1; i >= 0; i--) {
      if (progress >= STAGES[i].threshold) {
        idx = i;
        break;
      }
    }
    setStageIndex(idx);
  }, [progress]);

  const currentStage = STAGES[stageIndex];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden bg-white rounded-3xl border border-orange-200/50 p-5 sm:p-7 md:p-10"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.18)' }}
    >
      <DotPatternBg />

      <div className="relative flex flex-col items-center text-center">
        {/* Hjälte-illustration */}
        <AnalyzingCvIllustration progress={progress} />

        {/* Status-text */}
        <div className="mt-6 mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600">
          Pågår
        </div>
        <AnimatePresence mode="wait">
          <motion.h3
            key={stageIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2"
          >
            {currentStage.text}
          </motion.h3>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.p
            key={`body-${stageIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="text-sm text-slate-600 max-w-md leading-relaxed"
          >
            {currentStage.body}
          </motion.p>
        </AnimatePresence>

        {/* Progress-bar */}
        <div className="w-full max-w-md mt-7">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #F97316, #DC2626)' }}
            />
          </div>
          <div className="flex items-center justify-between mt-2.5 text-xs">
            <span className="tabular-nums font-semibold text-orange-700">
              {Math.round(progress)}%
            </span>
            {estimatedTimeRemaining > 0 ? (
              <span className="text-slate-500">~{estimatedTimeRemaining}s kvar</span>
            ) : (
              <span className="text-emerald-600 font-semibold">Klart strax</span>
            )}
          </div>
        </div>

        {/* Stage-indikatorer */}
        <div className="flex gap-1.5 mt-6">
          {STAGES.map((_, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.8, opacity: 0.4 }}
              animate={{
                scale: index === stageIndex ? 1.1 : index < stageIndex ? 1 : 0.85,
                opacity: index <= stageIndex ? 1 : 0.4,
              }}
              transition={{ duration: 0.3 }}
              className="h-1.5 w-8 rounded-full"
              style={{
                background:
                  index < stageIndex
                    ? 'linear-gradient(90deg, #10B981, #059669)'
                    : index === stageIndex
                    ? 'linear-gradient(90deg, #F97316, #DC2626)'
                    : '#E2E8F0',
                boxShadow:
                  index === stageIndex
                    ? '0 2px 8px -2px rgba(220, 38, 38, 0.5)'
                    : 'none',
              }}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function DotPatternBg() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
      aria-hidden="true"
    >
      <pattern
        id="analysis-dots"
        x="0"
        y="0"
        width="32"
        height="32"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="16" cy="16" r="1" fill="#FB923C" />
      </pattern>
      <rect
        width="100%"
        height="100%"
        fill="url(#analysis-dots)"
        opacity="0.4"
      />
    </svg>
  );
}
