'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown } from 'lucide-react';

/**
 * ConversionFunnel — horisontell, krympande stapel-funnel (ren CSS, ingen Recharts).
 *
 * Varje steg är en horisontell stapel vars bredd = andel kvar av steg 1, så ögat
 * ser avhoppet direkt. Mellan varje par av steg visas drop-off (hur många/hur
 * stor andel som tappades), vilket är det egentliga budskapet i en funnel.
 * Branschstandard (Amplitude/Mixpanel) och betydligt mer läsbart än en triangel.
 */
export interface FunnelStageData {
  name: string;
  value: number;
  fill: string;
  icon?: ReactNode;
}

interface Props {
  stages: FunnelStageData[];
}

export default function ConversionFunnel({ stages }: Props) {
  const top = stages[0]?.value || 0;
  if (stages.length === 0 || top === 0) {
    return <div className="py-12 text-center text-sm text-slate-400">Ingen funnel-data</div>;
  }

  return (
    <div className="space-y-1">
      {stages.map((stage, i) => {
        const widthPct = Math.max((stage.value / top) * 100, 2); // min 2% så stapeln syns
        const ofTotal = Math.round((stage.value / top) * 100);
        const prev = i > 0 ? stages[i - 1] : null;
        const dropped = prev ? prev.value - stage.value : 0;
        const dropPct = prev && prev.value > 0 ? Math.round((dropped / prev.value) * 100) : 0;

        return (
          <div key={stage.name}>
            {/* Drop-off mellan föregående steg och detta */}
            {prev && (
              <div className="flex items-center gap-1.5 pl-1 py-1 text-xs text-slate-400">
                <TrendingDown className="w-3.5 h-3.5" />
                {dropped > 0 ? (
                  <span>
                    <span className="font-medium text-rose-500">−{dropPct}%</span> · {dropped} tappade
                  </span>
                ) : (
                  <span className="text-emerald-500 font-medium">inget tapp</span>
                )}
              </div>
            )}

            {/* Steg-rad: etikett + stapel */}
            <div className="flex items-center gap-4">
              {/* Etikett */}
              <div className="flex items-center gap-2.5 w-44 flex-shrink-0">
                {stage.icon && (
                  <span
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${stage.fill}1a`, color: stage.fill }}
                  >
                    {stage.icon}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{stage.name}</p>
                  <p className="text-xs text-slate-400">Steg {i + 1}</p>
                </div>
              </div>

              {/* Stapel */}
              <div className="flex-1 min-w-0">
                <div className="relative h-11">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPct}%` }}
                    transition={{ duration: 0.7, delay: i * 0.1, ease: 'easeOut' }}
                    className="h-full rounded-lg flex items-center"
                    style={{ backgroundColor: stage.fill, minWidth: 44 }}
                  >
                    <span className="px-3 text-white font-semibold tabular-nums text-sm whitespace-nowrap">
                      {stage.value}
                    </span>
                  </motion.div>
                  {/* % av alla — utanför stapeln till höger */}
                  <span className="absolute top-1/2 -translate-y-1/2 ml-2 text-xs font-medium text-slate-400 tabular-nums"
                        style={{ left: `${widthPct}%` }}>
                    {ofTotal}% av alla
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
