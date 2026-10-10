import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { testSkrivKlient } from '@/lib/tests/skrivKlient';
import { examDeadlinePassed } from '@/lib/tests/sessionGate';
import { sparaTestsvar, SVARSNYCKLAR } from '@/lib/tests/sparaSvar';

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

    // Provets tid har gått ut. Klientens klocka lämnar in provet, men en
    // klient går att stänga av, så gränsen måste hålla även här.
    if (examDeadlinePassed('verbal-resonemang-prov', session.started_at)) {
      return NextResponse.json({ error: 'exam_time_up' }, { status: 409 });
    }

    const newAnswer = { passageId, statementIndex, answer, timeSpent: timeSpent || 0 };

    // Ett svar per påstående, atomärt i databasen (src/lib/tests/sparaSvar.ts).
    try {
      const sparade = await sparaTestsvar(testSkrivKlient(), {
        userId: user.id,
        reserv: supabase,
        tabell: 'logic_test_v4_sessions',
        sessionId,
        nycklar: SVARSNYCKLAR.verbalPastaende,
        svar: newAnswer,
        kravOavslutad: false,
      });
      if (sparade === null) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
    } catch (updateError) {
      console.error('Error saving verbal prov answer:', updateError);
      return NextResponse.json({ error: 'Failed to save answer' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
