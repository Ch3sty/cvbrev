'use client';

import { MatrixCell } from '@/lib/tester/patternTypes';
import { ShapeSVG } from './ShapeSVG';
import { useState, useEffect } from 'react';

interface AnswerOptionsProps {
  options: MatrixCell[];
  selectedAnswer: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export function AnswerOptions({ options, selectedAnswer, onSelect, disabled = false }: AnswerOptionsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Keyboard navigation (A-F keys)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (disabled) return;
      const key = e.key.toUpperCase();
      const index = key.charCodeAt(0) - 65; // A=0, B=1, etc.
      if (index >= 0 && index < options.length) {
        onSelect(index);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [disabled, options.length, onSelect]);

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
      {options.map((option, index) => {
        const label = String.fromCharCode(65 + index); // A, B, C, D, E, F
        const isSelected = selectedAnswer === index;
        const isHovered = hoveredIndex === index;

        return (
          <button
            key={index}
            onClick={() => !disabled && onSelect(index)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            disabled={disabled}
            className={`
              relative aspect-square border-2 rounded-lg transition-all duration-200
              ${isSelected ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-200' : 'border-gray-300 bg-white'}
              ${isHovered && !disabled ? 'border-indigo-400 shadow-lg scale-105' : ''}
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-md'}
            `}
            aria-label={`Alternativ ${label}`}
          >
            {/* Label badge */}
            <div className="absolute -top-2 -left-2 bg-gray-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold z-10">
              {label}
            </div>

            {/* Shapes */}
            <div className="w-full h-full p-2">
              {option.shapes.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">Tom</div>
              ) : (
                <div className="relative w-full h-full">
                  {option.shapes.map((shape, shapeIdx) => (
                    <ShapeSVG
                      key={shapeIdx}
                      shape={shape}
                      className={option.shapes.length > 1 ? 'absolute inset-0' : ''}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Selected checkmark */}
            {isSelected && (
              <div className="absolute -top-2 -right-2 bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center z-10">
                ✓
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
