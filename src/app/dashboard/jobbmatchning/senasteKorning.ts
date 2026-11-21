/**
 * Senaste matchningskörningen för Matchade jobb, läst på servern så att
 * träffarna står i första HTML (Jobbsöket omgång 1, F7).
 *
 * Sidan skickar aldrig hela körningen till webbläsaren (rättningsrundan
 * 2026-11-21): bara listans rader (titel, arbetsgivare, ort, datum,
 * matchgrad och skäl) och den valda annonsen i sin helhet. Övriga annonser
 * hämtas när användaren öppnar dem (/api/jobbmatchning/annons), och poolen
 * först när hon filtrerar, vill se längre bort eller ändrar sökprofilen
 * (/api/jobbmatchning/pool).
 *
 * De bästa träffarna läses ur sammanfattningen (hamtaBastaUtfall, läget
 * 'hel'), med hela körningen som reserv, högst en gång per förfrågan.
 * savedAt är tiden för den körning raderna faktiskt kommer ur. Vad
 * gratisnivån får se avgörs med samma regel och
 * samma behörighet som POST /api/jobs/redact (job_matches_all, tre i
 * klartext, fem suddade rader).
 *
 * Bara server.
 */
import 'server-only'
import { userHasAccess } from '@/lib/supabase/premiumAccess'
import { FREE_TIER_JOB_LIMIT, REDACTED_PREVIEW_COUNT } from '@/lib/jobmatching/freeLimit'
import { hamtaBastaUtfall } from '@/lib/jobmatching/sammanfattning.server'
import { lattRad, type LattRad } from '@/lib/jobmatching/basta'
import type { JobRedactionResult } from '@/app/api/jobs/redact/route'
import type { JobPreferences } from '@/types/user.types'
import type { ActiveCVData } from './getJobbmatchningData'

export interface SenasteKorning {
  /** Listans rader: alla bästa (Premium) eller de öppna (gratis). */
  rader: LattRad[]
  /** Den valda annonsen i sin helhet (adressens, annars den första öppna). */
  vald: Record<string, any> | null
  /** Annonser körningen läste. */
  adsRead: number
  /** När körningen gjordes, i millisekunder. */
  savedAt: number
  cvId: string | null
  /** Vad som får visas, uträknat som /api/jobs/redact gör. */
  redaction: JobRedactionResult
}

export interface SenasteKorningUtfall {
  korning: SenasteKorning | null
  /**
   * Läsningen gick fel och det fanns ingen sammanfattning att visa. Sidan
   * säger då att det gick fel, inte "Vi har inte letat än".
   */
  lasfel: boolean
}

export async function hamtaSenasteKorning(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  activeCV: ActiveCVData | null,
  prefs: JobPreferences,
  annonsId: string | null = null
): Promise<SenasteKorningUtfall> {
  if (!activeCV) return { korning: null, lasfel: false }
  const [utfall, premium] = await Promise.all([
    hamtaBastaUtfall(supabase, userId, activeCV, prefs, 'hel'),
    userHasAccess(supabase, userId, 'job_matches_all').catch(() => false),
  ])
  const basta = utfall.basta
  if (!basta || basta.ranked.length === 0) return { korning: null, lasfel: utfall.lasfel }
  const { ranked } = basta

  const oppna = premium ? ranked : ranked.slice(0, FREE_TIER_JOB_LIMIT)
  const dolda = premium ? [] : ranked.slice(FREE_TIER_JOB_LIMIT)
  const redaction: JobRedactionResult = {
    isPremium: premium,
    visibleIds: oppna.map((r) => String(r.job.id ?? '')).filter(Boolean),
    redacted: dolda.slice(0, REDACTED_PREVIEW_COUNT).map((r, i) => ({ placeholderId: `dold-${i}`, relevance: Math.round(r.score.score) })),
    hiddenCount: dolda.length,
  }
  const vald = (annonsId ? oppna.find((r) => String(r.job.id) === annonsId) : null) ?? oppna[0] ?? null

  return {
    korning: {
      rader: oppna.map((r) => lattRad(r, activeCV, prefs.locations)),
      vald: vald?.job ?? null,
      adsRead: basta.adsRead,
      savedAt: basta.korningAt,
      cvId: basta.cvId,
      redaction,
    },
    lasfel: false,
  }
}
