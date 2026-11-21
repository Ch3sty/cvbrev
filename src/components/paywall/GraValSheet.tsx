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
import type { SparrData } from './TestSparr'
import type { CvSparrData } from '@/components/cv/rum3/sparr/CvSparr'
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
  /** Mallen väggen gäller (mallflödet): mätningen och köpreturen. */
  mall?: { id: string; tier: 'free' | 'premium'; retur?: string | null } | null
  /** Grundnivåtest kvar i dag på gratisnivån. 0 ger "I morgon" i stället för ett nytt grundtest. */
  grundKvarIdag?: number | null
  /** Omgång 3: hennes siffror i testernas spärr (nivån, provet). Saknas en faller raden bort. */
  sparrData?: SparrData | null
  /**
   * CV-rummet (omgång 1, steg 2): spärrarna vid nedladdning i nya utseendet,
   * med hennes CV i vald mall. Utelämnat: kortet som förut.
   */
  cvSparr?: CvSparrData | null
  /** Variantens sekundära handling (gratisvägen i varianten mall). Utelämnat: arket stängs. */
  onSecondary?: () => void
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
  mall = null,
  grundKvarIdag = null,
  sparrData = null,
  cvSparr = null,
  onSecondary,
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

  // Omgång 3 (steg 3b): testernas lås får spärrens nya ark (Sparr-test). CV,
  // brev och mallar har andra varianter och ritas som förut.
  const test = variant === 'testniva' || variant === 'test-tak'
  if (test) {
    return (
      <Sheet open={open} onClose={onClose} bare className="sm:!max-w-[1020px] sm:!rounded-[28px] !border-0 sm:max-h-[94dvh]">
        {open ? (
          <PaywallCard
            variant={variant}
            feature={feature}
            scope={scope === 'cv' || scope === 'tester' ? scope : null}
            track={track}
            onSecondary={onClose}
            plats={plats}
            dagarKvar={dagarKvar}
            mall={mall}
            grundKvarIdag={grundKvarIdag}
            bare
            utseende="test"
            sparrData={sparrData}
            onStang={onClose}
          />
        ) : null}
      </Sheet>
    )
  }

  if (cvSparr && (variant === 'mall' || variant === 'cv-export-word' || variant === 'cv-export')) {
    return (
      <Sheet open={open} onClose={onClose} bare className="cv3s-sheet sm:!max-w-[1020px] sm:!rounded-[28px] !border-0 sm:max-h-[94dvh]">
        {open ? (
          <PaywallCard
            variant={variant}
            feature={feature}
            scope={scope === 'cv' || scope === 'tester' ? scope : null}
            track={track}
            onSecondary={onSecondary ?? onClose}
            plats={plats}
            dagarKvar={dagarKvar}
            mall={mall}
            bare
            utseende="cv"
            cvSparr={cvSparr}
            onStang={onClose}
          />
        ) : null}
      </Sheet>
    )
  }

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
            mall={mall}
            grundKvarIdag={grundKvarIdag}
            bare
          />
        </div>
      ) : null}
    </Sheet>
  )
}
