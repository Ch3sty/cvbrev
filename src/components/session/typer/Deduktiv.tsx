'use client'

/**
 * Deduktiv slutledning i ramen (omgång 3 steg 2b, skissens Test-deduktiv,
 * -premisser, -turordning, -antagande, -sanning, -tabell, Mobil-deduktiv
 * och Mobil-deduktiv-tabell), innehållsformen Bred.
 *
 * Villkorskortet är typens underlag, som texten och tabellen i de andra
 * underlagstyperna: ramen ritar det i vänsterspalten på dator och överst på
 * mobil (där rullar det med sidan, villkoren och kladdytan är för höga för
 * att stå fästa). Uppgiften och svaren står till höger och domen under dem
 * med Nästa, som i övriga typer.
 *
 *   Villkoren   numrerade brickor, villkoret med kvantorer och relationer i
 *               halvfet stil och en bild till höger ritad ur villkorens form
 *               (struktur): platserna, grannarna, ordningen, mängderna.
 *               Sanning och lögn som repliker; tabellpusslet i två spalter,
 *               på mobil ett villkor i taget med Alla villkor.
 *   Kladdytan   hyllan, raden eller turordningen, prova dig fram och
 *               kryssrutan (deduktiv/Kladd.tsx). Räknas aldrig som svar och
 *               sparas inte. Efter facit fylls platserna med lösningen.
 *   Kedjan      premisskedjor och om-så efter facit, med ledens namn.
 *
 * Saknas villkorens form (äldre uppgifter) står villkoren som text och
 * remsan med tomma platser som förut.
 */

import { Fragment, useState, type ReactNode } from 'react'
import { useRubrikTagg } from '@/components/tests/RubrikTagg'
import type { DeduktivLedNamn, DeduktivLosning } from '@/lib/deduktivV1/types'
import type { DeduktivStruktur } from '@/lib/deduktivV1/struktur'
import { SvarRad, tillstandFor } from '../Svarskort'
import type { ForklaringInnehallProps, RamUppgift, TypRitare, UppgiftProps } from '../typ'
import { initialer, KvantorBild, PlatsBild, personFarg } from '../deduktiv/Bilder'
import { Kedjan, PlatsKladd, SanningKladd, TabellKladd } from '../deduktiv/Kladd'

export interface DeduktivU extends RamUppgift {
  intro: string | null
  villkor: string[]
  fraga: string
  options: string[]
  /** Antal platser när uppgiften har en remsa (servern), annars null eller utelämnad. */
  platser?: number | null
  /** Villkorens form (servern, utan facit): bilderna och kladdytorna. */
  struktur?: DeduktivStruktur | null
}

/** Facit för deduktivt (RamFacit.data): lösningen och kedjans namn. */
export type DeduktivData = DeduktivLosning & { ledNamn?: DeduktivLedNamn | null }

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
  'varken',
  'eller',
  'inte',
]
const KVANTOR = new RegExp(`(?<![\\p{L}\\d])(${FRASER.join('|')})(?![\\p{L}\\d])`, 'giu')

