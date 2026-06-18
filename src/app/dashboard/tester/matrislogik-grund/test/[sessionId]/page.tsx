'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flag, AlertCircle } from 'lucide-react';
import { QuestionGridV7 } from '@/components/tests/logicV7/QuestionGridV7';
import { AnswerOptionsV7 } from '@/components/tests/logicV7/AnswerOptionsV7';
import { QuestionNavigation } from '@/components/tests/logicV4/QuestionNavigation';
import { TestHeader } from '@/components/tests/logicV4/TestHeader';
import { useTestHintMode } from '@/hooks/use-test-hint-mode';
import { selectQuestionsForSession, QUESTIONS_PER_SESSION } from '@/lib/logicTestV7/selectQuestions.v7';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function TestSessionPage({ params }: PageProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(QUESTIONS_PER_SESSION).fill(null)
  );
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [sessionStartedAt] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const { showHint, toggle: toggleHint } = useTestHintMode();

  useEffect(() => {
    params.then((p) => setSessionId(p.sessionId));
  }, [params]);

  // Deterministiskt urval av 15 frågor ur poolen, seedat på sessionId.
  // Samma sessionId → samma frågor (stabilt under sessionen och = resultat-sidan).
  const questions = useMemo(
    () => (sessionId ? selectQuestionsForSession(sessionId) : []),
    [sessionId]
  );

  const question = questions[currentQuestion];
  const answeredQuestions = new Set(
    answers.map((ans, i) => (ans !== null ? i : null)).filter((i): i is number => i !== null)
  );

  const saveAnswer = useCallback(
    async (questionIndex: number, selectedIndex: number) => {
      if (!sessionId) return;
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      try {
        await fetch('/api/logicTestV4/answer', {
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
    [sessionId, questionStartTime]
  );

  const handleSelectAnswer = useCallback(
    async (index: number) => {
      setIsSaving(true);

      const newAnswers = [...answers];
      newAnswers[currentQuestion] = index;
      setAnswers(newAnswers);

      await saveAnswer(currentQuestion, index);
      setIsSaving(false);

      // Auto-advance till nästa obesvarade
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
      }, 300);
    },
    [answers, currentQuestion, saveAnswer]
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

  const handleFinishTest = async () => {
    if (!sessionId) return;
    try {
      const response = await fetch('/api/logicTestV4/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await response.json();
      if (data.success || data.message) {
        router.push(`/dashboard/tester/matrislogik-grund/test/${sessionId}/results`);
      }
    } catch (error) {
      console.error('Failed to finish test:', error);
    }
  };

  // Tangentbordsgenvägar
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
      {/* Sticky Header */}
      <TestHeader
        currentQuestion={currentQuestion}
        totalQuestions={questions.length}
        answeredCount={answeredQuestions.size}
        startedAt={sessionStartedAt}
      />

      {/* Main Content */}
      <div className="container mx-auto py-5 sm:py-6 px-3 sm:px-4 max-w-3xl">
        <div className="space-y-5 sm:space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              {/* Frågetitel + regel (visas bara i ledtråds-läge) */}
              <QuestionHeader
                index={currentQuestion}
                title={question.title}
                rule={question.rule}
                difficulty={question.difficulty}
                showHint={showHint}
              />

              {/* Ledtråd på/av */}
              <HintToggle showHint={showHint} onToggle={toggleHint} />

              {/* 3×3 Matris */}
              <QuestionGridV7 grid={question.grid} />

              {/* Svarsalternativ */}
              <div>
                <p className="text-center text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-[0.18em] mb-3">
                  Välj rätt svar
                </p>
                <AnswerOptionsV7
                  options={question.options}
                  selectedIndex={answers[currentQuestion]}
                  onSelect={handleSelectAnswer}
                  disabled={isSaving}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 pt-2">
            <button
              onClick={handlePrev}
              disabled={currentQuestion === 0}
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
              Avsluta test
            </button>

            <button
              onClick={handleNext}
              disabled={currentQuestion === questions.length - 1}
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

          {/* Question Navigation (alltid synlig) */}
          <QuestionNavigation
            totalQuestions={questions.length}
            currentQuestion={currentQuestion}
            answeredQuestions={answeredQuestions}
            onNavigate={handleNavigate}
          />
        </div>
      </div>

      {/* Finish Confirmation Modal */}
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
                      Du har besvarat <span className="font-bold text-slate-900">{answeredQuestions.size}</span> av{' '}
                      <span className="font-bold text-slate-900">{questions.length}</span> frågor. Du kan inte gå tillbaka efter avslut.
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

/* --------- Question header (frågetitel + regel + svårighet) --------- */

function QuestionHeader({
  index,
  title,
  rule,
  difficulty,
  showHint,
}: {
  index: number;
  title: string;
  rule: string;
  difficulty: number;
  showHint: boolean;
}) {
  // Strippa "FRÅGA X — " från title om det finns
  const cleanTitle = title.replace(/^FRÅGA\s+\d+\s*[—-]\s*/i, '');

  return (
    <div className="text-center">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
        Fråga {index + 1}
      </div>

      {/* Titel + svårighet + regel visas bara i ledtråds-läge. I skarpt läge ser
          testtagaren bara "Fråga N" + rutnätet, som ett riktigt rekryteringstest. */}
      {showHint ? (
        <>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-tight mb-3">
            {cleanTitle}
          </h2>

          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
              Svårighet
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((level) => (
                <div
                  key={level}
                  className="w-2 h-2 rounded-full"
                  style={{
                    background:
                      level <= difficulty
                        ? 'linear-gradient(135deg, #F97316, #DC2626)'
                        : '#E2E8F0',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="bg-orange-50/60 border border-orange-100 rounded-2xl p-4 sm:p-5 max-w-xl mx-auto">
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed text-left">
              {rule}
            </p>
          </div>
        </>
      ) : (
        <div className="inline-flex items-center gap-2 mb-1">
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
                    level <= difficulty
                      ? 'linear-gradient(135deg, #F97316, #DC2626)'
                      : '#E2E8F0',
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HintToggle({ showHint, onToggle }: { showHint: boolean; onToggle: () => void }) {
  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={showHint}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-700 transition-colors touch-manipulation"
      >
        <span
          className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
            showHint ? 'bg-orange-500' : 'bg-slate-300'
          }`}
        >
          <span
            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
              showHint ? 'translate-x-3.5' : 'translate-x-0.5'
            }`}
          />
        </span>
        {showHint ? 'Ledtråd på' : 'Ledtråd av'}
      </button>
    </div>
  );
}
