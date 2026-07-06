import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

// POST /api/webhooks/resend
// Tar emot leverans/öppning/klick-händelser från Resend och lagrar dem i
// email_events för admin-statistiken (/admin/email).
//
// Aktivering (engångssteg i Resend-dashboarden):
// 1. Webhooks → Add webhook → URL: https://www.jobbcoach.ai/api/webhooks/resend
//    Events: email.delivered, email.opened, email.clicked, email.bounced,
//    email.complained, email.delivery_delayed
// 2. Kopiera webhook-hemligheten (whsec_...) till env-variabeln
//    RESEND_WEBHOOK_SECRET i Vercel.
// 3. Slå på "Open tracking" och "Click tracking" för domänen under
//    Domains → jobbcoach.ai, annars skickas aldrig opened/clicked-events.
//
// Signaturverifiering enligt Svix (som Resend använder): HMAC-SHA256 över
// "<svix-id>.<svix-timestamp>.<body>" med base64-avkodad hemlighet.

function verifySvixSignature(
  secret: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  body: string
): boolean {
  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const signedContent = `${svixId}.${svixTimestamp}.${body}`;
  const expected = crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64');

  // Headern kan innehålla flera space-separerade signaturer: "v1,<base64> v1,<base64>"
  return svixSignature.split(' ').some((part) => {
    const sig = part.split(',')[1];
    if (!sig) return false;
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });
}

export async function POST(request: Request) {
  try {
    const secret = process.env.RESEND_WEBHOOK_SECRET;
    if (!secret) {
      // Fail closed: utan hemlighet kan vi inte lita på avsändaren.
      console.error('[Resend Webhook] RESEND_WEBHOOK_SECRET saknas i miljön');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
    }

    const svixId = request.headers.get('svix-id');
    const svixTimestamp = request.headers.get('svix-timestamp');
    const svixSignature = request.headers.get('svix-signature');
    const body = await request.text();

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json({ error: 'Missing signature headers' }, { status: 400 });
    }

    // Avvisa gamla anrop (replay-skydd, 5 min tolerans)
    const timestampMs = Number(svixTimestamp) * 1000;
    if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > 5 * 60 * 1000) {
      return NextResponse.json({ error: 'Timestamp out of tolerance' }, { status: 400 });
    }

    if (!verifySvixSignature(secret, svixId, svixTimestamp, svixSignature, body)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const eventType = typeof event?.type === 'string'
      ? event.type.replace(/^email\./, '')
      : 'unknown';
    const data = event?.data ?? {};

    const { error } = await (getSupabaseAdmin() as any).from('email_events').insert({
      resend_id: data.email_id ?? null,
      event_type: eventType,
      link_url: data?.click?.link ?? null,
      payload: {
        to: data.to ?? null,
        subject: data.subject ?? null,
        tags: data.tags ?? null,
        created_at: event.created_at ?? null,
      },
    });

    if (error) {
      console.error('[Resend Webhook] Insert error:', error);
      return NextResponse.json({ error: 'Storage failed' }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Resend Webhook] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
