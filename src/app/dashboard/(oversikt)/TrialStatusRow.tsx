'use client'

/**
 * Premiumstatusraden överst på dashboarden, på shell/StatusRow.
 *
 * Täcker alla premiumtillstånd: prenumeration (positiv, ingen nedräkning),
 * trial, dagspass och admin-tilldelad (dagar kvar). Tonen byter en gång, vid
 * sista dygnet: accentpunkt och bläck, orange räknas en gång på skärmen.
 */

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { PREMIUM_HREF } from '@/lib/premium/premiumEntry'
import { useProfile } from '@/hooks/use-profile'
import StatusRow from '@/components/shell/StatusRow'

// Köparket öppnas bara när användaren trycker på uppgradera.
const UpgradeSheet = dynamic(() => import('@/components/paywall/UpgradeSheet'), { ssr: false })

const TRIAL_SOURCES = ['signup_trial', 'oauth_signup_trial']
/** Engångsköpen sätter premium_source till onetime_1d respektive onetime_7d. */
const ONETIME_PREFIX = 'onetime_'

const LINK_QUIET = 'text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1'
const LINK_WARM = 'text-sm font-medium text-accent-ink underline decoration-kant-stark underline-offset-4 hover:decoration-accent-ink'

/** Hela dygn kvar. Sista dygnet ger 0. */
function daysLeft(until: Date, now: Date): number {
  const ms = until.getTime() - now.getTime()
  if (ms <= 0) return -1
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)) - 1)
}

export default function TrialStatusRow({ className }: { className?: string }) {
  const { premiumSource, premiumUntil, subscriptionTier, hasStripeSubscription } = useProfile()
  const [sheetOpen, setSheetOpen] = useState(false)

  if (subscriptionTier !== 'premium') return null

  const now = new Date()
  const activeUntil = premiumUntil && premiumUntil > now ? premiumUntil : null

  const isTrial = TRIAL_SOURCES.includes(premiumSource ?? '')
  const isOnetime = (premiumSource ?? '').startsWith(ONETIME_PREFIX)

  // Prenumeration: ingen nedräkning, den förnyas. En lugn rad utan säljtryck.
  if (hasStripeSubscription) {
    return (
      <StatusRow
        tone="positive"
        showDot
        className={className}
        action={
          <Link href={PREMIUM_HREF} className={LINK_QUIET}>
            Hantera
          </Link>
        }
      >
        Premium aktivt
      </StatusRow>
    )
  }

  // Allt annat kräver ett slutdatum för att kunna säga något vettigt.
  if (!activeUntil) return null

  const left = daysLeft(activeUntil, now)
  const isLastDay = left <= 0
  const isEnding = left <= 1

  const label = (() => {
    if (isOnetime) {
      if (isLastDay) return 'Dagspasset går ut ikväll 23:59'
      return `Premium aktivt · ${left} ${left === 1 ? 'dag' : 'dagar'} kvar`
    }
    if (isTrial) {
      if (isLastDay) return 'Premium slutar ikväll 23:59'
      if (left === 1) return 'En dag kvar av din Premium-period'
      return `Premium aktivt · ${left} dagar kvar`
    }
    if (isLastDay) return 'Premium går ut ikväll 23:59'
    return `Premium aktivt · ${left} ${left === 1 ? 'dag' : 'dagar'} kvar`
  })()

  return (
    <>
      <StatusRow
        tone={isEnding ? 'warm' : 'positive'}
        showDot
        className={className}
        action={
          isEnding ? (
            <button type="button" onClick={() => setSheetOpen(true)} className={LINK_WARM}>
              {isOnetime ? 'Förläng' : 'Behåll Premium'}
            </button>
          ) : (
            <Link href={PREMIUM_HREF} className={LINK_QUIET}>
              Vad ingår
            </Link>
          )
        }
      >
        {label}
      </StatusRow>
      <UpgradeSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        order="month-first"
        source={isOnetime ? 'status-row-onetime' : 'trial-status-row'}
        showLossSummary={isTrial || isOnetime}
      />
    </>
  )
}
