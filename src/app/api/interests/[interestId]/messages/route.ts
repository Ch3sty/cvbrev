// /api/interests/[interestId]/messages
// Delad meddelandetråd för ett accepterat intresse. Både kandidat och
// rekryterare når den; rollen härleds ur inloggningen mot intressets parter.
//
// GET  → trådens meddelanden (äldst först).
// POST → nytt meddelande. Notis + "du har ett nytt svar"-mail till motparten
//        (aldrig meddelandet i klartext i mailet, det drar tillbaka folk till
//        appen). Skrivning sker via admin-klienten; RLS på interest_messages
//        tillåter bara läsning för parterna.
//
// Trådar öppnas ENDAST när intresset är accepterat (spegling av
// kontaktupplåsningen). Innan dess finns ingen kontakt att bygga på.

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Resend } from 'resend';
import { createServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { generateInterestMessageEmail } from '@/lib/email/interest-message';

export const dynamic = 'force-dynamic';

const BODY_MAX = 4000;

interface InterestParties {
  id: string;
  candidate_user_id: string;
  recruiter_user_id: string;
  status: string;
}

/** Hämtar intresset och avgör den inloggades roll, eller null om ej part. */
async function resolveParticipant(
  admin: ReturnType<typeof getSupabaseAdmin>,
  interestId: string,
  userId: string
): Promise<{ interest: InterestParties; role: 'candidate' | 'recruiter' } | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin as any)
    .from('candidate_interests')
    .select('id, candidate_user_id, recruiter_user_id, status')
    .eq('id', interestId)
    .maybeSingle();
  if (!data) return null;
  const interest = data as InterestParties;
  if (interest.candidate_user_id === userId) return { interest, role: 'candidate' };
  if (interest.recruiter_user_id === userId) return { interest, role: 'recruiter' };
  return null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ interestId: string }> }
) {
  try {
    const { interestId } = await params;
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = getSupabaseAdmin();
    const participant = await resolveParticipant(admin, interestId, user.id);
    if (!participant) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (admin as any)
      .from('interest_messages')
      .select('id, sender_role, body, created_at')
      .eq('interest_id', interestId)
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Interest messages: läsfel', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const messages = (data ?? []).map(
      (m: { id: string; sender_role: string; body: string; created_at: string }) => ({
        id: m.id,
        senderRole: m.sender_role,
        body: m.body,
        createdAt: m.created_at,
        mine: m.sender_role === participant.role,
      })
    );

    // Motpartens läsmarkör så klienten kan visa "Läst" på mina meddelanden.
    const otherUserId =
      participant.role === 'candidate'
        ? participant.interest.recruiter_user_id
        : participant.interest.candidate_user_id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: otherRead } = await (admin as any)
      .from('interest_thread_reads')
      .select('last_read_at')
      .eq('interest_id', interestId)
      .eq('user_id', otherUserId)
      .maybeSingle();
    const theirLastReadAt: string | null = otherRead?.last_read_at ?? null;

    // Att öppna tråden = allt läst. Stämpla min egen läsmarkör (best effort).
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any).from('interest_thread_reads').upsert(
        { interest_id: interestId, user_id: user.id, last_read_at: new Date().toISOString() },
        { onConflict: 'interest_id,user_id' }
      );
    } catch (readError) {
      console.error('Interest messages: läsmarkör misslyckades', readError);
    }

    return NextResponse.json({ messages, role: participant.role, theirLastReadAt });
  } catch (error) {
    console.error('Interest messages GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ interestId: string }> }
) {
  try {
    const { interestId } = await params;
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload: { body?: unknown };
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ogiltig förfrågan' }, { status: 400 });
    }
    const body = typeof payload.body === 'string' ? payload.body.trim() : '';
    if (!body) {
      return NextResponse.json({ error: 'Meddelandet är tomt' }, { status: 400 });
    }
    if (body.length > BODY_MAX) {
      return NextResponse.json(
        { error: `Meddelandet får vara högst ${BODY_MAX} tecken` },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();
    const participant = await resolveParticipant(admin, interestId, user.id);
    if (!participant) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    // Tråden öppnas först när kandidaten accepterat kontakten.
    if (participant.interest.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Tråden öppnas när kandidaten har accepterat kontakten' },
        { status: 409 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: inserted, error: insertError } = await (admin as any)
      .from('interest_messages')
      .insert({
        interest_id: interestId,
        sender_user_id: user.id,
        sender_role: participant.role,
        body,
      })
      .select('id, sender_role, body, created_at')
      .single();
    if (insertError) {
      console.error('Interest messages: insert misslyckades', insertError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // --- Bieffekter (best effort): notis + mail till MOTPARTEN --------------
    const recipientId =
      participant.role === 'candidate'
        ? participant.interest.recruiter_user_id
        : participant.interest.candidate_user_id;
    const recipientIsRecruiter = participant.role === 'candidate';

    try {
      // Avsändarens visningsnamn: rekryteraren visas som företaget, kandidaten
      // som sitt namn (kontakten är redan upplåst vid accept).
      let senderLabel = 'Någon';
      if (participant.role === 'recruiter') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: rp } = await (admin as any)
          .from('recruiter_profiles')
          .select('company_name')
          .eq('user_id', user.id)
          .maybeSingle();
        senderLabel = rp?.company_name || 'En rekryterare';
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: pr } = await (admin as any)
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();
        senderLabel = pr?.full_name || 'Kandidaten';
      }

      // Notisklockan (kandidatsidan) sköter HÄNDELSER, inte pågående trådar.
      // Nya meddelanden räknas i stället på meddelande-ikonen i headern, så vi
      // undviker dubbla signaler för samma sak. Rekryteraren saknar klocka och
      // förlitar sig på notisen till sin inbox, så den behålls åt det hållet.
      if (recipientIsRecruiter) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (admin as any).from('notifications').insert({
          user_id: recipientId,
          type: 'interest_message',
          title: 'Nytt meddelande',
          message: `${senderLabel} har skickat ett meddelande.`,
          action_url: '/rekryterare/inbox',
          metadata: { interest_id: interestId },
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: recipientProfile } = await (admin as any)
        .from('profiles')
        .select('email, quota_emails_opt_out')
        .eq('id', recipientId)
        .maybeSingle();

      if (recipientProfile?.email && !recipientProfile.quota_emails_opt_out) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { subject, html } = generateInterestMessageEmail({
          senderLabel,
          recipientIsRecruiter,
        });
        const { data: sendData, error: sendError } = await resend.emails.send({
          from: 'Jobbcoach.ai <noreply@jobbcoach.ai>',
          to: [recipientProfile.email],
          subject,
          html,
          tags: [{ name: 'type', value: 'interest_message' }],
        });
        if (!sendError) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (admin as any).from('email_log').insert({
            resend_id: sendData?.id ?? null,
            user_id: recipientId,
            email_type: 'interest_message',
            recipient: recipientProfile.email,
            subject,
          });
        }
      }
    } catch (sideEffectError) {
      console.error('Interest messages: notis/mail misslyckades', sideEffectError);
    }

    return NextResponse.json({
      message: {
        id: inserted.id,
        senderRole: inserted.sender_role,
        body: inserted.body,
        createdAt: inserted.created_at,
        mine: true,
      },
    });
  } catch (error) {
    console.error('Interest messages POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
