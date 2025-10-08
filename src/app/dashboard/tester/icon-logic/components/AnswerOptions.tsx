'use client';

import { IconLogicCell } from '@/lib/tester/iconLogicTypes';
import { IconCellSVG } from './IconCellSVG';

interface AnswerOptionsProps {
  options: IconLogicCell[];
  selectedAnswer: number;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export function AnswerOptions({ options, selectedAnswer, onSelect, disabled = false }: AnswerOptionsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => !disabled && onSelect(index)}
          disabled={disabled}
          className={`
            aspect-square border-3 rounded-lg p-4
            transition-all duration-200
            ${selectedAnswer === index
              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
              : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          aria-label={`Svarsalternativ ${String.fromCharCode(65 + index)}`}
        >
          <IconCellSVG cell={option} />
          <div className="mt-2 text-center font-semibold text-gray-700">
            {String.fromCharCode(65 + index)}
          </div>
        </button>
      ))}
    </div>
  );
}
