import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getQuestionById } from '@/lib/tester/questionBank.server';
import { QuestionBreakdown } from '@/lib/tester/patternTypes';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { attemptId } = await params;

    // Hämta attempt
    const { data: attempt, error } = await supabase
      .from('test_attempts')
      .select('*')
      .eq('id', attemptId)
      .eq('user_id', user.id)
      .single();

    if (error || !attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    // Rebuild breakdown with full question data
    const breakdown: QuestionBreakdown[] = [];

    for (const answer of attempt.answers as any[]) {
      const question = getQuestionById(answer.questionId);
      if (!question) continue;

      breakdown.push({
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
      });
    }

    return NextResponse.json({
      attemptId: attempt.id,
      scoreRaw: attempt.score_raw,
      scorePracticeRating: attempt.score_practice_rating,
      correctAnswers: attempt.correct_answers,
      totalQuestions: attempt.total_questions,
      timeSpentSeconds: attempt.time_spent_seconds,
      breakdown,
      completedAt: attempt.completed_at
    });

  } catch (error) {
    console.error('[API /tester/results] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
