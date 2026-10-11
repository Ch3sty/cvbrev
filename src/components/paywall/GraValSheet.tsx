'use client'

/**
 * Betalväggen bakom ett grått val (spec-onboarding 2026-09-22, sektion 3,
 * med ägarens beslut 2026-10-11: bara Jobbcoach Premium säljs).
 *
 * PaywallCard i ett ark: rubriken "{Det låsta} ingår i Premium", prisraden,
 * köpknappen och länken "Se vad som ingår". Arket är papperet och kortet är
 * innehållet, så kortet ritas utan egen ram (art-director 24.2 fråga 4).
 * Arket öppnas bara från ett låschip eller en låst rad, aldrig från en
 * kopparknapp (24.2 fråga 1).
 *
 * En befintlig kund med CV-paketet eller Träningspaketet får samma vägg;
 * PaywallCard skickar då knappen till prenumerationssidan, där priset byts
 * på hennes prenumeration (spec-rummen 17.5).
 *
 * Mätning: gray_option_tapped en gång per öppning här, och PaywallCard
 * skjuter betalvagg_visad en gång per montering. Kortet monteras bara när
 * arket är öppet, så det blir en gång per öppning.
 */

import { useEffect, useRef } from 'react'
import Sheet from '@/components/shell/Sheet'
import PaywallCard from './PaywallCard'
import type { PaywallVariant } from './paywall-copy'
import type { Feature, Scope } from '@/lib/access/features'
import type { PlanKey } from '@/lib/plans/plans'
import { capture, type BetalvaggPlats } from '@/lib/analytics/events'

export interface GraValSheetProps {
  open: boolean
  onClose: () => void
  feature: Feature
  variant: PaywallVariant
  scope: Scope | null
  track: Scope | null
  /**
   * Kontots paket. Väggen är densamma för alla paket sedan FelSpar togs
   * bort (spec-rummen 17.5), så värdet läses inte. Står kvar för anroparna.
   */
  planKey?: PlanKey | null
  /** Sidan eller routen, för mätningen. */
  surface: string
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
  surface,
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

  return (
    <Sheet open={open} onClose={onClose} bare>
      {open ? (
        <div className="p-4">
          <PaywallCard
            variant={variant}
            feature={feature}
            scope={scope === 'cv' || scope === 'tester' ? scope : null}
            track={track}
            onSecondary={onClose}
            plats={plats}
            dagarKvar={dagarKvar}
            bare
          />
        </div>
      ) : null}
    </Sheet>
  )
}
