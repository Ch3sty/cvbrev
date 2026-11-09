'use client'

/**
 * Symbolerna för testplanens steg 2 i 48-skalan (skissens sym-tal, sym-kub48
 * och sym-ord): kontur i currentColor, en kopparyta per symbol, som
 * RumSymboler.
 */

import { ILLU, IlluSvg, type IlluProps } from '@/components/illustrations/primitives'

const K = ILLU.accent

export function SymTalserie(p: IlluProps) {
  return (
    <IlluSvg box={48} {...p}>
      <g stroke="currentColor" strokeWidth="1.75" fill="none">
        <rect x="5" y="17" width="10" height="14" rx="2" />
        <rect x="19" y="17" width="10" height="14" rx="2" />
      </g>
      <rect x="33" y="17" width="10" height="14" rx="2" stroke={K} strokeWidth="1.75" strokeDasharray="2.5 2.5" fill="none" />
      <path d="M8.5 27l3-6M22 21v6M24.5 21v6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </IlluSvg>
  )
}

export function SymSpatial(p: IlluProps) {
  return (
    <IlluSvg box={48} {...p}>
      <g stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" fill="none">
        <path d="M24 7l14 8v17l-14 8-14-8V15z" />
        <path d="M10 15l14 8 14-8M24 23v17" />
      </g>
      <circle cx="24" cy="15" r="2" fill={K} />
      <circle cx="17" cy="28" r="1.6" fill="currentColor" />
      <circle cx="31" cy="28" r="1.6" fill="currentColor" />
    </IlluSvg>
  )
}

export function SymOrdforrad(p: IlluProps) {
  return (
    <IlluSvg box={48} {...p}>
      <g stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" fill="none">
        <rect x="6" y="8" width="36" height="32" rx="4" />
        <path d="M13 19h22M13 26h14" />
      </g>
      <circle cx="33" cy="31" r="2.2" fill={K} />
    </IlluSvg>
  )
}
