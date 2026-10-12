// /api/deduktiv/answer: servern dömer. Visat index in, originalindex
// lagras (bedomDeduktivSvar). Bara deduktivens pool, aldrig matrisernas.
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { testSkrivKlient } from '@/lib/tests/skrivKlient';
import { arBlandad } from '@/lib/logicTestV7/blanda';
import { arDeduktivTestTyp, bedomDeduktivSvar, hittaDeduktivFraga } from '@/lib/deduktivV1/fragor.server';
import { sparaTestsvar, SVARSNYCKLAR } from '@/lib/tests/sparaSvar';

export async function POST(request: Request) {
  try {
    const { sessionId, questionId, selectedIndex, timeSpent } = await request.json();
    if (!sessionId || !questionId || selectedIndex === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServerClient({ cookies: await cookies() });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: session, error } = await supabase.from('logic_test_v4_sessions').select('*').eq('id', sessionId).eq('user_id', user.id).single();
    if (error || !session || !arDeduktivTestTyp(session.test_type)) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    if (session.completed_at) return NextResponse.json({ error: 'Session already completed' }, { status: 400 });

    const q = hittaDeduktivFraga(questionId);
    if (!q) return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    const bedomt = bedomDeduktivSvar(q, sessionId, arBlandad(session.meta), selectedIndex);
    if (!bedomt) return NextResponse.json({ error: 'Invalid answer' }, { status: 400 });

    let answeredCount: number | null;
    try {
      answeredCount = await sparaTestsvar(testSkrivKlient(), {
        userId: user.id,
        reserv: supabase,
        tabell: 'logic_test_v4_sessions',
        sessionId,
        nycklar: SVARSNYCKLAR.matris,
        svar: { q_id: questionId, selected: bedomt.selected, visat: bedomt.visat, correct: bedomt.correct, time_spent: timeSpent || 0 },
      });
    } catch (e) {
      console.error('Deduktiv: svaret sparades inte', e);
      return NextResponse.json({ error: 'Failed to save answer' }, { status: 500 });
    }
    if (answeredCount === null) return NextResponse.json({ error: 'Session already completed' }, { status: 400 });
    return NextResponse.json({ success: true, answeredCount });
  } catch (error) {
    console.error('Deduktiv answer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
