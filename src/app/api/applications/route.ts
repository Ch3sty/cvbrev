// src/app/api/applications/route.ts
// Sökta tjänster: lista och skapa ansökningar.
//
// POST är idempotent på letter_id: att trycka "Markera som sökt" två gånger
// på samma brev returnerar den befintliga ansökan i stället för en dubblett.

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { skapaSoktTjanst } from '@/lib/applications/skapa';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

/** Sätter application_id på Ska sökas-raden för samma annons. Tyst om tabellen saknas. */
async function kopplaSparadTillSokt(userId: string, afAdId: string, applicationId: string) {
  if (!afAdId || afAdId.length > 100) return;
  try {
    const { error } = await (getSupabaseAdmin() as any)
      .from('job_saved_ads')
      .update({ application_id: applicationId })
      .eq('user_id', userId)
      .eq('af_ad_id', afAdId)
      .is('application_id', null);
    if (error && !['PGRST205', '42P01'].includes(error.code)) {
      console.error('Ska sökas-raden kunde inte kopplas:', error);
    }
  } catch (err) {
    console.error('Ska sökas-raden kunde inte kopplas:', err);
  }
}

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
    return NextResponse.json({ error: 'Serverfel när dina sökta tjänster skulle hämtas' }, { status: 500 });
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

    // Valideringen och skrivningen bor i skapaSoktTjanst (samma väg som
    // "Markera som sökt" under Ska sökas). Svaren är desamma som förut.
    const svar = await skapaSoktTjanst(supabase, user.id, body);
    if (!svar.ok) {
      return NextResponse.json({ error: svar.error }, { status: svar.status });
    }
    if (svar.alreadyExists) {
      return NextResponse.json({ success: true, data: svar.data, alreadyExists: true });
    }
    // Jobbsöket F3: "Markera som sökt" på en träff som också ligger under Ska
    // sökas döljer den sparade raden. Valfritt fält, gamla klienter skickar det inte.
    if (typeof body.af_ad_id === 'string' || typeof body.af_ad_id === 'number') {
      await kopplaSparadTillSokt(user.id, String(body.af_ad_id), svar.data.id);
    }
    return NextResponse.json({ success: true, data: svar.data });
  } catch (error) {
    console.error('Ansökningsskapande error:', error);
    return NextResponse.json({ error: 'Serverfel när den sökta tjänsten skulle sparas' }, { status: 500 });
  }
}
