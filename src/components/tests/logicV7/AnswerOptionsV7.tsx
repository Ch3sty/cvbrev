'use client';

import { cn } from '@/lib/utils';
import type { LayeredCell } from '@/lib/logicTestV7/layered.v7';
import { FigurV7 } from '@/lib/logicTestV7/layered.v7';

interface Props {
  options: LayeredCell[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

/**
 * Svarsalternativen i logikens klassiska test och övningsprov, i passets
 * struktur (grafik v3, spec avsnitt 6): sex kvadratiska kort, tre i bredd
 * även på mobil, figuren i 80 procent, samma skala som i matrisen. Bokstaven
 * står alltid kvar uppe till vänster, så att "jag valde C" går att säga.
 * Valt kort får 2 px bläck (ram plus inre linje); ingen bock.
 */
export function AnswerOptionsV7({
  options,
  selectedIndex,
  onSelect,
  disabled = false,
}: Props) {
  return (
    <div
      role="radiogroup"
      aria-label="Svarsalternativ"
      className="matrisyta mx-auto grid w-full max-w-[420px] grid-cols-3 gap-2.5"
    >
      {options.map((option, i) => {
        const letter = String.fromCharCode(65 + i);
        const isSelected = selectedIndex === i;

        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => !disabled && onSelect(i)}
            disabled={disabled}
            className={cn(
              'relative aspect-square min-h-[80px] touch-manipulation rounded-xl border bg-papper transition-[border-color] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-koppar motion-reduce:transition-none',
              disabled ? 'cursor-default' : 'active:bg-papper-2',
              isSelected ? 'border-ink-1 shadow-[inset_0_0_0_1px_var(--ink-1)]' : 'border-kant hover:border-kant-stark'
            )}
            aria-label={`Svarsalternativ ${letter}${isSelected ? ', ditt svar' : ''}`}
          >
            <span
              className={cn(
                'absolute left-2 top-1.5 z-10 text-[11px] font-semibold',
                isSelected ? 'text-ink-1' : 'text-ink-3'
              )}
              aria-hidden="true"
            >
              {letter}
            </span>

            {/* En div i full storlek med svg:n, så att kvadraten bär höjden. */}
            <div className="flex h-full w-full items-center justify-center">
              <FigurV7 cell={option} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
