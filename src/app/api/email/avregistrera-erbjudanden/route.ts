import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { signUnsubscribe, unsubscribeSecret } from '@/lib/email/unsubscribe';

// GET  /api/email/avregistrera-erbjudanden?uid=<userId>&sig=<hmac>
// POST samma adress (List-Unsubscribe-Post: List-Unsubscribe=One-Click)
//
// Avregistreringen i kampanjmejlen. Stänger bara erbjudanden och tips
// (profiles.erbjudanden_mejl = false). Kvitton, provdatumspåminnelser och
// kvotmejl styrs av sina egna kolumner och rörs inte.

function verifiera(url: URL): string | null {
  const uid = url.searchParams.get('uid');
  const sig = url.searchParams.get('sig');
  if (!uid || !sig || !unsubscribeSecret()) return null;
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(signUnsubscribe(uid));
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  return uid;
}

async function avregistrera(uid: string): Promise<boolean> {
  const { error } = await (getSupabaseAdmin() as any)
    .from('profiles')
    .update({ erbjudanden_mejl: false, erbjudanden_mejl_at: new Date().toISOString() })
    .eq('id', uid);
  if (error) console.error('avregistrera-erbjudanden:', error.message);
  return !error;
}

const base = () => process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobbcoach.ai';

function sida(rubrik: string, text: string, status = 200, medKnapp = true) {
  const knapp = medKnapp
    ? `<a href="${base()}/dashboard/installningar#mejl" style="display:inline-block;margin-top:8px;padding:12px 18px;border-radius:12px;background:#E07A2F;color:#1A1206;font-weight:600;font-size:14px;text-decoration:none">Till inställningarna</a><br>`
    : '';
  return new NextResponse(
    `<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${rubrik}</title></head>` +
      `<body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#EDE8DF;padding:16px;box-sizing:border-box">` +
      `<div style="max-width:440px;padding:32px;background:#fff;border-radius:16px;border:1px solid #DBD2C4;text-align:center">` +
      `<h1 style="font-size:20px;color:#1C1917;margin:0 0 10px">${rubrik}</h1><p style="color:#57534E;font-size:15px;line-height:1.55;margin:0 0 18px">${text}</p>` +
      knapp +
      `<a href="${base()}" style="display:inline-block;margin-top:14px;color:#A8491A;font-size:14px;font-weight:600">Till startsidan</a></div></body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

export async function GET(request: Request) {
  const uid = verifiera(new URL(request.url));
  if (!uid) return sida('Ogiltig länk', 'Länken kunde inte verifieras. Du kan stänga av erbjudanden under Inställningar i din profil.', 400);
  if (!(await avregistrera(uid))) return sida('Något gick fel', 'Försök igen om en stund.', 500, false);
  return sida(
    'Du är avregistrerad',
    'Du får inga fler erbjudanden eller tips från oss på mejl. Kvitton, påminnelser om ditt provdatum och annat som rör kontot kommer som vanligt. Ångrar du dig? Slå på valet igen under Inställningar i din profil.'
  );
}

/** Ett klick från mejlklientens egen avregistreringsknapp (RFC 8058). */
export async function POST(request: Request) {
  const uid = verifiera(new URL(request.url));
  if (!uid) return NextResponse.json({ error: 'Ogiltig länk' }, { status: 400 });
  const ok = await avregistrera(uid);
  return NextResponse.json({ ok }, { status: ok ? 200 : 500 });
}
