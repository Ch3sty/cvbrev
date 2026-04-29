'use client';

import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { JobbcoachenChatOrb } from './illustrations/JobbcoachenIcons';

export default function JobbcoachenHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-4"
    >
      <div className="flex items-center gap-4 sm:gap-5">
        <div className="flex-shrink-0">
          <JobbcoachenChatOrb className="w-16 h-16 sm:w-20 sm:h-20" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 mb-1">
            Jobbcoachen
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            Fråga Jobbcoachen
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1.5 leading-relaxed">
            Konkreta svar om svensk arbetsmarknad. Alltid med källor du kan kolla själv.
          </p>
        </div>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
        <Shield className="w-3.5 h-3.5" strokeWidth={2.5} />
        Verifierade källor från Arbetsförmedlingen, SCB, fackförbund och myndigheter
      </div>
    </motion.section>
  );
}
