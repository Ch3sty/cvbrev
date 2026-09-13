// Horisontell trattvy: Sökta -> Svar -> Intervju -> Erbjudande.
// Sequentiell ink-ramp (ljus -> mörk), direktetiketter med antal och
// procent av föregående steg. Ren HTML, fungerar i både klient- och
// serverkomponenter samt i print.

import type { ApplicationStats } from '@/lib/applications/status';

interface FunnelBarsProps {
  stats: ApplicationStats;
  /** Ghost-läge: låg opacitet med exempelsiffror när datan är för tunn. */
  ghost?: boolean;
}

// Trattens steg blir mörkare, inte färgade: djup via toner, aldrig orange yta.
const STEP_TONE = ['bg-kant-stark', 'bg-ink-3', 'bg-ink-2', 'bg-ink-1'];

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
            <div className="w-20 shrink-0 text-right text-meta text-ink-3 sm:w-24">
              {step.label}
            </div>
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <div className="h-6 flex-1 overflow-hidden rounded-md bg-insunken shadow-insunken">
                {step.value > 0 && (
                  <div
                    className={`h-full rounded-md ${STEP_TONE[i]}`}
                    style={{ width: `${widthPct}%` }}
                  />
                )}
              </div>
              <div className="w-16 shrink-0 whitespace-nowrap text-meta tabular-nums text-ink-2">
                <span className="font-medium">{step.value}</span>
                {pctOfPrev !== null && <span className="text-ink-3"> ({pctOfPrev}%)</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
