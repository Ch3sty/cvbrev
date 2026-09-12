import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { getCandidateInterests } from '@/lib/interests/getCandidateInterests';

// GET /api/candidate/interests
//
// Kandidatens inkommande intresseanmälningar från rekryterare.
//
// Själva hämtningen bor i src/lib/interests/getCandidateInterests.ts, så att
// /dashboard/meddelanden kan köra den direkt som server component i stället
// för att fetcha den här routen och betala en extra rundtur. Routen finns
// kvar för klientnavigering och för komponenter som pollar.
//
// Behörigheten ligger i lib-funktionen och är oförändrad: raderna läses med
// användarens egen klient (RLS släpper igenom rader där candidate_user_id =
// user.id), admin-klienten används bara för rekryterarnas namnfält, och
// kontaktuppgifter lämnar servern endast för accepterade intressen.

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const interests = await getCandidateInterests(supabase, user.id);
    return NextResponse.json({ interests });
  } catch (error) {
    console.error('Candidate interests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
