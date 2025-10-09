import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { getAllQuestionIdsShuffled } from '@/lib/logic/questionBank.server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * POST /api/logic/start
 * Starts a new logic test V3 (grundnivå) session with 15 shuffled questions
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get 15 shuffled questions
    const questionIds = getAllQuestionIdsShuffled();

    // Create session in database
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    const { data: session, error: sessionError } = await supabase
      .from('logic_sessions')
      .insert({
        user_id: user.id,
        test_type: 'matrislogik-minimal',
        question_ids: questionIds,
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    // Create JWT token
    const sessionToken = jwt.sign(
      {
        sessionId: session.id,
        userId: user.id,
        testType: 'matrislogik-minimal',
        questionIds,
        startedAt: session.started_at,
      },
      JWT_SECRET,
      { expiresIn: '30m' }
    );

    return NextResponse.json({
      sessionToken,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Error starting logic test V3:', error);
    return NextResponse.json(
      { error: 'Failed to start test' },
      { status: 500 }
    );
  }
}
