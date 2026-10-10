import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { testSkrivKlient } from '@/lib/tests/skrivKlient';
import { arBlandad } from '@/lib/logicTestV7/blanda';
import { BANK_FOR_RUTT, bedomSvar, hittaFraga } from '@/lib/logicTestV7/fragor.server';
import { examDeadlinePassed } from '@/lib/tests/sessionGate';
import { sparaTestsvar, SVARSNYCKLAR } from '@/lib/tests/sparaSvar';

export async function POST(request: Request) {
  try {
    const { sessionId, questionId, selectedIndex, timeSpent } = await request.json();

    if (!sessionId || !questionId || selectedIndex === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
      return NextResponse.json({ error: 'Session already completed' }, { status: 400 });
    }

    // Provets tid har gått ut. Klientens klocka lämnar in provet, men en
    // klient går att stänga av, så gränsen måste hålla även här.
    if (examDeadlinePassed('matrislogik-prov', session.started_at)) {
      return NextResponse.json({ error: 'exam_time_up' }, { status: 409 });
    }

    const question = hittaFraga(BANK_FOR_RUTT.prov, questionId);
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Servern dömer. selectedIndex är positionen hon klickade på; med
    // sessionens permutation blir det originalindex, som lagras och rättas.
    // Sessioner utan meta.alternativ_blandade har identitetsordningen.
    const bedomt = bedomSvar(question, sessionId, arBlandad(session.meta), selectedIndex);
    if (!bedomt) {
      return NextResponse.json({ error: 'Invalid answer' }, { status: 400 });
    }
    const isCorrect = bedomt.correct;

    const answerData = {
      q_id: questionId,
      selected: bedomt.selected,
      visat: bedomt.visat,
      correct: isCorrect,
      time_spent: timeSpent || 0,
    };

    // Ett svar per fråga, atomärt i databasen (src/lib/tests/sparaSvar.ts).
    let answeredCount: number | null;
    try {
      answeredCount = await sparaTestsvar(testSkrivKlient(), {
        userId: user.id,
        reserv: supabase,
        tabell: 'logic_test_v4_sessions',
        sessionId,
        nycklar: SVARSNYCKLAR.matris,
        svar: answerData,
      });
    } catch (updateError) {
      console.error('Error updating prov answers:', updateError);
      return NextResponse.json({ error: 'Failed to save answer' }, { status: 500 });
    }
    if (answeredCount === null) {
      return NextResponse.json({ error: 'Session already completed' }, { status: 400 });
    }

    return NextResponse.json({ success: true, answeredCount });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
