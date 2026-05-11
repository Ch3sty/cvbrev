'use client';

import { motion } from 'framer-motion';
import { DIMENSION_META, bandFor } from '@/lib/personalityTest/insights';
import type { BigFiveScores } from '@/lib/personalityTest/types';

interface BigFiveChartProps {
  scores: BigFiveScores;
}

const ORDER = [
  'openness',
  'conscientiousness',
  'extraversion',
  'agreeableness',
  'neuroticism',
] as const;

const BAND_LABELS: Record<'low' | 'mid' | 'high', string> = {
  low: 'Låg',
  mid: 'Medel',
  high: 'Hög',
};

export default function BigFiveChart({ scores }: BigFiveChartProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="bg-white rounded-3xl border border-orange-100 overflow-hidden"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.18)' }}
    >
      <div
        className="h-1"
        style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626, #BE185D)' }}
      />
      <div className="p-5 sm:p-7">
        <div className="mb-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1">
            Översikt
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Dina fem dimensioner
          </h2>
        </div>

        <div className="space-y-4">
          {ORDER.map((dim, idx) => {
            const meta = DIMENSION_META[dim];
            const score = scores[dim];
            const band = bandFor(score);

            return (
              <motion.div
                key={dim}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.15 + idx * 0.05 }}
              >
                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {meta.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                        band === 'high'
                          ? 'bg-orange-100 text-orange-700 border border-orange-200'
                          : band === 'low'
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {BAND_LABELS[band]}
                    </span>
                    <span className="text-lg font-bold text-slate-900 tabular-nums w-9 text-right">
                      {score}
                    </span>
                  </div>
                </div>

                <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                  {/* Skala-markörer */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    <div className="flex-1 border-r border-white/60" />
                    <div className="flex-1 border-r border-white/60" />
                    <div className="flex-1" />
                  </div>
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background:
                        'linear-gradient(90deg, #FB923C, #DC2626, #BE185D)',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + idx * 0.08, ease: 'easeOut' }}
                  />
                </div>

                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                  <span>{meta.poles.low}</span>
                  <span>{meta.poles.high}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
