// /api/app/anonym/nytt-konto
//
// POST {metod: 'password' | 'google'}
//   Det webbens /api/auth/post-signup gör efter ett nytt konto, för kontona
//   som skapas i appen: e-posten i profilen, varifrån kontot kom (appen) och
//   livscykelmejlen. Webbens rutt kräver ett konto yngre än tio minuter, och
//   ett konto som började som anonym Nivåkoll i appen kan vara äldre. Här
//   räknas åldern i stället på leverantörens identitet (arNyIdentitet), som
//   skapas i samma ögonblick som kontot får e-post eller Google.
//
//   200 {ok}. 401 ingen inloggning, 403 anonym eller inte ett nytt konto.

import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { onUserSignup } from '@/lib/email/lifecycle/hooks';
import { logActivityServer } from '@/lib/activation-tracking';
import { appPlattform } from '@/lib/mobilapp/appvag';
import { arNyIdentitet } from '@/lib/mobilapp/onboarding-overforing.server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Klient = SupabaseClient<any, any, any>;

export async function POST(request: Request) {
  let metod: unknown;
  try {
    metod = (await request.json())?.metod;
  } catch {
    return NextResponse.json({ error: 'ogiltig_begaran' }, { status: 400 });
  }
  if (metod !== 'password' && metod !== 'google') return NextResponse.json({ error: 'ogiltig_metod' }, { status: 400 });

  const supabase = createServerClient({ cookies: await cookies() });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.is_anonymous || !arNyIdentitet(user.identities, metod === 'password' ? 'email' : 'google')) {
    return NextResponse.json({ error: 'inte_nytt' }, { status: 403 });
  }

  const admin = getSupabaseAdmin() as unknown as Klient;
  const plattform = appPlattform((await headers()).get('user-agent')) ?? 'android';
  try {
    // Den anonyma användaren fick ingen e-post i profilen när den skapades.
    if (user.email) await admin.from('profiles').update({ email: user.email }).eq('id', user.id).is('email', null);
    await admin
      .from('profiles')
      .update({ acquisition_source: { kalla: `app_${plattform}`, landing_path: '/app', first_seen: new Date().toISOString() } })
      .eq('id', user.id)
      .is('acquisition_source', null);
    await onUserSignup(admin, user.id);
    await logActivityServer(user.id, 'registered', 'Konto skapat i appen', { method: metod, plattform });
  } catch (e) {
    // Mätning och mejl får aldrig fälla kontot.
    console.error('[app/anonym/nytt-konto]', e);
  }
  return NextResponse.json({ ok: true });
}
