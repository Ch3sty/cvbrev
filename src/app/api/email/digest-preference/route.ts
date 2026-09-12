import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

// GET  /api/email/digest-preference  -> { optOut: boolean }
// POST /api/email/digest-preference  { optOut: boolean }
//
// Profilraden för veckosammanfattningen (docs/plan-inloggat-omdesign.md,
// avsnitt 8). Avregistreringslänken i mailet är för den som inte orkar logga
// in, den här routen för den som redan är inne. Båda skriver samma kolumn,
// profiles.weekly_digest_opt_out, och rör aldrig quota_emails_opt_out.
//
// Skriver med användarens egen klient, så RLS avgör åtkomsten och ingen kan
// ändra någon annans inställning.

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

  const { data, error } = await (supabase as any)
    .from('profiles')
    .select('weekly_digest_opt_out')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('digest-preference GET:', error.message);
    return NextResponse.json({ error: 'Kunde inte läsa inställningen' }, { status: 500 });
  }

  return NextResponse.json({ optOut: data?.weekly_digest_opt_out === true });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
  }

  let body: { optOut?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Ogiltig förfrågan' }, { status: 400 });
  }

  if (typeof body.optOut !== 'boolean') {
    return NextResponse.json({ error: 'optOut måste vara true eller false' }, { status: 400 });
  }

  const { error } = await (supabase as any)
    .from('profiles')
    .update({ weekly_digest_opt_out: body.optOut })
    .eq('id', user.id);

  if (error) {
    console.error('digest-preference POST:', error.message);
    return NextResponse.json({ error: 'Kunde inte spara inställningen' }, { status: 500 });
  }

  return NextResponse.json({ success: true, optOut: body.optOut });
}
