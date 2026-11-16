'use client'

/**
 * Helskärmen är läsläget (skissen yta 3, ägarens punkt 1): ingen granne,
 * sidorna staplade med 12 px glipa och sidnummer, nyp för att zooma (eller
 * zoomknappen), remsan nederst byter mall. Topprad 56 px, arket med 12 px
 * marginal. En egen iframe med samma källa; srcdoc laddas utan nätet och
 * exempel-API:t ur cachen.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IkonStang, IkonZoom } from '@/components/illustrations/MallIkoner'
import { A4_KVOT } from './matning'
import { DOK } from './texter'

interface HelskarmProps {
  html?: string
  src?: string
  titel: string
  rubrik: string
  /** Dokumentets höjd i bredder (ur mätningen). */
  hojd?: number
  sidor: number
  remsa?: ReactNode
  onClose: () => void
}

export default function Helskarm({ html, src, titel, rubrik, hojd, sidor, remsa, onClose }: HelskarmProps) {
  const [zoom, setZoom] = useState(1)
  const [bredd, setBredd] = useState(0)
  const ytaRef = useRef<HTMLDivElement>(null)

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
  const sidHojd = arkBredd * A4_KVOT
  const antal = Math.max(1, sidor)
  const totalHojd = Math.max(sidHojd, (hojd ?? A4_KVOT) * arkBredd)

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

      <div ref={ytaRef} className="min-h-0 flex-1 overflow-auto overscroll-contain" style={{ touchAction: 'pan-x pan-y pinch-zoom' }}>
        {arkBredd > 0 ? (
          <div className="mx-auto py-3" style={{ width: arkBredd }}>
            {/* Sidorna: samma dokument, klippt per sida, staplade med glipa. */}
            {Array.from({ length: antal }, (_, i) => (
              <div key={i} className="mb-3">
                <div
                  className="relative overflow-hidden rounded-[4px] bg-white shadow-[0_1px_0_rgba(0,0,0,.08),0_10px_24px_-14px_rgba(0,0,0,.45)]"
                  style={{ height: sidHojd }}
                >
                  <iframe
                    srcDoc={html}
                    src={html ? undefined : src}
                    title={`${titel}, ${DOK.sidaAv(i + 1, antal)}`}
                    scrolling="no"
                    tabIndex={-1}
                    className="pointer-events-none absolute left-0 block w-full border-0 bg-white"
                    style={{ top: -i * sidHojd, height: totalHojd }}
                  />
                </div>
                <p className="mt-1 text-center text-meta text-ink-3">{DOK.sidaAv(i + 1, antal)}</p>
              </div>
            ))}
          </div>
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
