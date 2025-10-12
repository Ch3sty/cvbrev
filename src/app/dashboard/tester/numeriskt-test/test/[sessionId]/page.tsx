'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ChevronLeft, ChevronRight, Clock, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAllPassages } from '@/lib/numericalTest/validator';
import type { Passage, Question, AnswerOption } from '@/lib/numericalTest/types';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function NumericalTestPage({ params }: PageProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [passages] = useState<Passage[]>(getAllPassages());
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    params.then(p => setSessionId(p.sessionId));
  }, [params]);

  const currentPassage = passages[currentPassageIndex];
  const currentQuestion = currentPassage?.questions[currentQuestionIndex];
  const totalQuestions = passages.reduce((sum, p) => sum + p.questions.length, 0);
  const currentQuestionNumber =
    passages.slice(0, currentPassageIndex).reduce((sum, p) => sum + p.questions.length, 0) +
    currentQuestionIndex + 1;

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
  };

  const handleNextQuestion = async () => {
    if (!selectedAnswer || !sessionId) return;

    setIsSubmitting(true);

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    try {
      await fetch('/api/numericalTest/answer', {
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

      setAnsweredQuestions(prev => new Set([...prev, currentQuestion.id]));

      // Move to next question
      if (currentQuestionIndex < currentPassage.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else if (currentPassageIndex < passages.length - 1) {
        setCurrentPassageIndex(currentPassageIndex + 1);
        setCurrentQuestionIndex(0);
      } else {
        // Test complete
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
      await fetch('/api/numericalTest/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      router.push(`/dashboard/tester/numeriskt-test/test/${sessionId}/results`);
    } catch (error) {
      console.error('Error completing test:', error);
    }
  };

  if (!currentPassage || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Laddar test...</p>
        </div>
      </div>
    );
  }

  const isLastQuestion =
    currentPassageIndex === passages.length - 1 &&
    currentQuestionIndex === currentPassage.questions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Numeriskt Resonemang</h1>
                <p className="text-sm text-slate-600">
                  Fråga {currentQuestionNumber} av {totalQuestions}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4" />
              <span>{answeredQuestions.size} besvarade</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentQuestionNumber / totalQuestions) * 100}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Passage Context */}
          <motion.div
            key={`passage-${currentPassage.id}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-200 h-fit lg:sticky lg:top-8"
          >
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                {currentPassage.title}
              </h2>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  {currentPassage.topic}
                </span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  currentPassage.difficulty === 1 ? 'bg-green-100 text-green-700' :
                  currentPassage.difficulty === 2 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  Nivå {currentPassage.difficulty}
                </span>
              </div>
            </div>

            <div className="prose prose-sm max-w-none mb-6">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {currentPassage.contextText}
              </p>
            </div>

            {/* Data Table */}
            {currentPassage.dataTable && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100">
                      {currentPassage.dataTable.headers.map((header, idx) => (
                        <th
                          key={idx}
                          className="border border-slate-300 px-3 py-2 text-left font-semibold text-slate-900"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentPassage.dataTable.rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        {row.map((cell, cellIdx) => (
                          <td
                            key={cellIdx}
                            className="border border-slate-300 px-3 py-2 text-slate-700"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {currentPassage.dataTable.caption && (
                  <p className="text-xs text-slate-500 mt-2 italic">
                    {currentPassage.dataTable.caption}
                  </p>
                )}
              </div>
            )}
          </motion.div>

          {/* Right Column - Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`question-${currentQuestion.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-200"
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    Fråga {currentQuestionIndex + 1} av {currentPassage.questions.length}
                  </h3>
                  <span className="text-sm text-slate-500">
                    {currentPassage.type === 'table' ? '📊 Tabell' :
                     currentPassage.type === 'word_problem' ? '📝 Ordproblem' :
                     currentPassage.type === 'series' ? '🔢 Talserie' :
                     currentPassage.type === 'graph' ? '📈 Graf' : '💱 Konvertering'}
                  </span>
                </div>
                <p className="text-base text-slate-800 leading-relaxed">
                  {currentQuestion.questionText}
                </p>
              </div>

              {/* Answer Options */}
              <div className="space-y-3 mb-8">
                {currentQuestion.options.map((option: AnswerOption) => (
                  <motion.button
                    key={option.id}
                    onClick={() => handleAnswerSelect(option.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                      selectedAnswer === option.id
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-2 border-blue-600 shadow-lg'
                        : 'bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-bold text-sm ${
                        selectedAnswer === option.id ? 'text-white' : 'text-slate-500'
                      }`}>
                        {option.id.toUpperCase()})
                      </span>
                      <span className="font-medium">{option.text}</span>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleNextQuestion}
                  disabled={!selectedAnswer || isSubmitting}
                  className="flex-1 py-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sparar...
                    </>
                  ) : isLastQuestion ? (
                    <>
                      Slutför test
                      <Flag className="ml-2 w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Nästa fråga
                      <ChevronRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
