'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flag, AlertCircle } from 'lucide-react';

import LikertScale from './LikertScale';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import TestFlowShell from '@/components/tests/shared/TestFlowShell';
import type {
  LikertValue,
  PersonalityItem,
  PersonalityTestType,
} from '@/lib/personalityTest/types';
import { forstaObesvarade, nastaIndex, svarIOrdning } from '@/lib/personalityTest/aterupptag';

/** Testets namn i provskalets topprad. Speglar title i testConfig. */
const TITLE_BY_TYPE: Record<PersonalityTestType, string> = {
  'personlighet-grund': 'Personlighetstest, grundnivå',
  'personlighet-avancerad': 'Personlighetstest, avancerad nivå',
};

interface TestSessionViewProps {
  sessionId: string;
  testType: PersonalityTestType;
  items: PersonalityItem[];
  resultsBasePath: string; // ex: '/dashboard/tester/personlighet-grund/test'
}

export default function TestSessionView({
  sessionId,
  testType,
  items,
  resultsBasePath,
}: TestSessionViewProps) {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(LikertValue | null)[]>(
    () => Array(items.length).fill(null)
  );
  // Sparade svar hämtas från servern vid mount, så att en omladdning
  // fortsätter vid första obesvarade i stället för påstående 1.
  const [loaded, setLoaded] = useState(false);
  // Låset gäller från tryck tills sparningen bekräftats och vyn gått vidare,
  // så att ett snabbt andra tryck aldrig landar på samma påstående.
  const lockRef = useRef(false);
  const [locked, setLocked] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let avbruten = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/personalityTest/answer?sessionId=${encodeURIComponent(sessionId)}`,
          { cache: 'no-store' }
        );
        if (res.ok) {
          const data = await res.json();
          if (avbruten) return;
          if (data.completed) {
            router.replace(`${resultsBasePath}/${sessionId}/results`);
            return;
          }
          const sparade = svarIOrdning(items, data.answers);
          setAnswers(sparade);
          setCurrentIdx(forstaObesvarade(sparade));
        }
      } catch (error) {
        console.error('Failed to load answers:', error);
      } finally {
        if (!avbruten) setLoaded(true);
      }
    })();
    return () => {
      avbruten = true;
    };
  }, [sessionId, items, resultsBasePath, router]);

  const item = items[currentIdx];
  const answeredCount = useMemo(
    () => answers.filter((a) => a !== null).length,
    [answers]
  );
  const allAnswered = answeredCount === items.length;

  const saveAnswer = useCallback(
    async (questionId: string, value: LikertValue): Promise<boolean> => {
      try {
        const res = await fetch('/api/personalityTest/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, questionId, value }),
        });
        return res.ok;
      } catch (error) {
        console.error('Failed to save answer:', error);
        return false;
      }
    },
    [sessionId]
  );

  const handleSelect = useCallback(
    async (value: LikertValue) => {
      if (lockRef.current || !loaded) return;
      lockRef.current = true;
      setLocked(true);
      setSaveError(null);

      const idx = currentIdx;
      const previous = answers[idx];
      const next = [...answers];
      next[idx] = value;
      setAnswers(next);

      const ok = await saveAnswer(items[idx].id, value);
      if (!ok) {
        setAnswers((cur) => {
          const back = [...cur];
          back[idx] = previous;
          return back;
        });
        setSaveError('Svaret sparades inte. Försök igen.');
        lockRef.current = false;
        setLocked(false);
        return;
      }

      // Vidare till nästa obesvarade, låset släpps först när vyn bytt påstående
      setTimeout(() => {
        setCurrentIdx(nastaIndex(next, idx));
        lockRef.current = false;
        setLocked(false);
      }, 200);
    },
    [answers, currentIdx, items, loaded, saveAnswer]
  );

  const handlePrev = () => {
    if (!lockRef.current && currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  const handleNext = () => {
    if (!lockRef.current && currentIdx < items.length - 1) setCurrentIdx(currentIdx + 1);
  };

  const handleFinish = async () => {
    setSubmitError(null);
    try {
      const response = await fetch('/api/personalityTest/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await response.json();
      if (data.success || data.message) {
        router.push(`${resultsBasePath}/${sessionId}/results`);
      } else {
        setSubmitError(data.error ?? 'Något gick fel');
      }
    } catch (error) {
      console.error('Failed to finish test:', error);
      setSubmitError('Kunde inte spara resultatet. Försök igen.');
    }
  };

  // Tangentbordsgenvägar: siffrorna 1-5
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 5) {
        handleSelect(num as LikertValue);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, handleSelect]);

  if (!loaded) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <LoadingSkeleton variant="card" label="Testet laddas" />
      </div>
    );
  }

  return (
    <TestFlowShell
      title={TITLE_BY_TYPE[testType]}
      onExit={() => router.push('/dashboard/tester')}
      exitLabel="Lämna testet"
      progressPercent={(answeredCount / items.length) * 100}
      meter={
        <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
          <span className="font-bold tabular-nums text-slate-900">
            Fråga {currentIdx + 1}{' '}
            <span className="font-normal text-slate-500">av {items.length}</span>
          </span>
          <span className="rounded-full border border-orange-100 bg-orange-50 px-2 py-0.5 font-semibold tabular-nums text-orange-700">
            {answeredCount} svar
          </span>
        </div>
      }
      footer={
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            aria-label="Föregående påstående"
            className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:border-orange-300 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-40 touch-manipulation"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
          </button>

          {currentIdx === items.length - 1 ? (
            <button
              onClick={() => setShowFinishConfirm(true)}
              disabled={!allAnswered}
              title={allAnswered ? 'Slutför testet' : 'Svara på alla frågor för att slutföra'}
              className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-orange-600 px-4 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-40 touch-manipulation"
            >
              <Flag className="h-4 w-4" strokeWidth={2.5} />
              Lämna in
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-orange-600 px-4 text-sm font-medium text-white transition-colors hover:bg-orange-700 touch-manipulation"
            >
              Nästa
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
          )}
        </div>
      }
    >
        <div className="space-y-5 sm:space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22 }}
              className="space-y-5 sm:space-y-6"
            >
              <div className="text-center">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-2">
                  Påstående {currentIdx + 1} av {items.length}
                </div>
                <div className="bg-white border border-orange-100 rounded-3xl p-6 sm:p-8 md:p-10 max-w-2xl mx-auto"
                  style={{ boxShadow: '0 8px 24px -12px rgba(249, 115, 22, 0.2)' }}>
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-900 leading-relaxed">
                    {item.text}
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-3">
                  Välj det alternativ som stämmer bäst för dig
                </p>
              </div>

              {/* Under sparningen tar knapparna inte emot tryck, men ser likadana ut. */}
              <div
                className={locked ? 'pointer-events-none' : undefined}
                aria-busy={locked}
              >
                <LikertScale value={answers[currentIdx]} onChange={handleSelect} />
              </div>
              {saveError && (
                <p role="alert" className="text-center text-sm text-red-700">
                  {saveError}
                </p>
              )}
            </motion.div>
          </AnimatePresence>


          {/* Visuell ruta som visar att man kan navigera */}
          <QuestionNavigationDots
            total={items.length}
            currentIdx={currentIdx}
            answers={answers}
            onNavigate={(i) => {
              if (!lockRef.current) setCurrentIdx(i);
            }}
          />
        </div>

      {/* Finish-modal */}
      <AnimatePresence>
        {showFinishConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowFinishConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden"
              style={{ boxShadow: '0 24px 60px -16px rgba(220, 38, 38, 0.4)' }}
            >
              <div
                className="absolute top-0 inset-x-0 h-1"
                style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626, #BE185D)' }}
              />
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center text-white"
                    style={{
                      background: 'linear-gradient(135deg, #F97316, #DC2626)',
                      boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.4)',
                    }}
                  >
                    <Flag className="w-5 h-5" strokeWidth={2.25} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                      Slutför testet?
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Du har besvarat <span className="font-bold text-slate-900">{answeredCount}</span> av{' '}
                      <span className="font-bold text-slate-900">{items.length}</span> påståenden. Vi
                      beräknar din profil och du kan se resultatet direkt.
                    </p>
                  </div>
                </div>

                {submitError && (
                  <div className="mb-3 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 inline-flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="flex gap-2 sm:gap-3 mt-5">
                  <button
                    onClick={() => setShowFinishConfirm(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:border-orange-300 hover:text-orange-700 transition-colors min-h-[48px]"
                  >
                    Tillbaka
                  </button>
                  <button
                    onClick={handleFinish}
                    className="flex-1 px-4 py-3 rounded-xl text-white font-bold text-sm transition-all hover:-translate-y-0.5 min-h-[48px]"
                    style={{
                      background: 'linear-gradient(135deg, #F97316, #DC2626, #BE185D)',
                      boxShadow: '0 8px 20px -6px rgba(220, 38, 38, 0.45)',
                    }}
                  >
                    Se min profil
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </TestFlowShell>
  );
}

function QuestionNavigationDots({
  total,
  currentIdx,
  answers,
  onNavigate,
}: {
  total: number;
  currentIdx: number;
  answers: (LikertValue | null)[];
  onNavigate: (idx: number) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4">
      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2 text-center">
        Översikt — klicka för att hoppa
      </div>
      <div className="grid grid-cols-10 sm:grid-cols-15 gap-1">
        {Array.from({ length: total }).map((_, i) => {
          const isCurrent = i === currentIdx;
          const isAnswered = answers[i] !== null;
          return (
            <button
              key={i}
              onClick={() => onNavigate(i)}
              className={`relative aspect-square rounded-md text-[9px] sm:text-[10px] font-bold tabular-nums transition-all touch-manipulation ${
                isCurrent
                  ? 'ring-2 ring-orange-500 ring-offset-1 text-white'
                  : isAnswered
                  ? 'text-white hover:scale-105'
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
              style={
                isAnswered || isCurrent
                  ? { background: 'linear-gradient(135deg, #F97316, #DC2626)' }
                  : undefined
              }
              aria-label={`Gå till påstående ${i + 1}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
