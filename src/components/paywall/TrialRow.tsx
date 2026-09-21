'use client'

/**
 * Priset under provperioden (docs/rapporter/analys-effekt-2026-09-21.md).
 *
 * Betalväggen renderar null för premium, och med reverse trial är nästan varje
 * nytt konto premium. Effekten blev att 19 av 20 nya konton aldrig såg ett
 * pris innan provperioden tog slut. Den här raden tar betalväggens plats under
 * trialen: den säger vad handlingen kostade, att den ingår just nu, hur länge
 * till och vad det kostar att behålla den.
 *
 * Det är inte en betalvägg. Inget spärras, ingenting behöver klickas bort:
 * StatusRow i ton neutral, en tunn rad ovanför resultatet, med en textlänk
 * till prissidan. PaywallCard renderar den själv när isPremium beror på trial,
 * så den hamnar exakt där spärren annars hade legat.
 */

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import StatusRow from '@/components/shell/StatusRow'
import { capture } from '@/lib/analytics/events'
import { PREMIUM_HREF } from '@/lib/premium/premiumEntry'
import { TRIAL_PRICE_FROM, daysLeft, daysLeftPhrase } from '@/lib/premium/trial'

const LINK =
  'inline-flex min-h-[44px] items-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1'

export interface TrialRowProps {
  /** Slutdatum för provperioden, profiles.premium_until. */
  premiumUntil: Date
  className?: string
}

export default function TrialRow({ premiumUntil, className }: TrialRowProps) {
  const pathname = usePathname()
  const surface = pathname ?? ''

  // En gång per montering, aldrig per omritning. Samma ref-mönster som
  // PaywallCard: den överlever både omritningar och StrictMode.
  const shownRef = useRef(false)
  useEffect(() => {
    if (shownRef.current) return
    shownRef.current = true
    capture('trial_price_shown', { surface })
  }, [surface])

  const left = daysLeft(premiumUntil)
  if (left < 0) return null

  return (
    <StatusRow
      tone="neutral"
      wrap
      className={className}
      label="Provperiod"
      action={
        <Link href={PREMIUM_HREF} className={LINK}>
          Se planer
        </Link>
      }
    >
      Ingår i din provperiod, {daysLeftPhrase(left)}. Behåll det {TRIAL_PRICE_FROM}.
    </StatusRow>
  )
}
