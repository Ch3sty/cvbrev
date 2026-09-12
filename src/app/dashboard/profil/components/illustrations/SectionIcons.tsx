'use client'

/**
 * Sektionsikoner för profilsidan, 48 px.
 *
 * Enligt primitives-tabellen: viewBox 48 ger linjetjocklek 2 och hörnradie 4.
 * Konturer i currentColor, en enda accentyta per motiv (--illu-accent) på det
 * element som bär betydelsen. Inga gradienter, ingen bakgrundscirkel.
 *
 * Motiven säger vad sektionen gör, inte vad den heter: ett dokument med en
 * markerad topp, en kompass, en radarsvep och ett kugghjul med nyckelhål.
 */

import {
  ILLU,
  IlluSvg,
  type IlluProps,
} from '@/components/illustrations/primitives'

const SW = ILLU.stroke[48]
const R = ILLU.radius[48]

/** Så presenteras du: dokument där toppen är accentuerad. */
export function SectionPresentationIcon({ className, size, title }: IlluProps) {
  return (
    <IlluSvg box={48} size={size} className={className} title={title}>
      <rect
        x="9"
        y="5"
        width="30"
        height="38"
        rx={R}
        stroke="currentColor"
        strokeWidth={SW}
      />
      {/* Brevhuvudet, accentytan */}
      <rect x="14" y="11" width="14" height="3" rx="1.5" fill={ILLU.accent} />
      <circle cx="32" cy="15" r="3.5" stroke="currentColor" strokeWidth={SW} />
      <g stroke="currentColor" strokeWidth={SW} opacity="0.45">
        <path d="M14 24h20" />
        <path d="M14 30h20" />
        <path d="M14 36h13" />
      </g>
    </IlluSvg>
  )
}

/** Så hjälper vi dig: kompassnål som pekar mot ett mål. */
export function SectionInriktningIcon({ className, size, title }: IlluProps) {
  return (
    <IlluSvg box={48} size={size} className={className} title={title}>
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth={SW} />
      {/* Nålen, accentytan */}
      <path d="M31 17l-5.5 12.5L13 35l5.5-12.5L31 17Z" fill={ILLU.accent} />
      <circle cx="24" cy="24" r="2.5" stroke="currentColor" strokeWidth={SW} />
    </IlluSvg>
  )
}

/** Bli upptäckt: radarsvep med en träff. */
export function SectionUpptacktIcon({ className, size, title }: IlluProps) {
  return (
    <IlluSvg box={48} size={size} className={className} title={title}>
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth={SW} />
      <circle cx="24" cy="24" r="11" stroke="currentColor" strokeWidth={SW} opacity="0.5" />
      <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth={SW} opacity="0.5" />
      <path d="M24 24l12-8" stroke="currentColor" strokeWidth={SW} />
      {/* Träffen, accentytan */}
      <circle cx="34" cy="31" r="3.5" fill={ILLU.accent} />
    </IlluSvg>
  )
}

/** Konto och notiser: kuvert med ett litet lås. */
export function SectionKontoIcon({ className, size, title }: IlluProps) {
  return (
    <IlluSvg box={48} size={size} className={className} title={title}>
      <rect
        x="5"
        y="11"
        width="38"
        height="26"
        rx={R}
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path d="M6 14l18 12 18-12" stroke="currentColor" strokeWidth={SW} />
      {/* Låset, accentytan */}
      <rect x="28" y="28" width="13" height="10" rx="2" fill={ILLU.accent} />
      <path
        d="M31 28v-2.5a3.5 3.5 0 0 1 7 0V28"
        stroke="currentColor"
        strokeWidth={SW}
      />
    </IlluSvg>
  )
}
