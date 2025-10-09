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
  onNavigate
}: QuestionNavigationProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 border-2 border-slate-200">
        <p className="text-xs text-slate-500 text-center mb-3 font-medium">
          Navigera mellan frågor
        </p>

        <div className="flex flex-wrap gap-2 max-w-xl justify-center">
          {Array.from({ length: totalQuestions }).map((_, i) => {
            const isCurrent = currentQuestion === i;
            const isAnswered = answeredQuestions.has(i);

            return (
              <motion.button
                key={i}
                onClick={() => onNavigate(i)}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative w-11 h-11 rounded-lg font-bold text-sm transition-all shadow-md",
                  "flex items-center justify-center",
                  isCurrent && "ring-2 ring-indigo-500 scale-110 z-10",
                  isAnswered && !isCurrent && "bg-gradient-to-br from-green-500 to-emerald-600 text-white",
                  isAnswered && isCurrent && "bg-gradient-to-br from-indigo-500 to-purple-600 text-white ring-purple-400",
                  !isAnswered && !isCurrent && "bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700 hover:from-slate-300 hover:to-slate-400",
                  !isAnswered && isCurrent && "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white"
                )}
              >
                {isAnswered && !isCurrent ? (
                  <Check className="w-5 h-5" strokeWidth={3} />
                ) : (
                  <span>{i + 1}</span>
                )}

                {/* Current indicator */}
                {isCurrent && (
                  <motion.div
                    layoutId="current-question"
                    className="absolute -inset-1 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-lg -z-10 opacity-30"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Progress text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xs text-center mt-3 text-slate-600 font-medium"
        >
          {answeredQuestions.size} av {totalQuestions} besvarade
        </motion.p>
      </div>
    </motion.div>
  );
}
