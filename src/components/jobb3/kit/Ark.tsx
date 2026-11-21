'use client'

/**
 * Rummets ark (BYGGSPEC avsnitt 5): botten på telefon, mitten på dator.
 * Logga sökt tjänst, Byt CV, Rätta, Filter, Så söker vi åt dig, Ändra
 * veckans mål, Lägg till händelse, Kallad till intervju (tid och plats).
 *
 * Arket läggs i body (portal), med dimman bakom. Escape och ett tryck på
 * dimman stänger; fokus flyttas till arket när det öppnas och tillbaka till
 * knappen som öppnade det när det stängs; sidan bakom rullar inte.
 * Rörelse: arket glider upp (telefon) eller tonar in (dator), inget under
 * prefers-reduced-motion.
 */

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IkonKryss } from './ikoner'

export interface ArkProps {
  open: boolean
  onClose: () => void
  rubrik: string
  /** En rad under rubriken. */
  text?: ReactNode
  children: ReactNode
  /** Arkets fot: primärknappen (StorKnapp bred) och en rad under. */
  fot?: ReactNode
  /** Bredd på dator i px (560 i grunden). */
  bredd?: number
}

export function Ark({ open, onClose, rubrik, text, children, fot, bredd }: ArkProps) {
  const [monterad, setMonterad] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()
  const stang = useRef(onClose)
  stang.current = onClose

  useEffect(() => setMonterad(true), [])

  useEffect(() => {
    if (!open) return
    const forra = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Fokus på arket självt: inget tangentbord fälls upp på telefonen förrän hon trycker i ett fält.
    ref.current?.focus()
    const tangent = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        stang.current()
      }
      if (e.key === 'Tab' && ref.current) {
        const f = Array.from(ref.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'))
        if (!f.length) return
        const a = f[0]
        const b = f[f.length - 1]
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault()
          b.focus()
        } else if (!e.shiftKey && document.activeElement === b) {
          e.preventDefault()
          a.focus()
        }
      }
    }
    document.addEventListener('keydown', tangent)
    return () => {
      document.removeEventListener('keydown', tangent)
      document.body.style.overflow = overflow
      forra?.focus?.()
    }
  }, [open])

  if (!monterad || !open) return null
  return createPortal(
    <div
      className="j3-dimma"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div ref={ref} className="j3-ark" role="dialog" aria-modal="true" aria-labelledby={`${id}-r`} tabIndex={-1} style={bredd ? ({ ['--j3-ark-b' as string]: `${bredd}px` } as CSSProperties) : undefined}>
        <span className="j3-ark-grepp" aria-hidden="true" />
        <div className="j3-ark-huvud">
          <h2 id={`${id}-r`}>{rubrik}</h2>
          <button type="button" className="j3-ark-stang" aria-label="Stäng" onClick={onClose}>
            <IkonKryss />
          </button>
        </div>
        {text ? <p className="j3-ark-text">{text}</p> : null}
        <div className="j3-ark-innehall">{children}</div>
        {fot ? <div className="j3-ark-fot">{fot}</div> : null}
      </div>
    </div>,
    document.body,
  )
}
