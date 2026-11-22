/**
 * Grundens ikoner (docs/design/publikt-omgang3/delar/ikoner.html): de fyra
 * delarnas dörrar och handlingarnas pilar. Inline-SVG, currentColor,
 * aria-hidden. Aldrig gnistikonen.
 */

import type { ReactElement } from 'react'
import type { Farg } from './farg'

export type IkonNamn =
  | 'tran'
  | 'cv'
  | 'brev'
  | 'jobb'
  | 'neutral'
  | 'pil'
  | 'ner'
  | 'meny'
  | 'upp'
  | 'las'
  | 'bock'
  | 'x'
  | 'tillbaka'

const S = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const

const RITNING: Record<IkonNamn, ReactElement> = {
  tran: (
    <g {...S} strokeWidth="1.75">
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17" />
      <rect x="16" y="16" width="3.2" height="3.2" rx=".8" fill="currentColor" stroke="none" />
    </g>
  ),
  cv: (
    <g {...S} strokeWidth="1.75">
      <rect x="4.5" y="3" width="15" height="18" rx="2.5" />
      <circle cx="9" cy="8.5" r="1.6" />
      <path d="M12.5 8.5h4M8 13h8M8 16.5h8" />
    </g>
  ),
  brev: (
    <g {...S} strokeWidth="1.75">
      <path d="M6.5 3h9l4 4v12a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M8.5 9.5h7M8.5 13h7M8.5 16.5h4" />
    </g>
  ),
  jobb: (
    <g {...S} strokeWidth="1.75">
      <path d="M4 17.5c3-.2 3.6-4.2 6.4-4.6 2.6-.4 3 2 5.4 1.4 2-.5 2.6-3 4.2-6.3" />
      <circle cx="4" cy="17.5" r="1.7" />
      <circle cx="10.6" cy="12.8" r="1.7" />
      <path d="M20 4v5M20 4.3l-3.4 1.2 3.4 1.3" />
    </g>
  ),
  neutral: (
    <g {...S} strokeWidth="1.75">
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </g>
  ),
  pil: (
    <g {...S} strokeWidth="2.4">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </g>
  ),
  ner: (
    <g {...S} strokeWidth="2.2">
      <path d="M6 9l6 6 6-6" />
    </g>
  ),
  meny: (
    <g {...S} strokeWidth="2.2">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </g>
  ),
  upp: (
    <g {...S} strokeWidth="2.2">
      <path d="M12 16V5M7 9.5l5-5 5 5M5 19h14" />
    </g>
  ),
  las: (
    <g {...S} strokeWidth="2">
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </g>
  ),
  bock: (
    <g {...S} strokeWidth="2.6">
      <path d="M5 12.5l4.5 4.5 9.5-10" />
    </g>
  ),
  x: (
    <g {...S} strokeWidth="2.4">
      <path d="M6 6l12 12M18 6L6 18" />
    </g>
  ),
  tillbaka: (
    <g {...S} strokeWidth="2.4">
      <path d="M15 5l-7 7 7 7" />
    </g>
  ),
}

export function Ikon({ namn, className }: { namn: IkonNamn; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      {RITNING[namn]}
    </svg>
  )
}

/** Dörren: ikonen i en ruta med klack, i ytans färg. */
export function Dorr({ ikon, className = '' }: { ikon: IkonNamn | Farg; className?: string }) {
  return (
    <span className={`p3-dorr ${className}`.trim()} aria-hidden="true">
      <Ikon namn={ikon} />
    </span>
  )
}
