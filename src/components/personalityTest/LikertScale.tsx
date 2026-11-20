'use client';

/**
 * Skalan i personlighetstestet som Svarskort (plan-testflode-2026-11-20
 * avsnitt 2 och 3.1, etapp 4): fem rader på mobil, fem lika breda i rad på
 * dator. Designsystemets färger, ingen gradient och inget rörelsebibliotek.
 * Brickan bär siffran (1 till 5) i stället för en bokstav; vald är bläck.
 */

import type { LikertValue } from '@/lib/personalityTest/types';

interface LikertScaleProps {
  value: LikertValue | null;
  onChange: (value: LikertValue) => void;
  disabled?: boolean;
}

const OPTIONS: { value: LikertValue; label: string }[] = [
  { value: 1, label: 'Stämmer inte alls' },
  { value: 2, label: 'Stämmer dåligt' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Stämmer bra' },
  { value: 5, label: 'Stämmer perfekt' },
];

export default function LikertScale({ value, onChange, disabled }: LikertScaleProps) {
  return (
    <div role="radiogroup" aria-label="Hur väl stämmer påståendet?" className="flex flex-col gap-2 lg:grid lg:grid-cols-5" data-likert>
      {OPTIONS.map((o) => {
        const vald = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={vald}
            aria-label={`${o.label} (${o.value})`}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            data-tillstand={vald ? 'vald' : 'neutral'}
            data-svar={o.value}
            className={`sess-kort flex min-h-[52px] w-full touch-manipulation items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-base font-medium leading-[22px] text-ink-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--fokus,var(--ink-1))] disabled:cursor-default lg:min-h-[104px] lg:flex-col lg:justify-center lg:gap-2 lg:px-2 lg:text-center lg:text-sm lg:leading-[18px] ${
              vald ? 'border-ink-1 bg-papper shadow-[inset_0_0_0_1px_var(--ink-1)]' : 'border-kant bg-papper hover:border-kant-stark'
            }`}
          >
            <span
              aria-hidden="true"
              className={`sess-bricka inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-bold leading-4 lg:h-8 lg:w-8 lg:text-[14px] ${
                vald ? 'bg-ink-1 text-papper' : 'bg-papper-2 text-ink-2'
              }`}
            >
              {o.value}
            </span>
            <span className="min-w-0 flex-1 lg:flex-none">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
