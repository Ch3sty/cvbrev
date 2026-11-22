// POST /api/recruiter/villkor
// Body: { version: string }
//
// Rekryteraren godkänner villkoren för rekryterare (ägarbeslut 2026-11-22).
// Anropas från registreringen direkt efter ansökan och från portalens ruta
// för ett godkänt konto som saknar godkända villkor. Tidpunkten sätts här på
// servern, aldrig av webbläsaren. Versionen måste vara den som sidan visar
// (VILLKOR_VERSION), annars 409 så att klienten laddar om.
//
// Kräver inloggning och en rad i recruiter_profiles (vilken status som
// helst: en ansökan som väntar får godkänna villkoren). Ett redan gjort
// godkännande av samma version skrivs inte över, så den första tidpunkten
// står kvar. Rekryteraren har ingen egen uppdateringsrätt på raden (RLS),
// därför skriver servernyckeln.

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getRecruiterAuth } from '@/lib/recruiter/auth';
import { VILLKOR_VERSION } from '@/lib/recruiter/villkor';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const auth = await getRecruiterAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!auth.recruiter) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    let body: { version?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ogiltig förfrågan' }, { status: 400 });
    }
    if (body.version !== VILLKOR_VERSION) {
      return NextResponse.json({ error: 'Villkoren har ändrats', version: VILLKOR_VERSION }, { status: 409 });
    }

    if (auth.recruiter.villkor_godkanda_at && auth.recruiter.villkor_version === VILLKOR_VERSION) {
      return NextResponse.json({
        villkorGodkandaAt: auth.recruiter.villkor_godkanda_at,
        villkorVersion: VILLKOR_VERSION,
      });
    }

    const nu = new Date().toISOString();
    const admin = getSupabaseAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin as any)
      .from('recruiter_profiles')
      .update({ villkor_godkanda_at: nu, villkor_version: VILLKOR_VERSION, updated_at: nu })
      .eq('user_id', auth.user.id);
    if (error) {
      console.error('Rekryterarvillkor: kunde inte spara godkännandet', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ villkorGodkandaAt: nu, villkorVersion: VILLKOR_VERSION });
  } catch (error) {
    console.error('Rekryterarvillkor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
