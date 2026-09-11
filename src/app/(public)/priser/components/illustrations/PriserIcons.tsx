'use client'

/**
 * Ikoner för /priser.
 *
 * De åtta funktionsikonerna följer illustrationsreglerna i docs/designsystem.md:
 * konturer i currentColor, fyllningar via --illu-*, linjetjocklek per viewBox,
 * max en gradient per illustration och bara på accentelementet, unika id via
 * useIlluId(), aldrig hårdkodat vitt.
 *
 * CheckPriser och LockPriser ligger kvar i sin gamla form: de används av sju
 * publika hero-sektioner som inte ingår i den här omgången.
 */

import {
  ILLU,
  IlluSvg,
  IlluAccentGradient,
  useIlluId,
  type IlluProps,
} from '@/components/illustrations/primitives'

interface IllustrationProps {
  className?: string
}

const SW = ILLU.stroke[48]
const R = ILLU.radius[48]

/** Gemensam signatur: sektionen skickar bara className. */
type IconProps = IlluProps & IllustrationProps

/** Dokument med rader, accentband i toppen. */
export function IconCV({ className, size }: IconProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={48} size={size} className={className}>
      <IlluAccentGradient id={id} />
      <rect x="11" y="5" width="26" height="38" rx={R} fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />
      <path d={`M11 9a${R} ${R} 0 0 1 ${R}-${R}h18a${R} ${R} 0 0 1 ${R} ${R}v3H11z`} fill={`url(#${id})`} />
      <path d="M16 21h16M16 27h16M16 33h9" stroke="currentColor" strokeWidth={SW} opacity="0.55" />
    </IlluSvg>
  )
}

/** Dokument med stigande staplar: analysen mäter. */
export function IconAnalys({ className, size }: IconProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={48} size={size} className={className}>
      <IlluAccentGradient id={id} vertical />
      <rect x="7" y="5" width="26" height="38" rx={R} fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />
      <path d="M12 14h12M12 20h12" stroke="currentColor" strokeWidth={SW} opacity="0.55" />
      <rect x="26" y="31" width="4" height="7" rx="1" fill={ILLU.soft} />
      <rect x="32" y="26" width="4" height="12" rx="1" fill={ILLU.soft} />
      <rect x="38" y="19" width="4" height="19" rx="1" fill={`url(#${id})`} />
    </IlluSvg>
  )
}

/** Kuvert med brevark som sticker upp. */
export function IconBrev({ className, size }: IconProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={48} size={size} className={className}>
      <IlluAccentGradient id={id} />
      <rect x="13" y="4" width="22" height="24" rx={R} fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />
      <path d="M18 12h12M18 18h9" stroke="currentColor" strokeWidth={SW} opacity="0.55" />
      <path
        d="M5 24h38v17a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V24z"
        fill={`url(#${id})`}
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path d="M5 24l19 12 19-12" stroke="currentColor" strokeWidth={SW} fill="none" />
    </IlluSvg>
  )
}

/** Profilkort: LinkedIn-optimeringen putsar profilen. */
export function IconLinkedIn({ className, size }: IconProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={48} size={size} className={className}>
      <IlluAccentGradient id={id} />
      <rect x="5" y="8" width="38" height="32" rx={R} fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />
      <circle cx="17" cy="21" r="5" fill={`url(#${id})`} />
      <path d="M9 34c1.5-4 5-6 8-6s6.5 2 8 6" stroke="currentColor" strokeWidth={SW} fill="none" />
      <path d="M30 18h9M30 24h9M30 30h6" stroke="currentColor" strokeWidth={SW} opacity="0.55" />
    </IlluSvg>
  )
}

