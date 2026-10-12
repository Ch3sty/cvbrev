/**
 * Svävande objekt i hjälten (spec-publikt-v2 del A avsnitt 3 och 4). Ren
 * CSS-rörelse, 12 s, förskjutna starttider, av vid reduced motion. Fasta
 * mått i width och height (CLS 0). Högst tre synliga under 640 px: sätt
 * doljPaMobil på resten. Matrisbrickan är expertfrågan i miniatyr.
 */

import type { CSSProperties, ReactNode } from 'react'
import { MatrisBricka } from './MatrisExpert'

export type SvavandeTyp = 'cv' | 'match' | 'matris' | 'brev' | 'chat' | 'bock' | 'plats' | 'lista' | 'klocka'

/** Bredd och höjd i SVG:ns egna enheter, för höjden i HTML. */
const MATT: Record<SvavandeTyp, [number, number]> = {
  cv: [112, 136],
  match: [150, 86],
  matris: [96, 96],
  brev: [92, 112],
  chat: [104, 84],
  bock: [46, 46],
  plats: [84, 96],
  lista: [120, 70],
  klocka: [92, 92],
}

const S = 'var(--ink-1)'

const FORMER: Record<Exclude<SvavandeTyp, 'matris'>, ReactNode> = {
  cv: (
    <>
      <rect x="6" y="10" width="92" height="118" rx="12" fill="var(--panel)" stroke={S} strokeWidth="2.5" />
      <circle cx="30" cy="36" r="10" fill="var(--insunken)" stroke={S} strokeWidth="2.5" />
      <path d="M48 31h34M48 41h24M22 62h60M22 74h60M22 86h44M22 98h60M22 110h36" stroke={S} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="86" cy="22" r="18" fill="var(--panel)" stroke={S} strokeWidth="2.5" />
      <path d="M86 6.5a15.5 15.5 0 1 1-13.4 7.7" stroke="var(--koppar)" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  match: (
    <>
      <rect x="3" y="3" width="144" height="80" rx="16" fill="var(--panel)" stroke={S} strokeWidth="2.5" />
      <path d="M20 26h58M20 40h40" stroke={S} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="96" y="18" width="38" height="22" rx="11" fill="var(--positiv-mjuk)" />
      <path d="M107 29l4 4 8-9" stroke="var(--positiv)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="20" y="56" width="110" height="8" rx="4" fill="var(--insunken)" />
      <rect x="20" y="56" width="101" height="8" rx="4" fill="var(--koppar)" />
    </>
  ),
  brev: (
    <>
      <path
        d="M8 4h52l24 24v76a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z"
        fill="var(--panel)"
        stroke={S}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M60 4v24h24" stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M18 40h44M18 52h52M18 64h52M18 88h30" stroke={S} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="18" y="72" width="52" height="8" rx="4" fill="var(--koppar)" />
    </>
  ),
  chat: (
    <>
      <path
        d="M6 10a8 8 0 0 1 8-8h50a8 8 0 0 1 8 8v22a8 8 0 0 1-8 8H30l-14 12V40h-2a8 8 0 0 1-8-8z"
        fill="var(--panel)"
        stroke={S}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M20 16h32M20 26h22" stroke={S} strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M98 48a8 8 0 0 0-8-8H48a8 8 0 0 0-8 8v16a8 8 0 0 0 8 8h32l10 10V72a8 8 0 0 0 8-8z"
        fill={S}
        stroke={S}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M52 52h30M52 62h18" stroke="var(--koppar-ljus)" strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  bock: (
    <>
      <circle cx="23" cy="23" r="21" fill="var(--koppar)" />
      <path d="M13 24l7 7 13-14" stroke="#1A1206" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  plats: (
    <>
      <path
        d="M42 92c-17-18-32-32-32-50a32 32 0 0 1 64 0c0 18-15 32-32 50z"
        fill="var(--panel)"
        stroke={S}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="42" cy="40" r="11" fill="var(--koppar)" />
    </>
  ),
  lista: (
    <>
      <rect x="3" y="3" width="114" height="64" rx="14" fill="var(--panel)" stroke={S} strokeWidth="2.5" />
      <path d="M18 22h40M18 36h28M18 50h34" stroke={S} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="90" cy="22" r="7" stroke={S} strokeWidth="2.5" />
      <circle cx="90" cy="22" r="3" fill="var(--koppar)" />
      <circle cx="90" cy="48" r="7" stroke={S} strokeWidth="2.5" />
    </>
  ),
  klocka: (
    <g stroke={S} strokeWidth="2.5">
      <circle cx="46" cy="50" r="34" fill="var(--panel)" />
      <path d="M46 28v22l14 9" strokeLinecap="round" />
      <path d="M36 10h20M46 10v6" strokeLinecap="round" />
      <path d="M46 16a34 34 0 0 1 31 20" stroke="var(--koppar)" strokeWidth="4" strokeLinecap="round" />
    </g>
  ),
}

export default function SvavandeObjekt({
  objekt,
  rot = 0,
  plats,
  bredd,
  doljPaMobil,
  mobil,
}: {
  objekt: SvavandeTyp
  /** Lutning i grader. */
  rot?: number
  plats: { top?: number | string; left?: number | string; right?: number | string; bottom?: number | string }
  bredd: number
  doljPaMobil?: boolean
  /** Annan plats och bredd under 640 px. */
  mobil?: { top?: number; left?: number; right?: number; bottom?: number; bredd?: number }
}) {
  const [b, h] = MATT[objekt]
  const hojd = Math.round((bredd * h) / b)
  const stil = {
    '--rot': `${rot}deg`,
    width: bredd,
    height: hojd,
    ...plats,
  } as CSSProperties
  return (
    <div
      className={`pub-flyt ${doljPaMobil ? 'pub-flyt-dolj-mobil' : ''} ${mobil ? 'pub-flyt-mobil' : ''}`.trim()}
      style={
        mobil
          ? ({
              ...stil,
              '--m-top': mobil.top !== undefined ? `${mobil.top}px` : 'auto',
              '--m-left': mobil.left !== undefined ? `${mobil.left}px` : 'auto',
              '--m-right': mobil.right !== undefined ? `${mobil.right}px` : 'auto',
              '--m-bottom': mobil.bottom !== undefined ? `${mobil.bottom}px` : 'auto',
              '--m-bredd': `${mobil.bredd ?? bredd}px`,
              '--m-hojd': `${Math.round(((mobil.bredd ?? bredd) * h) / b)}px`,
            } as CSSProperties)
          : stil
      }
      aria-hidden="true"
    >
      {objekt === 'matris' ? (
        <MatrisBricka bredd={bredd} />
      ) : (
        <svg viewBox={`0 0 ${b} ${h}`} width={bredd} height={hojd} fill="none" focusable="false">
          {FORMER[objekt]}
        </svg>
      )}
    </div>
  )
}
