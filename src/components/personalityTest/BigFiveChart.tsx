'use client';

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
    <section className="steg s1 overflow-hidden rounded-2xl border border-[color:var(--lyft-kant)] bg-papper shadow-lyft">
      <div className="p-5 sm:p-7">
        <div className="mb-5">
          <div className="mb-1 text-ey uppercase text-koppar-ink">
            Översikt
          </div>
          <h2 className="font-display text-xl font-bold tracking-tight text-ink-1 sm:text-2xl">
            Dina fem dimensioner
          </h2>
        </div>

        <div className="space-y-4">
          {ORDER.map((dim, idx) => {
            const meta = DIMENSION_META[dim];
            const score = scores[dim];
            const band = bandFor(score);

            return (
              <div key={dim} data-dimension={dim} data-index={idx}>
                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                  <h3 className="text-sm sm:text-base font-bold text-ink-1">
                    {meta.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                        band === 'high'
                          ? 'border border-ink-1 bg-papper text-ink-1'
                          : band === 'low'
                          ? 'bg-papper-2 text-ink-2 border border-kant'
                          : 'border border-kant-stark bg-papper text-ink-2'
                      }`}
                    >
                      {BAND_LABELS[band]}
                    </span>
                    <span className="text-lg font-bold text-ink-1 tabular-nums w-9 text-right">
                      {score}
                    </span>
                  </div>
                </div>

                <div className="relative h-3 bg-papper-2 rounded-full overflow-hidden">
                  {/* Skala-markörer */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    <div className="flex-1 border-r border-papper" />
                    <div className="flex-1 border-r border-papper" />
                    <div className="flex-1" />
                  </div>
                  <div className="h-full rounded-full bg-koppar" style={{ width: `${score}%` }} />
                </div>

                <div className="flex items-center justify-between mt-1 text-[10px] text-ink-3">
                  <span>{meta.poles.low}</span>
                  <span>{meta.poles.high}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
