import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { getProfileViewStats } from '@/lib/recruiter/profileViews';

// GET /api/candidate/views -> { lastWeek: number, total: number }
//
// Kandidatens egna profilvisningar (docs/plan-inloggat-omdesign.md, avsnitt 5).
// Svarar med antal, aldrig identitet: vilka rekryterare som tittat lämnar
// aldrig servern. Kolumnerna väljs explicit i getProfileViewStats, så
// recruiter_user_id kan inte läcka via en bredare select.
//
// Läser med användarens egen klient, så RLS-policyn
// ("candidate reads own profile views") är spärren, inte en filterrad i
// koden.

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
  }

  const stats = await getProfileViewStats(supabase as any, user.id);
  return NextResponse.json(stats);
}
