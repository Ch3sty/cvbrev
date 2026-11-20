// Personlighetstestets sparade svar, lästa på servern så att första
// påståendet målas ur första HTML (plan-testflode-2026-11-20 avsnitt 1, Fel
// och laddning; etapp 4). Samma rad och samma ägarkontroll som GET
// /api/personalityTest/answer. Null när läsningen inte gick: vyn hämtar då
// själv som förut.

import 'server-only'
import { cookies } from 'next/headers'
import { unstable_rethrow } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { getUserScope } from '@/lib/supabase/premiumAccess'
import { scopeHasFeature, type Feature } from '@/lib/access/features'
import type { BigFiveScores, FacetScores, PersonalityTestType } from './types'

/** Ett avslutat försök på startskärmen. */
export interface PersonlighetForsok {
  id: string
  scores: BigFiveScores | null
  completed_at: string
}

/**
 * Startskärmens läge (etapp 5), läst på servern så att den målas rätt ur
 * första HTML: avslutade försök (den senaste profilen), en påbörjad session
 * att fortsätta och om nivån är låst. Samma tabell och ägarkontroll som GET
 * /api/personalityTest/session. Null när läsningen inte gick.
 */
export interface PersonlighetStartlage {
  forsok: PersonlighetForsok[]
  pagaende: { id: string; kvar: number } | null
  last: boolean
}

const VECKA_MS = 7 * 24 * 60 * 60 * 1000

export async function lasPersonlighetStart(
  testType: PersonalityTestType,
  antal: number,
  kravs: Feature | null
): Promise<PersonlighetStartlage | null> {
  try {
    const user = await hamtaVerifieradAnvandare()
    if (!user) return null
    const supabase = createServerClient({ cookies: await cookies() })
    const [res, scope] = await Promise.all([
      supabase
        .from('personality_test_sessions')
        .select('id, scores, answers, completed_at, created_at')
        .eq('user_id', user.id)
        .eq('test_type', testType)
        .order('created_at', { ascending: false })
        .limit(30),
      kravs ? getUserScope(supabase as never, user.id).catch(() => null) : Promise.resolve(null),
    ])
    if (res.error) return null
    type Rad = { id: string; scores: BigFiveScores | null; answers: unknown; completed_at: string | null; created_at: string }
    const rader = (res.data ?? []) as Rad[]
    const forsok = rader
      .filter((r) => r.completed_at)
      .map((r) => ({ id: r.id, scores: r.scores, completed_at: r.completed_at as string }))
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
    // Fortsätt: den senaste sessionen, om den inte är avslutad och är från senaste veckan.
    const senaste = rader[0]
    let pagaende: PersonlighetStartlage['pagaende'] = null
    if (senaste && !senaste.completed_at && Date.now() - new Date(senaste.created_at).getTime() < VECKA_MS) {
      const besvarade = Array.isArray(senaste.answers)
        ? new Set((senaste.answers as { questionId?: unknown }[]).map((a) => a?.questionId).filter(Boolean)).size
        : 0
      if (besvarade < antal) pagaende = { id: senaste.id, kvar: antal - besvarade }
    }
    const last = kravs ? !scopeHasFeature(scope, kravs) : false
    return { forsok, pagaende, last }
  } catch (e) {
    // Next signalerar dynamisk rendering med ett fel; det får inte sväljas.
    unstable_rethrow(e)
    console.error('[personlighet] startläget:', e)
    return null
  }
}

/** Resultatet för en session, med facetterna (avancerad). Null när det inte finns. */
export interface PersonlighetResultat {
  id: string
  scores: BigFiveScores | null
  facet_scores: FacetScores | null
  completed_at: string | null
  time_spent: number | null
}

export async function lasPersonlighetResultat(sessionId: string, testType: PersonalityTestType): Promise<PersonlighetResultat | null> {
  try {
    const user = await hamtaVerifieradAnvandare()
    if (!user) return null
    const supabase = createServerClient({ cookies: await cookies() })
    const { data, error } = await supabase
      .from('personality_test_sessions')
      .select('id, scores, facet_scores, completed_at, time_spent')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .eq('test_type', testType)
      .maybeSingle()
    if (error || !data) return null
    return data as PersonlighetResultat
  } catch (e) {
    unstable_rethrow(e)
    return null
  }
}

export interface PersonlighetSparade {
  answers: unknown[]
  completed: boolean
}

export async function lasPersonlighetSvar(sessionId: string): Promise<PersonlighetSparade | null> {
  try {
    const user = await hamtaVerifieradAnvandare()
    if (!user) return null
    const supabase = createServerClient({ cookies: await cookies() })
    const { data, error } = await supabase
      .from('personality_test_sessions')
      .select('answers, completed_at')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .maybeSingle()
    if (error || !data) return null
    const rad = data as { answers: unknown; completed_at: string | null }
    return { answers: Array.isArray(rad.answers) ? rad.answers : [], completed: Boolean(rad.completed_at) }
  } catch {
    return null
  }
}
