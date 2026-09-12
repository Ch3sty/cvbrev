'use client'

/**
 * Jobbmatchningens illustrationer, viewBox 48, stroke 2, radie 4.
 * Ett accentelement per illustration. Inga gradientcirklar.
 */

import { ILLU, IlluSvg, IlluAccentGradient, useIlluId, type IlluProps } from './primitives'

const SW = ILLU.stroke[48]
const R = ILLU.radius[48]

/**
 * En dold träff: ett annonskort där texten ersatts av staplar och ett lås
 * sitter i nedre hörnet. Låset är accentelementet, resten är kontur, så
 * kortet läser som "finns men visas inte" i stället för som en larmyta.
 */
export function IlluDoldTraff(props: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={48} {...props}>
      <IlluAccentGradient id={id} />
      {/* Annonskortet */}
      <rect
        x="5"
        y="7"
        width="38"
        height="34"
        rx={R}
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={SW}
      />
      {/* Dolda textrader, kortare nedåt som i ett riktigt kort */}
      <path d="M11 16h16M11 22h20M11 28h12" stroke="currentColor" strokeWidth={SW} opacity="0.4" />
      {/* Låset, enda accentytan */}
      <rect x="26" y="29" width="14" height="11" rx="2.5" fill={`url(#${id})`} />
      <path
        d="M29.5 29v-2.5a3.5 3.5 0 0 1 7 0V29"
        stroke={ILLU.accent}
        strokeWidth={SW}
      />
      <path d="M33 33.5v3" stroke={ILLU.onAccent} strokeWidth={SW} />
    </IlluSvg>
  )
}
