'use client'

/**
 * Det publika flödesskalet för /register och /login
 * (docs/design/profil-registrering-2026-09-24.html, Del B steg 1 och 2).
 *
 * Publikt omgång 3 (skisserna registrering och inloggning): mörk topprad
 * utan meny med loggan och Logga in (eller tillbaka-pil och "Skapa konto"),
 * tråden som framstegslinje, väggen i sidans färg och, i det smala läget,
 * innehållet i kontokortet. Formen står i registrering.css.
 *
 * Samma tangentbordsregler som FlowShell: skalet är en flexkolumn i 100dvh
 * där mitten scrollar och foten är sticky, aldrig fixed, så att
 * tangentbordet på Android och iOS skjuter upp foten i stället för att
 * lägga sig över den.
 */

import Link from 'next/link'
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { Ikon } from '@/components/publikt/v3/Ikon'
import { InloggadVaxel } from '@/components/publikt/v3/Inloggad'
import { SKAL } from './registrering-copy'
import './registrering.css'

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export interface PubliktFlodesskalProps {
  /** Utelämnas i smakprovsläget och på inloggningen: linjen är då full. */
  steg?: { nu: number; av: number }
  /** Trådens längd i procent när den inte följer steg (provet: 20 per fråga). */
  framsteg?: number
  /** Ger tillbaka-pil och rubriken "Skapa konto" i stället för loggan. */
  onBack?: () => void
  /**
   * Knappen i den klistrade foten. Utelämnas den har skalet ingen fot
   * (skissen 2026-11-09, provet och kontosteget): knappen står i formuläret
   * och samtycket ligger under den scrollande mitten i stället för över den.
   */
  primar?: {
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
  /** full: innehållet sätter egen bredd (kontot med panelen). smal: innehållet i kontokortet. */
  bredd?: 'smal' | 'full'
  children: ReactNode
}

/** Textlänken i flödet (Hoppa över, Ändra). Formen står i registrering.css. */
const TEXTLANK = 'rg-lank'

export default function PubliktFlodesskal({
  steg,
  framsteg,
  onBack,
  primar,
  sekundar,
  fotnot,
  toppLank = { href: '/login', text: SKAL.loggaIn, forklaring: SKAL.harKonto },
  bredd = 'smal',
  children,
}: PubliktFlodesskalProps) {
  const pct =
    typeof framsteg === 'number'
      ? Math.max(0, Math.min(100, Math.round(framsteg)))
      : steg
        ? Math.round((Math.min(steg.nu, steg.av) / steg.av) * 100)
        : 100
  const medFot = Boolean(primar)

  // Cookie-bannern ligger fast i botten. Fotens höjd publiceras som i
  // FlowShell så att bannern ställer sig ovanför knappen. Utan fot
  // behövs ingen mätning: globals.css krymper skalet med samtyckets höjd så
  // att samtycket står under mitten (data-publikt-flode="utan-fot").
  const fotRef = useRef<HTMLElement | null>(null)
  useIsoLayoutEffect(() => {
    if (!medFot) return
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
  }, [medFot])

  const blockerad = primar?.blockedReason && primar.disabled && !primar.busy

  return (
    <div
      className={medFot ? 'rg-skal rg-hel' : 'pub-flode-skal rg-skal'}
      data-publikt-flode={!medFot ? 'utan-fot' : blockerad ? 'blockerad' : 'fri'}
    >
      <header className="rg-topp">
        <div className="p3-bredd rg-topp-rad">
          {onBack ? (
            <>
              <button type="button" onClick={onBack} aria-label={SKAL.tillbaka} className="rg-topp-tillbaka">
                <Ikon namn="tillbaka" />
              </button>
              <p className="rg-topp-namn">{SKAL.skapaKonto}</p>
              {steg ? (
                <span className="rg-topp-steg">
                  {steg.nu} / {steg.av}
                </span>
              ) : null}
            </>
          ) : (
            <>
              <Link href="/" aria-label={SKAL.hem} className="rg-logga">
                <i aria-hidden="true">J</i>
                {/* Ordet i ett eget element, som i menyn: annars blir "Jobbcoach" och ".ai" två flexdelar med mellanrum emellan. */}
                <b>
                  Jobbcoach<span>.ai</span>
                </b>
              </Link>
              {/* Inloggad: vägen till kontot i samma ruta (Inloggad.tsx, CLS 0). */}
              <InloggadVaxel
                className="p3-vaxel-topp"
                kontoKlass="rg-topp-lank"
                ut={
                  <>
                    {toppLank.forklaring ? <span className="rg-topp-fraga">{toppLank.forklaring}</span> : null}
                    <Link href={toppLank.href} onClick={toppLank.onClick} className="rg-topp-lank">
                      {toppLank.text}
                    </Link>
                  </>
                }
              />
            </>
          )}
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label={steg ? `Steg ${steg.nu} av ${steg.av}` : undefined}
          className={`rg-trad ${steg || typeof framsteg === 'number' ? '' : 'rg-trad-tom'}`.trim()}
        >
          <div style={{ width: `${pct}%` }} />
        </div>
      </header>

      <main className="rg-mitt">
        <div className="p3-vagg rg-vagg">
          {bredd === 'full' ? (
            children
          ) : (
            <div className="rg-smal">
              <div className="rg-kort">{children}</div>
            </div>
          )}
        </div>
      </main>

      {primar ? (
        <footer ref={fotRef} className="rg-fot">
          <div className="rg-fot-inne">
            {blockerad ? (
              <p className="rg-sparr" aria-live="polite">
                {primar.blockedReason}
              </p>
            ) : null}
            <div className="rg-fot-rad">
              <button
                type={primar.formId ? 'submit' : 'button'}
                form={primar.formId}
                onClick={primar.formId ? undefined : primar.onClick}
                disabled={primar.disabled || primar.busy}
                aria-disabled={primar.disabled || primar.busy || undefined}
                className="p3-knapp"
              >
                {primar.busy ? (primar.busyText ?? primar.text) : primar.text}
              </button>
              {sekundar}
              {fotnot && !sekundar ? <p className="rg-fotnot">{fotnot}</p> : null}
            </div>
          </div>
        </footer>
      ) : null}
    </div>
  )
}

export { TEXTLANK }
