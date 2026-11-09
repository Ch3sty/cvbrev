/**
 * Underlaget till percentilraden i provet utan konto (prova-percentil.ts).
 *
 * Utfallen är anon_test_sessions med score satt. Undantagna:
 *  - prov hämtade till ett undantaget konto (admin_undantagna_konton(),
 *    samma sanning som adminens tal),
 *  - prov från en IP-hash som också har ett prov hämtat till ett undantaget
 *    konto. Ägarens och QA:s prov görs utan konto först, så de syns bara på
 *    adressen innan kontot finns.
 *
 * Utgångna prov som aldrig hämtats rensas av cronen (pricing-sync), så
 * underlaget är de senaste sju dagarnas prov plus alla hämtade.
 *
 * Svaret cachas en timme per serverinstans. Vid fel blir det null och raden
 * döljs: hellre ingen rad än en gissad.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { hamtaUndantag } from '@/lib/admin/undantag'

const CACHE_MS = 60 * 60 * 1000

let cache: { t: number; utfall: number[] } | null = null

export async function hamtaProvUtfall(admin: SupabaseClient<any>): Promise<number[] | null> {
  if (cache && Date.now() - cache.t < CACHE_MS) return cache.utfall
  try {
    const undantag = await hamtaUndantag(admin)
    const { data, error } = await admin
      .from('anon_test_sessions')
      .select('score, claimed_by, ip_hash')
      .not('score', 'is', null)
      .limit(20000)
    if (error || !data) return null
    const rader = data as Array<{ score: number | null; claimed_by: string | null; ip_hash: string | null }>
    const qaIp = new Set(
      rader.filter((r) => undantag.har(r.claimed_by) && r.ip_hash).map((r) => r.ip_hash as string)
    )
    const utfall = rader
      .filter((r) => !undantag.har(r.claimed_by) && !(r.ip_hash && qaIp.has(r.ip_hash)))
      .map((r) => r.score as number)
    cache = { t: Date.now(), utfall }
    return utfall
  } catch (err) {
    console.error('[prova-percentil] Kunde inte läsa utfallen:', err)
    return null
  }
}
