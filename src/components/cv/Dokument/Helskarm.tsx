'use client'

/**
 * Helskärmen är läsläget (skissen yta 3, V4b, ägarens punkt 1): ingen granne,
 * sidorna som egna A4-ark staplade med 12 px glipa och sidnummer, nyp för att
 * zooma (eller zoomknappen), remsan nederst byter mall. Topprad 56 px, arket
 * med 12 px marginal.
 *
 * Sidorna är den riktiga PDF:en (src/lib/cv/mallar/sidbilder.ts): samma kedja
 * som nedladdningen ritar filen och varje sida kommer tillbaka som bild, så
 * att sida 1 slutar exakt där den gör i filen, också i tvåspaltiga mallar där
 * spalterna bryts var för sig. Ingen egen uppskattning i webbläsaren.
 *
 * Medan sidorna hämtas (några sekunder första gången, sedan ur fliken) visas
 * hela CV:t i ett stycke ur förhandsvisningens iframe, utan brytlinjer, och
 * en rad säger att sidorna läggs upp. Går hämtningen inte visas stycket kvar
 * med en rad om det.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IkonStang, IkonZoom } from '@/components/illustrations/MallIkoner'
import { A4_KVOT } from './matning'
import { DOK } from './texter'
import { useSidbilder, type Kalla } from './hooks'

interface HelskarmProps {
  html?: string
  src?: string
  titel: string
  rubrik: string
  /** Dokumentets höjd i bredder (ur mätningen), för stycket medan sidorna hämtas. */
  hojd?: number
  /** Källan för sidorna ur PDF:en. Utan källa visas bara stycket. */
  kalla?: Kalla | null
  remsa?: ReactNode
  onClose: () => void
}

const ARK = 'relative overflow-hidden rounded-[4px] bg-white shadow-[0_1px_0_rgba(0,0,0,.08),0_10px_24px_-14px_rgba(0,0,0,.45)]'

export default function Helskarm({ html, src, titel, rubrik, hojd, kalla, remsa, onClose }: HelskarmProps) {
  const [zoom, setZoom] = useState(1)
  const [bredd, setBredd] = useState(0)
  const ytaRef = useRef<HTMLDivElement>(null)
  const { sidbilder, laddar, fel } = useSidbilder(kalla, true)

  useEffect(() => {
    const tangent = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', tangent)
    const forra = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', tangent)
      document.body.style.overflow = forra
    }
  }, [onClose])

  useEffect(() => {
    const el = ytaRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setBredd(Math.min(794, e.contentRect.width - 24)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const arkBredd = Math.max(0, bredd * zoom)
  const stycketsHojd = Math.max(A4_KVOT, hojd ?? A4_KVOT) * arkBredd

  if (typeof document === 'undefined') return null

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={rubrik} className="fixed inset-0 z-[80] flex flex-col bg-golv">
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-kant bg-papper px-1.5">
        <button
          type="button"
          onClick={onClose}
          aria-label={DOK.stang}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-ink-1 hover:bg-papper-2"
        >
          <IkonStang size={20} />
        </button>
        <p className="min-w-0 truncate text-[15px] font-semibold text-ink-1">{rubrik}</p>
        <button
          type="button"
          onClick={() => setZoom((z) => (z === 1 ? 1.8 : 1))}
          aria-label={DOK.zooma}
          aria-pressed={zoom > 1}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-ink-1 hover:bg-papper-2"
        >
          <IkonZoom size={20} />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col">
      <div ref={ytaRef} className="min-h-0 flex-1 overflow-auto overscroll-contain" style={{ touchAction: 'pan-x pan-y pinch-zoom' }}>
        {arkBredd > 0 ? (
          <div className="mx-auto py-3" style={{ width: arkBredd }}>
            {sidbilder ? (
              // Sidorna ur PDF:en, ett ark per sida med glipa och sidnummer.
              <ol aria-label={DOK.sidor(sidbilder.sidor)} className="grid gap-3" data-sidor={sidbilder.sidor}>
                {sidbilder.bilder.map((bild, i) => (
                  <li key={i} className="grid gap-1.5">
                    <div className={ARK} style={{ height: arkBredd * sidbilder.kvot }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={bild}
                        alt={`${titel}, ${DOK.sidaAv(i + 1, sidbilder.sidor).toLowerCase()}`}
                        data-sida={i + 1}
                        draggable={false}
                        className="absolute inset-0 block h-full w-full select-none"
                      />
                    </div>
                    <p className="text-center text-meta text-ink-3">{DOK.sidaAv(i + 1, sidbilder.sidor)}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <div>
                {/* Hela CV:t i ett stycke ur förhandsvisningen, utan brytlinjer:
                    var sidorna bryts vet bara PDF:en. Tonat till 80 % (UX:
                    brödtexten håller AA också på mörkt golv). */}
                <div className={`${ARK} ${laddar ? 'opacity-80' : ''}`} style={{ height: stycketsHojd }} data-stycke>
                  <iframe
                    srcDoc={html}
                    src={html ? undefined : src}
                    title={titel}
                    scrolling="no"
                    tabIndex={-1}
                    className="pointer-events-none absolute inset-0 block h-full w-full border-0 bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
      {/* Brickan som snackbar nederst i bläddringsytan (UX 2026-11-16): utanför
          flödet, så arket står still när sidorna kommer (CLS 0), och aldrig
          över namnet. Syskon till ytan, så den följer inte med skrollen. */}
      {!sidbilder && (laddar || fel) ? (
        <p
          role="status"
          className="pointer-events-none absolute bottom-3 left-1/2 flex max-w-[calc(100%-24px)] -translate-x-1/2 items-center gap-2 rounded-[14px] border border-kant bg-papper px-3 py-1.5 text-center text-meta text-ink-2 shadow-[0_1px_0_rgba(0,0,0,.08),0_6px_16px_-8px_rgba(0,0,0,.35)]"
          style={{ width: 'max-content' }}
        >
          {laddar ? <span aria-hidden className="h-3 w-3 shrink-0 animate-spin rounded-full border-[1.5px] border-kant-stark border-t-ink-1 motion-reduce:animate-none" /> : null}
          {laddar ? DOK.sidorLaddar : DOK.sidorFel}
        </p>
      ) : null}
      </div>

      {remsa ? (
        <div className="shrink-0 border-t border-kant bg-papper px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2">
          {remsa}
          <p className="mt-1 text-center text-meta text-ink-3">{DOK.nypZoom}</p>
        </div>
      ) : null}
    </div>,
    document.body
  )
}
