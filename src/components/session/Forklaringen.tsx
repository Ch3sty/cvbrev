'use client'

/**
 * Förklaringen som kort (omgång 2 steg A, skissens facit-vyer), samma i
 * Träna, genomgången och Uppgiftslistans utfällda rad:
 *
 *   rubrikrad  utfallets mjuka yta: märket 28 px, utfallet i display 16/20
 *              ("Rätt", "Inte den här", "Förklaringen", "Obesvarad") och
 *              tiden till höger i ink-3 ("31 s, provets tid 60 s")
 *   kropp      papper: eyebrow "Förklaringen", regeln i display 18/23,
 *              löptexten, typens innehåll (platsen `innehall`), och under en
 *              hårlinje "Ditt misstag" med misstaget
 *   fotrad     "Något ser fel ut" i 12 px ink-3, nere till höger
 *
 *   rätt       rubrikraden positiv-mjuk, bocken
 *   fel        rubrikraden fel-mjuk, krysset
 *   vet inte   rubrikraden ton, strecket: att be om förklaringen är inte ett fel
 *   obesvarad  genomgången i testlägen, samma tysta ton som vet inte
 *
 * Typens innehåll: `innehall` (eller det äldre namnet `detalj`) är platsen
 * där typen lägger det som bara den kan rita, till exempel deduktivens
 * lösningsgång, ordförrådets ordboksartikel eller diagrammets markering.
 * Lägena fyller den med `forklaringInnehall(ritare, post)` ur typ.ts, som
 * använder TypRitare.Forklaring när typen har en och annars RamFacit.detalj.
 *
 * Kortet glider in 120 ms efter facit (sess-forklaring) och rullas fram så
 * att nederkanten står 12 px över foten. role="status" så att skärmläsaren
 * läser utfallet. Med `matning` skjuts forklaring_tid en gång när kortet
 * försvinner eller sidan lämnas: tiden det stod framme (saas-leads prio 1).
 */

import { useEffect, useRef, type ReactNode } from 'react'
import FragaRapport, { type FragaRapportProps } from '@/components/traning/FragaRapport'
import Marke from './Marke'
import { SESSION } from './copy'
import { sessionHandelser, type SessionHandelseBas } from './handelser'

export type Utfall = 'ratt' | 'fel' | 'vet_inte' | 'obesvarad'

export interface ForklaringMatning {
  bas: SessionHandelseBas
  sessionId: string | null
  /** Uppgiftens index i sessionen, nollbaserat. */
  index: number
  plats: 'svar' | 'genomgang' | 'lista'
}

export interface ForklaringenProps {
  utfall: Utfall
  /** Sekunder på uppgiften och provets tid per uppgift, för raden till höger. */
  tid?: { sekunder: number; budget: number | null } | null
  regel: string | null
  /** Förklaringen som löptext där banken förklarar i stället för att ge en regel (ord och text, siffror och tabeller). */
  text?: string | null
  misstag?: string | null
  rapport?: FragaRapportProps
  /** Rulla fram kortet när det monteras (efter ett svar, inte i genomgången). */
  rullaFram?: boolean
  /** Typens innehåll i kroppen, under regeln och löptexten (steg B fyller den per typ). */
  innehall?: ReactNode
  /** Äldre namn på `innehall` (RamFacit.detalj, etapp 3). */
  detalj?: ReactNode
  /** Mäter tiden kortet stod framme (forklaring_tid). Utelämnad: ingen mätning. */
  matning?: ForklaringMatning | null
}

const RUBRIKRAD: Record<Utfall, string> = {
  ratt: 'bg-positiv-mjuk border-b-[color:color-mix(in_srgb,var(--positiv)_22%,var(--positiv-mjuk))]',
  fel: 'bg-fel-mjuk border-b-fel-kant',
  vet_inte: 'bg-ton border-b-[color:color-mix(in_srgb,var(--ton-ink)_14%,var(--ton))]',
  obesvarad: 'bg-ton border-b-[color:color-mix(in_srgb,var(--ton-ink)_14%,var(--ton))]',
}

const EYEBROW = 'text-[11px] font-semibold uppercase leading-4 tracking-[.08em] text-ink-3'
const LUFT_OVER_FOTEN = 12

