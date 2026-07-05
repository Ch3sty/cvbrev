'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Lock,
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import PercentileCard from '@/app/dashboard/tester/components/PercentileCard';
import {
  selectProvQuestionsForSession,
  PROV_TOTAL_QUESTIONS,
} from '@/lib/logicTestV7/selectProv.v7';
import { SvgLayeredCell } from '@/lib/logicTestV7/layered.v7';
import type { LayeredCell, LayeredQuestion } from '@/lib/logicTestV7/layered.v7';

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

export default function ProvResultsPage({ params }: PageProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setSessionId(p.sessionId));
  }, [params]);

  // Samma prov-urval som test-sidan → identiska frågor för denna session.
  const questions = useMemo(
    () => (sessionId ? selectProvQuestionsForSession(sessionId) : []),
    [sessionId]
  );

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
        console.error('Failed to fetch prov session:', error);
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
          style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
        >
          Tillbaka till tester
        </button>
      </div>
    );
  }

  const score = session.score ?? 0;
  const totalQuestions = PROV_TOTAL_QUESTIONS;
  const percentage = Math.round((score / totalQuestions) * 100);
  const timeSpent = session.time_spent ?? 0;
  const savedAnswers = session.answers || [];

  const formatTime = (s: number) => `${Math.floor(s / 60)} min ${s % 60} sek`;
  const formatTimeShort = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const avgPerQuestion = Math.round(timeSpent / totalQuestions);
  const completedDate = session.completed_at
    ? new Date(session.completed_at).toLocaleDateString('sv-SE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

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

        {/* Jämförelse mot andra provresultat (renderas bara vid nog stort underlag) */}
        {sessionId && <PercentileCard sessionId={sessionId} />}

        <QuestionReview
          answers={savedAnswers}
          questions={questions}
          formatTimeShort={formatTimeShort}
        />

        <ResultsActions onRestart={() => router.push('/dashboard/tester')} />
      </div>
    </div>
  );
}

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
        <pattern id="prov-results-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="0.8" fill="white" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#prov-results-dots)" />
      </svg>
      <div className="relative p-6 sm:p-8 md:p-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white/20 backdrop-blur-sm mb-4">
          {isExcellent ? <Trophy className="w-3.5 h-3.5" strokeWidth={2.5} /> : <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />}
          Provresultat
        </div>
        <div className="flex items-baseline justify-center gap-3 mb-2 flex-wrap">
          <span className="text-5xl sm:text-6xl md:text-7xl font-black tabular-nums leading-none">{score}</span>
          <span className="text-2xl sm:text-3xl font-bold text-white/80">/ {totalQuestions}</span>
          <span
            className="inline-flex items-center justify-center px-3 py-1 rounded-full text-base sm:text-lg font-bold tabular-nums bg-white text-orange-700 ml-1"
            style={isExcellent ? { boxShadow: '0 0 20px 4px rgba(251, 191, 36, 0.5)' } : undefined}
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
        <Stat icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />} label="Korrekta" value={`${score} / ${totalQuestions}`} />
        <Stat icon={<Clock className="w-4 h-4 text-orange-600" strokeWidth={2.5} />} label="Tid" value={formatTime(timeSpent)} />
        <Stat icon={<TrendingUp className="w-4 h-4 text-blue-600" strokeWidth={2.5} />} label="Per fråga" value={`${avgPerQuestion}s`} />
      </div>
    </motion.section>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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

function QuestionReview({
  answers,
  questions,
  formatTimeShort,
}: {
  answers: SavedAnswer[];
  questions: LayeredQuestion[];
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
                  <p className="text-sm font-semibold text-slate-900">Fråga {i + 1}</p>
                  {isAnswered ? (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatTimeShort(answer!.time_spent)} · Svårighet {q.difficulty}/3
                    </p>
                  ) : (
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
                      {/* Ingen regel/förklaring under prov — bara facit. */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" strokeWidth={2.5} />
                        <p className="text-xs text-slate-500">
                          Förklaring är inte tillgänglig under prov. Träna på testen för full
                          genomgång.
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
                          {!isCorrect ? (
                            <ReviewOption
                              label="Rätt svar"
                              letter={String.fromCharCode(65 + q.correctAnswer)}
                              cell={q.options[q.correctAnswer]}
                              color="emerald"
                            />
                          ) : (
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
  cell: LayeredCell;
  color: 'emerald' | 'red';
}) {
  const colorClasses = {
    emerald: 'border-emerald-200 bg-emerald-50/60',
    red: 'border-red-200 bg-red-50/60',
  };
  const labelColors = { emerald: 'text-emerald-700', red: 'text-red-700' };
  return (
    <div className={`p-2.5 rounded-xl border ${colorClasses[color]}`}>
      <div className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${labelColors[color]}`}>
        {label} ({letter})
      </div>
      <div className="aspect-square w-full max-w-[80px] mx-auto bg-white rounded-lg border border-white p-2">
        <svg viewBox="0 0 100 100" className="w-full h-full" shapeRendering="geometricPrecision">
          <SvgLayeredCell cell={cell} />
        </svg>
      </div>
    </div>
  );
}

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
        Tillbaka till tester
      </button>
      <button
        onClick={() => router.push('/dashboard/tester')}
        className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:border-orange-300 hover:text-orange-700 transition-colors min-h-[52px] touch-manipulation"
      >
        <Home className="w-4 h-4" strokeWidth={2.5} />
        Alla tester
      </button>
    </motion.section>
  );
}
