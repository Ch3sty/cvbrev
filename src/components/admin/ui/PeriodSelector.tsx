'use client';

/**
 * PeriodSelector — segmenterad period-kontroll i den nya admin-standarden.
 * Aktiv = orange fylld (appens accent); inaktiv = neutral. Ren, ingen animation.
 */
export type PeriodDays = 7 | 30 | 90;

const OPTIONS: { value: PeriodDays; label: string }[] = [
  { value: 7, label: '7 dagar' },
  { value: 30, label: '30 dagar' },
  { value: 90, label: '90 dagar' },
];

interface PeriodSelectorProps {
  value: PeriodDays;
  onChange: (v: PeriodDays) => void;
}

export default function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="inline-flex items-center gap-1 bg-slate-100 rounded-lg p-1">
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              active ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 hover:bg-white/70'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
