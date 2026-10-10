import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { sparaTestsvar, SVARSNYCKLAR } from '@/lib/tests/sparaSvar';
import { examDeadlinePassed } from '@/lib/tests/sessionGate';
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
      .select('answers, started_at')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching numeric prov session:', fetchError);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Provets tid har gått ut. Klientens klocka lämnar in provet, men en
    // klient går att stänga av, så gränsen måste hålla även här.
    if (examDeadlinePassed('numeriskt-test-prov', session.started_at)) {
      return NextResponse.json({ error: 'exam_time_up' }, { status: 409 });
    }

    const newAnswer: TestAnswer = {
      passageId,
      questionId,
      selectedAnswerId,
      isCorrect,
      timeSpent,
      timestamp: new Date().toISOString(),
    };

    // Ett svar per fråga, atomärt i databasen (src/lib/tests/sparaSvar.ts).
    // Ett omval ersätter det tidigare svaret, och överlappande anrop kan inte
    // skriva över varandras svar.
    try {
      const sparade = await sparaTestsvar(supabase, {
        tabell: 'logic_test_v4_sessions',
        sessionId,
        nycklar: SVARSNYCKLAR.passageFraga,
        svar: newAnswer as unknown as Record<string, unknown>,
        kravOavslutad: false,
      });
      if (sparade === null) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
    } catch (updateError) {
      console.error('Error saving answer:', updateError);
      return NextResponse.json({ error: 'Failed to save answer' }, { status: 500 });
    }

    return NextResponse.json({ isCorrect });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
