'use client';

/**
 * Appens inloggning och kontoskapande (docs/plan-app.md, avsnitt 2.5).
 * Samma Supabase-funktioner som webbens LoginFlode och RegisterKontoSteg:
 * signInWithPassword, signUp och, för Google, signInWithIdToken med den
 * id-token som skalet ger (skal-inloggning.ts).
 *
 * Nivåkollen före kontot: är sessionen anonym blir den anonyma användaren
 * själv kontot när det skapas med e-post (updateUser), så Nivåkollen står
 * kvar utan att något flyttas. Med Google, eller vid inloggning på ett konto
 * som redan finns, byts användaren och /api/app/anonym/overfor flyttar
 * Nivåkollen och planen från den anonyma.
 */

import { createClient } from '@/lib/supabase/client';
import { logUserActivity } from '@/lib/activity-logger';
import { capture, identifyUser } from '@/lib/analytics/events';
import { planKropp, type OnboardingMinne } from '@/lib/mobilapp/onboarding';
import { loggaInMedGoogle } from '../skal-inloggning';

export const MIN_LOSEN = 8;

export type KontoSvar = { ok: true; nytt: boolean } | { ok: false; fel: string; falt?: 'epost' | 'losen' | null; finns?: boolean };

const FEL = {
  epost: 'Skriv en e-postadress.',
  losen: `Lösenordet behöver minst ${MIN_LOSEN} tecken.`,
  finns: 'Det finns redan ett konto med den adressen. Logga in i stället.',
  fel: 'E-postadressen eller lösenordet stämmer inte.',
  google: 'Inloggningen med Google gick inte. Försök igen eller använd e-post.',
  allman: 'Något gick fel. Kontrollera anslutningen och försök igen.',
} as const;

/** Inloggningsläget just nu: ingen, anonym (Nivåkollen före kontot) eller ett konto. */
export async function sessionLage(): Promise<'ingen' | 'anonym' | 'konto'> {
  const { data } = await createClient().auth.getSession();
  const u = data.session?.user;
  if (!u) return 'ingen';
  return u.is_anonymous ? 'anonym' : 'konto';
}

/**
 * Startar en anonym session för Nivåkollen. Falskt när Supabase inte tillåter
 * anonyma användare (inställningen "Allow anonymous sign-ins"); då skapas
 * kontot före Nivåkollen i stället.
 */
export async function startaAnonym(): Promise<boolean> {
  const lage = await sessionLage();
  if (lage !== 'ingen') return true;
  try {
    const { data, error } = await createClient().auth.signInAnonymously();
    return !error && !!data.session;
  } catch {
    return false;
  }
}

/** Den anonyma sessionens åtkomsttoken, före ett byte av användare. */
async function anonymToken(): Promise<string | null> {
  const { data } = await createClient().auth.getSession();
  return data.session?.user?.is_anonymous ? data.session.access_token : null;
}

async function overfor(token: string | null): Promise<void> {
  if (!token) return;
  try {
    await fetch('/api/app/anonym/overfor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anonymToken: token }),
    });
  } catch {
    // Nivåkollen går att göra om; inloggningen ska aldrig fastna här.
  }
}

/** Efter ett nytt konto: profilen, källan och livscykelmejlen (nytt-konto-rutten). */
function nyttKonto(userId: string, metod: 'password' | 'google'): void {
  void fetch('/api/app/anonym/nytt-konto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ metod }),
  }).catch(() => {});
  void logUserActivity(userId, 'signup_method', 'Kontot skapades i appen', { method: metod }).catch(() => {});
  identifyUser(userId, { signup_method: metod });
  capture('signup_completed', { method: metod, source_page: 'app' });
}

/**
 * Planen från onboardingen, med webbens PUT /api/traning/plan. Ett konto som
 * redan har en plan behåller den; den skrivs bara när den saknas eller när
 * `alltid` är satt (onboardingens egen anonyma session).
 */
export async function sparaPlan(m: Pick<OnboardingMinne, 'test' | 'datum' | 'kalender'>, alltid = false): Promise<void> {
  try {
    if (!alltid) {
      const r = await fetch('/api/traning/plan', { cache: 'no-store' });
      const j = (await r.json().catch(() => null)) as { plan?: unknown } | null;
      if (r.ok && j?.plan) return;
    }
    await fetch('/api/traning/plan', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planKropp(m)),
    });
  } catch {
    // Planen går att sätta i Mitt test; kontot ska inte vänta på den.
  }
}

