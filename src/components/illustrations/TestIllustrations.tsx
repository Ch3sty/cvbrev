'use client'

/**
 * Testflödets illustrationer (docs/plan-konvertering.md, E3).
 * Följer reglerna i primitives.tsx.
 */

import { ILLU, IlluSvg, IlluAccentGradient, useIlluId, type IlluProps } from './primitives'

/** Testrutnät, pil, CV-ark. viewBox 96, stroke 3. */
export function IlluTestTillCv(props: IlluProps) {
  const id = useIlluId()
  const SW = ILLU.stroke[96]
  return (
    <IlluSvg box={96} {...props}>
      <IlluAccentGradient id={id} />

      {/* Testrutnätet till vänster */}
      <rect x="8" y="26" width="16" height="16" rx="3" fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />
      <rect x="8" y="50" width="16" height="16" rx="3" fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />
      <rect x="30" y="26" width="16" height="16" rx="3" fill={ILLU.soft} stroke="currentColor" strokeWidth={SW} />
      <rect x="30" y="50" width="16" height="16" rx="3" fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />

      {/* Accent: pilen mellan test och CV */}
      <path d="M52 46h14M60 40l6 6-6 6" stroke={ILLU.accent} strokeWidth={SW} />

      {/* CV-arket till höger */}
      <rect x="66" y="18" width="24" height="58" rx="3" fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />
      <path d="M72 32h12M72 42h12M72 52h7" stroke="currentColor" strokeWidth="2" opacity="0.5" />
    </IlluSvg>
  )
}

/** Fem stigande staplar där den fjärde är accent. viewBox 48, stroke 2. */
export function IlluPercentil(props: IlluProps) {
  const id = useIlluId()
  const SW = ILLU.stroke[48]
  const bars = [
    { x: 5, h: 10 },
    { x: 14, h: 17 },
    { x: 23, h: 24 },
    { x: 32, h: 33 },
    { x: 41, h: 21 },
  ]
  return (
    <IlluSvg box={48} {...props}>
      <IlluAccentGradient id={id} vertical />

      {/* Baslinjen */}
      <path d="M3 42h42" stroke="currentColor" strokeWidth={SW} opacity="0.4" />

      {bars.map((b, i) => (
        <rect
          key={b.x}
          x={b.x - 3}
          y={42 - b.h}
          width="6"
          height={b.h}
          rx="1.5"
          fill={i === 3 ? `url(#${id})` : ILLU.fill}
          stroke="currentColor"
          strokeWidth={i === 3 ? 0 : SW}
          opacity={i === 3 ? 1 : 0.65}
        />
      ))}
    </IlluSvg>
  )
}
