'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Flag } from 'lucide-react';

import { selectPassagesForSession } from '@/lib/numericalTestV2/selectPassages';
import type { Passage as V1Passage } from '@/lib/numericalTest/types';

import TestProgress from '@/components/tests/numerical-shared/TestProgress';
import PassageDisplay from '@/components/tests/numerical-shared/PassageDisplay';
import QuestionDisplay from '@/components/tests/numerical-shared/QuestionDisplay';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function NumericalTestV2Page({ params }: PageProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  // V2-passager har samma fält-struktur som V1 så casten är säker.
  const [passages, setPassages] = useState<V1Passage[]>([]);
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [testStartTime] = useState(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    params.then((p) => {
      setSessionId(p.sessionId);
      setPassages(selectPassagesForSession(p.sessionId) as unknown as V1Passage[]);
    });
  }, [params]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - testStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [testStartTime]);

  const currentPassage = passages[currentPassageIndex];
  const currentQuestion = currentPassage?.questions[currentQuestionIndex];
  const totalQuestions = passages.reduce((sum, p) => sum + p.questions.length, 0);
  const currentQuestionNumber =
    passages.slice(0, currentPassageIndex).reduce((sum, p) => sum + p.questions.length, 0) +
    currentQuestionIndex +
    1;

  const isLastQuestion =
    currentPassageIndex === passages.length - 1 &&
    currentQuestionIndex === currentPassage?.questions.length - 1;

  const handleNextQuestion = async () => {
    if (!selectedAnswer || !sessionId || !currentPassage || !currentQuestion) return;

    setIsSubmitting(true);
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    try {
      await fetch('/api/numericalTestV2/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          passageId: currentPassage.id,
          questionId: currentQuestion.id,
          selectedAnswerId: selectedAnswer,
          timeSpent,
        }),
      });

      if (currentQuestionIndex < currentPassage.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else if (currentPassageIndex < passages.length - 1) {
        setCurrentPassageIndex(currentPassageIndex + 1);
        setCurrentQuestionIndex(0);
      } else {
        await handleCompleteTest();
        return;
      }

      setSelectedAnswer(null);
      setQuestionStartTime(Date.now());
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteTest = async () => {
    if (!sessionId) return;

    try {
      await fetch('/api/numericalTestV2/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      router.push(`/dashboard/tester/numeriskt-test-v2/test/${sessionId}/results`);
    } catch (error) {
      console.error('Error completing test:', error);
    }
  };

  if (!currentPassage || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600 mx-auto mb-4" />
          <p className="text-slate-600">Laddar test...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-3xl">
      <div className="space-y-4 sm:space-y-5">
        <TestProgress
          currentQuestion={currentQuestionNumber}
          totalQuestions={totalQuestions}
          elapsedSeconds={elapsedSeconds}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={`passage-${currentPassage.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-5"
          >
            <PassageDisplay passage={currentPassage} />

            <QuestionDisplay
              key={currentQuestion.id}
              question={currentQuestion}
              questionNumber={currentQuestionNumber}
              totalQuestions={totalQuestions}
              selectedId={selectedAnswer ?? undefined}
              onSelect={setSelectedAnswer}
              disabled={isSubmitting}
            />
          </motion.div>
        </AnimatePresence>

        <button
          onClick={handleNextQuestion}
          disabled={!selectedAnswer || isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl
                     font-bold text-base sm:text-lg text-white min-h-[60px]
                     transition-all hover:-translate-y-0.5 active:translate-y-0
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0
                     touch-manipulation"
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
            boxShadow: '0 12px 36px -8px rgba(220, 38, 38, 0.5)',
          }}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Sparar svar…
            </>
          ) : isLastQuestion ? (
            <>
              Slutför test
              <Flag className="w-5 h-5" strokeWidth={2.5} />
            </>
          ) : (
            <>
              Nästa fråga
              <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
