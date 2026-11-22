// src/app/api/admin/email/jobbsoket/route.ts
// Mejlet om Jobbsöket (docs/beslut-mejl-och-radering-2026-11-22.md, 1e).
//
// Utskicket sker av sig självt i morgonkörningen på utskicksdagen
// (cron/pricing-sync, steg 0b). Dagen står i src/lib/email/jobbsoketUtskick.ts
// och är null tills ägaren sagt ja. Den här routen är för kontroll och reserv:
//
// GET                              → { dag, kvar, skickade, senasteTest }
// GET ?forhandsvisa=1&brev=0|1     → mejlets HTML för inloggad admin, inget skickas
// POST { mode: 'test' }            → mejlet till inloggad admin, märkt [TEST]
// POST { mode: 'send', confirm }   → manuellt utskick, bara på utskicksdagen

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { requireSuperAdmin } from '@/lib/admin/requireSuperAdmin';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { kampanjHuvuden } from '@/lib/email/campaign-kampanj';
import { genereraJobbsoketMejl } from '@/lib/email/lifecycle/templates/campaign-jobbsoket';
import { JOBBSOKET_UTSKICK, arUtskicksdag, jobbsoketMottagare, skickaJobbsoket } from '@/lib/email/jobbsoketUtskick';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function adminsNamn(admin: any, userId: string): Promise<string | null> {
  const { data } = await admin.from('profiles').select('full_name').eq('id', userId).maybeSingle();
  return (data?.full_name as string | null) ?? null;
}

export async function GET(request: NextRequest) {
  const gate = await requireSuperAdmin();
  if (!gate.ok) return gate.response;
  const admin = getSupabaseAdmin() as any;
  const url = new URL(request.url);

  if (url.searchParams.get('forhandsvisa') === '1') {
    const harBrev = url.searchParams.get('brev') === '1';
    const { html } = genereraJobbsoketMejl({
      userId: gate.userId,
      fullName: await adminsNamn(admin, gate.userId),
      harBrev,
    });
    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  try {
    const { kvar, redan } = await jobbsoketMottagare(admin, new Date());
    const { data: test } = await admin
      .from('email_log')
      .select('sent_at')
      .eq('email_type', 'campaign_test')
      .eq('feature', 'jobbsoket')
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return NextResponse.json({
      dag: JOBBSOKET_UTSKICK.dag,
      kvar: kvar.length,
      skickade: redan,
      senasteTest: test?.sent_at ?? null,
    });
  } catch (error) {
    console.error('[Jobbsöket] status:', error);
    return NextResponse.json({ error: 'Kunde inte hämta status' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireSuperAdmin();
  if (!gate.ok) return gate.response;

  const body = (await request.json().catch(() => ({}))) as { mode?: string; confirm?: boolean };
  const admin = getSupabaseAdmin() as any;

  if (body.mode === 'test') {
    if (!gate.email) return NextResponse.json({ error: 'Ditt konto saknar e-postadress' }, { status: 400 });
    const { subject, html } = genereraJobbsoketMejl({
      userId: gate.userId,
      fullName: await adminsNamn(admin, gate.userId),
      harBrev: false,
    });
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: 'Jobbcoach <noreply@jobbcoach.ai>',
      to: [gate.email],
      subject: `[TEST] ${subject}`,
      html,
      headers: kampanjHuvuden(gate.userId),
    });
    if (error) return NextResponse.json({ error: 'Testutskicket misslyckades' }, { status: 500 });
    await admin.from('email_log').insert({
      resend_id: data?.id ?? null,
      user_id: gate.userId,
      email_type: 'campaign_test',
      feature: 'jobbsoket',
      recipient: gate.email,
      subject: `[TEST] ${subject}`,
    });
    return NextResponse.json({ success: true, mode: 'test', recipient: gate.email });
  }

  if (body.mode === 'send') {
    if (body.confirm !== true) return NextResponse.json({ error: 'Kräver confirm: true' }, { status: 400 });
    if (!arUtskicksdag(new Date())) {
      return NextResponse.json({ error: 'Det är inte utskicksdagen' }, { status: 409 });
    }
    const { kvar } = await jobbsoketMottagare(admin, new Date());
    const resultat = await skickaJobbsoket(admin, kvar);
    return NextResponse.json({ success: true, mode: 'send', ...resultat });
  }

  return NextResponse.json({ error: 'Ogiltigt läge' }, { status: 400 });
}
