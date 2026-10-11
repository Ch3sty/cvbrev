'use client'

/**
 * Regeln och misstaget efter svaret (spec-rummen 4.4, konceptets .regel i
 * P2 och P3, testansvarigs beslut 15.7).
 *
 * Rummets ton, radie 14. Överst raden "Inte den här · 52 s" eller
 * "Rätt · 29 s" som eyebrow i ton-ink, sedan regeln ur bankens rule (18/23,
 * bläck; i mörkt läge ton-ink), sedan misstaget för det valda alternativet
 * ur bankens misstag som en egen mening. Saknas misstaget visas bara
 * regeln. `rad2` är raden om sträckuppgiften och tiden (testansvarig 19.2
 * fråga 1), en egen mening efter misstaget. Ingen regeltext skrivs här.
 *
 * role="status" och aria-live så att skärmläsaren läser upp utfallet.
 *
 * `visaVidSvar` (art-director 20.3 punkt 3): när panelen monteras efter ett
 * svar rullas passets main så att panelens nederkant står 12 px ovanför
 * foten, 300 ms ease-out via smooth, prefers-reduced-motion hoppar. Matrisen
 * krymper aldrig; den med rätt svar ifyllt är en del av regeln.
 */

import { useEffect, useRef } from 'react'
import { PASS_COPY } from '@/lib/traning/pass-copy'
import FragaRapport, { type FragaRapportProps } from './FragaRapport'

const REGELPANEL = PASS_COPY.regelpanel

export interface RegelpanelProps {
  /** "Inte den här · 52 s" */
  rad: string
  regel: string
  misstag?: string | null
  /** "Sträckuppgift över din nivå, klarad inom provets tid." */
  rad2?: string | null
  visaVidSvar?: boolean
  /**
   * Rapportknappen "Något ser fel ut" (tillagg-variation 3.2) under panelen,
   * i passet och i genomgången. Aldrig under ett pågående övningsprov.
   */
  rapport?: FragaRapportProps
}

/** Avståndet mellan panelens nederkant och foten efter rullningen. */
const LUFT_OVER_FOTEN = 12

export default function Regelpanel({ rad, regel, misstag, rad2, visaVidSvar, rapport }: RegelpanelProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!visaVidSvar || !el) return
    const rulla = () => {
      const main = el.closest('main')
      if (!main) return
      const lugn = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      const fot = main.parentElement?.querySelector('footer') ?? null
      const panel = el.getBoundingClientRect()
      const mainRect = main.getBoundingClientRect()
      // Fotens överkant, eller mains nederkant om foten saknas (de ligger kant i kant).
      const grans = Math.min(mainRect.bottom, fot ? fot.getBoundingClientRect().top : mainRect.bottom)
      const delta = panel.bottom - (grans - LUFT_OVER_FOTEN)
      if (delta > 0 && typeof main.scrollBy === 'function') main.scrollBy({ top: delta, behavior: lugn ? 'auto' : 'smooth' })
    }
    // En bildruta senare: skalets egen effekt (rulla till toppen vid ny
    // fråga) körs efter barnets, och foten mäts först efter layout.
    if (typeof requestAnimationFrame !== 'function') return rulla()
    const id = requestAnimationFrame(rulla)
    return () => cancelAnimationFrame(id)
  }, [visaVidSvar])

  // Testerna v2 (skiss 4): två rubriker i versaler, "Regeln" och "Ditt
  // misstag", med bankens rule och misstag ordagrant under. Utfallet och
  // tiden står till höger om den första rubriken.
  return (
    <>
    <div ref={ref} role="status" aria-live="polite" className="regelpanel rounded-[14px] bg-ton px-4 py-3.5 text-ton-ink" data-regelpanel>
      <p className="flex items-baseline justify-between gap-3">
        <span className="text-ey uppercase text-ton-ink">{REGELPANEL.regeln}</span>
        <span className="text-[12px] leading-4 text-ink-3">{rad}</span>
      </p>
      <p className="regelpanel-regel mt-1 font-display text-lg font-bold leading-[23px] tracking-[-.01em]" data-regel>
        {regel}
      </p>
      {misstag ? (
        <>
          <p className="mt-3 text-ey uppercase text-ink-3">{REGELPANEL.misstag}</p>
          <p className="mt-1 text-sm leading-5 text-ink-1" data-misstag>
            {misstag}
          </p>
        </>
      ) : null}
      {rad2 ? <p className="mt-1.5 text-sm leading-5 text-ink-2">{rad2}</p> : null}
    </div>
    {rapport ? <FragaRapport key={rapport.qId} {...rapport} /> : null}
    </>
  )
}
