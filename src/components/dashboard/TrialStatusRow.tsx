'use client'

/**
 * En rad överst på dashboarden under reverse trial (B4/A4 i
 * docs/plan-konvertering.md). h-10, border, ingen skugga, ingen progress-bar
 * och ingen tickande timer.
 *
 * Dag 1-3 neutral, dag 4-5 orange-50, sista dygnet "Premium slutar ikväll".
 * Monteras av spår B i dashboard/page.tsx.
 */

import { useState } from 'react'
import Link from 'next/link'
import { PREMIUM_HREF } from '@/lib/premium/premiumEntry'
import { useProfile } from '@/hooks/use-profile'
import UpgradeSheet from '@/components/paywall/UpgradeSheet'

const TRIAL_SOURCES = ['signup_trial', 'oauth_signup_trial']

/** Hela dygn kvar, avrundat uppåt. Sista dygnet ger 0. */
function daysLeft(until: Date, now: Date): number {
  const ms = until.getTime() - now.getTime()
  if (ms <= 0) return -1
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)) - 1)
}

export default function TrialStatusRow({ className }: { className?: string }) {
  const { premiumSource, premiumUntil, subscriptionTier } = useProfile()
  const [sheetOpen, setSheetOpen] = useState(false)

  if (!premiumUntil || subscriptionTier !== 'premium') return null
  if (!TRIAL_SOURCES.includes(premiumSource ?? '')) return null

  const now = new Date()
  if (premiumUntil <= now) return null

  const left = daysLeft(premiumUntil, now)
  const isLastDay = left <= 0
  const isEnding = left <= 1

  const label = isLastDay
    ? 'Premium slutar ikväll 23:59.'
    : left === 1
      ? 'En dag kvar av din Premium-period'
      : `Premium aktivt · ${left} dagar kvar`

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
            Behåll Premium
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
        source="trial-status-row"
      />
    </>
  )
}
