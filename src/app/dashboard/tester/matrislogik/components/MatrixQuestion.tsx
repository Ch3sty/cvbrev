'use client';

import React from 'react';
import { SvgCell } from '@/lib/logic/renderers';
import { assertUniqueOptions } from '@/lib/logic/signatures';
import type { Cell } from '@/lib/logic/types';

interface MatrixQuestionProps {
  grid: (Cell | null)[][];
  options: Cell[];
  selected: number | null;
  onSelect: (i: number) => void;
  disabled?: boolean;
}

export const MatrixQuestion: React.FC<MatrixQuestionProps> = ({
  grid,
  options,
  selected,
  onSelect,
  disabled = false,
}) => {
  // Validate options in development
  if (process.env.NODE_ENV !== 'production') {
    try {
      assertUniqueOptions(options);
    } catch (error) {
      console.error('Duplicate options detected:', error);
    }
  }

  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* 3x3 Matrix Grid */}
      <div className="grid grid-cols-3 gap-1 mb-8 justify-center">
        {grid.flatMap((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className="w-[110px] h-[110px] flex items-center justify-center border-2 border-gray-300 rounded-lg bg-white"
            >
              {cell ? (
                <SvgCell cell={cell} />
              ) : (
                <div className="text-6xl text-gray-400 select-none">?</div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Answer Options */}
      <div
        className="grid grid-cols-3 gap-2 mt-8"
        role="radiogroup"
        aria-label="Svarsalternativ A–F"
      >
        {options.map((opt, i) => {
          const isSel = selected === i;
          return (
            <button
              key={i}
              role="radio"
              aria-checked={isSel}
              aria-label={`Alternativ ${letters[i]}`}
              className={`
                w-full aspect-square border-3 rounded-xl p-4
                transition-all duration-200 flex flex-col items-center justify-center
                ${
                  isSel
                    ? 'border-indigo-500 bg-indigo-50 ring-4 ring-indigo-200 shadow-lg'
                    : 'border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              tabIndex={isSel ? 0 : -1}
              onClick={() => !disabled && onSelect(i)}
              disabled={disabled}
            >
              <div className="text-lg font-bold text-gray-700 mb-2">
                {letters[i]}
              </div>
              <div className="flex-1 flex items-center justify-center">
                <SvgCell cell={opt} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
