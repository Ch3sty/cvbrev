// src/app/api/applications/[id]/events/route.ts
// Sökta tjänster: lägg till en händelse i en ansökans tidslinje.
// current_status på ansökan räknas om av databastriggern.

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

const VALID_EVENT_TYPES = [
  'applied', 'no_response', 'rejected', 'interview_invited', 'interview_completed',
  'trial_work_completed', 'offer_received', 'accepted', 'declined',
];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    // Ansökan måste tillhöra användaren.
    const { data: application } = await supabase
      .from('job_applications')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();
    if (!application) {
      return NextResponse.json({ error: 'Ansökan hittades inte' }, { status: 404 });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ogiltig förfrågan' }, { status: 400 });
    }

    const eventType = typeof body.event_type === 'string' ? body.event_type : '';
    if (!VALID_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json({ error: 'Ogiltig händelsetyp' }, { status: 400 });
    }

    const note = typeof body.note === 'string' ? body.note.trim().slice(0, 2000) || null : null;

    let occurredAt = new Date().toISOString().slice(0, 10);
    if (typeof body.occurred_at === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.occurred_at)) {
      occurredAt = body.occurred_at;
    }

    // Intervjuomgång: numreras automatiskt om den inte skickas med, så
    // "Genomfört intervju" kan loggas flera gånger utan tak (Intervju 1, 2, 3...).
    let interviewRound: number | null = null;
    if (eventType === 'interview_completed' || eventType === 'interview_invited') {
      if (typeof body.interview_round === 'number' && body.interview_round >= 1 && body.interview_round <= 10) {
        interviewRound = Math.floor(body.interview_round);
      } else if (eventType === 'interview_completed') {
        const { count } = await supabase
          .from('job_application_events')
          .select('id', { count: 'exact', head: true })
          .eq('application_id', id)
          .eq('event_type', 'interview_completed');
        interviewRound = Math.min((count ?? 0) + 1, 10);
      }
    }

    const { data: created, error } = await supabase
      .from('job_application_events')
      .insert({
        application_id: id,
        event_type: eventType,
        interview_round: interviewRound,
        note,
        occurred_at: occurredAt,
      })
      .select()
      .single();

    if (error || !created) {
      console.error('Fel vid skapande av händelse:', error);
      return NextResponse.json({ error: 'Kunde inte spara händelsen' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error('Händelseskapande error:', error);
    return NextResponse.json({ error: 'Serverfel vid skapande av händelse' }, { status: 500 });
  }
}
