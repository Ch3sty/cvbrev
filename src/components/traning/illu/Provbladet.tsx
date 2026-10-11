'use client'

/**
 * Provbladet: testbilderna för lyftet av Rekryteringstester
 * (docs/design/tester-lyft-2026-10-11/riktning.md och illustrationer/).
 * Koordinaterna är tagna ordagrant ur källfilerna illu-*.svg.
 *
 * Färgroller, aldrig hex:
 * - currentColor   kontur (ink-1 på papper, vagg-ink på väggen)
 * - --illu-dim     dämpad kontur: rutnät, hjälplinjer, övriga svar
 * - --illu-fill    yta: bladet, figurernas insida
 * - --illu-mjuk    mjuk yta: markerad rad eller cell, gjorda frågor
 * - --illu-accent  kopparn, exakt en yta per bild: svaret
 *
 * Variablerna sätts i globals.css för papper och golv (ljust och mörkt) och
 * för väggen (.vagg, .illu-vagg). Samma SVG på alla underlag.
 *
 * Storlek: `size` är bredden i px, höjden följer viewBox (160 × 120 eller
 * 240 × 180). Utan `size` och `className` fyller bilden sin rutas bredd
 * (block h-auto w-full). Med `className` styr klasserna helt, till exempel
 * mobilens "höjd 96, max-bredd 200": className="h-24 w-full max-w-[200px]";
 * viewBox centrerar bilden i rutan.
 */

import type { ReactNode } from 'react'
import { useIlluId } from '@/components/illustrations/primitives'

export interface IlluProvbladProps {
  /** Bredd i px. Höjden följer viewBox. Utelämnat: fyller rutan. */
  size?: number
  className?: string
  /** Tillgängligt namn. Utelämnat är bilden dekor (aria-hidden). */
  title?: string
}

export const A = 'var(--illu-accent, #E07A2F)'
export const DIM = 'var(--illu-dim)'
export const FILL = 'var(--illu-fill)'
export const MJUK = 'var(--illu-mjuk)'

export function IlluRam({
  w,
  h,
  size,
  className,
  title,
  children,
}: IlluProvbladProps & { w: number; h: number; children: ReactNode }) {
  const id = useIlluId()
  const titelId = `${id}-titel`
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={size ?? undefined}
      height={size ? Math.round((size * h) / w) : undefined}
      className={size ? className : (className ?? 'block h-auto w-full')}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      aria-labelledby={title ? titelId : undefined}
    >
      {title ? <title id={titelId}>{title}</title> : null}
      {children}
    </svg>
  )
}
