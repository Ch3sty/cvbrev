'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { V5Cell } from '@/lib/logicTestV5/types.v5';
import { SvgCellV5 } from '@/lib/logicTestV5/renderers.v5';

interface AnswerOptionsProps {
  options: V5Cell[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export function AnswerOptions({
  options,
  selectedIndex,
  onSelect,
  disabled = false,
}: AnswerOptionsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-md sm:max-w-lg mx-auto">
      {options.map((option, i) => {
        const letter = String.fromCharCode(65 + i);
        const isSelected = selectedIndex === i;

        return (
          <motion.button
            key={i}
            onClick={() => !disabled && onSelect(i)}
            disabled={disabled}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.04, duration: 0.25 }}
            whileHover={!disabled ? { y: -2 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            className={cn(
              'relative aspect-square rounded-xl bg-white transition-all touch-manipulation min-h-[80px]',
              disabled && 'cursor-not-allowed opacity-60',
              isSelected
                ? 'border-2 border-orange-600'
                : 'border border-orange-100 hover:border-orange-300'
            )}
            aria-label={`Svarsalternativ ${letter}`}
            aria-pressed={isSelected}
          >
            <div
              className={cn(
                'absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs z-10 transition-colors',
                isSelected
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-neutral-600 border border-orange-200'
              )}
            >
              {letter}
            </div>

            <div className="w-full h-full p-3 sm:p-3.5 flex items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                shapeRendering="geometricPrecision"
              >
                <SvgCellV5 cell={option} />
              </svg>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
