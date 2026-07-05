import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { PROV_TOTAL_QUESTIONS } from '@/lib/logicTestV7/selectProv.v7';

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    if (session.completed_at) {
      return NextResponse.json({
        message: 'Session already completed',
        score: session.score,
        timeSpent: session.time_spent,
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const answers = Array.isArray(session.answers) ? session.answers : [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const score = answers.filter((a: any) => a.correct).length;

    // Aktiv tid = summan av tiden per besvarad fråga. Matrislogik-provet har
    // ingen synlig timer eller hård tidsgräns i UI:t, så väggklocka sedan
    // started_at räknar med pauser/omladdningar och gör tiden missvisande —
    // används bara som fallback för sessioner utan tidsdata.
    const activeTime = answers.reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sum: number, a: any) => sum + (typeof a.time_spent === 'number' ? a.time_spent : 0),
      0
    );
    const timeSpent = activeTime > 0
      ? activeTime
      : Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);

    const { error: updateError } = await supabase
      .from('logic_test_v4_sessions')
      .update({ completed_at: new Date().toISOString(), score, time_spent: timeSpent })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error completing prov session:', updateError);
      return NextResponse.json({ error: 'Failed to complete session' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      score,
      timeSpent,
      totalQuestions: PROV_TOTAL_QUESTIONS,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
