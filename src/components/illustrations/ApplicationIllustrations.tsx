'use client'

/**
 * Ansökningssidans illustrationer.
 * viewBox 96 för tomma tillstånd (stroke 3, radie 8), viewBox 48 för kort
 * och betalväggar (stroke 2, radie 4). Ett accentelement per illustration,
 * inga gradientcirklar, inga hårdkodade fyllningar.
 */

import { ILLU, IlluSvg, IlluAccentGradient, useIlluId, type IlluProps } from './primitives'

const SW96 = ILLU.stroke[96]
const R96 = ILLU.radius[96]
const SW48 = ILLU.stroke[48]
const R48 = ILLU.radius[48]

/**
 * Tomt tillstånd utan ansökningar: tre tomma rader i en lista, den översta
 * med en accentmarkering som visar var första posten hamnar.
 */
export function IlluIngaAnsokningar(props: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={96} {...props}>
      <IlluAccentGradient id={id} />
      <rect
        x="10"
        y="16"
        width="76"
        height="64"
        rx={R96}
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={SW96}
      />
      {/* Första raden, ifylld: hit kommer ansökan */}
      <rect x="20" y="28" width="56" height="12" rx="3" fill={`url(#${id})`} opacity="0.18" />
      <rect x="20" y="28" width="4" height="12" rx="2" fill={`url(#${id})`} />
      <path d="M32 34h30" stroke="currentColor" strokeWidth={SW96} opacity="0.5" />
      {/* Två tomma rader */}
      <path d="M20 52h56M20 66h38" stroke="currentColor" strokeWidth={SW96} opacity="0.28" />
    </IlluSvg>
  )
}

/**
 * Tomt tillstånd för importvägen: ett brev som blir en listrad. Pilen är
 * accentelementet, eftersom handlingen är att flytta något hon redan har.
 */
export function IlluImporteraBrev(props: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={96} {...props}>
      <IlluAccentGradient id={id} />
      {/* Brevet */}
      <path
        d="M12 14h26l10 10v40a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3V17a3 3 0 0 1 3-3z"
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={SW96}
      />
      <path d="M38 14v10h10" stroke="currentColor" strokeWidth={SW96} />
      <path d="M17 36h22M17 46h22M17 56h14" stroke="currentColor" strokeWidth={SW96} opacity="0.45" />
      {/* Pilen, enda accentytan */}
      <path d="M54 42h14" stroke={`url(#${id})`} strokeWidth={SW96} />
      <path d="M63 37l5 5-5 5" stroke={`url(#${id})`} strokeWidth={SW96} />
      {/* Listraden den blir */}
      <rect
        x="74"
        y="30"
        width="14"
        height="24"
        rx="3"
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={SW96}
      />
      <path d="M78 38h6M78 46h6" stroke="currentColor" strokeWidth={SW96} opacity="0.45" />
    </IlluSvg>
  )
}

/**
 * Tomt tillstånd för CV-jämförelsen: två staplar av olika höjd, den högre i
 * accent. Visar vad jämförelsen kommer att säga utan att påstå en siffra.
 */
export function IlluCvJamforelse(props: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={96} {...props}>
      <IlluAccentGradient id={id} />
      {/* Baslinje */}
      <path d="M14 74h68" stroke="currentColor" strokeWidth={SW96} opacity="0.4" />
      {/* Stapel A, den bättre */}
      <rect x="26" y="26" width="18" height="48" rx="3" fill={`url(#${id})`} />
      {/* Stapel B */}
      <rect
        x="54"
        y="50"
        width="18"
        height="24"
        rx="3"
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={SW96}
      />
      {/* Etiketter som streck, ingen text i en illustration */}
      <path d="M26 84h18M54 84h18" stroke="currentColor" strokeWidth={SW96} opacity="0.3" />
    </IlluSvg>
  )
}

/**
 * Betalväggen på AF-rapporten, viewBox 48: ett formulär med stämpel.
 * Stämpeln är accentelementet.
 */
export function IlluAfRapport(props: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={48} {...props}>
      <IlluAccentGradient id={id} />
      <rect
        x="7"
        y="4"
        width="30"
        height="40"
        rx={R48}
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={SW48}
      />
      <path d="M13 13h18M13 20h18M13 27h11" stroke="currentColor" strokeWidth={SW48} opacity="0.5" />
      {/* Stämpeln */}
      <circle cx="34" cy="34" r="9" fill={`url(#${id})`} />
      <path d="M30 34l3 3 5.5-5.5" stroke={ILLU.onAccent} strokeWidth={SW48} />
    </IlluSvg>
  )
}
