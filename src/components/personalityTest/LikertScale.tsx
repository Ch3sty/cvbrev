'use client';

import { motion } from 'framer-motion';
import type { LikertValue } from '@/lib/personalityTest/types';

interface LikertScaleProps {
  value: LikertValue | null;
  onChange: (value: LikertValue) => void;
  disabled?: boolean;
}

const OPTIONS: { value: LikertValue; label: string }[] = [
  { value: 1, label: 'Stämmer inte alls' },
  { value: 2, label: 'Stämmer dåligt' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Stämmer bra' },
  { value: 5, label: 'Stämmer perfekt' },
];

export default function LikertScale({ value, onChange, disabled }: LikertScaleProps) {
  return (
    <div className="w-full">
      {/* Mobile: vertikal stack med label bredvid siffran. Desktop (sm+): horisontell 5-kolumns grid. */}
      <div className="flex flex-col gap-2 sm:grid sm:grid-cols-5 sm:gap-2">
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
              className={`relative flex items-center sm:flex-col sm:justify-center gap-3 sm:gap-1.5 rounded-2xl p-3 sm:p-4 min-h-[56px] sm:min-h-[100px] transition-all touch-manipulation
                ${
                  isSelected
                    ? 'border-2 text-white'
                    : 'border bg-white text-slate-700 hover:border-orange-300 hover:-translate-y-0.5'
                }
                ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
              `}
              style={
                isSelected
                  ? {
                      borderColor: 'transparent',
                      background:
                        'linear-gradient(135deg, #F97316, #DC2626, #BE185D)',
                      boxShadow: '0 8px 24px -6px rgba(220, 38, 38, 0.5)',
                    }
                  : { borderColor: '#E2E8F0' }
              }
              aria-pressed={isSelected}
              aria-label={`${option.label} (${option.value})`}
            >
              {/* Siffran */}
              <span
                className={`flex-shrink-0 w-9 h-9 sm:w-auto sm:h-auto rounded-full sm:rounded-none flex items-center justify-center text-lg sm:text-xl font-bold tabular-nums ${
                  isSelected
                    ? 'bg-white/20 text-white sm:bg-transparent'
                    : 'bg-slate-100 text-slate-900 sm:bg-transparent'
                }`}
              >
                {option.value}
              </span>
              {/* Label */}
              <span
                className={`text-sm sm:text-xs leading-tight text-left sm:text-center flex-1 sm:flex-initial ${
                  isSelected ? 'text-white sm:text-white/90' : 'text-slate-600 sm:text-slate-500'
                }`}
              >
                {option.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
