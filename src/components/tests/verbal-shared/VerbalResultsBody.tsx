'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  HelpCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  statements: { text: string; correctAnswer: 'true' | 'false' | 'cannot_say' }[];
}

interface VerbalResultsBodyProps {
  score: number;
  totalStatements: number;
  timeSpent: number;
  answers: SavedAnswer[];
  passages: ResultsPassage[];
  restartPath: string;
}

export default function VerbalResultsBody({
  score,
  totalStatements,
  timeSpent,
  answers,
  passages,
  restartPath,
}: VerbalResultsBodyProps) {
  const router = useRouter();
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins} min ${secs} sek`;
  };

  const avgPerStatement = Math.round(timeSpent / Math.max(totalStatements, 1));

  return (
    <>
      {/* Stats-rad */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="bg-white rounded-3xl border border-orange-100 p-4 sm:p-5"
        style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
      >
        <div className="grid grid-cols-3 gap-2 sm:gap-4 divide-x divide-orange-100">
          <Stat
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />}
            label="Korrekta"
            value={`${score} / ${totalStatements}`}
          />
          <Stat
            icon={<Clock className="w-4 h-4 text-orange-600" strokeWidth={2.5} />}
            label="Tid"
            value={formatTime(timeSpent)}
          />
          <Stat
            icon={<TrendingUp className="w-4 h-4 text-blue-600" strokeWidth={2.5} />}
            label="Per påstående"
            value={`${avgPerStatement}s`}
          />
        </div>
      </motion.section>

      {/* Per-passage-genomgång */}
      <PassageReview answers={answers} passages={passages} />

      {/* Action buttons */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <button
          onClick={() => router.push(restartPath)}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:-translate-y-0.5 min-h-[52px] touch-manipulation"
          style={{
            background: 'linear-gradient(135deg, #F97316, #DC2626, #BE185D)',
            boxShadow: '0 10px 30px -8px rgba(220, 38, 38, 0.45)',
          }}
        >
          <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
          Gör om testet
        </button>
        <button
          onClick={() => router.push('/dashboard/tester')}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:border-orange-300 hover:text-orange-700 transition-colors min-h-[52px] touch-manipulation"
        >
          <Home className="w-4 h-4" strokeWidth={2.5} />
          Tillbaka till tester
        </button>
      </motion.section>
    </>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-2 sm:px-3 text-center">
      <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-wider font-semibold text-slate-500">
        {icon}
        {label}
      </div>
      <div className="text-sm sm:text-base font-bold text-slate-900 tabular-nums">{value}</div>
    </div>
  );
}

function PassageReview({
  answers,
  passages,
}: {
  answers: SavedAnswer[];
  passages: ResultsPassage[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Beräkna antal rätt per passage
  const correctPerPassage = passages.map((p) => {
    const passageAnswers = answers.filter((a) => a.passageId === p.id);
    const correct = passageAnswers.filter((a) => a.isCorrect === true).length;
    return { total: p.statements.length, correct, answered: passageAnswers.length };
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      <div className="mb-3 sm:mb-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1">
          Genomgång
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">Passage för passage</h2>
      </div>

      <div
        className="bg-white rounded-3xl border border-orange-100 overflow-hidden divide-y divide-orange-100"
        style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
      >
        {passages.map((p, i) => {
          const stats = correctPerPassage[i];
          const isOpen = openIndex === i;
          const isAllCorrect = stats.correct === stats.total;
          const cleanTitle = p.title.replace(/^PASSAGE\s+\d+\s*[—-]\s*/i, '');

          return (
            <div key={p.id}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-3.5 text-left hover:bg-orange-50/40 transition-colors min-h-[60px]"
                aria-expanded={isOpen}
              >
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold tabular-nums"
                  style={{
                    background: 'linear-gradient(135deg, #F97316, #DC2626)',
                    boxShadow: '0 4px 10px -3px rgba(220, 38, 38, 0.3)',
                  }}
                >
                  {i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {cleanTitle}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    <span className="tabular-nums">{stats.correct}/{stats.total}</span> rätt · {p.topic}
                  </p>
                </div>

                <div className="flex-shrink-0 flex items-center gap-2">
                  {isAllCorrect && stats.answered === stats.total ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
                  ) : stats.correct === 0 && stats.answered > 0 ? (
                    <XCircle className="w-5 h-5 text-red-500" strokeWidth={2.5} />
                  ) : (
                    <span className="inline-flex items-center justify-center w-7 h-5 text-[10px] font-bold rounded-full bg-orange-100 text-orange-700 tabular-nums">
                      {stats.correct}/{stats.total}
                    </span>
                  )}
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" strokeWidth={2.5} />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" strokeWidth={2.5} />
                  )}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 sm:px-5 pb-5 pt-1 space-y-3">
                      {/* Passage-text */}
                      <div className="bg-orange-50/60 border border-orange-100 rounded-xl p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {p.text}
                        </p>
                      </div>

                      {/* Statements */}
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
                              userAnswer={userAnswer?.answer ?? null}
                              isCorrect={userAnswer?.isCorrect ?? false}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}

function StatementResult({
  index,
  text,
  correctAnswer,
  userAnswer,
  isCorrect,
}: {
  index: number;
  text: string;
  correctAnswer: 'true' | 'false' | 'cannot_say';
  userAnswer: 'true' | 'false' | 'cannot_say' | null;
  isCorrect: boolean;
}) {
  const wasAnswered = userAnswer !== null;
  const labelFor = (v: 'true' | 'false' | 'cannot_say' | null) => {
    if (v === 'true') return 'Sant';
    if (v === 'false') return 'Falskt';
    if (v === 'cannot_say') return 'Kan ej avgöras';
    return 'Inget svar';
  };

  const colorFor = (v: 'true' | 'false' | 'cannot_say' | null) => {
    if (v === 'true') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (v === 'false') return 'bg-red-100 text-red-700 border-red-200';
    if (v === 'cannot_say') return 'bg-slate-100 text-slate-700 border-slate-200';
    return 'bg-slate-100 text-slate-500 border-slate-200';
  };

  const iconFor = (v: 'true' | 'false' | 'cannot_say' | null) => {
    if (v === 'true') return <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />;
    if (v === 'false') return <XCircle className="w-3 h-3" strokeWidth={2.5} />;
    if (v === 'cannot_say') return <HelpCircle className="w-3 h-3" strokeWidth={2.5} />;
    return null;
  };

  return (
    <div
      className={`rounded-xl border p-3 ${
        isCorrect
          ? 'bg-emerald-50/40 border-emerald-200/60'
          : wasAnswered
          ? 'bg-red-50/30 border-red-200/60'
          : 'bg-slate-50 border-slate-200/60'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center bg-white border border-orange-100 text-xs font-bold text-slate-700 tabular-nums">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-slate-800 leading-snug mb-2">{text}</p>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-bold ${colorFor(userAnswer)}`}
            >
              {iconFor(userAnswer)}
              Ditt svar: {labelFor(userAnswer)}
            </span>
            {!isCorrect && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-bold ${colorFor(correctAnswer)}`}
              >
                {iconFor(correctAnswer)}
                Rätt: {labelFor(correctAnswer)}
              </span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          {isCorrect ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
          ) : wasAnswered ? (
            <XCircle className="w-4 h-4 text-red-500" strokeWidth={2.5} />
          ) : (
            <span className="inline-block w-4 h-4 rounded-full border-2 border-slate-300" />
          )}
        </div>
      </div>
    </div>
  );
}
