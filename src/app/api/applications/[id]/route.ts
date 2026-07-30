// src/app/api/applications/[id]/route.ts
// Sökta tjänster: hämta (med händelser), uppdatera och ta bort en ansökan.

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

const VALID_CHANNELS = ['ad', 'unsolicited', 'network'];

export async function GET(
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

    const { data: application, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !application) {
      return NextResponse.json({ error: 'Ansökan hittades inte' }, { status: 404 });
    }

    const { data: events, error: eventsError } = await supabase
      .from('job_application_events')
      .select('*')
      .eq('application_id', id)
      .order('occurred_at', { ascending: true })
      .order('created_at', { ascending: true });

    if (eventsError) {
      console.error('Fel vid hämtning av händelser:', eventsError);
    }

    // Kopplat brev (om det finns kvar).
    let letter: { id: string; title: string | null } | null = null;
    if (application.letter_id) {
      const { data: letterRow } = await supabase
        .from('letters')
        .select('id, title')
        .eq('id', application.letter_id)
        .maybeSingle();
      letter = letterRow ?? null;
    }

    return NextResponse.json({
      success: true,
      data: { ...application, events: events ?? [], letter },
    });
  } catch (error) {
    console.error('Ansökningshämtning error:', error);
    return NextResponse.json({ error: 'Serverfel vid hämtning av ansökan' }, { status: 500 });
  }
}

export async function PUT(
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

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ogiltig förfrågan' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (typeof body.job_title === 'string' && body.job_title.trim()) {
      updates.job_title = body.job_title.trim().slice(0, 200);
    }
    if (typeof body.company === 'string' && body.company.trim()) {
      updates.company = body.company.trim().slice(0, 200);
    }
    if (body.location !== undefined) {
      updates.location = typeof body.location === 'string' ? body.location.trim().slice(0, 200) || null : null;
    }
    if (typeof body.application_channel === 'string' && VALID_CHANNELS.includes(body.application_channel)) {
      updates.application_channel = body.application_channel;
    }
    if (body.job_ad_url !== undefined) {
      updates.job_ad_url = typeof body.job_ad_url === 'string' ? body.job_ad_url.trim().slice(0, 2048) || null : null;
    }
    if (body.notes !== undefined) {
      updates.notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 4000) || null : null;
    }
    if (typeof body.applied_at === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.applied_at)) {
      updates.applied_at = body.applied_at;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Inget att uppdatera' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('job_applications')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !data) {
      console.error('Fel vid uppdatering av ansökan:', error);
      return NextResponse.json({ error: 'Kunde inte uppdatera ansökan' }, { status: 500 });
    }

    // Om ansökningsdatumet ändrades: håll den första "Sökt"-händelsen i synk
    // så tidslinjen och statistiken visar samma datum.
    if (updates.applied_at) {
      const { data: appliedEvent } = await supabase
        .from('job_application_events')
        .select('id')
        .eq('application_id', id)
        .eq('event_type', 'applied')
        .order('occurred_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (appliedEvent) {
        await supabase
          .from('job_application_events')
          .update({ occurred_at: updates.applied_at })
          .eq('id', appliedEvent.id);
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Ansökningsuppdatering error:', error);
    return NextResponse.json({ error: 'Serverfel vid uppdatering av ansökan' }, { status: 500 });
  }
}

export async function DELETE(
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

    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Fel vid borttagning av ansökan:', error);
      return NextResponse.json({ error: 'Kunde inte ta bort ansökan' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ansökningsborttagning error:', error);
    return NextResponse.json({ error: 'Serverfel vid borttagning av ansökan' }, { status: 500 });
  }
}
