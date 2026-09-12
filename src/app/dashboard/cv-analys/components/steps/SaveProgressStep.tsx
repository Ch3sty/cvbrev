'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import SaveProgressIllustration from '../illustrations/SaveProgressIllustration';

interface SaveProgressStepProps {
  progress: number; // 0-100
}

const STAGES = [
  { threshold: 0, text: 'Sparar ditt CV', body: 'Vi lägger ditt förbättrade CV i biblioteket.' },
  { threshold: 40, text: 'Genererar PDF', body: 'Vi formaterar enligt din valda mall.' },
  { threshold: 80, text: 'Snart klart', body: 'Vi sätter de sista detaljerna på plats.' },
];

/**
 * Steg 5b: Visas medan vi sparar och genererar PDF.
 * Ingen maskot, custom illustration av papper som byggs upp.
 */
export default function SaveProgressStep({ progress }: SaveProgressStepProps) {
  const [stageIndex, setStageIndex] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    if (progress < 40) setStageIndex(0);
    else if (progress < 80) setStageIndex(1);
    else setStageIndex(2);
  }, [progress]);

  const currentStage = STAGES[stageIndex];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden bg-white rounded-xl border border-orange-200/50 p-5 sm:p-7 md:p-10"
    >
      <div className="relative flex flex-col items-center text-center">
        <SaveProgressIllustration progress={progress} stage={stageIndex} />

        <div className="mt-6 mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
          {stageIndex === 2 ? 'Slutför' : 'Pågår'}
        </div>

        <AnimatePresence mode="wait">
          <motion.h3
            key={stageIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight mb-2"
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
            className="text-sm text-neutral-600 max-w-md leading-relaxed"
          >
            {currentStage.body}
          </motion.p>
        </AnimatePresence>

        {/* Progress-bar */}
        <div className="w-full max-w-md mt-7">
          <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full rounded-full bg-orange-600"
            />
          </div>
          <div className="flex items-center justify-between mt-2.5 text-xs">
            <span className="tabular-nums font-semibold text-orange-700">
              {Math.round(progress)}%
            </span>
            <span className="text-neutral-500">Tar 5–10 sekunder</span>
          </div>
        </div>

        {/* Stage-indikatorer */}
        <div className="flex gap-1.5 mt-6">
          {STAGES.map((_, index) => (
            <motion.div
              key={index}
              animate={{
                scale: index === stageIndex ? 1.1 : 1,
                opacity: index <= stageIndex ? 1 : 0.4,
              }}
              transition={{ duration: 0.3 }}
              className={`h-1.5 w-10 rounded-full ${
                index < stageIndex
                  ? 'bg-emerald-600'
                  : index === stageIndex
                    ? 'bg-orange-600'
                    : 'bg-neutral-200'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
