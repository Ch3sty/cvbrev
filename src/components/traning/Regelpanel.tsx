'use client'

/**
 * Regeln och misstaget efter svaret (spec-rummen 4.4, konceptets .regel i
 * P2 och P3, testansvarigs beslut 15.7).
 *
 * Rummets ton, radie 14. Överst raden "Inte den här · 52 s" eller
 * "Rätt · 29 s" som eyebrow i ton-ink, sedan regeln ur bankens rule (18/23,
 * bläck; i mörkt läge ton-ink), sedan misstaget för det valda alternativet
 * ur bankens misstag som en egen mening. Saknas misstaget visas bara
 * regeln. Ingen regeltext skrivs här.
 *
 * role="status" och aria-live så att skärmläsaren läser upp utfallet.
 * `visaVidSvar`: panelen rullas in i bild när den dyker upp efter ett svar,
 * eftersom den på en Pixel 7 med adressfältet framme annars hamnar under
 * alternativen (utan rörelse när prefers-reduced-motion är satt).
 */

import { useEffect, useRef } from 'react'

export interface RegelpanelProps {
  /** "Inte den här · 52 s" */
  rad: string
  regel: string
  misstag?: string | null
  visaVidSvar?: boolean
}

export default function Regelpanel({ rad, regel, misstag, visaVidSvar }: RegelpanelProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!visaVidSvar || !ref.current) return
    const lugn = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ref.current.scrollIntoView({ block: 'nearest', behavior: lugn ? 'auto' : 'smooth' })
  }, [visaVidSvar])

  return (
    <div ref={ref} role="status" aria-live="polite" className="regelpanel scroll-mb-4 rounded-[14px] bg-ton px-4 py-3.5 text-ton-ink">
      <p className="text-ey uppercase text-ton-ink">{rad}</p>
      <p className="regelpanel-regel mt-1 font-display text-lg font-bold leading-[23px] tracking-[-.01em]">{regel}</p>
      {misstag ? <p className="mt-1.5 text-sm leading-5 text-ink-2">{misstag}</p> : null}
    </div>
  )
}
