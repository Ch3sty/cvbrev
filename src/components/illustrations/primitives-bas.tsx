/**
 * Illustrationssystemets hooklösa delar: typerna, ILLU och IlluSvg. Utan
 * 'use client', så att serverkomponenter kan importera dem (TestGlyfer och
 * TestBredd, beslut om säljytorna 2026-11-15). primitives.tsx re-exporterar
 * allt härifrån; reglerna står där.
 */

import type { ReactNode } from 'react'

export interface IlluProps {
  className?: string
  /** Renderad storlek i px. viewBox styrs av illustrationen. */
  size?: number
  title?: string
}

export const ILLU = {
  stroke: { 24: 1.75, 48: 2, 96: 3, 120: 3, 240: 6 } as const,
  radius: { 24: 2, 48: 4, 96: 8, 120: 10, 240: 20 } as const,
  fill: 'var(--illu-fill, #FFFFFF)',
  accent: 'var(--illu-accent, #D9480F)',
  soft: 'var(--illu-soft, #FBE7D3)',
  muted: 'var(--illu-muted, #C4B9A8)',
  /** Knockout ovanpå accentytan. Används i stället för hårdkodat vitt. */
  onAccent: 'var(--illu-on-accent, #FFFFFF)',
} as const

export type IlluBox = keyof typeof ILLU.stroke

interface SvgProps extends IlluProps {
  box: IlluBox
  children: ReactNode
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

