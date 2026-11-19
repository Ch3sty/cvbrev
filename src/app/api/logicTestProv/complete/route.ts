import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { testSkrivKlient } from '@/lib/tests/skrivKlient';
import { unikaSvar, SVARSNYCKLAR } from '@/lib/tests/sparaSvar';
import { rattaMatrisSvar } from '@/lib/logicTestV7/fragor.server';
import { PROV_TOTAL_QUESTIONS } from '@/lib/logicTestV7/selectProv.v7';
import { markeraTestBricka } from '@/lib/onboarding/komigang-server';
import { skickaKlassiskStatistik } from '@/lib/tests/klassiskStatistik';
import { sessionstid } from '@/lib/tests/sessionstid';

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
    const answers = unikaSvar(session.answers, SVARSNYCKLAR.matris);
    // Poängen räknas på unika svar och originalindex mot facit i banken.
    const score = rattaMatrisSvar(answers);

    // Sessionens tid räknas från started_at (servertid), så en omladdning
    // mitt i testet inte nollar den (src/lib/tests/sessionstid.ts). Summan av
    // tiden per uppgift är bara reserv när started_at saknas.
    const activeTime = answers.reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sum: number, a: any) => sum + (typeof a.time_spent === 'number' ? a.time_spent : 0),
      0
    );
    const timeSpent = sessionstid(session.started_at, Date.now(), activeTime);

    const { error: updateError } = await testSkrivKlient()
      .from('logic_test_v4_sessions')
      .update({ completed_at: new Date().toISOString(), score, time_spent: timeSpent })
      .eq('id', sessionId)
      .eq('user_id', user.id);

    // Hjälpredan Kom igång: kvittera brickan när testet faktiskt är slutfört.
    // Tyst vid fel, får aldrig fälla svaret.
    void markeraTestBricka(user.id, session.test_type);

    if (updateError) {
      console.error('Error completing prov session:', updateError);
      return NextResponse.json({ error: 'Failed to complete session' }, { status: 500 });
    }

    // Frågestatistiken (kontrakt-kalibrering), bara blandade sessioner.
    void skickaKlassiskStatistik({ userId: user.id, meta: session.meta, answers, testKind: 'matris', etikett: 'Matrisprov' });

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
