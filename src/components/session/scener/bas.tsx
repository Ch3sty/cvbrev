/**
 * Provbladet, scenerna i sessionsramen (plan-testflode-2026-11-20 4.1).
 *
 * Varje scen är provbladet för sin testtyp, tecknat med lugn hand: ett blad
 * med uppgiften, ett dämpat blad bakom för djup, och exakt en kopparyta som
 * är svaret (riktningen i docs/design/tester-lyft-2026-10-11/riktning.md).
 * Inga maskoter, inga metaforer, ingen text, inga gradienter, inga skuggor.
 *
 * Färgroller, aldrig hex:
 * - currentColor  kontur: ink-1 på papper, vagg-ink på väggen (.illu-vagg)
 * - DIM           dämpad kontur: rutnät, hjälplinjer, övriga svar
 * - FILL          bladets och figurernas yta: papper, eller vagg-2 på väggen
 * - MJUK          markerad ruta eller rad: ton, eller vagg-mjuk 18 % på väggen
 * - A             kopparn, en yta per scen: svaret
 *
 * --illu-* sätts i globals.css för papper, golv och vägg i båda skärmlägena;
 * reserverna gör att scenen håller i appen Testklar också, som mappar sina
 * tokens till --papper, --koppar, --ink-3 och --ton på roten.
 *
 * Geometri: viewBox 160 × 120 på ett 8-pixelsrutnät, kontur 3, dämpad 2,5,
 * radie 8 på blad, 6 på kort, 4 på celler. Fasta width/height-attribut så
 * att rutan har sin storlek före CSS (CLS 0); className styr sedan måttet
 * (dator 160 × 120, mobil h-24 w-auto).
 */

import type { ReactNode, SVGProps } from 'react'
import s from './scener.module.css'

export const K = 'currentColor'
export const A = 'var(--illu-accent, var(--koppar))'
export const DIM = 'var(--illu-dim, var(--ink-3))'
export const FILL = 'var(--illu-fill, var(--papper))'
export const MJUK = 'var(--illu-mjuk, var(--ton))'

/** Klasser för rörelsen: yta utan kontur, streckad kontur, sen grupp. */
export const YTA = s.yta
export const STRECK = s.streck
export const SEN = s.sen

export interface ScenProps {
  className?: string
  /** Ritar in konturen 600 ms (startskärmen). Utelämnat: stilla. */
  rita?: boolean
}

export function ScenRam({ className, rita, children }: ScenProps & { children: ReactNode }) {
  const klass = [s.scen, rita ? s.rita : null, className].filter(Boolean).join(' ')
  return (
    <svg
      viewBox="0 0 160 120"
      width="160"
      height="120"
      className={klass}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  )
}

type Rek = SVGProps<SVGRectElement>

/** Bladet: dämpat blad 6 px bakom (ned åt höger) och det starka framför. */
export function Blad({ x, y, w, h, bak = true }: { x: number; y: number; w: number; h: number; bak?: boolean }) {
  return (
    <>
      {bak ? <rect x={x + 6} y={y + 6} width={w} height={h} rx="8" fill={FILL} stroke={DIM} strokeWidth="2.5" /> : null}
      <rect x={x} y={y} width={w} height={h} rx="8" fill={FILL} stroke={K} strokeWidth="3" />
    </>
  )
}

/** Ett kort med stark kontur (svarsalternativ). */
export function Kort(p: Rek) {
  return <rect rx="6" fill={FILL} stroke={K} strokeWidth="3" {...p} />
}

/** Dämpad linje (rutnät, textrad, hjälplinje). */
export function Dimrad({ d, w = 3 }: { d: string; w?: number }) {
  return <path d={d} stroke={DIM} strokeWidth={w} />
}

/** Stark linje (textrad som räknas, visare). */
export function Rad({ d, w = 3 }: { d: string; w?: number }) {
  return <path d={d} stroke={K} strokeWidth={w} />
}
