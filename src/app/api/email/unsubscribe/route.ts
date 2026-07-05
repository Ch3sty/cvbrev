import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { signUnsubscribe, unsubscribeSecret } from '@/lib/email/unsubscribe';

// GET /api/email/unsubscribe?uid=<userId>&sig=<hmac>
// One-click-avregistrering från kvot/påminnelse-mail (lagkrav). Signaturen
// binder länken till användaren utan att kräva inloggning.

export async function GET(request: Request) {
  const url = new URL(request.url);
  const uid = url.searchParams.get('uid');
  const sig = url.searchParams.get('sig');

  const htmlResponse = (title: string, body: string, status = 200) =>
    new NextResponse(
      `<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>` +
        `<body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#F8FAFC">` +
        `<div style="max-width:420px;padding:32px;background:#fff;border-radius:16px;border:1px solid #E2E8F0;text-align:center">` +
        `<h1 style="font-size:18px;color:#0F172A">${title}</h1><p style="color:#475569;font-size:14px">${body}</p>` +
        `<a href="https://www.jobbcoach.ai" style="color:#EA580C;font-size:14px;font-weight:600">Till jobbcoach.ai</a></div></body></html>`,
      { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );

  if (!uid || !sig || !unsubscribeSecret()) {
    return htmlResponse('Ogiltig länk', 'Länken är ofullständig. Kontakta oss om problemet kvarstår.', 400);
  }

  const expected = signUnsubscribe(uid);
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return htmlResponse('Ogiltig länk', 'Länken kunde inte verifieras.', 400);
  }

  // as any: quota_emails_opt_out är nyare än de genererade DB-typerna
  // (samma mönster som cron-routen använder för admin-klienten).
  const { error } = await (getSupabaseAdmin() as any)
    .from('profiles')
    .update({ quota_emails_opt_out: true })
    .eq('id', uid);

  if (error) {
    console.error('unsubscribe update error:', error);
    return htmlResponse('Något gick fel', 'Försök igen om en stund.', 500);
  }

  return htmlResponse(
    'Du är avregistrerad',
    'Vi skickar inga fler påminnelsemail om dina kvoter. Du kan alltid slå på dem igen under Profil.'
  );
}
