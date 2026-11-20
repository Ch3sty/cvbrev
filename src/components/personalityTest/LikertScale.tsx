'use client';

/**
 * Skalan i personlighetstestet (omgång 3 steg 2a, skissens Test-personlighet
 * och Mobil-personlighet): fem ringar på en linje som går från indigo till
 * koppar. Ytterlägena störst (68 px på telefonen, 98 på dator), mitten
 * minst; etiketten under ringen. Vald ring fylls med en bock och etiketten
 * blir fet, så att valet syns med mer än färg. Varje ring är en radioknapp
 * hela kolumnen bred (tryckytan är minst 44 px).
 *
 * Samma skala i det publika personlighetsprovet (omgång 2 steg C): `etiketter`
 * ger provets egna ord för lägena och aria-propsen kopplar gruppen till
 * påståendet. Utelämnade: skissens ord.
 */

import type { LikertValue } from '@/lib/personalityTest/types';

interface LikertScaleProps {
  value: LikertValue | null;
  onChange: (value: LikertValue) => void;
  disabled?: boolean;
  /** Lägenas ord, 1 till 5. Utelämnade: testets egna. */
  etiketter?: readonly string[];
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const OPTIONS: { value: LikertValue; label: string }[] = [
  { value: 1, label: 'Stämmer inte alls' },
  { value: 2, label: 'Stämmer dåligt' },
  { value: 3, label: 'Varken eller' },
  { value: 4, label: 'Stämmer delvis' },
  { value: 5, label: 'Stämmer helt' },
];

function Bock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-[42%] w-[42%]">
      <path d="M4.5 12.5l5 5L19.5 7" />
    </svg>
  );
}

export default function LikertScale({ value, onChange, disabled, etiketter, ariaLabel, ariaDescribedBy }: LikertScaleProps) {
  return (
    <div role="radiogroup" aria-label={ariaLabel ?? 'Hur väl stämmer påståendet?'} aria-describedby={ariaDescribedBy} className="sess-skala" data-likert>
      {OPTIONS.map((o) => {
        const vald = value === o.value;
        const label = etiketter?.[o.value - 1] ?? o.label;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={vald}
            aria-label={`${label} (${o.value})`}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            data-tillstand={vald ? 'vald' : 'neutral'}
            data-svar={o.value}
            data-steg={o.value}
            className="sess-skala-val touch-manipulation disabled:cursor-default"
          >
            <span className="sess-skala-hall" aria-hidden="true">
              <i>{vald ? <Bock /> : null}</i>
            </span>
            <span className="min-w-0 break-words">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
