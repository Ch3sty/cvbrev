// /api/figurserier/session
// =============================================================================
// Figurseriernas sessioner i logic_test_v4_sessions (beställningen omgång 2,
// A2): test_type figurserier-grund|avancerad|expert, meta med blandade
// alternativ, serie_version och antal. Nivåspärren och dagskvoten sitter här,
// serverside, som för matriserna: grund fri, avancerad och expert kräver
// tests_above_base (testConfig.requiresFeature).
// =============================================================================
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { testSkrivKlient } from '@/lib/tests/skrivKlient';
import { checkTestSessionAccess } from '@/lib/tests/sessionGate';
import { checkDailyTestQuota, quotaExceededBody } from '@/lib/quota/quotaService';
import { signalQuotaWall } from '@/lib/quota/quotaWallSignal';
import { paketKort } from '@/lib/plans/plans';
import { arSerieTestTyp, serieInnehall, SERIE_META } from '@/lib/figurserierV1/fragor.server';

const QUOTA_MESSAGE = `Du har redan gjort det här testet i dag. Ny chans i morgon, eller köp ${paketKort()} för obegränsat.`;

export async function POST(request: Request) {
  try {
    const supabase = createServerClient({ cookies: await cookies() });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => null);
    const testType = body?.test_type;
    if (!arSerieTestTyp(testType)) return NextResponse.json({ error: 'Okänd testtyp' }, { status: 400 });

    const sparr = await checkTestSessionAccess(supabase, user.id, testType);
    if (!sparr.allowed) return NextResponse.json(sparr.body, { status: 402 });

    const quota = await checkDailyTestQuota(supabase, user.id, testType);
    if (!quota.allowed) {
      signalQuotaWall(user.id, `test:${testType}`);
      return NextResponse.json(quotaExceededBody(`test:${testType}`, quota, QUOTA_MESSAGE), { status: 429 });
    }

    const rad = { user_id: user.id, answers: [], test_type: testType };
    const klient = testSkrivKlient();
    let res = await klient.from('logic_test_v4_sessions').insert({ ...rad, meta: SERIE_META }).select('*').single();
    // Saknas meta-kolumnen (migreringen alternativ_blandade inte körd) skapas
    // raden utan meta, och alternativen visas i bankens ordning.
    if (res.error && (res.error.code === 'PGRST204' || res.error.code === '42703')) {
      console.error('[figurserier] logic_test_v4_sessions.meta saknas, sessionen skapas utan meta');
      res = await klient.from('logic_test_v4_sessions').insert(rad).select('*').single();
    }
    if (res.error || !res.data) {
      console.error('Figurserier: kunde inte skapa sessionen', res.error);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }
    return NextResponse.json({ session: res.data });
  } catch (error) {
    console.error('Figurserier session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET ?id=<uuid>: en session med frågorna (och genomgången när den är avslutad).
// GET ?test_type=figurserier-grund: användarens sessioner på testet.
export async function GET(request: Request) {
  try {
    const supabase = createServerClient({ cookies: await cookies() });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (id) {
      const { data: session, error } = await supabase.from('logic_test_v4_sessions').select('*').eq('id', id).eq('user_id', user.id).single();
      if (error || !session || !arSerieTestTyp(session.test_type)) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      return NextResponse.json({ session, ...serieInnehall(session) });
    }
    const testType = url.searchParams.get('test_type');
    if (!arSerieTestTyp(testType)) return NextResponse.json({ error: 'Okänd testtyp' }, { status: 400 });
    const { data: sessions, error } = await supabase
      .from('logic_test_v4_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('test_type', testType)
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Figurserier session GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
