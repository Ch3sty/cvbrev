import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { signUnsubscribe, unsubscribeSecret } from '@/lib/email/unsubscribe';

// GET /api/email/unsubscribe-digest?uid=<userId>&sig=<hmac>
//
// Avregistrering som BARA stänger veckosammanfattningen
// (docs/plan-inloggat-omdesign.md, avsnitt 8). Den som vill slippa veckobrevet
// men behålla kvotpåminnelser och trial-mail ska inte tvingas välja bort allt,
// och den som klickar här ska inte tappa mail hon faktiskt vill ha.
//
// Samma HMAC-signatur som den globala routen, så länken fungerar utan
// inloggning. Skriver profiles.weekly_digest_opt_out, aldrig
// quota_emails_opt_out.

export async function GET(request: Request) {
  const url = new URL(request.url);
  const uid = url.searchParams.get('uid');
  const sig = url.searchParams.get('sig');

  const htmlResponse = (title: string, body: string, status = 200) =>
    new NextResponse(
      `<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>` +
        `<body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100dvh;margin:0;background:#F8FAFC">` +
        `<div style="max-width:420px;padding:32px;background:#fff;border-radius:12px;border:1px solid #E2E8F0;text-align:center">` +
        `<h1 style="font-size:18px;color:#0F172A">${title}</h1><p style="color:#475569;font-size:14px;line-height:1.6">${body}</p>` +
        `<a href="https://www.jobbcoach.ai/dashboard/profil" style="color:#EA580C;font-size:14px;font-weight:600">Till dina inställningar</a></div></body></html>`,
      { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );

  if (!uid || !sig || !unsubscribeSecret()) {
    return htmlResponse(
      'Ogiltig länk',
      'Länken är ofullständig. Du kan stänga av veckosammanfattningen under Profil när du är inloggad.',
      400
    );
  }

  const expected = signUnsubscribe(uid);
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return htmlResponse('Ogiltig länk', 'Länken kunde inte verifieras.', 400);
  }

  const { error } = await (getSupabaseAdmin() as any)
    .from('profiles')
    .update({ weekly_digest_opt_out: true })
    .eq('id', uid);

  if (error) {
    console.error('unsubscribe-digest update error:', error);
    return htmlResponse('Något gick fel', 'Försök igen om en stund.', 500);
  }

  return htmlResponse(
    'Veckosammanfattningen är avstängd',
    'Vi skickar inga fler veckobrev. Övriga mail om ditt konto berörs inte, och du kan slå på sammanfattningen igen under Profil.'
  );
}
