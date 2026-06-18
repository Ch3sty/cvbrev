'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flag, AlertCircle } from 'lucide-react';

import VerbalTestHeader from '@/components/tests/verbal-shared/VerbalTestHeader';
import PassageDisplay from '@/components/tests/verbal-shared/PassageDisplay';
import StatementList from '@/components/tests/verbal-shared/StatementList';
import PassageNavigation from '@/components/tests/verbal-shared/PassageNavigation';
import { selectPassagesForSession } from '@/lib/verbalTestV1/selectPassages.v1';
import type { UserAnswer } from '@/lib/verbalTestV1/types.v1';

const TOTAL_TIME = 25 * 60;

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function VerbalTestPage({ params }: PageProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME);
  const [statementStartTime, setStatementStartTime] = useState(Date.now());
  const finishedRef = useRef(false);

  useEffect(() => {
    params.then((p) => setSessionId(p.sessionId));
  }, [params]);

  // Seedat urval ur banken: samma sessionId → samma passager (stabilt mellan
  // test- och resultatsida). Olika sessionId → nya frågor vid omspel.
  const questions = useMemo(
    () => (sessionId ? selectPassagesForSession(sessionId) : []),
    [sessionId]
  );

  // Initialize answers (när urvalet är klart)
  useEffect(() => {
    if (questions.length === 0) return;
    const initial: Record<string, UserAnswer[]> = {};
    questions.forEach((q) => {
      initial[q.id] = Array(q.statements.length).fill(null);
    });
    setAnswers(initial);
  }, [questions]);

  const currentPassage = questions[currentPassageIndex];
  const currentAnswers = answers[currentPassage?.id] || [];
  const totalStatements = questions.reduce((sum, q) => sum + q.statements.length, 0);
  const answeredCount = Object.values(answers).reduce(
    (sum, p) => sum + p.filter((a) => a !== null).length,
    0
  );
  const answeredPerPassage = questions.map(
    (q) => (answers[q.id] || []).filter((a) => a !== null).length
  );

  const handleFinishTest = useCallback(async () => {
    if (!sessionId || finishedRef.current) return;
    finishedRef.current = true;
    try {
      const response = await fetch('/api/verbalTestV1/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      if (response.ok) {
        router.push(`/dashboard/tester/verbal-resonemang/test/${sessionId}/results`);
      }
    } catch (error) {
      console.error('Failed to finish test:', error);
      finishedRef.current = false;
    }
  }, [sessionId, router]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [handleFinishTest]);

  const saveAnswer = useCallback(
    async (
      passageId: string,
      statementIndex: number,
      answer: 'true' | 'false' | 'cannot_say'
    ) => {
      if (!sessionId) return;
      const timeSpent = Math.floor((Date.now() - statementStartTime) / 1000);
      try {
        await fetch('/api/verbalTestV1/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            passageId,
            statementIndex,
            answer,
            timeSpent,
          }),
        });
      } catch (error) {
        console.error('Failed to save answer:', error);
      }
    },
    [sessionId, statementStartTime]
  );

  const handleSelectAnswer = async (
    statementIndex: number,
    value: 'true' | 'false' | 'cannot_say'
  ) => {
    setIsSaving(true);
    const newAnswers = { ...answers };
    newAnswers[currentPassage.id] = [...currentAnswers];
    newAnswers[currentPassage.id][statementIndex] = value;
    setAnswers(newAnswers);
    await saveAnswer(currentPassage.id, statementIndex, value);
    setStatementStartTime(Date.now());
    setIsSaving(false);
  };

  const handleNavigate = (index: number) => {
    setCurrentPassageIndex(index);
    setStatementStartTime(Date.now());
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentPassageIndex > 0) handleNavigate(currentPassageIndex - 1);
  };
  const handleNext = () => {
    if (currentPassageIndex < questions.length - 1) handleNavigate(currentPassageIndex + 1);
  };

  if (!currentPassage || !sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  const isLastPassage = currentPassageIndex === questions.length - 1;

  return (
    <div className="min-h-screen">
      <VerbalTestHeader
        currentPassage={currentPassageIndex}
        totalPassages={questions.length}
        answeredCount={answeredCount}
        totalStatements={totalStatements}
        timeRemaining={timeRemaining}
      />

      <div className="container mx-auto py-5 sm:py-6 px-3 sm:px-4 max-w-3xl">
        <div className="space-y-5 sm:space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPassageIndex}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-5 sm:space-y-6"
            >
              <PassageDisplay
                title={currentPassage.title}
                topic={currentPassage.topic}
                text={currentPassage.text}
                difficulty={currentPassage.difficulty}
                passageNumber={currentPassageIndex + 1}
              />

              <StatementList
                statements={currentPassage.statements}
                answers={currentAnswers}
                onAnswer={handleSelectAnswer}
                disabled={isSaving}
              />
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-2 sm:gap-3 pt-2">
            <button
              onClick={handlePrev}
              disabled={currentPassageIndex === 0}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:text-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px] touch-manipulation"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
              Föregående
            </button>

            <button
              onClick={() => setShowFinishConfirm(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm border-2 border-orange-300 bg-white text-orange-700 hover:bg-orange-50 transition-colors min-h-[48px] touch-manipulation"
            >
              <Flag className="w-4 h-4" strokeWidth={2.5} />
              Avsluta
            </button>

            <button
              onClick={handleNext}
              disabled={isLastPassage}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 min-h-[48px] touch-manipulation"
              style={{
                background: 'linear-gradient(135deg, #F97316, #DC2626)',
                boxShadow: '0 8px 20px -6px rgba(220, 38, 38, 0.4)',
              }}
            >
              Nästa
              <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>

          <PassageNavigation
            totalPassages={questions.length}
            currentPassage={currentPassageIndex}
            answeredPerPassage={answeredPerPassage}
            statementsPerPassage={4}
            onNavigate={handleNavigate}
          />
        </div>
      </div>

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
                style={{
                  background: 'linear-gradient(90deg, #FB923C, #DC2626, #BE185D)',
                }}
              />
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center text-white"
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B, #F97316)',
                      boxShadow: '0 6px 14px -4px rgba(249, 115, 22, 0.4)',
                    }}
                  >
                    <AlertCircle className="w-5 h-5" strokeWidth={2.25} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                      Avsluta testet?
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Du har besvarat <span className="font-bold text-slate-900">{answeredCount}</span> av{' '}
                      <span className="font-bold text-slate-900">{totalStatements}</span> påståenden.
                      {answeredCount < totalStatements && (
                        <span className="block mt-1 text-amber-700">
                          {totalStatements - answeredCount} kvar att besvara.
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 sm:gap-3 mt-5">
                  <button
                    onClick={() => setShowFinishConfirm(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:border-orange-300 hover:text-orange-700 transition-colors min-h-[48px]"
                  >
                    Tillbaka
                  </button>
                  <button
                    onClick={handleFinishTest}
                    className="flex-1 px-4 py-3 rounded-xl text-white font-bold text-sm transition-all hover:-translate-y-0.5 min-h-[48px]"
                    style={{
                      background: 'linear-gradient(135deg, #F97316, #DC2626)',
                      boxShadow: '0 8px 20px -6px rgba(220, 38, 38, 0.45)',
                    }}
                  >
                    Avsluta och se resultat
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
