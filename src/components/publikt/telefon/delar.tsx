/**
 * Skärmens tre zoner: väggen högst upp, golvet med korten och foten med
 * knappen. Knappen i skärmen är en div, aldrig en länk: telefonen är en bild
 * (spec-publikt-v2 del A avsnitt 3).
 */

import type { ReactNode } from 'react'

export function SkarmVagg({
  kick,
  rubrik,
  sub,
  hoger,
  children,
}: {
  kick: ReactNode
  rubrik?: ReactNode
  sub?: ReactNode
  /** Text till höger om kicken, till exempel tiden. */
  hoger?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="s-vagg">
      {hoger ? (
        <div className="s-rad">
          <div className="s-kick">{kick}</div>
          <div className="s-kick" style={{ color: 'var(--vagg-mjuk)' }}>
            {hoger}
          </div>
        </div>
      ) : (
        <div className="s-kick">{kick}</div>
      )}
      {rubrik ? <div className="s-rub">{rubrik}</div> : null}
      {sub ? <div className="s-sub">{sub}</div> : null}
      {children}
    </div>
  )
}

export function SkarmGolv({ children }: { children: ReactNode }) {
  return <div className="s-golv">{children}</div>
}

export function SkarmFot({ knapp, children }: { knapp?: string; children?: ReactNode }) {
  return (
    <div className="s-fot">
      {knapp ? <div className="s-knapp">{knapp}</div> : children}
      <div className="s-hem" />
    </div>
  )
}

/** En mätare: rad med etikett och värde, stapel under. */
export function SkarmMatare({
  etikett,
  varde,
  andel,
  forsta,
}: {
  etikett: ReactNode
  varde: ReactNode
  /** 0 till 1 */
  andel: number
  forsta?: boolean
}) {
  return (
    <>
      <div className="s-rad" style={forsta ? undefined : { marginTop: 7 }}>
        <span>{etikett}</span>
        {varde}
      </div>
      <div className="s-matare">
        <i style={{ width: `${Math.round(andel * 100)}%` }} />
      </div>
    </>
  )
}

export function SkarmBock({ farg = '#1A1206', storlek = 14 }: { farg?: string; storlek?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={storlek}
      height={storlek}
      fill="none"
      stroke={farg}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}
