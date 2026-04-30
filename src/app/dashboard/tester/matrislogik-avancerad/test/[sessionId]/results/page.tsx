'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Trophy,
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import questionBank from '@/lib/logicTestV7/questionBank.v7.json';
import type { Question } from '@/lib/logicTestV7/types.v7';
import { SvgCellV7 } from '@/lib/logicTestV7/renderers.v7';

const questions = questionBank as Question[];

interface SavedAnswer {
  q_id: string;
  selected: number;
  correct: boolean;
  time_spent: number;
}

interface SessionData {
  id: string;
  score: number | null;
  time_spent: number | null;
  completed_at: string | null;
  answers: SavedAnswer[];
}

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

const QUESTION_CATEGORIES: Record<string, string> = {
  'v7-q1-glyph-grid': 'Attribut-grid',
  'v7-q2-ring-progression': 'Räkning & summa',
  'v7-q3-tally-orientation': 'Räkning & summa',
  'v7-q4-vector-rotation': 'Rotation & spegling',
  'v7-q5-lattice-xor': 'Set-operationer',
  'v7-q6-orbital-rotation': 'Rotation & spegling',
  'v7-q7-rays-to-tally': 'Räkning & summa',
  'v7-q8-stack-latin': 'Attribut-grid',
  'v7-q9-poly-progression': 'Räkning & summa',
  'v7-q10-fibonacci-tally': 'Räkning & summa',
  'v7-q11-ring-xor': 'Set-operationer',
  'v7-q12-triple-stack': 'Attribut-grid',
  'v7-q13-tile-mirror': 'Rotation & spegling',
  'v7-q14-double-progression': 'Räkning & summa',
  'v7-q15-tile-xor': 'Set-operationer',
};

