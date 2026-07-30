// src/app/api/applications/backfill/route.ts
// Sökta tjänster: importera tidigare sparade brev som loggade ansökningar.
//
// GET listar sparade brev som inte redan är kopplade till en ansökan.
// POST skapar ansökningar för valda brev (datum = brevets skapandedatum).

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    const { data: letters, error } = await supabase
      .from('letters')
      .select('id, title, company, job_title, created_at')
      .eq('user_id', user.id)
      .eq('is_saved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Backfill: kunde inte hämta brev', error);
      return NextResponse.json({ error: 'Kunde inte hämta brev' }, { status: 500 });
    }

    const { data: linked, error: linkedError } = await supabase
      .from('job_applications')
      .select('letter_id')
      .eq('user_id', user.id)
      .not('letter_id', 'is', null);

    if (linkedError) {
      console.error('Backfill: kunde inte hämta kopplade ansökningar', linkedError);
      return NextResponse.json({ error: 'Kunde inte hämta ansökningar' }, { status: 500 });
    }

    const linkedIds = new Set((linked ?? []).map((row) => row.letter_id));
    const candidates = (letters ?? []).filter((letter) => !linkedIds.has(letter.id));

    return NextResponse.json({ success: true, data: candidates });
  } catch (error) {
    console.error('Backfill-hämtning error:', error);
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 });
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

    let body: { letterIds?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ogiltig förfrågan' }, { status: 400 });
    }

    const letterIds = Array.isArray(body.letterIds)
      ? body.letterIds.filter((id): id is string => typeof id === 'string').slice(0, 200)
      : [];
    if (letterIds.length === 0) {
      return NextResponse.json({ error: 'Inga brev valda' }, { status: 400 });
    }

    const { data: letters, error } = await supabase
      .from('letters')
      .select('id, company, job_title, created_at')
      .eq('user_id', user.id)
      .eq('is_saved', true)
      .in('id', letterIds);

    if (error) {
      console.error('Backfill: kunde inte hämta valda brev', error);
      return NextResponse.json({ error: 'Kunde inte hämta brev' }, { status: 500 });
    }

    const { data: linked } = await supabase
      .from('job_applications')
      .select('letter_id')
      .eq('user_id', user.id)
      .not('letter_id', 'is', null);
    const linkedIds = new Set((linked ?? []).map((row) => row.letter_id));

    let createdCount = 0;
    for (const letter of letters ?? []) {
      if (linkedIds.has(letter.id)) continue;

      const appliedAt = (letter.created_at ?? new Date().toISOString()).slice(0, 10);
      const { data: created, error: insertError } = await supabase
        .from('job_applications')
        .insert({
          user_id: user.id,
          job_title: letter.job_title || 'Okänd tjänst',
          company: letter.company || 'Okänd arbetsgivare',
          application_channel: 'ad',
          letter_id: letter.id,
          applied_at: appliedAt,
        })
        .select('id')
        .single();

      if (insertError || !created) {
        console.error('Backfill: kunde inte skapa ansökan för brev', letter.id, insertError);
        continue;
      }

      await supabase
        .from('job_application_events')
        .insert({ application_id: created.id, event_type: 'applied', occurred_at: appliedAt });
      createdCount++;
    }

    return NextResponse.json({ success: true, created: createdCount });
  } catch (error) {
    console.error('Backfill error:', error);
    return NextResponse.json({ error: 'Serverfel vid import' }, { status: 500 });
  }
}