/** Villkoret med kvantorer och relationer i semibold; "Om" först i ett villkor också. */
export function markeraVillkor(text: string): ReactNode[] {
  const ut: ReactNode[] = []
  let rest = text
  if (/^Om\s/.test(rest)) {
    ut.push(
      <b key="om" className="font-semibold">
        Om
      </b>
    )
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

/** Remsan utan villkorens form (äldre uppgifter): tomma platser, ifyllda i facit. */
function Remsan({ intro, platser, losning }: { intro: string | null; platser: number; losning: DeduktivLosning | null }) {
  const schema = losning?.schema ?? null
  const n = schema?.namn.length ?? platser
  const namn = remsansNamn(intro, n)
  const per = losning && schema ? villkorPerPlats(losning) : null
  return (
    <div className="sess-kladd px-4 pb-4 pt-3 lg:px-7 lg:pb-[22px] lg:pt-3.5" data-deduktiv-remsa={schema ? 'fylld' : 'tom'}>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <p className="font-sess-display text-[16px] font-bold leading-5 text-ink-1 lg:text-[18px]">{namn.titel}</p>
        <span className="text-[12px] leading-4 text-[color:var(--sess-ink-2)]">{schema ? namn.facit : namn.uppgift}</span>
      </div>
      <ol aria-label={schema ? `${namn.titel}, plats för plats` : `${namn.titel}, tomma platser`} className="m-0 grid list-none gap-1.5 p-0 lg:gap-2.5" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {Array.from({ length: n }, (_, i) => {
          const plats = i + 1
          const cell = schema?.namn[i] ?? null
          const svar = schema?.koppar === plats
          const tagg = per?.tagg[i] ?? null
          return (
            <li key={plats} className="flex min-w-0 flex-col items-center gap-1.5" data-plats={plats} aria-label={cell ? `Plats ${plats}: ${cell.join(' eller ')}${svar ? ', svaret' : ''}${tagg ? `, ${tagg}` : ''}` : `Plats ${plats}, tom`}>
              <span className="sess-plats sess-remsa-in !min-h-[56px]" data-fylld={cell ? '' : undefined} data-svar={svar ? '' : undefined} aria-hidden="true" style={{ animationDelay: `${per ? Math.min(per.steg[i], 6) * 400 : 0}ms` }}>
                {cell ? <span className="max-w-full truncate px-1 text-[13px] font-bold leading-4">{cell.join(' / ')}</span> : null}
                {tagg ? <span className="max-w-full truncate px-1 text-[10px] leading-[13px] text-[color:var(--sess-ink-3)]">{tagg}</span> : null}
              </span>
              <span className="sess-platsnr" aria-hidden="true" data-nr-svar={svar ? '' : undefined}>
                {plats}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/* -------------------------------------------------------- Villkorskortet */

const KVANTOR_START = /^(Alla|Ingen|Inga|Inget|Några|Någon|Något)\s/

/** Kvantorn i början av en premiss som bricka (skissen Test-deduktiv-premisser). */
function premissText(v: string): ReactNode {
  const m = KVANTOR_START.exec(v)
  if (!m) return markeraVillkor(v).map((d, j) => <Fragment key={j}>{d}</Fragment>)
  const nej = /^(Ingen|Inga|Inget)$/.test(m[1])
  return (
    <>
      <span className="sess-kvantor" data-nej={nej ? '' : undefined}>
        {m[1]}
      </span>{' '}
      {markeraVillkor(v.slice(m[0].length)).map((d, j) => (
        <Fragment key={j}>{d}</Fragment>
      ))}
    </>
  )
}

function bildFor(s: DeduktivStruktur | null | undefined, i: number, init: string[]): ReactNode {
  if (!s) return null
  if (s.slag === 'plats') {
    const v = s.villkor[i]
    return v ? <PlatsBild v={v} namn={s.namn} saker={s.tema === 'saker'} init={init} /> : null
  }
  if (s.slag === 'kvantor') {
    const l = s.villkor[i]?.[0]
    return l ? <KvantorBild led={l} /> : null
  }
  return null
}

function VillkorRad({ nr, children, bild, liten = false }: { nr: number; children: ReactNode; bild?: ReactNode; liten?: boolean }) {
  return (
    <li className={`sess-villkor-rad flex items-center gap-2.5 lg:gap-3.5 ${liten ? 'py-2 lg:py-2' : 'py-2 lg:py-[11px]'}`}>
      <span className="sess-villkor-nr" aria-hidden="true">
        {nr}
      </span>
      <span className={`min-w-0 flex-1 text-ink-1 ${liten ? 'text-[14px] leading-[20px] lg:text-[15px] lg:leading-[22px]' : 'text-[15px] leading-[22px] lg:text-[17px] lg:leading-[25px]'}`}>
        <span className="sr-only">{`${nr}. `}</span>
        {children}
      </span>
      {bild ? (
        <span className="sess-bild" aria-hidden="true">
          {bild}
        </span>
      ) : null}
    </li>
  )
}

/** Sanning och lögn: personen till vänster, repliken i en pratbubbla med villkorets nummer. */
function Repliker({ villkor, s }: { villkor: string[]; s: Extract<DeduktivStruktur, { slag: 'sanning' }> }) {
  const init = initialer(s.namn)
  return (
    <ol className="m-0 flex list-none flex-col gap-2.5 p-0 lg:gap-3">
      {villkor.map((v, i) => {
        const t = s.talare[i] ?? 0
        const replik = v.includes(':') ? v.slice(v.indexOf(':') + 1).trim() : v
        return (
          <li key={i} className="flex items-center gap-2.5 lg:gap-3.5">
            <span className="flex w-12 flex-shrink-0 flex-col items-center gap-0.5 lg:w-14">
              <span className="sess-bricka-namn !h-9 !w-9 !text-[16px] lg:!h-12 lg:!w-12 lg:!text-[20px]" style={{ background: personFarg(t) }} aria-hidden="true">
                {init[t]}
              </span>
              <span className="text-[11px] font-bold leading-[14px] text-ink-1 lg:text-[12px]">{s.namn[t]}</span>
              <span className="text-[10px] leading-3 text-[color:var(--sess-ink-3)] lg:text-[11px]">säger</span>
            </span>
            <span className="relative flex min-w-0 flex-1 items-center gap-2 rounded-[16px] bg-[color:var(--sess-indigo-mjuk)] px-3.5 py-3 shadow-[0_3px_0_var(--sess-kant)] lg:rounded-[18px] lg:px-5 lg:py-4">
              <span className="min-w-0 flex-1 font-sess-display text-[15px] font-bold leading-[21px] text-ink-1 lg:text-[19px] lg:leading-[25px]">
                <span className="sr-only">{`${i + 1}. ${s.namn[t]} säger: `}</span>
                {replik}
              </span>
              <span className="sess-villkor-nr !h-6 !w-6 !rounded-[8px] !text-[12px] !leading-6 lg:!h-7 lg:!w-7 lg:!leading-7" aria-hidden="true">
                {i + 1}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

/** Tabellpusslets villkor på mobil: ett i taget med pilar, eller alla (skissen Mobil-deduktiv-tabell). */
function VillkorBladdra({ villkor }: { villkor: string[] }) {
  const [i, setI] = useState(0)
  const [alla, setAlla] = useState(false)
  const n = villkor.length
  if (alla) {
    return (
      <div className="lg:hidden">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase leading-4 tracking-[.08em] text-[color:var(--sess-ink-3)]">Villkor</p>
          <button type="button" onClick={() => setAlla(false)} className="min-h-11 text-[13px] font-semibold text-ink-1 underline decoration-[color:var(--sess-streck)] underline-offset-4">
            Ett i taget
          </button>
        </div>
        <ol className="m-0 list-none p-0">
          {villkor.map((v, j) => (
            <VillkorRad key={j} nr={j + 1} liten>
              {markeraVillkor(v).map((d, k) => (
                <Fragment key={k}>{d}</Fragment>
              ))}
            </VillkorRad>
          ))}
        </ol>
      </div>
    )
  }
  return (
    <div className="lg:hidden" data-villkor-bladdra>
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-semibold uppercase leading-4 tracking-[.08em] text-[color:var(--sess-ink-3)]" aria-live="polite">{`Villkor ${i + 1} av ${n}`}</p>
        <span className="flex gap-[3px]" aria-hidden="true">
          {villkor.map((_, j) => (
            <i key={j} className="block h-1.5 w-1.5 rounded-full" style={{ background: j === i ? 'var(--sess-lucka)' : j < i ? 'var(--sess-indigo)' : 'var(--sess-bit)' }} />
          ))}
        </span>
        <button type="button" onClick={() => setAlla(true)} className="ml-auto min-h-11 text-[13px] font-semibold text-ink-1 underline decoration-[color:var(--sess-streck)] underline-offset-4">
          Alla villkor
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" className="sess-kryss h-11 w-11 flex-shrink-0 text-ink-1 disabled:opacity-40" aria-label="Förra villkoret" disabled={i === 0} onClick={() => setI((x) => Math.max(0, x - 1))}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <p className="min-h-[44px] min-w-0 flex-1 text-[15px] leading-[21px] text-ink-1">
          {markeraVillkor(villkor[i] ?? '').map((d, k) => (
            <Fragment key={k}>{d}</Fragment>
          ))}
        </p>
        <button type="button" className="sess-kryss h-11 w-11 flex-shrink-0 text-ink-1 disabled:opacity-40" aria-label="Nästa villkor" disabled={i >= n - 1} onClick={() => setI((x) => Math.min(n - 1, x + 1))}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export function VillkorKort({
  intro,
  villkor,
  platser = null,
  losning = null,
  struktur = null,
  ledNamn = null,
}: {
  intro: string | null
  villkor: string[]
  platser?: number | null
  losning?: DeduktivLosning | null
  struktur?: DeduktivStruktur | null
  ledNamn?: DeduktivLedNamn | null
}) {
  const s = struktur
  const init = s?.slag === 'plats' ? initialer(s.namn) : []
  const remsa = losning?.schema ? losning.schema.namn.length : platser && platser > 1 ? platser : 0
  const lista = (
    <ol className="m-0 list-none p-0">
      {villkor.map((v, i) => (
        <VillkorRad key={i} nr={i + 1} bild={bildFor(s, i, init)} liten={s?.slag === 'tabell'}>
          {s?.slag === 'kvantor' ? premissText(v) : markeraVillkor(v).map((d, j) => <Fragment key={j}>{d}</Fragment>)}
        </VillkorRad>
      ))}
    </ol>
  )
  let kladd: ReactNode = null
  if (s?.slag === 'plats') {
    kladd = <PlatsKladd s={s} intro={intro} namn={remsansNamn(intro, s.namn.length)} losning={losning} tagg={losning?.schema ? villkorPerPlats(losning) : null} />
  } else if (s?.slag === 'sanning') {
    kladd = <SanningKladd namn={s.namn} />
  } else if (s?.slag === 'tabell') {
    kladd = <TabellKladd s={s} />
  } else if (s && losning) {
    kladd = <Kedjan s={s} ledNamn={ledNamn} losning={losning} />
  } else if (!s && remsa) {
    kladd = <Remsan intro={intro} platser={remsa} losning={losning?.schema ? losning : null} />
  }
  return (
    <section aria-label="Villkor" className="sess-papper" data-deduktiv-villkor={s?.slag ?? ''}>
      <div className="px-4 pb-2.5 pt-3.5 lg:px-7 lg:pb-3 lg:pt-5">
        <p className="text-[11px] font-semibold uppercase leading-4 tracking-[.08em] text-[color:var(--sess-ink-3)] lg:text-[12px]">Villkor</p>
        {intro ? <p className="mt-1 text-[14px] leading-[21px] text-[color:var(--sess-ink-2)] lg:mt-1.5 lg:text-[16px] lg:leading-6">{intro}</p> : null}
        <div className="mt-1.5 lg:mt-2">
          {s?.slag === 'sanning' ? (
            <div className="pb-1 pt-1.5">
              <Repliker villkor={villkor} s={s} />
            </div>
          ) : s?.slag === 'tabell' ? (
            <>
              <div className="hidden lg:block lg:columns-2 lg:gap-7 [&_li]:break-inside-avoid">{lista}</div>
              <VillkorBladdra villkor={villkor} />
            </>
          ) : (
            lista
          )}
        </div>
      </div>
      {kladd}
    </section>
  )
}

/** Lösningen ur facit (RamFacit.data), bara efter facit. */
function losningUr(data: unknown): DeduktivData | null {
  if (!data || typeof data !== 'object') return null
  const l = data as DeduktivData
  return Array.isArray(l.steg) ? l : null
}

/** Underlaget i ramen: villkorskortet med kladdytan, ifyllt efter facit. */
function DeduktivUnderlag({ u, facitData }: { u: DeduktivU; genomgang?: boolean; facitData?: unknown }) {
  const l = losningUr(facitData)
  return <VillkorKort intro={u.intro} villkor={u.villkor} platser={u.platser ?? null} losning={l} struktur={u.struktur ?? null} ledNamn={l?.ledNamn ?? null} />
}

/* ------------------------------------------------------------- Uppgiften */

export function DeduktivUppgift({ u, nr, antal, vald, facit, efterFel, onValj, last }: UppgiftProps<DeduktivU>) {
  // p i artiklarnas provruta (RubrikTagg, omgång 2 steg C), annars h2.
  const Rubrik = useRubrikTagg()
  // Antagandet i frågan står i ett eget kort (skissen Test-deduktiv-antagande).
  const om = /^(Om [^,]+,)\s*(.+)$/.exec(u.fraga)
  return (
    <div className="flex flex-col gap-3 lg:gap-0" data-deduktiv-uppgift>
      <p className="text-ey uppercase text-ink-3">{`Fråga ${nr} av ${antal} om villkoren`}</p>
      {om ? (
        <div className="lg:mt-2">
          {/* Skärmläsaren får antagandet i rubriken (sr-only nedan). */}
          <p aria-hidden="true" className="flex items-center gap-3 rounded-[16px] bg-[color:var(--sess-rad3-yta)] px-3.5 py-2.5 shadow-[0_4px_0_var(--sess-rad3-kant)] lg:rounded-[18px] lg:px-[18px] lg:py-3">
            <span className="inline-flex h-7 flex-shrink-0 items-center rounded-[9px] bg-[color:var(--sess-lucka)] px-2 text-[12px] font-extrabold uppercase text-[#1A1206]">Om</span>
            <span className="font-sess-display text-[18px] font-bold leading-6 text-ink-1 lg:text-[22px] lg:leading-7">{om[1]}</span>
          </p>
          <Rubrik tabIndex={-1} data-uppgift-rubrik className="mt-3 font-sess-display text-[21px] font-extrabold leading-[26px] tracking-[-.01em] text-ink-1 outline-none lg:mt-5 lg:text-[28px] lg:leading-[34px]">
            <span className="sr-only">{`${om[1]} `}</span>
            {om[2]}
          </Rubrik>
        </div>
      ) : (
        <Rubrik tabIndex={-1} data-uppgift-rubrik className="font-sess-display text-[21px] font-extrabold leading-[26px] tracking-[-.01em] text-ink-1 outline-none [text-wrap:balance] lg:mt-2 lg:text-[28px] lg:leading-[34px]">
          {u.fraga}
        </Rubrik>
      )}
      <div role="radiogroup" aria-label="Svarsalternativ" className="flex flex-col gap-2 lg:mt-5 lg:gap-3" data-deduktiv-alt>
        {u.options.map((text, i) => (
          <SvarRad key={i} i={i} tillstand={tillstandFor(i, vald, facit)} ditt={facit != null && vald === i} efterFel={efterFel} disabled={last} onValj={onValj}>
            {text}
          </SvarRad>
        ))}
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- Domen */

/** Lösningsgången i domen: stegen i en vit ruta med villkorens nummer i mörka brickor (skissen). */
function DomSteg({ losning }: { losning: DeduktivLosning }) {
  return (
    <ol className="sess-domsteg m-0 grid list-none grid-cols-[minmax(34px,auto)_1fr] gap-x-2 gap-y-2 p-0 lg:grid-cols-[minmax(38px,auto)_1fr] lg:gap-x-2.5" data-losningsgang>
      {losning.steg.map((s, i) => {
        const nr = s.markor.filter((m): m is number => typeof m === 'number')
        const om = s.markor.includes('Om')
        return (
          <li key={i} className="grid grid-cols-subgrid col-span-2 items-start">
            <span className="pt-px">
              {om ? (
                <span className="sess-domsteg-nr" data-om="">
                  Om
                </span>
              ) : nr.length ? (
                <span className="sess-domsteg-nr">{nr.join(', ')}</span>
              ) : null}
            </span>
            <p className="m-0 text-[13px] leading-[19px] text-ink-1 lg:text-[14px] lg:leading-5">
              <span className="sr-only">{om ? 'Antagandet i frågan. ' : nr.length ? `Villkor ${nr.join(', ')}. ` : ''}</span>
              {s.villkor.map((v, j) => (
                <span key={j} className="font-semibold">
                  {v}{' '}
                </span>
              ))}
              {s.foljd}
            </p>
          </li>
        )
      })}
    </ol>
  )
}

function DeduktivForklaring({ facit }: ForklaringInnehallProps<DeduktivU>) {
  const l = losningUr(facit.data)
  if (!l) return facit.detalj ? <>{facit.detalj}</> : null
  return <DomSteg losning={l} />
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
  underlag: { nyckel: (u) => u.nyckel, Ritare: DeduktivUnderlag },
  Forklaring: DeduktivForklaring,
  Miniatyr: DeduktivMiniatyr,
}
