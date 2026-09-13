'use client';

/**
 * Genomgången i det verbala testet: passage för passage, påstående för
 * påstående. Listor i paneler, utfall som text i ton (positiv/fel), aldrig
 * färgade kort. Ingen rörelse utöver att en rad viks ut.
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { splitIntoParagraphs } from './splitParagraphs';

export interface SavedAnswer {
  passageId: string;
  statementIndex: number;
  answer: 'true' | 'false' | 'cannot_say' | null;
  isCorrect?: boolean;
  timeSpent?: number;
}

export interface ResultsPassage {
  id: string;
  title: string;
  topic: string;
  difficulty: 1 | 2 | 3;
  text: string;
  statements: {
    text: string;
    correctAnswer: 'true' | 'false' | 'cannot_say';
    explanation?: string;
  }[];
}

interface VerbalResultsBodyProps {
  score: number;
  totalStatements: number;
  timeSpent: number;
  answers: SavedAnswer[];
  passages: ResultsPassage[];
  restartPath: string;
  /**
   * Bara genomgången. Poängen och handlingarna ägs av TestResultsShell,
   * så den delade resultatsidan slipper visa dem två gånger.
   */
  bare?: boolean;
  /** Prov-läge: förklaringar visas inaktiverade ("Ej tillgänglig under prov"). */
  isProv?: boolean;
  /** Extra innehåll direkt efter stats-raden (t.ex. PercentileCard). */
  afterStatsSlot?: React.ReactNode;
  /** Extra innehåll före action-knapparna (t.ex. NextLevelCard). */
  beforeActionsSlot?: React.ReactNode;
}

