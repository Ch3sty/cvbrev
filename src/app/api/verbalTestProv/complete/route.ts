import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { calculateScore, validateAnswer } from '@/lib/verbalTestProv/validator.prov';
import type { TestAnswer } from '@/lib/verbalTestV1/types.v1';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    const { data: session, error: fetchError } = await supabase
      .from('logic_test_v4_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const answers: TestAnswer[] = Array.isArray(session.answers) ? session.answers : [];
    const validated = answers.map((a) => ({
      ...a,
      isCorrect: validateAnswer(a.passageId, a.statementIndex, a.answer).isCorrect,
    }));
    const result = calculateScore(validated);

    // Väggklocka är AVSIKTLIG här: verbal-provet körs mot en synlig
    // 40-minuters nedräkningstimer som auto-lämnar in när tiden är slut.
    // Provet är en tidsatt sittning, så förfluten tid sedan started_at är
    // rätt mått — byt inte till summan av answers[].timeSpent.
    const timeSpent = Math.floor(
      (Date.now() - new Date(session.started_at).getTime()) / 1000
    );

    const { error: updateError } = await supabase
      .from('logic_test_v4_sessions')
      .update({
        answers: validated,
        score: result.score,
        time_spent: timeSpent,
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error completing verbal prov session:', updateError);
      return NextResponse.json({ error: 'Failed to complete session' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      score: result.score,
      maxScore: result.maxScore,
      percentage: result.percentage,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
