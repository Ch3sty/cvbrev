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
import questionBank from '@/lib/logicTestV4/questionBank.json';
import type { Question } from '@/lib/logicTestV4/types.v4';

const questions = questionBank as Question[];

interface PageProps {
  params: { sessionId: string };
}

export default function TestSessionPage({ params }: PageProps) {
  const router = useRouter();
  const { sessionId } = params;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [sessionStartedAt] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const question = questions[currentQuestion];
  const answeredQuestions = new Set(
    answers.map((ans, i) => (ans !== null ? i : null)).filter((i): i is number => i !== null)
  );

  // Save answer to backend
  const saveAnswer = useCallback(async (questionIndex: number, selectedIndex: number) => {
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
    try {
      const response = await fetch('/api/logicTestV4/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      const data = await response.json();

      if (data.success || data.message) {
        router.push(`/dashboard/tester/matrislogik-grund/test/${sessionId}/results`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 pb-32">
      {/* Header */}
      <TestHeader
        currentQuestion={currentQuestion}
        totalQuestions={questions.length}
        answeredCount={answeredQuestions.size}
        startedAt={sessionStartedAt}
      />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Question Title & Rule */}
            <div className="mb-8 text-center">
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl md:text-3xl font-bold text-slate-900 mb-3"
              >
                {question.title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-slate-600 max-w-2xl mx-auto leading-relaxed"
              >
                {question.rule}
              </motion.p>

              {/* Difficulty badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-slate-100 rounded-full"
              >
                <span className="text-xs font-semibold text-slate-600">
                  Svårighetsgrad: {question.difficulty}/3
                </span>
              </motion.div>
            </div>

            {/* Question Grid */}
            <QuestionGrid grid={question.grid} showGrid={question.showGrid} />

            {/* Answer Options */}
            <div className="mt-12">
              <AnswerOptions
                options={question.options}
                selectedIndex={answers[currentQuestion]}
                onSelect={handleSelectAnswer}
                showGrid={question.showGrid}
                disabled={isSaving}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between mt-12 max-w-lg mx-auto gap-4"
        >
          <Button
            onClick={handlePrev}
            disabled={currentQuestion === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Föregående
          </Button>

          <Button
            onClick={() => setShowFinishConfirm(true)}
            variant="outline"
            className="flex items-center gap-2 border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            <Flag className="w-4 h-4" />
            Avsluta Test
          </Button>

          <Button
            onClick={handleNext}
            disabled={currentQuestion === questions.length - 1}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            Nästa
            <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>

      {/* Question Navigation */}
      <QuestionNavigation
        totalQuestions={questions.length}
        currentQuestion={currentQuestion}
        answeredQuestions={answeredQuestions}
        onNavigate={handleNavigate}
      />

      {/* Finish Confirmation Modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Avsluta testet?
                </h3>
                <p className="text-slate-600 mt-1">
                  Du har besvarat {answeredQuestions.size} av {questions.length} frågor.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowFinishConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Fortsätt
              </Button>
              <Button
                onClick={handleFinishTest}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500"
              >
                Avsluta
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
