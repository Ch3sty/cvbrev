'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MatrixQuestion } from '../../components/MatrixQuestion';
import { TestTimer } from '../../components/TestTimer';
import { TestProgress } from '../../components/TestProgress';
import { useAnswerShortcuts } from '@/lib/logicV2/useAnswerShortcuts';
import type { ClientQuestion, UserAnswer } from '@/lib/logicV2/types';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';

export default function MatrislogikAvanceradTestPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<any>(null);
  const [questions, setQuestions] = useState<ClientQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, number>>(new Map());
  const [questionStartTimes, setQuestionStartTimes] = useState<Map<string, number>>(
    new Map()
  );
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load session and questions
  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch('/api/logicV2/validate-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken: sessionId }),
        });

        if (!response.ok) {
          router.push('/dashboard/tester/matrislogik-avancerad?error=session-error');
          return;
        }

        const sessionData = await response.json();
        setSession(sessionData);
        setQuestions(sessionData.questions || []);

        // Initialize start time for first question
        if (sessionData.questions?.length > 0) {
          const now = Date.now();
          setQuestionStartTimes(
            new Map([[sessionData.questions[0].id, now]])
          );
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading session:', error);
        router.push('/dashboard/tester/matrislogik-avancerad?error=session-error');
      }
    }

    loadSession();
  }, [sessionId, router]);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers.get(currentQuestion.id) ?? null : null;

  // Keyboard shortcuts
  useAnswerShortcuts(6, currentAnswer, (index) => {
    if (currentQuestion) {
      handleSelectAnswer(index);
    }
  });

  const handleSelectAnswer = (answerIndex: number) => {
    if (!currentQuestion) return;

    setAnswers((prev) => {
      const newAnswers = new Map(prev);
      newAnswers.set(currentQuestion.id, answerIndex);
      return newAnswers;
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      // Record time spent on current question
      const now = Date.now();
      const startTime = questionStartTimes.get(currentQuestion.id) || now;

      // Move to next question
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      // Start timer for next question if not already started
      const nextQuestion = questions[nextIndex];
      if (nextQuestion && !questionStartTimes.has(nextQuestion.id)) {
        setQuestionStartTimes((prev) => new Map(prev).set(nextQuestion.id, now));
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const confirmed = confirm(
      `Du har svarat på ${answers.size} av ${questions.length} frågor.\n\nVill du lämna in testet?`
    );

    if (!confirmed) return;

    setSubmitting(true);

    try {
      // Calculate time spent per question
      const now = Date.now();
      const userAnswers: UserAnswer[] = questions.map((q) => {
        const startTime = questionStartTimes.get(q.id) || now;
        const timeSpent = Math.floor((now - startTime) / 1000);

        return {
          questionId: q.id,
          userAnswer: answers.get(q.id) ?? -1,
          timeSpent,
        };
      });

      const response = await fetch('/api/logicV2/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken: sessionId,
          answers: userAnswers,
          timeSpentSeconds: totalTimeSpent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit test');
      }

      const result = await response.json();
      router.push(`/dashboard/tester/matrislogik-avancerad/results/${result.attemptId}`);
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Kunde inte lämna in testet. Försök igen.');
      setSubmitting(false);
    }
  };

  if (loading || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Laddar test...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <TestProgress
          currentQuestion={currentIndex + 1}
          totalQuestions={questions.length}
        />
        <TestTimer startedAt={session.startedAt} onTimeUpdate={setTotalTimeSpent} />
      </div>

      {/* Question Title */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {currentQuestion.title}
        </h2>
        <p className="text-gray-600 mt-2">{currentQuestion.rule}</p>
      </div>

      {/* Question */}
      <MatrixQuestion
        grid={currentQuestion.grid}
        options={currentQuestion.options}
        selected={currentAnswer}
        onSelect={handleSelectAnswer}
        disabled={submitting}
        showGrid={currentQuestion.showGrid}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0 || submitting}
          className={`
            px-6 py-3 rounded-lg font-semibold
            flex items-center gap-2
            ${
              currentIndex === 0 || submitting
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-purple-400 hover:bg-purple-50'
            }
          `}
        >
          <ChevronLeft className="w-5 h-5" />
          Föregående
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={submitting}
            className={`
              px-6 py-3 rounded-lg font-semibold
              flex items-center gap-2
              ${
                submitting
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }
            `}
          >
            Nästa
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`
              px-8 py-3 rounded-lg font-semibold
              flex items-center gap-2
              ${
                submitting
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
              }
            `}
          >
            <Send className="w-5 h-5" />
            {submitting ? 'Lämnar in...' : 'Lämna in'}
          </button>
        )}
      </div>

      {/* Keyboard hints */}
      <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <p className="text-sm text-purple-900 text-center">
          <strong>Tangentbordsgenvägar:</strong> A-F eller 1-6 för att välja svar,
          piltangenter för att navigera mellan alternativ
        </p>
      </div>
    </div>
  );
}
