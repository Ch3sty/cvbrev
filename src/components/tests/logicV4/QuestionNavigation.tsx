'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface QuestionNavigationProps {
  totalQuestions: number;
  currentQuestion: number;
  answeredQuestions: Set<number>;
  onNavigate: (index: number) => void;
}

export function QuestionNavigation({
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  onNavigate,
}: QuestionNavigationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="bg-white rounded-3xl border border-orange-100 p-4 sm:p-5"
      style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700">
          Navigera mellan frågor
        </p>
        <p className="text-xs text-slate-500 tabular-nums">
          {answeredQuestions.size} / {totalQuestions} besvarade
        </p>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-[repeat(15,_minmax(0,_1fr))] gap-1.5 sm:gap-2">
        {Array.from({ length: totalQuestions }).map((_, i) => {
          const isCurrent = currentQuestion === i;
          const isAnswered = answeredQuestions.has(i);

          return (
            <motion.button
              key={i}
              onClick={() => onNavigate(i)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'relative aspect-square rounded-lg font-bold text-xs sm:text-sm transition-all',
                'flex items-center justify-center min-h-[36px] sm:min-h-[40px] touch-manipulation',
                isCurrent && !isAnswered && 'text-white',
                isCurrent && isAnswered && 'text-white ring-2 ring-orange-300',
                !isCurrent && isAnswered && 'text-white',
                !isCurrent && !isAnswered &&
                  'bg-white text-slate-600 border border-slate-200 hover:border-orange-300 hover:text-orange-700'
              )}
              style={
                isCurrent
                  ? {
                      background: 'linear-gradient(135deg, #F97316, #DC2626)',
                      boxShadow: '0 4px 10px -2px rgba(220, 38, 38, 0.45)',
                    }
                  : isAnswered
                  ? {
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      boxShadow: '0 2px 6px -2px rgba(16, 185, 129, 0.4)',
                    }
                  : undefined
              }
              aria-label={`Gå till fråga ${i + 1}${isAnswered ? ' (besvarad)' : ''}${
                isCurrent ? ' (aktuell)' : ''
              }`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {isAnswered && !isCurrent ? (
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={3} />
              ) : (
                <span>{i + 1}</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
