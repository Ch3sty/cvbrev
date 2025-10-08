import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyTestSession } from '@/lib/tester/sessionManager';
import { getQuestionById } from '@/lib/tester/questionBank.server';
import { ClientQuestion } from '@/lib/tester/patternTypes';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionToken } = await request.json();

    // Verifiera session
    const session = await verifyTestSession(sessionToken);

    if (session.userId !== user.id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 403 });
    }

    // Hämta frågor baserat på questionIds från session
    const clientQuestions: ClientQuestion[] = session.questionIds
      .map(id => {
        const q = getQuestionById(id);
        if (!q) return null;
        return {
          id: q.id,
          difficulty: q.difficulty,
          matrix: q.matrix,
          options: q.options
        };
      })
      .filter((q): q is ClientQuestion => q !== null);

    return NextResponse.json({
      valid: true,
      questions: clientQuestions,
      testType: session.testType
    });

  } catch (error) {
    console.error('[API /tester/validate-session] Error:', error);
    return NextResponse.json(
      { error: 'Invalid or expired session' },
      { status: 401 }
    );
  }
}
