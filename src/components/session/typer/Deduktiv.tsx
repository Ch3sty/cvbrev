'use client'

/**
 * Deduktiv slutledning i ramen (plan-testflode-2026-11-20 avsnitt 3.4,
 * omgång 2 steg B1), innehållsformen Bred, samma uppgift i alla lägen.
 *
 *   Dator   villkorskortet i vänsterspalten (560, 640 från xl), sticky så att
 *           villkoren och remsan syns medan lösningsgången läses; uppgiften
 *           och svaren i högerspalten (400, 440 från xl), 40 px mellan.
 *   Mobil   villkoren fästa överst med egen rullning, högst 42 vh och 38 vh
 *           när uppgiften har fem alternativ; frågan och raderna under.
 *
 * Villkorskortet (skissen Deduktiv-uppgift): flaggan och "Villkor" i en
 * linjerad rubrikrad, introraden i ink-2, villkoren 18/28 på dator med
 * numrerade brickor linjerade mot första raden. Kvantorer och relationer
 * står i semibold via en ordlista i klienten (ingen bankändring, ingen färg).
 *
 * Remsan: när bankens lösning har ett schema ritas platserna tomma i
 * uppgiften (`platser` från servern) och fylls i facit, plats för plats i
 * lösningsgångens ordning, med villkorstaggen ovanför cellen. Den heter
 * efter uppgiftens objekt ur introraden ("Hyllan", "Raden", "Turordningen"),
 * annars "Platserna 1 till 4". Lösningsgången står i Förklaringen
 * (TypRitare.Forklaring), utan egen remsa.
 */

import { Fragment, type ReactNode } from 'react'
import { IkonFlagga } from '@/components/illustrations/RumSymboler'
import { useRubrikTagg } from '@/components/tests/RubrikTagg'
import type { DeduktivLosning } from '@/lib/deduktivV1/types'
import Losningsgang from '../deduktiv/Losningsgang'
import { SvarRad, tillstandFor } from '../Svarskort'
import type { ForklaringInnehallProps, RamUppgift, TypRitare, UppgiftProps } from '../typ'

export interface DeduktivU extends RamUppgift {
  intro: string | null
  villkor: string[]
  fraga: string
  options: string[]
  /** Antal platser när uppgiften har en remsa (servern), annars null eller utelämnad. */
  platser?: number | null
}

/* ------------------------------------------------------------ Ordlistan */

/** Kvantorer och relationer i semibold. Längst först, så att "direkt till vänster om" vinner över "till vänster om". */
const FRASER = [
  'någonstans till vänster om',
  'någonstans till höger om',
  'direkt till vänster om',
  'direkt till höger om',
  'till vänster om',
  'till höger om',
  'inte bredvid',
  'inte på plats \\d+',
  'på plats \\d+',
  'direkt före',
  'direkt efter',
  'samma dag',
  'olika dagar',
  'bredvid',
  'mellan',
  'före',
  'efter',
  'inga',
  'ingen',
  'inget',
  'alla',
  'allt',
  'några',
  'någon',
  'något',
  'varje',
  'aldrig',
  'alltid',
  'bara',
  'minst',
  'högst',
]
const KVANTOR = new RegExp(`(?<![\\p{L}\\d])(${FRASER.join('|')})(?![\\p{L}\\d])`, 'giu')

/** Villkoret med kvantorer och relationer i semibold; "Om" först i ett villkor också. */
export function markeraVillkor(text: string): ReactNode[] {
  const ut: ReactNode[] = []
  let rest = text
  if (/^Om\s/.test(rest)) {
    ut.push(<b key="om" className="font-semibold">Om</b>)
    rest = rest.slice(2)
  }
  let fran = 0
  for (const m of rest.matchAll(KVANTOR)) {
    const i = m.index ?? 0
    if (i > fran) ut.push(rest.slice(fran, i))
    ut.push(
      <b key={`${i}`} className="font-semibold">
        {m[0]}
      </b>
    )
    fran = i + m[0].length
  }
  if (fran < rest.length) ut.push(rest.slice(fran))
  return ut
}

/* --------------------------------------------------------------- Remsan */

export interface RemsansNamn {
  titel: string
  /** Hjälpraden i uppgiften och i facit. */
  uppgift: string
  facit: string
}

