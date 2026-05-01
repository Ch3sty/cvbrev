'use client';

import { motion } from 'framer-motion';
import AnswerOptions from './AnswerOptions';
import type { Question } from '@/lib/numericalTest/types';

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedId?: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

const DIFFICULTY_LABELS = ['Lätt', 'Medel', 'Svår'];
const DIFFICULTY_COLORS = [
  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'bg-amber-50 text-amber-700 border-amber-200',
  'bg-rose-50 text-rose-700 border-rose-200',
];

export default function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  selectedId,
  onSelect,
  disabled,
}: QuestionDisplayProps) {
  const difficultyIdx = Math.min(2, Math.max(0, question.difficulty - 1));

  return (
    <motion.section
      key={question.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative bg-white rounded-3xl border border-orange-200/60 overflow-hidden"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.18)' }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background:
            'linear-gradient(90deg, #FB923C 0%, #DC2626 50%, #BE185D 100%)',
        }}
      />

      <div className="p-5 sm:p-6 md:p-7">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700">
              Fråga {questionNumber} av {totalQuestions}
            </span>
          </div>
          <span
            className={`text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[difficultyIdx]}`}
          >
            {DIFFICULTY_LABELS[difficultyIdx]}
          </span>
        </div>

        {/* Question text */}
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 leading-relaxed mb-5 sm:mb-6">
          {question.questionText}
        </h3>

        {/* Answer options */}
        <AnswerOptions
          options={question.options}
          selectedId={selectedId}
          onSelect={onSelect}
          disabled={disabled}
        />
      </div>
    </motion.section>
  );
}