export default function VerbalResultsBody({
  score,
  totalStatements,
  timeSpent,
  answers,
  passages,
  restartPath,
  isProv = false,
  bare = false,
  afterStatsSlot,
  beforeActionsSlot,
}: VerbalResultsBodyProps) {
  const router = useRouter();
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins} min ${secs} sek`;
  };

  const avgPerStatement = Math.round(timeSpent / Math.max(totalStatements, 1));

  // Bara genomgången: poängen och handlingarna kommer från TestResultsShell.
  if (bare) {
    return <PassageReview answers={answers} passages={passages} isProv={isProv} />;
  }

  return (
    <>
      {/* Resultatet i siffror. */}
      <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
        <div className="grid grid-cols-3 gap-2 divide-x divide-kant sm:gap-4">
          <Stat label="Korrekta" value={`${score} / ${totalStatements}`} />
          <Stat label="Tid" value={formatTime(timeSpent)} />
          <Stat label="Per påstående" value={`${avgPerStatement} s`} />
        </div>
      </section>

      {/* T.ex. jämförelse mot andra testtagare */}
      {afterStatsSlot}

      {/* Per-passage-genomgång */}
      <PassageReview answers={answers} passages={passages} isProv={isProv} />

      {/* T.ex. progressionspuff mot nästa nivå */}
      {beforeActionsSlot}

      <section className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => router.push(restartPath)}
          className="inline-flex h-11 flex-1 touch-manipulation items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover"
        >
          Gör om testet
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/tester')}
          className="inline-flex h-11 flex-1 touch-manipulation items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 transition-colors hover:bg-insunken"
        >
          Tillbaka till tester
        </button>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-2 text-center sm:px-3">
      <div className="text-sm font-medium tabular-nums text-ink-1">{value}</div>
      <div className="mt-0.5 text-meta text-ink-3">{label}</div>
    </div>
  );
}

function PassageReview({
  answers,
  passages,
  isProv,
}: {
  answers: SavedAnswer[];
  passages: ResultsPassage[];
  isProv?: boolean;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Beräkna antal rätt per passage
  const correctPerPassage = passages.map((p) => {
    const passageAnswers = answers.filter((a) => a.passageId === p.id);
    const correct = passageAnswers.filter((a) => a.isCorrect === true).length;
    return { total: p.statements.length, correct, answered: passageAnswers.length };
  });

  return (
    <section aria-label="Passage för passage">
      <h2 className="mb-2 text-sm font-medium text-ink-3">Passage för passage</h2>

      <ul className="divide-y divide-kant rounded-xl border border-kant bg-panel">
        {passages.map((p, i) => {
          const stats = correctPerPassage[i];
          const isOpen = openIndex === i;
          const isAllCorrect = stats.correct === stats.total && stats.answered === stats.total;
          const cleanTitle = p.title.replace(/^PASSAGE\s+\d+\s*[-]\s*/i, '');

          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left hover:bg-insunken"
                aria-expanded={isOpen}
              >
                <span className="w-6 shrink-0 text-meta tabular-nums text-ink-3">{i + 1}</span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink-1">
                    {cleanTitle}
                  </span>
                  <span className="mt-0.5 block text-meta text-ink-3">{p.topic}</span>
                </span>

                <span
                  className={`shrink-0 text-meta font-medium tabular-nums ${
                    isAllCorrect ? 'text-positiv' : 'text-ink-3'
                  }`}
                >
                  {stats.correct} av {stats.total}
                </span>

                <ChevronDown
                  aria-hidden="true"
                  strokeWidth={1.75}
                  className={`h-5 w-5 shrink-0 text-ink-3 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen ? (
                <div className="space-y-3 px-4 pb-6 pt-1">
                  {/* Passage-text, naturliga stycken */}
                  <div className="space-y-2 rounded-lg border border-kant bg-insunken p-3 text-sm leading-[22px] text-ink-2 sm:space-y-3">
                    {splitIntoParagraphs(p.text).map((paragraph, pi) => (
                      <p key={pi}>{paragraph}</p>
                    ))}
                  </div>

                  {/* Påståendena */}
                  <div className="space-y-2">
                    {p.statements.map((st, sIdx) => {
                      const userAnswer = answers.find(
                        (a) => a.passageId === p.id && a.statementIndex === sIdx
                      );
                      return (
                        <StatementResult
                          key={sIdx}
                          index={sIdx}
                          text={st.text}
                          correctAnswer={st.correctAnswer}
                          explanation={st.explanation}
                          isProv={isProv}
                          userAnswer={userAnswer?.answer ?? null}
                          isCorrect={userAnswer?.isCorrect ?? false}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function StatementResult({
  index,
  text,
  correctAnswer,
  explanation,
  isProv,
  userAnswer,
  isCorrect,
}: {
  index: number;
  text: string;
  correctAnswer: 'true' | 'false' | 'cannot_say';
  explanation?: string;
  isProv?: boolean;
  userAnswer: 'true' | 'false' | 'cannot_say' | null;
  isCorrect: boolean;
}) {
  const [showExplanation, setShowExplanation] = useState(false);
  const wasAnswered = userAnswer !== null;
  const labelFor = (v: 'true' | 'false' | 'cannot_say' | null) => {
    if (v === 'true') return 'Sant';
    if (v === 'false') return 'Falskt';
    if (v === 'cannot_say') return 'Kan ej avgöras';
    return 'Inget svar';
  };

  return (
    <div className="rounded-lg border border-kant bg-panel p-3">
      <div className="flex items-start gap-2.5">
        <span className="w-5 shrink-0 pt-0.5 text-meta tabular-nums text-ink-3">{index + 1}</span>

        <div className="min-w-0 flex-1">
          <p className="mb-2 text-sm leading-[22px] text-ink-1">{text}</p>

          <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-meta">
            <div className="flex items-center gap-1">
              <dt className="text-ink-3">Ditt svar</dt>
              <dd
                className={`font-medium ${
                  isCorrect ? 'text-positiv' : wasAnswered ? 'text-fel' : 'text-ink-3'
                }`}
              >
                {labelFor(userAnswer)}
              </dd>
            </div>
            {!isCorrect ? (
              <div className="flex items-center gap-1">
                <dt className="text-ink-3">Rätt</dt>
                <dd className="font-medium text-ink-1">{labelFor(correctAnswer)}</dd>
              </div>
            ) : null}
          </dl>

          {explanation && isProv ? (
            <p className="mt-2 text-meta text-ink-3">
              Förklaringen är inte tillgänglig under prov.
            </p>
          ) : null}

          {explanation && !isProv ? (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowExplanation((v) => !v)}
                className="inline-flex items-center gap-1 text-meta font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 transition-colors hover:decoration-ink-1"
                aria-expanded={showExplanation}
              >
                {showExplanation ? 'Dölj förklaring' : 'Visa förklaring'}
              </button>
              {showExplanation ? (
                <p className="mt-1.5 rounded-lg border border-kant bg-insunken px-2.5 py-2 text-meta leading-[18px] text-ink-2">
                  {explanation}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
