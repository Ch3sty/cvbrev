// /api/steg2/[kind]/answer: servern dömer. Visat index in, originalindex
// lagras (motorns bedom). Bara typens egen pool.
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { testSkrivKlient } from '@/lib/tests/skrivKlient';
import { sparaTestsvar, SVARSNYCKLAR } from '@/lib/tests/sparaSvar';
import { steg2Motor } from '@/lib/tester/steg2/motor.server';

export async function POST(request: Request, ctx: { params: Promise<{ kind: string }> }) {
  try {
    const motor = steg2Motor((await ctx.params).kind);
    if (!motor) return NextResponse.json({ error: 'Okänd testtyp' }, { status: 404 });
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
    if (error || !session || !motor.arTestTyp(session.test_type)) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    if (session.completed_at) return NextResponse.json({ error: 'Session already completed' }, { status: 400 });

    // Uppgiften måste höra till sessionens urval.
    const urval = (motor.innehall(session).fragor as { id: string }[]).map((f) => f.id);
    if (!urval.includes(questionId)) return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    const bedomt = motor.bedom(questionId, sessionId, session.meta, selectedIndex);
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
      console.error(`[steg2 ${motor.kind}] svaret sparades inte`, e);
      return NextResponse.json({ error: 'Failed to save answer' }, { status: 500 });
    }
    if (answeredCount === null) return NextResponse.json({ error: 'Session already completed' }, { status: 400 });
    return NextResponse.json({ success: true, answeredCount });
  } catch (error) {
    console.error('Steg 2 answer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
