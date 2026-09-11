'use client'

/**
 * Illustrationer för /skapa-brev/start (docs/plan-konvertering.md, C6/E3).
 * Följer primitives-reglerna: currentColor på konturer, en gradient som mest
 * och bara på accentelementet, linjetjocklek per viewBox.
 */

import { ILLU, IlluAccentGradient, IlluSvg, useIlluId, type IlluProps } from './primitives'

const S24 = ILLU.stroke[24]
const S96 = ILLU.stroke[96]
const R24 = ILLU.radius[24]
const R96 = ILLU.radius[96]

/** Hänglås över ett dokument: resten av brevet ligger bakom registreringen. */
export function IlluBlurGate({ size = 96, className, title }: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={96} size={size} className={className} title={title}>
      <IlluAccentGradient id={id} />
      {/* Dokument */}
      <rect
        x="14"
        y="10"
        width="52"
        height="68"
        rx={R96}
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={S96}
      />
      {/* Synliga rader överst */}
      <path d="M26 26h28M26 36h28" stroke="currentColor" strokeWidth={S96} />
      {/* Suddade rader nedanför */}
      <path
        d="M26 48h28M26 58h20"
        stroke="currentColor"
        strokeWidth={S96}
        strokeOpacity="0.3"
        strokeDasharray="6 6"
      />
      {/* Hänglås, accentelementet */}
      <rect
        x="54"
        y="54"
        width="32"
        height="26"
        rx={R96}
        fill={`url(#${id})`}
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth={S96}
      />
      <path d="M60 54v-7a10 10 0 0 1 20 0v7" stroke="currentColor" strokeWidth={S96} />
      <circle cx="70" cy="67" r="3.5" fill="currentColor" />
    </IlluSvg>
  )
}

/** Färdigt brev med bock. Steg 3 i flödet. */
export function IlluUtkastKlart({ size = 160, className, title }: IlluProps) {
  const id = useIlluId()
  const px = size
  return (
    <svg
      viewBox="0 0 160 120"
      width={px}
      height={(px * 120) / 160}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {title ? <title>{title}</title> : null}
      <IlluAccentGradient id={id} />
      {/* Brevark */}
      <rect
        x="30"
        y="12"
        width="76"
        height="96"
        rx="8"
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d="M44 34h48M44 48h48M44 62h48M44 76h30"
        stroke="currentColor"
        strokeWidth="3"
      />
      {/* Bock i accentcirkel */}
      <circle
        cx="114"
        cy="88"
        r="20"
        fill={`url(#${id})`}
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path d="m105 88 6 6 13-13" stroke="currentColor" strokeWidth="3" />
    </svg>
  )
}

/** Steg 1: tjänsten du söker. Bricka med text. */
export function StepIconTjanst({ size = 24, className, title }: IlluProps) {
  return (
    <IlluSvg box={24} size={size} className={className} title={title}>
      <rect
        x="2.5"
        y="6.5"
        width="19"
        height="14"
        rx={R24}
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={S24}
      />
      <path d="M8.5 6.5v-2a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 1.5 1.5v2" stroke="currentColor" strokeWidth={S24} />
      <path d="M7 13h10" stroke="currentColor" strokeWidth={S24} />
    </IlluSvg>
  )
}

/** Steg 2: arbetsgivaren. Byggnad. */
export function StepIconArbetsgivare({ size = 24, className, title }: IlluProps) {
  return (
    <IlluSvg box={24} size={size} className={className} title={title}>
      <path
        d="M3.5 20.5v-13l7-4 7 4v13"
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={S24}
      />
      <path d="M17.5 20.5v-9h3v9" stroke="currentColor" strokeWidth={S24} />
      <path d="M2 20.5h20" stroke="currentColor" strokeWidth={S24} />
      <path d="M8 11h5M8 15h5" stroke="currentColor" strokeWidth={S24} />
    </IlluSvg>
  )
}

/** Steg 3: din erfarenhet. Ark med penna. */
export function StepIconErfarenhet({ size = 24, className, title }: IlluProps) {
  return (
    <IlluSvg box={24} size={size} className={className} title={title}>
      <path
        d="M18.5 11.5v8a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5v-15A1.5 1.5 0 0 1 5 3h7"
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={S24}
      />
      <path d="M7 12h6M7 16h4" stroke="currentColor" strokeWidth={S24} />
      <path d="m15.5 8.5 5-5 2 2-5 5-2.5.5z" stroke="currentColor" strokeWidth={S24} />
    </IlluSvg>
  )
}

/** Stegikonerna i ordning, som StartFlow konsumerar dem. */
export const StepIndicatorIcons = [
  StepIconTjanst,
  StepIconArbetsgivare,
  StepIconErfarenhet,
] as const

/**
 * Percentilkurva med markerad position (docs/plan-konvertering.md, E3).
 * Används på /verktyg/rekryteringstester/prova efter provet.
 * viewBox 160×100, stroke 3, en gradient på markören.
 */
export function IlluTestResultat({
  size = 160,
  className,
  title,
  /** Var på kurvan markören sitter, 0 till 1. */
  position = 0.65,
}: IlluProps & { position?: number }) {
  const id = useIlluId()
  const px = size

  // Klockkurvan ritas en gång och markören placeras på den.
  const clamped = Math.min(0.95, Math.max(0.05, position))
  const markerX = 16 + clamped * 128
  // Gaussisk höjd så markören hamnar på kurvan, inte bredvid den.
  const bell = Math.exp(-Math.pow((clamped - 0.5) / 0.24, 2) / 2)
  const markerY = 78 - bell * 52

  return (
    <svg
      viewBox="0 0 160 100"
      width={px}
      height={(px * 100) / 160}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {title ? <title>{title}</title> : null}
      <IlluAccentGradient id={id} vertical />
      {/* Baslinje */}
      <path d="M12 78h136" stroke="currentColor" strokeWidth="3" strokeOpacity="0.35" />
      {/* Normalfördelningskurva */}
      <path
        d="M16 78c18 0 26-4 34-22s14-30 30-30 22 12 30 30 16 22 34 22"
        stroke="currentColor"
        strokeWidth="3"
      />
      {/* Markör på kurvan, accentelementet */}
      <path
        d={`M${markerX} ${markerY}v${78 - markerY}`}
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.45"
        strokeDasharray="4 5"
      />
      <circle
        cx={markerX}
        cy={markerY}
        r="8"
        fill={`url(#${id})`}
        fillOpacity="0.25"
        stroke="currentColor"
        strokeWidth="3"
      />
    </svg>
  )
}
