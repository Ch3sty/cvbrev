'use client'

/**
 * Uppgiftsarket (plan-testflode-2026-11-20 avsnitt 1), ersätter rutnätet
 * och segmentstapeln. Öppnas från räknaren i lägen med väg tillbaka: ark
 * nedifrån på mobil (högst 70 vh), popover under räknaren på dator (360 px).
 * Celler 44×44, radie 12, 8 px mellan, fem per rad på mobil och åtta på
 * dator. Besvarad: ton med ton-ink-siffra. Aktuell: 2 px bläck. Passerad
 * obesvarad: kopparkant. Kvar: kant. Ett tryck stänger arket och visar
 * uppgiften. Esc och klick utanför stänger.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { IkonX } from '@/components/illustrations/RumSymboler'
import { SESSION } from './copy'

export type ArkCell = 'besvarad' | 'aktuell' | 'hoppad' | 'kvar'

export interface UppgiftsarketProps {
  open: boolean
  celler: ArkCell[]
  onValj: (i: number) => void
  onStang: () => void
  /** Räknaren, för popoverns plats på dator och fokus tillbaka. */
  ankare: HTMLElement | null
  /** Mellanrubriker (verbalt: texten), index där gruppen börjar. */
  grupper?: { fran: number; rubrik: string }[]
}

const CELL: Record<ArkCell, string> = {
  besvarad: 'bg-ton text-ton-ink border-transparent',
  aktuell: 'bg-papper text-ink-1 border-ink-1 shadow-[inset_0_0_0_1px_var(--ink-1)]',
  hoppad: 'bg-papper text-ink-1 border-koppar',
  kvar: 'bg-papper text-ink-2 border-kant',
}

export default function Uppgiftsarket({ open, celler, onValj, onStang, ankare, grupper }: UppgiftsarketProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [hoger, setHoger] = useState(16)
  const [dator, setDator] = useState(false)

  useLayoutEffect(() => {
    if (!open) return
    setDator(window.matchMedia('(min-width: 1024px)').matches)
    if (ankare) setHoger(Math.max(16, window.innerWidth - ankare.getBoundingClientRect().right))
  }, [open, ankare])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onStang()
      }
    }
    document.addEventListener('keydown', onKey)
    const id = requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>('[data-ark-aktuell]')?.focus())
    return () => {
      document.removeEventListener('keydown', onKey)
      cancelAnimationFrame(id)
      ankare?.focus?.()
    }
  }, [open, onStang, ankare])

  if (!open || typeof document === 'undefined') return null
  const besvarade = celler.filter((c) => c === 'besvarad').length
  const startar = new Map((grupper ?? []).map((g) => [g.fran, g.rubrik]))

  const rutor: React.ReactNode[] = []
  let rad: React.ReactNode[] = []
  const tom = () => {
    if (rad.length) rutor.push(<div key={`r${rutor.length}`} className="grid grid-cols-[repeat(5,2.75rem)] gap-2 lg:grid-cols-[repeat(6,2.75rem)]">{rad}</div>)
    rad = []
  }
  celler.forEach((c, i) => {
    const rubrik = startar.get(i)
    if (rubrik) {
      tom()
      rutor.push(
        <p key={`g${i}`} className="mt-1 truncate text-[12px] font-semibold uppercase leading-4 tracking-[.06em] text-ink-3">
          {rubrik}
        </p>
      )
    }
    rad.push(
      <button
        key={i}
        type="button"
        onClick={() => onValj(i)}
        aria-label={SESSION.ark.cell(i + 1, c)}
        aria-current={c === 'aktuell' ? 'step' : undefined}
        data-ark-aktuell={c === 'aktuell' ? '' : undefined}
        data-ark-cell={c}
        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-semibold tabular-nums transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--fokus,var(--ink-1))] ${CELL[c]}`}
      >
        {i + 1}
      </button>
    )
  })
  tom()

  return createPortal(
    <div className="fixed inset-0 z-[60]" data-sessionsram data-uppgiftsarket>
      <button type="button" aria-label={SESSION.ark.stang} tabIndex={-1} onClick={onStang} className="absolute inset-0 h-full w-full cursor-default bg-[color:var(--dimma,rgba(15,17,30,.42))] lg:bg-transparent" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={SESSION.ark.rubrik}
        className="sess-ark absolute inset-x-0 bottom-0 flex max-h-[70vh] flex-col rounded-t-ark bg-papper pb-[env(safe-area-inset-bottom)] shadow-svav lg:inset-x-auto lg:bottom-auto lg:top-[60px] lg:max-h-[min(70vh,520px)] lg:w-[360px] lg:rounded-xl lg:border lg:border-kant"
        style={dator ? { right: hoger } : undefined}
      >
        <div className="flex items-center gap-2 px-4 pb-2 pt-3 lg:hidden">
          <span className="mx-auto mb-1 block h-1 w-9 rounded-full bg-kant-stark lg:hidden" aria-hidden="true" />
        </div>
        <div className="flex items-start gap-2 px-4 lg:pt-3">
          <p className="min-w-0 flex-1">
            <b className="block font-sess-display text-[17px] font-bold leading-[22px] text-ink-1">{SESSION.ark.rubrik}</b>
            <span className="block text-[13px] leading-[18px] text-ink-3" data-ark-rad>
              {SESSION.ark.rad(besvarade, celler.length)}
            </span>
          </p>
          <button type="button" onClick={onStang} aria-label={SESSION.ark.stang} className="-mr-2 -mt-1 inline-flex h-11 w-11 items-center justify-center rounded-[10px] text-ink-1 hover:bg-papper-2">
            <IkonX size={20} />
          </button>
        </div>
        <div className="mt-2 flex flex-col gap-2 overflow-y-auto px-4 pb-4 pt-1">{rutor}</div>
      </div>
    </div>,
    document.body
  )
}
