'use client'

/**
 * FlowShell: gemensamt skal för alla flerstegsflöden
 * (docs/designsystem.md, "Komponenter"; docs/plan-inloggat-omdesign.md, avsnitt 6).
 *
 * Ett flöde är ett läge, inte en sida. Därför tar skalet hela skärmen, döljer
 * dörrnavet och lägger sin egen fot där navet annars hade legat. Bakgrunden
 * är rummets golv, toppraden och foten är papper, och framstegslinjen är
 * 3 px koppar under toppraden. Rubriken står i display 15/600, knappen är
 * kopparknappen (KNAPP_PRIMAR), ikonerna kommer ur RumSymboler
 * (spec-rummen 2.1, våg 1b).
 *
 * Tangentbordet är mobilflödets verkliga fiende. På iOS lägger sig det
 * virtuella tangentbordet ÖVER fixed-positionerade element, så en fixed fot
 * hamnar bakom tangentbordet i exakt de steg som har inmatning. Skalet är
 * därför ett fast lager över hela viewporten (till höger om sidomenyn på
 * desktop) som flex-kolumn där mitten scrollar och foten är sticky.
 *
 *   +------------------------------+
 *   | <  Personligt brev     2/5   |  topprad, 56 px, papper
 *   |  ============------------    |  framsteg, 3 px koppar
 *   +------------------------------+
 *   |  Ett steg, en fråga          |  enda scrollytan, golv
 *   +------------------------------+
 *   |  [ Fortsätt            ]     |  sticky fot, kopparknapp
 *   +------------------------------+
 */

import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'

/** useLayoutEffect på klienten, useEffect vid serverrendering (varnar annars). */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
import { useRouter } from 'next/navigation'
import { IkonTillbaka, IkonX } from '@/components/illustrations/RumSymboler'
import { KNAPP_PRIMAR } from './knappar'
import { lamnaFlodet } from '@/lib/flow/flodeshistorik'

