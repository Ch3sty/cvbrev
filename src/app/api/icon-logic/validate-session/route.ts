import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import jwt from 'jsonwebtoken';
import { ICON_LOGIC_QUESTION_BANK } from '@/lib/tester/iconLogicQuestionBank.server';
import type { IconLogicClientQuestion, IconLogicTestSession } from '@/lib/tester/iconLogicTypes';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * POST /api/icon-logic/validate-session
 * Validates session token and returns client-safe questions
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

    const { sessionToken } = await request.json();

    // Verify session token
    let decoded: any;
    try {
      decoded = jwt.verify(sessionToken, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired session token' },
        { status: 401 }
      );
    }

    if (decoded.userId !== user.id) {
      return NextResponse.json(
        { error: 'Session token does not match user' },
        { status: 403 }
      );
    }

    const questionIds: string[] = decoded.questionIds;

    // Get client-safe questions
    const clientQuestions: IconLogicClientQuestion[] = questionIds
      .map(id => {
        const serverQuestion = ICON_LOGIC_QUESTION_BANK.find(q => q.id === id);
        if (!serverQuestion) return null;

        return {
          id: serverQuestion.id,
          difficulty: serverQuestion.difficulty,
          matrix: serverQuestion.matrix,
          options: serverQuestion.options
        };
      })
      .filter((q): q is IconLogicClientQuestion => q !== null);

    const session: IconLogicTestSession = {
      sessionToken,
      userId: user.id,
      testType: 'icon-logic',
      questions: clientQuestions,
      startedAt: decoded.startedAt,
      expiresAt: new Date(decoded.exp * 1000).toISOString()
    };

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error validating Icon Logic session:', error);
    return NextResponse.json(
      { error: 'Failed to validate session' },
      { status: 500 }
    );
  }
}
