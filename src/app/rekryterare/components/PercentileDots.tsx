'use client';

import {
  FAMILY_ORDER,
  FAMILY_LABELS,
  LEVEL_LABELS,
  type TestBadge,
} from './types';

/**
 * Tre små fyrkantiga prickar (matrislogik/verbalt/numeriskt) för tabellens
 * testkolumn, plus en kompakt etikett för den bästa percentilen så raden bär
 * mening utan att man behöver hovra. Fylld och mörk = topp 10 %, medium =
 * topp 25-50 %, ofylld grå = ej testad eller lägre. Varje prick är fokuserbar
 * (tangentbord) med tooltip via aria-label + hover/fokus.
 */

/** Kort etikett för bästa percentilen: "Topp 10%", eller nivå när percentil saknas. */
function summaryLabel(badges: TestBadge[]): { text: string; strong: boolean } | null {
  const withPct = badges.filter((b) => b.percentile !== null);
  if (withPct.length > 0) {
    // Högsta percentilen = lägst "topp X %".
    const best = withPct.reduce((a, b) => ((b.percentile ?? 0) > (a.percentile ?? 0) ? b : a));
    const topX = Math.max(1, 100 - (best.percentile ?? 0));
    return { text: `Topp ${topX} %`, strong: topX <= 25 };
  }
  // Ingen percentil (litet underlag): visa högsta bevisade nivån i stället.
  const withLevel = badges.filter((b) => b.level);
  if (withLevel.length > 0) {
    const order = { grund: 0, avancerad: 1, expert: 2 } as const;
    const top = withLevel.reduce((a, b) =>
      order[b.level as keyof typeof order] > order[a.level as keyof typeof order] ? b : a
    );
    return { text: LEVEL_LABELS[top.level!], strong: false };
  }
  return null;
}

export default function PercentileDots({ badges }: { badges: TestBadge[] }) {
  const byFamily = new Map(badges.map((b) => [b.family, b]));
  const summary = summaryLabel(badges);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        {FAMILY_ORDER.map((family) => {
          const badge = byFamily.get(family) ?? null;
          const p = badge?.percentile ?? null;

          let dotClass = 'bg-white border-slate-300';
          if (p !== null && p >= 90) dotClass = 'bg-orange-600 border-orange-600';
          else if (p !== null && p >= 50) dotClass = 'bg-orange-300 border-orange-300';
          else if (badge) dotClass = 'bg-slate-200 border-slate-300';

          const tooltip = badge
            ? p !== null
              ? `${FAMILY_LABELS[family]} · ${badge.level ? LEVEL_LABELS[badge.level] : ''} · topp ${Math.max(1, 100 - p)} %${badge.sampleSize ? ` av ${badge.sampleSize}` : ''}`
              : `${FAMILY_LABELS[family]} · ${badge.level ? LEVEL_LABELS[badge.level] : 'verifierad'}, rangordning byggs upp`
            : `${FAMILY_LABELS[family]} · ej testad`;

          return (
            <span
              key={family}
              className="relative group/dot inline-flex focus:outline-none"
              tabIndex={0}
              role="img"
              aria-label={tooltip}
            >
              <span className={`w-2.5 h-2.5 rounded-[3px] border ${dotClass} group-focus/dot:ring-2 group-focus/dot:ring-orange-400 group-focus/dot:ring-offset-1`} />
              <span
                className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/dot:block group-focus/dot:block whitespace-nowrap rounded-lg bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1.5 z-30"
                role="presentation"
              >
                {tooltip}
              </span>
            </span>
          );
        })}
      </div>
      {summary && (
        <span
          className={`text-[11.5px] font-bold whitespace-nowrap ${
            summary.strong ? 'text-orange-700' : 'text-slate-500'
          }`}
        >
          {summary.text}
        </span>
      )}
    </div>
  );
}
