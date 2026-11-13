// src/lib/mobilapp/onboarding-overforing.server.ts
// Nivåkollen före kontot (docs/plan-app.md, beslut 2026-11-13). Appen gör
// Nivåkollen i en anonym Supabase-session. Skapas kontot med e-post blir
// den anonyma användaren själv kontot (updateUser), och inget behöver
// flyttas. Med Google, eller när de loggar in på ett konto som redan finns,
// byts användaren, och då flyttas Nivåkollen hit från den anonyma.
//
// Det som flyttas är det som Nivåkollen och onboardingen skriver: sessionerna
// (logic_test_v4_sessions), nivåpunkterna, märkena och planen. Har kontot
// redan en nivå behåller det sin historik och den anonyma Nivåkollen följer
// inte med; den räknas aldrig in två gånger. Den anonyma användaren raderas
// sist, och resten av dess rader går med den (ON DELETE CASCADE).

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Klient = SupabaseClient<any, any, any>;

export type Overforing =
  | { ok: true; flyttat: boolean }
  | { ok: false; status: 400 | 403 | 500; fel: string };

/** Flyttar den anonyma användarens Nivåkoll och plan till kontot och raderar den anonyma. */
export async function overforAnonym(admin: Klient, anonymId: string, kontoId: string): Promise<Overforing> {
  if (anonymId === kontoId) return { ok: true, flyttat: false };

  const { data: punkter, error: lasFel } = await admin.from('test_nivapunkter').select('user_id').eq('user_id', kontoId).limit(1);
  if (lasFel) return { ok: false, status: 500, fel: 'las' };
  const harNiva = (punkter ?? []).length > 0;

  if (!harNiva) {
    const steg = [
      admin.from('logic_test_v4_sessions').update({ user_id: kontoId }).eq('user_id', anonymId),
      admin.from('test_nivapunkter').update({ user_id: kontoId }).eq('user_id', anonymId),
    ];
    for (const s of steg) {
      const { error } = await s;
      if (error) return { ok: false, status: 500, fel: 'flytt' };
    }

    // Märkena: bara de kontot inte redan har (nyckeln är unik per användare).
    const [{ data: anonymaMarken }, { data: egnaMarken }] = await Promise.all([
      admin.from('test_milstolpar').select('nyckel').eq('user_id', anonymId),
      admin.from('test_milstolpar').select('nyckel').eq('user_id', kontoId),
    ]);
    const egna = new Set(((egnaMarken ?? []) as { nyckel: string }[]).map((r) => r.nyckel));
    const nya = ((anonymaMarken ?? []) as { nyckel: string }[]).map((r) => r.nyckel).filter((n) => !egna.has(n));
    if (nya.length) {
      await admin.from('test_milstolpar').update({ user_id: kontoId }).eq('user_id', anonymId).in('nyckel', nya);
    }
  }

  // Planen: bara när kontot saknar en. Ett befintligt kontos plan står kvar.
  const { data: egenPlan } = await admin.from('test_planer').select('user_id').eq('user_id', kontoId).maybeSingle();
  if (!egenPlan) {
    await admin.from('test_planer').update({ user_id: kontoId }).eq('user_id', anonymId);
  }

  const { error: raderaFel } = await admin.auth.admin.deleteUser(anonymId);
  if (raderaFel) console.error('[app/anonym] kunde inte radera den anonyma användaren', raderaFel.message);
  return { ok: true, flyttat: !harNiva };
}

/**
 * Ett konto räknas som nytt i appen när leverantörens identitet (e-post
 * eller Google) skapades för högst femton minuter sedan. Det gäller både
 * ett nytt konto och en anonym användare som just fått e-post, vars konto
 * i sig kan vara äldre än Nivåkollen.
 */
export function arNyIdentitet(
  identiteter: readonly { provider?: string; created_at?: string }[] | null | undefined,
  provider: 'email' | 'google',
  nu: number = Date.now()
): boolean {
  const id = (identiteter ?? []).find((i) => i.provider === provider);
  if (!id?.created_at) return false;
  const alder = nu - new Date(id.created_at).getTime();
  return alder >= -60_000 && alder <= 15 * 60_000;
}
