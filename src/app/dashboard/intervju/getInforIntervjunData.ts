/**
 * En serverhämtning för Inför intervjun (docs/design/rod-trad-prov-spec-2026-09-24.md,
 * avsnitt 5): proven, smakprovet, den riktiga profilen, dagens kvot och
 * scopet, parallellt. Ingen klientrundtur efter mount.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { scopeHasFeature, type Scope } from '@/lib/access/features'
import { getUserScope } from '@/lib/supabase/premiumAccess'
import { checkDailyInterviewQuota } from '@/lib/quota/quotaService'
import { hamtaProv, hamtaSenasteSmakprov, type SmakprovSammanfattning } from '@/lib/intervju/data'
import { valjHubbHandling, type HubbHandling, type ProvSammanfattning } from '@/lib/intervju/nasta'
import type { BigFiveScores } from '@/lib/personalityTest/types'

export interface RiktigProfil {
  scores: BigFiveScores
  testType: 'personlighet-grund' | 'personlighet-avancerad'
  sessionId: string | null
  completedAt: string | null
  facets: Record<string, number> | null
}

export interface InforIntervjunData {
  prov: ProvSammanfattning[]
  smakprov: SmakprovSammanfattning | null
  profil: RiktigProfil | null
  scope: Scope | null
  utanTak: boolean
  harFordjupat: boolean
  kvotKvar: boolean
  handling: HubbHandling
}

export async function getInforIntervjunData(
  supabase: SupabaseClient<any>,
  admin: SupabaseClient<any>,
  userId: string
): Promise<InforIntervjunData> {
  const [prov, smakprov, profilRes, sessionRes, kvot, scope] = await Promise.all([
    hamtaProv(admin, userId, 20),
    hamtaSenasteSmakprov(admin, userId),
    supabase
      .from('user_personality_profile')
      .select('source_session_id, source_test_type, openness, conscientiousness, extraversion, agreeableness, neuroticism, facet_scores')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('personality_test_sessions')
      .select('id, test_type, completed_at')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    checkDailyInterviewQuota(admin, userId),
    getUserScope(supabase, userId).catch(() => null),
  ])

  const p = profilRes.data as Record<string, unknown> | null
  const s = sessionRes.data as { id: string; test_type: string; completed_at: string } | null
  const profil: RiktigProfil | null = p
    ? {
        scores: {
          openness: Number(p.openness),
          conscientiousness: Number(p.conscientiousness),
          extraversion: Number(p.extraversion),
          agreeableness: Number(p.agreeableness),
          neuroticism: Number(p.neuroticism),
        },
        testType: p.source_test_type === 'personlighet-avancerad' ? 'personlighet-avancerad' : 'personlighet-grund',
        sessionId: (p.source_session_id as string | null) ?? s?.id ?? null,
        completedAt: s?.completed_at ?? null,
        facets: (p.facet_scores as Record<string, number> | null) ?? null,
      }
    : null

  const utanTak = scopeHasFeature(scope, 'interview_unlimited')
  const kvotKvar = utanTak || kvot.allowed

  return {
    prov,
    smakprov,
    profil,
    scope,
    utanTak,
    harFordjupat: scopeHasFeature(scope, 'tests_above_base'),
    kvotKvar,
    handling: valjHubbHandling({ prov, kvotKvar, harSmakprov: Boolean(smakprov), harProfil: Boolean(profil) }),
  }
}
