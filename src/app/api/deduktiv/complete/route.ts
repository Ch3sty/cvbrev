// /api/deduktiv/complete: rättar mot banken, sätter completed_at, score
// och aktiv tid, och skickar svaren till frågestatistiken med test_kind
// deduktiv (kontrakt-kalibrering). Statistiken får aldrig fälla svaret.
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { testSkrivKlient } from '@/lib/tests/skrivKlient';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { arBlandad } from '@/lib/logicTestV7/blanda';
import { unikaSvar, SVARSNYCKLAR } from '@/lib/tests/sparaSvar';
import { arDeduktivTestTyp, rattaDeduktivSvar, deduktivStatistik } from '@/lib/deduktivV1/fragor.server';
import { markeraTestBricka } from '@/lib/onboarding/komigang-server';

type Svar = { q_id: string; selected: number; correct: boolean; time_spent?: number };

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });

    const supabase = createServerClient({ cookies: await cookies() });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: session, error } = await supabase.from('logic_test_v4_sessions').select('*').eq('id', sessionId).eq('user_id', user.id).single();
    if (error || !session || !arDeduktivTestTyp(session.test_type)) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    if (session.completed_at) {
      return NextResponse.json({ message: 'Session already completed', score: session.score, timeSpent: session.time_spent });
    }

    const answers = unikaSvar(session.answers, SVARSNYCKLAR.matris) as unknown as Svar[];
    const score = rattaDeduktivSvar(answers);
    const aktiv = answers.reduce((s, a) => s + (typeof a.time_spent === 'number' ? a.time_spent : 0), 0);
    const timeSpent = aktiv > 0 ? aktiv : Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);

    const { error: updateError } = await testSkrivKlient()
      .from('logic_test_v4_sessions')
      .update({ completed_at: new Date().toISOString(), score, time_spent: timeSpent })
      .eq('id', sessionId)
      .eq('user_id', user.id);
    if (updateError) {
      console.error('Deduktiv: kunde inte avsluta', updateError);
      return NextResponse.json({ error: 'Failed to complete session' }, { status: 500 });
    }
    void markeraTestBricka(user.id, session.test_type);

    // Frågestatistiken, bara för blandade sessioner. Undantagna konton räknas
    // bort i databasfunktionen.
    if (arBlandad(session.meta) && answers.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      void Promise.resolve((getSupabaseAdmin() as any).rpc('uppdatera_fraga_statistik', { p_svar: deduktivStatistik(answers), p_user: user.id }) as Promise<{ error: { message: string } | null }>)
        .then(({ error: e }) => {
          if (e) console.error('Deduktiv: frågestatistiken', e.message);
        })
        .catch(() => {});
    }
    return NextResponse.json({ success: true, score, timeSpent, totalQuestions: answers.length });
  } catch (error) {
    console.error('Deduktiv complete:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
