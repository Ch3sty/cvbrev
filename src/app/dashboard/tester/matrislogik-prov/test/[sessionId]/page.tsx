'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flag, AlertCircle, Lock } from 'lucide-react';
import { QuestionGridV7 } from '@/components/tests/logicV7/QuestionGridV7';
import { AnswerOptionsV7 } from '@/components/tests/logicV7/AnswerOptionsV7';
import { QuestionNavigation } from '@/components/tests/logicV4/QuestionNavigation';
import { TestHeader } from '@/components/tests/logicV4/TestHeader';
import {
  selectProvQuestionsForSession,
  PROV_TOTAL_QUESTIONS,
} from '@/lib/logicTestV7/selectProv.v7';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function ProvSessionPage({ params }: PageProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(PROV_TOTAL_QUESTIONS).fill(null)
  );
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [sessionStartedAt] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  useEffect(() => {
    params.then((p) => setSessionId(p.sessionId));
  }, [params]);

  // Prov-urval: blandade frågor från alla nivåer, seedat på sessionId.
  const questions = useMemo(
    () => (sessionId ? selectProvQuestionsForSession(sessionId) : []),
    [sessionId]
  );

  const question = questions[currentQuestion];
  const answeredQuestions = new Set(
    answers.map((ans, i) => (ans !== null ? i : null)).filter((i): i is number => i !== null)
  );

  const handleFinishTest = useCallback(async () => {
    if (!sessionId) return;
    try {
      const response = await fetch('/api/logicTestProv/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await response.json();
      if (data.success || data.message) {
        router.push(`/dashboard/tester/matrislogik-prov/test/${sessionId}/results`);
      }
    } catch (error) {
      console.error('Failed to finish prov:', error);
    }
  }, [sessionId, router]);

  const saveAnswer = useCallback(
    async (questionIndex: number, selectedIndex: number) => {
      if (!sessionId) return;
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      try {
        await fetch('/api/logicTestProv/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            questionId: questions[questionIndex].id,
            selectedIndex,
            timeSpent,
          }),
        });
      } catch (error) {
        console.error('Failed to save answer:', error);
      }
    },
    [sessionId, questionStartTime, questions]
  );

  const handleSelectAnswer = useCallback(
    (index: number) => {
      if (isNavigating) return;
      setIsSaving(true);
      setIsNavigating(true);

      const newAnswers = [...answers];
      newAnswers[currentQuestion] = index;
      setAnswers(newAnswers);

      saveAnswer(currentQuestion, index).finally(() => setIsSaving(false));

      setTimeout(() => {
        const nextUnanswered = newAnswers.findIndex(
          (ans, i) => i > currentQuestion && ans === null
        );
        if (nextUnanswered !== -1) {
          setCurrentQuestion(nextUnanswered);
          setQuestionStartTime(Date.now());
        } else if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setQuestionStartTime(Date.now());
        }
        setIsNavigating(false);
      }, 150);
    },
    [answers, currentQuestion, saveAnswer, isNavigating, questions.length]
  );

  const handleNavigate = (index: number) => {
    setCurrentQuestion(index);
    setQuestionStartTime(Date.now());
  };
  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setQuestionStartTime(Date.now());
    }
  };
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setQuestionStartTime(Date.now());
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      const letterKeys = ['a', 'b', 'c', 'd', 'e', 'f'];
      const index = letterKeys.indexOf(e.key.toLowerCase());
      if (question && index >= 0 && index < question.options.length) {
        handleSelectAnswer(index);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, question, handleSelectAnswer]);

  if (!sessionId) {
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

  return (
    <div className="min-h-screen">
      <TestHeader
        currentQuestion={currentQuestion}
        totalQuestions={questions.length}
        answeredCount={answeredQuestions.size}
        startedAt={sessionStartedAt}
      />

      <div className="container mx-auto py-5 sm:py-6 px-3 sm:px-4 max-w-3xl">
        <div className="space-y-5 sm:space-y-6">
          {/* Prov-banner */}
          <div
            className="rounded-2xl px-4 py-2.5 text-center text-white text-xs sm:text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #F97316, #DC2626, #BE185D)' }}
          >
            Prov · frågor från alla nivåer · ingen hjälp tillgänglig
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              {/* Skarpt prov-läge: bara "Fråga N" + svårighet, ingen titel/regel. */}
              <div className="text-center">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
                  Fråga {currentQuestion + 1}
                </div>
                <div className="inline-flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                    Svårighet
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background:
                            level <= question.difficulty
                              ? 'linear-gradient(135deg, #F97316, #DC2626)'
                              : '#E2E8F0',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Inaktiv förklarings-toggle: visar att hjälp finns men inte i prov. */}
              <DisabledHintToggle />

              <QuestionGridV7 grid={question.grid} />

              <div>
                <p className="text-center text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-[0.18em] mb-3">
                  Välj rätt svar
                </p>
                <AnswerOptionsV7
                  options={question.options}
                  selectedIndex={answers[currentQuestion]}
                  onSelect={handleSelectAnswer}
                  disabled={isSaving || isNavigating}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-2 sm:gap-3 pt-2">
            <button
              onClick={handlePrev}
              disabled={currentQuestion === 0 || isNavigating}
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
              Avsluta prov
            </button>

            <button
              onClick={handleNext}
              disabled={currentQuestion === questions.length - 1 || isNavigating}
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

          <QuestionNavigation
            totalQuestions={questions.length}
            currentQuestion={currentQuestion}
            answeredQuestions={answeredQuestions}
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
                style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626, #BE185D)' }}
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
                      Avsluta provet?
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Du har besvarat{' '}
                      <span className="font-bold text-slate-900">{answeredQuestions.size}</span> av{' '}
                      <span className="font-bold text-slate-900">{questions.length}</span> frågor. Du
                      kan inte gå tillbaka efter avslut.
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

/** Förklarings-toggle, inaktiverad i prov-läge. Visar att hjälpen finns men inte under prov. */
function DisabledHintToggle() {
  return (
    <div className="flex justify-center">
      <span
        title="Ej tillgänglig under prov"
        aria-disabled="true"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed select-none"
      >
        <Lock className="w-3 h-3" strokeWidth={2.5} />
        Förklarande text – ej tillgänglig under prov
      </span>
    </div>
  );
}
