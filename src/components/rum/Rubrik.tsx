/**
 * Rubriken på väggen (spec-rummen 4.2, konceptets .h1 med small-raden).
 *
 * Display 800, 34/36 på mobil och 44/46 på dator (.text-h1 i ett rum),
 * eller .text-h1-liten för resultat, kvitton och CV-rummet. Raden under
 * står i text-vagg-mjuk 14/21. Raden ligger som ett eget stycke efter
 * rubriken, inte inuti den, så rubrikens tillgängliga namn är bara
 * rubriken.
 *
 * Server component.
 */

import type { ReactNode } from 'react'

export interface RubrikProps {
  titel: ReactNode
  /** Raden under rubriken, text-vagg-mjuk 14/21. */
  rad?: ReactNode
  /** .text-h1-liten */
  liten?: boolean
  /** .text-h1-liten bara under lg (hemvyn, beslut-hemvy tillägget 2026-10-11, reservsteget). */
  litenMobil?: boolean
  as?: 'h1' | 'p'
  className?: string
}

export default function Rubrik({ titel, rad, liten, litenMobil, as = 'h1', className }: RubrikProps) {
  const Tag = as
  return (
    <div className={`mt-2 ${className ?? ''}`}>
      <Tag className={`${liten ? 'text-h1-liten' : litenMobil ? 'text-h1-liten lg:!text-[44px] lg:!leading-[46px]' : 'text-h1'} text-vagg-ink`}>{titel}</Tag>
      {rad ? <div className="mt-2 max-w-[60ch] text-sm leading-[21px] text-vagg-mjuk">{rad}</div> : null}
    </div>
  )
}
