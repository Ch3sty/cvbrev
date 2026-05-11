'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flag, AlertCircle } from 'lucide-react';

import LikertScale from './LikertScale';
import TestHeader from './TestHeader';
import type {
  LikertValue,
  PersonalityItem,
  PersonalityTestType,
} from '@/lib/personalityTest/types';

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
  const [isSaving, setIsSaving] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const item = items[currentIdx];
  const answeredCount = useMemo(
    () => answers.filter((a) => a !== null).length,
    [answers]
  );
  const allAnswered = answeredCount === items.length;

  const saveAnswer = useCallback(
    async (questionId: string, value: LikertValue) => {
      try {
        await fetch('/api/personalityTest/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, questionId, value }),
        });
      } catch (error) {
        console.error('Failed to save answer:', error);
      }
    },
    [sessionId]
  );

  const handleSelect = useCallback(
    async (value: LikertValue) => {
      setIsSaving(true);
      const next = [...answers];
      next[currentIdx] = value;
      setAnswers(next);
      await saveAnswer(item.id, value);
      setIsSaving(false);

      // Auto-advance till nästa obesvarade
      setTimeout(() => {
        const nextUnanswered = next.findIndex((a, i) => i > currentIdx && a === null);
        if (nextUnanswered !== -1) {
          setCurrentIdx(nextUnanswered);
        } else if (currentIdx < items.length - 1) {
          setCurrentIdx(currentIdx + 1);
        }
      }, 200);
    },
    [answers, currentIdx, item, items.length, saveAnswer]
  );

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  const handleNext = () => {
    if (currentIdx < items.length - 1) setCurrentIdx(currentIdx + 1);
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

  return (
    <div className="min-h-screen">
      <TestHeader
        currentQuestion={currentIdx}
        totalQuestions={items.length}
        answeredCount={answeredCount}
      />

      <div className="container mx-auto py-5 sm:py-6 px-3 sm:px-4 max-w-3xl">
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
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700 mb-2">
                  Påstående {currentIdx + 1} av {items.length}
                </div>
                <div className="bg-white border border-indigo-100 rounded-3xl p-6 sm:p-8 md:p-10 max-w-2xl mx-auto"
                  style={{ boxShadow: '0 8px 24px -12px rgba(99, 102, 241, 0.2)' }}>
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-900 leading-relaxed">
                    {item.text}
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-3">
                  Välj det alternativ som stämmer bäst för dig
                </p>
              </div>

              <LikertScale
                value={answers[currentIdx]}
                onChange={handleSelect}
                disabled={isSaving}
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 pt-2">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px] touch-manipulation"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
              Föregående
            </button>

            <button
              onClick={() => setShowFinishConfirm(true)}
              disabled={!allAnswered}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm border-2 border-indigo-300 bg-white text-indigo-700 hover:bg-indigo-50 transition-colors min-h-[48px] touch-manipulation disabled:opacity-40 disabled:cursor-not-allowed"
              title={allAnswered ? 'Slutför testet' : 'Svara på alla frågor för att slutföra'}
            >
              <Flag className="w-4 h-4" strokeWidth={2.5} />
              Slutför
            </button>

            <button
              onClick={handleNext}
              disabled={currentIdx === items.length - 1}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 min-h-[48px] touch-manipulation"
              style={{
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                boxShadow: '0 8px 20px -6px rgba(139, 92, 246, 0.4)',
              }}
            >
              Nästa
              <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>

          {/* Visuell ruta som visar att man kan navigera */}
          <QuestionNavigationDots
            total={items.length}
            currentIdx={currentIdx}
            answers={answers}
            onNavigate={setCurrentIdx}
          />
        </div>
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
              style={{ boxShadow: '0 24px 60px -16px rgba(139, 92, 246, 0.4)' }}
            >
              <div
                className="absolute top-0 inset-x-0 h-1"
                style={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6, #EC4899)' }}
              />
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center text-white"
                    style={{
                      background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                      boxShadow: '0 6px 14px -4px rgba(139, 92, 246, 0.4)',
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
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:border-indigo-300 hover:text-indigo-700 transition-colors min-h-[48px]"
                  >
                    Tillbaka
                  </button>
                  <button
                    onClick={handleFinish}
                    className="flex-1 px-4 py-3 rounded-xl text-white font-bold text-sm transition-all hover:-translate-y-0.5 min-h-[48px]"
                    style={{
                      background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)',
                      boxShadow: '0 8px 20px -6px rgba(139, 92, 246, 0.45)',
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
    </div>
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
                  ? 'ring-2 ring-indigo-500 ring-offset-1 text-white'
                  : isAnswered
                  ? 'text-white hover:scale-105'
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
              style={
                isAnswered || isCurrent
                  ? { background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }
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
