import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Verify user owns this session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch session
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

    // Don't re-complete
    if (session.completed_at) {
      return NextResponse.json({
        message: 'Session already completed',
        score: session.score,
        timeSpent: session.time_spent
      });
    }

    // Calculate score
    const answers = Array.isArray(session.answers) ? session.answers : [];
    const score = answers.filter((a: any) => a.correct).length;

    // Aktiv tid = summan av tiden per besvarad fråga (väggklocka räknar med
    // pauser och blir missvisande). Fallback för sessioner utan tidsdata.
    const activeTime = answers.reduce(
      (sum: number, a: any) => sum + (typeof a.time_spent === 'number' ? a.time_spent : 0),
      0
    );
    const timeSpent = activeTime > 0
      ? activeTime
      : Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);

    // Update session
    const { error: updateError } = await supabase
      .from('logic_test_v4_sessions')
      .update({
        completed_at: new Date().toISOString(),
        score,
        time_spent: timeSpent
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error completing v6 session:', updateError);
      return NextResponse.json(
        { error: 'Failed to complete session' },
        { status: 500 }
      );
    }

    // Calculate breakdown by difficulty
    const breakdown = {
      difficulty1: { correct: 0, total: 0 },
      difficulty2: { correct: 0, total: 0 },
      difficulty3: { correct: 0, total: 0 }
    };

    // This would require loading questionBank to check difficulty
    // For now, return basic stats

    return NextResponse.json({
      success: true,
      score,
      timeSpent,
      totalQuestions: 15,
      breakdown
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