/** Remsans namn ur introraden, med reserv "Platserna 1 till N". */
export function remsansNamn(intro: string | null, n: number): RemsansNamn {
  const t = (intro ?? '').toLowerCase()
  const hall = 'Håll ordningen i huvudet eller på papper.'
  if (/turordning/.test(t)) return { titel: 'Turordningen', uppgift: `Plats 1 till ${n} i turordning. ${hall}`, facit: `Så blir turordningen, plats 1 till ${n}.` }
  if (/hylla/.test(t)) return { titel: 'Hyllan', uppgift: `Plats 1 till ${n} från vänster. ${hall}`, facit: `Så blir hyllan, plats 1 till ${n} från vänster.` }
  if (/\ben rad\b/.test(t)) return { titel: 'Raden', uppgift: `Plats 1 till ${n} från vänster. ${hall}`, facit: `Så blir raden, plats 1 till ${n} från vänster.` }
  return { titel: `Platserna 1 till ${n}`, uppgift: hall, facit: `Så blir det, plats 1 till ${n}.` }
}

/**
 * Villkoret som låste varje plats, ur lösningsgången: första steget vars
 * följd låser platsen ("Det låser ... på plats 4", "Alltså står ... på plats
 * 1"). `steg` är stegets ordning för intoningen; olåsta platser kommer sist.
 */
export function villkorPerPlats(l: DeduktivLosning): { tagg: (string | null)[]; steg: number[] } {
  const n = l.schema?.namn.length ?? 0
  const tagg: (string | null)[] = Array(n).fill(null)
  const steg: number[] = Array(n).fill(l.steg.length)
  l.steg.forEach((s, si) => {
    const om = s.markor.includes('Om')
    const nr = s.markor.filter((m): m is number => typeof m === 'number')
    const text = om ? s.villkor.join(' ') : s.foljd
    const meningar = om ? [text] : text.split(/(?<=\.)\s+/).filter((m) => /låser|^Alltså/.test(m))
    for (const mening of meningar) {
      for (const m of mening.matchAll(/på plats (\d+)/g)) {
        const p = Number(m[1]) - 1
        if (p < 0 || p >= n || steg[p] < l.steg.length) continue
        steg[p] = si
        tagg[p] = om ? 'antagandet' : nr.length ? `villkor ${nr.join(', ')}` : null
      }
    }
  })
  return { tagg, steg }
}

function Remsan({ intro, platser, losning }: { intro: string | null; platser: number; losning: DeduktivLosning | null }) {
  const schema = losning?.schema ?? null
  const n = schema?.namn.length ?? platser
  const namn = remsansNamn(intro, n)
  const per = losning && schema ? villkorPerPlats(losning) : null
  const oppen = schema ? schema.namn.some((x) => x.length > 1) : false
  return (
    <div className="border-t border-kant bg-papper-2 px-4 pb-4 pt-3 lg:px-6 lg:pb-[22px] lg:pt-3.5" data-deduktiv-remsa={schema ? 'fylld' : 'tom'}>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <p className="font-sess-display text-[15px] font-bold leading-5 text-ink-1">{namn.titel}</p>
        <span className="text-[12px] leading-4 text-ink-3">{schema ? namn.facit : namn.uppgift}</span>
      </div>
      <ol
        aria-label={schema ? `${namn.titel}, plats för plats` : `${namn.titel}, tomma platser`}
        className="m-0 grid list-none gap-1.5 p-0 sm:gap-2 lg:gap-3"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: n }, (_, i) => {
          const plats = i + 1
          const cell = schema?.namn[i] ?? null
          const svar = schema?.koppar === plats
          const antagande = schema?.antagande === plats
          const tagg = per?.tagg[i] ?? null
          const fordrojning = per ? Math.min(per.steg[i], 6) * 400 : 0
          return (
            <li
              key={plats}
              className="flex min-w-0 flex-col gap-1"
              aria-label={
                cell ? `Plats ${plats}: ${cell.join(' eller ')}${svar ? ', svaret' : ''}${antagande ? ', antagandet i frågan' : ''}${tagg ? `, ${tagg}` : ''}` : `Plats ${plats}, tom`
              }
              data-plats={plats}
            >
              <span className="flex min-w-0 items-baseline justify-between gap-1" aria-hidden="true">
                <span className="font-sess-display text-[13px] font-bold leading-4 tabular-nums text-ink-2">{plats}</span>
                {tagg ? (
                  <span className="sess-remsa-in hidden truncate text-[11px] leading-[14px] tabular-nums text-ink-3 sm:inline" style={{ animationDelay: `${fordrojning}ms` }}>
                    {tagg}
                  </span>
                ) : null}
              </span>
              {cell ? (
                <span
                  aria-hidden="true"
                  className={`sess-remsa-in flex h-[46px] min-w-0 flex-col items-center justify-center rounded-lg border bg-papper px-0.5 text-center text-ink-1 ${
                    svar
                      ? 'border-positiv !bg-positiv-mjuk shadow-[inset_0_0_0_1px_var(--positiv)]'
                      : antagande
                        ? 'border-ink-1 shadow-[inset_0_0_0_1px_var(--ink-1)]'
                        : 'border-kant'
                  }`}
                  style={{ animationDelay: `${fordrojning}ms` }}
                  data-svar={svar ? '' : undefined}
                >
                  {cell.length > 1 ? (
                    cell.map((x) => (
                      <span key={x} className="block max-w-full truncate text-[11px] font-semibold leading-[13px] text-ink-2">
                        {x}
                      </span>
                    ))
                  ) : (
                    <span className={`block max-w-full truncate font-semibold ${n > 5 ? 'text-[13px] sm:text-sm' : 'text-sm sm:text-base'}`}>{cell[0]}</span>
                  )}
                </span>
              ) : (
                <span aria-hidden="true" className="block h-[46px] rounded-lg border-[1.5px] border-dashed border-kant-stark bg-papper" />
              )}
            </li>
          )
        })}
      </ol>
      {oppen ? <p className="mt-1.5 text-[12px] leading-4 text-ink-3">Två namn i en ruta betyder att båda är möjliga.</p> : null}
    </div>
  )
}