/** Två överlappande cirklar: ditt CV mot annonsen. */
export function IconJobbmatch({ className, size }: IconProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={48} size={size} className={className}>
      <IlluAccentGradient id={id} />
      <circle cx="19" cy="24" r="12" fill={ILLU.soft} stroke="currentColor" strokeWidth={SW} />
      <circle cx="29" cy="24" r="12" fill="none" stroke="currentColor" strokeWidth={SW} />
      <path
        d="M24 13.2a12 12 0 0 1 0 21.6 12 12 0 0 1 0-21.6z"
        fill={`url(#${id})`}
        opacity="0.9"
      />
    </IlluSvg>
  )
}

/** Checklista: testerna bockas av. */
export function IconTester({ className, size }: IconProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={48} size={size} className={className}>
      <IlluAccentGradient id={id} />
      <rect x="7" y="5" width="34" height="38" rx={R} fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />
      <rect x="13" y="14" width="6" height="6" rx="1.5" fill={`url(#${id})`} />
      <path d="M14.5 17l1.5 1.5 3-3" stroke={ILLU.onAccent} strokeWidth={1.5} />
      <path d="M23 17h12" stroke="currentColor" strokeWidth={SW} opacity="0.7" />
      <rect x="13" y="25" width="6" height="6" rx="1.5" fill={ILLU.accent} />
      <path d="M14.5 28l1.5 1.5 3-3" stroke={ILLU.onAccent} strokeWidth={1.5} />
      <path d="M23 28h10" stroke="currentColor" strokeWidth={SW} opacity="0.7" />
      <rect
        x="13"
        y="36"
        width="6"
        height="6"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeDasharray="2 2"
        opacity="0.5"
      />
      <path d="M23 39h8" stroke="currentColor" strokeWidth={SW} opacity="0.35" />
    </IlluSvg>
  )
}

/** Två pratbubblor: coachen svarar. */
export function IconCoach({ className, size }: IconProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={48} size={size} className={className}>
      <IlluAccentGradient id={id} />
      <path
        d="M5 12a4 4 0 0 1 4-4h17a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H14l-5 5v-5a4 4 0 0 1-4-4z"
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path d="M12 16h11" stroke="currentColor" strokeWidth={SW} opacity="0.55" />
      <path
        d="M43 28a4 4 0 0 0-4-4H27a4 4 0 0 0-4 4v7a4 4 0 0 0 4 4h8l4 4v-4a4 4 0 0 0 4-4z"
        fill={`url(#${id})`}
      />
      <path d="M28 30h9M28 34h6" stroke={ILLU.onAccent} strokeWidth={SW} />
    </IlluSvg>
  )
}

/** Tre staplade mallark. */
export function IconMallar({ className, size }: IconProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={48} size={size} className={className}>
      <IlluAccentGradient id={id} />
      <rect
        x="6"
        y="12"
        width="16"
        height="24"
        rx={R}
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={SW}
        opacity="0.55"
        transform="rotate(-7 14 24)"
      />
      <rect
        x="26"
        y="12"
        width="16"
        height="24"
        rx={R}
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={SW}
        opacity="0.55"
        transform="rotate(7 34 24)"
      />
      <rect x="16" y="9" width="16" height="30" rx={R} fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />
      <path d={`M16 13a${R} ${R} 0 0 1 ${R}-${R}h8a${R} ${R} 0 0 1 ${R} ${R}v2H16z`} fill={`url(#${id})`} />
      <path d="M20 22h8M20 27h8M20 32h5" stroke="currentColor" strokeWidth={SW} opacity="0.55" />
    </IlluSvg>
  )
}

// =============================================================
// CHECK- och LÅS-IKON (24x24)
// Används av sju publika hero-sektioner utanför den här omgången.
// Rör dem inte utan att uppdatera alla konsumenter samtidigt.
// =============================================================

export function CheckPriser({ className }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" fill="#EA580C" />
      <path
        d="M7.5 12 L10.5 15 L16.5 9"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LockPriser({ className }: IllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="9" rx="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.4" />
      <path d="M8 11 V8 A4 4 0 0 1 16 8 V11" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <circle cx="12" cy="15.5" r="1.4" fill="#94A3B8" />
    </svg>
  )
}
