// src/app/api/admin/email/campaign/route.ts
// Kampanjen "Ny funktion: Sökta tjänster".
//
// PENSIONERAT 2026-11-21 (beslut 6 i docs/beslut-jobbsoket-2026-11-21.md):
// POST svarar 410 i alla lägen (test och send) och skickar inget.
// GET  → status: antal mottagare kvar, antal skickade, senaste testutskick.
//
// Utskicket loggades per mottagare i email_log (email_type 'campaign:sokta-tjanster')
// så statistiken på /admin/email (öppningar/klick via Resend-webhooken, join på
// resend_id) fungerar precis som för kvot- och trialmailen.

import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/admin/requireSuperAdmin';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import {
  CAMPAIGN_EMAIL_TYPE,
  CAMPAIGN_TEST_EMAIL_TYPE,
} from '@/lib/email/campaign-sokta-tjanster';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface RecipientRow {
  id: string;
  email: string;
}

const requireAdmin = requireSuperAdmin;

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

export async function POST() {
  // Pensionerat: texten lovar sådant som inte längre stämmer ("Helt gratis,
  // för alla konton", flödesdiagrammet). Varken testutskick eller fullt
  // utskick går att göra. GET ovan står kvar för statistiken.
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  return NextResponse.json(
    { error: 'Mejlet är pensionerat 2026-11-21. Texten stämmer inte längre med produkten.' },
    { status: 410 },
  );
}
