import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { getCandidateSummary } from '@/lib/candidate/getCandidateSummary';

// GET /api/candidate/summary?cv_id=<uuid>
//
// Samlar underlaget till kandidatprofilen ("Bli upptäckt") i ett svar:
//   - results:     bästa slutförda session per kognitiv testfamilj
//                  (matrislogik / verbal / numerisk) över alla nivåer,
//                  med percentil beräknad som i /api/logicTestV4/percentile.
//   - personality: om användaren har en personlighetsprofil + de två
//                  främsta styrkorna härledda ur Big Five-poängen.
//   - skills:      extraherade kompetenser/roll/ort ur active_cv_for_matching.
//   - seniority:   år i yrket, senaste roll och utbildningsnivå.
//
// Själva uträkningen ligger i src/lib/candidate/getCandidateSummary.ts och
// delas med /dashboard/bli-upptackt, som kör den direkt på servern i stället
// för att fetcha den här routen. Routen behövs fortfarande när kandidaten
// byter CV och sidan hämtar om underlaget utan omladdning.

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cvId = new URL(request.url).searchParams.get('cv_id');

    const { results, personality, skills, seniority } = await getCandidateSummary(
      supabase,
      user.id,
      cvId
    );

    return NextResponse.json({ results, personality, skills, seniority });
  } catch (error) {
    console.error('Candidate summary error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
