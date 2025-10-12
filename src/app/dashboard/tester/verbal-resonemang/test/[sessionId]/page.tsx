'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flag, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PassageDisplay } from '@/components/tests/verbalV1/PassageDisplay';
import { StatementList } from '@/components/tests/verbalV1/StatementList';
import { ProgressTracker } from '@/components/tests/verbalV1/ProgressTracker';
import questionBank from '@/lib/verbalTestV1/questionBank.json';
import type { Question, UserAnswer } from '@/lib/verbalTestV1/types.v1';

const questions = questionBank as Question[];
const TOTAL_TIME = 25 * 60; // 25 minutes in seconds

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

  // Unwrap params Promise
  useEffect(() => {
    params.then(p => setSessionId(p.sessionId));
  }, [params]);

  // Initialize answers for all passages
  useEffect(() => {
    const initialAnswers: Record<string, UserAnswer[]> = {};
    questions.forEach(q => {
      initialAnswers[q.id] = Array(q.statements.length).fill(null);
    });
    setAnswers(initialAnswers);
  }, []);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentPassage = questions[currentPassageIndex];
  const currentAnswers = answers[currentPassage?.id] || [];

  // Count total answered statements
  const totalStatements = questions.reduce((sum, q) => sum + q.statements.length, 0);
  const answeredCount = Object.values(answers).reduce(
    (sum, passageAnswers) => sum + passageAnswers.filter(a => a !== null).length,
    0
  );

  // Save answer to backend
  const saveAnswer = useCallback(async (
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
          timeSpent
        })
      });
    } catch (error) {
      console.error('Failed to save answer:', error);
    }
  }, [sessionId, statementStartTime]);

  // Handle answer selection
  const handleSelectAnswer = async (statementIndex: number, answer: 'true' | 'false' | 'cannot_say') => {
    setIsSaving(true);

    const newAnswers = { ...answers };
    newAnswers[currentPassage.id] = [...currentAnswers];
    newAnswers[currentPassage.id][statementIndex] = answer;
    setAnswers(newAnswers);

    await saveAnswer(currentPassage.id, statementIndex, answer);
    setStatementStartTime(Date.now());

    setIsSaving(false);
  };

  // Navigate between passages
  const handlePrevPassage = () => {
    if (currentPassageIndex > 0) {
      setCurrentPassageIndex(currentPassageIndex - 1);
      setStatementStartTime(Date.now());
    }
  };

  const handleNextPassage = () => {
    if (currentPassageIndex < questions.length - 1) {
      setCurrentPassageIndex(currentPassageIndex + 1);
      setStatementStartTime(Date.now());
    }
  };

  // Finish test
  const handleFinishTest = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch('/api/verbalTestV1/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      if (response.ok) {
        router.push(`/dashboard/tester/verbal-resonemang/test/${sessionId}/results`);
      }
    } catch (error) {
      console.error('Failed to finish test:', error);
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentPassage) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl border-2 border-green-200 p-4 mb-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <ProgressTracker
              totalQuestions={totalStatements}
              answeredQuestions={answeredCount}
            />
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl text-white">
            <Clock className="w-5 h-5" />
            <span className="font-bold text-lg">{formatTime(timeRemaining)}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Passage */}
          <div className="h-[600px]">
            <PassageDisplay
              title={currentPassage.title}
              text={currentPassage.text}
              passageNumber={currentPassageIndex + 1}
              totalPassages={questions.length}
              difficulty={currentPassage.difficulty}
              topic={currentPassage.topic}
            />
          </div>

          {/* Right: Statements */}
          <div className="lg:h-[600px] lg:overflow-y-auto lg:pr-2">
            <StatementList
              statements={currentPassage.statements}
              userAnswers={currentAnswers}
              onSelectAnswer={handleSelectAnswer}
              isSaving={isSaving}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 bg-white rounded-2xl border-2 border-green-200 p-4 flex items-center justify-between shadow-lg">
          <Button
            onClick={handlePrevPassage}
            disabled={currentPassageIndex === 0}
            variant="outline"
            className="border-2 border-green-300"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Föregående
          </Button>

          <div className="text-center">
            <p className="text-sm text-slate-600">
              Passage {currentPassageIndex + 1} av {questions.length}
            </p>
          </div>

          {currentPassageIndex === questions.length - 1 ? (
            <Button
              onClick={() => setShowFinishConfirm(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <Flag className="w-5 h-5 mr-2" />
              Avsluta test
            </Button>
          ) : (
            <Button
              onClick={handleNextPassage}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              Nästa
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Finish Confirmation Modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Avsluta testet?
            </h2>
            <p className="text-slate-600 mb-2">
              Du har besvarat <strong>{answeredCount} av {totalStatements}</strong> påståenden.
            </p>
            {answeredCount < totalStatements && (
              <p className="text-orange-600 text-sm mb-6">
                Du har {totalStatements - answeredCount} obesvarade påståenden.
              </p>
            )}
            <div className="flex gap-4">
              <Button
                onClick={() => setShowFinishConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Fortsätt testet
              </Button>
              <Button
                onClick={handleFinishTest}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
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
