'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Target } from 'lucide-react';
import { EmptyStateIllustration } from './illustrations/TesterHubIcons';

export default function EmptyTestsCallout() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="relative bg-white rounded-xl border border-orange-200/60 overflow-hidden"
    >
      <div className="p-5 sm:p-6 md:p-7 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div className="flex-shrink-0">
          <EmptyStateIllustration className="w-24 h-24 sm:w-28 sm:h-28" />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
            <Target className="w-3 h-3" strokeWidth={2.5} />
            Kom igång
          </div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-1 leading-tight">
            Börja din första utmaning
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 mb-4 leading-relaxed max-w-md mx-auto sm:mx-0">
            Vi rekommenderar att börja med <span className="font-semibold">Logiktest (Grund)</span>.
            Det är den vanligaste typen av begåvningstest och en mjuk start på mönsterigenkänning.
          </p>
          <Link
            href="/dashboard/tester/matrislogik-grund"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:-translate-y-0.5 min-h-[44px] touch-manipulation bg-orange-600 hover:bg-orange-700"
          >
            Starta första testet
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
