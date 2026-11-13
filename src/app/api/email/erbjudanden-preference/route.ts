import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

// POST /api/email/erbjudanden-preference  { optOut: boolean }
//
// Mejlvalet under Inställningar (ägarens beslut 2026-11-13). Samma kolumn som
// rutan i registreringen och avregistreringslänken i kampanjmejlen:
// profiles.erbjudanden_mejl. optOut true skriver false, och tvärtom, så att
// växeln talar samma språk som de andra mejlväxlarna.
//
// Skriver med användarens egen klient, så RLS avgör åtkomsten.

export const dynamic = 'force-dynamic';

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
    .update({ erbjudanden_mejl: !body.optOut, erbjudanden_mejl_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error) {
    console.error('erbjudanden-preference POST:', error.message);
    return NextResponse.json({ error: 'Kunde inte spara inställningen' }, { status: 500 });
  }

  return NextResponse.json({ success: true, optOut: body.optOut });
}
