'use client';

import { Check } from 'lucide-react';
import type { AnswerOption } from '@/lib/numericalTest/types';

interface AnswerOptionsProps {
  options: AnswerOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * Svarsalternativ som valbara rader. Valt = kant i ink plus fylld bock,
 * hover = starkare kant, tryck = insunken. Aldrig orange yta.
 */
export default function AnswerOptions({
  options,
  selectedId,
  onSelect,
  disabled,
}: AnswerOptionsProps) {
  return (
    <div className="space-y-2">
      {options.map((option, idx) => {
        const isSelected = selectedId === option.id;
        const letter = LETTERS[idx];

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => !disabled && onSelect(option.id)}
            disabled={disabled}
            aria-pressed={isSelected}
            className={`flex min-h-[56px] w-full touch-manipulation items-center gap-3 rounded-lg border bg-panel px-4 py-3 text-left transition-[border-color,background-color] duration-[120ms] active:bg-insunken ${
              isSelected ? 'border-ink-1 shadow-val' : 'border-kant hover:border-kant-stark'
            } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <span
              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                isSelected ? 'bg-ink-1 text-white' : 'border border-kant bg-panel text-ink-3'
              }`}
              aria-hidden="true"
            >
              {isSelected ? <Check className="h-4 w-4" strokeWidth={2.5} /> : letter}
            </span>

            <span
              className={`flex-1 text-sm leading-[22px] sm:text-base ${
                isSelected ? 'font-medium text-ink-1' : 'text-ink-2'
              }`}
            >
              {option.text}
            </span>
          </button>
        );
      })}
    </div>
  );
}
