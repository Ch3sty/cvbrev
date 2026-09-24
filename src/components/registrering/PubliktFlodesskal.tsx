'use client'

/**
 * Det publika flödesskalet för /register och /login
 * (docs/design/profil-registrering-2026-09-24.html, Del B steg 1 och 2).
 *
 * Topprad 56 px med loggan och Logga in (eller tillbaka-pil och "Skapa
 * konto"), tråden som 2 px framstegslinje, innehåll max 560 px och en
 * klistrad fot. Samma tangentbordsregler som FlowShell: skalet är en
 * flexkolumn i 100dvh där mitten scrollar och foten är sticky, aldrig fixed,
 * så att tangentbordet på Android och iOS skjuter upp foten i stället för
 * att lägga sig över den.
 */

import Link from 'next/link'
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { SKAL } from './registrering-copy'

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export interface PubliktFlodesskalProps {
  /** Utelämnas i smakprovsläget och på inloggningen: linjen är då full. */
  steg?: { nu: number; av: number }
  /** Ger tillbaka-pil och rubriken "Skapa konto" i stället för loggan. */
  onBack?: () => void
  primar: {
    text: string
    onClick?: () => void
    /** Knappen skickar formuläret med det här id:t (Enter i sista fältet gör samma sak). */
    formId?: string
    disabled?: boolean
    busy?: boolean
    busyText?: string
    blockedReason?: string
  }
  /** Sekundär knapp i samma storlek som primären (steg 3 har en, steg 1 och 2 inte). */
  sekundar?: ReactNode
  fotnot?: ReactNode
  /** Länken till höger i toppraden. Standard är Logga in. */
  toppLank?: { href: string; text: string; forklaring?: string; onClick?: () => void }
  children: ReactNode
}

const TEXTLANK =
  'text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1'

export default function PubliktFlodesskal({
  steg,
  onBack,
  primar,
  sekundar,
  fotnot,
  toppLank = { href: '/login', text: SKAL.loggaIn, forklaring: SKAL.harKonto },
  children,
}: PubliktFlodesskalProps) {
  const pct = steg ? Math.round((Math.min(steg.nu, steg.av) / steg.av) * 100) : 100

  // Cookie-bannern ligger fast i botten. Fotens höjd publiceras som i
  // FlowShell så att bannern ställer sig ovanför Skapa konto.
  const fotRef = useRef<HTMLElement | null>(null)
  useIsoLayoutEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-flow-active', 'true')
    const el = fotRef.current
    const mat = () => {
      if (el) root.style.setProperty('--flow-footer-h', `${Math.round(el.getBoundingClientRect().height)}px`)
    }
    mat()
    const ro = el ? new ResizeObserver(mat) : null
    if (el && ro) ro.observe(el)
    return () => {
      ro?.disconnect()
      root.removeAttribute('data-flow-active')
      root.style.removeProperty('--flow-footer-h')
    }
  }, [])

  const blockerad = primar.blockedReason && primar.disabled && !primar.busy

  return (
    <div className="flex h-[100dvh] flex-col bg-mark" data-publikt-flode={blockerad ? 'blockerad' : 'fri'}>
      <header className="flex-shrink-0 border-b border-kant bg-panel">
        <div className="flex h-14 items-center gap-1 px-2 sm:px-6 lg:px-12">
          {onBack ? (
            <>
              <button
                type="button"
                onClick={onBack}
                aria-label={SKAL.tillbaka}
                className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-ink-1 transition-colors hover:bg-insunken sm:-ml-3"
              >
                <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
              </button>
              <p className="min-w-0 flex-1 truncate text-base font-semibold tracking-[-0.01em] text-ink-1">
                {SKAL.skapaKonto}
              </p>
              {steg ? (
                <span className="flex-shrink-0 px-1 text-sm tabular-nums text-ink-3">
                  {steg.nu} / {steg.av}
                </span>
              ) : null}
            </>
          ) : (
            <>
              <Link
                href="/"
                aria-label={SKAL.hem}
                className="flex min-h-11 flex-1 items-center gap-2 px-2 sm:px-0"
              >
                <span
                  aria-hidden="true"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-[7px] bg-accent font-display text-base font-extrabold text-white"
                >
                  J
                </span>
                <span className="font-display text-lg font-extrabold tracking-[-0.02em] text-ink-1">
                  Jobbcoach<span className="font-bold">.ai</span>
                </span>
              </Link>
              <span className="flex-shrink-0 pr-2 text-sm text-ink-2 sm:pr-0">
                {toppLank.forklaring ? (
                  <span className="hidden sm:inline">{toppLank.forklaring} </span>
                ) : null}
                <Link
                  href={toppLank.href}
                  onClick={toppLank.onClick}
                  className={`${TEXTLANK} inline-flex min-h-11 items-center`}
                >
                  {toppLank.text}
                </Link>
              </span>
            </>
          )}
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label={steg ? `Steg ${steg.nu} av ${steg.av}` : undefined}
          className="h-0.5 w-full bg-kant"
        >
          <div
            className="h-full bg-accent transition-[width] duration-[240ms] ease-out motion-reduce:transition-none"
            style={{ width: `${pct}%` }}
          />
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-[560px] px-4 pb-6 pt-4 sm:pt-8">{children}</div>
      </main>

      <footer
        ref={fotRef}
        className="flex-shrink-0 border-t border-kant bg-panel shadow-[0_-8px_24px_rgba(28,25,23,0.08)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="mx-auto w-full max-w-[560px] px-4 pb-4 pt-3">
          {blockerad ? (
            <p className="mb-2 text-sm text-ink-2" aria-live="polite">
              {primar.blockedReason}
            </p>
          ) : null}
          <div
            className={
              sekundar
                ? 'grid gap-2 sm:flex sm:gap-3'
                : 'sm:flex sm:items-center sm:gap-4'
            }
          >
            <button
              type={primar.formId ? 'submit' : 'button'}
              form={primar.formId}
              onClick={primar.formId ? undefined : primar.onClick}
              disabled={primar.disabled || primar.busy}
              aria-disabled={primar.disabled || primar.busy || undefined}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[200px] sm:shrink-0"
            >
              {primar.busy ? (primar.busyText ?? primar.text) : primar.text}
            </button>
            {sekundar}
            {fotnot && !sekundar ? (
              <p className="mt-2 text-center text-meta text-ink-3 sm:mt-0 sm:text-left">{fotnot}</p>
            ) : null}
          </div>
        </div>
      </footer>
    </div>
  )
}

export { TEXTLANK }
