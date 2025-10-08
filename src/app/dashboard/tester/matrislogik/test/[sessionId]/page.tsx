'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MatrixGrid } from '../../components/MatrixGrid';
import { AnswerOptions } from '../../components/AnswerOptions';
import { TestTimer } from '../../components/TestTimer';
import { TestNavigation } from '../../components/TestNavigation';
import { ClientQuestion } from '@/lib/tester/patternTypes';

export default function TestSessionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [questions, setQuestions] = useState<ClientQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime] = useState(Date.now());

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredQuestions = new Set(answers.keys());

  // Load questions on mount
  useEffect(() => {
    async function loadQuestions() {
      try {
        const response = await fetch('/api/tester/validate-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken: sessionId })
        });

        if (!response.ok) {
          throw new Error('Ogiltig session');
        }

        const { questions: loadedQuestions } = await response.json();
        setQuestions(loadedQuestions);
      } catch (err) {
        setError('Kunde inte ladda testet. Vänligen starta om.');
      }
    }

    loadQuestions();
  }, [sessionId]);

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers(prev => new Map(prev).set(currentQuestionIndex, optionIndex));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (answers.size < totalQuestions) {
      const confirmSubmit = confirm(
        `Du har besvarat ${answers.size} av ${totalQuestions} frågor. Vill du verkligen lämna in testet?`
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);

    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      // Convert answers Map to array format
      const answersArray = questions.map((q, idx) => ({
        questionId: q.id,
        userAnswer: answers.get(idx) ?? -1, // -1 = no answer
        timeSpent: 0 // Per-question timing not implemented in MVP
      }));

      const response = await fetch('/api/tester/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken: sessionId,
          answers: answersArray,
          timeSpent
        })
      });

      if (!response.ok) {
        throw new Error('Kunde inte skicka in testet');
      }

      const { attemptId } = await response.json();
      router.push(`/dashboard/tester/matrislogik/results/${attemptId}`);
    } catch (err) {
      setError('Ett fel uppstod vid inlämning. Försök igen.');
      setIsSubmitting(false);
    }
  };

  const handleTimeUp = () => {
    alert('Tiden är ute! Testet kommer att skickas in automatiskt.');
    handleSubmit();
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Ett fel uppstod</h2>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => router.push('/dashboard/tester/matrislogik')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Tillbaka till start
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">Laddar testet...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Main test area */}
        <div className="space-y-6">
          {/* Timer */}
          <TestTimer totalSeconds={20 * 60} onTimeUp={handleTimeUp} />

          {/* Question counter */}
          <div className="text-center">
            <span className="text-2xl font-bold text-gray-900">
              Fråga {currentQuestionIndex + 1} av {totalQuestions}
            </span>
          </div>

          {/* Matrix */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <MatrixGrid matrix={currentQuestion.matrix} />
          </div>

          {/* Answer options */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Välj det saknade elementet:</h3>
            <AnswerOptions
              options={currentQuestion.options}
              selectedAnswer={answers.get(currentQuestionIndex) ?? null}
              onSelect={handleAnswerSelect}
              disabled={isSubmitting}
            />
            <p className="text-sm text-gray-500 mt-4">Tips: Använd tangenterna A-F för snabbare navigation</p>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Föregående
            </button>

            {currentQuestionIndex === totalQuestions - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Skickar in...' : 'Lämna in test'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
              >
                Nästa →
              </button>
            )}
          </div>
        </div>

        {/* Sidebar navigation */}
        <div className="bg-white rounded-xl shadow-lg p-6 h-fit sticky top-6">
          <TestNavigation
            totalQuestions={totalQuestions}
            currentQuestion={currentQuestionIndex}
            answeredQuestions={answeredQuestions}
            onNavigate={setCurrentQuestionIndex}
          />
        </div>
      </div>
    </div>
  );
}
