/**
 * Gratisraden på nivåtestets startsida (tester v4, ägarens beslut
 * 2026-11-19): ett grundnivåtest om dagen över alla testtyper. Läses på
 * servern ur samma kvot som sessionsrutterna använder (checkGrundnivaQuota),
 * så att sidan säger "1 kvar i dag" eller visar betalväggen redan vid första
 * målningen, även när dagens test gjordes i en annan testtyp.
 *
 * Null för Premium, för nivåer över grund och när läsningen fallerar: då
 * gäller sidans egen kontroll som förut.
 */
import 'server-only'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { arGrundTestTyp, checkGrundnivaQuota } from '@/lib/quota/quotaService'
import { testTypeForSlug } from '@/lib/tester/testTyp'
import type { TestConfig } from '../testConfig'

export interface GrundKvot {
  kvar: number
  nextResetAt: string
}

export async function getGrundKvot(config: TestConfig): Promise<GrundKvot | null> {
  try {
    if (config.level !== 'grund' || config.requiresFeature) return null
    const testType = testTypeForSlug(config)
    if (!testType || !arGrundTestTyp(testType)) return null
    const user = await hamtaVerifieradAnvandare()
    if (!user) return null
    const supabase = createServerClient({ cookies: await cookies() })
    const q = await checkGrundnivaQuota(supabase as never, user.id)
    if (q.isPremium) return null
    return { kvar: Math.max(0, q.limit - q.used), nextResetAt: q.nextResetAt }
  } catch (e) {
    console.error('[testsida] grundnivåkvoten:', e)
    return null
  }
}
