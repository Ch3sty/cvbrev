import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { getQuestionById } from '@/lib/logicV2/questionBank.server';
import { getInterpretation } from '@/lib/logicV2/scoring';
import type { QuestionBreakdown } from '@/lib/logicV2/types';

/**
 * GET /api/logicV2/results/[attemptId]
 * Fetch test results by attempt ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });
    const { attemptId } = await params;

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch result
    const { data: result, error: resultError } = await supabase
      .from('logic_results')
      .select('*')
      .eq('id', attemptId)
      .eq('user_id', user.id)
      .single();

    if (resultError || !result) {
      return NextResponse.json(
        { error: 'Result not found' },
        { status: 404 }
      );
    }

    // Fetch session to get question IDs
    const { data: session, error: sessionError } = await supabase
      .from('logic_sessions')
      .select('question_ids')
      .eq('id', result.session_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Fetch answers
    const { data: answers, error: answersError } = await supabase
      .from('logic_answers')
      .select('*')
      .eq('session_id', result.session_id)
      .eq('user_id', user.id);

    if (answersError) {
      console.error('Error fetching answers:', answersError);
      return NextResponse.json(
        { error: 'Failed to fetch answers' },
        { status: 500 }
      );
    }

    // Rebuild breakdown
    const breakdown: QuestionBreakdown[] = [];
    const questionIds = session.question_ids as string[];
    const answerMap = new Map(answers?.map((a) => [a.question_id, a]) || []);

    for (const qid of questionIds) {
      const question = getQuestionById(qid);
      if (!question) continue;

      const answer = answerMap.get(qid);
      const userAnswer = answer ? answer.answer_index : -1;

      breakdown.push({
        questionId: question.id,
        isCorrect: answer ? answer.is_correct : false,
        userAnswer,
        correctAnswer: question.correctAnswer,
        explanation: question.rule,
        timeSpent: answer ? answer.time_spent_seconds : 0,
        title: question.title,
        grid: question.grid,
        options: question.options,
      });
    }

    return NextResponse.json({
      attemptId: result.id,
      scoreRaw: result.score_raw,
      rating: result.rating,
      correctAnswers: result.correct_answers,
      totalQuestions: result.total_questions,
      timeSpentSeconds: result.time_spent_seconds,
      breakdown,
      interpretation: getInterpretation(result.rating),
      completedAt: result.completed_at,
    });
  } catch (error) {
    console.error('Error fetching logic V2 results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
