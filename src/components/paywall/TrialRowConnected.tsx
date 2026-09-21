'use client'

/**
 * Kopplar TrialRow till profilen.
 *
 * Skälet till att det här är en egen fil: PaywallCard ska förbli en ren vy
 * som bara får props, så den går att rendera i test utan Supabase-klient.
 * Profilberoendet ligger därför här, ett lager under, och laddas bara när
 * kortet faktiskt mött en premiumanvändare.
 *
 * Raden visas bara för reverse trial. En prenumerant, ett köpt dagspass eller
 * admin-tilldelad premium ser ingenting, precis som förut.
 */

import { useProfile } from '@/hooks/use-profile'
import { isTrialSource } from '@/lib/premium/trial'
import TrialRow from './TrialRow'

export default function TrialRowConnected({ className }: { className?: string }) {
  const { premiumSource, premiumUntil, hasStripeSubscription } = useProfile()

  if (hasStripeSubscription) return null
  if (!isTrialSource(premiumSource)) return null
  if (!premiumUntil || premiumUntil <= new Date()) return null

  return <TrialRow premiumUntil={premiumUntil} className={className} />
}
