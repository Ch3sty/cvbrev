import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { calculateScore } from '@/lib/numericalTestV2/validator';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId } = body;

    // Get current session
    const { data: session, error: fetchError } = await supabase
      .from('logic_test_v4_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching session:', fetchError);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Calculate score and time
    const score = calculateScore(session.answers || []);

    // Aktiv tid = summan av tiden per besvarad fråga. Väggklocka sedan
    // started_at räknar med pauser och gör per-fråga-statistiken
    // missvisande — används bara som fallback för sessioner utan tidsdata.
    const activeTime = (session.answers || []).reduce(
      (sum: number, answer: any) => sum + (typeof answer.timeSpent === 'number' ? answer.timeSpent : 0),
      0
    );
    const totalTimeSpent = activeTime > 0
      ? activeTime
      : Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);

    // Update session as completed
    const { error: updateError } = await supabase
      .from('logic_test_v4_sessions')
      .update({
        completed_at: new Date().toISOString(),
        score,
        time_spent: totalTimeSpent,
      })
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error completing session:', updateError);
      return NextResponse.json({ error: 'Failed to complete test' }, { status: 500 });
    }

    return NextResponse.json({ score, time_spent: totalTimeSpent });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
