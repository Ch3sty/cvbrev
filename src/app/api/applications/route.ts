// src/app/api/applications/route.ts
// Sökta tjänster: lista och skapa ansökningar.
//
// POST är idempotent på letter_id: att trycka "Markera som sökt" två gånger
// på samma brev returnerar den befintliga ansökan i stället för en dubblett.

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

const VALID_CHANNELS = ['ad', 'unsolicited', 'network'];

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', user.id)
      .order('applied_at', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fel vid hämtning av ansökningar:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (error) {
    console.error('Ansökningshämtning error:', error);
    return NextResponse.json({ error: 'Serverfel vid hämtning av ansökningar' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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

    const jobTitle = typeof body.job_title === 'string' ? body.job_title.trim() : '';
    const company = typeof body.company === 'string' ? body.company.trim() : '';
    if (!jobTitle || jobTitle.length > 200) {
      return NextResponse.json({ error: 'Tjänstetitel krävs (max 200 tecken)' }, { status: 400 });
    }
    if (!company || company.length > 200) {
      return NextResponse.json({ error: 'Arbetsgivare krävs (max 200 tecken)' }, { status: 400 });
    }

    const channel = typeof body.application_channel === 'string' && VALID_CHANNELS.includes(body.application_channel)
      ? body.application_channel
      : 'ad';
    const location = typeof body.location === 'string' ? body.location.trim().slice(0, 200) || null : null;
    const jobAdUrl = typeof body.job_ad_url === 'string' ? body.job_ad_url.trim().slice(0, 2048) || null : null;
    const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 4000) || null : null;
    const letterId = typeof body.letter_id === 'string' && body.letter_id ? body.letter_id : null;
    const cvId = typeof body.cv_id === 'string' && body.cv_id ? body.cv_id : null;

    // Datum: YYYY-MM-DD, förvalt idag. Framtida datum tillåts inte.
    let appliedAt = new Date().toISOString().slice(0, 10);
    if (typeof body.applied_at === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.applied_at)) {
      if (body.applied_at <= appliedAt) appliedAt = body.applied_at;
    }

    if (letterId) {
      // Idempotens: finns redan en ansökan för det här brevet, returnera den.
      const { data: existing } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id)
        .eq('letter_id', letterId)
        .maybeSingle();
      if (existing) {
        return NextResponse.json({ success: true, data: existing, alreadyExists: true });
      }

      // Brevet måste tillhöra användaren.
      const { data: letter } = await supabase
        .from('letters')
        .select('id')
        .eq('id', letterId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (!letter) {
        return NextResponse.json({ error: 'Brevet hittades inte' }, { status: 404 });
      }
    }

    const { data: created, error: insertError } = await supabase
      .from('job_applications')
      .insert({
        user_id: user.id,
        job_title: jobTitle,
        company,
        location,
        application_channel: channel,
        job_ad_url: jobAdUrl,
        letter_id: letterId,
        cv_id: cvId,
        notes,
        applied_at: appliedAt,
      })
      .select()
      .single();

    if (insertError || !created) {
      console.error('Fel vid skapande av ansökan:', insertError);
      return NextResponse.json({ error: insertError?.message || 'Kunde inte skapa ansökan' }, { status: 500 });
    }

    // Första händelsen i tidslinjen; triggern sätter current_status = 'applied'.
    const { error: eventError } = await supabase
      .from('job_application_events')
      .insert({ application_id: created.id, event_type: 'applied', occurred_at: appliedAt });
    if (eventError) {
      console.error('Fel vid skapande av ansökt-händelse:', eventError);
    }

    return NextResponse.json({ success: true, data: { ...created, current_status: 'applied' } });
  } catch (error) {
    console.error('Ansökningsskapande error:', error);
    return NextResponse.json({ error: 'Serverfel vid skapande av ansökan' }, { status: 500 });
  }
}
