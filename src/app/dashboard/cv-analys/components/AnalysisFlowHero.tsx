'use client';

import { motion } from 'framer-motion';
import { HeroAnalysisIcon } from './illustrations/AnalysisIcons';

export default function AnalysisFlowHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex items-center gap-4 sm:gap-5"
    >
      <div className="flex-shrink-0">
        <HeroAnalysisIcon className="w-16 h-16 sm:w-20 sm:h-20" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 mb-1">
          CV-analys
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
          Vi optimerar ditt CV
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1.5 leading-relaxed">
          Vi hittar exakt vad som håller dig tillbaka och visar hur du fixar det.
        </p>
      </div>
    </motion.section>
  );
}
