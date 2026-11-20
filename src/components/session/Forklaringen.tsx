'use client'

/**
 * Domen (omgång 3 steg 1, skissens Test-matris, Test-ord, Test-siffror-cirkel
 * och Mobil-matris-facit): en tonad panel efter svaret, samma i Träna,
 * genomgången och Uppgiftslistans utfällda rad. Komponenten heter
 * Forklaringen som förut, så att alla som ritar den får domen.
 *
 *   rubrikraden  ikonen 40 px, utfallet i display 22/26 ("Rätt!", "Inte den
 *                här", "Förklaringen", "Obesvarad") och tiden till höger i
 *                tonens färg ("24 sekunder", efter Vet inte "Du valde Vet inte")
 *   kroppen      regeln (16/23 600), löptexten, typens innehåll (platsen
 *                `innehall`, typerna fyller den) och "Ditt misstag"
 *   foten        raden om nästa uppgift ("Nästa blir lite svårare.") och
 *                Nästa, när läget skickar `nasta` (Träna)
 *
 *   rätt       grön ton (--sess-ratt-yta)
 *   fel        röd ton (--sess-fel-yta)
 *   vet inte   indigo ton (--sess-vet-yta): att be om förklaringen är inte ett fel
 *   obesvarad  genomgången i testlägen, samma indigo ton
 *
 * På dator står domen i kolumnen under svaren. Med `panel` (Träna, ramens
 * dom-plats) är den på mobil en panel som glider upp nedifrån och står fast
 * nedtill: ingenting ovanför byter plats, main rullar bara så mycket som
 * panelen täcker av svaren (`rullaFram`).
 *
 * Inga rubrikelement (h1 till h6): det publika provets lista ritar domen och
 * provrutan får inte ha rubriker (seo-diffens grind).
 *
 * role="status" så att skärmläsaren läser utfallet. Med `matning` skjuts
 * forklaring_tid en gång när domen försvinner eller sidan lämnas.
 */

import { useEffect, useRef, type ReactNode } from 'react'
import FragaRapport, { type FragaRapportProps } from '@/components/traning/FragaRapport'
import { KNAPP_PRIMAR } from '@/components/shell/knappar'
import Marke from './Marke'
import { SESSION } from './copy'
import { sessionHandelser, type SessionHandelseBas } from './handelser'
import { Snurra, type RamPrimar } from './SessionsRam'

export type Utfall = 'ratt' | 'fel' | 'vet_inte' | 'obesvarad'

/** Nästa uppgifts nivå mot den här: raden i domens fot. */
export type NastaRiktning = 'svarare' | 'lattare' | 'samma'

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
  /** Rulla fram domen när den monteras (efter ett svar, inte i genomgången). */
  rullaFram?: boolean
  /** Typens innehåll i kroppen, under regeln och löptexten. */
  innehall?: ReactNode
  /** Äldre namn på `innehall` (RamFacit.detalj, etapp 3). */
  detalj?: ReactNode
  /** Mäter tiden domen stod framme (forklaring_tid). Utelämnad: ingen mätning. */
  matning?: ForklaringMatning | null
  /** Nästa i domens fot (Träna). Utelämnad: läget har egen fot (genomgången, listan). */
  nasta?: RamPrimar | null
  /** Raden om nästa uppgift. Utelämnad eller null: ingen rad (motorn vet inte nivån). */
  nastaRiktning?: NastaRiktning | null
  /** Panelen nedtill på mobil (ramens dom-plats). */
  panel?: boolean
}

const LUFT = 12

/** Tiden domen stod framme, en gång per visning. */
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

/** Domens ikon: fylld cirkel med bock, kryss eller glödlampa. */
function DomIkon({ utfall }: { utfall: Utfall }) {
  if (utfall === 'ratt' || utfall === 'fel') return <Marke typ={utfall} storlek={40} fylld pop className="h-9 w-9 lg:h-10 lg:w-10" />
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true" focusable="false" className="sess-pop block h-9 w-9 flex-shrink-0 lg:h-10 lg:w-10" data-marke="ton">
      <circle cx="20" cy="20" r="20" fill="var(--sess-indigo)" />
      <path
        d="M16.5 25.5h7M17.5 28.5h5M20 11.5a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 20 11.5z"
        fill="none"
        stroke="var(--sess-indigo-ink)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Pilen i raden om nästa uppgift. */
function RiktningsPil({ riktning }: { riktning: NastaRiktning }) {
  if (riktning === 'samma') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
        <path d="M5 12h14" />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={riktning === 'lattare' ? 'rotate-180' : undefined}>
      <path d="M12 19V5M5.5 11.5L12 5l6.5 6.5" />
    </svg>
  )
}

