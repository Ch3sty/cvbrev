/**
 * Sammanfattningen av senaste matchningskörningen (job_matching_summaries,
 * migreringen 20261121200000). Laddarna läser den i första hand och hela
 * körningen i job_matchings_cache bara som reserv, eftersom en körning är
 * upp till 600 annonser och 3,3 MB: läsningen tog 1,5 till 6,6 s per
 * sidladdning (mätt 2026-11-21).
 *
 * En sammanfattning gäller när CV:t, sökprofilen och filtren är desamma och
 * den inte är äldre än körningen i cachetabellen. Annars räknas den om ur
 * hela körningen och skrivs efter svaret.
 *
 * Saknas tabellen (migreringen ej körd) läses hela körningen som förut.
 * Skrivs bara här, med admin-klienten, av anropare som redan kontrollerat
 * sessionen. Bara server.
 */
import 'server-only'
import { after } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import type { RankedJob } from '@/app/dashboard/jobbmatchning/data/match-ranking'
import type { ActiveCVData } from '@/app/dashboard/jobbmatchning/getJobbmatchningData'
import type { JobPreferences } from '@/types/user.types'
import { bastaTraffar, prefsNyckel, publicerade } from './basta'

type Klient = any
type Annons = Record<string, any>

/** Cachen sparas en timme (match-jobs): körningens tid är expires_at minus en timme. */
const CACHE_TTL_MS = 60 * 60 * 1000
/** Marginal mellan körningens tid och sammanfattningens, för klockor och skrivtid. */
const MARGINAL_MS = 5 * 60 * 1000

let tabellSaknas = false

function schemaFel(e: { code?: string } | null | undefined): boolean {
  return !!e && (e.code === '42P01' || e.code === 'PGRST205' || e.code === '42703' || e.code === 'PGRST204')
}

export interface SammanfattningRad {
  user_id: string
  cv_id: string | null
  filter_hash: string
  prefs_nyckel: string
  korning_at: string
  ads_read: number
  antal_basta: number
  publicerade: (string | null)[]
  jobs: Annons[]
}

export async function lasSammanfattning(supabase: Klient, userId: string, kolumner = '*'): Promise<SammanfattningRad | null> {
  if (tabellSaknas) return null
  const { data, error } = await supabase.from('job_matching_summaries').select(kolumner).eq('user_id', userId).maybeSingle()
  if (error) {
    if (schemaFel(error)) tabellSaknas = true
    else console.error('[sammanfattning] Kunde inte läsa:', error.message)
    return null
  }
  return (data ?? null) as SammanfattningRad | null
}

