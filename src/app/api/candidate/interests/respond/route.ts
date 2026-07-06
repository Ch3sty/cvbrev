import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Resend } from 'resend';
import { createServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { generateInterestResponseEmail } from '@/lib/email/interest-response';

// POST /api/candidate/interests/respond
// Body: { interestId: string, action: 'accept' | 'decline' }
//
// Kandidatens svar på en intresseanmälan. RLS tillåter inte kandidaten att
// uppdatera candidate_interests direkt — uppdateringen görs serverside med
// admin-klienten efter att vi verifierat att intresset tillhör den inloggade
// användaren som kandidat och fortfarande är 'pending'.
//
// Vid svar notifieras rekryteraren (in-app-notis + mail, best effort) så att
// loopen sluts åt båda håll. Vid accept öppnas meddelandetråden.

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { interestId?: unknown; action?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ogiltig request-body' }, { status: 400 });
    }

    const interestId = typeof body.interestId === 'string' ? body.interestId : null;
    const action = body.action === 'accept' || body.action === 'decline' ? body.action : null;

    if (!interestId || !action) {
      return NextResponse.json(
        { error: 'interestId och action (accept/decline) krävs' },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // Validera: intresset finns, tillhör användaren som kandidat, är pending.
    // Tabellen saknas i genererade DB-typer, därav as any.
    const { data: interest, error: fetchError } = await (admin as any)
      .from('candidate_interests')
      .select('id, recruiter_user_id, candidate_user_id, status')
      .eq('id', interestId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching interest:', fetchError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    if (!interest || interest.candidate_user_id !== user.id) {
      return NextResponse.json({ error: 'Intresset hittades inte' }, { status: 404 });
    }
    if (interest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Intresset är redan besvarat' },
        { status: 409 }
      );
    }

    const newStatus = action === 'accept' ? 'accepted' : 'declined';
    const respondedAt = new Date().toISOString();

    const { error: updateError } = await (admin as any)
      .from('candidate_interests')
      .update({ status: newStatus, responded_at: respondedAt })
      .eq('id', interestId)
      .eq('status', 'pending'); // skydd mot dubbelklick/race

    if (updateError) {
      console.error('Error updating interest:', updateError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // Vid accept: skicka med företagsnamnet så UI:t kan bekräfta vem som
    // nu får kandidatens namn och e-post.
    let companyName: string | null = null;
    if (action === 'accept') {
      const { data: recruiter } = await (admin as any)
        .from('recruiter_profiles')
        .select('company_name')
        .eq('user_id', interest.recruiter_user_id)
        .maybeSingle();
      companyName = recruiter?.company_name ?? null;
    }

    // --- Notifiera rekryteraren (best effort, får aldrig fälla anropet) -----
    try {
      const accepted = action === 'accept';
      const { data: candidateProfile } = await (admin as any)
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();
      // Namnet delas bara vid accept (spegling av kontaktupplåsningen).
      const candidateName = accepted
        ? candidateProfile?.full_name || 'En kandidat'
        : 'En kandidat';

      await (admin as any).from('notifications').insert({
        user_id: interest.recruiter_user_id,
        type: 'interest_response',
        title: accepted ? 'En kandidat tackade ja' : 'En kandidat tackade nej',
        message: accepted
          ? `${candidateName} accepterade er kontakt. Ni kan ta dialogen nu.`
          : 'En kandidat avböjde er intresseförfrågan.',
        action_url: '/rekryterare/inbox',
        metadata: { interest_id: interestId, status: newStatus },
      });

      const { data: recruiterProfile } = await (admin as any)
        .from('profiles')
        .select('email, quota_emails_opt_out')
        .eq('id', interest.recruiter_user_id)
        .maybeSingle();

      if (recruiterProfile?.email && !recruiterProfile.quota_emails_opt_out) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { subject, html } = generateInterestResponseEmail({
          accepted,
          candidateName,
        });
        const { data: sendData, error: sendError } = await resend.emails.send({
          from: 'Jobbcoach.ai <noreply@jobbcoach.ai>',
          to: [recruiterProfile.email],
          subject,
          html,
          tags: [{ name: 'type', value: 'interest_response' }],
        });
        if (!sendError) {
          await (admin as any).from('email_log').insert({
            resend_id: sendData?.id ?? null,
            user_id: interest.recruiter_user_id,
            email_type: 'interest_response',
            recipient: recruiterProfile.email,
            subject,
          });
        }
      }
    } catch (sideEffectError) {
      console.error('Interest respond: notis/mail till rekryteraren misslyckades', sideEffectError);
    }

    return NextResponse.json({
      ok: true,
      status: newStatus,
      respondedAt,
      ...(action === 'accept' ? { companyName } : {}),
    });
  } catch (error) {
    console.error('Candidate interest respond error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
