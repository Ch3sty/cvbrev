// src/app/api/admin/email/kampanj/route.ts
// Kampanjmejlen för Black Week och Cyber Monday (lib/kampanj).
//
// Utskicket sker av sig självt i morgonkörningen på kampanjens första dag
// (cron/pricing-sync, steg 0). Den här routen är för kontroll och reserv:
//
// GET                                          → mottagare kvar och skickade per kampanj
// POST { mode: 'test', kampanj }               → mejlet till inloggad admin, märkt [TEST]
// POST { mode: 'send', kampanj, confirm:true } → manuellt utskick, bara medan kampanjen pågår

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { requireSuperAdmin } from '@/lib/admin/requireSuperAdmin';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { KAMPANJER, KAMPANJ_BY_NYCKEL, aktivKampanj, isKampanjNyckel, kampanjNu } from '@/lib/kampanj/kampanj';
import { genereraKampanjMejl, kampanjHuvuden, kampanjMejlTyp } from '@/lib/email/campaign-kampanj';
import { kampanjMottagare, skickaKampanj } from '@/lib/email/kampanjUtskick';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  const gate = await requireSuperAdmin();
  if (!gate.ok) return gate.response;
  const admin = getSupabaseAdmin() as any;
  try {
    const status = await Promise.all(
      KAMPANJER.map(async (k) => {
        const { kvar, redan } = await kampanjMottagare(admin, k);
        return { kampanj: k.nyckel, start: k.start, kvar: kvar.length, skickade: redan };
      })
    );
    return NextResponse.json({ success: true, data: status });
  } catch (error) {
    console.error('[Kampanj] status:', error);
    return NextResponse.json({ error: 'Kunde inte hämta status' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireSuperAdmin();
  if (!gate.ok) return gate.response;

  const body = (await request.json().catch(() => ({}))) as { mode?: string; kampanj?: unknown; confirm?: boolean };
  if (!isKampanjNyckel(body.kampanj)) {
    return NextResponse.json({ error: 'Okänd kampanj' }, { status: 400 });
  }
  const k = KAMPANJ_BY_NYCKEL[body.kampanj];
  const admin = getSupabaseAdmin() as any;

  if (body.mode === 'test') {
    if (!gate.email) return NextResponse.json({ error: 'Ditt konto saknar e-postadress' }, { status: 400 });
    const { subject, html } = genereraKampanjMejl(k.nyckel, gate.userId);
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
      feature: k.nyckel,
      recipient: gate.email,
      subject: `[TEST] ${subject}`,
    });
    return NextResponse.json({ success: true, mode: 'test', recipient: gate.email, typ: kampanjMejlTyp(k.nyckel) });
  }

  if (body.mode === 'send') {
    if (body.confirm !== true) return NextResponse.json({ error: 'Kräver confirm: true' }, { status: 400 });
    if (aktivKampanj(kampanjNu())?.nyckel !== k.nyckel) {
      return NextResponse.json({ error: 'Kampanjen pågår inte just nu' }, { status: 409 });
    }
    const { kvar } = await kampanjMottagare(admin, k);
    const resultat = await skickaKampanj(admin, k, kvar);
    return NextResponse.json({ success: true, mode: 'send', ...resultat });
  }

  return NextResponse.json({ error: 'Ogiltigt läge' }, { status: 400 });
}
