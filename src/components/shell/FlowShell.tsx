'use client'

/**
 * FlowShell: gemensamt skal för alla flerstegsflöden
 * (docs/plan-inloggat-omdesign.md, avsnitt 6).
 *
 * Ett flöde är ett läge, inte en sida. Därför tar skalet hela skärmen, döljer
 * bottennavet och lägger sin egen fot där navet annars hade legat.
 *
 * Tangentbordet är mobilflödets verkliga fiende. På iOS lägger sig det
 * virtuella tangentbordet ÖVER fixed-positionerade element, så en fixed fot
 * hamnar bakom tangentbordet i exakt de steg som har inmatning. Skalet är
 * därför ett fast lager över hela viewporten (till höger om sidomenyn på
 * desktop) som flex-kolumn där mitten scrollar och foten är sticky. Fast
 * position krävs: som barn till dashboardens scrollande main hamnade foten
 * annars under vecket och bottennavet, och användaren såg ingen Fortsätt-knapp.
 * aldrig fixed. Det ger en enda fast bottenzon och inga kapslade scrollar.
 *
 *   +------------------------------+
 *   | <  Personligt brev     2/5   |  sticky topp, 48 px
 *   |  ============------------    |  tunn progressrad
 *   +------------------------------+
 *   |  Ett steg, en fråga          |  enda scrollytan
 *   +------------------------------+
 *   |  [ Fortsätt            ]     |  sticky fot, h-11
 *   +------------------------------+
 */

import { useEffect, useRef, type ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'

export interface FlowShellProps {
  /** Flödets namn i toppraden, till exempel "Personligt brev". */
  title: string
  /** Ettbaserat steg och totalen, styr räknaren och progressraden. */
  step: number
  totalSteps: number
  /** Tillbaka. Utelämnas på första steget, då visas stängkryss i stället. */
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

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white lg:left-72">
      {/* Topp: tillbaka, titel, räknare, progress. */}
      <header className="flex-shrink-0 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-12 w-full max-w-3xl items-center gap-2 px-2">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Föregående steg"
              className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-neutral-700 transition-colors hover:bg-neutral-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : onExit ? (
            <button
              type="button"
              onClick={onExit}
              aria-label={exitLabel}
              className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-neutral-700 transition-colors hover:bg-neutral-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <span className="h-11 w-11 flex-shrink-0" aria-hidden="true" />
          )}

          <h1 className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-900">
            {title}
          </h1>

          <span className="flex-shrink-0 pr-2 text-sm tabular-nums text-neutral-500">
            {Math.min(step, totalSteps)}/{totalSteps}
          </span>
        </div>

        {/* Progressraden är ett rent UI-element, ingen illustration. */}
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-valuenow={Math.min(step, totalSteps)}
          aria-label={`Steg ${Math.min(step, totalSteps)} av ${totalSteps}`}
          className="h-0.5 w-full bg-neutral-100"
        >
          <div
            className="h-full bg-orange-600 transition-[width] duration-200 ease-out motion-reduce:transition-none"
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
          className="flex-shrink-0 border-t border-neutral-200 bg-white"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="mx-auto w-full max-w-3xl px-4 py-3">
            {primaryBlockedReason && primaryDisabled && !primaryBusy ? (
              <p className="mb-2 text-sm text-neutral-600" aria-live="polite">
                {primaryBlockedReason}
              </p>
            ) : null}

            <button
              type="button"
              onClick={onPrimary}
              disabled={primaryDisabled || primaryBusy}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-orange-600 px-4 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[200px]"
            >
              {primaryBusy ? busyLabel : primaryLabel}
            </button>

            {footerSecondary ? (
              <div className="mt-2">{footerSecondary}</div>
            ) : null}
          </div>
        </footer>
      ) : null}
    </div>
  )
}
