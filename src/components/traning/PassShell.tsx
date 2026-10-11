'use client'

/**
 * PassShell: passets helskärm (spec-rummen 4.4, konceptets P1 till P3).
 *
 * En FlowShell-variant: tar hela skärmen (till höger om sidomenyn på dator),
 * döljer dörrnavet, scrollar bara i mitten och har en sticky fot. Skillnaden
 * mot FlowShell är toppraden och tidsraden:
 *
 *   +------------------------------------+
 *   | X  Rotation med byte        3 / 9  |  56 px, papper
 *   |    Dagens pass · nivå 5            |
 *   |====================----------------|  tidsraden, 4 px
 *   | 0:38                provets tid 1:08|  11 px, tabular
 *   +------------------------------------+
 *
 * Tidsraden fylls mot provets tid per uppgift. Den räknar aldrig ner och
 * byter aldrig färg; efter budgeten står den full (konceptets notis "Reglerna
 * i passet"). Uppvärmningen har ingen tidsrad (ingen tid, 1d).
 *
 * Interaktionen mellan frågorna laddar aldrig om sidan: skalet står kvar och
 * bara mitten byts.
 */

import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { IkonX } from '@/components/illustrations/RumSymboler'
import { PASS_COPY, mmss } from '@/lib/traning/pass-copy'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export interface PassShellProps {
  /** Passets tema, till exempel "Rotation med byte". */
  titel: string
  /** "Dagens pass · nivå 5". */
  undertitel: string
  /** Ettbaserad fråga och antal, null döljer räknaren. */
  fraga: number | null
  antal: number | null
  /** Tid på frågan och provets tid per uppgift. Null: ingen tidsrad. */
  tid: { sekunder: number; budget: number } | null
  /** X lämnar passet (svaren är redan sparade). */
  onAvsluta: () => void
  avslutaEtikett?: string
  /** Foten: kopparknappen eller länken "Vet inte, visa regeln". */
  fot?: ReactNode
  banner?: ReactNode
  /** Byts nyckeln (ny fråga) rullas mitten till toppen. */
  nyckel?: string
  children: ReactNode
}

/** Lägger skalet över dashboarden: navet döljs, foten är vår. Samma regel som FlowShell. */
export function useFlodeLage(footerRef: React.RefObject<HTMLElement | null>, harFot: boolean) {
  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement
    const previous = root.style.getPropertyValue('--bottom-nav-h')
    root.style.setProperty('--bottom-nav-h', '0px')
    root.setAttribute('data-flow-active', 'true')
    return () => {
      if (previous) root.style.setProperty('--bottom-nav-h', previous)
      else root.style.removeProperty('--bottom-nav-h')
      root.removeAttribute('data-flow-active')
    }
  }, [])

  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement
    const el = footerRef.current
    if (!el) {
      root.style.setProperty('--flow-footer-h', '0px')
      return
    }
    const mat = () => root.style.setProperty('--flow-footer-h', `${Math.round(el.getBoundingClientRect().height)}px`)
    mat()
    const ro = new ResizeObserver(mat)
    ro.observe(el)
    return () => {
      ro.disconnect()
      root.style.removeProperty('--flow-footer-h')
    }
  }, [harFot])
}

export function Tidsrad({ sekunder, budget }: { sekunder: number; budget: number }) {
  const andel = budget > 0 ? Math.min(1, sekunder / budget) : 0
  return (
    <>
      <div
        role="progressbar"
        aria-label={PASS_COPY.tid.aria}
        aria-valuemin={0}
        aria-valuemax={budget}
        aria-valuenow={Math.min(Math.floor(sekunder), budget)}
        className="relative h-1 w-full bg-papper-2"
      >
        <i
          className="absolute inset-y-0 left-0 block rounded-r-[2px] bg-koppar"
          style={{ width: `${(andel * 100).toFixed(2)}%` }}
        />
      </div>
      <div className="mx-auto flex w-full max-w-[560px] justify-between px-4 pt-1.5 text-[11px] leading-4 tabular-nums text-ink-3">
        <span>{mmss(sekunder)}</span>
        <span>{PASS_COPY.tid.provetsTid(budget)}</span>
      </div>
    </>
  )
}

export default function PassShell({
  titel,
  undertitel,
  fraga,
  antal,
  tid,
  onAvsluta,
  avslutaEtikett = PASS_COPY.topp.avsluta,
  fot,
  banner,
  nyckel,
  children,
}: PassShellProps) {
  const footerRef = useRef<HTMLElement | null>(null)
  const mainRef = useRef<HTMLElement | null>(null)
  useFlodeLage(footerRef, Boolean(fot))
  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0
  }, [nyckel])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-golv lg:left-[248px]" data-pass-shell>
      <header className="flex-shrink-0 border-b border-kant bg-papper">
        <div className="mx-auto flex h-14 w-full max-w-[560px] items-center gap-2 pl-1 pr-2">
          <button
            type="button"
            onClick={onAvsluta}
            aria-label={avslutaEtikett}
            className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] text-ink-1 transition-colors hover:bg-papper-2"
          >
            <IkonX />
          </button>
          <p className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold leading-5 text-ink-1">{titel}</span>
            <span className="block truncate text-xs font-medium leading-4 text-ink-3">{undertitel}</span>
          </p>
          {fraga != null && antal != null ? (
            <span className="flex-shrink-0 pr-2 text-[13px] tabular-nums text-ink-3" aria-label={`Fråga ${fraga} av ${antal}`}>
              {fraga} / {antal}
            </span>
          ) : null}
        </div>
      </header>
      {tid ? (
        <div className="flex-shrink-0">
          <Tidsrad sekunder={tid.sekunder} budget={tid.budget} />
        </div>
      ) : null}

      <main ref={mainRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto flex w-full max-w-[560px] flex-col gap-3.5 px-4 pb-4 pt-3">
          {banner}
          {children}
        </div>
      </main>

      {fot ? (
        <footer
          ref={footerRef}
          className="flex-shrink-0 border-t border-kant bg-papper"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="mx-auto flex w-full max-w-[560px] flex-col gap-2 px-4 py-3">{fot}</div>
        </footer>
      ) : null}
    </div>
  )
}
