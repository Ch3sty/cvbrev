/**
 * Vilka av de bästa träffarna kontot får se i klartext: alla med Premium
 * (behörigheten job_matches_all), annars de FREE_TIER_JOB_LIMIT första.
 * Samma regel som Matchade jobb (senasteKorning.ts), /api/jobbmatchning/annons
 * och /api/jobs/redact. Ren funktion, går att använda överallt.
 */
import { FREE_TIER_JOB_LIMIT } from './freeLimit'

export function oppnaTraffar<T>(basta: readonly T[], premium: boolean): T[] {
  return premium ? [...basta] : basta.slice(0, FREE_TIER_JOB_LIMIT)
}
