'use client'

/**
 * Visas en gång när reverse trial tagit slut (A4 i docs/plan-konvertering.md).
 * Villkor: premium_source är en trial-källa, premium_until passerade för
 * mindre än 14 dagar sedan, och kontot ligger på gratisnivån.
 * Avfärdas till localStorage och kommer aldrig tillbaka.
 *
 * Monteras av spår B i dashboard/page.tsx.
 */

import { useEffect, useState } from 'react'
import { useProfile } from '@/hooks/use-profile'
import PaywallCard from '@/components/paywall/PaywallCard'

const TRIAL_SOURCES = ['signup_trial', 'oauth_signup_trial']
const STORAGE_KEY = 'jc_downgraded_notice_dismissed'
const WINDOW_DAYS = 14

export default function DowngradedNotice({ className }: { className?: string }) {
  const { premiumSource, premiumUntil, subscriptionTier } = useProfile()
  const [dismissed, setDismissed] = useState(true)

  // Läs localStorage först efter mount, annars skiljer sig server och klient.
  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(STORAGE_KEY) === '1')
    } catch {
      setDismissed(false)
    }
  }, [])

  if (dismissed) return null
  if (subscriptionTier !== 'free') return null
  if (!TRIAL_SOURCES.includes(premiumSource ?? '')) return null
  if (!premiumUntil) return null

  const now = new Date()
  if (premiumUntil > now) return null

  const daysSince = (now.getTime() - premiumUntil.getTime()) / (24 * 60 * 60 * 1000)
  if (daysSince > WINDOW_DAYS) return null

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // Privat läge: kortet kommer tillbaka nästa gång, det får duga.
    }
    setDismissed(true)
  }

  return (
    <PaywallCard
      variant="nedgraderad"
      onDismiss={dismiss}
      planOrder="month-first"
      className={className}
    />
  )
}
