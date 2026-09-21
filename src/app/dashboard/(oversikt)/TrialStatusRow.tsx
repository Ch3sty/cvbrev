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
import { TRIAL_PRICE_FROM, daysLeft, isTrialSource } from '@/lib/premium/trial'

// Köparket öppnas bara när användaren trycker på uppgradera.
const UpgradeSheet = dynamic(() => import('@/components/paywall/UpgradeSheet'), { ssr: false })

/** Engångsköpen sätter premium_source till onetime_1d respektive onetime_7d. */
const ONETIME_PREFIX = 'onetime_'

const LINK_QUIET = 'text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1'
const LINK_WARM = 'text-sm font-medium text-accent-ink underline decoration-kant-stark underline-offset-4 hover:decoration-accent-ink'

export default function TrialStatusRow({ className }: { className?: string }) {
  const { premiumSource, premiumUntil, subscriptionTier, hasStripeSubscription } = useProfile()
  const [sheetOpen, setSheetOpen] = useState(false)

  if (subscriptionTier !== 'premium') return null

  const now = new Date()
  const activeUntil = premiumUntil && premiumUntil > now ? premiumUntil : null

  const isTrial = isTrialSource(premiumSource)
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
      // Priset står med varje dag, inte bara i slutet. Det är hela poängen:
      // utan det hinner provperioden ta slut innan kontot sett en siffra.
      // Raden är knapp på 375 px, och det är priset som måste överleva, så
      // ordet Premium får stå tillbaka: punkten och sammanhanget säger det.
      if (isLastDay) return `Sista dagen. Sedan ${TRIAL_PRICE_FROM}.`
      if (left === 1) return `En dag kvar. Sedan ${TRIAL_PRICE_FROM}.`
      return `${left} dagar kvar. Sedan ${TRIAL_PRICE_FROM}.`
    }
    if (isLastDay) return 'Premium går ut ikväll 23:59'
    return `Premium aktivt · ${left} ${left === 1 ? 'dag' : 'dagar'} kvar`
  })()

  return (
    <>
      <StatusRow
        tone={isEnding ? 'warm' : 'positive'}
        showDot
        // Trialraden bär ett pris i slutet av meningen. Det får inte kapas.
        wrap={isTrial}
        className={className}
        action={
          isEnding ? (
            <button type="button" onClick={() => setSheetOpen(true)} className={LINK_WARM}>
              {isOnetime ? 'Förläng' : 'Behåll Premium'}
            </button>
          ) : (
            <Link href={PREMIUM_HREF} className={LINK_QUIET}>
              {/* Raden nämner ett pris under trialen, så länken ska leda till
                  planerna. "Vad ingår" pekar på innehåll och blir fel svar. */}
              {isTrial ? 'Se planer' : 'Vad ingår'}
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
