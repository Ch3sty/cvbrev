'use client'

/**
 * Illustrationssystemets primitiver (docs/plan-konvertering.md, spår E).
 *
 * Regler:
 * - Konturer i currentColor. Fyllningar via CSS-variablerna --illu-fill,
 *   --illu-accent och --illu-soft (definierade i globals.css).
 * - Linjetjocklek per viewBox: 24 → 1.5, 48 → 2, 96 → 3, 240 → 6.
 * - Hörnradie 8 procent av viewBox.
 * - Max en gradient per illustration, bara på accentelementet, aldrig som
 *   bakgrundscirkel och aldrig på en kontur.
 * - Unika gradient-id via useId(), aldrig hårdkodade strängar.
 */

import { useId } from 'react'

export interface IlluProps {
  className?: string
  /** Renderad storlek i px. viewBox styrs av illustrationen. */
  size?: number
  title?: string
}

export const ILLU = {
  stroke: { 24: 1.5, 48: 2, 96: 3, 240: 6 } as const,
  radius: { 24: 2, 48: 4, 96: 8, 240: 20 } as const,
  fill: 'var(--illu-fill, #FFFFFF)',
  accent: 'var(--illu-accent, #F97316)',
  soft: 'var(--illu-soft, #FFEDD5)',
  muted: 'var(--illu-muted, #A3A3A3)',
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

/** Accentgradient, max en per illustration. Använd bara på accentelementet. */
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
        <stop offset="0" stopColor="#FB923C" />
        <stop offset="1" stopColor="#EA580C" />
      </linearGradient>
    </defs>
  )
}
