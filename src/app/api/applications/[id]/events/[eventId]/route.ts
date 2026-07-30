// src/app/api/applications/[id]/events/[eventId]/route.ts
// Sökta tjänster: rätta eller ta bort en händelse (användaren kan alltid backa).
// current_status räknas om av databastriggern vid både UPDATE och DELETE.

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

async function requireOwnedApplication(
  supabase: ReturnType<typeof createServerClient>,
  applicationId: string,
  userId: string
) {
  const { data } = await supabase
    .from('job_applications')
    .select('id')
    .eq('id', applicationId)
    .eq('user_id', userId)
    .maybeSingle();
  return Boolean(data);
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
    if (!(await requireOwnedApplication(supabase, id, user.id))) {
      return NextResponse.json({ error: 'Ansökan hittades inte' }, { status: 404 });
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
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Inget att uppdatera' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('job_application_events')
      .update(updates)
      .eq('id', eventId)
      .eq('application_id', id)
      .select()
      .single();

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
      return NextResponse.json({ error: 'Ansökan hittades inte' }, { status: 404 });
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
