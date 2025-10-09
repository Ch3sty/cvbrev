'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SvgCell } from '@/lib/logic/renderers';
import type { TestResult } from '@/lib/logic/types';
import { CheckCircle2, XCircle, TrendingUp, Clock, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function MatrislogikResultsPage() {
  const router = useRouter();
  const params = useParams();
  const attemptId = params.attemptId as string;

  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResults() {
      try {
        const response = await fetch(`/api/logic/results/${attemptId}`);

        if (!response.ok) {
          router.push('/dashboard/tester/matrislogik?error=results-not-found');
          return;
        }

        const data = await response.json();
        setResult(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading results:', error);
        router.push('/dashboard/tester/matrislogik?error=results-error');
      }
    }

    loadResults();
  }, [attemptId, router]);

  if (loading || !result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Laddar resultat...</p>
        </div>
      </div>
    );
  }

  const minutes = Math.floor(result.timeSpentSeconds / 60);
  const seconds = result.timeSpentSeconds % 60;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Testresultat
        </h1>
        <p className="text-gray-600">Matrislogik - Minimal Icon Logic Test</p>
      </div>

      {/* Score Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 p-8 mb-8">
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <TrendingUp className="w-10 h-10 text-indigo-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Betyg</p>
            <p className="text-5xl font-bold text-indigo-600">{result.rating}/10</p>
          </div>

          <div className="text-center">
            <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Rätt svar</p>
            <p className="text-5xl font-bold text-green-600">
              {result.correctAnswers}/{result.totalQuestions}
            </p>
          </div>

          <div className="text-center">
            <Clock className="w-10 h-10 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Total tid</p>
            <p className="text-5xl font-bold text-purple-600">
              {minutes}:{String(seconds).padStart(2, '0')}
            </p>
          </div>
        </div>

        <div className="border-t-2 border-indigo-200 pt-6">
          <p className="text-center text-lg text-gray-800 font-medium">
            {result.interpretation}
          </p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Genomgång av frågor</h2>

        {result.breakdown.map((item, index) => {
          const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
          const userAnswerLetter =
            item.userAnswer >= 0 ? letters[item.userAnswer] : '-';
          const correctAnswerLetter = letters[item.correctAnswer];

          return (
            <div
              key={item.questionId}
              className={`
                border-2 rounded-xl p-6
                ${
                  item.isCorrect
                    ? 'bg-green-50 border-green-300'
                    : 'bg-red-50 border-red-300'
                }
              `}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {item.isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Fråga {index + 1}
                    </h3>
                    <p className="text-sm text-gray-600">{item.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    Ditt svar: <span className="font-bold">{userAnswerLetter}</span>
                  </p>
                  {!item.isCorrect && (
                    <p className="text-sm text-gray-600">
                      Rätt svar: <span className="font-bold text-green-700">{correctAnswerLetter}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Regel: {item.explanation}
                </p>

                {/* Show matrix and options */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {item.grid.flatMap((row, r) =>
                    row.map((cell, c) => (
                      <div
                        key={`${r}-${c}`}
                        className="w-20 h-20 flex items-center justify-center border border-gray-300 rounded bg-gray-50"
                      >
                        {cell ? (
                          <SvgCell cell={cell} className="w-16 h-16" />
                        ) : (
                          <span className="text-3xl text-gray-400">?</span>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="grid grid-cols-6 gap-2">
                  {item.options.map((opt, i) => {
                    const isUserAnswer = i === item.userAnswer;
                    const isCorrectAnswer = i === item.correctAnswer;

                    return (
                      <div
                        key={i}
                        className={`
                          w-full aspect-square flex flex-col items-center justify-center
                          border-2 rounded-lg p-2
                          ${
                            isCorrectAnswer
                              ? 'border-green-500 bg-green-100'
                              : isUserAnswer
                              ? 'border-red-500 bg-red-100'
                              : 'border-gray-300 bg-white'
                          }
                        `}
                      >
                        <div className="text-xs font-bold mb-1">{letters[i]}</div>
                        <SvgCell cell={opt} className="w-12 h-12" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <Link href="/dashboard/tester/matrislogik">
          <button className="px-6 py-3 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Gör om testet
          </button>
        </Link>

        <Link href="/dashboard/tester">
          <button className="px-6 py-3 rounded-lg font-semibold bg-white border-2 border-gray-300 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 flex items-center gap-2">
            <Home className="w-5 h-5" />
            Tillbaka till tester
          </button>
        </Link>
      </div>
    </div>
  );
}
