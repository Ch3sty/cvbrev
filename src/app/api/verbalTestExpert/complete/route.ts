import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { calculateScore } from '@/lib/verbalTestExpert/validator';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await request.json();

    const { data: session, error: fetchError } = await supabase
      .from('logic_test_v4_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching verbal expert session:', fetchError);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const score = calculateScore(session.answers || []);
    const timeSpent = Math.floor(
      (Date.now() - new Date(session.started_at).getTime()) / 1000
    );

    const { error: updateError } = await supabase
      .from('logic_test_v4_sessions')
      .update({ completed_at: new Date().toISOString(), score, time_spent: timeSpent })
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error completing verbal expert session:', updateError);
      return NextResponse.json({ error: 'Failed to complete test' }, { status: 500 });
    }

    return NextResponse.json({ score, time_spent: timeSpent });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
