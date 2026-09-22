'use client'

/**
 * Betalväggen bakom ett grått val (docs/design/spec-onboarding-2026-09-22.html,
 * sektion 3: "Trycker hon ändå öppnas betalväggen för rätt paket, med
 * mellanskillnaden om hon redan har ett spår").
 *
 * Har hon ett betalt spår är det fel spår i taket, och FelSpar äger ytan
 * med mellanskillnaden. På gratisnivån är det PaywallCard i ett ark, med
 * rätt paket föreslaget ur featuren. Ingen egen betalvägg här: bara valet
 * mellan de två som finns.
 */

import { useEffect, useRef } from 'react'
import Sheet from '@/components/shell/Sheet'
import PaywallCard from './PaywallCard'
import FelSpar from './FelSpar'
import type { PaywallVariant } from './paywall-copy'
import type { Feature, Scope } from '@/lib/access/features'
import type { PlanKey } from '@/lib/plans/plans'
import { mellanskillnadKr } from '@/lib/onboarding/paket-rader'
import { capture } from '@/lib/analytics/events'

export interface GraValSheetProps {
  open: boolean
  onClose: () => void
  feature: Feature
  variant: PaywallVariant
  scope: Scope | null
  track: Scope | null
  planKey: PlanKey | null
  /** Sidan eller routen, för mätningen. */
  surface: string
  /** Vart Stripe ska skicka tillbaka henne efter en uppgradering. */
  returnPath?: string
}

export default function GraValSheet({
  open,
  onClose,
  feature,
  variant,
  scope,
  track,
  planKey,
  surface,
  returnPath,
}: GraValSheetProps) {
  // gray_option_tapped en gång per öppning.
  const mattRef = useRef(false)
  useEffect(() => {
    if (!open) {
      mattRef.current = false
      return
    }
    if (mattRef.current) return
    mattRef.current = true
    capture('gray_option_tapped', { feature, scope, surface })
  }, [open, feature, scope, surface])

  if (scope && scope !== 'allt') {
    return (
      <FelSpar
        feature={feature}
        scope={scope}
        priceDeltaKr={mellanskillnadKr(planKey)}
        open={open}
        onClose={onClose}
        returnPath={returnPath ?? surface}
      />
    )
  }

  return (
    <Sheet open={open} onClose={onClose} bare>
      {open ? (
        <div className="p-4">
          <PaywallCard variant={variant} feature={feature} scope={null} track={track} onSecondary={onClose} />
        </div>
      ) : null}
    </Sheet>
  )
}
