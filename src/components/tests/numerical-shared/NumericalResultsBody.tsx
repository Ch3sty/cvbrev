'use client';

/**
 * Genomgången i det numeriska testet: hur det gick per svårighet och per
 * frågetyp, sedan fråga för fråga. Listor i paneler, utfallet som text i ton.
 * Mätaren per svårighet är en stillastående linje, inte en animerad stapel.
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Passage, TestAnswer, QuestionType } from '@/lib/numericalTest/types';

interface NumericalResultsBodyProps {
  passages: Passage[];
  answers: TestAnswer[];
  byDifficulty: {
    difficulty1: { correct: number; total: number };
    difficulty2: { correct: number; total: number };
    difficulty3: { correct: number; total: number };
  };
  byType: { [key in QuestionType]: { correct: number; total: number } };
  /** Prov-läge: förklaringar döljs, ersätts av en inaktiv markör. */
  showExplanations?: boolean;
}

const TYPE_LABEL: Record<QuestionType, string> = {
  table: 'Tabeller',
  graph: 'Grafer',
  series: 'Talserier',
  word_problem: 'Lästal',
  conversion: 'Konvertering',
};

export default function NumericalResultsBody({
  passages,
  answers,
  byDifficulty,
  byType,
  showExplanations = true,
}: NumericalResultsBodyProps) {
  return (
    <div className="space-y-6">
      <BreakdownSection byDifficulty={byDifficulty} byType={byType} />
      <AnswerKey passages={passages} answers={answers} showExplanations={showExplanations} />
    </div>
  );
}

function BreakdownSection({
  byDifficulty,
  byType,
}: {
  byDifficulty: NumericalResultsBodyProps['byDifficulty'];
  byType: NumericalResultsBodyProps['byType'];
}) {
  const types = (
    Object.entries(byType) as [QuestionType, { correct: number; total: number }][]
  ).filter(([, data]) => data.total > 0);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section aria-label="Per svårighetsnivå">
        <h2 className="mb-2 text-sm font-medium text-ink-3">Per svårighetsnivå</h2>
        <div className="space-y-3 rounded-xl border border-kant bg-panel p-4">
          <DifficultyBar label="Lätt" data={byDifficulty.difficulty1} />
          <DifficultyBar label="Medel" data={byDifficulty.difficulty2} />
          <DifficultyBar label="Svår" data={byDifficulty.difficulty3} />
        </div>
      </section>

      <section aria-label="Per frågetyp">
        <h2 className="mb-2 text-sm font-medium text-ink-3">Per frågetyp</h2>
        <ul className="divide-y divide-kant rounded-xl border border-kant bg-panel">
          {types.map(([type, data]) => (
            <li
              key={type}
              className="flex min-h-11 items-center justify-between gap-3 px-4 py-2"
            >
              <span className="text-sm text-ink-1">{TYPE_LABEL[type]}</span>
              <span
                className={`text-sm font-medium tabular-nums ${
                  data.correct === data.total ? 'text-positiv' : 'text-ink-3'
                }`}
              >
                {data.correct} av {data.total}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function DifficultyBar({
  label,
  data,
}: {
  label: string;
  data: { correct: number; total: number };
}) {
  const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-sm text-ink-1">{label}</span>
        <span className="text-meta tabular-nums text-ink-3">
          {data.correct} av {data.total}
        </span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-insunken shadow-insunken"
        role="img"
        aria-label={`${label}: ${pct} procent rätt`}
      >
        <div className="h-full rounded-full bg-ink-1" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function AnswerKey({
  passages,
  answers,
  showExplanations,
}: {
  passages: Passage[];
  answers: TestAnswer[];
  showExplanations: boolean;
}) {
  return (
    <section aria-label="Fråga för fråga">
      <h2 className="mb-2 text-sm font-medium text-ink-3">Fråga för fråga</h2>
      <ul className="divide-y divide-kant rounded-xl border border-kant bg-panel">
        {passages.map((passage) => {
          const passageAnswers = answers.filter((a) => a.passageId === passage.id);
          return passage.questions.map((question, qIdx) => {
            const answer = passageAnswers.find((a) => a.questionId === question.id);
            return (
              <AnswerKeyRow
                key={question.id}
                passage={passage}
                question={question}
                answer={answer}
                questionIndex={qIdx}
                showExplanations={showExplanations}
              />
            );
          });
        })}
      </ul>
    </section>
  );
}

function AnswerKeyRow({
  passage,
  question,
  answer,
  questionIndex,
  showExplanations,
}: {
  passage: Passage;
  question: Passage['questions'][number];
  answer?: TestAnswer;
  questionIndex: number;
  showExplanations: boolean;
}) {
  const [open, setOpen] = useState(false);
  const isCorrect = answer?.isCorrect ?? false;
  const selectedOption = answer
    ? question.options.find((o) => o.id === answer.selectedAnswerId)
    : null;
  const correctOption = question.options.find((o) => o.id === question.correctAnswerId);

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-14 w-full touch-manipulation items-center gap-3 px-4 py-3 text-left hover:bg-insunken"
        aria-expanded={open}
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink-1">
            {question.questionText}
          </span>
          <span className="mt-0.5 block text-meta text-ink-3">
            {passage.topic} · fråga {questionIndex + 1}
          </span>
        </span>

        <span
          className={`shrink-0 text-meta font-medium ${
            !answer ? 'text-ink-3' : isCorrect ? 'text-positiv' : 'text-fel'
          }`}
        >
          {!answer ? 'Hoppad' : isCorrect ? 'Rätt' : 'Fel'}
        </span>

        <ChevronDown
          aria-hidden="true"
          strokeWidth={1.75}
          className={`h-5 w-5 shrink-0 text-ink-3 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open ? (
        <div className="space-y-3 px-4 pb-5 pt-1">
          {selectedOption ? (
            <div>
              <p className="mb-1 text-meta text-ink-3">Ditt svar</p>
              <p
                className={`rounded-lg border border-kant bg-insunken px-3 py-2 text-sm ${
                  isCorrect ? 'text-ink-1' : 'text-fel'
                }`}
              >
                {selectedOption.text}
              </p>
            </div>
          ) : null}

          {!isCorrect && correctOption ? (
            <div>
              <p className="mb-1 text-meta text-ink-3">Rätt svar</p>
              <p className="rounded-lg border border-kant bg-insunken px-3 py-2 text-sm text-ink-1">
                {correctOption.text}
              </p>
            </div>
          ) : null}

          {question.explanation && showExplanations ? (
            <div>
              <p className="mb-1 text-meta text-ink-3">Förklaring</p>
              <p className="rounded-lg border border-kant bg-insunken px-3 py-2 text-sm leading-[22px] text-ink-2">
                {question.explanation}
              </p>
            </div>
          ) : null}

          {question.explanation && !showExplanations ? (
            <p className="text-meta text-ink-3">
              Förklaringen är inte tillgänglig under prov.
            </p>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
