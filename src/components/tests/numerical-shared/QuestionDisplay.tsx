'use client';
import { useRef } from 'react';
import { useFriSikt } from '@/components/shared/useFriSikt';

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

/**
 * Frågan i det numeriska testet: frågetext i text-fraga och
 * svarsalternativen som valbara rader. Numret står i huvudet, inte här.
 */
export default function QuestionDisplay({
  question,
  selectedId,
  onSelect,
  disabled,
}: QuestionDisplayProps) {
  const ref = useRef<HTMLElement | null>(null);
  // Samtycket ligger aldrig över svarsalternativen (klicktestet 2026-11-08:
  // på Pixel 7 täckte det alternativ B till D på första frågan).
  useFriSikt(ref);

  return (
    <section ref={ref} key={question.id} className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
      {/* Ingen metarad: "Fråga 1 av 20, Lätt" upprepade huvudet (plan-testflode etapp 0). */}
      <h2 className="mb-4 text-fraga text-ink-1">{question.questionText}</h2>

      <AnswerOptions
        options={question.options}
        selectedId={selectedId}
        onSelect={onSelect}
        disabled={disabled}
      />
    </section>
  );
}