/* -------------------------------------------------------- Villkorskortet */

export function VillkorKort({
  intro,
  villkor,
  platser = null,
  losning = null,
}: {
  intro: string | null
  villkor: string[]
  platser?: number | null
  losning?: DeduktivLosning | null
}) {
  const remsa = losning?.schema ? losning.schema.namn.length : platser && platser > 1 ? platser : 0
  return (
    <section aria-label="Villkor" className="overflow-hidden rounded-2xl border border-kant bg-papper shadow-[0_1px_2px_rgba(27,34,70,.05)]" data-deduktiv-villkor>
      <div className="flex items-center gap-2 border-b border-kant px-4 pb-2.5 pt-3 text-ink-3 lg:px-6 lg:pb-3 lg:pt-4">
        <IkonFlagga size={14} strokeWidth={2} />
        <p className="text-[11px] font-semibold uppercase leading-4 tracking-[.08em]">Villkor</p>
        <span className="ml-auto text-[12px] leading-4">{villkor.length === 1 ? '1 villkor' : `${villkor.length} villkor`}</span>
      </div>
      <div className="px-4 pb-3 pt-3 lg:px-6 lg:pb-[18px] lg:pt-4">
        {intro ? <p className="mb-2 text-sm leading-[21px] text-ink-2 lg:mb-2.5 lg:text-[15px] lg:leading-[22px]">{intro}</p> : null}
        <ol className="m-0 list-none p-0">
          {villkor.map((v, i) => (
            <li key={i} className="grid grid-cols-[22px_1fr] items-start gap-2.5 py-1 text-base leading-[26px] text-ink-1 lg:gap-3 lg:py-1.5 lg:text-[18px] lg:leading-7">
              <span className="flex h-[26px] items-center lg:h-7" aria-hidden="true">
                <span className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-[7px] bg-papper-2 px-1.5 text-[12px] font-semibold leading-4 tabular-nums text-ink-2">
                  {i + 1}
                </span>
              </span>
              <span>
                <span className="sr-only">{`${i + 1}. `}</span>
                {markeraVillkor(v).map((d, j) => (
                  <Fragment key={j}>{d}</Fragment>
                ))}
              </span>
            </li>
          ))}
        </ol>
      </div>
      {remsa ? <Remsan intro={intro} platser={remsa} losning={losning?.schema ? losning : null} /> : null}
    </section>
  )
}

/** Lösningen ur facit (RamFacit.data), bara efter facit. */
function losningUr(facit: number | null, data: unknown): DeduktivLosning | null {
  if (facit == null || !data || typeof data !== 'object') return null
  const l = data as DeduktivLosning
  return Array.isArray(l.steg) ? l : null
}

