'use client'

/**
 * Illustrationssystemets primitiver (docs/designsystem.md, "Marginalplattan
 * och illustrationer").
 *
 * Regler:
 * - Konturer i currentColor. Fyllningar via CSS-variablerna --illu-fill,
 *   --illu-accent, --illu-soft och --illu-muted, som i globals.css pekar på
 *   Trådens tokens (panel, accent, accent-mjuk, kant-stark).
 * - Linjetjocklek per viewBox: 24 → 1.75, 48 → 2, 96 → 3, 240 → 6.
 * - Hörnradie 8 procent av viewBox.
 * - En accentform per illustration, fylld och liten, högst en tiondel av
 *   motivet. Aldrig som bakgrundscirkel, aldrig på en kontur.
 * - Unika id via useIlluId(), aldrig hårdkodade strängar.
 *
 * Scen-regler för 96 och 240: en scen berättar ett ögonblick, högst tre
 * element (bärande, rörligt, accent), det rörliga lutar 4 till 8 grader,
 * aldrig ovanpå text.
 */

import { useId } from 'react'

export interface IlluProps {
  className?: string
  /** Renderad storlek i px. viewBox styrs av illustrationen. */
  size?: number
  title?: string
}

export const ILLU = {
  stroke: { 24: 1.75, 48: 2, 96: 3, 240: 6 } as const,
  radius: { 24: 2, 48: 4, 96: 8, 240: 20 } as const,
  fill: 'var(--illu-fill, #FFFFFF)',
  accent: 'var(--illu-accent, #D9480F)',
  soft: 'var(--illu-soft, #FBE7D3)',
  muted: 'var(--illu-muted, #C4B9A8)',
  /** Knockout ovanpå accentytan. Används i stället för hårdkodat vitt. */
  onAccent: 'var(--illu-on-accent, #FFFFFF)',
} as const

export type IlluBox = keyof typeof ILLU.stroke

/** Unikt id-prefix för gradienter och clip-paths inuti en illustration. */
export function useIlluId(): string {
  return useId().replace(/[:]/g, '')
}

interface SvgProps extends IlluProps {
  box: IlluBox
  children: React.ReactNode
}

/** Gemensam SVG-wrapper: viewBox, aria, storlek. */
export function IlluSvg({ box, size, className, title, children }: SvgProps) {
  const px = size ?? box
  return (
    <svg
      viewBox={`0 0 ${box} ${box}`}
      width={px}
      height={px}
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
      {children}
    </svg>
  )
}

/**
 * Accentfyllning. Behåller namnet och API:t från v1 så att befintliga
 * illustrationer fortsätter fungera, men i Tråden är accenten platt: orange
 * är en linje eller ett bläck, aldrig en gradient. Båda stoppen pekar på
 * --illu-accent, så `fill="url(#id)"` ger samma ton som ILLU.accent.
 */
export function IlluAccentGradient({ id, vertical = false }: { id: string; vertical?: boolean }) {
  return (
    <defs>
      <linearGradient
        id={id}
        x1="0"
        y1="0"
        x2={vertical ? '0' : '1'}
        y2={vertical ? '1' : '1'}
      >
        <stop offset="0" stopColor={ILLU.accent} />
        <stop offset="1" stopColor={ILLU.accent} />
      </linearGradient>
    </defs>
  )
}
