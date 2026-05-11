'use client';

import { motion } from 'framer-motion';
import type { LikertValue } from '@/lib/personalityTest/types';

interface LikertScaleProps {
  value: LikertValue | null;
  onChange: (value: LikertValue) => void;
  disabled?: boolean;
}

const OPTIONS: { value: LikertValue; label: string; sublabel: string }[] = [
  { value: 1, label: 'Stämmer inte alls', sublabel: '1' },
  { value: 2, label: 'Stämmer dåligt', sublabel: '2' },
  { value: 3, label: 'Neutral', sublabel: '3' },
  { value: 4, label: 'Stämmer bra', sublabel: '4' },
  { value: 5, label: 'Stämmer perfekt', sublabel: '5' },
];

export default function LikertScale({ value, onChange, disabled }: LikertScaleProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {OPTIONS.map((option, i) => {
          const isSelected = value === option.value;
          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              disabled={disabled}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.04 * i }}
              className={`relative flex flex-col items-center justify-center gap-1.5 rounded-2xl p-3 sm:p-4 min-h-[80px] sm:min-h-[100px] transition-all touch-manipulation
                ${
                  isSelected
                    ? 'border-2 text-white'
                    : 'border bg-white text-slate-700 hover:border-indigo-300 hover:-translate-y-0.5'
                }
                ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
              `}
              style={
                isSelected
                  ? {
                      borderColor: 'transparent',
                      background:
                        'linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)',
                      boxShadow: '0 8px 24px -6px rgba(139, 92, 246, 0.5)',
                    }
                  : { borderColor: '#E2E8F0' }
              }
              aria-pressed={isSelected}
              aria-label={`${option.label} (${option.value})`}
            >
              <span
                className={`text-base sm:text-lg font-bold tabular-nums ${
                  isSelected ? 'text-white' : 'text-slate-900'
                }`}
              >
                {option.sublabel}
              </span>
              <span
                className={`text-[10px] sm:text-xs leading-tight text-center ${
                  isSelected ? 'text-white/90' : 'text-slate-500'
                }`}
              >
                {option.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Skala-info mobil */}
      <div className="flex items-center justify-between mt-3 px-1 sm:hidden text-[10px] text-slate-500 font-medium">
        <span>← stämmer inte alls</span>
        <span>stämmer perfekt →</span>
      </div>
    </div>
  );
}
