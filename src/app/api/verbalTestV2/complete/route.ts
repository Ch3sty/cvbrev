import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { calculateScore, validateAnswer } from '@/lib/verbalTestV2/validator.v2';
import type { TestAnswer } from '@/lib/verbalTestV2/types.v2';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session ID' },
        { status: 400 }
      );
    }

    // Get session
    const { data: session, error: fetchError } = await supabase
      .from('logic_test_v4_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Validate all answers and add isCorrect flag
    const answers: TestAnswer[] = Array.isArray(session.answers) ? session.answers : [];
    const validatedAnswers = answers.map(answer => {
      const validation = validateAnswer(
        answer.passageId,
        answer.statementIndex,
        answer.answer
      );

      return {
        ...answer,
        isCorrect: validation.isCorrect
      };
    });

    // Calculate score
    const scoreResult = calculateScore(validatedAnswers);

    // Update session with score and completion
    const { error: updateError } = await supabase
      .from('logic_test_v4_sessions')
      .update({
        answers: validatedAnswers,
        score: scoreResult.score,
        completed_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error completing session:', updateError);
      return NextResponse.json(
        { error: 'Failed to complete session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      score: scoreResult.score,
      maxScore: scoreResult.maxScore,
      percentage: scoreResult.percentage
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
