'use client'

/**
 * Hämtar det TestResultBridge behöver och renderar bryggan (B6).
 *
 * Resultatsidorna ska bara behöva en rad. Allt som kan fallera här faller
 * tillbaka på variant 1 i stället för att blockera resultatet.
 */

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client-manager'
import TestResultBridge from './TestResultBridge'

interface TestResultBridgeContainerProps {
  testSlug: string
  /** Kvotnyckel för variant 2b, matchar testsidans quota_exceeded-svar. */
  quotaFeature?: string
}

interface BridgeData {
  hasCv: boolean
  isPremium: boolean
  sessionsToday?: number
  userId?: string
  trialEndsAt?: string | null
}

export default function TestResultBridgeContainer({
  testSlug,
  quotaFeature,
}: TestResultBridgeContainerProps) {
  const [data, setData] = useState<BridgeData | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const supabase = getSupabaseClient()
        const { data: auth } = await supabase.auth.getUser()
        const user = auth?.user
        if (!user) {
          if (!cancelled) setData({ hasCv: false, isPremium: false })
          return
        }

        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const [{ count: cvCount }, { data: profile }, sessionsRes] = await Promise.all([
          supabase
            .from('cv_texts')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('profiles')
            .select('subscription_tier, premium_until, premium_source')
            .eq('id', user.id)
            .maybeSingle(),
          fetch('/api/logicTestV4/session')
            .then((res) => (res.ok ? res.json() : null))
            .catch(() => null),
        ])

        const isPremium = !!(
          profile?.subscription_tier === 'premium' ||
          (profile?.premium_until && new Date(profile.premium_until) > new Date())
        )

        const isTrial =
          profile?.premium_source === 'signup_trial' ||
          profile?.premium_source === 'oauth_signup_trial'

        let sessionsToday: number | undefined
        if (sessionsRes?.sessions && Array.isArray(sessionsRes.sessions)) {
          sessionsToday = sessionsRes.sessions.filter((s: { completed_at?: string }) => {
            if (!s.completed_at) return false
            return new Date(s.completed_at) >= startOfDay
          }).length
        }

        if (!cancelled) {
          setData({
            hasCv: (cvCount || 0) > 0,
            isPremium,
            sessionsToday,
            userId: user.id,
            trialEndsAt: isTrial ? profile?.premium_until ?? null : null,
          })
        }
      } catch {
        if (!cancelled) setData({ hasCv: false, isPremium: false })
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (!data) return null

  return (
    <TestResultBridge
      testSlug={testSlug}
      hasCv={data.hasCv}
      isPremium={data.isPremium}
      sessionsToday={data.sessionsToday}
      userId={data.userId}
      trialEndsAt={data.trialEndsAt}
      quota={
        quotaFeature
          ? { feature: quotaFeature, nextResetAt: nextMidnight() }
          : undefined
      }
    />
  )
}

/** Kvoterna nollställs vid midnatt svensk tid. */
function nextMidnight(): string {
  const next = new Date()
  next.setHours(24, 0, 0, 0)
  return next.toISOString()
}
