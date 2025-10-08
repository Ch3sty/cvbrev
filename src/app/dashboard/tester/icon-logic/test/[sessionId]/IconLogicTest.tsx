'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IconLogicTestSession, IconLogicUserAnswer } from '@/lib/tester/iconLogicTypes';
import { IconGrid } from '../../components/IconGrid';
import { AnswerOptions } from '../../components/AnswerOptions';
import { ArrowLeft, ArrowRight, Clock, CheckCircle } from 'lucide-react';

interface IconLogicTestProps {
  session: IconLogicTestSession;
}

export function IconLogicTest({ session }: IconLogicTestProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<IconLogicUserAnswer[]>(
    session.questions.map(q => ({
      questionId: q.id,
      userAnswer: -1,
      timeSpent: 0
    }))
  );
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [totalStartTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = session.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];

  // Update time spent on current question
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      setAnswers(prev => {
        const updated = [...prev];
        updated[currentQuestionIndex].timeSpent = timeSpent;
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestionIndex, questionStartTime]);

  const handleSelectAnswer = (answerIndex: number) => {
    setAnswers(prev => {
      const updated = [...prev];
      updated[currentQuestionIndex].userAnswer = answerIndex;
      return updated;
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Check if all questions are answered
    const unanswered = answers.filter(a => a.userAnswer === -1);
    if (unanswered.length > 0) {
      const confirmSubmit = window.confirm(
        `Du har ${unanswered.length} obesvarade frågor. Vill du verkligen lämna in?`
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);

    try {
      const totalTimeSpent = Math.floor((Date.now() - totalStartTime) / 1000);

      const response = await fetch('/api/icon-logic/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionToken: session.sessionToken,
          answers,
          timeSpentSeconds: totalTimeSpent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit test');
      }

      const result = await response.json();
      router.push(`/dashboard/tester/icon-logic/results/${result.attemptId}`);
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Kunde inte skicka in testet. Försök igen.');
      setIsSubmitting(false);
    }
  };

  const answeredCount = answers.filter(a => a.userAnswer !== -1).length;
  const progress = (answeredCount / session.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Fråga {currentQuestionIndex + 1} av {session.questions.length}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {answeredCount}/{session.questions.length} besvarade
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Header */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Fråga {currentQuestionIndex + 1}
              </h2>
              <p className="text-gray-600">
                Svårighetsgrad: {'★'.repeat(currentQuestion.difficulty)}{'☆'.repeat(3 - currentQuestion.difficulty)}
              </p>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <span className="font-mono">
                {Math.floor(currentAnswer.timeSpent / 60)}:{(currentAnswer.timeSpent % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
          <p className="text-gray-700 mb-6 text-center">
            Välj det alternativ som logiskt passar in i den saknade rutan (?)
          </p>
          <IconGrid matrix={currentQuestion.matrix} />
        </div>

        {/* Answer Options */}
        <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Svarsalternativ</h3>
          <AnswerOptions
            options={currentQuestion.options}
            selectedAnswer={currentAnswer.userAnswer}
            onSelect={handleSelectAnswer}
            disabled={isSubmitting}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5" />
            Föregående
          </button>

          <div className="flex gap-2">
            {session.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentQuestionIndex(index);
                  setQuestionStartTime(Date.now());
                }}
                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white scale-110'
                    : answers[index].userAnswer !== -1
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex === session.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  Skickar in...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Lämna in
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Nästa
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