export default function ResultsPage({ params }: PageProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setSessionId(p.sessionId));
  }, [params]);

  useEffect(() => {
    if (!sessionId) return;
    const fetchSession = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('logic_test_v4_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();
        if (error) throw error;
        setSession(data);
      } catch (error) {
        console.error('Failed to fetch session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-md text-center">
        <p className="text-slate-600 mb-4">Sessionen kunde inte hittas.</p>
        <button
          onClick={() => router.push('/dashboard/tester')}
          className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-white font-bold text-sm"
          style={{
            background: 'linear-gradient(135deg, #F97316, #DC2626)',
          }}
        >
          Tillbaka till tester
        </button>
      </div>
    );
  }

  const score = session.score ?? 0;
  const totalQuestions = 15;
  const percentage = Math.round((score / totalQuestions) * 100);
  const timeSpent = session.time_spent ?? 0;
  const savedAnswers = session.answers || [];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} min ${secs} sek`;
  };

  const formatTimeShort = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const avgPerQuestion = Math.round(timeSpent / totalQuestions);

  const completedDate = session.completed_at
    ? new Date(session.completed_at).toLocaleDateString('sv-SE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const isLegacySession =
    savedAnswers.length > 0 &&
    !savedAnswers.some((a) => questions.find((q) => q.id === a.q_id));

  const categoryStats: Record<string, { correct: number; total: number }> = {};
  if (!isLegacySession) {
    questions.forEach((q) => {
      const cat = QUESTION_CATEGORIES[q.id] || 'Övrigt';
      if (!categoryStats[cat]) categoryStats[cat] = { correct: 0, total: 0 };
      categoryStats[cat].total += 1;
      const ans = savedAnswers.find((a) => a.q_id === q.id);
      if (ans?.correct) categoryStats[cat].correct += 1;
    });
  }

  const strengths = Object.entries(categoryStats).filter(
    ([, s]) => s.correct === s.total && s.total > 0
  );
  const weaknesses = Object.entries(categoryStats).filter(
    ([, s]) => s.correct < s.total && s.total > 0
  );

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-3xl">
      <div className="space-y-5 sm:space-y-6">
        <ResultsHero
          score={score}
          totalQuestions={totalQuestions}
          percentage={percentage}
          completedDate={completedDate}
          timeSpent={timeSpent}
        />

        <StatsRow
          score={score}
          totalQuestions={totalQuestions}
          timeSpent={timeSpent}
          avgPerQuestion={avgPerQuestion}
          formatTime={formatTime}
        />

        {isLegacySession && <LegacySessionNotice />}

        {!isLegacySession && (strengths.length > 0 || weaknesses.length > 0) && (
          <InsightsCard strengths={strengths} weaknesses={weaknesses} />
        )}

        {!isLegacySession && (
          <QuestionReview answers={savedAnswers} formatTimeShort={formatTimeShort} />
        )}

        <ResultsActions
          onRestart={() => router.push('/dashboard/tester/matrislogik-avancerad')}
        />
      </div>
    </div>
  );
}

/* ----------- Hero ----------- */

function ResultsHero({
  score,
  totalQuestions,
  percentage,
  completedDate,
  timeSpent,
}: {
  score: number;
  totalQuestions: number;
  percentage: number;
  completedDate: string;
  timeSpent: number;
}) {
  const isExcellent = percentage >= 80;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl text-white"
      style={{
        background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        boxShadow: '0 20px 60px -20px rgba(220, 38, 38, 0.45)',
      }}
    >
      <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" aria-hidden="true">
        <pattern id="results-adv-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="0.8" fill="white" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#results-adv-dots)" />
      </svg>

      <div className="relative p-6 sm:p-8 md:p-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white/20 backdrop-blur-sm mb-4">
          {isExcellent ? <Trophy className="w-3.5 h-3.5" strokeWidth={2.5} /> : <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />}
          Resultat — avancerad
        </div>

        <div className="flex items-baseline justify-center gap-3 mb-2 flex-wrap">
          <span className="text-5xl sm:text-6xl md:text-7xl font-black tabular-nums leading-none">
            {score}
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-white/80">
            / {totalQuestions}
          </span>
          <span
            className="inline-flex items-center justify-center px-3 py-1 rounded-full text-base sm:text-lg font-bold tabular-nums bg-white text-orange-700 ml-1"
            style={
              isExcellent
                ? { boxShadow: '0 0 20px 4px rgba(251, 191, 36, 0.5)' }
                : undefined
            }
          >
            {percentage}%
          </span>
        </div>

        <p className="text-sm sm:text-base opacity-95">
          Slutfört på {Math.floor(timeSpent / 60)} min {timeSpent % 60} sek · {completedDate}
        </p>
      </div>
    </motion.section>
  );
}

/* ----------- Stats ----------- */

function StatsRow({
  score,
  totalQuestions,
  timeSpent,
  avgPerQuestion,
  formatTime,
}: {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  avgPerQuestion: number;
  formatTime: (s: number) => string;
}) {
  return (
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
          value={`${score} / ${totalQuestions}`}
        />
        <Stat
          icon={<Clock className="w-4 h-4 text-orange-600" strokeWidth={2.5} />}
          label="Tid"
          value={formatTime(timeSpent)}
        />
        <Stat
          icon={<TrendingUp className="w-4 h-4 text-blue-600" strokeWidth={2.5} />}
          label="Per fråga"
          value={`${avgPerQuestion}s`}
        />
      </div>
    </motion.section>
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

/* ----------- Legacy notice ----------- */

function LegacySessionNotice() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 }}
      className="bg-white rounded-3xl border border-amber-200/70 p-4 sm:p-5"
      style={{ boxShadow: '0 4px 16px -8px rgba(245, 158, 11, 0.18)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white"
          style={{
            background: 'linear-gradient(135deg, #F59E0B, #F97316)',
            boxShadow: '0 4px 10px -3px rgba(245, 158, 11, 0.4)',
          }}
        >
          <TrendingUp className="w-4 h-4" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-900 leading-tight">
            Detta resultat är från en tidigare version av testet
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            Vi har förbättrat avancerad-banken sedan den här sessionen gjordes.
            Genomgång per fråga är inte tillgänglig — gör om testet för full
            återkoppling.
          </p>
        </div>
      </div>
    </motion.section>
  );
}

/* ----------- Insights ----------- */

function InsightsCard({
  strengths,
  weaknesses,
}: {
  strengths: [string, { correct: number; total: number }][];
  weaknesses: [string, { correct: number; total: number }][];
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="grid sm:grid-cols-2 gap-3 sm:gap-4"
    >
      {strengths.length > 0 && (
        <div
          className="bg-white rounded-3xl border border-emerald-200/60 p-4 sm:p-5"
          style={{ boxShadow: '0 4px 16px -8px rgba(16, 185, 129, 0.15)' }}
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 mb-1.5">
            Dina styrkor
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-3">Du behärskar</h3>
          <ul className="space-y-2">
            {strengths.map(([cat, s]) => (
              <li key={cat} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" strokeWidth={2.5} />
                <span className="text-slate-700">
                  <span className="font-semibold">{cat}</span>{' '}
                  <span className="text-slate-500 text-xs">
                    ({s.correct}/{s.total})
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {weaknesses.length > 0 && (
        <div
          className="bg-white rounded-3xl border border-orange-200/60 p-4 sm:p-5"
          style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
            Att träna på
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-3">Områden att fokusera på</h3>
          <ul className="space-y-2">
            {weaknesses.map(([cat, s]) => (
              <li key={cat} className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-orange-600 flex-shrink-0" strokeWidth={2.5} />
                <span className="text-slate-700">
                  <span className="font-semibold">{cat}</span>{' '}
                  <span className="text-slate-500 text-xs">
                    ({s.correct}/{s.total})
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.section>
  );
}

/* ----------- Per-fråga-genomgång ----------- */

function QuestionReview({
  answers,
  formatTimeShort,
}: {
  answers: SavedAnswer[];
  formatTimeShort: (s: number) => string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">Fråga för fråga</h2>
      </div>

      <div
        className="bg-white rounded-3xl border border-orange-100 overflow-hidden divide-y divide-orange-100"
        style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
      >
        {questions.map((q, i) => {
          const answer = answers.find((a) => a.q_id === q.id);
          const isAnswered = answer !== undefined;
          const isCorrect = answer?.correct ?? false;
          const isOpen = openIndex === i;

          return (
            <div key={q.id}>
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
                    {q.title.replace(/^FRÅGA\s+\d+\s*[—-]\s*/i, '')}
                  </p>
                  {isAnswered && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatTimeShort(answer!.time_spent)} · Svårighet {q.difficulty}/4
                    </p>
                  )}
                  {!isAnswered && (
                    <p className="text-xs text-slate-400 mt-0.5">Inte besvarad</p>
                  )}
                </div>

                <div className="flex-shrink-0 flex items-center gap-2">
                  {isAnswered ? (
                    isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" strokeWidth={2.5} />
                    )
                  ) : (
                    <span className="w-5 h-5 rounded-full border-2 border-slate-300" />
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
                      <div className="bg-orange-50/60 border border-orange-100 rounded-xl p-3">
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {q.rule}
                        </p>
                      </div>

                      {isAnswered && (
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <ReviewOption
                            label="Ditt svar"
                            letter={String.fromCharCode(65 + answer!.selected)}
                            cell={q.options[answer!.selected]}
                            color={isCorrect ? 'emerald' : 'red'}
                          />
                          {!isCorrect && (
                            <ReviewOption
                              label="Rätt svar"
                              letter={String.fromCharCode(65 + q.correctAnswer)}
                              cell={q.options[q.correctAnswer]}
                              color="emerald"
                            />
                          )}
                          {isCorrect && (
                            <div className="flex items-center justify-center p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                              <span className="text-sm font-semibold text-emerald-700">Rätt!</span>
                            </div>
                          )}
                        </div>
                      )}
                      {!isAnswered && (
                        <div className="grid grid-cols-1">
                          <ReviewOption
                            label="Rätt svar"
                            letter={String.fromCharCode(65 + q.correctAnswer)}
                            cell={q.options[q.correctAnswer]}
                            color="emerald"
                          />
                        </div>
                      )}
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

function ReviewOption({
  label,
  letter,
  cell,
  color,
}: {
  label: string;
  letter: string;
  cell: Question['options'][number];
  color: 'emerald' | 'red';
}) {
  const colorClasses = {
    emerald: 'border-emerald-200 bg-emerald-50/60',
    red: 'border-red-200 bg-red-50/60',
  };
  const labelColors = {
    emerald: 'text-emerald-700',
    red: 'text-red-700',
  };

  return (
    <div className={`p-2.5 rounded-xl border ${colorClasses[color]}`}>
      <div className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${labelColors[color]}`}>
        {label} ({letter})
      </div>
      <div className="aspect-square w-full max-w-[80px] mx-auto bg-white rounded-lg border border-white p-2">
        <svg viewBox="0 0 100 100" className="w-full h-full" shapeRendering="geometricPrecision">
          <SvgCellV7 cell={cell} />
        </svg>
      </div>
    </div>
  );
}

/* ----------- Action buttons ----------- */

function ResultsActions({ onRestart }: { onRestart: () => void }) {
  const router = useRouter();
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="flex flex-col sm:flex-row gap-3"
    >
      <button
        onClick={onRestart}
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
  );
}
