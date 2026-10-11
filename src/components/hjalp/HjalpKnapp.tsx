'use client'

/**
 * i-knappen (skiss Provbladet, avsnitt 3 och 4): en per kort, i
 * eyebrow-raden, 28 px synlig och 44 px träffyta. Öppnar en popover med en
 * ruta ur hjalp-copy.ts: 320 px och högerställd på dator, full kortbredd på
 * mobil. Stängs med Esc, klick utanför och krysset, och fångar fokus.
 *
 *   <section className="relative ...">            // kortet måste vara relative
 *     <p className="ey">Logiktest <HjalpKnapp id="B1" etikett="Vad mäter logiktestet?" /></p>
 *     ...
 *   </section>
 *
 * Popovern positioneras mot närmaste förfader med position (kortet), 44 px
 * under dess överkant, med 16 px marginal. Döljs helt när användaren valt
 * "Dölj hjälpen" eller när rutan väntar på verifiering.
 */

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { IkonInfo, IkonX } from '@/components/illustrations/RumSymboler'
import { HJALP_UI, hjalpRuta, type HjalpId } from '@/lib/traning/hjalp-copy'
import { useHjalp } from './HjalpKontext'

export interface HjalpKnappProps {
  /** Rutan ur hjalp-copy.ts, till exempel 'B1'. */
  id: HjalpId
  /** Knappens tillgängliga namn. Standard: rutans rubrik. */
  etikett?: string
  /** Extra klasser på knappen. */
  className?: string
  /** Ersätter popoverns placering (standard: kortets bredd på mobil, 320 px höger på dator). */
  popoverClassName?: string
}

const PLACERING = 'absolute inset-x-4 top-11 z-30 lg:left-auto lg:right-4 lg:w-80'

export default function HjalpKnapp({ id, etikett, className, popoverClassName }: HjalpKnappProps) {
  const { dold } = useHjalp()
  const [oppen, setOppen] = useState(false)
  const knapp = useRef<HTMLButtonElement>(null)
  const ruta = useRef<HTMLSpanElement>(null)
  const stang = useRef<HTMLButtonElement>(null)
  const rubrikId = useId()
  const text = hjalpRuta(id)

  const stangOchAterga = useCallback(() => {
    setOppen(false)
    knapp.current?.focus()
  }, [])

  useEffect(() => {
    if (!oppen) return
    stang.current?.focus()
    const tangent = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        stangOchAterga()
        return
      }
      if (e.key === 'Tab' && ruta.current) {
        // Fokusfällan: Tab stannar i popovern.
        const fokuserbara = Array.from(
          ruta.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
        )
        if (fokuserbara.length === 0) return
        const forsta = fokuserbara[0]
        const sista = fokuserbara[fokuserbara.length - 1]
        const aktiv = document.activeElement
        if (e.shiftKey && (aktiv === forsta || !ruta.current.contains(aktiv))) {
          e.preventDefault()
          sista.focus()
        } else if (!e.shiftKey && (aktiv === sista || !ruta.current.contains(aktiv))) {
          e.preventDefault()
          forsta.focus()
        }
      }
    }
    const utanfor = (e: PointerEvent) => {
      const t = e.target as Node | null
      if (!t) return
      if (ruta.current?.contains(t) || knapp.current?.contains(t)) return
      setOppen(false)
    }
    document.addEventListener('keydown', tangent)
    document.addEventListener('pointerdown', utanfor)
    return () => {
      document.removeEventListener('keydown', tangent)
      document.removeEventListener('pointerdown', utanfor)
    }
  }, [oppen, stangOchAterga])

  if (dold || !text) return null

  return (
    <>
      <button
        ref={knapp}
        type="button"
        aria-label={etikett ?? text.rubrik}
        aria-expanded={oppen}
        aria-haspopup="dialog"
        onClick={() => setOppen((o) => !o)}
        className={`relative -my-1.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg align-middle text-ink-3 hover:text-ink-1 after:absolute after:-inset-2 after:content-[''] ${className ?? ''}`}
      >
        <IkonInfo size={18} />
      </button>
      {oppen ? (
        <span
          ref={ruta}
          role="dialog"
          aria-modal="false"
          aria-labelledby={rubrikId}
          className={`${popoverClassName ?? PLACERING} block rounded-xl border border-kant-stark bg-papper px-3.5 py-3 pr-11 text-left text-meta font-normal normal-case tracking-normal text-ink-2 shadow-lyft`}
        >
          <button
            ref={stang}
            type="button"
            aria-label={HJALP_UI.stang}
            onClick={stangOchAterga}
            className="absolute right-1.5 top-1.5 inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 hover:text-ink-1 after:absolute after:-inset-1.5 after:content-['']"
          >
            <IkonX size={20} />
          </button>
          <b id={rubrikId} className="mb-1 block text-sm font-semibold text-ink-1">
            {text.rubrik}
          </b>
          <span className="block leading-[19px]">{text.text}</span>
        </span>
      ) : null}
    </>
  )
}
