'use client';

/**
 * Skalan i personlighetstestet som Svarskort (plan-testflode-2026-11-20
 * avsnitt 2 och 3.1, etapp 4; omgång 2 steg B2, skissens Personlighet-1440
 * och Personlighet-412): fem lika breda kort i rad, 104 px höga på mobil
 * (siffran 18 px i en 34 px bricka, etiketten 11/14) och 112 px på dator
 * (22 px i 40 px, etiketten 13/17). Designsystemets färger, ingen gradient
 * och inget rörelsebibliotek. Brickan bär siffran (1 till 5) i stället för
 * en bokstav; vald är bläck.
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
    <div role="radiogroup" aria-label="Hur väl stämmer påståendet?" className="grid grid-cols-5 gap-1.5 lg:gap-2" data-likert>
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
            className={`sess-kort flex h-[104px] min-w-0 w-full touch-manipulation flex-col items-center justify-center gap-1.5 rounded-xl border px-1 py-2 text-center text-[11px] font-medium leading-[14px] text-ink-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--fokus,var(--ink-1))] disabled:cursor-default lg:h-[112px] lg:gap-2.5 lg:px-2 lg:text-[13px] lg:leading-[17px] ${
              vald ? 'border-ink-1 bg-papper shadow-[inset_0_0_0_1px_var(--ink-1)]' : 'border-kant bg-papper hover:border-kant-stark'
            }`}
          >
            <span
              aria-hidden="true"
              className={`sess-bricka inline-flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full font-sess-display text-[18px] font-extrabold leading-none lg:h-10 lg:w-10 lg:text-[22px] ${
                vald ? 'bg-ink-1 text-papper' : 'bg-papper-2 text-ink-2'
              }`}
            >
              {o.value}
            </span>
            <span className="min-w-0 break-words">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
