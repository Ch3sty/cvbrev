import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { verifyTestSession } from '@/lib/tester/sessionManager';
import { getQuestionById } from '@/lib/tester/questionBank.server';
import { QuestionBreakdown, UserAnswer } from '@/lib/tester/patternTypes';
import { calculatePracticeRating, getInterpretation } from '@/lib/tester/scoringEngine';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionToken, answers, timeSpent }: {
      sessionToken: string;
      answers: UserAnswer[];
      timeSpent: number;
    } = await request.json();

    // Verifiera session
    const session = await verifyTestSession(sessionToken);

    if (session.userId !== user.id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 403 });
    }

    // Rätta varje svar
    const breakdown: QuestionBreakdown[] = [];
    let correctCount = 0;

    for (const answer of answers) {
      const question = getQuestionById(answer.questionId);

      if (!question) continue;

      const isCorrect = answer.userAnswer === question.correctAnswer;
      if (isCorrect) correctCount++;

      breakdown.push({
        questionId: question.id,
        isCorrect,
        userAnswer: answer.userAnswer,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        timeSpent: answer.timeSpent || 0,
        difficulty: question.difficulty,
        patternTypes: question.patternTypes,
        matrix: question.matrix,
        options: question.options
      });
    }

    // Beräkna poäng
    const scoreRaw = (correctCount / answers.length) * 100;
    const scorePracticeRating = calculatePracticeRating(scoreRaw);
    const interpretation = getInterpretation(scorePracticeRating);

    // Spara i Supabase
    const { data: attempt, error: insertError } = await supabase
      .from('test_attempts')
      .insert({
        user_id: user.id,
        test_type: 'matrislogik-classic',
        test_mode: 'practice',
        score_raw: scoreRaw,
        score_practice_rating: scorePracticeRating,
        correct_answers: correctCount,
        total_questions: answers.length,
        time_spent_seconds: timeSpent || 0,
        answers: answers
      })
      .select()
      .single();

    if (insertError) {
      console.error('[API /tester/submit] Insert error:', insertError);
      throw insertError;
    }

    return NextResponse.json({
      attemptId: attempt.id,
      scoreRaw,
      scorePracticeRating,
      correctAnswers: correctCount,
      totalQuestions: answers.length,
      timeSpentSeconds: timeSpent || 0,
      breakdown,
      interpretation,
      completedAt: attempt.completed_at
    });

  } catch (error) {
    console.error('[API /tester/submit] Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit test' },
      { status: 500 }
    );
  }
}
