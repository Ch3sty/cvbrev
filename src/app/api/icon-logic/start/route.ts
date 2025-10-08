import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { ICON_LOGIC_QUESTION_BANK } from '@/lib/tester/iconLogicQuestionBank.server';
import { IconLogicTestSession, IconLogicClientQuestion } from '@/lib/tester/iconLogicTypes';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * POST /api/icon-logic/start
 * Starts a new Icon Logic test session
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Shuffle and select all 10 questions
    const shuffledQuestions = [...ICON_LOGIC_QUESTION_BANK]
      .sort(() => Math.random() - 0.5);

    // Convert to client questions (remove correctAnswer and explanation)
    const clientQuestions: IconLogicClientQuestion[] = shuffledQuestions.map(q => ({
      id: q.id,
      difficulty: q.difficulty,
      matrix: q.matrix,
      options: q.options
    }));

    // Create session token
    const sessionToken = jwt.sign(
      {
        userId: user.id,
        testType: 'icon-logic',
        questionIds: shuffledQuestions.map(q => q.id),
        startedAt: new Date().toISOString()
      },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    const session: IconLogicTestSession = {
      sessionToken,
      userId: user.id,
      testType: 'icon-logic',
      questions: clientQuestions,
      startedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
    };

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error starting Icon Logic test:', error);
    return NextResponse.json(
      { error: 'Failed to start test' },
      { status: 500 }
    );
  }
}
