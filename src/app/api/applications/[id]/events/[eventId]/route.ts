// src/app/api/applications/[id]/events/[eventId]/route.ts
// Sökta tjänster: rätta eller ta bort en händelse (användaren kan alltid backa).
// current_status räknas om av databastriggern vid både UPDATE och DELETE.

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { handelseForeSokt, valideraIntervjutid } from '@/lib/jobbsok/validering';
import { arSchemaFel } from '@/lib/jobbsok/schema';
import { matIntervjutid } from '@/lib/jobbsok/intervjuServer';

async function requireOwnedApplication(
  supabase: ReturnType<typeof createServerClient>,
  applicationId: string,
  userId: string
) {
  const { data } = await supabase
    .from('job_applications')
    .select('id, applied_at')
    .eq('id', applicationId)
    .eq('user_id', userId)
    .maybeSingle();
  return data as { id: string; applied_at: string | null } | null;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const { id, eventId } = await params;
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }
    const ansokan = await requireOwnedApplication(supabase, id, user.id);
    if (!ansokan) {
      return NextResponse.json({ error: 'Den sökta tjänsten hittades inte' }, { status: 404 });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ogiltig förfrågan' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (typeof body.occurred_at === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.occurred_at)) {
      updates.occurred_at = body.occurred_at;
    }
    if (body.note !== undefined) {
      updates.note = typeof body.note === 'string' ? body.note.trim().slice(0, 2000) || null : null;
    }
    // Jobbsöket F6: tid och plats på en kallelse ({ intervju: { datum | null, tid?, plats? } }).
    let intervjuAndrad = false;
    if (body.intervju && typeof body.intervju === 'object') {
      const tolkad = valideraIntervjutid(body.intervju);
      if ('fel' in tolkad) {
        return NextResponse.json({ error: 'Kontrollera tiden för intervjun', code: 'invalid_field', falt: tolkad.fel }, { status: 400 });
      }
      Object.assign(updates, tolkad);
      intervjuAndrad = Object.keys(tolkad).length > 0;
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Inget att uppdatera' }, { status: 400 });
    }

    // Ingen händelse före dagen tjänsten söktes (som POST). "Sökt" själv följer sökdatumet.
    if (typeof updates.occurred_at === 'string') {
      const { data: handelse } = await supabase
        .from('job_application_events')
        .select('event_type')
        .eq('id', eventId)
        .eq('application_id', id)
        .maybeSingle();
      const foreSokt = handelse ? handelseForeSokt(String(handelse.event_type), updates.occurred_at, ansokan.applied_at) : null;
      if (foreSokt) {
        return NextResponse.json({ error: foreSokt, code: 'invalid_field', falt: 'occurred_at' }, { status: 400 });
      }
    }

    const fore = intervjuAndrad
      ? (await supabase.from('job_application_events').select('interview_at').eq('id', eventId).eq('application_id', id).maybeSingle()).data
      : null;

    const { data, error } = await supabase
      .from('job_application_events')
      .update(updates)
      .eq('id', eventId)
      .eq('application_id', id)
      .select()
      .single();

    if (error && intervjuAndrad && arSchemaFel(error)) {
      return NextResponse.json({ error: 'Tiden för intervjun går inte att spara än', code: 'migrering_saknas' }, { status: 503 });
    }
    if (!error && data && intervjuAndrad) {
      matIntervjutid(user.id, fore as { interview_at?: string | null } | null, data, 'andra_tid');
    }

    if (error || !data) {
      console.error('Fel vid uppdatering av händelse:', error);
      return NextResponse.json({ error: 'Kunde inte uppdatera händelsen' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Händelseuppdatering error:', error);
    return NextResponse.json({ error: 'Serverfel vid uppdatering av händelse' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const { id, eventId } = await params;
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }
    if (!(await requireOwnedApplication(supabase, id, user.id))) {
      return NextResponse.json({ error: 'Den sökta tjänsten hittades inte' }, { status: 404 });
    }

    const { error } = await supabase
      .from('job_application_events')
      .delete()
      .eq('id', eventId)
      .eq('application_id', id);

    if (error) {
      console.error('Fel vid borttagning av händelse:', error);
      return NextResponse.json({ error: 'Kunde inte ta bort händelsen' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Händelseborttagning error:', error);
    return NextResponse.json({ error: 'Serverfel vid borttagning av händelse' }, { status: 500 });
  }
}
