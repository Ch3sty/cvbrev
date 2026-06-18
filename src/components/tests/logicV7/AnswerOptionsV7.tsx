'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SvgLayeredCell } from '@/lib/logicTestV7/layered.v7';
import type { LayeredCell } from '@/lib/logicTestV7/layered.v7';

interface Props {
  options: LayeredCell[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export function AnswerOptionsV7({ options, selectedIndex, onSelect, disabled = false }: Props) {
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
              'relative aspect-square rounded-2xl bg-white transition-all touch-manipulation min-h-[80px]',
              !disabled && 'cursor-pointer hover:shadow-lg',
              disabled && 'cursor-not-allowed opacity-60',
              isSelected ? 'border-2' : 'border border-orange-100 hover:border-orange-300'
            )}
            style={{
              boxShadow: isSelected
                ? '0 12px 30px -8px rgba(220, 38, 38, 0.35), 0 0 0 4px rgba(249, 115, 22, 0.18)'
                : '0 4px 12px -6px rgba(249, 115, 22, 0.15)',
              borderColor: isSelected ? '#DC2626' : undefined,
            }}
            aria-label={`Svarsalternativ ${letter}`}
            aria-pressed={isSelected}
          >
            <div
              className={cn(
                'absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-sm z-10 transition-colors',
                isSelected ? 'text-white' : 'bg-white text-slate-600 border border-orange-200'
              )}
              style={
                isSelected
                  ? {
                      background: 'linear-gradient(135deg, #F97316, #DC2626)',
                      boxShadow: '0 4px 10px -2px rgba(220, 38, 38, 0.45)',
                    }
                  : undefined
              }
            >
              {letter}
            </div>

            <div className="w-full h-full p-3 sm:p-3.5 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full" shapeRendering="geometricPrecision">
                <SvgLayeredCell cell={option} />
              </svg>
            </div>

            {isSelected && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.06 }}
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ background: 'linear-gradient(135deg, #F97316, #DC2626, #BE185D)' }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
