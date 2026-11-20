'use client'

/**
 * Uppgiftslistan (omgång 2 steg A, artboarden Resultat-1440 och -412 i
 * skissen, UX 2026-11-21 punkt 2): alla uppgifter på resultatsidan, en rad
 * per uppgift, och varje rad kan fällas ut till hela uppgiften med facit och
 * Förklaringen. Ersätter genomgångskortet i Resultatskarm i alla lägen.
 *
 *   huvud   eyebrow "Uppgifterna", rubriken ("Femton uppgifter, tre fel och
 *           en obesvarad") och "Gå igenom" som sekundär knapp; under den
 *           "4 av 15 fel" och filtret Alla eller Bara fel (två textknappar)
 *   rad     56 px: nummer, typens miniatyr (TypRitare.Miniatyr), märket
 *           (fyllt, 22 px), "B, rätt C" (döljs under 640 px), tiden i ink-3
 *           och chevronen. Fel på fel-mjuk, obesvarad på papper-2.
 *   utfälld typens Uppgift med `last`, `kompakt` och facit, underlaget när
 *           typen har ett, Förklaringen under svaren och länken "Öppna i
 *           genomgången". Flera rader får vara öppna. Enter öppnar, Esc
 *           stänger.
 *
 * Utfällda från början: i Träna alla fel och obesvarade, i testlägena bara
 * den första missen (facit möter henne utan klick).
 *
 * Låst (`last`, det publika provet i steg C): inget facit, ingen chevron och
 * ingen utfällning. Raden visar nummer, miniatyr, det ritade märket (ringen),
 * "Rätt" eller "Fel" och låset "Rätt svar och regeln". Obesvarade räknas som
 * fel. Inga händelser skjuts.
 *
 * Mätningen: genomgang_rad_utfalld när hon fäller ut en rad, forklaring_tid
 * för Förklaringen i en utfälld rad (plats lista).
 */

