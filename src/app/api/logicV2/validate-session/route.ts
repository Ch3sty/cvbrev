import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { getQuestionById } from '@/lib/logicV2/questionBank.server';
import type { ClientQuestion } from '@/lib/logicV2/types';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * POST /api/logicV2/validate-session
 * Validates session token and returns client-safe questions (without correct answers)
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

    const { sessionToken } = await request.json();

    // Verify JWT
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

    // Get client-safe questions (without correctAnswer)
    const clientQuestions: ClientQuestion[] = questionIds
      .map((id) => {
        const q = getQuestionById(id);
        if (!q) return null;

        // Return question without correctAnswer
        const { correctAnswer, ...clientQuestion } = q;
        return clientQuestion as ClientQuestion;
      })
      .filter((q): q is ClientQuestion => q !== null);

    return NextResponse.json({
      sessionToken,
      sessionId: decoded.sessionId,
      questions: clientQuestions,
      testType: 'matrislogik-avancerad',
      startedAt: decoded.startedAt,
      expiresAt: new Date(decoded.exp * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Error validating session:', error);
    return NextResponse.json(
      { error: 'Failed to validate session' },
      { status: 500 }
    );
  }
}
