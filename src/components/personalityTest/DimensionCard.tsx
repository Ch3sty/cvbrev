'use client';

import { CheckCircle2, AlertTriangle, Briefcase } from '@/components/illustrations/RumIkoner';
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
    <section className="steg s2 overflow-hidden rounded-2xl border border-kant bg-papper" data-index={index}>
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="mb-1 text-ey uppercase text-ink-3">
              {meta.name}
            </div>
            <h3 className="font-display text-lg font-bold leading-tight text-ink-1 sm:text-xl">
              {text.headline}
            </h3>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="inline-flex items-center justify-center rounded-xl border border-kant bg-papper-2 px-3 py-1.5 font-display text-lg font-bold tabular-nums text-ink-1">
              {score}
            </div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-ink-3 mt-1">
              av 100
            </div>
          </div>
        </div>

        <p className="text-sm sm:text-base text-ink-2 leading-relaxed mb-4">
          {text.description}
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl bg-positiv-mjuk p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-positiv" strokeWidth={2.5} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-positiv">
                Styrkor
              </span>
            </div>
            <ul className="space-y-1">
              {text.strengths.map((s, i) => (
                <li key={i} className="text-xs sm:text-sm text-ink-2 leading-snug pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-positiv before:font-bold">
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-papper-2 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-ink-2" strokeWidth={2.5} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-2">
                Att vara medveten om
              </span>
            </div>
            <ul className="space-y-1">
              {text.watchOuts.map((w, i) => (
                <li key={i} className="text-xs sm:text-sm text-ink-2 leading-snug pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-ink-3 before:font-bold">
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl bg-ton p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Briefcase className="h-3.5 w-3.5 text-ton-ink" strokeWidth={2.5} />
            <span className="text-[11px] font-bold uppercase tracking-wider text-ton-ink">
              I arbetslivet
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
            {text.workContext}
          </p>
        </div>
      </div>
    </section>
  );
}
