import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

/**
 * GET  /api/profile/quota-emails  -> { optOut: boolean }
 * POST /api/profile/quota-emails  { optOut: boolean }
 *
 * Kvotpåminnelser (profil-spec, sektion 4). Kolumnen quota_emails_opt_out
 * styr redan livscykelrunnern och kampanjutskicken, men har hittills saknat
 * gränssnitt helt: användaren kunde alltså inte stänga av mail som systemet
 * ändå respekterar. Den här routen ger kolumnen en väg in.
 *
 * Skriver med användarens egen klient, så RLS avgör åtkomsten och ingen kan
 * ändra någon annans inställning. Rör aldrig weekly_digest_opt_out, som har
 * sin egen rad och sin egen route.
 */

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
    .select('quota_emails_opt_out')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('quota-emails GET:', error.message);
    return NextResponse.json({ error: 'Kunde inte läsa inställningen' }, { status: 500 });
  }

  return NextResponse.json({ optOut: data?.quota_emails_opt_out === true });
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
    .update({ quota_emails_opt_out: body.optOut })
    .eq('id', user.id);

  if (error) {
    console.error('quota-emails POST:', error.message);
    return NextResponse.json({ error: 'Kunde inte spara inställningen' }, { status: 500 });
  }

  return NextResponse.json({ success: true, optOut: body.optOut });
}
