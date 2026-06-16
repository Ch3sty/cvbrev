'use client';

/**
 * PeriodSelector — segmenterad period-kontroll i den nya admin-standarden.
 * Aktiv = orange fylld (appens accent); inaktiv = neutral. Ren, ingen animation.
 *
 * Generisk: ange egna `options` (t.ex. 7/30/90/Alla) eller använd default 7/30/90.
 * Värdena är strängar för flexibilitet ('7' | 'all' osv.).
 */
export type PeriodDays = 7 | 30 | 90;

export interface PeriodOption {
  value: string;
  label: string;
}

const DEFAULT_OPTIONS: PeriodOption[] = [
  { value: '7', label: '7 dagar' },
  { value: '30', label: '30 dagar' },
  { value: '90', label: '90 dagar' },
];

interface PeriodSelectorProps {
  value: string | number;
  onChange: (v: string) => void;
  options?: PeriodOption[];
}

export default function PeriodSelector({ value, onChange, options = DEFAULT_OPTIONS }: PeriodSelectorProps) {
  return (
    <div className="inline-flex items-center gap-1 bg-slate-100 rounded-lg p-1">
      {options.map((opt) => {
        const active = String(opt.value) === String(value);
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
