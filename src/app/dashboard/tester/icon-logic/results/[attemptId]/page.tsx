import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Clock, Target, TrendingUp } from 'lucide-react';
import { IconGrid } from '../../components/IconGrid';
import { IconCellSVG } from '../../components/IconCellSVG';

export const metadata: Metadata = {
  title: 'Icon Logic Resultat | Jobbcoach.ai',
  description: 'Se dina Icon Logic testresultat'
};

export default async function IconLogicResultsPage({
  params
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { attemptId } = await params;

  // Fetch results
  const { data: attempt, error } = await supabase
    .from('test_attempts')
    .select('*')
    .eq('id', attemptId)
    .eq('user_id', user.id)
    .eq('test_type', 'icon-logic')
    .single();

  if (error || !attempt) {
    redirect('/dashboard/tester/icon-logic?error=results-not-found');
  }

  // Rebuild breakdown from answers (not stored in database)
  const { ICON_LOGIC_QUESTION_BANK } = await import('@/lib/tester/iconLogicQuestionBank.server');
  const breakdown = (attempt.answers as any[]).map((answer: any) => {
    const question = ICON_LOGIC_QUESTION_BANK.find(q => q.id === answer.questionId);
    if (!question) return null;

    return {
      questionId: question.id,
      isCorrect: answer.userAnswer === question.correctAnswer,
      userAnswer: answer.userAnswer,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      timeSpent: answer.timeSpent || 0,
      difficulty: question.difficulty,
      patternTypes: question.patternTypes,
      matrix: question.matrix,
      options: question.options
    };
  }).filter((item: any) => item !== null);
  const scorePercentage = attempt.score_raw;
  const minutes = Math.floor(attempt.time_spent_seconds / 60);
  const seconds = attempt.time_spent_seconds % 60;

  // Calculate stats by difficulty
  const easyQuestions = breakdown.filter((q: any) => q.difficulty === 1);
  const mediumQuestions = breakdown.filter((q: any) => q.difficulty === 2);
  const hardQuestions = breakdown.filter((q: any) => q.difficulty === 3);

  const easyCorrect = easyQuestions.filter((q: any) => q.isCorrect).length;
  const mediumCorrect = mediumQuestions.filter((q: any) => q.isCorrect).length;
  const hardCorrect = hardQuestions.filter((q: any) => q.isCorrect).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Dina Resultat
          </h1>
          <p className="text-xl text-gray-600">
            Icon Logic Test
          </p>
        </div>

        {/* Score Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 mb-8 text-white shadow-2xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{scorePercentage}%</div>
              <div className="text-blue-100">Totalt Resultat</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">
                {attempt.correct_answers}/{attempt.total_questions}
              </div>
              <div className="text-blue-100">Rätta Svar</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </div>
              <div className="text-blue-100">Total Tid</div>
            </div>
          </div>

          {/* Interpretation */}
          <div className="mt-8 p-6 bg-white/10 backdrop-blur rounded-xl">
            <p className="text-lg text-center">
              {scorePercentage >= 90 ? '🏆 Utmärkt! Du har exceptionell logisk förmåga och mönsterigenkänning.' :
               scorePercentage >= 70 ? '🎯 Mycket bra! Du har stark logisk förmåga.' :
               scorePercentage >= 50 ? '👍 Bra! Du har god logisk förmåga.' :
               scorePercentage >= 30 ? '📚 Okej resultat. Fortsätt öva för att förbättra din logiska förmåga.' :
               '💪 Utmanande test. Fortsätt öva - logisk förmåga kan tränas!'}
            </p>
          </div>
        </div>

        {/* Stats by Difficulty */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Lätt (★☆☆)</h3>
              <span className="text-2xl font-bold text-green-600">
                {easyQuestions.length > 0 ? Math.round((easyCorrect / easyQuestions.length) * 100) : 0}%
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {easyCorrect} av {easyQuestions.length} rätt
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Medel (★★☆)</h3>
              <span className="text-2xl font-bold text-yellow-600">
                {mediumQuestions.length > 0 ? Math.round((mediumCorrect / mediumQuestions.length) * 100) : 0}%
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {mediumCorrect} av {mediumQuestions.length} rätt
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Svår (★★★)</h3>
              <span className="text-2xl font-bold text-red-600">
                {hardQuestions.length > 0 ? Math.round((hardCorrect / hardQuestions.length) * 100) : 0}%
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {hardCorrect} av {hardQuestions.length} rätt
            </div>
          </div>
        </div>

        {/* Question Breakdown */}
        <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Genomgång av Frågor</h2>

          <div className="space-y-8">
            {breakdown.map((question: any, index: number) => (
              <div
                key={question.questionId}
                className={`border-2 rounded-xl p-6 ${
                  question.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {question.isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">
                      Fråga {index + 1}
                    </h3>
                    <span className="text-sm text-gray-600">
                      {'★'.repeat(question.difficulty)}{'☆'.repeat(3 - question.difficulty)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      {Math.floor(question.timeSpent / 60)}:{(question.timeSpent % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Matrix */}
                <div className="mb-4">
                  <IconGrid matrix={question.matrix} className="max-w-md mx-auto" />
                </div>

                {/* Answer Comparison */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Ditt svar:</p>
                    <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                      {question.userAnswer >= 0 ? (
                        <div>
                          <div className="w-24 h-24 mx-auto mb-2">
                            <IconCellSVG cell={question.options[question.userAnswer]} />
                          </div>
                          <p className="text-center font-semibold">
                            Alternativ {String.fromCharCode(65 + question.userAnswer)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-center text-gray-500">Inget svar</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Rätt svar:</p>
                    <div className="border-2 border-green-500 rounded-lg p-4 bg-white">
                      <div className="w-24 h-24 mx-auto mb-2">
                        <IconCellSVG cell={question.options[question.correctAnswer]} />
                      </div>
                      <p className="text-center font-semibold text-green-700">
                        Alternativ {String.fromCharCode(65 + question.correctAnswer)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div className={`p-4 rounded-lg ${
                  question.isCorrect ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <p className="text-sm font-medium mb-2">
                    {question.isCorrect ? '✓ Rätt!' : '✗ Fel'}
                  </p>
                  <p className="text-sm text-gray-700">{question.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/dashboard/tester/icon-logic"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all text-center"
          >
            Försök Igen
          </Link>
          <Link
            href="/dashboard/tester"
            className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl shadow-lg transition-all text-center"
          >
            Tillbaka till Tester
          </Link>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/dashboard/tester/icon-logic"
            className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Tillbaka till Icon Logic
          </Link>
        </div>
      </div>
    </div>
  );
}
