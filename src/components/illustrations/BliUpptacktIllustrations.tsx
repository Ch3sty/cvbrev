'use client'

/**
 * Bli upptäckt-illustrationer (docs/plan-inloggat-omdesign.md, våg 3 punkt 24).
 *
 * Regler från primitives.tsx: konturer i currentColor, fyllning via
 * --illu-fill, max en gradient per illustration och bara på accentelementet,
 * aldrig en gradientcirkel bakom motivet, aldrig hårdkodat fill="white".
 *
 * Motivvalet är medvetet: sidan ska kännas som förberedelse, inte som en
 * bedömning. Därför inga bockar, inga mätare och inga hänglås i motiven.
 */

import { ILLU, IlluSvg, IlluAccentGradient, useIlluId, type IlluProps } from './primitives'

/**
 * Tomt tillstånd: ett profilkort som lyfter, med en sökstråle som hittar det.
 * viewBox 96, stroke 3.
 */
export function IlluBliUpptackt(props: IlluProps) {
  const id = useIlluId()
  const SW = ILLU.stroke[96]
  const R = ILLU.radius[96]
  return (
    <IlluSvg box={96} {...props}>
      <IlluAccentGradient id={id} vertical />

      {/* Profilkortet */}
      <rect
        x="14"
        y="20"
        width="52"
        height="60"
        rx={R}
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={SW}
      />

      {/* Anonym avatar: kandidaten syns som roll, inte som ansikte */}
      <circle cx="32" cy="40" r="7" stroke="currentColor" strokeWidth={SW} fill={ILLU.soft} />
      <path
        d="M22 56c2-5 5.5-7.5 10-7.5S40 51 42 56"
        stroke="currentColor"
        strokeWidth={SW}
      />

      {/* Innehållsrader */}
      <path d="M24 66h32M24 74h20" stroke="currentColor" strokeWidth={SW} opacity="0.45" />

      {/* Sökstrålen: accentelementet, enda gradienten */}
      <circle cx="66" cy="44" r="15" stroke={`url(#${id})`} strokeWidth={SW} fill="none" />
      <path d="M77 55l8 8" stroke={`url(#${id})`} strokeWidth={SW} />
    </IlluSvg>
  )
}

/**
 * Profilvisningar: ett öga över en stapel som växer. Neutralt, inte en poäng.
 * viewBox 48, stroke 2.
 */
export function IlluProfilvisningar(props: IlluProps) {
  const id = useIlluId()
  const SW = ILLU.stroke[48]
  return (
    <IlluSvg box={48} {...props}>
      <IlluAccentGradient id={id} />

      {/* Ögat */}
      <path
        d="M6 18c4.5-6 10-9 16-9s11.5 3 16 9c-4.5 6-10 9-16 9s-11.5-3-16-9Z"
        stroke="currentColor"
        strokeWidth={SW}
        fill={ILLU.fill}
      />
      <circle cx="22" cy="18" r="4.5" fill={`url(#${id})`} />

      {/* Staplar som växer under */}
      <path d="M12 40v-5M22 40v-9M32 40v-13" stroke="currentColor" strokeWidth={SW} />
      <path d="M6 40h36" stroke="currentColor" strokeWidth={SW} opacity="0.4" />
    </IlluSvg>
  )
}

/**
 * Nästa steg: en sida med en pil framåt. Ett steg, inte en checklista.
 * viewBox 48, stroke 2.
 */
export function IlluNastaSteg(props: IlluProps) {
  const id = useIlluId()
  const SW = ILLU.stroke[48]
  const R = ILLU.radius[48]
  return (
    <IlluSvg box={48} {...props}>
      <IlluAccentGradient id={id} />

      <rect
        x="8"
        y="6"
        width="26"
        height="34"
        rx={R}
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path d="M15 16h12M15 23h12M15 30h7" stroke="currentColor" strokeWidth={SW} opacity="0.45" />

      {/* Pilen är accentelementet */}
      <path d="M30 31h11M36 26l5 5-5 5" stroke={`url(#${id})`} strokeWidth={SW} />
    </IlluSvg>
  )
}
