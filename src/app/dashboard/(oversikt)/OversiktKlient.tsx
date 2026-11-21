'use client'

/**
 * Det Översikt gör i webbläsaren, oförändrat från dagens hem
 * (DashboardHem) när Jobbsöket ritades om (omgång 1, etapp 2A):
 *
 *   - kvittot efter köp (?premium_activated=true&plan=), med aktivitetsloggen
 *     och omläsningen medan Stripe-webhooken hinner ifatt
 *   - nedgraderingsnotisen
 *   - mätningen activation_state (vilket tillstånd A, B eller C användaren
 *     mötte, en gång per session)
 *
 * Allt annat på sidan ritas på servern.
 */

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PAKETRADER } from '@/components/paywall/paywall-copy'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import { useAuth } from '@/contexts/AuthContext'
import { logUserActivity } from '@/lib/activity-logger'
import DowngradedNotice from '@/components/dashboard/DowngradedNotice'
import PurchaseConfirmation from './PurchaseConfirmation'
import type { DashboardState } from './startvy'

export default function OversiktKlient({ state, cvCount, totalLetters }: { state: DashboardState; cvCount: number; totalLetters: number }) {
  const searchParams = useSearchParams()
  const { summary, isLoading, refresh } = useDashboardData()
  const { user } = useAuth()
  const profile = summary?.profile as Record<string, unknown> | null | undefined
  const subscriptionTier = (profile?.subscription_tier as string | undefined) ?? 'free'
  const userId = user?.id

  // Kvitto efter köp. Kortet visar produkt och slutdatum, så det räcker med
  // att logga aktiviteten här i stället för att också visa en toast.
  const [purchasedPlan, setPurchasedPlan] = useState<string | null>(null)
  const loggedPurchase = useRef(false)
  useEffect(() => {
    if (searchParams.get('premium_activated') !== 'true' || subscriptionTier !== 'premium') return
    if (loggedPurchase.current) return
    loggedPurchase.current = true
    setPurchasedPlan(searchParams.get('plan'))
    if (userId) {
      void logUserActivity(userId, 'premium_activated', PAKETRADER.aktivitetKop, {
        tier: 'premium',
        plan: searchParams.get('plan') ?? undefined,
      })
    }
  }, [searchParams, subscriptionTier, userId])

  // Stripe-webhooken kan ligga några sekunder efter att användaren landar
  // tillbaka. Hämta om profilen ett par gånger tills premium syns.
  const purchasePolls = useRef(0)
  useEffect(() => {
    if (searchParams.get('premium_activated') !== 'true') return
    if (isLoading || subscriptionTier === 'premium' || purchasePolls.current >= 4) return
    purchasePolls.current += 1
    const t = setTimeout(() => {
      void refresh()
    }, 2500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isLoading, subscriptionTier])

  // B7: vilket tillstånd användaren faktiskt mötte. En gång per session.
  const loggedState = useRef<string | null>(null)
  useEffect(() => {
    if (!userId || loggedState.current === state) return
    loggedState.current = state
    void logUserActivity(userId, 'activation_state', `Dashboard i tillstånd ${state}`, { state, cvCount, totalLetters })
  }, [userId, state, cvCount, totalLetters])

  return (
    <>
      {purchasedPlan !== null ? (
        <div className="mt-6">
          <PurchaseConfirmation
            plan={purchasedPlan}
            premiumUntil={(profile?.premium_until as string | undefined) ?? null}
            currentPeriodEnd={(profile?.current_period_end as string | undefined) ?? null}
            onDismiss={() => setPurchasedPlan(null)}
          />
        </div>
      ) : null}
      <DowngradedNotice />
    </>
  )
}
