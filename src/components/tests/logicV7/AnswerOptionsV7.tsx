'use client';

import { cn } from '@/lib/utils';
import type { LayeredCell } from '@/lib/logicTestV7/layered.v7';
import { SvgLayeredCell } from '@/lib/logicTestV7/layered.v7';

interface Props {
  options: LayeredCell[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

/**
 * Svarsalternativen i matristestet: valbara kort. Valt kort får kant i ink
 * och en fylld bock uppe till vänster. Tråden markerar aldrig val.
 */
export function AnswerOptionsV7({
  options,
  selectedIndex,
  onSelect,
  disabled = false,
}: Props) {
  return (
    <div className="mx-auto grid max-w-md grid-cols-2 gap-3 sm:max-w-lg sm:grid-cols-3 sm:gap-4">
      {options.map((option, i) => {
        const letter = String.fromCharCode(65 + i);
        const isSelected = selectedIndex === i;

        return (
          <button
            key={i}
            type="button"
            onClick={() => !disabled && onSelect(i)}
            disabled={disabled}
            className={cn(
              'relative aspect-square min-h-[80px] touch-manipulation rounded-xl border bg-panel transition-[border-color,background-color] duration-[120ms] active:bg-insunken',
              disabled && 'cursor-not-allowed opacity-60',
              isSelected ? 'border-ink-1 shadow-val' : 'border-kant hover:border-kant-stark'
            )}
            aria-label={`Svarsalternativ ${letter}`}
            aria-pressed={isSelected}
          >
            <span
              className={cn(
                'absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                isSelected ? 'bg-ink-1 text-white' : 'border border-kant bg-panel text-ink-3'
              )}
              aria-hidden="true"
            >
              {isSelected ? (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              ) : (
                letter
              )}
            </span>

            <div className="flex h-full w-full items-center justify-center p-3 sm:p-3.5">
              <svg
                viewBox="0 0 100 100"
                className="h-full w-full"
                shapeRendering="geometricPrecision"
              >
                <SvgLayeredCell cell={option} />
              </svg>
            </div>
          </button>
        );
      })}
    </div>
  );
}