/** Tiden kortet stod framme, en gång per visning. */
function useForklaringTid(matning: ForklaringMatning | null | undefined, utfall: Utfall) {
  const ref = useRef(matning)
  ref.current = matning
  useEffect(() => {
    if (!ref.current) return
    const start = typeof performance !== 'undefined' ? performance.now() : Date.now()
    let skjuten = false
    const skjut = () => {
      const m = ref.current
      if (skjuten || !m) return
      skjuten = true
      const nu = typeof performance !== 'undefined' ? performance.now() : Date.now()
      sessionHandelser.forklaringTid(m.bas, { session_id: m.sessionId, index: m.index, utfall, tid_ms: Math.round(nu - start), plats: m.plats })
    }
    window.addEventListener('pagehide', skjut)
    return () => {
      window.removeEventListener('pagehide', skjut)
      skjut()
    }
    // En visning per uppgift och utfall; matningen läses via ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utfall, matning?.index, matning?.plats])
}

export default function Forklaringen({ utfall, tid, regel, text = null, misstag, rapport, rullaFram = false, innehall = null, detalj = null, matning = null }: ForklaringenProps) {
  const ref = useRef<HTMLElement | null>(null)
  useForklaringTid(matning, utfall)

  useEffect(() => {
    const el = ref.current
    if (!rullaFram || !el) return
    const lugn = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    // Efter intoningens start (120 ms) och en bildruta, så att ramens egen
    // rullning till toppen vid ny uppgift redan har körts.
    const t = setTimeout(() => {
      const main = el.closest('main')
      if (!main) return
      // Foten står i main (sticky nedtill) sedan omgång 2; äldre ramar hade den efter.
      const fot = main.querySelector<HTMLElement>('[data-ram-fot]') ?? main.parentElement?.querySelector('footer') ?? null
      const panel = el.getBoundingClientRect()
      const mainRect = main.getBoundingClientRect()
      const fotRect = fot?.getBoundingClientRect() ?? null
      // Foten räknas bara när den står fast nedtill (inte i flödet under kortet).
      const fotTopp = fotRect && fotRect.top > panel.top ? fotRect.top : mainRect.bottom
      const grans = Math.min(mainRect.bottom, fotTopp)
      // Kortet ritas 16 px nedanför sin plats när det börjar glida in.
      const delta = panel.bottom - 16 - (grans - LUFT_OVER_FOTEN)
      if (delta > 0 && typeof main.scrollBy === 'function') main.scrollBy({ top: delta, behavior: lugn ? 'auto' : 'smooth' })
    }, lugn ? 0 : 140)
    return () => clearTimeout(t)
  }, [rullaFram])

  const C = SESSION.forklaring
  const etikett = utfall === 'ratt' ? C.ratt : utfall === 'fel' ? C.fel : utfall === 'obesvarad' ? C.obesvarad : C.vetInte
  const typens = innehall ?? detalj
  const harKropp = Boolean(regel || text || typens || misstag)
  return (
    <section
      ref={ref}
      role="status"
      aria-live="polite"
      className="sess-forklaring overflow-hidden rounded-2xl border border-kant bg-papper shadow-[0_1px_2px_rgba(27,34,70,.05)]"
      data-forklaringen={utfall}
    >
      <p className={`flex items-center gap-2.5 border-b px-4 py-3 ${RUBRIKRAD[utfall]}`} data-forklaring-rubrik>
        <Marke typ={utfall === 'ratt' ? 'ratt' : utfall === 'fel' ? 'fel' : 'ton'} storlek={28} pop />
        <span className="min-w-0 flex-1 font-sess-display text-base font-bold leading-5 text-ink-1">{etikett}</span>
        {tid ? <span className="flex-shrink-0 text-[12px] leading-4 tabular-nums text-ink-3">{C.tid(tid.sekunder, tid.budget)}</span> : null}
      </p>
      {harKropp ? (
        <div className="px-4 pb-4 pt-3.5 sm:px-[18px]" data-forklaring-kropp>
          {regel || text || typens ? <p className={EYEBROW}>{C.eyebrow}</p> : null}
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
          {typens ? (
            <div className="mt-2.5" data-forklaring-detalj data-forklaring-innehall>
              {typens}
            </div>
          ) : null}
          {misstag ? (
            <>
              <div className={`h-px bg-kant ${regel || text || typens ? 'mb-3 mt-3.5' : 'mb-3'}`} aria-hidden="true" />
              <p className={EYEBROW}>{C.misstag}</p>
              <p className="mt-1 text-sm leading-5 text-ink-2" data-misstag>
                {misstag}
              </p>
            </>
          ) : null}
        </div>
      ) : null}
      {rapport ? (
        <div className={`flex flex-col items-end px-4 pb-2.5 ${harKropp ? "pt-0" : "pt-2"}`} data-forklaring-fotrad>
          <FragaRapport key={rapport.qId} {...rapport} liten />
        </div>
      ) : null}
    </section>
  )
}
