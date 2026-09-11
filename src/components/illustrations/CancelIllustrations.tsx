'use client'

/**
 * Illustrationer för uppsägningsflödet (docs/plan-konvertering.md, D6/E3).
 * Följer primitives-reglerna: kontur i currentColor, en gradient som mest och
 * bara på accentelementet, linjetjocklek 1.5 vid viewBox 24 och 2 vid 48.
 */

import { IlluSvg, IlluAccentGradient, useIlluId, ILLU, type IlluProps } from './primitives'

const S24 = ILLU.stroke[24]
const S48 = ILLU.stroke[48]

/** Fick jobbet: bricka med bock. */
export function IlluCancelFickJobb(props: IlluProps) {
  return (
    <IlluSvg box={24} {...props}>
      <path
        d="M4 8.5h16v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19.5v-11Z"
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={S24}
      />
      <path d="M9 8.5V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5v3" stroke="currentColor" strokeWidth={S24} />
      <path d="m9.5 14.5 2 2 3.5-3.5" stroke={ILLU.accent} strokeWidth={S24} />
    </IlluSvg>
  )
}

/** För dyrt: myntstapel med prislapp. */
export function IlluCancelForDyrt(props: IlluProps) {
  return (
    <IlluSvg box={24} {...props}>
      <ellipse cx="12" cy="6.5" rx="6.5" ry="2.5" fill={ILLU.fill} stroke="currentColor" strokeWidth={S24} />
      <path d="M5.5 6.5v5c0 1.38 2.91 2.5 6.5 2.5s6.5-1.12 6.5-2.5v-5" stroke="currentColor" strokeWidth={S24} />
      <path d="M5.5 11.5v5c0 1.38 2.91 2.5 6.5 2.5s6.5-1.12 6.5-2.5v-5" stroke="currentColor" strokeWidth={S24} />
      <path d="M12 16.5v3" stroke={ILLU.accent} strokeWidth={S24} />
    </IlluSvg>
  )
}

/** Använder inte: fönster med streckad, sovande yta. */
export function IlluCancelAnvanderInte(props: IlluProps) {
  return (
    <IlluSvg box={24} {...props}>
      <rect
        x="3.5"
        y="4.5"
        width="17"
        height="15"
        rx={ILLU.radius[24]}
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={S24}
      />
      <path d="M3.5 8.5h17" stroke="currentColor" strokeWidth={S24} />
      <path d="M8 12.5h8" stroke="currentColor" strokeWidth={S24} strokeDasharray="2 2.5" />
      <path d="M8 15.5h5" stroke="currentColor" strokeWidth={S24} strokeDasharray="2 2.5" />
    </IlluSvg>
  )
}

/** Saknar en funktion: pusselbit som fattas. */
export function IlluCancelSaknarFunktion(props: IlluProps) {
  return (
    <IlluSvg box={24} {...props}>
      <path
        d="M4.5 5.5h6v2a1.5 1.5 0 0 0 3 0v-2h6v6h-2a1.5 1.5 0 0 0 0 3h2v6h-15v-15Z"
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={S24}
      />
      <path
        d="M10.5 14.5h4"
        stroke={ILLU.accent}
        strokeWidth={S24}
        strokeDasharray="2 2.5"
      />
    </IlluSvg>
  )
}

/** Paus: pausknapp över kalenderark. */
export function IlluPaus(props: IlluProps) {
  const id = useIlluId()
  const gradientId = `${id}-paus`
  return (
    <IlluSvg box={48} {...props}>
      <IlluAccentGradient id={gradientId} />
      <rect
        x="6"
        y="9"
        width="30"
        height="30"
        rx={ILLU.radius[48]}
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={S48}
      />
      <path d="M6 17h30" stroke="currentColor" strokeWidth={S48} />
      <path d="M14 9V5M28 9V5" stroke="currentColor" strokeWidth={S48} />
      <circle cx="34" cy="32" r="10" fill={`url(#${gradientId})`} />
      <path d="M31.5 28.5v7M36.5 28.5v7" stroke={ILLU.fill} strokeWidth={S48} />
    </IlluSvg>
  )
}
