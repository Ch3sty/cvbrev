// /api/steg2/[kind]/session
// =============================================================================
// Nivåtestens sessioner för testplanens steg 2 (talserier, spatial förmåga,
// ordförråd) i logic_test_v4_sessions: test_type = slugen, meta ur motorn.
// Samma spärrar som deduktivt: grund fri, avancerad och expert kräver
// tests_above_base (testConfig.requiresFeature), dagskvoten i quotaService,
// och typen syns först när motor och vy är klara (steg2Status).
// =============================================================================
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { testSkrivKlient } from '@/lib/tests/skrivKlient';
import { checkTestSessionAccess } from '@/lib/tests/sessionGate';
import { checkDailyTestQuota, quotaExceededBody } from '@/lib/quota/quotaService';
import { signalQuotaWall } from '@/lib/quota/quotaWallSignal';
import { paketKort } from '@/lib/plans/plans';
import { steg2Motor } from '@/lib/tester/steg2/motor.server';
import { steg2Synlig } from '@/lib/tester/steg2Status';

const QUOTA_MESSAGE = `Du har redan gjort det här testet i dag. Ny chans i morgon, eller köp ${paketKort()} för obegränsat.`;

type Ctx = { params: Promise<{ kind: string }> };

async function motorFor(ctx: Ctx) {
  const { kind } = await ctx.params;
  const m = steg2Motor(kind);
  return m && steg2Synlig(m.kind) ? m : null;
}

export async function POST(request: Request, ctx: Ctx) {
  try {
    const motor = await motorFor(ctx);
    if (!motor) return NextResponse.json({ error: 'Okänd testtyp' }, { status: 404 });
    const supabase = createServerClient({ cookies: await cookies() });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => null);
    const testType = body?.test_type;
    if (!motor.arTestTyp(testType)) return NextResponse.json({ error: 'Okänd testtyp' }, { status: 400 });

    const sparr = await checkTestSessionAccess(supabase, user.id, testType);
    if (!sparr.allowed) return NextResponse.json(sparr.body, { status: 402 });

    const quota = await checkDailyTestQuota(supabase, user.id, testType);
    if (!quota.allowed) {
      signalQuotaWall(user.id, `test:${testType}`);
      return NextResponse.json(quotaExceededBody(`test:${testType}`, quota, QUOTA_MESSAGE), { status: 429 });
    }

    const { data, error } = await testSkrivKlient()
      .from('logic_test_v4_sessions')
      .insert({ user_id: user.id, answers: [], test_type: testType, meta: motor.meta(testType) })
      .select('*')
      .single();
    if (error || !data) {
      console.error(`[steg2 ${motor.kind}] kunde inte skapa sessionen`, error);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }
    return NextResponse.json({ session: data });
  } catch (error) {
    console.error('Steg 2 session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET ?id=<uuid>: en session med uppgifterna (och genomgången när den är avslutad).
// GET ?test_type=<slug>: användarens sessioner på testet.
export async function GET(request: Request, ctx: Ctx) {
  try {
    const motor = await motorFor(ctx);
    if (!motor) return NextResponse.json({ error: 'Okänd testtyp' }, { status: 404 });
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
      if (error || !session || !motor.arTestTyp(session.test_type)) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      return NextResponse.json({ session, ...motor.innehall(session) });
    }
    const testType = url.searchParams.get('test_type');
    if (!motor.arTestTyp(testType)) return NextResponse.json({ error: 'Okänd testtyp' }, { status: 400 });
    const { data: sessions, error } = await supabase
      .from('logic_test_v4_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('test_type', testType)
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Steg 2 session GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
