'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Briefcase } from 'lucide-react';
import {
  DIMENSION_META,
  DIMENSION_TEXTS,
  bandFor,
} from '@/lib/personalityTest/insights';
import type { Dimension } from '@/lib/personalityTest/types';

interface DimensionCardProps {
  dimension: Dimension;
  score: number;
  index?: number;
}

export default function DimensionCard({
  dimension,
  score,
  index = 0,
}: DimensionCardProps) {
  const meta = DIMENSION_META[dimension];
  const band = bandFor(score);
  const text = DIMENSION_TEXTS[dimension][band];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 * index }}
      className="bg-white rounded-3xl border border-slate-200 overflow-hidden"
      style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.12)' }}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1">
              {meta.name}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
              {text.headline}
            </h3>
          </div>
          <div className="flex-shrink-0 text-right">
            <div
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-2xl text-white font-bold text-sm tabular-nums"
              style={{
                background: 'linear-gradient(135deg, #F97316, #DC2626)',
                boxShadow: '0 4px 12px -3px rgba(220, 38, 38, 0.4)',
              }}
            >
              {score}
            </div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mt-1">
              av 100
            </div>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">
          {text.description}
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div className="rounded-2xl bg-emerald-50/60 border border-emerald-100 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Styrkor
              </span>
            </div>
            <ul className="space-y-1">
              {text.strengths.map((s, i) => (
                <li key={i} className="text-xs sm:text-sm text-slate-700 leading-snug pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-emerald-600 before:font-bold">
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-amber-50/60 border border-amber-100 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Att vara medveten om
              </span>
            </div>
            <ul className="space-y-1">
              {text.watchOuts.map((w, i) => (
                <li key={i} className="text-xs sm:text-sm text-slate-700 leading-snug pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-amber-600 before:font-bold">
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl bg-orange-50/60 border border-orange-100 p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Briefcase className="w-3.5 h-3.5 text-orange-600" strokeWidth={2.5} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700">
              I arbetslivet
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {text.workContext}
          </p>
        </div>
      </div>
    </motion.section>
  );
}
