'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';

interface PremiumRequiredCardProps {
  levelLabel: string;
}

// Visas när session-API:t svarar 403 premium_required, dvs. när en
// icke-premium-användare navigerat direkt till en låst testnivå.
export default function PremiumRequiredCard({ levelLabel }: PremiumRequiredCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative bg-white rounded-3xl border border-orange-200/60 overflow-hidden text-center"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.18)' }}
    >
      <div
        className="absolute top-0 inset-x-0 h-1"
        style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626, #BE185D)' }}
      />
      <div className="p-6 sm:p-8">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mx-auto mb-4"
          style={{
            background: 'linear-gradient(135deg, #F97316, #DC2626)',
            boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.35)',
          }}
        >
          <Lock className="w-5 h-5" strokeWidth={2.25} />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          {levelLabel} ingår i Premium
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
          Uppgradera för att låsa upp alla nivåer och träna på samma svårighetsgrad
          som i skarpa rekryteringstest.
        </p>
        <Link
          href="/priser"
          className="inline-flex items-center gap-2 mt-5 px-5 py-3 rounded-2xl text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #F97316, #DC2626)',
            boxShadow: '0 8px 20px -6px rgba(220, 38, 38, 0.45)',
          }}
        >
          Se Premium
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </Link>
      </div>
    </motion.section>
  );
}
