// POST /api/recruiter/interest
// Rekryteraren visar intresse för en kandidat.
//
// Flöde:
//   1. Godkänd rekryterare (401/403 via requireApprovedRecruiter).
//   2. Kandidatens profil måste vara synlig (annars 404).
//   3. Rate limit: max 10 intressen per rullande 24 timmar (429).
//   4. Unique-krock (samma kandidat igen) → returnera befintligt intresse (200).
//   5. Nytt intresse: insert via admin-klienten (INSERT går bara serverside,
//      inga klientpolicies finns), sedan best effort: mail via Resend
//      (respekterar quota_emails_opt_out), email_log och in-app-notis.
//      Ingen av bieffekterna får fälla anropet — intresset är redan sparat.

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireApprovedRecruiter } from '@/lib/recruiter/auth';
import { generateRecruiterInterestEmail } from '@/lib/email/recruiter-interest';

export const dynamic = 'force-dynamic';

const MESSAGE_MAX = 500;
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const gate = await requireApprovedRecruiter();
    if (!gate.ok) return gate.response;
    const { user, recruiter } = gate.ctx;

    let body: { candidateUserId?: string; message?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ogiltig förfrågan' }, { status: 400 });
    }

    const candidateUserId = body.candidateUserId?.trim();
    if (!candidateUserId) {
      return NextResponse.json({ error: 'candidateUserId krävs' }, { status: 400 });
    }
    const message = body.message?.trim() || null;
    if (message && message.length > MESSAGE_MAX) {
      return NextResponse.json(
        { error: `Meddelandet får vara högst ${MESSAGE_MAX} tecken` },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // Kandidaten måste vara synlig i poolen.
    const { data: candidate } = await (admin as any)
      .from('candidate_profiles')
      .select('user_id, visibility')
      .eq('user_id', candidateUserId)
      .neq('visibility', 'off')
      .maybeSingle();
    if (!candidate) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Rate limit: räkna rekryterarens intressen i det rullande 24h-fönstret.
    const windowStart = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
    const { count: recentCount } = await (admin as any)
      .from('candidate_interests')
      .select('id', { count: 'exact', head: true })
      .eq('recruiter_user_id', user.id)
      .gte('created_at', windowStart);

    if ((recentCount ?? 0) >= RATE_LIMIT) {
      return NextResponse.json(
        {
          code: 'rate_limited',
          error: 'Du har nått gränsen på 10 intressen per dygn. Försök igen imorgon.',
        },
        { status: 429 }
      );
    }

    // Insert. Unique(recruiter, candidate) gör dubbletter till en 23505 —
    // då returnerar vi det befintliga intresset i stället för fel.
    const { data: inserted, error: insertError } = await (admin as any)
      .from('candidate_interests')
      .insert({
        recruiter_user_id: user.id,
        candidate_user_id: candidateUserId,
        message,
        status: 'pending',
      })
      .select('id, status, message, created_at, responded_at')
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        const { data: existing } = await (admin as any)
          .from('candidate_interests')
          .select('id, status, message, created_at, responded_at')
          .eq('recruiter_user_id', user.id)
          .eq('candidate_user_id', candidateUserId)
          .maybeSingle();
        return NextResponse.json({ interest: existing, existing: true });
      }
      console.error('Recruiter interest: insert misslyckades', insertError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const companyName = recruiter.company_name || 'Ett företag';

    // --- Bieffekter, best effort: får aldrig fälla anropet -----------------

    // (b) + (c) Mail till kandidaten via Resend + logg i email_log.
    try {
      const { data: profile } = await (admin as any)
        .from('profiles')
        .select('email, quota_emails_opt_out')
        .eq('id', candidateUserId)
        .maybeSingle();

      if (profile?.email && !profile.quota_emails_opt_out) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { subject, html } = generateRecruiterInterestEmail(
          candidateUserId,
          companyName
        );
        const { data: sendData, error: sendError } = await resend.emails.send({
          from: 'Jobbcoach.ai <noreply@jobbcoach.ai>',
          to: [profile.email],
          subject,
          html,
          tags: [{ name: 'type', value: 'recruiter_interest' }],
        });
        if (sendError) {
          console.error('Recruiter interest: mail misslyckades', sendError);
        } else {
          await (admin as any).from('email_log').insert({
            resend_id: sendData?.id ?? null,
            user_id: candidateUserId,
            email_type: 'recruiter_interest',
            recipient: profile.email,
            subject,
          });
        }
      }
    } catch (emailError) {
      console.error('Recruiter interest: mailflödet misslyckades', emailError);
    }

    // (d) In-app-notis, samma mönster som trial/auto-activate.
    try {
      const { error: notifError } = await (admin as any)
        .from('notifications')
        .insert({
          user_id: candidateUserId,
          type: 'recruiter_interest',
          title: 'En rekryterare vill komma i kontakt',
          message: `${companyName} har visat intresse för din profil.`,
          action_url: '/dashboard/meddelanden',
          metadata: { interest_id: inserted.id },
        });
      if (notifError) {
        console.warn('Recruiter interest: notis misslyckades (icke-kritiskt)', notifError);
      }
    } catch (notifError) {
      console.warn('Recruiter interest: notis misslyckades (icke-kritiskt)', notifError);
    }

    return NextResponse.json({ interest: inserted, existing: false });
  } catch (error) {
    console.error('Recruiter interest error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
