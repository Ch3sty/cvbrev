import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { validateAnswer } from '@/lib/numericalTestProv/validator.prov';
import type { TestAnswer } from '@/lib/numericalTest/types';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, passageId, questionId, selectedAnswerId, timeSpent } = await request.json();

    // Rätta mot den merged prov-banken (v1+v2).
    const isCorrect = validateAnswer(passageId, questionId, selectedAnswerId);

    const { data: session, error: fetchError } = await supabase
      .from('logic_test_v4_sessions')
      .select('answers')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching numeric prov session:', fetchError);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const newAnswer: TestAnswer = {
      passageId,
      questionId,
      selectedAnswerId,
      isCorrect,
      timeSpent,
      timestamp: new Date().toISOString(),
    };

    // Ersätt ev. tidigare svar på samma fråga (idempotent vid omval).
    const prev: TestAnswer[] = Array.isArray(session.answers) ? session.answers : [];
    const filtered = prev.filter((a) => a.questionId !== questionId);
    const updatedAnswers = [...filtered, newAnswer];

    const { error: updateError } = await supabase
      .from('logic_test_v4_sessions')
      .update({ answers: updatedAnswers })
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error saving numeric prov answer:', updateError);
      return NextResponse.json({ error: 'Failed to save answer' }, { status: 500 });
    }

    return NextResponse.json({ isCorrect });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
