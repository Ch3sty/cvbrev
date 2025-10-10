'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flag, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuestionGrid } from '@/components/tests/logicV4/QuestionGrid';
import { AnswerOptions } from '@/components/tests/logicV4/AnswerOptions';
import { QuestionNavigation } from '@/components/tests/logicV4/QuestionNavigation';
import { TestHeader } from '@/components/tests/logicV4/TestHeader';
import rotationQuestionBank from '@/lib/logicTestV4/rotationQuestionBank.json';
import type { Question } from '@/lib/logicTestV4/types.v4';

const questions = rotationQuestionBank as Question[];

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function RotationTestSessionPage({ params }: PageProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [sessionStartedAt] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  // Unwrap params Promise
  useEffect(() => {
    params.then(p => setSessionId(p.sessionId));
  }, [params]);

  const question = questions[currentQuestion];
  const answeredQuestions = new Set(
    answers.map((ans, i) => (ans !== null ? i : null)).filter((i): i is number => i !== null)
  );

  // Save answer to backend
  const saveAnswer = useCallback(async (questionIndex: number, selectedIndex: number) => {
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
          timeSpent
        })
      });
    } catch (error) {
      console.error('Failed to save answer:', error);
    }
  }, [sessionId, questionStartTime]);

  // Handle answer selection
  const handleSelectAnswer = async (index: number) => {
    setIsSaving(true);

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = index;
    setAnswers(newAnswers);

    await saveAnswer(currentQuestion, index);

    setIsSaving(false);

    // Auto-advance to next unanswered question
    setTimeout(() => {
      const nextUnanswered = newAnswers.findIndex((ans, i) => i > currentQuestion && ans === null);
      if (nextUnanswered !== -1) {
        setCurrentQuestion(nextUnanswered);
        setQuestionStartTime(Date.now());
      } else if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setQuestionStartTime(Date.now());
      }
    }, 300);
  };

  // Navigate to specific question
  const handleNavigate = (index: number) => {
    setCurrentQuestion(index);
    setQuestionStartTime(Date.now());
  };

  // Navigate prev/next
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

  // Finish test
  const handleFinishTest = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch('/api/logicTestV4/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      const data = await response.json();

      if (data.success || data.message) {
        router.push(`/dashboard/tester/rotation-monster/test/${sessionId}/results`);
      }
    } catch (error) {
      console.error('Failed to finish test:', error);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Arrow keys for navigation
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();

      // A-F for answer selection
      const letterKeys = ['a', 'b', 'c', 'd', 'e', 'f'];
      const index = letterKeys.indexOf(e.key.toLowerCase());
      if (index >= 0 && index < question.options.length) {
        handleSelectAnswer(index);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestion, question]);

  if (!sessionId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">Laddar test...</div>
      </div>
    );
  }

  const unansweredCount = questions.length - answeredQuestions.size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <TestHeader
          currentQuestion={currentQuestion + 1}
          totalQuestions={questions.length}
          answeredCount={answeredQuestions.size}
          startedAt={sessionStartedAt}
        />

        {/* Question Card */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl shadow-2xl border-2 border-slate-200 p-6 sm:p-8 mb-6"
        >
          {/* Question Title & Rule */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {question.title}
              </h2>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
                Nivå {question.difficulty}
              </span>
            </div>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
              <strong>Regel:</strong> {question.rule}
            </p>
          </div>

          {/* Question Grid */}
          <QuestionGrid grid={question.grid} showGrid={question.showGrid} />

          {/* Answer Options */}
          <AnswerOptions
            options={question.options}
            selectedIndex={answers[currentQuestion]}
            onSelect={handleSelectAnswer}
            showGrid={question.showGrid}
            disabled={isSaving}
          />

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
            <Button
              onClick={handlePrev}
              disabled={currentQuestion === 0}
              variant="outline"
              size="lg"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Föregående
            </Button>

            {currentQuestion === questions.length - 1 ? (
              <Button
                onClick={() => setShowFinishConfirm(true)}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <Flag className="w-4 h-4 mr-2" />
                Slutför test
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                size="lg"
              >
                Nästa
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </motion.div>

        {/* Question Navigation */}
        <QuestionNavigation
          totalQuestions={questions.length}
          currentQuestion={currentQuestion}
          answeredQuestions={answeredQuestions}
          onNavigate={handleNavigate}
        />

        {/* Finish Confirmation Modal */}
        <AnimatePresence>
          {showFinishConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowFinishConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  {unansweredCount > 0 ? (
                    <AlertCircle className="w-8 h-8 text-amber-500" />
                  ) : (
                    <Flag className="w-8 h-8 text-green-600" />
                  )}
                  <h3 className="text-2xl font-bold text-slate-900">
                    Slutför testet?
                  </h3>
                </div>

                {unansweredCount > 0 ? (
                  <p className="text-slate-600 mb-6">
                    Du har {unansweredCount} obesvarade fråg{unansweredCount === 1 ? 'a' : 'or'}.
                    Är du säker på att du vill slutföra testet?
                  </p>
                ) : (
                  <p className="text-slate-600 mb-6">
                    Du har besvarat alla frågor! Klicka på "Slutför" för att se ditt resultat.
                  </p>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowFinishConfirm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Avbryt
                  </Button>
                  <Button
                    onClick={handleFinishTest}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    Slutför
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