export function kontrolleraFalt(epost: string, losen: string): KontoSvar | null {
  if (!epost.includes('@') || epost.trim().length < 4) return { ok: false, fel: FEL.epost, falt: 'epost' };
  if (losen.length < MIN_LOSEN) return { ok: false, fel: FEL.losen, falt: 'losen' };
  return null;
}

/** Skapa konto med e-post och lösenord. En anonym session blir själv kontot. */
export async function skapaKontoEpost(epost: string, losen: string): Promise<KontoSvar> {
  const fel = kontrolleraFalt(epost, losen);
  if (fel) return fel;
  const supabase = createClient();
  capture('signup_started', { method: 'password', source_page: 'app' });
  try {
    const lage = await sessionLage();
    let userId: string;
    if (lage === 'anonym') {
      // E-posten först: Supabase tillåter inte lösenord på en anonym användare utan e-post.
      const e = await supabase.auth.updateUser({ email: epost.trim() });
      if (e.error) throw e.error;
      const p = await supabase.auth.updateUser({ password: losen });
      if (p.error) throw p.error;
      userId = p.data.user.id;
    } else {
      const { data, error } = await supabase.auth.signUp({ email: epost.trim(), password: losen });
      if (error) throw error;
      if (!data.user) throw new Error('no_user');
      // Tom identitetslista: adressen finns redan (samma kontroll som webben).
      if (Array.isArray(data.user.identities) && data.user.identities.length === 0) throw new Error('User already registered');
      userId = data.user.id;
    }
    nyttKonto(userId, 'password');
    return { ok: true, nytt: true };
  } catch (err) {
    const e = err as { code?: unknown; message?: unknown };
    const kod = typeof e?.code === 'string' ? e.code : String(e?.message ?? '');
    capture('signup_failed', { method: 'password', steg: 'signup', felkod: kod.slice(0, 80) });
    if (/already|exists|email_exists|user_already_exists/i.test(kod) || /already/i.test(String(e?.message ?? ''))) {
      return { ok: false, fel: FEL.finns, falt: 'epost', finns: true };
    }
    if (/weak_password|password/i.test(kod)) return { ok: false, fel: FEL.losen, falt: 'losen' };
    return { ok: false, fel: FEL.allman };
  }
}

/** Logga in med e-post och lösenord. En anonym Nivåkoll flyttas till kontot. */
export async function loggaInEpost(epost: string, losen: string): Promise<KontoSvar> {
  if (!epost.includes('@') || !losen) return { ok: false, fel: FEL.fel, falt: null };
  const supabase = createClient();
  try {
    const token = await anonymToken();
    const { data, error } = await supabase.auth.signInWithPassword({ email: epost.trim(), password: losen });
    if (error) {
      return { ok: false, fel: error.message.includes('Invalid login credentials') ? FEL.fel : FEL.allman, falt: null };
    }
    await overfor(token);
    if (data.user) void logUserActivity(data.user.id, 'login', 'Inloggning i appen med e-post').catch(() => {});
    return { ok: true, nytt: false };
  } catch {
    return { ok: false, fel: FEL.allman };
  }
}

/** Google via skalets inbyggda kontoval. Avbrutet kontoval ger inget fel. */
export async function loggaInGoogle(): Promise<KontoSvar | null> {
  const g = await loggaInMedGoogle();
  if (!g.ok) {
    if (g.avbrutet) return null;
    capture('signup_failed', { method: 'google', steg: 'oauth_start', felkod: g.fel });
    return { ok: false, fel: FEL.google };
  }
  const supabase = createClient();
  try {
    const token = await anonymToken();
    const { data, error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: g.idToken, nonce: g.nonce });
    if (error || !data.user) {
      capture('signup_failed', { method: 'google', steg: 'oauth_callback', felkod: String(error?.code ?? error?.message ?? 'no_user').slice(0, 80) });
      return { ok: false, fel: FEL.google };
    }
    await overfor(token);
    // Nytt konto: Google-identiteten skapades nyss.
    const id = data.user.identities?.find((i) => i.provider === 'google');
    const nytt = !!id?.created_at && Date.now() - new Date(id.created_at).getTime() < 2 * 60_000;
    if (nytt) nyttKonto(data.user.id, 'google');
    else void logUserActivity(data.user.id, 'login', 'Inloggning i appen med Google').catch(() => {});
    return { ok: true, nytt };
  } catch {
    return { ok: false, fel: FEL.google };
  }
}
