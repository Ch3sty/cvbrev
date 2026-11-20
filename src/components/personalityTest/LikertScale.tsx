'use client';

/**
 * Skalan i personlighetstestet som Svarskort (plan-testflode-2026-11-20
 * avsnitt 2 och 3.1, etapp 4; omgång 2 steg B2, skissens Personlighet-1440
 * och Personlighet-412): fem lika breda kort i rad, 104 px höga på mobil
 * (siffran 18 px i en 34 px bricka, etiketten 11/14) och 112 px på dator
 * (22 px i 40 px, etiketten 13/17). Designsystemets färger, ingen gradient
 * och inget rörelsebibliotek. Brickan bär siffran (1 till 5) i stället för
 * en bokstav. Sedan omgång 3 är korten klossar (.sess-kloss) med
 * tangentbrickan, vald är indigo.
 *
 * Samma kort i det publika personlighetsprovet (omgång 2 steg C): `etiketter`
 * ger provets egna ord för lägena och aria-propsen kopplar gruppen till
 * påståendet. Utelämnade: som förut.
 */

import type { LikertValue } from '@/lib/personalityTest/types';
import { KLOSS, Tangent } from '@/components/session/Svarskort';

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
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Stämmer bra' },
  { value: 5, label: 'Stämmer perfekt' },
];

export default function LikertScale({ value, onChange, disabled, etiketter, ariaLabel, ariaDescribedBy }: LikertScaleProps) {
  return (
    <div role="radiogroup" aria-label={ariaLabel ?? 'Hur väl stämmer påståendet?'} aria-describedby={ariaDescribedBy} className="grid grid-cols-5 gap-1.5 lg:gap-2" data-likert>
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
            className={`${KLOSS} flex h-[104px] min-w-0 w-full flex-col items-center justify-center gap-1.5 px-1 py-2 text-center text-[11px] font-semibold leading-[14px] lg:h-[112px] lg:gap-2.5 lg:px-2 lg:text-[13px] lg:leading-[17px]`}
          >
            <Tangent tecken={String(o.value)} tillstand={vald ? 'vald' : 'neutral'} stor />
            <span className="min-w-0 break-words">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
