'use client'

/**
 * Förklaringen (plan-testflode-2026-11-20 avsnitt 5.1), Regelpanel
 * vidareutvecklad med färg efter utfall:
 *
 *   rätt       yta positiv-mjuk, bock 24 px i positiv, raden "Rätt"
 *   fel        yta fel-mjuk, kryss 24 px i fel, raden "Inte den här"
 *   vet inte   yta ton, raden "Förklaringen" i ton-ink, inget kryss och
 *              inget rött: att be om förklaringen är inte ett fel
 *   obesvarad  genomgången i testlägen, samma tysta ton som vet inte
 *
 * Under raden eyebrow "Förklaringen", regeln i 18/23 display och "Ditt
 * misstag" under, sist länken "Något ser fel ut". Glider in 120 ms efter
 * facit (sess-forklaring) och rullas fram så att nederkanten står 12 px
 * över foten. role="status" så att skärmläsaren läser utfallet.
 */

import { useEffect, useRef, type ReactNode } from 'react'
import { IkonCheck, IkonKryss } from '@/components/illustrations/RumSymboler'
import FragaRapport, { type FragaRapportProps } from '@/components/traning/FragaRapport'
import { SESSION } from './copy'

export type Utfall = 'ratt' | 'fel' | 'vet_inte' | 'obesvarad'

export interface ForklaringenProps {
  utfall: Utfall
  /** Sekunder på uppgiften och provets tid per uppgift, för raden till höger. */
  tid?: { sekunder: number; budget: number | null } | null
  regel: string | null
  /** Förklaringen som löptext där banken förklarar i stället för att ge en regel (ord och text, siffror och tabeller). */
  text?: string | null
  misstag?: string | null
  rapport?: FragaRapportProps
  /** Rulla fram panelen när den monteras (efter ett svar, inte i genomgången). */
  rullaFram?: boolean
  /** Typens egen förklaring under regeln (deduktivens lösningsgång och schema). */
  detalj?: ReactNode
}

const YTA: Record<Utfall, string> = {
  ratt: 'bg-positiv-mjuk',
  fel: 'bg-fel-mjuk',
  vet_inte: 'bg-ton',
  obesvarad: 'bg-ton',
}
const RAD: Record<Utfall, string> = {
  ratt: 'text-positiv',
  fel: 'text-fel',
  vet_inte: 'text-ton-ink',
  obesvarad: 'text-ton-ink',
}

const LUFT_OVER_FOTEN = 12

export default function Forklaringen({ utfall, tid, regel, text = null, misstag, rapport, rullaFram = false, detalj = null }: ForklaringenProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!rullaFram || !el) return
    const lugn = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    // Efter intoningens start (120 ms) och en bildruta, så att ramens egen
    // rullning till toppen vid ny uppgift redan har körts.
    const t = setTimeout(() => {
      const main = el.closest('main')
      if (!main) return
      const fot = main.parentElement?.querySelector('footer') ?? null
      const panel = el.getBoundingClientRect()
      const mainRect = main.getBoundingClientRect()
      const grans = Math.min(mainRect.bottom, fot ? fot.getBoundingClientRect().top : mainRect.bottom)
      // Panelen ritas 16 px nedanför sin plats när den börjar glida in.
      const delta = panel.bottom - 16 - (grans - LUFT_OVER_FOTEN)
      if (delta > 0 && typeof main.scrollBy === 'function') main.scrollBy({ top: delta, behavior: lugn ? 'auto' : 'smooth' })
    }, lugn ? 0 : 140)
    return () => clearTimeout(t)
  }, [rullaFram])

  const C = SESSION.forklaring
  const etikett = utfall === 'ratt' ? C.ratt : utfall === 'fel' ? C.fel : utfall === 'obesvarad' ? C.obesvarad : C.vetInte
  return (
    <>
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={`sess-forklaring rounded-xl px-4 py-3.5 ${YTA[utfall]}`}
        data-forklaringen={utfall}
      >
        <p className="flex items-center gap-2">
          {utfall === 'ratt' ? <IkonCheck size={24} strokeWidth={2.25} className="flex-shrink-0 text-positiv" /> : null}
          {utfall === 'fel' ? <IkonKryss size={24} strokeWidth={2.25} className="flex-shrink-0 text-fel" /> : null}
          <span className={`flex-1 text-[12px] font-semibold uppercase leading-4 tracking-[.06em] ${RAD[utfall]}`}>{etikett}</span>
          {tid ? <span className="text-[12px] leading-4 tabular-nums text-ink-3">{C.tid(tid.sekunder, tid.budget)}</span> : null}
        </p>
        {regel || text ? (
          <>
            {utfall !== 'vet_inte' && utfall !== 'obesvarad' ? (
              <p className="mt-2.5 text-[12px] font-semibold uppercase leading-4 tracking-[.06em] text-ink-3">{C.eyebrow}</p>
            ) : null}
            {regel ? (
              <p className="mt-1 font-sess-display text-lg font-bold leading-[23px] tracking-[-.01em] text-ink-1" data-regel>
                {regel}
              </p>
            ) : null}
            {text ? (
              <p className={`${regel ? 'mt-1.5' : 'mt-1'} text-sm leading-[21px] text-ink-1`} data-forklaring-text>
                {text}
              </p>
            ) : null}
          </>
        ) : null}
        {detalj ? (
          <>
            {!regel && !text && utfall !== 'vet_inte' && utfall !== 'obesvarad' ? <p className="mt-2.5 text-[12px] font-semibold uppercase leading-4 tracking-[.06em] text-ink-3">{C.eyebrow}</p> : null}
            <div className="mt-1.5" data-forklaring-detalj>
              {detalj}
            </div>
          </>
        ) : null}
        {misstag ? (
          <>
            <p className="mt-3 text-[12px] font-semibold uppercase leading-4 tracking-[.06em] text-ink-3">{C.misstag}</p>
            <p className="mt-1 text-sm leading-5 text-ink-2" data-misstag>
              {misstag}
            </p>
          </>
        ) : null}
      </div>
      {rapport ? <FragaRapport key={rapport.qId} {...rapport} /> : null}
    </>
  )
}
