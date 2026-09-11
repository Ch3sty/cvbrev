'use client'

/**
 * Illustrationer för profilkortet och kvotraden
 * (docs/plan-inloggat-saljflode.md, punkt 6 och 7).
 *
 * Följer primitives-reglerna: konturer i currentColor, fyllningar via
 * --illu-*, linjetjocklek per viewBox, max en gradient per illustration och
 * bara på accentelementet, unika id via useIlluId, aldrig hårdkodat vitt.
 */

import {
  ILLU,
  IlluSvg,
  IlluAccentGradient,
  useIlluId,
  type IlluProps,
} from './primitives'

const S48 = ILLU.stroke[48]
const R48 = ILLU.radius[48]
const S24 = ILLU.stroke[24]

/**
 * Kontaktkort med en ifylld rad och två tomma.
 * Motivet för "Komplettera profilen": uppgifterna som saknas i brevhuvudet.
 */
export function IlluProfilKomplettering({ size = 48, className, title }: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={48} size={size} className={className} title={title}>
      <IlluAccentGradient id={id} />
      <rect
        x="6"
        y="7"
        width="36"
        height="34"
        rx={R48}
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={S48}
      />
      {/* Ifylld rad: avataren och namnet finns redan */}
      <circle cx="16" cy="17" r="4" fill={`url(#${id})`} />
      <path d="M24 17h12" stroke="currentColor" strokeWidth={S48} opacity="0.7" />
      {/* Två tomma rader: telefon och ort saknas */}
      <path
        d="M12 27h24"
        stroke="currentColor"
        strokeWidth={S48}
        strokeDasharray="3 3"
        opacity="0.4"
      />
      <path
        d="M12 34h16"
        stroke="currentColor"
        strokeWidth={S48}
        strokeDasharray="3 3"
        opacity="0.4"
      />
    </IlluSvg>
  )
}

/**
 * Mätare med tre steg där det sista är streckat.
 * Motivet för kvotraden: taket syns innan det tar slut.
 */
export function IlluKvot({ size = 24, className, title }: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={24} size={size} className={className} title={title}>
      <IlluAccentGradient id={id} />
      <rect x="2.5" y="14" width="5" height="7" rx="1" fill={`url(#${id})`} />
      <rect
        x="9.5"
        y="9"
        width="5"
        height="12"
        rx="1"
        fill={ILLU.soft}
        stroke="currentColor"
        strokeWidth={S24}
      />
      <rect
        x="16.5"
        y="4"
        width="5"
        height="17"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth={S24}
        strokeDasharray="2 2"
        opacity="0.5"
      />
    </IlluSvg>
  )
}

/** Porträtt med bock: personuppgifterna. */
export function IlluProfilUppgifter({ size = 48, className, title }: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={48} size={size} className={className} title={title}>
      <IlluAccentGradient id={id} />
      <circle cx="20" cy="17" r="7" fill={ILLU.fill} stroke="currentColor" strokeWidth={S48} />
      <path
        d="M7 41c0-7 6-12 13-12s13 5 13 12"
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={S48}
      />
      <circle cx="37" cy="35" r="8" fill={`url(#${id})`} />
      <path d="M33.5 35l2.5 2.5 5-5" stroke={ILLU.onAccent} strokeWidth={S48} />
    </IlluSvg>
  )
}

/** Brevark med tonkurva: skrivtonen i breven. */
export function IlluSkrivton({ size = 48, className, title }: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={48} size={size} className={className} title={title}>
      <IlluAccentGradient id={id} />
      <rect
        x="8"
        y="5"
        width="32"
        height="38"
        rx={R48}
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={S48}
      />
      <path d="M14 14h20M14 20h20" stroke="currentColor" strokeWidth={S48} opacity="0.55" />
      <path
        d="M14 31c4-6 8 6 12 0s6-3 8-1"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth={S48}
      />
    </IlluSvg>
  )
}

/** Nyckel: planen och vad den låser upp. */
export function IlluPlan({ size = 48, className, title }: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={48} size={size} className={className} title={title}>
      <IlluAccentGradient id={id} />
      <circle cx="17" cy="24" r="9" fill={`url(#${id})`} />
      <circle cx="17" cy="24" r="3.5" fill={ILLU.onAccent} />
      <path d="M26 24h15M35 24v6M41 24v5" stroke="currentColor" strokeWidth={S48} />
    </IlluSvg>
  )
}
