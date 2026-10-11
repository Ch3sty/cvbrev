'use client'

/**
 * Betalväggen bakom ett grått val (spec-onboarding 2026-09-22, sektion 3,
 * med ägarens beslut 2026-10-11: bara Jobbcoach Premium säljs).
 *
 * På gratisnivån är det PaywallCard i ett ark: rubriken "{Det låsta} ingår i
 * Premium", prisraden och köpknappen. Ingen mellanskillnad och inget
 * spårval för ett gratiskonto. Bara en befintlig kund med CV-paketet eller
 * Träningspaketet (scope cv eller tester) får FelSpar, som erbjuder Premium
 * i stället för det gamla spåret.
 *
 * Mätning: gray_option_tapped en gång per öppning här, och PaywallCard
 * skjuter betalvagg_visad en gång per montering. Kortet monteras bara när
 * arket är öppet, så det blir en gång per öppning.
 */

import { useEffect, useRef } from 'react'
import Sheet from '@/components/shell/Sheet'
import PaywallCard from './PaywallCard'
import FelSpar from './FelSpar'
import type { PaywallVariant } from './paywall-copy'
import type { Feature, Scope } from '@/lib/access/features'
import type { PlanKey } from '@/lib/plans/plans'
import { mellanskillnadKr } from '@/lib/onboarding/paket-rader'
import { capture, type BetalvaggPlats } from '@/lib/analytics/events'

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
  /** Platsen för betalvagg_visad. Utelämnas den följer den varianten. */
  plats?: BetalvaggPlats
  /** Dagar kvar till provdatum, för mätningen. */
  dagarKvar?: number | null
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
  plats,
  dagarKvar = null,
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

  // Befintlig spårkund: FelSpar. Gratiskonton och Premium går aldrig hit.
  if (scope === 'cv' || scope === 'tester') {
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
          <PaywallCard
            variant={variant}
            feature={feature}
            scope={null}
            track={track}
            onSecondary={onClose}
            plats={plats}
            dagarKvar={dagarKvar}
          />
        </div>
      ) : null}
    </Sheet>
  )
}
