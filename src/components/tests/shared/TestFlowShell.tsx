'use client'

/**
 * TestFlowShell: skalet för ett pågående prov eller test.
 *
 * Ett prov är ett läge, inte en sida. Precis som flerstegsflödena (FlowShell)
 * tar det därför hela skärmen. Bakgrunden är ett QA-fynd från 2026-09-13:
 * provet låg i dashboardskalet, så dashboardens header, e-postbannern och
 * cookie-bannern åt höjd medan klockan gick. På 375 px klipptes
 * svarsalternativen i nederkant, och bottennavet låg dessutom över den
 * primära knappen. I en vy där tiden mäts kan användaren inte backa och tänka om.
 *
 * Skalet är ett fast lager över hela viewporten (till höger om sidomenyn på
 * desktop) som flex-kolumn. Marken är mark, topprad och fot är panel, tråden
 * är den 2 px framstegslinjen under mätraden.
 *
 *   +------------------------------+
 *   |  Logiktest, grund       [ X ]|  topprad
 *   |  00:42   Fråga 3 / 15    5   |  testets egen mätrad
 *   |  =========------------       |  tråden
 *   +------------------------------+
 *   |  matris, svarsalternativ     |  enda scrollytan
 *   +------------------------------+
 *   |  [ Nästa ]                   |  sticky fot, alltid nåbar
 *   +------------------------------+
 *
 * Foten är sticky i flex-kolumnen, aldrig fixed. Ett fixed element hamnar
 * bakom det virtuella tangentbordet på iOS, och de numeriska proven har
 * inmatning.
 *
 * `data-flow-active` på html-elementet är samma kontrakt som FlowShell
 * använder: globals.css döljer bottennavet och flyttar cookie-bannern
 * ovanför foten så länge attributet finns.
 */

import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

export interface TestFlowShellProps {
  /** Testets namn i toppraden, till exempel "Logiktest, grundnivå". */
  title: string
  /**
   * Testets egen mätrad: klocka, fråga X av Y, besvarade. Varje testtyp
   * mäter olika saker, så skalet dikterar inte innehållet, bara platsen.
   */
  meter?: ReactNode
  /** 0 till 100. Ritas som tråden under toppraden. */
  progressPercent?: number

  /** Lämnar provet. Visas som kryss till höger i toppraden. */
  onExit?: () => void
  exitLabel?: string

  /** Stegets innehåll. Skalet äger scrollen. */
  children: ReactNode
  /** Foten: primärknapp och eventuell navigering. Utelämnas den finns ingen fot. */
  footer?: ReactNode
}

export default function TestFlowShell({
  title,
  meter,
  progressPercent,
  onExit,
  exitLabel = 'Avsluta testet',
  children,
  footer,
}: TestFlowShellProps) {
  // Samma kontrakt som FlowShell. Bottennavet ska inte konkurrera med
  // provets primärknapp om samma yta, och cookie-bannern ska inte lägga sig
  // över den.
  useEffect(() => {
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

  // Fotens verkliga höjd publiceras som --flow-footer-h, så cookie-bannern
  // hamnar precis ovanför den även när foten växer med en extra rad.
  const footerRef = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const root = document.documentElement
    const el = footerRef.current
    if (!el) {
      root.style.setProperty('--flow-footer-h', '0px')
      return
    }
    const mat = () =>
      root.style.setProperty(
        '--flow-footer-h',
        `${Math.round(el.getBoundingClientRect().height)}px`
      )
    mat()
    const ro = new ResizeObserver(mat)
    ro.observe(el)
    return () => {
      ro.disconnect()
      root.style.removeProperty('--flow-footer-h')
    }
  }, [footer])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-mark lg:left-64">
      <header className="flex-shrink-0 border-b border-kant bg-panel">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-2 px-2">
          <h1 className="min-w-0 flex-1 truncate pl-2 text-base font-semibold tracking-[-0.01em] text-ink-1">
            {title}
          </h1>

          {onExit ? (
            <button
              type="button"
              onClick={onExit}
              aria-label={exitLabel}
              className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-ink-1 transition-colors hover:bg-insunken"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
          ) : (
            <span className="h-11 w-11 flex-shrink-0" aria-hidden="true" />
          )}
        </div>

        {meter ? <div className="mx-auto w-full max-w-3xl px-4 pb-2">{meter}</div> : null}

        {typeof progressPercent === 'number' ? (
          <div className="h-0.5 w-full bg-kant" aria-hidden="true">
            <div
              className="h-full origin-left bg-accent transition-transform duration-[240ms] ease-out motion-reduce:transition-none"
              style={{ transform: `scaleX(${Math.max(0, Math.min(100, progressPercent)) / 100})` }}
            />
          </div>
        ) : null}
      </header>

      {/* Provets enda scrollyta. */}
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-3xl px-4 py-4">{children}</div>
      </main>

      {footer ? (
        <footer
          ref={footerRef}
          className="flex-shrink-0 border-t border-kant bg-panel"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="mx-auto w-full max-w-3xl px-4 py-3">{footer}</div>
        </footer>
      ) : null}
    </div>
  )
}
