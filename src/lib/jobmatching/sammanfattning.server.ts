/**
 * Sammanfattningen av senaste matchningskörningen (job_matching_summaries,
 * migreringen 20261121200000). Laddarna läser den i första hand och hela
 * körningen i job_matchings_cache bara som reserv, eftersom en körning är
 * upp till 600 annonser och 3,7 MB: läsningen tog 1,5 till 6,6 s per
 * sidladdning (mätt 2026-11-21) och föll på tidsgränsen (8 s) i slutkontrollen.
 *
 * Vilken källa som väljs står i kalla.ts (ren, prövad med vitest). Kort:
 *   - Översikt, Dina brev, Målgången och Skriv brev läser bara
 *     sammanfattningen (läget 'liten').
 *   - Matchade jobb och annonsrutten (läget 'hel') läser hela körningen
 *     högst en gång per förfrågan, och bara när ingen sammanfattning duger.
 *     Då skrivs en ny sammanfattning efter svaret.
 *   - Går läsningen av körningen fel visas sammanfattningen som finns, även
 *     om den är räknad med en äldre sökprofil. Finns ingen säger svaret att
 *     det var ett läsfel, inte att kontot saknar körning.
 *
 * Saknas tabellen (migreringen ej körd) läses hela körningen som förut.
 * Skrivs bara här, med admin-klienten, av anropare som redan kontrollerat
 * sessionen. Bara server.
 */
import 'server-only'
import { cache } from 'react'
import { after } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import type { RankedJob } from '@/app/dashboard/jobbmatchning/data/match-ranking'
import type { ActiveCVData } from '@/app/dashboard/jobbmatchning/getJobbmatchningData'
import type { JobPreferences } from '@/types/user.types'
import { bastaTraffar, prefsNyckel, publicerade } from './basta'
import { CACHE_TTL_MS, valjKalla, valjPoolKalla, valjVidLasfel, type KallaVal, type Lage } from './kalla'

type Klient = any
type Annons = Record<string, any>

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

/* ------------------------------------------------------ körningen i cachen */

interface KorningMeta {
  korningTid: number | null
  adsRead: number | null
  fel: boolean
}

/** Körningens tid ur expires_at. Läser aldrig kolumnen jobs. */
async function lasKorningMeta(supabase: Klient, userId: string, cvId: string): Promise<KorningMeta> {
  const { data, error } = await supabase
    .from('job_matchings_cache')
    .select('expires_at, total_jobs_found')
    .eq('user_id', userId)
    .eq('cv_id', cvId)
    .eq('filter_hash', '')
    .maybeSingle()
  if (error) {
    console.error('[sammanfattning] Kunde inte läsa körningens tid:', error.message)
    return { korningTid: null, adsRead: null, fel: true }
  }
  const rad = data as { expires_at?: string | null; total_jobs_found?: number | null } | null
  const tid = rad?.expires_at ? Date.parse(rad.expires_at) - CACHE_TTL_MS : NaN
  return { korningTid: Number.isFinite(tid) ? tid : null, adsRead: rad?.total_jobs_found ?? null, fel: false }
}

interface HelKorning {
  jobs: Annons[]
  adsRead: number
  korningAt: number | null
}

/**
 * Hela körningen, högst en läsning per förfrågan och konto/CV: sidan och allt
 * den renderar delar samma löfte (React cache gäller en serverrendering; i
 * en API-rutt läser varje anrop för sig, och där läses den bara en gång).
 * 'fel' när läsningen gick fel (oftast tidsgränsen), aldrig ett kast.
 */
const helaKorningar = cache(() => new Map<string, Promise<HelKorning | 'fel'>>())

function lasHelaKorningen(supabase: Klient, userId: string, cvId: string): Promise<HelKorning | 'fel'> {
  const minne = helaKorningar()
  const nyckel = `${userId}|${cvId}`
  const finns = minne.get(nyckel)
  if (finns) return finns
  const lofte = (async (): Promise<HelKorning | 'fel'> => {
    try {
      const { data, error } = await supabase
        .from('job_matchings_cache')
        .select('jobs, total_jobs_found, expires_at')
        .eq('user_id', userId)
        .eq('cv_id', cvId)
        .eq('filter_hash', '')
        .maybeSingle()
      if (error) {
        console.error('[sammanfattning] Kunde inte läsa körningen:', error.message)
        return 'fel'
      }
      const rad = data as { jobs?: unknown; total_jobs_found?: number | null; expires_at?: string | null } | null
      const jobs = Array.isArray(rad?.jobs) ? (rad!.jobs as Annons[]) : []
      const tid = rad?.expires_at ? Date.parse(rad.expires_at) - CACHE_TTL_MS : NaN
      return { jobs, adsRead: rad?.total_jobs_found || jobs.length, korningAt: Number.isFinite(tid) ? tid : null }
    } catch (err) {
      console.error('[sammanfattning] Kunde inte läsa körningen:', err)
      return 'fel'
    }
  })()
  minne.set(nyckel, lofte)
  return lofte
}

/* ------------------------------------------------------------ de bästa */

export interface Basta {
  ranked: RankedJob[]
  adsRead: number
  /** När körningen gjordes (ms): den som listan faktiskt räknas ur. */
  korningAt: number
  cvId: string | null
  kalla: 'sammanfattning' | 'korning'
}

