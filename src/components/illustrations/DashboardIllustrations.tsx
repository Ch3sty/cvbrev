'use client'

/**
 * Dashboardens illustrationer (docs/plan-konvertering.md, E3).
 *
 * Regler från primitives.tsx: konturer i currentColor, fyllning via
 * --illu-fill, max en gradient per illustration och bara på accentelementet,
 * aldrig en gradientcirkel bakom motivet, aldrig hårdkodat fill="white".
 */

import { ILLU, IlluSvg, IlluAccentGradient, useIlluId, type IlluProps } from './primitives'

/** CV-ark som svävar över en öppen mapp, uppåtpil. viewBox 240, stroke 6. */
export function IlluLaddaUppCv(props: IlluProps) {
  const id = useIlluId()
  const SW = ILLU.stroke[240]
  const R = ILLU.radius[240]
  return (
    <IlluSvg box={240} {...props}>
      <IlluAccentGradient id={id} vertical />

      {/* Mappens bakstycke */}
      <path
        d="M26 132V92a10 10 0 0 1 10-10h46l14 16h58a10 10 0 0 1 10 10v24"
        stroke="currentColor"
        strokeWidth={SW}
        fill={ILLU.fill}
      />

      {/* CV-arket, svävande */}
      <rect
        x="76"
        y="24"
        width="88"
        height="112"
        rx={R}
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path
        d="M96 56h48M96 76h48M96 96h30"
        stroke="currentColor"
        strokeWidth={SW}
        opacity="0.5"
      />

      {/* Mappens framstycke, ligger över arket */}
      <path
        d="M20 132h200l-16 68a10 10 0 0 1-10 8H46a10 10 0 0 1-10-8L20 132z"
        fill={ILLU.soft}
        stroke="currentColor"
        strokeWidth={SW}
      />

      {/* Accent: uppåtpilen */}
      <circle cx="176" cy="52" r="26" fill={`url(#${id})`} />
      <path
        d="M176 40v24M164 52l12-12 12 12"
        stroke={ILLU.fill}
        strokeWidth={SW}
      />
    </IlluSvg>
  )
}

/** Cirkulär mätarbåge på ca 70 procent med ett litet ark i mitten. viewBox 96. */
export function IlluCvPoang(props: IlluProps) {
  const id = useIlluId()
  const SW = ILLU.stroke[96]
  const r = 36
  const circumference = 2 * Math.PI * r
  // 70 procent av bågen
  const arc = circumference * 0.7

  return (
    <IlluSvg box={96} {...props}>
      <IlluAccentGradient id={id} />

      {/* Spåret */}
      <circle
        cx="48"
        cy="48"
        r={r}
        stroke="currentColor"
        strokeWidth={SW}
        opacity="0.2"
      />

      {/* Accent: den fyllda bågen */}
      <circle
        cx="48"
        cy="48"
        r={r}
        stroke={`url(#${id})`}
        strokeWidth={SW}
        strokeDasharray={`${arc} ${circumference}`}
        transform="rotate(-90 48 48)"
      />

      {/* Arket i mitten */}
      <rect
        x="34"
        y="30"
        width="28"
        height="36"
        rx="3"
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path d="M41 42h14M41 50h14M41 58h8" stroke="currentColor" strokeWidth="2" opacity="0.5" />
    </IlluSvg>
  )
}

/** Tomt ark med en penna diagonalt. viewBox 96. */
export function IlluIngaBrev(props: IlluProps) {
  const id = useIlluId()
  const SW = ILLU.stroke[96]
  const R = ILLU.radius[96]
  return (
    <IlluSvg box={96} {...props}>
      <IlluAccentGradient id={id} />

      <rect
        x="18"
        y="12"
        width="52"
        height="68"
        rx={R}
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path
        d="M30 32h28M30 44h28M30 56h16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray="4 5"
        opacity="0.4"
      />

      {/* Accent: pennan */}
      <path
        d="M58 72l20-20 8 8-20 20-11 3 3-11z"
        fill={`url(#${id})`}
        stroke="currentColor"
        strokeWidth={SW}
      />
    </IlluSvg>
  )
}

/** Tre tomma tidslinjeprickar. viewBox 96. */
export function IlluIngenAktivitet(props: IlluProps) {
  const id = useIlluId()
  const SW = ILLU.stroke[96]
  const rows = [24, 48, 72]
  return (
    <IlluSvg box={96} {...props}>
      <IlluAccentGradient id={id} />

      {/* Tidslinjen */}
      <path d="M24 24v48" stroke="currentColor" strokeWidth="2.5" opacity="0.3" />

      {rows.map((y, i) => (
        <g key={y}>
          {i === 0 ? (
            /* Accent: översta pricken */
            <circle cx="24" cy={y} r="7" fill={`url(#${id})`} />
          ) : (
            <circle
              cx="24"
              cy={y}
              r="7"
              fill={ILLU.fill}
              stroke="currentColor"
              strokeWidth={SW}
              strokeDasharray="3 3"
              opacity="0.45"
            />
          )}
          <path
            d={`M40 ${y - 4}h34M40 ${y + 5}h22`}
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="4 5"
            opacity={i === 0 ? 0.5 : 0.3}
          />
        </g>
      ))}
    </IlluSvg>
  )
}
