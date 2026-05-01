'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { AnswerOption } from '@/lib/numericalTest/types';

interface AnswerOptionsProps {
  options: AnswerOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function AnswerOptions({
  options,
  selectedId,
  onSelect,
  disabled,
}: AnswerOptionsProps) {
  return (
    <div className="space-y-2.5 sm:space-y-3">
      {options.map((option, idx) => {
        const isSelected = selectedId === option.id;
        const letter = LETTERS[idx];

        return (
          <motion.button
            key={option.id}
            onClick={() => !disabled && onSelect(option.id)}
            disabled={disabled}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.04 }}
            whileHover={!disabled ? { scale: 1.005 } : undefined}
            whileTap={!disabled ? { scale: 0.995 } : undefined}
            className={`w-full text-left flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl border-2 transition-colors min-h-[60px] touch-manipulation ${
              isSelected
                ? 'border-orange-500 bg-orange-50/80'
                : 'border-orange-100 bg-white hover:border-orange-300 hover:bg-orange-50/40'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {/* Letter-bubbla */}
            <div
              className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-sm sm:text-base transition-all ${
                isSelected ? 'text-white' : 'bg-orange-50 text-orange-700 border border-orange-200'
              }`}
              style={
                isSelected
                  ? {
                      background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                      boxShadow: '0 4px 10px -3px rgba(220, 38, 38, 0.4)',
                    }
                  : undefined
              }
            >
              {isSelected ? (
                <Check className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
              ) : (
                letter
              )}
            </div>

            <span
              className={`flex-1 text-sm sm:text-base font-medium leading-snug ${
                isSelected ? 'text-orange-900 font-semibold' : 'text-slate-700'
              }`}
            >
              {option.text}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
