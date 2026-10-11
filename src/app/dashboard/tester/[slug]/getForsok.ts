/**
 * Testsidans försök, lästa på servern i samma svar som HTML (mönstret i
 * getHubData.ts). Förut hämtade sidan dem med fetch efter hydrering och
 * reserverade en tom rad medan de laddade; nu står bästa resultatet och
 * serien rätt från första målningen.
 *
 * Bara färdiga sessioner, nyast först. null när läsningen inte gick: sidan
 * hämtar då själv via testets session-API, som förut.
 */
import 'server-only'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { testTypeForSlug } from '@/lib/tester/testTyp'
import type { TestConfig } from '../testConfig'

export interface Forsok {
  id: string
  score: number | null
  time_spent: number | null
  completed_at: string | null
  meta?: unknown
}

/** Fler än så visas aldrig i detaljlistan. */
const MAX = 50

export async function getForsok(config: TestConfig): Promise<Forsok[] | null> {
  const testType = testTypeForSlug(config)
  if (!testType) return null
  try {
    const user = await hamtaVerifieradAnvandare()
    if (!user) return null
    const supabase = createServerClient({ cookies: await cookies() })
    const { data, error } = await supabase
      .from('logic_test_v4_sessions')
      .select('id, score, time_spent, completed_at, meta')
      .eq('user_id', user.id)
      .eq('test_type', testType)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(MAX)
    if (error) return null
    return (data ?? []) as Forsok[]
  } catch (error) {
    console.error('Testsidan: kunde inte läsa försöken', error)
    return null
  }
}
