// src/hooks/useCvQuota.ts
/**
 * Hook for checking CV quota limits based on subscription tier.
 *
 * Free users: 2 aktiva CV (de senaste). Övriga blir "låsta".
 * Premium users: 50 CV — i praktiken alla är aktiva.
 *
 * Returnerar både kvot-info och en `isLocked(cvId)`-helper för komponenter
 * som behöver avgöra om ett specifikt CV är låst.
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getActiveCvIds } from '@/lib/cv/cv-quota'

interface CvQuota {
  cvCount: number
  maxCvs: number
  canSave: boolean
  /** Set med ID för CV som är LÅSTA (inte aktiva) */
  lockedCvIds: Set<string>
  /** Bekvämlighets-helper */
  isLocked: (cvId: string) => boolean
  loading: boolean
  subscriptionTier: 'free' | 'premium'
  error: string | null
  /** Manuellt re-fetch — t.ex. efter att man laddat upp eller raderat ett CV */
  refresh: () => Promise<void>
}

export function useCvQuota(): CvQuota {
  const [cvCount, setCvCount] = useState(0)
  const [maxCvs, setMaxCvs] = useState(2)
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'premium'>(
    'free'
  )
  const [lockedCvIds, setLockedCvIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkQuota = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setError('Kunde inte hämta användarinformation')
        setLoading(false)
        return
      }

      // Subscription tier
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
      }

      const tier: 'free' | 'premium' =
        profile?.subscription_tier === 'premium' ? 'premium' : 'free'
      const max = tier === 'premium' ? 50 : 2

      setSubscriptionTier(tier)
      setMaxCvs(max)

      // Hämta CV-listans id + created_at för att räkna ut låsta
      const { data: cvList, error: listError } = await supabase
        .from('cv_texts')
        .select('id, created_at')
        .eq('user_id', user.id)

      if (listError) {
        console.error('Error fetching CV list:', listError)
        setError('Kunde inte hämta CV-listan')
        setCvCount(0)
        setLockedCvIds(new Set())
      } else {
        const list = cvList ?? []
        setCvCount(list.length)
        const activeIds = getActiveCvIds(list, max)
        // Låsta = alla som INTE är i activeIds
        const locked = new Set<string>()
        for (const c of list) {
          if (!activeIds.has(c.id)) locked.add(c.id)
        }
        setLockedCvIds(locked)
      }
    } catch (err) {
      console.error('Error in useCvQuota:', err)
      setError('Ett oväntat fel uppstod')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkQuota()
  }, [checkQuota])

  const isLocked = useCallback(
    (cvId: string) => lockedCvIds.has(cvId),
    [lockedCvIds]
  )

  return {
    cvCount,
    maxCvs,
    canSave: cvCount < maxCvs,
    lockedCvIds,
    isLocked,
    loading,
    subscriptionTier,
    error,
    refresh: checkQuota,
  }
}
