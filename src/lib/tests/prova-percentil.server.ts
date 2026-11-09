/**
 * Underlaget till percentilraden i provet utan konto (prova-percentil.ts).
 *
 * Utfallen läses ur prov_utfall (ägarens beslut 2026-11-09, plan punkt 30):
 * antal rätt per avslutat prov, utan konto, IP eller token. Tabellen skrivs
 * av spara_prov_utfall när ett prov rättas och rensas aldrig, så underlaget
 * växer. Ägaren och testkontona är undantagna redan när raden skrivs (samma
 * regel som förut: prov hämtade till ett konto i admin_undantagna_konton()
 * och prov från en IP-hash som har ett sådant prov).
 *
 * Bara prov med samma antal frågor som dagens prov räknas.
 *
 * Svaret cachas en timme per serverinstans. Vid fel blir det null och raden
 * döljs: hellre ingen rad än en gissad.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { ANON_QUESTION_COUNT } from '@/lib/tests/anon-session'

const CACHE_MS = 60 * 60 * 1000
/** PostgREST lämnar högst 1000 rader per svar, så utfallen läses i sidor. */
const SIDA = 1000
const MAX_RADER = 200_000

let cache: { t: number; utfall: number[] } | null = null

export async function hamtaProvUtfall(admin: SupabaseClient<any>): Promise<number[] | null> {
  if (cache && Date.now() - cache.t < CACHE_MS) return cache.utfall
  try {
    const utfall: number[] = []
    for (let fran = 0; fran < MAX_RADER; fran += SIDA) {
      const { data, error } = await admin
        .from('prov_utfall')
        .select('ratt')
        .eq('testtyp', 'matris-prova')
        .eq('totalt', ANON_QUESTION_COUNT)
        .order('id')
        .range(fran, fran + SIDA - 1)
      if (error || !data) return null
      for (const r of data as Array<{ ratt: number | null }>) {
        if (typeof r.ratt === 'number') utfall.push(r.ratt)
      }
      if (data.length < SIDA) break
    }
    cache = { t: Date.now(), utfall }
    return utfall
  } catch (err) {
    console.error('[prova-percentil] Kunde inte läsa utfallen:', err)
    return null
  }
}
