// /api/app/anonym/overfor
//
// POST {anonymToken}
//   Appens Nivåkoll före kontot (docs/plan-app.md). Anroparen är inloggad på
//   sitt riktiga konto (Google, eller ett konto som redan fanns) och skickar
//   åtkomsttoken från den anonyma sessionen hen hade före inloggningen.
//   Servern kontrollerar att token hör till en anonym användare och flyttar
//   Nivåkollen och planen till kontot (onboarding-overforing.server.ts).
//
//   200 {flyttat}. 400 token saknas eller hör inte till en anonym användare,
//   401 ingen inloggning, 403 anroparen är själv anonym.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { overforAnonym } from '@/lib/mobilapp/onboarding-overforing.server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Klient = SupabaseClient<any, any, any>;

export async function POST(request: Request) {
  let anonymToken: unknown;
  try {
    anonymToken = (await request.json())?.anonymToken;
  } catch {
    return NextResponse.json({ error: 'ogiltig_begaran' }, { status: 400 });
  }
  if (typeof anonymToken !== 'string' || anonymToken.length < 20 || anonymToken.length > 4000) {
    return NextResponse.json({ error: 'token_saknas' }, { status: 400 });
  }

  const supabase = createServerClient({ cookies: await cookies() });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.is_anonymous) return NextResponse.json({ error: 'anonym' }, { status: 403 });

  const admin = getSupabaseAdmin() as unknown as Klient;
  const { data: anonym, error } = await admin.auth.getUser(anonymToken);
  // Bara en anonym användare kan flyttas, aldrig ett riktigt konto.
  if (error || !anonym?.user || !anonym.user.is_anonymous) {
    return NextResponse.json({ error: 'inte_anonym' }, { status: 400 });
  }

  try {
    const r = await overforAnonym(admin, anonym.user.id, user.id);
    if (!r.ok) return NextResponse.json({ error: r.fel }, { status: r.status });
    return NextResponse.json({ flyttat: r.flyttat });
  } catch (e) {
    console.error('[app/anonym/overfor]', e);
    return NextResponse.json({ error: 'internt_fel' }, { status: 500 });
  }
}
