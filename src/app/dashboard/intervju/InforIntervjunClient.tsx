'use client'

/**
 * Den lilla klientdelen av Inför intervjun (docs/design/rod-trad-prov-spec-2026-09-24.md,
 * avsnitt 3 och 4): mätningen, en gång per sidvisning. Allt synligt
 * renderas på servern, så sidan har ingen klientrundtur efter mount.
 *
 *   interview_hub_viewed   när sidan monterats
 *   next_action_shown      bläckytans handling, surface infor-intervjun
 *   feature_blocked        kvotraden i läget slut
 */

import { useEffect, useRef } from 'react'
import { capture } from '@/lib/analytics/events'

export default function InforIntervjunClient({
  provCount,
  hasProfile,
  scope,
  nextAction,
  kvotSlut,
}: {
  provCount: number
  hasProfile: 'none' | 'sample' | 'full'
  scope: string | null
  nextAction: string
  kvotSlut: boolean
}) {
  const skickad = useRef(false)
  useEffect(() => {
    if (skickad.current) return
    skickad.current = true
    capture('interview_hub_viewed', { prov_count: provCount, has_profile: hasProfile, scope, next_action: nextAction })
    capture('next_action_shown', { kind: nextAction, surface: 'infor-intervjun' })
    if (kvotSlut) capture('feature_blocked', { feature: 'interview_unlimited', scope, surface: 'infor-intervjun' })
  }, [provCount, hasProfile, scope, nextAction, kvotSlut])
  return null
}
