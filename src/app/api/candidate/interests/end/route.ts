import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { avslutadNyckel } from '@/lib/interests/avslutadKontakt';

// POST /api/candidate/interests/end
// Body: { interestId: string }
//
// Kandidaten avslutar en kontakt hen har tackat ja till. Servern kontrollerar
// att intresset är kandidatens eget och accepterat, sätter status 'declined'
// (rekryterarens vy blir anonym igen och tråden stängs för nya meddelanden åt
// båda håll) och sparar när det skedde. Se src/lib/interests/avslutadKontakt.ts.
// Det går inte att ångra: respond-rutten tar bara emot 'pending'.

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { interestId?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ogiltig förfrågan' }, { status: 400 });
    }
    const interestId = typeof body.interestId === 'string' ? body.interestId : null;
    if (!interestId) {
      return NextResponse.json({ error: 'interestId krävs' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: interest, error: fetchError } = await (admin as any)
      .from('candidate_interests')
      .select('id, candidate_user_id, status')
      .eq('id', interestId)
      .maybeSingle();
    if (fetchError) {
      console.error('Avsluta kontakten: läsfel', fetchError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    if (!interest || interest.candidate_user_id !== user.id) {
      return NextResponse.json({ error: 'Intresset hittades inte' }, { status: 404 });
    }
    if (interest.status !== 'accepted') {
      return NextResponse.json({ error: 'Kontakten är inte öppen' }, { status: 409 });
    }

    const nu = new Date().toISOString();

    // Markören först: faller statusändringen efteråt är kontakten fortfarande
    // öppen och markören gör ingenting (den läses bara för 'declined').
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: markError } = await (admin as any).from('user_ui_preferences').upsert(
      { user_id: user.id, key: avslutadNyckel(interestId), value: { avslutad_at: nu }, updated_at: nu },
      { onConflict: 'user_id,key' }
    );
    if (markError) {
      console.error('Avsluta kontakten: markören kunde inte sparas', markError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updated, error: updateError } = await (admin as any)
      .from('candidate_interests')
      .update({ status: 'declined', responded_at: nu })
      .eq('id', interestId)
      .eq('candidate_user_id', user.id)
      .eq('status', 'accepted')
      .select('id');
    if (updateError) {
      console.error('Avsluta kontakten: statusen kunde inte sparas', updateError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: 'Kontakten är inte öppen' }, { status: 409 });
    }

    return NextResponse.json({ ok: true, avslutadAt: nu });
  } catch (error) {
    console.error('Avsluta kontakten:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
