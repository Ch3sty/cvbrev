// src/app/api/admin/email/campaign/route.ts
// Kampanjen "Ny funktion: Sökta tjänster".
//
// GET  → status: antal mottagare kvar, antal skickade, senaste testutskick.
// POST { mode: 'test' }               → skickar mailet ENDAST till inloggad admin.
// POST { mode: 'send', confirm:true } → skickar till alla användare med e-post
//                                       som inte avregistrerat sig.
//
// Utskicket loggas per mottagare i email_log (email_type 'campaign:sokta-tjanster')
// så statistiken på /admin/email (öppningar/klick via Resend-webhooken, join på
// resend_id) fungerar precis som för kvot- och trialmailen. Redan loggade
// mottagare hoppas över, så ett avbrutet utskick kan köras om utan dubbletter.

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Resend } from 'resend';
import { createServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import {
  generateSoktaTjansterCampaignEmail,
  CAMPAIGN_EMAIL_TYPE,
  CAMPAIGN_TEST_EMAIL_TYPE,
} from '@/lib/email/campaign-sokta-tjanster';

export const dynamic = 'force-dynamic';
// Fullt utskick sker i batchar om 100 med paus emellan; ge routen gott om tid.
export const maxDuration = 300;

const FROM = 'Jobbcoach.ai <noreply@jobbcoach.ai>';
const BATCH_SIZE = 100;
const BATCH_PAUSE_MS = 700; // Resend tillåter ~2 anrop/sekund

interface RecipientRow {
  id: string;
  email: string;
}

async function requireAdmin(): Promise<
  | { ok: true; userId: string; email: string | null }
  | { ok: false; response: NextResponse }
> {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .single();
  if (!adminUser) {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { ok: true, userId: user.id, email: user.email ?? null };
}

/** Alla mottagare med e-post som inte avregistrerat sig. */
async function fetchEligibleRecipients(admin: ReturnType<typeof getSupabaseAdmin>): Promise<RecipientRow[]> {
  const { data, error } = await (admin as any)
    .from('profiles')
    .select('id, email')
    .not('email', 'is', null)
    .or('quota_emails_opt_out.is.null,quota_emails_opt_out.eq.false');
  if (error) throw error;
  return (data ?? []).filter((row: RecipientRow) => row.email && row.email.includes('@'));
}

/** user_id för alla som redan fått kampanjen. */
async function fetchAlreadySent(admin: ReturnType<typeof getSupabaseAdmin>): Promise<Set<string>> {
  const { data, error } = await (admin as any)
    .from('email_log')
    .select('user_id')
    .eq('email_type', CAMPAIGN_EMAIL_TYPE);
  if (error) throw error;
  return new Set((data ?? []).map((row: { user_id: string }) => row.user_id));
}

export async function GET() {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;

    const admin = getSupabaseAdmin();
    const [recipients, alreadySent] = await Promise.all([
      fetchEligibleRecipients(admin),
      fetchAlreadySent(admin),
    ]);

    const { data: lastTest } = await (admin as any)
      .from('email_log')
      .select('sent_at, recipient')
      .eq('email_type', CAMPAIGN_TEST_EMAIL_TYPE)
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      data: {
        eligibleCount: recipients.length,
        sentCount: alreadySent.size,
        remainingCount: recipients.filter((r) => !alreadySent.has(r.id)).length,
        lastTest: lastTest ?? null,
      },
    });
  } catch (error) {
    console.error('[Kampanj] Statusfel:', error);
    return NextResponse.json({ error: 'Kunde inte hämta kampanjstatus' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;

    let body: { mode?: string; confirm?: boolean };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ogiltig förfrågan' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const resend = new Resend(process.env.RESEND_API_KEY);

    // ============ TESTLÄGE: endast till inloggad admin ============
    if (body.mode === 'test') {
      if (!gate.email) {
        return NextResponse.json({ error: 'Ditt konto saknar e-postadress' }, { status: 400 });
      }
      const { subject, html } = generateSoktaTjansterCampaignEmail(gate.userId);
      const { data: sendData, error: sendError } = await resend.emails.send({
        from: FROM,
        to: [gate.email],
        subject: `[TEST] ${subject}`,
        html,
      });
      if (sendError) {
        console.error('[Kampanj] Testutskick misslyckades:', sendError);
        return NextResponse.json({ error: 'Testutskicket misslyckades' }, { status: 500 });
      }
      await (admin as any).from('email_log').insert({
        resend_id: sendData?.id ?? null,
        user_id: gate.userId,
        email_type: CAMPAIGN_TEST_EMAIL_TYPE,
        feature: 'sokta-tjanster',
        recipient: gate.email,
        subject: `[TEST] ${subject}`,
      });
      return NextResponse.json({ success: true, mode: 'test', recipient: gate.email });
    }

    // ============ FULLT UTSKICK ============
    if (body.mode !== 'send') {
      return NextResponse.json({ error: 'Ogiltigt läge' }, { status: 400 });
    }
    if (body.confirm !== true) {
      return NextResponse.json({ error: 'Utskick till alla kräver confirm: true' }, { status: 400 });
    }

    const [recipients, alreadySent] = await Promise.all([
      fetchEligibleRecipients(admin),
      fetchAlreadySent(admin),
    ]);
    const pending = recipients.filter((r) => !alreadySent.has(r.id));

    if (pending.length === 0) {
      return NextResponse.json({ success: true, mode: 'send', sent: 0, skipped: alreadySent.size });
    }

    let sent = 0;
    let failed = 0;

    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      const chunk = pending.slice(i, i + BATCH_SIZE);

      const payload = chunk.map((recipient) => {
        const { subject, html } = generateSoktaTjansterCampaignEmail(recipient.id);
        return { from: FROM, to: [recipient.email], subject, html };
      });

      const { data: batchData, error: batchError } = await resend.batch.send(payload);

      if (batchError) {
        // Hela batchen misslyckades: logga inget så omkörning tar dem igen.
        console.error('[Kampanj] Batch misslyckades:', batchError);
        failed += chunk.length;
      } else {
        const ids = (batchData as any)?.data ?? [];
        const logRows = chunk.map((recipient, index) => ({
          resend_id: ids[index]?.id ?? null,
          user_id: recipient.id,
          email_type: CAMPAIGN_EMAIL_TYPE,
          feature: 'sokta-tjanster',
          recipient: recipient.email,
          subject: 'Nyhet: håll koll på alla jobb du sökt',
        }));
        const { error: logError } = await (admin as any).from('email_log').insert(logRows);
        if (logError) {
          console.error('[Kampanj] Kunde inte logga batch:', logError);
        }
        sent += chunk.length;
      }

      if (i + BATCH_SIZE < pending.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_PAUSE_MS));
      }
    }

    console.log(`[Kampanj] sokta-tjanster: sent=${sent} failed=${failed} skipped=${alreadySent.size}`);
    return NextResponse.json({
      success: true,
      mode: 'send',
      sent,
      failed,
      skipped: alreadySent.size,
    });
  } catch (error) {
    console.error('[Kampanj] Fel:', error);
    return NextResponse.json({ error: 'Serverfel vid utskick' }, { status: 500 });
  }
}