export function DeduktivUppgift({ u, vald, facit, efterFel, onValj, last, forklaring, facitData, kompakt = false }: UppgiftProps<DeduktivU>) {
  const fem = u.options.length >= 5
  const losning = losningUr(facit, facitData)
  // p i artiklarnas provruta (RubrikTagg, omgång 2 steg C), annars h2.
  const Rubrik = useRubrikTagg()
  const kort = <VillkorKort intro={u.intro} villkor={u.villkor} platser={u.platser ?? null} losning={losning} />
  const svar = (
    <div role="radiogroup" aria-label="Svarsalternativ" className="flex flex-col gap-2" data-deduktiv-alt>
      {u.options.map((text, i) => (
        <SvarRad key={i} i={i} tillstand={tillstandFor(i, vald, facit)} ditt={facit != null && vald === i} efterFel={efterFel} disabled={last} onValj={onValj}>
          {text}
        </SvarRad>
      ))}
    </div>
  )
  // Kompakt (Uppgiftslistans utfällda rad): villkoren över uppgiften, inte fästa.
  if (kompakt) {
    return (
      <div className="flex flex-col gap-3.5" data-deduktiv-uppgift="kompakt">
        {kort}
        <Rubrik tabIndex={-1} data-uppgift-rubrik className="text-fraga text-ink-1 outline-none">
          {u.fraga}
        </Rubrik>
        {svar}
        {forklaring}
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-1 lg:flex-row lg:items-start lg:gap-10" data-deduktiv-uppgift>
      <div
        className="sess-villkor -mx-4 -mt-4 bg-golv px-4 pb-3 pt-4 lg:m-0 lg:max-w-[560px] lg:flex-1 lg:bg-transparent lg:p-0 xl:max-w-[640px]"
        data-fem={fem ? '' : undefined}
      >
        {kort}
      </div>
      <div className="flex min-w-0 flex-col gap-3.5 lg:w-[400px] lg:flex-none lg:gap-4 xl:w-[440px]">
        <Rubrik tabIndex={-1} data-uppgift-rubrik className="text-fraga text-ink-1 outline-none">
          {u.fraga}
        </Rubrik>
        {svar}
        {forklaring}
      </div>
    </div>
  )
}

/** Förklaringens innehåll: lösningsgången steg för steg; remsan fylls i villkorskortet. */
function DeduktivForklaring({ u, facit }: ForklaringInnehallProps<DeduktivU>) {
  const l = losningUr(facit.ratt, facit.data)
  if (!l) return facit.detalj ? <>{facit.detalj}</> : null
  const namn = l.schema ? remsansNamn(u.intro, l.schema.namn.length).titel : null
  return (
    <div>
      <Losningsgang losning={l} utanRemsa />
      {namn ? <p className="mt-3 text-[13px] leading-[18px] text-ink-2">{`${namn} i villkorskortet fylls i steg för steg i samma ordning.`}</p> : null}
    </div>
  )
}

/** Uppgiftslistans miniatyr: villkorens brickor, och remsans tomma platser när den finns. */
function DeduktivMiniatyr({ u }: { u: DeduktivU }) {
  const n = Math.min(u.villkor.length, 5)
  const p = u.platser && u.platser > 1 ? u.platser : 0
  return (
    <span className="inline-flex items-center gap-2" data-mini="deduktiv">
      <span className="inline-flex gap-[3px]">
        {Array.from({ length: n }, (_, i) => (
          <i key={i} className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] bg-papper-2 text-[10px] font-semibold not-italic tabular-nums text-ink-2">
            {i + 1}
          </i>
        ))}
      </span>
      {p ? (
        <span className="hidden gap-[2px] sm:inline-flex">
          {Array.from({ length: p }, (_, i) => (
            <i key={i} className="block h-[22px] w-3 rounded-[3px] border border-dashed border-kant-stark bg-papper" />
          ))}
        </span>
      ) : null}
    </span>
  )
}

export const DEDUKTIV: TypRitare<DeduktivU> = {
  kind: 'deduktiv',
  namn: 'Deduktiv slutledning',
  form: 'bred',
  antalAlternativ: (u) => u.options.length,
  Uppgift: DeduktivUppgift,
  forklaringIUppgift: true,
  Forklaring: DeduktivForklaring,
  Miniatyr: DeduktivMiniatyr,
}