export interface FlowShellProps {
  /** Flödets namn i toppraden, till exempel "Personligt brev". */
  title: string
  /** Ettbaserat steg och totalen, styr räknaren och framstegslinjen. */
  step: number
  totalSteps: number
  /** Tillbaka. Utelämnas på första steget, då visas lämna-knappen i stället. */
  onBack?: () => void
  /**
   * Lämnar flödet helt. Körs av X längst till höger i toppraden, och av
   * chevronen på första steget när onBack saknas. Saknas onExit går X till
   * rummet flödet startades från (reserv /dashboard) och tar flödets steg
   * ur historiken: ett flöde får aldrig vara en återvändsgränd.
   */
  onExit?: () => void
  /** Etikett för lämna-knappen när onBack saknas. */
  exitLabel?: string
  /**
   * Ingen chevron till vänster när onBack saknas: bara krysset lämnar
   * flödet. Registreringens steg 3, där det inte finns något steg att backa till.
   */
  utanTillbaka?: boolean
  /** Innehåll och fot i en kolumn på 560 px i stället för 768 (en fråga, inte en prislista). */
  smal?: boolean
  /**
   * Dörrarna i botten syns, och skalet slutar ovanför dem. För det klara
   * läget: man ser att man är hemma. Foten står kvar ovanför dörrarna.
   */
  visaDorrar?: boolean

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
  /**
   * Sekundären som en knapp i samma storlek bredvid primären (under på
   * mobil), i stället för under den. Registreringens steg 3: Köp och Börja
   * gratis är två lika stora val.
   */
  footerSecondarySameSize?: boolean

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
  utanTillbaka = false,
  smal = false,
  visaDorrar = false,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  primaryBlockedReason,
  primaryBusy,
  busyLabel = 'Vänta',
  footerSecondary,
  footerSecondarySameSize = false,
  children,
  banner,
}: FlowShellProps) {
  const router = useRouter()

  // Bottennavet ska inte konkurrera med "Fortsätt" om samma yta. Variabeln
  // nollas så länge flödet lever, så allt som räknar mot --bottom-nav-h
  // (skalets egen fot inkluderad) vet att navet är borta.
  //
  // Före paint, inte efter. Med useEffect hann webbläsaren måla en bild där
  // e-postbannern och dashboardheadern fortfarande fanns, och nästa bild var
  // 57 px kortare. Det gav ett CLS på 0,106 på varje flödessteg, alltså ett
  // synligt hopp precis när användaren börjar läsa frågan.
  //
  // Med visaDorrar står navet kvar (globals.css släpper det på
  // data-flow-dorrar) och variabeln behåller sin höjd, så skalet slutar
  // ovanför dörrarna.
  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement
    const previous = root.style.getPropertyValue('--bottom-nav-h')
    if (!visaDorrar) root.style.setProperty('--bottom-nav-h', '0px')
    root.setAttribute('data-flow-active', 'true')
    if (visaDorrar) root.setAttribute('data-flow-dorrar', 'true')
    return () => {
      if (!visaDorrar) {
        if (previous) root.style.setProperty('--bottom-nav-h', previous)
        else root.style.removeProperty('--bottom-nav-h')
      }
      root.removeAttribute('data-flow-active')
      root.removeAttribute('data-flow-dorrar')
    }
  }, [visaDorrar])

  const pct = Math.round((Math.min(step, totalSteps) / totalSteps) * 100)
  const showFooter = Boolean(primaryLabel && onPrimary)

  // Fotens verkliga höjd publiceras som --flow-footer-h. Cookie-bannern
  // (z-999, fixed i botten) lägger sig annars över Fortsätt-knappen i varje
  // ny session, och en gissad konstant slutar stämma så fort foten får en
  // blockeringsrad eller en sekundär handling.
  // Även den här före paint. Mätte vi efter, hann cookie-bannern ställa sig
  // på fallback-höjden 76 px och flytta sig när den riktiga höjden kom.
  const footerRef = useRef<HTMLElement | null>(null)
  useIsomorphicLayoutEffect(() => {
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

  const backButton = onBack ?? (utanTillbaka ? undefined : onExit)
  const backLabel = onBack ? 'Föregående steg' : exitLabel

  // Flödet döljer både dashboardheadern och bottennavet. Utan den här knappen
  // var enda vägen ut att backa steg för steg, och på sista steget fanns
  // ingen väg alls. X står alltid längst till höger i toppraden.
  const exit = () => {
    if (onExit) onExit()
    else lamnaFlodet(router)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-golv lg:left-[248px]"
      style={visaDorrar ? { bottom: 'var(--bottom-nav-h)' } : undefined}
    >
      {/* Topp: tillbaka, titel, räknare, tråden. */}
      <header className="flex-shrink-0 border-b border-kant bg-papper">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-1 px-2">
          {backButton ? (
            <button
              type="button"
              onClick={backButton}
              aria-label={backLabel}
              className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] text-ink-1 transition-colors hover:bg-papper-2"
            >
              <IkonTillbaka />
            </button>
          ) : (
            <span className="h-11 w-11 flex-shrink-0" aria-hidden="true" />
          )}

          <h1 className="min-w-0 flex-1 truncate font-display text-[15px] font-semibold tracking-[-0.01em] text-ink-1">
            {title}
          </h1>

          <span className="flex-shrink-0 text-sm tabular-nums text-ink-3">
            {Math.min(step, totalSteps)} / {totalSteps}
          </span>

          <button
            type="button"
            onClick={exit}
            aria-label="Stäng"
            className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] text-ink-2 transition-colors hover:bg-papper-2 hover:text-ink-1"
          >
            <IkonX />
          </button>
        </div>

        {/* Framsteget i flödet, 3 px koppar. */}
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-valuenow={Math.min(step, totalSteps)}
          aria-label={`Steg ${Math.min(step, totalSteps)} av ${totalSteps}`}
          className="h-[3px] w-full bg-papper-2"
        >
          <div
            className="h-full rounded-r-[2px] bg-koppar transition-[width] duration-[240ms] ease-out motion-reduce:transition-none"
            style={{ width: `${pct}%` }}
          />
        </div>
      </header>

      {/* Mitten: flödets enda scrollyta. */}
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className={`mx-auto w-full ${smal ? 'max-w-[560px] sm:pt-7' : 'max-w-3xl'} px-4 py-4`}>
          {banner ? <div className="mb-4">{banner}</div> : null}
          {children}
        </div>
      </main>

      {/* Fot: sticky i flex-kolumnen, aldrig fixed, så tangentbordet på iOS
          skjuter upp den i stället för att lägga sig över den. */}
      {showFooter ? (
        <footer
          ref={footerRef}
          className="flex-shrink-0 border-t border-kant bg-papper"
          style={{ paddingBottom: visaDorrar ? 0 : 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className={`mx-auto w-full ${smal ? 'max-w-[560px]' : 'max-w-3xl'} px-4 py-3`}>
            {primaryBlockedReason && primaryDisabled && !primaryBusy ? (
              <p className="mb-2 text-sm text-ink-2" aria-live="polite">
                {primaryBlockedReason}
              </p>
            ) : null}

            <div className={footerSecondarySameSize ? 'grid gap-2 sm:flex sm:gap-3' : undefined}>
              <button
                type="button"
                onClick={onPrimary}
                disabled={primaryDisabled || primaryBusy}
                className={`${KNAPP_PRIMAR} disabled:cursor-not-allowed sm:w-auto sm:min-w-[200px]`}
              >
                {primaryBusy ? busyLabel : primaryLabel}
              </button>
              {footerSecondarySameSize ? footerSecondary : null}
            </div>

            {footerSecondary && !footerSecondarySameSize ? <div className="mt-2">{footerSecondary}</div> : null}
          </div>
        </footer>
      ) : null}
    </div>
  )
}
