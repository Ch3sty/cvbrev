// src/app/api/applications/stats/route.ts
// Sökta tjänster: aggregerad statistik för inloggad användare.
//
// RPC:n get_job_application_stats är endast GRANT:ad till service_role
// (den tar godtycklig user_id och får aldrig nås direkt från klienten),
// så anropet går via admin-klienten EFTER att sessionen verifierats.

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    const url = new URL(request.url);
    const since = url.searchParams.get('since');
    const until = url.searchParams.get('until');

    const admin = getSupabaseAdmin();
    const { data, error } = await (admin as any).rpc('get_job_application_stats', {
      p_user_id: user.id,
      p_since: since && DATE_RE.test(since) ? since : null,
      p_until: until && DATE_RE.test(until) ? until : null,
    });

    if (error) {
      console.error('Fel vid hämtning av ansökningsstatistik:', error);
      return NextResponse.json({ error: 'Kunde inte hämta statistik' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Statistikhämtning error:', error);
    return NextResponse.json({ error: 'Serverfel vid hämtning av statistik' }, { status: 500 });
  }
}
