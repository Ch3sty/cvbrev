'use client'

/**
 * Spårraden på hemskärmen (docs/plan-paket-och-onboarding.md, skärm 1.3).
 *
 * Ersätter TrialStatusRow, som föll med reverse trial (ägarens beslut 3).
 * Raden säger vad spåret betyder för vad användaren ser, inte vad hon går
 * miste om. Den får inte bli en säljrad: hela skälet till att vi sparar
 * spåret gratis är att steget ska vara ärligt.
 *
 * Tre lägen:
 *   betalande     raden faller bort helt, veckopanelen är vyns startpunkt
 *   spår valt     neutral rad med spårets text och en länk till paketet
 *   inget spår    ingenting, tills vi frågar om efter tre dagars aktivitet
 */

import Link from 'next/link'
import StatusRow from '@/components/shell/StatusRow'
import { SPARRAD, type Track } from '@/lib/onboarding/program'

const LANK =
  'text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1'

export interface SparRadProps {
  track: Track | null
  /** Betalt spår. Är det satt visas ingen rad: veckan äger ytan. */
  scope: Track | null
  className?: string
}

export default function SparRad({ track, scope, className }: SparRadProps) {
  if (scope) return null
  if (!track) return null

  const copy = SPARRAD[track]

  return (
    <StatusRow
      tone="neutral"
      showDot
      className={className}
      action={
        <Link href="/dashboard/valj-spar" className={LANK}>
          {copy.lank}
        </Link>
      }
    >
      {copy.rad}
    </StatusRow>
  )
}
