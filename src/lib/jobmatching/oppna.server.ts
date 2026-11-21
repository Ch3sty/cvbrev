/**
 * De bästa träffar som kontot får se i klartext, för sidor utanför Matchade
 * jobb (Målgången, Skriv brev från Ska sökas). Läser bara sammanfattningen
 * (läget 'liten'), aldrig hela körningen. Gratiskonton får de öppna
 * (oppnaTraffar), så att en dold annons aldrig visas i klartext.
 *
 * Bara server.
 */
import 'server-only'
import { userHasAccess } from '@/lib/supabase/premiumAccess'
import { toJobPreferences } from '@/types/user.types'
import type { RankedJob } from '@/app/dashboard/jobbmatchning/data/match-ranking'
import type { ActiveCVData } from '@/app/dashboard/jobbmatchning/getJobbmatchningData'
import { hamtaBasta } from './sammanfattning.server'
import { oppnaTraffar } from './oppna'

export interface OppnaTraffar {
  traffar: RankedJob[]
  cvId: string | null
}

export async function hamtaOppnaTraffar(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string
): Promise<OppnaTraffar | null> {
  const [cvRes, profilRes, premium] = await Promise.all([
    supabase.from('active_cv_for_matching').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('profiles').select('job_preferences').eq('id', userId).maybeSingle(),
    userHasAccess(supabase, userId, 'job_matches_all').catch(() => false),
  ])
  const basta = await hamtaBasta(
    supabase,
    userId,
    (cvRes.data ?? null) as ActiveCVData | null,
    toJobPreferences((profilRes.data as { job_preferences?: unknown } | null)?.job_preferences),
    'liten'
  ).catch(() => null)
  if (!basta) return null
  return { traffar: oppnaTraffar(basta.ranked, premium), cvId: basta.cvId }
}
