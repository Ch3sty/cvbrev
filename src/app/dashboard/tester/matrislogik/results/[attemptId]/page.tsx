'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MatrixGrid } from '../../components/MatrixGrid';
import { Brain, Clock, Target } from 'lucide-react';
import Link from 'next/link';
import { getInterpretation } from '@/lib/tester/scoringEngine';

interface ResultsData {
  attemptId: string;
  scoreRaw: number;
  scorePracticeRating: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  breakdown: any[];
  completedAt: string;
}

export default function ResultsPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;

  const [results, setResults] = useState<ResultsData | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    async function loadResults() {
      try {
        const response = await fetch(`/api/tester/results/${attemptId}`);
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Failed to load results:', error);
      }
    }
    loadResults();
  }, [attemptId]);

  if (!results) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">Laddar resultat...</p>
      </div>
    );
  }

  const interpretation = getInterpretation(results.scorePracticeRating);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Results summary */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Testresultat - Matrislogik</h1>

        {/* Score display */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white/20 backdrop-blur rounded-xl p-6 text-center">
            <div className="text-5xl font-bold mb-2">{results.scorePracticeRating}/10</div>
            <div className="text-sm opacity-90">Träningsbetyg</div>
          </div>

          <div className="bg-white/20 backdrop-blur rounded-xl p-6 text-center">
            <div className="text-5xl font-bold mb-2">{results.correctAnswers}/{results.totalQuestions}</div>
            <div className="text-sm opacity-90">Rätt svar</div>
          </div>

          <div className="bg-white/20 backdrop-blur rounded-xl p-6 text-center">
            <div className="text-5xl font-bold mb-2">{Math.round(results.scoreRaw)}%</div>
            <div className="text-sm opacity-90">Resultat</div>
          </div>
        </div>

        {/* Performance feedback */}
        <div className="text-center text-lg">
          {interpretation}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 justify-center">
        <Link
          href="/dashboard/tester/matrislogik"
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
        >
          Gör nytt test
        </Link>

        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
        >
          {showBreakdown ? 'Dölj' : 'Visa'} genomgång
        </button>
      </div>

      {/* Question breakdown */}
      {showBreakdown && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Frågegenomgång</h2>

          {results.breakdown.map((question, idx) => (
            <div
              key={question.questionId}
              className={`border-2 rounded-xl p-6 ${
                question.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Fråga {idx + 1}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  question.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {question.isCorrect ? '✓ Rätt' : '✗ Fel'}
                </span>
              </div>

              {/* Matrix */}
              <MatrixGrid matrix={question.matrix} className="mb-4" />

              {/* Answer info */}
              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-gray-700">
                  Ditt svar: Alternativ {String.fromCharCode(65 + question.userAnswer)}
                </p>
                {!question.isCorrect && (
                  <p className="text-sm font-medium text-green-700">
                    Rätt svar: Alternativ {String.fromCharCode(65 + question.correctAnswer)}
                  </p>
                )}
              </div>

              {/* Explanation */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Förklaring:</p>
                <p className="text-gray-600">{question.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