import { useCallback, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { IkonChev } from '@/components/illustrations/RumSymboler'
import { KNAPP_SEKUNDAR, LANK } from '@/components/shell/knappar'
import type { RapportTestKind } from '@/lib/traning/fragaRapport'
import Forklaringen, { type Utfall } from './Forklaringen'
import Marke, { Las } from './Marke'
import { BOKSTAV } from './Svarskort'
import { SESSION } from './copy'
import { basFor, sessionHandelser, type SessionHandelseBas } from './handelser'
import type { Lage } from './lagesregler'
import { forklaringInnehall, type GenomgangPost, type RamUppgift, type TypRitare } from './typ'

/** En rad: posten och, när typerna blandas (I-provet), radens egen ritare. */
export interface ListPost<U extends RamUppgift> extends GenomgangPost<U> {
  ritare?: TypRitare<U>
}

export interface UppgiftslistanProps<U extends RamUppgift> {
  ritare: TypRitare<U>
  lage: Lage
  poster: ListPost<U>[]
  sessionId?: string | null
  /** Mätningens bas. Utelämnad: typens id och läget. */
  bas?: SessionHandelseBas | null
  /** Provets tid per uppgift, för Förklaringens tidrad. */
  budgetPerUppgift?: number | null
  /** Mellanrubriker, till exempel deltesten i I-provet. */
  grupper?: { fran: number; rubrik: string }[]
  /** "Gå igenom": genomgången i ramen från första felet. Utelämnad: ingen knapp. */
  onGaIgenom?: (() => void) | null
  /** "Öppna i genomgången" i en utfälld rad: genomgången på just den uppgiften. */
  onOppna?: ((index: number) => void) | null
  /** Det publika provet: inget facit, ingen utfällning, låset på varje rad. */
  last?: boolean
  /** Låsets text på dator. Utelämnad: "Rätt svar och regeln". */
  lasText?: string
  /** Vilka rader som står utfällda från början. Utelämnad: alla fel i Träna, första missen annars. */
  utfallda?: 'fel' | 'forsta' | 'inga'
  /** Egen rubrik i stället för den uträknade. */
  titel?: string
}

type RadUtfall = 'ratt' | 'fel' | 'obesvarad'

function utfallFor(p: GenomgangPost<RamUppgift>, last: boolean): RadUtfall {
  if (p.facit.correct) return 'ratt'
  if (p.valt == null && !last) return 'obesvarad'
  return 'fel'
}

const RAD_YTA: Record<RadUtfall, string> = {
  ratt: 'bg-papper',
  fel: 'bg-fel-mjuk',
  obesvarad: 'bg-papper-2',
}

export default function Uppgiftslistan<U extends RamUppgift>(p: UppgiftslistanProps<U>) {
  const last = Boolean(p.last)
  const utfall = useMemo(() => p.poster.map((x) => utfallFor(x as GenomgangPost<RamUppgift>, last)), [p.poster, last])
  const antal = p.poster.length
  const fel = utfall.filter((x) => x === 'fel').length
  const obesvarade = utfall.filter((x) => x === 'obesvarad').length
  const missar = fel + obesvarade
  const forstaMiss = utfall.findIndex((x) => x !== 'ratt')

  const [oppna, setOppna] = useState<Set<number>>(() => {
    if (last) return new Set()
    const lage = p.utfallda ?? (p.lage === 'trana' ? 'fel' : 'forsta')
    if (lage === 'inga' || forstaMiss < 0) return new Set()
    if (lage === 'forsta') return new Set([forstaMiss])
    return new Set(utfall.flatMap((x, i) => (x === 'ratt' ? [] : [i])))
  })
  const [baraFel, setBaraFel] = useState(false)
  const bas = basFor(p.ritare.kind, p.lage, p.bas)
  const id = useId()
  const radRefs = useRef<(HTMLButtonElement | null)[]>([])

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

  const titel = p.titel ?? (last ? SESSION.lista.titelLast(antal, missar) : SESSION.lista.titel(antal, fel, obesvarade))
  const L = SESSION.lista
  const synliga = p.poster.map((_, i) => !baraFel || utfall[i] !== 'ratt')
  const grupper = p.grupper ?? []

  const rader: ReactNode[] = []
  p.poster.forEach((post, i) => {
    const g = grupper.find((x) => x.fran === i)
    if (g) {
      const slut = grupper.find((x) => x.fran > i)?.fran ?? antal
      if (synliga.slice(i, slut).some(Boolean)) {
        rader.push(
          <li key={`g-${i}`} className="border-t border-kant bg-papper-2 px-3 py-2 text-[11px] font-semibold uppercase leading-4 tracking-[.08em] text-ink-3 sm:px-4" data-lista-grupp>
            {g.rubrik}
          </li>
        )
      }
    }
    if (!synliga[i]) return
    const ritare = post.ritare ?? p.ritare
    const u = utfall[i]
    const Mini = ritare.Miniatyr
    const etikett = (x: number) => (ritare.svarEtikett ? ritare.svarEtikett(post.u, x) : BOKSTAV(x))
    const nr = i + 1
    const mini = Mini ? (
      <span className="flex min-w-0 flex-shrink items-center overflow-hidden" aria-hidden="true" data-lista-mini>
        <Mini u={post.u} />
      </span>
    ) : null

    if (last) {
      rader.push(
        <li key={post.u.nyckel} className="border-t border-kant" data-lista-rad={u} data-last="">
          <div className={`flex h-14 items-center gap-2.5 px-3 sm:gap-3.5 sm:px-4 ${RAD_YTA[u === 'ratt' ? 'ratt' : 'fel']}`}>
            <span className="w-[22px] flex-shrink-0 text-[13px] tabular-nums text-ink-3">{nr}</span>
            {mini}
            <Marke typ={u === 'ratt' ? 'ratt' : 'fel'} storlek={22} />
            <span className="hidden text-sm font-medium leading-5 text-ink-1 sm:inline">{L.radLast(u === 'ratt')}</span>
            <span className="sr-only sm:hidden">{L.radLast(u === 'ratt')}</span>
            <span className="ml-auto inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap text-[12px] leading-4 text-ink-3 sm:rounded-full sm:bg-papper-2 sm:px-2.5 sm:py-[3px]" data-lista-las>
              <Las storlek={13} />
              <span className="sr-only sm:not-sr-only">{p.lasText ?? L.las}</span>
            </span>
          </div>
        </li>
      )
      return
    }

    const oppen = oppna.has(i)
    const svar = L.radSvar(post.valt == null ? null : etikett(post.valt), post.facit.ratt >= 0 ? etikett(post.facit.ratt) : '', post.facit.correct, p.lage === 'trana')
    const panelId = `${id}-p${i}`
    const Uppgift = ritare.Uppgift
    const forklaringUtfall: Utfall = post.valt == null ? (p.lage === 'trana' ? 'vet_inte' : 'obesvarad') : post.facit.correct ? 'ratt' : 'fel'
    const UL = ritare.underlag
    const forklaringen = oppen ? (
      <Forklaringen
        utfall={forklaringUtfall}
        tid={post.tid_s != null ? { sekunder: post.tid_s, budget: p.budgetPerUppgift ?? null } : null}
        regel={post.facit.regel}
        text={post.facit.text}
        misstag={post.facit.misstag}
        innehall={forklaringInnehall(ritare, post.u, post.facit, post.valt, 'lista')}
        rapport={{ qId: post.u.nyckel, sessionId: p.sessionId ?? null, testKind: ritare.kind as RapportTestKind, bankVersion: null }}
        matning={{ bas, sessionId: p.sessionId ?? null, index: i, plats: 'lista' }}
      />
    ) : null
    rader.push(
      <li key={post.u.nyckel} className="border-t border-kant" data-lista-rad={u} data-oppen={oppen ? '' : undefined} onKeyDown={(e) => stang(i, e)}>
        <button
          ref={(el) => {
            radRefs.current[i] = el
          }}
          type="button"
          aria-expanded={oppen}
          aria-controls={panelId}
          aria-label={`${SESSION.raknare.aria(nr, antal)}, ${svar}${post.tid_s != null ? `, ${L.sekunder(post.tid_s)}` : ''}`}
          onClick={() => vaxla(i)}
          className={`flex h-14 w-full items-center gap-2.5 px-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[color:var(--fokus,var(--ink-1))] sm:gap-3.5 sm:px-4 ${RAD_YTA[u]}`}
          data-lista-knapp
        >
          <span className="w-[22px] flex-shrink-0 text-[13px] tabular-nums text-ink-3">{nr}</span>
          {mini}
          <Marke typ={u === 'ratt' ? 'ratt' : u === 'fel' ? 'fel' : 'ton'} storlek={22} fylld />
          {/* Mobil: texten hoppar över när miniatyren bär raden (skissen Resultat-412); utan miniatyr står den kvar. */}
          <span className={`min-w-0 truncate text-sm font-medium leading-5 text-ink-1 ${Mini ? 'hidden sm:inline' : ''}`}>{svar}</span>
          <span className="ml-auto flex-shrink-0 text-[13px] tabular-nums text-ink-3">{post.tid_s != null ? L.sekunder(post.tid_s) : ''}</span>
          <IkonChev size={16} className={`flex-shrink-0 text-ink-3 transition-transform duration-200 ${oppen ? '-rotate-90' : 'rotate-90'}`} />
        </button>
        {oppen ? (
          <div id={panelId} className="sess-tona bg-golv px-3 pb-4 pt-3 sm:px-6 sm:pb-5 sm:pt-4" data-lista-panel>
            <div className="mx-auto flex w-full max-w-[496px] flex-col">
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
                forklaring={ritare.forklaringIUppgift ? forklaringen : undefined}
              />
              {ritare.forklaringIUppgift ? null : <div className="mt-3">{forklaringen}</div>}
              {p.onOppna ? (
                <button type="button" onClick={() => p.onOppna?.(i)} className={`${LANK} mt-3 inline-flex min-h-11 items-center self-start text-[13px]`} data-lista-oppna>
                  {L.oppna}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </li>
    )
  })

  return (
    <section aria-label={L.eyebrow} className="overflow-hidden rounded-2xl border border-kant bg-papper shadow-[0_1px_2px_rgba(27,34,70,.05)]" data-uppgiftslistan={last ? 'last' : ''}>
      <div className={`flex flex-wrap items-center justify-between gap-3 px-3 sm:px-6 ${last ? 'pb-3.5 pt-4 sm:pt-5' : 'pb-3 pt-4 sm:pb-3.5 sm:pt-5'}`}>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase leading-4 tracking-[.08em] text-ink-3">{L.eyebrow}</p>
          <h2 className="mt-1 font-sess-display text-[20px] font-bold leading-[26px] tracking-[-.01em] text-ink-1" data-lista-titel>
            {titel}
          </h2>
        </div>
        {!last && p.onGaIgenom ? (
          <button type="button" onClick={p.onGaIgenom} className={`${KNAPP_SEKUNDAR} !h-11 !w-auto px-[18px] text-[15px]`} data-ga-igenom>
            {L.gaIgenom}
          </button>
        ) : null}
      </div>
      {!last ? (
        <div className="flex min-h-9 items-center gap-4 px-3 pb-2 text-sm sm:px-6" data-lista-filter>
          <span className="text-ink-2">{missar ? L.rakning(missar, antal) : L.allaRatt}</span>
          {missar > 0 && missar < antal ? (
            <span className="ml-auto flex gap-3.5" role="group" aria-label={L.filterAria}>
              {[false, true].map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  aria-pressed={baraFel === v}
                  onClick={() => setBaraFel(v)}
                  className={`inline-flex min-h-9 items-center text-sm leading-5 underline-offset-[3px] ${
                    baraFel === v ? 'font-semibold text-ink-1 underline decoration-ink-1 decoration-2' : 'text-ink-2 no-underline hover:underline hover:decoration-kant-stark'
                  }`}
                  data-lista-filter-val={v ? 'fel' : 'alla'}
                >
                  {v ? L.baraFel : L.alla}
                </button>
              ))}
            </span>
          ) : null}
        </div>
      ) : null}
      <ol className="m-0 list-none p-0">{rader}</ol>
    </section>
  )
}
