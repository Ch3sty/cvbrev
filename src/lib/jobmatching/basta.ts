/**
 * De bästa träffarna ur en matchningskörning, räknade på ett ställe så att
 * Matchade jobb, Översikt, sidomenyn och sammanfattningen alltid visar samma
 * träffar (Jobbsöket omgång 1, rättningsrundan 2026-11-21).
 *
 * Kedjan är listans: preferenserna, grundfiltren (100 km-gränsen räknad från
 * CV:ts ort och, sedan omgång 2, från sökprofilens orter; se arLangtBort)
 * och sedan matchgraden, högst 25. Ingen tröskel: "N jobb passar
 * dig" är antalet som klarar filtren, högst 25. Klientsäker och ren.
 *
 * Webbläsaren räknar listan med samma funktion (Jobbsöket omgång 2), med
 * filtren i arket och "längre bort" som tillval. Förut hade webbläsaren en
 * egen kopia av kedjan och skickade de 60 bästa utan avståndsgräns som
 * sammanfattning; servern gallrade dem och fick färre träffar än webbläsaren
 * (7 efter sökningen, 2 efter omladdning för ett CV i Umeå).
 */
import { applyClientFilters, applyPreferences } from '@/app/dashboard/jobbmatchning/data/job-filtering'
import { DEFAULT_FILTERS, type JobFilters } from '@/app/dashboard/jobbmatchning/data/filter-standard'
import { rankMatches, TOP_N, type RankedJob } from '@/app/dashboard/jobbmatchning/data/match-ranking'
import { buildMatchReasons } from '@/app/dashboard/jobbmatchning/data/match-reasons'
import type { MatchScore } from '@/app/dashboard/jobbmatchning/data/match-score'
import type { ActiveCVData } from '@/app/dashboard/jobbmatchning/getJobbmatchningData'
import type { JobPreferences } from '@/types/user.types'

type Annons = Record<string, any>

/** Det bara webbläsaren väljer: filtren i arket och "längre bort". Utan dem gäller grundläget. */
export interface BastaVal {
  filters?: JobFilters
  visaLangtBort?: boolean
}

/** De bästa träffarna, högst 25, i rangordning. */
export function bastaTraffar(jobs: Annons[], cv: ActiveCVData | null, prefs: JobPreferences, val: BastaVal = {}): RankedJob[] {
  const filtrerade = applyClientFilters(
    applyPreferences(jobs, prefs),
    val.filters ?? DEFAULT_FILTERS,
    val.visaLangtBort ?? false,
    cv?.extracted_location ?? null,
    prefs.locations
  )
  return rankMatches(filtrerade, cv, prefs.locations, TOP_N).ranked
}

/**
 * Annonserna som webbläsaren skickar som sammanfattning efter en sökning:
 * de bästa enligt bastaTraffar i grundläget. Servern räknar om dem med samma
 * funktion och får samma träffar, eftersom filtren gäller annons för annons
 * och ordningen inte beror på i vilken ordning annonserna kommer in.
 */
export function sammanfattningsJobb(jobs: Annons[], cv: ActiveCVData | null, prefs: JobPreferences): Annons[] {
  return bastaTraffar(jobs, cv, prefs).map((r) => r.job)
}

/**
 * Poolen för filtren, "längre bort" och en ändrad sökprofil, och det som
 * sparas lokalt efter en sökning: först de bästa enligt bastaTraffar (så att
 * listan i grundläget blir densamma som innan poolen hämtades), sedan de max
 * bästa inom 100 km och de max bästa utan avståndsgräns. Förut var poolen
 * bara de 120 bästa utan avståndsgräns; för ett CV i Umeå kunde nästan alla
 * ligga i Stockholm, och de närmare träffarna föll bort när poolen hämtades.
 */
export function poolUrval(jobs: Annons[], cv: ActiveCVData | null, prefs: JobPreferences, max = 120): Annons[] {
  const nara = applyClientFilters(jobs, DEFAULT_FILTERS, false, cv?.extracted_location ?? null, prefs.locations)
  const ut: Annons[] = []
  const sedda = new Set<string>()
  const lagg = (lista: Annons[]) => {
    for (const j of lista) {
      const id = String(j.id ?? '')
      if (sedda.has(id)) continue
      sedda.add(id)
      ut.push(j)
    }
  }
  lagg(sammanfattningsJobb(jobs, cv, prefs))
  lagg(rankMatches(nara, cv, [], max).ranked.map((r) => r.job))
  lagg(rankMatches(jobs, cv, [], max).ranked.map((r) => r.job))
  return ut
}

/**
 * Nyckeln för det en sammanfattning räknades med: sökprofilen och CV:ts
 * inläsning. Ändras någon av dem gäller inte sammanfattningen längre.
 */
export function prefsNyckel(prefs: JobPreferences, cv: ActiveCVData | null): string {
  return JSON.stringify({
    l: [...prefs.locations].sort(),
    r: prefs.remote,
    e: prefs.extent,
    m: prefs.min_salary,
    cv: cv?.cv_id ?? null,
    p: cv?.parsed_at ?? null,
  })
}

/** En träff som listan ritar den, utan annonsens text. */
export interface LattRad {
  id: string
  headline: string
  employer: string
  municipality: string | null
  publication_date: string | null
  application_deadline: string | null
  /** Annonsens egen adress till ansökan. */
  url: string | null
  score: MatchScore
  reasons: string[]
}

export function lattRad(r: RankedJob, cv: ActiveCVData | null, orter: string[]): LattRad {
  const j = r.job
  const url = j.application_details?.url || j.application_url || j.webpage_url || null
  return {
    id: String(j.id ?? ''),
    headline: String(j.headline ?? ''),
    employer: String(j.employer?.name ?? ''),
    municipality: j.workplace_address?.municipality || j.workplace_address?.region || null,
    publication_date: typeof j.publication_date === 'string' ? j.publication_date : null,
    application_deadline: typeof j.application_deadline === 'string' ? j.application_deadline : null,
    url: typeof url === 'string' ? url : null,
    score: r.score,
    reasons: buildMatchReasons(j, cv, orter, r.score).reasons,
  }
}

/** Publiceringstiderna för de bästa träffarna, för "N nya". */
export function publicerade(ranked: readonly RankedJob[]): (string | null)[] {
  return ranked.map((r) => (typeof r.job.publication_date === 'string' ? r.job.publication_date : null))
}
