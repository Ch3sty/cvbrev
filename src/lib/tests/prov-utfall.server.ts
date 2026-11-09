/**
 * Provets utfall, anonymt (ägarens beslut 2026-11-09, plan-efter-analys
 * punkt 30).
 *
 * När ett prov utan konto rättas sparas antal rätt, antal frågor, dagen och
 * bankversionen i prov_utfall. Inget konto, ingen IP, ingen token. Raderna
 * finns kvar när cronen rensar de ohämtade proven, så underlaget till
 * percentilraden växer.
 *
 * Regeln ligger i databasfunktionen spara_prov_utfall
 * (supabase/migrations/20261109120000_prov_utfall.sql): en rad per prov,
 * ägaren och testkontona undantagna. Backfillen använder samma funktion.
 *
 * Får aldrig fälla rättningen: fel loggas och sväljs.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export async function sparaProvUtfall(admin: SupabaseClient<any>, token: string): Promise<void> {
  try {
    const { error } = await admin.rpc('spara_prov_utfall', { p_token: token })
    if (error) console.error('[prov-utfall] Kunde inte spara utfallet:', error.message)
  } catch (err) {
    console.error('[prov-utfall] Kunde inte spara utfallet:', err)
  }
}

/**
 * Utfallet för de nya provtyperna (spec-prov-fler-typer avsnitt 4). Samma
 * regler som databasfunktionen: en rad per prov (meta.utfall_sparat), ägaren
 * och testkontona undantagna, prov från en IP-hash med ett undantaget konto
 * undantagna. Skriver test_kind, så att typernas fördelningar aldrig blandas
 * med matrisens. Databasfunktionen lämnas orörd och skriver matrisens som förut.
 */
export async function sparaProvUtfallTyp(admin: SupabaseClient<any>, token: string, testKind: string): Promise<void> {
  try {
    const { data: rad } = await admin
      .from('anon_test_sessions')
      .select('score, questions, ip_hash, claimed_by, created_at, meta')
      .eq('token', token)
      .maybeSingle()
    const r = rad as { score: number | null; questions: unknown; ip_hash: string | null; claimed_by: string | null; created_at: string; meta: Record<string, unknown> | null } | null
    if (!r || r.score === null || r.meta?.utfall_sparat === true) return

    const { data: undantag } = await admin.rpc('admin_undantagna_konton')
    const undantagna = ((undantag ?? []) as { user_id: string }[]).map((u) => u.user_id)
    if (r.claimed_by && undantagna.includes(r.claimed_by)) return
    if (r.ip_hash && undantagna.length) {
      const { count } = await admin
        .from('anon_test_sessions')
        .select('token', { count: 'exact', head: true })
        .eq('ip_hash', r.ip_hash)
        .in('claimed_by', undantagna)
      if ((count ?? 0) > 0) return
    }

    const totalt = Array.isArray(r.questions) && r.questions.length > 0 ? r.questions.length : 5
    const skapad = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date(r.created_at))
    const { error } = await admin
      .from('prov_utfall')
      .insert({ skapad, testtyp: `${testKind}-prova`, ratt: r.score, totalt, version: 'v1', test_kind: testKind })
    if (error) {
      console.error('[prov-utfall] Kunde inte spara utfallet:', error.message)
      return
    }
    await admin
      .from('anon_test_sessions')
      .update({ meta: { ...(r.meta ?? {}), utfall_sparat: true } })
      .eq('token', token)
  } catch (err) {
    console.error('[prov-utfall] Kunde inte spara utfallet:', err)
  }
}
