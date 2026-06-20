import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

// Lagrar råa svar (passageId + statementIndex). Rättning sker i complete-routen
// mot den merged prov-banken.
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, passageId, statementIndex, answer, timeSpent } = await request.json();
    if (!sessionId || !passageId || statementIndex === undefined || !answer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    const answers = Array.isArray(session.answers) ? session.answers : [];
    const existingIndex = answers.findIndex(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (a: any) => a.passageId === passageId && a.statementIndex === statementIndex
    );
    const newAnswer = { passageId, statementIndex, answer, timeSpent: timeSpent || 0 };
    if (existingIndex !== -1) answers[existingIndex] = newAnswer;
    else answers.push(newAnswer);

    const { error: updateError } = await supabase
      .from('logic_test_v4_sessions')
      .update({ answers })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error saving verbal prov answer:', updateError);
      return NextResponse.json({ error: 'Failed to save answer' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
