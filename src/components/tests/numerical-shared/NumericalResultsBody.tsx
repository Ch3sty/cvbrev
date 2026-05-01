'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronDown, BarChart3 } from 'lucide-react';
import {
  TableTopicIcon,
  ChartTopicIcon,
  SeriesTopicIcon,
  WordProblemTopicIcon,
  ConversionTopicIcon,
} from './illustrations/NumericalIcons';
import type {
  Passage,
  TestAnswer,
  QuestionType,
} from '@/lib/numericalTest/types';

interface NumericalResultsBodyProps {
  passages: Passage[];
  answers: TestAnswer[];
  byDifficulty: {
    difficulty1: { correct: number; total: number };
    difficulty2: { correct: number; total: number };
    difficulty3: { correct: number; total: number };
  };
  byType: { [key in QuestionType]: { correct: number; total: number } };
}

const TYPE_LABEL: Record<QuestionType, string> = {
  table: 'Tabeller',
  graph: 'Grafer',
  series: 'Talserier',
  word_problem: 'Lästal',
  conversion: 'Konvertering',
};

const TYPE_ICON: Record<QuestionType, React.ComponentType<{ className?: string }>> = {
  table: TableTopicIcon,
  graph: ChartTopicIcon,
  series: SeriesTopicIcon,
  word_problem: WordProblemTopicIcon,
  conversion: ConversionTopicIcon,
};

export default function NumericalResultsBody({
  passages,
  answers,
  byDifficulty,
  byType,
}: NumericalResultsBodyProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Breakdown grid */}
      <BreakdownSection byDifficulty={byDifficulty} byType={byType} />

      {/* Answer key */}
      <AnswerKey passages={passages} answers={answers} />
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
  return (
    <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
      {/* Difficulty breakdown */}
      <div
        className="relative bg-white rounded-3xl border border-orange-200/60 overflow-hidden p-5 sm:p-6"
        style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.15)' }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: 'linear-gradient(90deg, #FB923C 0%, #DC2626 50%, #BE185D 100%)',
          }}
        />
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
            style={{
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
              boxShadow: '0 4px 10px -3px rgba(220, 38, 38, 0.35)',
            }}
          >
            <BarChart3 className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <h3 className="font-bold text-slate-900 text-base sm:text-lg">Per svårighetsnivå</h3>
        </div>
        <div className="space-y-3">
          <DifficultyBar label="Lätt" data={byDifficulty.difficulty1} colorIdx={0} />
          <DifficultyBar label="Medel" data={byDifficulty.difficulty2} colorIdx={1} />
          <DifficultyBar label="Svår" data={byDifficulty.difficulty3} colorIdx={2} />
        </div>
      </div>

      {/* Type breakdown */}
      <div
        className="relative bg-white rounded-3xl border border-orange-200/60 overflow-hidden p-5 sm:p-6"
        style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.15)' }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: 'linear-gradient(90deg, #FB923C 0%, #DC2626 50%, #BE185D 100%)',
          }}
        />
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
            style={{
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
              boxShadow: '0 4px 10px -3px rgba(220, 38, 38, 0.35)',
            }}
          >
            <BarChart3 className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <h3 className="font-bold text-slate-900 text-base sm:text-lg">Per fråge-typ</h3>
        </div>
        <div className="space-y-2.5">
          {(Object.entries(byType) as [QuestionType, { correct: number; total: number }][])
            .filter(([, data]) => data.total > 0)
            .map(([type, data]) => {
              const Icon = TYPE_ICON[type];
              const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
              return (
                <div
                  key={type}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-orange-50/40 border border-orange-100"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #F97316, #DC2626)',
                    }}
                  >
                    <Icon className="w-[16px] h-[16px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 leading-tight">
                      {TYPE_LABEL[type]}
                    </div>
                    <div className="text-xs text-slate-500 tabular-nums">
                      {data.correct} / {data.total} rätt
                    </div>
                  </div>
                  <div className="text-sm font-bold text-orange-700 tabular-nums">{pct}%</div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function DifficultyBar({
  label,
  data,
  colorIdx,
}: {
  label: string;
  data: { correct: number; total: number };
  colorIdx: number;
}) {
  const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
  const colors = [
    'from-emerald-500 to-emerald-600',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-600',
  ];

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-xs text-slate-500 tabular-nums">
          {data.correct} / {data.total} ({pct}%)
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-orange-50 overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${colors[colorIdx]}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
    </div>
  );
}

function AnswerKey({
  passages,
  answers,
}: {
  passages: Passage[];
  answers: TestAnswer[];
}) {
  return (
    <section
      className="relative bg-white rounded-3xl border border-orange-200/60 overflow-hidden"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.15)' }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: 'linear-gradient(90deg, #FB923C 0%, #DC2626 50%, #BE185D 100%)',
        }}
      />
      <div className="p-5 sm:p-6 md:p-7">
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
            style={{
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
              boxShadow: '0 4px 10px -3px rgba(220, 38, 38, 0.35)',
            }}
          >
            <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Genomgång av frågor
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Se rätt svar och förklaringar
            </p>
          </div>
        </div>

        <div className="space-y-2">
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
                />
              );
            });
          })}
        </div>
      </div>
    </section>
  );
}

function AnswerKeyRow({
  passage,
  question,
  answer,
  questionIndex,
}: {
  passage: Passage;
  question: Passage['questions'][number];
  answer?: TestAnswer;
  questionIndex: number;
}) {
  const [open, setOpen] = useState(false);
  const isCorrect = answer?.isCorrect ?? false;
  const selectedOption = answer
    ? question.options.find((o) => o.id === answer.selectedAnswerId)
    : null;
  const correctOption = question.options.find((o) => o.id === question.correctAnswerId);

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-colors ${
        isCorrect
          ? 'border-emerald-100 bg-emerald-50/40'
          : 'border-rose-100 bg-rose-50/40'
      }`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 text-left hover:bg-white/40 transition-colors min-h-[56px] touch-manipulation"
        aria-expanded={open}
      >
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        >
          {isCorrect ? (
            <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={2.5} />
          ) : (
            <XCircle className="w-4 h-4 text-white" strokeWidth={2.5} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-0.5">
            {passage.topic} · Fråga {questionIndex + 1}
          </div>
          <div className="text-sm font-semibold text-slate-900 leading-snug truncate">
            {question.questionText}
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          strokeWidth={2.5}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 space-y-3">
              {/* Ditt svar */}
              {selectedOption && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1">
                    Ditt svar
                  </div>
                  <div
                    className={`text-sm rounded-lg px-3 py-2 ${
                      isCorrect
                        ? 'bg-emerald-100/60 text-emerald-900 border border-emerald-200'
                        : 'bg-rose-100/60 text-rose-900 border border-rose-200'
                    }`}
                  >
                    {selectedOption.text}
                  </div>
                </div>
              )}

              {/* Rätt svar */}
              {!isCorrect && correctOption && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-emerald-700 mb-1">
                    Rätt svar
                  </div>
                  <div className="text-sm rounded-lg px-3 py-2 bg-emerald-100/60 text-emerald-900 border border-emerald-200">
                    {correctOption.text}
                  </div>
                </div>
              )}

              {/* Förklaring */}
              {question.explanation && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-orange-700 mb-1">
                    Förklaring
                  </div>
                  <div className="text-sm text-slate-700 leading-relaxed bg-orange-50/40 border border-orange-100 rounded-lg px-3 py-2.5">
                    {question.explanation}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
