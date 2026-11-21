/**
 * De bästa träffarna ur en matchningskörning, räknade på ett ställe så att
 * Matchade jobb, Översikt, sidomenyn och sammanfattningen alltid visar samma
 * träffar (Jobbsöket omgång 1, rättningsrundan 2026-11-21).
 *
 * Kedjan är listans: preferenserna, grundfiltren (100 km-gränsen räknad från
 * CV:ts ort) och sedan matchgraden, högst 25. Klientsäker och ren.
 */
import { applyClientFilters, applyPreferences } from '@/app/dashboard/jobbmatchning/data/job-filtering'
import { DEFAULT_FILTERS } from '@/app/dashboard/jobbmatchning/data/filter-standard'
import { rankMatches, TOP_N, type RankedJob } from '@/app/dashboard/jobbmatchning/data/match-ranking'
import { buildMatchReasons } from '@/app/dashboard/jobbmatchning/data/match-reasons'
import type { MatchScore } from '@/app/dashboard/jobbmatchning/data/match-score'
import type { ActiveCVData } from '@/app/dashboard/jobbmatchning/getJobbmatchningData'
import type { JobPreferences } from '@/types/user.types'

type Annons = Record<string, any>

/** De bästa träffarna, högst 25, i rangordning. */
export function bastaTraffar(jobs: Annons[], cv: ActiveCVData | null, prefs: JobPreferences): RankedJob[] {
  const filtrerade = applyClientFilters(applyPreferences(jobs, prefs), DEFAULT_FILTERS, false, cv?.extracted_location ?? null)
  return rankMatches(filtrerade, cv, prefs.locations, TOP_N).ranked
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
