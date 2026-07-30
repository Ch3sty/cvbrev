// Horisontell trattvy: Sökta -> Svar -> Intervju -> Erbjudande.
// Sequentiell orange ramp (ljus -> mörk), direktetiketter med antal och
// procent av föregående steg. Ren HTML, fungerar i både klient- och
// serverkomponenter samt i print.

import type { ApplicationStats } from '@/lib/applications/status';

interface FunnelBarsProps {
  stats: ApplicationStats;
  /** Ghost-läge: låg opacitet med exempelsiffror när datan är för tunn. */
  ghost?: boolean;
}

const STEP_COLORS = ['#FED7AA', '#FDBA74', '#FB923C', '#EA580C'];

export default function FunnelBars({ stats, ghost = false }: FunnelBarsProps) {
  const steps = ghost
    ? [
        { label: 'Sökta', value: 12 },
        { label: 'Svar', value: 5 },
        { label: 'Intervju', value: 3 },
        { label: 'Erbjudande', value: 1 },
      ]
    : [
        { label: 'Sökta', value: stats.totalApplications },
        { label: 'Svar', value: stats.respondedCount },
        { label: 'Intervju', value: stats.interviewedCount },
        { label: 'Erbjudande', value: stats.offerCount },
      ];

  const max = Math.max(steps[0].value, 1);

  return (
    <div className={`space-y-2.5 ${ghost ? 'opacity-40 select-none' : ''}`} aria-hidden={ghost}>
      {steps.map((step, i) => {
        const widthPct = Math.max((step.value / max) * 100, step.value > 0 ? 4 : 0);
        const prev = i > 0 ? steps[i - 1].value : null;
        const pctOfPrev = prev && prev > 0 ? Math.round((step.value / prev) * 100) : null;
        return (
          <div key={step.label} className="flex items-center gap-3">
            <div className="w-20 sm:w-24 flex-shrink-0 text-[12.5px] font-semibold text-slate-600 text-right">
              {step.label}
            </div>
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <div className="flex-1 h-6 bg-slate-100/70 rounded-md overflow-hidden">
                {step.value > 0 && (
                  <div
                    className="h-full rounded-md transition-all duration-500"
                    style={{ width: `${widthPct}%`, backgroundColor: STEP_COLORS[i] }}
                  />
                )}
              </div>
              <div className="flex-shrink-0 text-[12.5px] text-slate-700 tabular-nums whitespace-nowrap w-16">
                <span className="font-bold">{step.value}</span>
                {pctOfPrev !== null && <span className="text-slate-400"> ({pctOfPrev}%)</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
