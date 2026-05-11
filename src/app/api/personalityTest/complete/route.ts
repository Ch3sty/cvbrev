import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { ITEMS_GRUND } from '@/lib/personalityTest/itemsGrund';
import { ITEMS_AVANCERAD } from '@/lib/personalityTest/itemsAvancerad';
import { computeScores, isComplete } from '@/lib/personalityTest/scoring';

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
      .from('personality_test_sessions')
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
        scores: session.scores,
        facetScores: session.facet_scores,
      });
    }

    const itemBank = session.test_type === 'personlighet-grund'
      ? ITEMS_GRUND
      : ITEMS_AVANCERAD;

    const answers = Array.isArray(session.answers) ? session.answers : [];

    if (!isComplete(itemBank, answers)) {
      return NextResponse.json(
        { error: 'Not all questions answered' },
        { status: 400 }
      );
    }

    const profile = computeScores(itemBank, answers);

    const timeSpent = Math.floor(
      (Date.now() - new Date(session.started_at).getTime()) / 1000
    );

    const { error: updateError } = await supabase
      .from('personality_test_sessions')
      .update({
        completed_at: new Date().toISOString(),
        time_spent: timeSpent,
        scores: profile.scores,
        facet_scores: profile.facetScores ?? null,
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error completing session:', updateError);
      return NextResponse.json(
        { error: 'Failed to complete session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      scores: profile.scores,
      facetScores: profile.facetScores,
      timeSpent,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
