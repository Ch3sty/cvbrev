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
      className="relative bg-white rounded-3xl border border-orange-200/60 overflow-hidden"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.18)' }}
    >
      <div
        className="absolute top-0 inset-x-0 h-1"
        style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626, #BE185D)' }}
      />

      <div className="p-5 sm:p-6 md:p-7 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div className="flex-shrink-0">
          <EmptyStateIllustration className="w-24 h-24 sm:w-28 sm:h-28" />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
            <Target className="w-3 h-3" strokeWidth={2.5} />
            Kom igång
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 leading-tight">
            Börja din första utmaning
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed max-w-md mx-auto sm:mx-0">
            Vi rekommenderar att börja med <span className="font-semibold">Logiktest (Grund)</span>.
            Det är den vanligaste typen av begåvningstest och en mjuk start på mönsterigenkänning.
          </p>
          <Link
            href="/dashboard/tester/matrislogik-grund"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:-translate-y-0.5 min-h-[44px] touch-manipulation"
            style={{
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
              boxShadow: '0 6px 16px -4px rgba(220, 38, 38, 0.4)',
            }}
          >
            Starta första testet
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