export interface BastaUtfall {
  basta: Basta | null
  /**
   * Läsningen gick fel, och det som visas (om något) är inte hela sanningen.
   * Skiljer "ingen körning finns" (basta null, lasfel falsk) från "vi kunde
   * inte läsa" (lasfel sann).
   */
  lasfel: boolean
}

/**
 * De bästa träffarna för användarens aktiva CV och sökprofil, med källan
 * vald i kalla.ts. Läget 'liten' läser aldrig hela körningen.
 */
export async function hamtaBastaUtfall(
  supabase: Klient,
  userId: string,
  cv: ActiveCVData | null,
  prefs: JobPreferences,
  lage: Lage
): Promise<BastaUtfall> {
  if (!cv) return { basta: null, lasfel: false }
  const nyckel = prefsNyckel(prefs, cv)
  const [samm, meta] = await Promise.all([
    lasSammanfattning(supabase, userId),
    lage === 'hel' ? lasKorningMeta(supabase, userId, cv.cv_id) : Promise.resolve<KorningMeta>({ korningTid: null, adsRead: null, fel: false }),
  ])

  const franSammanfattning = (): Basta => ({
    ranked: bastaTraffar(samm!.jobs ?? [], cv, prefs),
    adsRead: samm!.ads_read,
    korningAt: Date.parse(samm!.korning_at),
    cvId: cv.cv_id,
    kalla: 'sammanfattning',
  })
  const utfall = (val: KallaVal, lasfel: boolean): BastaUtfall | null => {
    if (val.kalla === 'sammanfattning') return { basta: franSammanfattning(), lasfel }
    if (val.kalla === 'ingen') return { basta: null, lasfel: false }
    if (val.kalla === 'lasfel') return { basta: null, lasfel: true }
    return null
  }

  const val = valjKalla({ lage, cvId: cv.cv_id, nyckel, samm, korningTid: meta.korningTid, metaFel: meta.fel })
  const direkt = utfall(val, meta.fel)
  if (direkt) return direkt

  // Hela körningen (bara läget 'hel').
  const hel = await lasHelaKorningen(supabase, userId, cv.cv_id)
  if (hel === 'fel') return utfall(valjVidLasfel(samm, cv.cv_id), true)!
  // Tom rad (rensad): samma som ingen körning.
  if (hel.jobs.length === 0) return utfall(valjKalla({ lage, cvId: cv.cv_id, nyckel, samm, korningTid: null }), false) ?? { basta: null, lasfel: false }

  const korningAt = hel.korningAt ?? meta.korningTid ?? Date.now()
  const ranked = bastaTraffar(hel.jobs, cv, prefs)
  const adsRead = hel.adsRead
  const skriv = () => skrivSammanfattning(userId, { cvId: cv.cv_id, prefsNyckel: nyckel, korningAt, adsRead, ranked })
  try {
    after(skriv)
  } catch {
    void skriv()
  }
  return { basta: { ranked, adsRead, korningAt, cvId: cv.cv_id, kalla: 'korning' }, lasfel: false }
}

/**
 * Som hamtaBastaUtfall men bara träffarna. Standardläget är 'liten': den som
 * vill att hela körningen får läsas säger det.
 */
export async function hamtaBasta(
  supabase: Klient,
  userId: string,
  cv: ActiveCVData | null,
  prefs: JobPreferences,
  lage: Lage = 'liten'
): Promise<Basta | null> {
  return (await hamtaBastaUtfall(supabase, userId, cv, prefs, lage)).basta
}

/**
 * Poolen för klientens filter, "längre bort" och ändrad sökprofil: de 120
 * bästa utan filter ur hela körningen. Är sammanfattningen nyare än
 * körningen (sparningen av körningen föll) ges sammanfattningens annonser,
 * så att listan räknas ur den sökning som gjordes sist. korningAt är tiden
 * för den körning annonserna kommer ur.
 */
export async function hamtaPool(supabase: Klient, userId: string, cv: ActiveCVData | null, max = 120): Promise<{ jobs: Annons[]; adsRead: number; korningAt: number | null } | null> {
  if (!cv) return null
  const [samm, meta] = await Promise.all([lasSammanfattning(supabase, userId), lasKorningMeta(supabase, userId, cv.cv_id)])
  const franSammanfattning = () => ({ jobs: samm!.jobs ?? [], adsRead: samm!.ads_read, korningAt: Date.parse(samm!.korning_at) })
  const val = valjPoolKalla({ samm, cvId: cv.cv_id, korningTid: meta.korningTid, metaFel: meta.fel })
  if (val === 'sammanfattning') return franSammanfattning()
  if (val === 'ingen') return null

  const hel = await lasHelaKorningen(supabase, userId, cv.cv_id)
  if (hel === 'fel' || hel.jobs.length === 0) {
    return valjPoolKalla({ samm, cvId: cv.cv_id, korningTid: null }) === 'sammanfattning' ? franSammanfattning() : null
  }
  const { rankMatches } = await import('@/app/dashboard/jobbmatchning/data/match-ranking')
  const pool = rankMatches(hel.jobs, cv, [], max).ranked.map((r) => r.job)
  return { jobs: pool, adsRead: hel.adsRead, korningAt: hel.korningAt ?? meta.korningTid }
}
