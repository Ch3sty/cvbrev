'use client'

/**
 * Klusterikoner för ArticleClusterCTA (docs/plan-konvertering.md, C4/E3).
 * viewBox 24, stroke 1.5, hörnradie 2. Ingen gradient utom på accentdelen,
 * aldrig som bakgrundscirkel. Motiven enligt illustrationsregistret.
 */

import { ILLU, IlluAccentGradient, IlluSvg, useIlluId, type IlluProps } from './primitives'

const S = ILLU.stroke[24]
const R = ILLU.radius[24]

/** Två överlappande pratbubblor. Den främre är accentelementet. */
export function IlluKlusterIntervju({ size = 24, className, title }: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={24} size={size} className={className} title={title}>
      <IlluAccentGradient id={id} />
      {/* Bakre bubbla */}
      <path
        d={`M4 5.5h10a1.5 1.5 0 0 1 1.5 1.5v5A1.5 1.5 0 0 1 14 13.5h-1.5L10 16v-2.5H4A1.5 1.5 0 0 1 2.5 12V7A1.5 1.5 0 0 1 4 5.5Z`}
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={S}
      />
      {/* Främre bubbla, accent */}
      <path
        d={`M11 9.5h9A1.5 1.5 0 0 1 21.5 11v5a1.5 1.5 0 0 1-1.5 1.5h-4.5L13 20v-2.5h-2A1.5 1.5 0 0 1 9.5 16v-5A1.5 1.5 0 0 1 11 9.5Z`}
        fill={`url(#${id})`}
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth={S}
      />
      <path d="M12.5 13h5" stroke="currentColor" strokeWidth={S} />
    </IlluSvg>
  )
}

/** 2×2-rutnät med rotationspil: matrislogik. */
export function IlluKlusterTest({ size = 24, className, title }: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={24} size={size} className={className} title={title}>
      <IlluAccentGradient id={id} />
      <rect x="3" y="3" width="7" height="7" rx={R} fill={ILLU.fill} stroke="currentColor" strokeWidth={S} />
      <rect x="14" y="3" width="7" height="7" rx={R} fill={ILLU.fill} stroke="currentColor" strokeWidth={S} />
      <rect x="3" y="14" width="7" height="7" rx={R} fill={ILLU.fill} stroke="currentColor" strokeWidth={S} />
      {/* Fjärde rutan är den som ska räknas ut: accent */}
      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx={R}
        fill={`url(#${id})`}
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth={S}
      />
      {/* Rotationspil i accentrutan */}
      <path d="M16 18.5a1.6 1.6 0 0 1 3-.8" stroke="currentColor" strokeWidth={S} />
      <path d="M19.4 16.2v1.6h-1.6" stroke="currentColor" strokeWidth={S} />
    </IlluSvg>
  )
}

/** Kuvert med en arkkant som tittar upp. */
export function IlluKlusterBrev({ size = 24, className, title }: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={24} size={size} className={className} title={title}>
      <IlluAccentGradient id={id} />
      {/* Arket bakom kuvertet */}
      <path d="M7.5 8V3.5h9V8" fill={ILLU.fill} stroke="currentColor" strokeWidth={S} />
      <path d="M10 5.5h4" stroke="currentColor" strokeWidth={S} />
      {/* Kuvert, accent */}
      <rect
        x="2.5"
        y="8"
        width="19"
        height="12.5"
        rx={R}
        fill={`url(#${id})`}
        fillOpacity="0.16"
        stroke="currentColor"
        strokeWidth={S}
      />
      <path d="M2.5 9.5 12 15.5l9.5-6" stroke="currentColor" strokeWidth={S} />
    </IlluSvg>
  )
}

/** Ark med kolumnlayout: CV. */
export function IlluKlusterCv({ size = 24, className, title }: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={24} size={size} className={className} title={title}>
      <IlluAccentGradient id={id} />
      <rect x="4" y="2.5" width="16" height="19" rx={R} fill={ILLU.fill} stroke="currentColor" strokeWidth={S} />
      {/* Vänsterkolumn, accent */}
      <path
        d={`M4 ${2.5 + R}A${R} ${R} 0 0 1 ${4 + R} 2.5H9v19H${4 + R}A${R} ${R} 0 0 1 4 ${21.5 - R}Z`}
        fill={`url(#${id})`}
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth={S}
      />
      <path d="M12 7h5M12 11h5M12 15h3" stroke="currentColor" strokeWidth={S} />
    </IlluSvg>
  )
}

/** Kompass: generiskt kluster utan egen produkt. */
export function IlluKlusterGenerisk({ size = 24, className, title }: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={24} size={size} className={className} title={title}>
      <IlluAccentGradient id={id} />
      <circle cx="12" cy="12" r="9" fill={ILLU.fill} stroke="currentColor" strokeWidth={S} />
      <path
        d="M15.5 8.5 13.6 13.6 8.5 15.5l1.9-5.1z"
        fill={`url(#${id})`}
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth={S}
      />
    </IlluSvg>
  )
}
