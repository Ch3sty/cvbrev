'use client'

/**
 * Premiumstatusraden överst på dashboarden (punkt 5 i
 * docs/plan-inloggat-saljflode.md).
 *
 * Filnamnet är kvar av historiska skäl, men raden täcker numera alla
 * premiumtillstånd, inte bara reverse trial. Tidigare filtrerade den på
 * premium_source, så den som köpt ett dagspass såg ingen nedräkning alls och
 * passet tog slut utan förvarning. Det är den mest sannolika platsen att
 * förlora någon som redan visat betalningsvilja.
 *
 * Regler: h-10, border, ingen skugga, ingen progress-bar, ingen tickande
 * timer. Tonen byter en gång, vid sista dygnet, aldrig gradvis.
 */

import { useState } from 'react'
import Link from 'next/link'
import { PREMIUM_HREF } from '@/lib/premium/premiumEntry'
import { useProfile } from '@/hooks/use-profile'
import dynamic from 'next/dynamic'

// Köparket öppnas bara när användaren trycker på uppgradera.
const UpgradeSheet = dynamic(() => import('@/components/paywall/UpgradeSheet'), { ssr: false })

const TRIAL_SOURCES = ['signup_trial', 'oauth_signup_trial']
/** Engångsköpen sätter premium_source till onetime_1d respektive onetime_7d. */
const ONETIME_PREFIX = 'onetime_'

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
      <div
        className={`h-10 rounded-lg border border-neutral-200 bg-white px-3 flex items-center justify-between gap-3 text-neutral-900 ${className ?? ''}`}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="h-2 w-2 rounded-full shrink-0 bg-emerald-600" aria-hidden="true" />
          <span className="text-sm font-medium truncate">Premium aktivt</span>
        </span>
        <Link
          href={PREMIUM_HREF}
          className="text-sm font-medium text-neutral-600 hover:text-neutral-900 underline-offset-4 hover:underline shrink-0"
        >
          Hantera
        </Link>
      </div>
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
      if (isLastDay) return 'Premium slutar ikväll 23:59.'
      if (left === 1) return 'En dag kvar av din Premium-period'
      return `Premium aktivt · ${left} dagar kvar`
    }
    // Admin-tilldelad eller äldre källa: säg bara hur länge det gäller.
    if (isLastDay) return 'Premium går ut ikväll 23:59'
    return `Premium aktivt · ${left} ${left === 1 ? 'dag' : 'dagar'} kvar`
  })()

  const tone = isEnding
    ? 'bg-orange-50 border-orange-200 text-orange-900'
    : 'bg-white border-neutral-200 text-neutral-900'

  const dot = isEnding ? 'bg-orange-600' : 'bg-emerald-600'

  return (
    <>
      <div
        className={`h-10 rounded-lg border px-3 flex items-center justify-between gap-3 ${tone} ${className ?? ''}`}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className={`h-2 w-2 rounded-full shrink-0 ${dot}`} aria-hidden="true" />
          <span className="text-sm font-medium truncate">{label}</span>
        </span>
        {isEnding ? (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="text-sm font-medium text-orange-700 hover:text-orange-900 underline-offset-4 hover:underline shrink-0"
          >
            {isOnetime ? 'Förläng' : 'Behåll Premium'}
          </button>
        ) : (
          <Link
            href={PREMIUM_HREF}
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 underline-offset-4 hover:underline shrink-0"
          >
            Vad ingår
          </Link>
        )}
      </div>
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
