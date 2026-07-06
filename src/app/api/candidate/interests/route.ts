import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

// GET /api/candidate/interests
//
// Kandidatens inkommande intresseanmälningar från rekryterare.
// Raderna i candidate_interests läses med användarens egen klient (RLS
// släpper igenom rader där candidate_user_id = user.id). Rekryterarens
// företags- och kontaktnamn hämtas via admin-klienten eftersom RLS på
// recruiter_profiles hindrar kandidaten från att läsa andras profiler —
// endast namnfälten lämnar servern, aldrig hela rekryterarprofilen.

interface InterestRow {
  id: string;
  recruiter_user_id: string;
  message: string | null;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  responded_at: string | null;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Tabellen saknas i genererade DB-typer, därav as any.
    const { data, error } = await (supabase as any)
      .from('candidate_interests')
      .select('id, recruiter_user_id, message, status, created_at, responded_at')
      .eq('candidate_user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching candidate interests:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const rows: InterestRow[] = data ?? [];
    if (rows.length === 0) {
      return NextResponse.json({ interests: [] });
    }

    // Berika med rekryterarnas företag + kontaktperson (en batch-läsning).
    const recruiterIds = Array.from(new Set(rows.map((r) => r.recruiter_user_id)));
    const admin = getSupabaseAdmin();
    const { data: recruiters, error: recruiterError } = await (admin as any)
      .from('recruiter_profiles')
      .select('user_id, company_name, contact_name')
      .in('user_id', recruiterIds);

    if (recruiterError) {
      console.error('Error fetching recruiter profiles:', recruiterError);
    }

    const recruiterMap = new Map<string, { company_name: string | null; contact_name: string | null }>(
      (recruiters ?? []).map((r: { user_id: string; company_name: string | null; contact_name: string | null }) => [
        r.user_id,
        { company_name: r.company_name, contact_name: r.contact_name },
      ])
    );

    const interests = rows.map((row) => {
      const recruiter = recruiterMap.get(row.recruiter_user_id);
      return {
        id: row.id,
        companyName: recruiter?.company_name ?? 'Okänt företag',
        contactName: recruiter?.contact_name ?? null,
        message: row.message,
        status: row.status,
        createdAt: row.created_at,
        respondedAt: row.responded_at,
      };
    });

    return NextResponse.json({ interests });
  } catch (error) {
    console.error('Candidate interests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
