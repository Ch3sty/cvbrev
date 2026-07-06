'use client';

import {
  FAMILY_ORDER,
  FAMILY_LABELS,
  LEVEL_LABELS,
  type TestBadge,
} from './types';

/**
 * Tre små fyrkantiga prickar (matrislogik/verbalt/numeriskt) för tabellens
 * testkolumn. Fylld och mörk = topp 10 %, medium = topp 25-50 %, ofylld grå =
 * ej testad eller lägre. Tooltip med exakt tolkning per familj.
 */
export default function PercentileDots({ badges }: { badges: TestBadge[] }) {
  const byFamily = new Map(badges.map((b) => [b.family, b]));

  return (
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
            : `${FAMILY_LABELS[family]} · ${badge.bestScore ?? '?'}% rätt`
          : `${FAMILY_LABELS[family]} · ej testad`;

        return (
          <span key={family} className="relative group/dot inline-flex">
            <span
              className={`w-2.5 h-2.5 rounded-[3px] border ${dotClass}`}
              aria-label={tooltip}
              role="img"
            />
            <span
              className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/dot:block whitespace-nowrap rounded-lg bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1.5 z-30"
              role="presentation"
            >
              {tooltip}
            </span>
          </span>
        );
      })}
    </div>
  );
}
