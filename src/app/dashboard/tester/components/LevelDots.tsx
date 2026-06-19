'use client';

import type { TestLevelLabel } from './TestCard';

/**
 * Nivåindikator: 1/2/3 fyllda punkter som visar Grund/Avancerad/Expert visuellt.
 * Ersätter behovet av olika ikoner per nivå — samma testtyp-ikon, men dotsen
 * berättar hur svårt testet är. Färgkodas som det gamla nivå-pillret.
 */

const LEVEL_INDEX: Record<TestLevelLabel, number> = {
  Grund: 1,
  Avancerad: 2,
  Expert: 3,
};

const FILLED_COLOR: Record<TestLevelLabel, string> = {
  Grund: '#94A3B8', // slate
  Avancerad: '#F59E0B', // amber
  Expert: '#E11D48', // rose
};

interface Props {
  level: TestLevelLabel;
  /** Visa etikett bredvid punkterna. */
  showLabel?: boolean;
  className?: string;
}

export default function LevelDots({ level, showLabel = false, className = '' }: Props) {
  const filled = LEVEL_INDEX[level];
  const color = FILLED_COLOR[level];

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      title={`Svårighetsnivå: ${level}`}
    >
      <span className="inline-flex items-center gap-1">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full transition-colors"
            style={{ backgroundColor: i <= filled ? color : '#E2E8F0' }}
          />
        ))}
      </span>
      {showLabel && (
        <span
          className="text-[9px] font-bold uppercase tracking-[0.14em]"
          style={{ color }}
        >
          {level}
        </span>
      )}
    </span>
  );
}
