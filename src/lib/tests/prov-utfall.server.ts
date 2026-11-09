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