export default function Forklaringen({
  utfall,
  tid,
  regel,
  text = null,
  misstag,
  rapport,
  rullaFram = false,
  innehall = null,
  detalj = null,
  matning = null,
  nasta = null,
  nastaRiktning = null,
  panel = false,
}: ForklaringenProps) {
  const ref = useRef<HTMLElement | null>(null)
  useForklaringTid(matning, utfall)

  useEffect(() => {
    const el = ref.current
    if (!rullaFram || !el) return
    const lugn = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    // Efter en bildruta, så att ramens egen rullning vid ny uppgift redan har körts.
    const t = setTimeout(() => {
      const main = el.closest('main')
      if (!main || typeof main.scrollBy !== 'function') return
      const mainRect = main.getBoundingClientRect()
      const stilFast = panel && typeof window !== 'undefined' && window.getComputedStyle(el).position === 'sticky'
      let delta: number
      if (stilFast) {
        // Mobil: panelen står fast nedtill. Rulla bara så mycket som den
        // täcker av svaren (rörelsen räknas inte: offsetHeight, inte rect).
        const panelTopp = mainRect.bottom - el.offsetHeight
        const svar = main.querySelectorAll<HTMLElement>('[role="radiogroup"]')
        const mal = svar.length ? svar[svar.length - 1] : main.querySelector<HTMLElement>('.serie-kolumn')
        if (!mal) return
        delta = mal.getBoundingClientRect().bottom + LUFT - panelTopp
      } else {
        // Dator och utan panel: nederkanten 12 px över main eller foten.
        const fot = main.querySelector<HTMLElement>('[data-ram-fot]')
        const fotRect = fot?.getBoundingClientRect() ?? null
        const rect = el.getBoundingClientRect()
        const fotTopp = fotRect && fotRect.top > rect.top ? fotRect.top : mainRect.bottom
        // Domen ritas 10 px nedanför sin plats när den börjar glida in.
        delta = rect.bottom - 10 - (Math.min(mainRect.bottom, fotTopp) - LUFT)
      }
      if (delta > 0) main.scrollBy({ top: delta, behavior: lugn ? 'auto' : 'smooth' })
    }, lugn ? 0 : 60)
    return () => clearTimeout(t)
  }, [rullaFram, panel])

  const C = SESSION.forklaring
  const etikett = utfall === 'ratt' ? C.ratt : utfall === 'fel' ? C.fel : utfall === 'obesvarad' ? C.obesvarad : C.vetInte
  const typens = innehall ?? detalj
  const harKropp = Boolean(regel || text || typens || misstag)
  const hoger = utfall === 'vet_inte' ? C.duValdeVetInte : tid ? C.sekunder(tid.sekunder) : null
  return (
    <section
      ref={ref}
      role="status"
      aria-live="polite"
      className={`sess-dom ${panel ? 'max-lg:sticky max-lg:bottom-0 max-lg:z-30 max-lg:-mx-4 max-lg:mt-auto lg:mt-[18px]' : ''}`}
      data-forklaringen={utfall}
      data-dom={utfall}
      data-panel={panel ? '' : undefined}
    >
      <p className="flex items-center gap-3" data-forklaring-rubrik>
        <DomIkon utfall={utfall} />
        <span className="min-w-0 flex-1 font-sess-display text-[20px] font-extrabold leading-6 tracking-[-.01em] lg:text-[22px] lg:leading-[26px]">{etikett}</span>
        {hoger ? (
          <span className="sess-dom-ton flex-shrink-0 text-[13px] font-semibold leading-4" data-dom-tid>
            {hoger}
          </span>
        ) : null}
      </p>
      {harKropp ? (
        <div className="mt-2.5" data-forklaring-kropp>
          {regel ? (
            <p className="text-[15px] font-semibold leading-[22px] lg:text-base lg:leading-[23px]" data-regel>
              {regel}
            </p>
          ) : null}
          {text ? (
            <p className={`${regel ? 'mt-1.5' : ''} text-[15px] leading-[22px]`} data-forklaring-text>
              {text}
            </p>
          ) : null}
          {typens ? (
            <div className="mt-3" data-forklaring-detalj data-forklaring-innehall>
              {typens}
            </div>
          ) : null}
          {misstag ? (
            <div className="mt-3 rounded-[14px] bg-papper px-3.5 py-2.5" data-forklaring-misstag>
              <p className="text-[11px] font-semibold uppercase leading-4 tracking-[.08em] text-ink-3">{C.misstag}</p>
              <p className="mt-0.5 text-sm leading-5 text-ink-1" data-misstag>
                {misstag}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
      {rapport ? (
        <div className="mt-1.5 flex flex-col items-end" data-forklaring-fotrad>
          <FragaRapport key={rapport.qId} {...rapport} liten />
        </div>
      ) : null}
      {nasta ? (
        <div className={`flex items-center gap-3.5 lg:gap-4 ${rapport ? 'mt-2' : 'mt-4'}`} data-dom-fot>
          {nastaRiktning ? (
            <span className="flex min-w-0 items-center gap-2 text-[13px] font-semibold leading-[18px] lg:gap-2.5 lg:text-sm lg:leading-5" data-nasta-rad={nastaRiktning}>
              <i className="sess-nasta-ikon not-italic">
                <RiktningsPil riktning={nastaRiktning} />
              </i>
              {C.nastaRad[nastaRiktning]}
            </span>
          ) : null}
          <button
            type="button"
            onClick={nasta.onClick}
            disabled={nasta.disabled || nasta.laddar}
            aria-busy={nasta.laddar || undefined}
            className={`${KNAPP_PRIMAR} sess-knapp relative ml-auto !w-auto flex-shrink-0 touch-manipulation disabled:cursor-not-allowed`}
            data-primar={nasta.data ?? ''}
          >
            {nasta.laddar ? (
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <Snurra />
              </span>
            ) : null}
            <span key={nasta.text}>{nasta.text}</span>
          </button>
        </div>
      ) : null}
    </section>
  )
}
