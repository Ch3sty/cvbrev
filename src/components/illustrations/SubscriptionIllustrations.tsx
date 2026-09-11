'use client'

/**
 * Prenumerationssidans illustrationer (A8 i docs/plan-konvertering.md).
 * viewBox 96, stroke 3, hörnradie 8. Max en gradient, bara på accenten.
 */

import { ILLU, IlluSvg, IlluAccentGradient, useIlluId, type IlluProps } from './primitives'

const SW = ILLU.stroke[96]

/**
 * Mätare för hur mycket som är kvar av ett tidsbegränsat premium.
 * Halvcirkelbåge med en fylld del som visar återstående tid, plus en visare.
 */
export function IlluTidKvar(props: IlluProps & { fraction?: number }) {
  const id = useIlluId()
  // Andel kvar, 0 till 1. Visaren roterar över 180 grader.
  const fraction = Math.min(1, Math.max(0, props.fraction ?? 0.6))
  const angle = -90 + fraction * 180
  const rad = (angle * Math.PI) / 180
  const needleX = 48 + Math.sin(rad) * 26
  const needleY = 66 - Math.cos(rad) * 26

  // Bågen går från vänster (12, 66) till höger (84, 66) över toppen.
  const arcLength = Math.PI * 36

  return (
    <IlluSvg box={96} {...props}>
      <IlluAccentGradient id={id} />
      <path
        d="M12 66a36 36 0 0 1 72 0"
        stroke={ILLU.soft}
        strokeWidth={SW * 2.2}
        fill="none"
      />
      <path
        d="M12 66a36 36 0 0 1 72 0"
        stroke={`url(#${id})`}
        strokeWidth={SW * 2.2}
        fill="none"
        strokeDasharray={`${arcLength * fraction} ${arcLength}`}
      />
      <path d={`M48 66 L${needleX.toFixed(1)} ${needleY.toFixed(1)}`} stroke="currentColor" strokeWidth={SW} />
      <circle cx="48" cy="66" r="5" fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />
      <path d="M18 78h60" stroke="currentColor" strokeWidth={SW * 0.7} opacity="0.35" />
    </IlluSvg>
  )
}