/** Skriver sammanfattningen (en rad per konto). Tyst vid fel: den är bara en genväg. */
export async function skrivSammanfattning(
  userId: string,
  r: { cvId: string | null; filterHash?: string; prefsNyckel: string; korningAt: number; adsRead: number; ranked: RankedJob[] }
): Promise<boolean> {
  if (tabellSaknas) return false
  const { error } = await (getSupabaseAdmin() as Klient).from('job_matching_summaries').upsert(
    {
      user_id: userId,
      cv_id: r.cvId,
      filter_hash: r.filterHash ?? '',
      prefs_nyckel: r.prefsNyckel,
      korning_at: new Date(r.korningAt).toISOString(),
      ads_read: Math.max(0, Math.round(r.adsRead)),
      antal_basta: r.ranked.length,
      publicerade: publicerade(r.ranked),
      jobs: r.ranked.map((x) => x.job),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )
  if (error) {
    if (schemaFel(error)) tabellSaknas = true
    else console.error('[sammanfattning] Kunde inte skriva:', error.message)
    return false
  }
  return true
}

export interface Basta {
  ranked: RankedJob[]
  adsRead: number
  /** När körningen gjordes (ms). */
  korningAt: number
  cvId: string | null
  kalla: 'sammanfattning' | 'korning'
}

/**
 * De bästa träffarna för användarens aktiva CV och sökprofil: ur
 * sammanfattningen när den gäller, annars ur hela körningen (och då skrivs
 * en ny sammanfattning efter svaret).
 */
export async function hamtaBasta(supabase: Klient, userId: string, cv: ActiveCVData | null, prefs: JobPreferences): Promise<Basta | null> {
  if (!cv) return null
  const nyckel = prefsNyckel(prefs, cv)
  const [samm, metaRes] = await Promise.all([
    lasSammanfattning(supabase, userId),
    supabase
      .from('job_matchings_cache')
      .select('expires_at, total_jobs_found')
      .eq('user_id', userId)
      .eq('cv_id', cv.cv_id)
      .eq('filter_hash', '')
      .maybeSingle(),
  ])
  const meta = metaRes.data as { expires_at?: string | null; total_jobs_found?: number | null } | null
  const korningTid = meta?.expires_at ? Date.parse(meta.expires_at) - CACHE_TTL_MS : null

  const sammTid = samm ? Date.parse(samm.korning_at) : NaN
  const sammForCv = samm && samm.cv_id === cv.cv_id && samm.filter_hash === '' && Number.isFinite(sammTid)
  const inteAldre = korningTid === null || (sammForCv && sammTid >= korningTid - MARGINAL_MS)

  if (sammForCv && inteAldre && samm!.prefs_nyckel === nyckel) {
    return { ranked: bastaTraffar(samm!.jobs ?? [], cv, prefs), adsRead: samm!.ads_read, korningAt: sammTid, cvId: cv.cv_id, kalla: 'sammanfattning' }
  }

  // Reserven: hela körningen.
  if (korningTid !== null) {
    const { data, error } = await supabase
      .from('job_matchings_cache')
      .select('jobs, total_jobs_found')
      .eq('user_id', userId)
      .eq('cv_id', cv.cv_id)
      .eq('filter_hash', '')
      .maybeSingle()
    if (error) {
      console.error('[sammanfattning] Kunde inte läsa körningen:', error.message)
      return null
    }
    const alla = Array.isArray((data as { jobs?: unknown } | null)?.jobs) ? ((data as { jobs: Annons[] }).jobs) : []
    if (alla.length === 0) return null
    const ranked = bastaTraffar(alla, cv, prefs)
    const adsRead = (data as { total_jobs_found?: number | null }).total_jobs_found || alla.length
    try {
      after(() => skrivSammanfattning(userId, { cvId: cv.cv_id, prefsNyckel: nyckel, korningAt: korningTid, adsRead, ranked }))
    } catch {
      void skrivSammanfattning(userId, { cvId: cv.cv_id, prefsNyckel: nyckel, korningAt: korningTid, adsRead, ranked })
    }
    return { ranked, adsRead, korningAt: korningTid, cvId: cv.cv_id, kalla: 'korning' }
  }

  // Ingen körning i cachen (sparningen kan ha fallit på tidsgränsen) men en
  // sammanfattning från klientens sökning: den gäller, omräknad med sökprofilen.
  if (sammForCv) {
    return { ranked: bastaTraffar(samm!.jobs ?? [], cv, prefs), adsRead: samm!.ads_read, korningAt: sammTid, cvId: cv.cv_id, kalla: 'sammanfattning' }
  }
  return null
}

/** Hela körningen (för klientens filter, "längre bort" och ändrad sökprofil), de 120 bästa utan filter. */
export async function hamtaPool(supabase: Klient, userId: string, cv: ActiveCVData | null, max = 120): Promise<{ jobs: Annons[]; adsRead: number; korningAt: number | null } | null> {
  if (!cv) return null
  const { data, error } = await supabase
    .from('job_matchings_cache')
    .select('jobs, total_jobs_found, expires_at')
    .eq('user_id', userId)
    .eq('cv_id', cv.cv_id)
    .eq('filter_hash', '')
    .maybeSingle()
  if (error) {
    console.error('[sammanfattning] Kunde inte läsa körningen:', error.message)
    return null
  }
  const rad = data as { jobs?: unknown; total_jobs_found?: number | null; expires_at?: string | null } | null
  const alla = Array.isArray(rad?.jobs) ? (rad!.jobs as Annons[]) : []
  if (alla.length === 0) {
    const samm = await lasSammanfattning(supabase, userId)
    if (samm && samm.cv_id === cv.cv_id) return { jobs: samm.jobs ?? [], adsRead: samm.ads_read, korningAt: Date.parse(samm.korning_at) }
    return null
  }
  const { rankMatches } = await import('@/app/dashboard/jobbmatchning/data/match-ranking')
  const pool = rankMatches(alla, cv, [], max).ranked.map((r) => r.job)
  return { jobs: pool, adsRead: rad?.total_jobs_found || alla.length, korningAt: rad?.expires_at ? Date.parse(rad.expires_at) - CACHE_TTL_MS : null }
}
