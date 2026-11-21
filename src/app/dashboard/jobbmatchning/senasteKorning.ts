/**
 * Senaste matchningskörningen, läst på servern så att Matchade jobb visar
 * träffarna i första HTML (Jobbsöket omgång 1, etapp 2A, F7). Förut visade
 * sidan "Vi har inte letat än" tills användaren tryckte, eller återställde
 * en sökning ur sessionStorage; en länk från Översikt till en vald annons
 * hade då inget att visa.
 *
 * Inget om matchningen ändras. Körningen är den edge-funktionen match-jobs
 * sparat i job_matchings_cache, poängen räknas med samma funktioner som
 * klienten (rankMatches efter preferenserna och grundfiltren), och vad
 * gratisnivån får se avgörs med samma regel och samma behörighet som POST
 * /api/jobs/redact (job_matches_all, tre i klartext, fem suddade rader).
 *
 * Gratisnivån får bara de tre öppna annonserna i svaret, aldrig de dolda:
 * deras text ska inte ligga i sidans HTML. Premium får de 60 bästa, samma
 * antal som klienten sparar i sessionStorage, så filtren har något att
 * arbeta med.
 *
 * Bara server.
 */
import 'server-only'
import { userHasAccess } from '@/lib/supabase/premiumAccess'
import { FREE_TIER_JOB_LIMIT } from '@/lib/jobmatching/freeLimit'
import { REDACTED_PREVIEW_COUNT, type JobRedactionResult } from '@/app/api/jobs/redact/route'
import type { JobPreferences } from '@/types/user.types'
import { applyClientFilters, applyPreferences } from './data/job-filtering'
import { DEFAULT_FILTERS } from './data/filter-standard'
import { rankMatches, TOP_N } from './data/match-ranking'
import type { ActiveCVData } from './getJobbmatchningData'

/** Samma tak som klientens sparade sökning (SAVED_SEARCH_MAX_JOBS). */
export const KORNING_MAX_JOBB = 60

export interface SenasteKorning {
  jobs: Array<Record<string, any>>
  /** Annonser körningen läste. */
  adsRead: number
  /** När körningen gjordes, i millisekunder. */
  savedAt: number
  cvId: string | null
  /** Vad som får visas, uträknat som /api/jobs/redact gör. */
  redaction: JobRedactionResult
  /** Gratisnivån: bara de öppna annonserna finns med; suddningen får inte räknas om på klienten. */
  trimmad: boolean
}

export async function hamtaSenasteKorning(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  activeCV: ActiveCVData | null,
  prefs: JobPreferences
): Promise<SenasteKorning | null> {
  if (!activeCV) return null
  const [cacheRes, premium] = await Promise.all([
    supabase
      .from('job_matchings_cache')
      .select('jobs, created_at, cv_id, total_jobs_found')
      .eq('user_id', userId)
      .eq('cv_id', activeCV.cv_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    userHasAccess(supabase, userId, 'job_matches_all').catch(() => false),
  ])
  if (cacheRes.error) {
    console.error('Jobbmatchning: kunde inte läsa senaste körningen', cacheRes.error)
    return null
  }
  const rad = cacheRes.data as { jobs?: unknown; created_at?: string; cv_id?: string; total_jobs_found?: number | null } | null
  const alla = Array.isArray(rad?.jobs) ? (rad!.jobs as Array<Record<string, any>>) : []
  if (alla.length === 0) return null

  // Samma kedja som klienten: preferenserna, grundfiltren, sedan matchgraden.
  const filtrerade = applyClientFilters(applyPreferences(alla, prefs), DEFAULT_FILTERS, false)
  const pool = rankMatches(filtrerade, activeCV, prefs.locations, KORNING_MAX_JOBB).ranked.map((r) => r.job)
  const { ranked } = rankMatches(pool, activeCV, prefs.locations, TOP_N)

  let redaction: JobRedactionResult
  let jobs = pool
  if (premium) {
    redaction = { isPremium: true, visibleIds: ranked.map((r) => String(r.job.id ?? '')).filter(Boolean), redacted: [], hiddenCount: 0 }
  } else {
    const oppna = ranked.slice(0, FREE_TIER_JOB_LIMIT)
    const dolda = ranked.slice(FREE_TIER_JOB_LIMIT)
    redaction = {
      isPremium: false,
      visibleIds: oppna.map((r) => String(r.job.id ?? '')).filter(Boolean),
      redacted: dolda.slice(0, REDACTED_PREVIEW_COUNT).map((r, i) => ({ placeholderId: `dold-${i}`, relevance: Math.round(r.score.score) })),
      hiddenCount: dolda.length,
    }
    jobs = oppna.map((r) => r.job)
  }

  return {
    jobs,
    adsRead: rad?.total_jobs_found || alla.length,
    savedAt: rad?.created_at ? Date.parse(rad.created_at) : Date.now(),
    cvId: rad?.cv_id ?? activeCV.cv_id,
    redaction,
    trimmad: !premium,
  }
}
