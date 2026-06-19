'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { LineChart, ArrowRight } from 'lucide-react';
import TestProgressCard from './TestProgressCard';
import { ALL_COGNITIVE_TESTS } from './testCatalog';
import { EmptyStateIllustration } from './illustrations/TesterHubIcons';
import type { PerTestStats, TestSlug } from '@/hooks/use-all-test-stats';

interface Props {
  perTest: Record<TestSlug, PerTestStats>;
}

export default function DevelopmentView({ perTest }: Props) {
  const testedCognitive = ALL_COGNITIVE_TESTS.filter((t) => perTest[t.slug]?.attempts > 0);

  // Utvecklingsvyn handlar om kognitiva test där poäng kan följas över tid.
  // Personlighetsresultatet bor på Tester-fliken, inte här.
  if (testedCognitive.length === 0) {
    return <DevelopmentEmpty />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5 sm:space-y-6"
    >
      <div>
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1">
          <LineChart className="w-3.5 h-3.5" strokeWidth={2.5} />
          Din utveckling
        </div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          Så har du förbättrats
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
          Varje stapel är ett försök. Linjen visar hur dina resultat rör sig över tid.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {testedCognitive.map((def, i) => (
          <TestProgressCard key={def.slug} def={def} stats={perTest[def.slug]} index={i} />
        ))}
      </div>
    </motion.div>
  );
}

function DevelopmentEmpty() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-3xl border border-orange-200/60 p-6 sm:p-8 text-center"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.12)' }}
    >
      <div className="flex justify-center mb-3">
        <EmptyStateIllustration className="w-24 h-24 sm:w-28 sm:h-28" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
        Din utveckling visas här
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto mb-4">
        Gör ett test så börjar vi rita upp hur dina resultat förbättras över tid, test för test.
      </p>
      <Link
        href="/dashboard/tester/matrislogik-grund"
        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:-translate-y-0.5 min-h-[44px] touch-manipulation"
        style={{
          background: 'linear-gradient(135deg, #F97316, #DC2626)',
          boxShadow: '0 6px 16px -4px rgba(220, 38, 38, 0.4)',
        }}
      >
        Gör ditt första test
        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
      </Link>
    </motion.div>
  );
}
