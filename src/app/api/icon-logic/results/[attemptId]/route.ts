import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

/**
 * GET /api/icon-logic/results/[attemptId]
 * Fetch Icon Logic test results by attempt ID
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
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch attempt from database
    const { data: attempt, error: fetchError } = await supabase
      .from('test_attempts')
      .select('*')
      .eq('id', attemptId)
      .eq('user_id', user.id)
      .eq('test_type', 'icon-logic')
      .single();

    if (fetchError || !attempt) {
      return NextResponse.json(
        { error: 'Test attempt not found' },
        { status: 404 }
      );
    }

    // Return full result including breakdown
    return NextResponse.json({
      attemptId: attempt.id,
      scoreRaw: attempt.score_raw,
      scorePracticeRating: attempt.score_practice_rating,
      correctAnswers: attempt.correct_answers,
      totalQuestions: attempt.total_questions,
      timeSpentSeconds: attempt.time_spent_seconds,
      breakdown: attempt.breakdown,
      interpretation: attempt.breakdown?.interpretation || 'Test genomförd.',
      completedAt: attempt.completed_at
    });
  } catch (error) {
    console.error('Error fetching Icon Logic results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
