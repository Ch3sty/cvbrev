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

// Hjälpfunktion för att beskriva shapes för skärmläsare
function describeShapes(cell: MatrixCell): string {
  if (cell.shapes.length === 0) return 'Tom cell';

  return cell.shapes.map(shape => {
    const parts = [
      shape.form === 'circle' ? 'cirkel' :
      shape.form === 'square' ? 'fyrkant' :
      shape.form === 'triangle' ? 'triangel' :
      shape.form === 'diamond' ? 'romb' :
      shape.form === 'hexagon' ? 'hexagon' :
      shape.form === 'star' ? 'stjärna' : shape.form,

      shape.color === 'blue' ? 'blå' :
      shape.color === 'red' ? 'röd' :
      shape.color === 'green' ? 'grön' :
      shape.color === 'black' ? 'svart' :
      shape.color === 'yellow' ? 'gul' :
      shape.color === 'purple' ? 'lila' : shape.color,

      shape.fill === 'solid' ? 'solid' :
      shape.fill === 'striped' ? 'randig' :
      shape.fill === 'dotted' ? 'prickig' :
      shape.fill === 'crosshatch' ? 'korsad' :
      shape.fill === 'empty' ? 'tom' : shape.fill,

      shape.size === 'small' ? 'liten' :
      shape.size === 'medium' ? 'medel' :
      shape.size === 'large' ? 'stor' : shape.size
    ];

    if (shape.rotation && shape.rotation !== 0) {
      parts.push(`roterad ${shape.rotation}°`);
    }

    return parts.join(', ');
  }).join(' plus ');
}

export function AnswerOptions({ options, selectedAnswer, onSelect, disabled = false }: AnswerOptionsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // P1: Keyboard navigation med skydd mot input-störningar
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (disabled) return;

      // P1: Skydda mot störningar när användaren skriver i fält
      const target = e.target as HTMLElement;
      const isTyping = ['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable;
      if (isTyping) return;

      const key = e.key.toUpperCase();

      // A-F tangenter
      if (key >= 'A' && key <= 'F') {
        const index = key.charCodeAt(0) - 65; // A=0, B=1, etc.
        if (index < options.length) {
          onSelect(index);
          e.preventDefault();
        }
      }

      // P1: 1-6 numeriska shortcuts
      if (e.key >= '1' && e.key <= '6') {
        const index = Number(e.key) - 1;
        if (index < options.length) {
          onSelect(index);
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [disabled, options.length, onSelect]);

  return (
    <div
      role="radiogroup"
      aria-label="Svarsalternativ A till F. Använd A-F tangenter eller 1-6 för snabbval, piltangenter för navigation."
      className="grid grid-cols-3 md:grid-cols-6 gap-4"
    >
      {options.map((option, index) => {
        const label = String.fromCharCode(65 + index); // A, B, C, D, E, F
        const isSelected = selectedAnswer === index;
        const isHovered = hoveredIndex === index;
        const description = describeShapes(option);

        return (
          <button
            key={index}
            role="radio"
            aria-checked={isSelected}
            aria-label={`Alternativ ${label}: ${description}`}
            tabIndex={isSelected ? 0 : -1} // P1: Roving tabindex
            onClick={() => !disabled && onSelect(index)}
            onKeyDown={(e) => {
              if (disabled) return;

              // P1: Piltangenter för navigation
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                const next = Math.min(index + 1, options.length - 1);
                onSelect(next);
                e.preventDefault();
              }
              if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                const prev = Math.max(index - 1, 0);
                onSelect(prev);
                e.preventDefault();
              }
              // P1: Space/Enter för att välja
              if (e.key === ' ' || e.key === 'Enter') {
                onSelect(index);
                e.preventDefault();
              }
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            disabled={disabled}
            className={`
              relative aspect-square border-2 rounded-lg transition-all duration-200
              ${isSelected ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-200' : 'border-gray-300 bg-white'}
              ${isHovered && !disabled ? 'border-indigo-400 shadow-lg scale-105' : ''}
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-md'}
              focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300
            `}
          >
            {/* Label badge */}
            <div className="absolute -top-2 -left-2 bg-gray-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold z-10">
              {label}
            </div>

            {/* Shapes */}
            <div className="w-full h-full p-2">
              {option.shapes.length === 0 ? (
                <div
                  className="flex items-center justify-center h-full text-gray-400"
                  aria-label="Tom cell"
                >
                  Tom
                </div>
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
