'use client'

/**
 * Genomgången på resultatsidan (omgång 3, steg 3b, skissens Resultat-test):
 * papperet med rubriken ("Fyra fel och en obesvarad"), filtret Missarna och
 * Alla, en rad per miss med nummerbrickan, typens miniatyr, svaret ("Fel. Du
 * svarade B, rätt var D"), mönstret när det är känt, tiden (prick när den gick
 * över provets tid) och chevronen. Den första missen står utfälld: typens
 * bräde eller underlag till vänster med facit, domen till höger (regeln,
 * räknevägen, misstaget) med tiden och "Öppna uppgiften". De rätta samlas i
 * en rad "De femton du klarade" som visar alla.
 *
 * Facit kommer ur posterna, som lägena bara bygger efter avslutet (som i
 * dag). Typernas ritare från steg 2a och 2b används oförändrade: Uppgift med
 * `last`, `kompakt` och facit, underlaget med `facitData`, Förklaringen
 * (domen). Uppgiftslistan står kvar för de publika proven.
 *
 * Mätningen: genomgang_rad_utfalld när en rad fälls ut (samma som listan),
 * forklaring_tid för domen i en utfälld rad (plats lista).
 */

import { useCallback, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import type { RapportTestKind } from '@/lib/traning/fragaRapport'
import Forklaringen, { type Utfall } from '../Forklaringen'
import { BOKSTAV } from '../Svarskort'
import { antalOrd, SESSION } from '../copy'
import { basFor, sessionHandelser } from '../handelser'
import type { Lage } from '../lagesregler'
import { forklaringInnehall, type GenomgangPost, type RamUppgift } from '../typ'
import type { UppgiftslistanProps } from '../Uppgiftslistan'
import { Bitar, IkonBock, mmss, type BrickUtfall } from './delar'

type RadUtfall = BrickUtfall

function utfallFor(p: GenomgangPost<RamUppgift>): RadUtfall {
  if (p.facit.correct) return 'ratt'
  if (p.valt == null) return 'obesvarad'
  return 'fel'
}

/** "Fyra fel och en obesvarad", "Ett fel", "Alla rätt". Träna säger Vet inte. */
export function genomgangRubrik(fel: number, obesvarade: number, lage: Lage): string {
  const felOrd = fel === 1 ? 'Ett fel' : `${antalOrd(fel, true)} fel`
  const obes = lage === 'trana' ? (obesvarade === 1 ? 'en Vet inte' : `${antalOrd(obesvarade)} Vet inte`) : obesvarade === 1 ? 'en obesvarad' : `${antalOrd(obesvarade)} obesvarade`
  if (fel === 0 && obesvarade === 0) return 'Alla rätt'
  if (obesvarade === 0) return felOrd
  if (fel === 0) return obes[0].toUpperCase() + obes.slice(1)
  return `${felOrd} och ${obes}`
}

/** Raderna som står framme innan resten visas på begäran: den utfällda och fyra till. */
const FORSTA = 5

function Chev() {
  return (
    <svg className="res-chev" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export interface GenomgangenProps<U extends RamUppgift> extends Omit<UppgiftslistanProps<U>, 'onGaIgenom' | 'last' | 'lasText' | 'utfallda' | 'titel'> {
  /** Mönstret per uppgift (taggen på raden), när läget vet det. Index som posterna. */
  monster?: (string | null)[] | null
}

export default function Genomgangen<U extends RamUppgift>(p: GenomgangenProps<U>) {
  const utfall = useMemo(() => p.poster.map((x) => utfallFor(x as GenomgangPost<RamUppgift>)), [p.poster])
  const antal = p.poster.length
  const fel = utfall.filter((x) => x === 'fel').length
  const obesvarade = utfall.filter((x) => x === 'obesvarad').length
  const missar = fel + obesvarade
  const ratt = antal - missar
  const forstaMiss = utfall.findIndex((x) => x !== 'ratt')
  const [visa, setVisa] = useState<'missar' | 'alla'>(missar > 0 ? 'missar' : 'alla')
  const [oppna, setOppna] = useState<Set<number>>(() => new Set(forstaMiss >= 0 ? [forstaMiss] : []))
  // Många missar: de fem första raderna, resten på begäran (per flik).
  const [heltVisad, setHeltVisad] = useState<{ missar: boolean; alla: boolean }>({ missar: false, alla: false })
  const bas = basFor(p.ritare.kind, p.lage, p.bas)
  const id = useId()
  const radRefs = useRef<(HTMLButtonElement | null)[]>([])
  const budget = p.budgetPerUppgift ?? null

  const vaxla = useCallback(
    (i: number) => {
      const varOppen = oppna.has(i)
      setOppna((s) => {
        const n = new Set(s)
        if (varOppen) n.delete(i)
        else n.add(i)
        return n
      })
      if (!varOppen) sessionHandelser.genomgangRadUtfalld(bas, { session_id: p.sessionId ?? null, index: i, antal, utfall: utfall[i] })
    },
    [oppna, bas, p.sessionId, antal, utfall]
  )

  const stang = (i: number, e: KeyboardEvent) => {
    if (e.key !== 'Escape' || !oppna.has(i)) return
    e.preventDefault()
    e.stopPropagation()
    setOppna((s) => {
      const n = new Set(s)
      n.delete(i)
      return n
    })
    radRefs.current[i]?.focus()
  }

  const grupper = p.grupper ?? []
  const rader: ReactNode[] = []
  const iFliken = utfall.filter((x) => visa === 'alla' || x !== 'ratt').length
  const kapa = !heltVisad[visa] && iFliken > FORSTA + 1
  let visade = 0
  p.poster.forEach((post, i) => {
    const u = utfall[i]
    if (visa === 'missar' && u === 'ratt') return
    if (kapa && visade >= FORSTA) return
    visade++
    const g = visa === 'alla' ? grupper.find((x) => x.fran === i) : null
    if (g) {
      rader.push(
        <li key={`g-${i}`} className="border-t-[1.5px] border-[color:var(--sess-res-radlinje)] bg-papper-2 px-4 py-2 text-[11px] font-semibold uppercase leading-4 tracking-[.08em] text-ink-3 sm:px-6" data-lista-grupp>
          {g.rubrik}
        </li>
      )
    }
    const ritare = post.ritare ?? p.ritare
    const etikett = (x: number) => (ritare.svarEtikett ? ritare.svarEtikett(post.u, x) : BOKSTAV(x))
    const rattEt = post.facit.ratt >= 0 ? etikett(post.facit.ratt) : ''
    const nr = i + 1
    const oppen = oppna.has(i)
    const panelId = `${id}-p${i}`
    // Underlagets typer: ikonbrickan för underlagets slag, aldrig en beskuren textbit (steg 3b).
    const Mini = ritare.RadIkon ?? ritare.Miniatyr
    const huvud =
      u === 'ratt'
        ? `Rätt. Du svarade ${post.valt != null ? etikett(post.valt) : rattEt}`
        : u === 'fel'
          ? `Fel. Du svarade ${post.valt != null ? etikett(post.valt) : ''}, rätt var ${rattEt}`
          : `${p.lage === 'trana' ? 'Vet inte' : 'Obesvarad'}. Rätt var ${rattEt}`
    const under = post.facit.misstag ?? post.facit.regel ?? (u === 'obesvarad' && p.lage !== 'trana' ? 'Du lämnade in utan svar' : post.facit.text ?? null)
    // En tid på 0 är en tid som inte mättes (äldre sessioner): den ritas inte.
    const tid = post.tid_s != null && post.tid_s > 0 ? post.tid_s : null
    const over = budget != null && tid != null && tid > budget
    const monster = p.monster?.[i] ?? null
    const forklaringUtfall: Utfall = post.valt == null ? (p.lage === 'trana' ? 'vet_inte' : 'obesvarad') : post.facit.correct ? 'ratt' : 'fel'
    const UL = ritare.underlag
    const Uppgift = ritare.Uppgift
    const iUppgift = Boolean(ritare.forklaringIUppgift)
    const domen = oppen ? (
      <Forklaringen
        utfall={forklaringUtfall}
        tid={tid != null ? { sekunder: tid, budget } : null}
        regel={post.facit.regel}
        text={post.facit.text}
        misstag={post.facit.misstag}
        innehall={forklaringInnehall(ritare, post.u, post.facit, post.valt, 'lista')}
        rapport={{ qId: post.u.nyckel, sessionId: p.sessionId ?? null, testKind: ritare.kind as RapportTestKind, bankVersion: null }}
        matning={{ bas, sessionId: p.sessionId ?? null, index: i, plats: 'lista' }}
      />
    ) : null
    const fotrad =
      tid != null || p.onOppna ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 border-t-[1.5px] border-[color:var(--sess-res-radlinje)] pt-2" data-genomgang-fotrad>
          {tid != null ? (
            <span className="res-tid !text-[13px]" data-over={over ? '' : undefined}>
              {mmss(tid)}
              {over ? ', över provets tid' : ''}
            </span>
          ) : (
            <span />
          )}
          {p.onOppna ? (
            <button type="button" onClick={() => p.onOppna?.(i)} className="res-lank text-sm" data-lista-oppna>
              Öppna uppgiften
            </button>
          ) : null}
        </div>
      ) : null

    rader.push(
      <li key={post.u.nyckel} data-lista-rad={u} data-oppen={oppen ? '' : undefined} onKeyDown={(e) => stang(i, e)}>
        <button
          ref={(el) => {
            radRefs.current[i] = el
          }}
          type="button"
          aria-expanded={oppen}
          aria-controls={panelId}
          aria-label={`${SESSION.raknare.aria(nr, antal)}. ${huvud}${tid != null ? `, ${mmss(tid)}` : ''}`}
          onClick={() => vaxla(i)}
          className="res-rad focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[color:var(--fokus,var(--ink-1))]"
          data-mini={Mini ? '' : undefined}
          data-oppen={oppen && u !== 'ratt' ? '' : undefined}
          data-lista-knapp
        >
          <span className="res-nr" data-utfall={u}>
            {nr}
          </span>
          {Mini ? (
            <span className="res-rad-mini" aria-hidden="true" data-lista-mini>
              <Mini u={post.u} />
            </span>
          ) : null}
          <span className="res-rad-t min-w-0">
            <b>{huvud}</b>
            {under ? <span>{under}</span> : null}
          </span>
          {monster ? <span className="res-tagg">{monster}</span> : <span className="hidden sm:block" />}
          <span className="res-tid" data-over={over ? '' : undefined}>
            {tid != null ? mmss(tid) : ''}
          </span>
          <Chev />
        </button>
        {oppen ? (
          <div id={panelId} className="res-panel-utfalld" data-bred={UL || iUppgift ? '' : undefined} data-lista-panel>
            <div data-uppgiften className="min-w-0">
              {UL ? (
                <div className="mb-3" data-lista-underlag>
                  <UL.Ritare u={post.u} genomgang facitData={post.facit.data} />
                </div>
              ) : null}
              <Uppgift
                u={post.u}
                nr={nr}
                antal={antal}
                vald={post.valt}
                facit={post.facit.ratt >= 0 ? post.facit.ratt : null}
                facitData={post.facit.data}
                efterFel={false}
                last
                kompakt
                forklaring={iUppgift ? domen : undefined}
              />
              {iUppgift ? fotrad : null}
            </div>
            {iUppgift ? null : (
              <div data-domen className="min-w-0">
                {domen}
                {fotrad}
              </div>
            )}
          </div>
        ) : null}
      </li>
    )
  })

  if (kapa) {
    rader.push(
      <li key="fler" className="border-t-[1.5px] border-[color:var(--sess-res-radlinje)] px-4 py-2 sm:px-6">
        <button type="button" className="res-lank text-ink-1" onClick={() => setHeltVisad((h) => ({ ...h, [visa]: true }))} data-lista-visa-alla>
          {visa === 'missar' ? `Visa alla ${missar} missar` : `Visa alla ${antal} uppgifter`}
        </button>
      </li>
    )
  }

  if (visa === 'missar' && ratt > 0) {
    rader.push(
      <li key="klarade">
        <button type="button" className="res-rad" data-klarade="" onClick={() => setVisa('alla')} data-lista-klarade>
          <span className="res-nr" data-utfall="ratt">
            <IkonBock size={18} />
          </span>
          <span className="res-rad-t min-w-0">
            <b>{ratt === 1 ? 'Den du klarade' : `De ${antalOrd(ratt)} du klarade`}</b>
            <span>Regeln står kvar i varje uppgift om du vill läsa den.</span>
          </span>
          <span className="hidden sm:block">
            <Bitar utfall={Array.from({ length: Math.min(ratt, 20) }, () => 'ratt' as const)} smal />
          </span>
          <Chev />
        </button>
      </li>
    )
  }

  return (
    <section aria-label="Genomgången" className="res-ark" data-uppgiftslistan="" data-genomgangen>
      <div className="flex flex-wrap items-end justify-between gap-4 px-4 pb-4 pt-5 sm:px-6 sm:pt-[22px]">
        <div className="min-w-0">
          <p className="res-ey" style={{ color: 'var(--sess-rad3-ink)' }}>
            Genomgången
          </p>
          <h2 className="mt-1 font-sess-display text-[22px] font-extrabold leading-7 tracking-[-.01em] text-ink-1 sm:text-[26px] sm:leading-8" data-lista-titel>
            {genomgangRubrik(fel, obesvarade, p.lage)}
          </h2>
        </div>
        {missar > 0 && ratt > 0 ? (
          <div className="res-filt" role="group" aria-label="Visa">
            <button type="button" aria-pressed={visa === 'missar'} onClick={() => setVisa('missar')} data-lista-filter-val="fel">
              Missarna<em data-miss="">{missar}</em>
            </button>
            <button type="button" aria-pressed={visa === 'alla'} onClick={() => setVisa('alla')} data-lista-filter-val="alla">
              Alla<em>{antal}</em>
            </button>
          </div>
        ) : null}
      </div>
      <ol className="m-0 list-none p-0">{rader}</ol>
    </section>
  )
}
