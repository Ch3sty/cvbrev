'use client';

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

/**
 * Frågan i det numeriska testet: metarad, frågetext i text-fraga och
 * svarsalternativen som valbara rader. Nivån visas som text, inte som piller.
 */
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
    <section key={question.id} className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
      <p className="text-meta tabular-nums text-ink-3">
        Fråga {questionNumber} av {totalQuestions}
        <span aria-hidden="true"> · </span>
        {DIFFICULTY_LABELS[difficultyIdx]}
      </p>

      <h2 className="mb-4 mt-1 text-fraga text-ink-1">{question.questionText}</h2>

      <AnswerOptions
        options={question.options}
        selectedId={selectedId}
        onSelect={onSelect}
        disabled={disabled}
      />
    </section>
  );
}
