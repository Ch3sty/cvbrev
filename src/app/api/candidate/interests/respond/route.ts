import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

// POST /api/candidate/interests/respond
// Body: { interestId: string, action: 'accept' | 'decline' }
//
// Kandidatens svar på en intresseanmälan. RLS tillåter inte kandidaten att
// uppdatera candidate_interests direkt — uppdateringen görs serverside med
// admin-klienten efter att vi verifierat att intresset tillhör den inloggade
// användaren som kandidat och fortfarande är 'pending'.
//
// OBS: Mail till rekryteraren när kandidaten svarar är MEDVETET utelämnat i
// betan — rekryteraren ser statusändringen i sin portal. Läggs till när
// rekryterarflödet lanseras skarpt.

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { interestId?: unknown; action?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ogiltig request-body' }, { status: 400 });
    }

    const interestId = typeof body.interestId === 'string' ? body.interestId : null;
    const action = body.action === 'accept' || body.action === 'decline' ? body.action : null;

    if (!interestId || !action) {
      return NextResponse.json(
        { error: 'interestId och action (accept/decline) krävs' },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // Validera: intresset finns, tillhör användaren som kandidat, är pending.
    // Tabellen saknas i genererade DB-typer, därav as any.
    const { data: interest, error: fetchError } = await (admin as any)
      .from('candidate_interests')
      .select('id, recruiter_user_id, candidate_user_id, status')
      .eq('id', interestId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching interest:', fetchError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    if (!interest || interest.candidate_user_id !== user.id) {
      return NextResponse.json({ error: 'Intresset hittades inte' }, { status: 404 });
    }
    if (interest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Intresset är redan besvarat' },
        { status: 409 }
      );
    }

    const newStatus = action === 'accept' ? 'accepted' : 'declined';
    const respondedAt = new Date().toISOString();

    const { error: updateError } = await (admin as any)
      .from('candidate_interests')
      .update({ status: newStatus, responded_at: respondedAt })
      .eq('id', interestId)
      .eq('status', 'pending'); // skydd mot dubbelklick/race

    if (updateError) {
      console.error('Error updating interest:', updateError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // Vid accept: skicka med företagsnamnet så UI:t kan bekräfta vem som
    // nu får kandidatens namn och e-post.
    let companyName: string | null = null;
    if (action === 'accept') {
      const { data: recruiter } = await (admin as any)
        .from('recruiter_profiles')
        .select('company_name')
        .eq('user_id', interest.recruiter_user_id)
        .maybeSingle();
      companyName = recruiter?.company_name ?? null;
    }

    return NextResponse.json({
      ok: true,
      status: newStatus,
      respondedAt,
      ...(action === 'accept' ? { companyName } : {}),
    });
  } catch (error) {
    console.error('Candidate interest respond error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
