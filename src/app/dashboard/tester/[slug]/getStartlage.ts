/**
 * Startskärmens läge för nivåtestet (plan-testflode-2026-11-20 avsnitt 2 och
 * 4.1), läst på servern så att startarket målas rätt ur första HTML:
 *
 *   pagaende  en session utan completed_at från senaste dygnet: knappen blir
 *             "Fortsätt testet" med raden "Du har 9 uppgifter kvar."
 *             Kvoten räknar bara slutförda, så Fortsätt syns alltid.
 *   last      nivån kräver en funktion kontot saknar (avancerad, expert):
 *             betalväggen i kortets plats direkt, utan blink.
 *
 * Null när läsningen inte gick: sidan beter sig då som förut.
 */
import 'server-only'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { getUserScope } from '@/lib/supabase/premiumAccess'
import { scopeHasFeature } from '@/lib/access/features'
import { testTypeForSlug } from '@/lib/tester/testTyp'
import type { TestConfig } from '../testConfig'

export interface Startlage {
  pagaende: { id: string; kvar: number } | null
  last: boolean
}

const DYGN_MS = 24 * 60 * 60 * 1000

/** Svarets nyckel: q_id (figurserier), passage och påstående (verbalt), frågans id (numeriskt, verbalt expert). */
type SvarRad = { q_id?: string; passageId?: string; statementIndex?: number; questionId?: string } | null
function svarsNyckel(a: SvarRad): string | null {
  if (!a) return null
  if (a.q_id) return a.q_id
  if (a.passageId && typeof a.statementIndex === 'number') return `${a.passageId}:${a.statementIndex}`
  return a.questionId ?? null
}

export async function getStartlage(config: TestConfig): Promise<Startlage | null> {
  try {
    const testType = testTypeForSlug(config)
    if (!testType) return null
    const user = await hamtaVerifieradAnvandare()
    if (!user) return null
    const supabase = createServerClient({ cookies: await cookies() })
    const [sessRes, scope] = await Promise.all([
      supabase
        .from('logic_test_v4_sessions')
        .select('id, answers, meta, created_at, completed_at')
        .eq('user_id', user.id)
        .eq('test_type', testType)
        .is('completed_at', null)
        .gte('created_at', new Date(Date.now() - DYGN_MS).toISOString())
        .order('created_at', { ascending: false })
        .limit(1),
      config.requiresFeature ? getUserScope(supabase as never, user.id).catch(() => null) : Promise.resolve(null),
    ])
    const rad = (sessRes.data ?? [])[0] as { id: string; answers: unknown; meta: unknown } | undefined
    const antal = Number((rad?.meta as { antal?: unknown } | null)?.antal) || config.totalQuestions
    const besvarade = Array.isArray(rad?.answers) ? new Set((rad!.answers as SvarRad[]).map(svarsNyckel).filter(Boolean)).size : 0
    const last = config.requiresFeature ? !scopeHasFeature(scope, config.requiresFeature) : false
    return {
      pagaende: rad && besvarade > 0 && besvarade < antal ? { id: rad.id, kvar: antal - besvarade } : rad && besvarade === 0 ? { id: rad.id, kvar: antal } : null,
      last,
    }
  } catch (e) {
    console.error('[testsida] startläget:', e)
    return null
  }
}
