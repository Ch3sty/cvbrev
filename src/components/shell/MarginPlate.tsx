/**
 * MarginPlate: illustrationens plats (docs/designsystem.md).
 *
 * 56 px, accent-mjuk, 1 px kant, radie 8. Motivet ritas i 48 med stroke 2
 * och en fylld accentform. Här, och bara här, tänds ikonernas accentform
 * genom att --ia sätts till accenten.
 *
 * En platta per vy, på vyns framhävda element: rekommenderat valkort, aktiv
 * sektion, Nästa handling, betalväggen. Allt annat får naken ikon 24.
 */

import type { CSSProperties, ReactNode } from 'react'

export interface MarginPlateProps {
  /** Motivet, normalt en 48-illustration ur TradenScener eller en Ikon i 24. */
  children: ReactNode
  className?: string
}

const TAND: CSSProperties = { ['--ia' as string]: 'var(--accent)' }

export default function MarginPlate({ children, className }: MarginPlateProps) {
  return (
    <span
      aria-hidden="true"
      style={TAND}
      className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-kant bg-accent-mjuk text-ink-1 [&>svg]:block ${className ?? ''}`}
    >
      {children}
    </span>
  )
}
