'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, History } from 'lucide-react';
import { DIMENSION_META } from '@/lib/personalityTest/insights';
import type { BigFiveScores } from '@/lib/personalityTest/types';

interface ProfileSummaryCardProps {
  scores: BigFiveScores;
  lastCompletedAt: string;
  resultsHref: string;
  attempts: number;
}

const ORDER = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as const;

export default function ProfileSummaryCard({
  scores,
  lastCompletedAt,
  resultsHref,
  attempts,
}: ProfileSummaryCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2, ease: 'easeOut' }}
      className="bg-white rounded-3xl border border-orange-100 overflow-hidden"
      style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.18)' }}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1">
              Din senaste profil
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Big Five-resultat
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 inline-flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" strokeWidth={2.5} />
              {new Date(lastCompletedAt).toLocaleDateString('sv-SE')} · {attempts}{' '}
              {attempts === 1 ? 'försök' : 'försök'}
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {ORDER.map((dim) => {
            const meta = DIMENSION_META[dim];
            const score = scores[dim];
            return (
              <div key={dim}>
                <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
                  <span className="font-semibold text-slate-700">{meta.name}</span>
                  <span className="font-bold text-slate-900 tabular-nums">{score}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${score}%`,
                      background: 'linear-gradient(90deg, #FB923C, #DC2626, #BE185D)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <Link
          href={resultsHref}
          className="inline-flex items-center justify-between gap-2 w-full px-4 py-3 rounded-xl border border-orange-200 bg-orange-50/50 hover:bg-orange-50 text-orange-700 font-semibold text-sm transition-colors min-h-[48px]"
        >
          <span>Se hela analysen</span>
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </Link>
      </div>
    </motion.section>
  );
}
