import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import type { Statement, UserAnswer } from '@/lib/verbalTestV1/types.v1';

interface StatementListProps {
  statements: Statement[];
  userAnswers: (UserAnswer)[];
  onSelectAnswer: (statementIndex: number, answer: 'true' | 'false' | 'cannot_say') => void;
  isSaving: boolean;
}

const answerOptions: { value: 'true' | 'false' | 'cannot_say'; label: string; color: string }[] = [
  { value: 'true', label: 'Sant', color: 'from-green-500 to-emerald-600' },
  { value: 'false', label: 'Falskt', color: 'from-red-500 to-rose-600' },
  { value: 'cannot_say', label: 'Kan inte avgöra', color: 'from-slate-500 to-gray-600' }
];

export function StatementList({
  statements,
  userAnswers,
  onSelectAnswer,
  isSaving
}: StatementListProps) {
  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {statements.map((statement, index) => {
          const userAnswer = userAnswers[index];
          const isAnswered = userAnswer !== null;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl border-2 border-slate-200 p-5"
            >
              {/* Statement Text */}
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <p className="flex-1 text-sm font-medium text-slate-800 leading-relaxed pt-1">
                  {statement.text}
                </p>
                {isAnswered && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0"
                  >
                    <Check className="w-5 h-5 text-green-600" />
                  </motion.div>
                )}
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {answerOptions.map((option) => {
                  const isSelected = userAnswer === option.value;

                  return (
                    <button
                      key={option.value}
                      onClick={() => onSelectAnswer(index, option.value)}
                      disabled={isSaving}
                      className={`
                        relative px-4 py-3 rounded-lg font-semibold text-sm
                        transition-all duration-200
                        ${
                          isSelected
                            ? `bg-gradient-to-r ${option.color} text-white shadow-lg scale-105`
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-2 border-slate-200 hover:border-slate-300'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      {option.label}
                      {isSelected && (
                        <motion.div
                          layoutId={`selected-${index}`}
                          className="absolute inset-0 bg-white/20 rounded-lg"
                          initial={false}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
