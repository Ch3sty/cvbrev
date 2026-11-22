// src/lib/konto/posthogRadering.server.ts
// Raderingen av ett konto i PostHog (docs/beslut-mejl-och-radering-2026-11-22.md,
// 2c punkt 4): personen och dess händelser tas bort med
//   POST {POSTHOG_HOST}/api/projects/{POSTHOG_PROJECT_ID}/persons/bulk_delete/
//   { distinct_ids: [...], delete_events: true }
// Kontrollerat mot PostHogs källkod (posthog/api/person.py, 2026-11-22):
// metoden kräver behörigheten person:write, tar högst 1 000 distinct_ids per
// anrop och svarar 202. Händelserna rensas av PostHog i omgångar.
//
// Nyckeln POSTHOG_RADERA_NYCKEL är en egen personlig nyckel med bara
// person:write. Saknas den, eller svarar PostHog inte med 2xx, läggs kontots
// id i posthog_raderingar och midnattskörningen försöker igen. Också en
// lyckad radering köas, för en andra radering samma natt. Kön bär bara
// id, aldrig e-post. Inget här kastar: en radering av kontot ska aldrig falla
// på PostHog.

import type { SupabaseClient } from '@supabase/supabase-js'

const GRANS_MS = 5_000
/**
 * Nattkörningen väntar längre: den har ingen användare som väntar, och ett
 * anrop med hundra id tar längre tid hos PostHog (på live 2026-11-22 hann ett
 * enda id inte svara inom fem sekunder).
 */
const NATT_GRANS_MS = 15_000
const KO_OMGANG = 100
/** Antal försök innan kön larmar under Drift. */
export const POSTHOG_MAX_FORSOK = 5

type Svar = { ok: true } | { ok: false; fel: string }

function installning(): { url: string; nyckel: string } | null {
  const nyckel = process.env.POSTHOG_RADERA_NYCKEL
  const projekt = process.env.POSTHOG_PROJECT_ID
  if (!nyckel || !projekt) return null
  const host = (process.env.POSTHOG_HOST ?? 'https://eu.posthog.com').replace(/\/+$/, '')
  return { url: `${host}/api/projects/${encodeURIComponent(projekt)}/persons/bulk_delete/`, nyckel }
}

/** Ett anrop till bulk_delete. Kastar aldrig. */
export async function anropaBulkDelete(distinctIds: string[], gransMs: number = GRANS_MS): Promise<Svar> {
  const inst = installning()
  if (!inst) return { ok: false, fel: 'nyckel saknas' }
  const styr = new AbortController()
  const timer = setTimeout(() => styr.abort(), gransMs)
  try {
    const res = await fetch(inst.url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${inst.nyckel}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ distinct_ids: distinctIds, delete_events: true }),
      signal: styr.signal,
    })
    if (res.status >= 200 && res.status < 300) return { ok: true }
    return { ok: false, fel: `PostHog svarade ${res.status}` }
  } catch (e) {
    const namn = e instanceof Error ? e.name : ''
    return { ok: false, fel: namn === 'AbortError' ? `PostHog svarade inte inom ${gransMs} ms` : 'PostHog gick inte att nå' }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Tar bort kontot ur PostHog, eller lägger det i kön. Anropas efter att
 * kontot är raderat. Kastar aldrig.
 */
export async function raderaIPosthog(admin: SupabaseClient, userId: string): Promise<'raderad' | 'koad' | 'fel'> {
  try {
    const svar = await anropaBulkDelete([userId])
    if (svar.ok) {
      // Webbläsaren kan skicka sin sista omgång händelser i samma sekund som
      // raderingen, och då skapar PostHog personen på nytt under samma id
      // (sett på live 2026-11-22: personen fanns kvar 27 minuter efter en
      // radering som svarat 2xx). Id:t läggs därför också i kön, så att
      // midnattskörningen raderar en gång till när webbläsaren har tystnat.
      const { error } = await admin
        .from('posthog_raderingar')
        .upsert({ distinct_id: userId, senaste_fel: null }, { onConflict: 'distinct_id', ignoreDuplicates: true })
      if (error) console.error('[posthogRadering] kunde inte köa den andra raderingen:', error.message)
      return 'raderad'
    }
    const { error } = await admin
      .from('posthog_raderingar')
      .upsert({ distinct_id: userId, senaste_fel: svar.fel }, { onConflict: 'distinct_id', ignoreDuplicates: true })
    if (error) {
      console.error('[posthogRadering] kunde inte köa raderingen:', error.message)
      return 'fel'
    }
    return 'koad'
  } catch (e) {
    console.error('[posthogRadering] oväntat fel:', e instanceof Error ? e.message : String(e))
    return 'fel'
  }
}

export interface KoResultat {
  success: boolean
  raderade: number
  kvar: number
  fel?: string
}

/**
 * Midnattskörningen: tar upp till 100 köade konton i ett anrop. Vid 2xx tas
 * raderna bort, annars räknas försöken upp. När en rad når fem försök skrivs
 * ett fel under Drift, med antalet men utan id.
 */
export async function korPosthogRaderingar(admin: SupabaseClient): Promise<KoResultat> {
  const { data, error } = await admin
    .from('posthog_raderingar')
    .select('distinct_id, forsok')
    .order('forsok', { ascending: true })
    .limit(KO_OMGANG)
  if (error) {
    // Tabellen finns inte förrän migreringen körts: då finns ingen kö.
    console.error('[posthogRadering] kön gick inte att läsa:', error.message)
    return { success: false, raderade: 0, kvar: 0, fel: 'kön gick inte att läsa' }
  }
  const rader = (data ?? []) as Array<{ distinct_id: string; forsok: number | null }>
  if (rader.length === 0) return { success: true, raderade: 0, kvar: 0 }

  const ids = rader.map((r) => r.distinct_id)
  const svar = await anropaBulkDelete(ids, NATT_GRANS_MS)
  if (svar.ok) {
    const { error: e } = await admin.from('posthog_raderingar').delete().in('distinct_id', ids)
    if (e) console.error('[posthogRadering] köraderna gick inte att ta bort:', e.message)
    return { success: true, raderade: ids.length, kvar: 0 }
  }

  let nyttTak = 0
  for (const r of rader) {
    const forsok = (r.forsok ?? 0) + 1
    if (forsok === POSTHOG_MAX_FORSOK) nyttTak += 1
    await admin.from('posthog_raderingar').update({ forsok, senaste_fel: svar.fel }).eq('distinct_id', r.distinct_id)
  }
  if (nyttTak > 0) {
    const { loggaAdminFel } = await import('@/lib/admin/collect')
    await loggaAdminFel(
      admin as any,
      'posthog_radering',
      `${nyttTak} raderade konton har inte gått att ta bort ur PostHog efter ${POSTHOG_MAX_FORSOK} försök: ${svar.fel}`,
      { antal: nyttTak }
    )
  }
  return { success: false, raderade: 0, kvar: rader.length, fel: svar.fel }
}
