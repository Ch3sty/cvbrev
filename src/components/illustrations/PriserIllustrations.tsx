'use client'

/**
 * Prissidans fyra produktillustrationer, viewBox 96, stroke 3, radie 8.
 * Används även i UpgradeSheet (renderade i 40 px).
 */

import { ILLU, IlluSvg, IlluAccentGradient, useIlluId, type IlluProps } from './primitives'

const SW = ILLU.stroke[96]
const R = ILLU.radius[96]

/** Cirkel med ett 24-timmarssegment markerat. */
export function IlluDagspass(props: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={96} {...props}>
      <IlluAccentGradient id={id} />
      <circle cx="48" cy="48" r="34" fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />
      <path d="M48 14a34 34 0 0 1 34 34H48z" fill={`url(#${id})`} />
      <path d="M48 26v22l14 10" stroke="currentColor" strokeWidth={SW} />
      <circle cx="48" cy="48" r="4" fill="currentColor" />
    </IlluSvg>
  )
}

/** Sju smala staplar i rad, alla fyllda. */
export function IlluVecka(props: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={96} {...props}>
      <IlluAccentGradient id={id} vertical />
      <path d="M12 80h72" stroke="currentColor" strokeWidth={SW} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect
          key={i}
          x={14 + i * 10}
          y={22 + (i % 2) * 6}
          width="7"
          height={54 - (i % 2) * 6}
          rx="3"
          fill={i === 6 ? `url(#${id})` : ILLU.fill}
          stroke={i === 6 ? 'none' : 'currentColor'}
          strokeWidth={SW * 0.7}
        />
      ))}
    </IlluSvg>
  )
}

/** Kalenderark med upprepningsmärke i hörnet. */
export function IlluManad(props: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={96} {...props}>
      <IlluAccentGradient id={id} />
      <rect x="14" y="20" width="68" height="62" rx={R} fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />
      <path d="M14 36h68" stroke="currentColor" strokeWidth={SW} />
      <path d="M32 12v14M64 12v14" stroke="currentColor" strokeWidth={SW} />
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <rect key={`${r}${c}`} x={24 + c * 14} y={44 + r * 11} width="8" height="6" rx="1.5" fill="currentColor" opacity="0.25" />
        ))
      )}
      <circle cx="72" cy="72" r="12" fill={`url(#${id})`} />
      <path d="M66 72a6 6 0 0 1 10-4.5M78 72a6 6 0 0 1-10 4.5" stroke={ILLU.onAccent} strokeWidth={SW * 0.8} />
      <path d="M76 64v4h-4M68 80v-4h4" stroke={ILLU.onAccent} strokeWidth={SW * 0.8} />
    </IlluSvg>
  )
}

/** Tre kalenderark i förskjuten stapel. */
export function IlluKvartal(props: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={96} {...props}>
      <IlluAccentGradient id={id} />
      <rect x="30" y="10" width="52" height="46" rx={R} fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} opacity="0.45" />
      <rect x="20" y="22" width="52" height="46" rx={R} fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} opacity="0.7" />
      <rect x="10" y="34" width="52" height="46" rx={R} fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />
      <path d="M10 46h52" stroke="currentColor" strokeWidth={SW} />
      <rect x="18" y="54" width="14" height="10" rx="2" fill={`url(#${id})`} />
      <rect x="36" y="54" width="18" height="10" rx="2" fill="currentColor" opacity="0.2" />
      <rect x="18" y="68" width="36" height="6" rx="2" fill="currentColor" opacity="0.2" />
    </IlluSvg>
  )
}
