'use client'

/**
 * FlowShell: gemensamt skal för alla flerstegsflöden
 * (docs/designsystem.md, "Komponenter"; docs/plan-inloggat-omdesign.md, avsnitt 6).
 *
 * Ett flöde är ett läge, inte en sida. Därför tar skalet hela skärmen, döljer
 * bottennavet och lägger sin egen fot där navet annars hade legat. Marken är
 * mark, toppraden och foten är panel, och tråden är den 2 px framstegslinjen
 * under toppraden: här är du i flödet.
 *
 * Tangentbordet är mobilflödets verkliga fiende. På iOS lägger sig det
 * virtuella tangentbordet ÖVER fixed-positionerade element, så en fixed fot
 * hamnar bakom tangentbordet i exakt de steg som har inmatning. Skalet är
 * därför ett fast lager över hela viewporten (till höger om sidomenyn på
 * desktop) som flex-kolumn där mitten scrollar och foten är sticky.
 *
 *   +------------------------------+
 *   | <  Personligt brev     2/5   |  topprad, 56 px, panel
 *   |  ============------------    |  tråden, 2 px
 *   +------------------------------+
 *   |  Ett steg, en fråga          |  enda scrollytan, mark
 *   +------------------------------+
 *   |  [ Fortsätt            ]     |  sticky fot, ink-knapp
 *   +------------------------------+
 */

import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'

/** useLayoutEffect på klienten, useEffect vid serverrendering (varnar annars). */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
import { ChevronLeft } from 'lucide-react'

export interface FlowShellProps {
  /** Flödets namn i toppraden, till exempel "Personligt brev". */
  title: string
  /** Ettbaserat steg och totalen, styr räknaren och framstegslinjen. */
  step: number
  totalSteps: number
  /** Tillbaka. Utelämnas på första steget, då visas lämna-knappen i stället. */
  onBack?: () => void
  /** Lämnar flödet helt. Visas som chevron när onBack saknas. */
  onExit?: () => void
  /** Etikett för lämna-knappen när onBack saknas. */
  exitLabel?: string

  /** Primärknappens text. Foten döljs helt om den utelämnas. */
  primaryLabel?: string
  onPrimary?: () => void
  primaryDisabled?: boolean
  /**
   * Varför knappen är spärrad, till exempel "Välj ett CV först".
   * Visas ovanför knappen så att en disablad knapp aldrig är tyst.
   */
  primaryBlockedReason?: string
  /** Väntläge: knappen byter text och spärras. */
  primaryBusy?: boolean
  busyLabel?: string
  /** Valfri sekundär handling i foten. Alltid textlänk, aldrig andra knapp. */
  footerSecondary?: ReactNode

  /** Stegets innehåll. Skalet äger scrollen, innehållet ska inte scrolla själv. */
  children: ReactNode
  /** Ligger överst i scrollytan, till exempel återkomstvalet eller ett fel. */
  banner?: ReactNode
}

export default function FlowShell({
  title,
  step,
  totalSteps,
  onBack,
  onExit,
  exitLabel = 'Avsluta',
  primaryLabel,
  onPrimary,
  primaryDisabled,
  primaryBlockedReason,
  primaryBusy,
  busyLabel = 'Vänta',
  footerSecondary,
  children,
  banner,
}: FlowShellProps) {
  // Bottennavet ska inte konkurrera med "Fortsätt" om samma yta. Variabeln
  // nollas så länge flödet lever, så allt som räknar mot --bottom-nav-h
  // (skalets egen fot inkluderad) vet att navet är borta.
  //
  // Före paint, inte efter. Med useEffect hann webbläsaren måla en bild där
  // e-postbannern och dashboardheadern fortfarande fanns, och nästa bild var
  // 57 px kortare. Det gav ett CLS på 0,106 på varje flödessteg, alltså ett
  // synligt hopp precis när användaren börjar läsa frågan.
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

  const pct = Math.round((Math.min(step, totalSteps) / totalSteps) * 100)
  const showFooter = Boolean(primaryLabel && onPrimary)

  // Fotens verkliga höjd publiceras som --flow-footer-h. Cookie-bannern
  // (z-999, fixed i botten) lägger sig annars över Fortsätt-knappen i varje
  // ny session, och en gissad konstant slutar stämma så fort foten får en
  // blockeringsrad eller en sekundär handling.
  const footerRef = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const root = document.documentElement
    const el = footerRef.current
    if (!el) {
      root.style.setProperty('--flow-footer-h', '0px')
      return
    }
    const mat = () =>
      root.style.setProperty('--flow-footer-h', `${Math.round(el.getBoundingClientRect().height)}px`)
    mat()
    const ro = new ResizeObserver(mat)
    ro.observe(el)
    return () => {
      ro.disconnect()
      root.style.removeProperty('--flow-footer-h')
    }
  }, [showFooter, primaryBlockedReason, footerSecondary])

  const backButton = onBack ?? onExit
  const backLabel = onBack ? 'Föregående steg' : exitLabel

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-mark lg:left-64">
      {/* Topp: tillbaka, titel, räknare, tråden. */}
      <header className="flex-shrink-0 border-b border-kant bg-panel">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-1 px-2">
          {backButton ? (
            <button
              type="button"
              onClick={backButton}
              aria-label={backLabel}
              className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-ink-1 transition-colors hover:bg-insunken"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
            </button>
          ) : (
            <span className="h-11 w-11 flex-shrink-0" aria-hidden="true" />
          )}

          <h1 className="min-w-0 flex-1 truncate text-base font-semibold tracking-[-0.01em] text-ink-1">
            {title}
          </h1>

          <span className="flex-shrink-0 pr-2 text-sm tabular-nums text-ink-3">
            {Math.min(step, totalSteps)} / {totalSteps}
          </span>
        </div>

        {/* Tråden: aktivt steg i flödet. */}
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-valuenow={Math.min(step, totalSteps)}
          aria-label={`Steg ${Math.min(step, totalSteps)} av ${totalSteps}`}
          className="h-0.5 w-full bg-kant"
        >
          <div
            className="h-full bg-accent transition-[width] duration-[240ms] ease-out motion-reduce:transition-none"
            style={{ width: `${pct}%` }}
          />
        </div>
      </header>

      {/* Mitten: flödets enda scrollyta. */}
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-3xl px-4 py-4">
          {banner ? <div className="mb-4">{banner}</div> : null}
          {children}
        </div>
      </main>

      {/* Fot: sticky i flex-kolumnen, aldrig fixed, så tangentbordet på iOS
          skjuter upp den i stället för att lägga sig över den. */}
      {showFooter ? (
        <footer
          ref={footerRef}
          className="flex-shrink-0 border-t border-kant bg-panel"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="mx-auto w-full max-w-3xl px-4 py-3">
            {primaryBlockedReason && primaryDisabled && !primaryBusy ? (
              <p className="mb-2 text-sm text-ink-2" aria-live="polite">
                {primaryBlockedReason}
              </p>
            ) : null}

            <button
              type="button"
              onClick={onPrimary}
              disabled={primaryDisabled || primaryBusy}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[200px]"
            >
              {primaryBusy ? busyLabel : primaryLabel}
            </button>

            {footerSecondary ? <div className="mt-2">{footerSecondary}</div> : null}
          </div>
        </footer>
      ) : null}
    </div>
  )
}
