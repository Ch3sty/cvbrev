'use client'

/**
 * Kladdytorna och kedjan i deduktiv slutledning (omgång 3 steg 2b, skissens
 * Test-deduktiv, -turordning, -antagande, -sanning, -tabell, -premisser,
 * Mobil-deduktiv och Mobil-deduktiv-tabell).
 *
 * Kladdytorna räknas aldrig som svar och sparas inte: tillståndet bor i
 * komponenten och försvinner med uppgiften. Allt görs med ett finger, tryck
 * i stället för drag: tryck på en person eller pärm, sedan på en plats; ett
 * tryck på en fylld plats lägger tillbaka den.
 *
 *   PlatsKladd    hyllan, raden och turordningen. Antagandet i frågan står
 *                 låst på sin plats med OM. Efter facit fylls platserna med
 *                 lösningen i lösningsgångens ordning, villkoret som låste
 *                 platsen under namnet och svarets plats grön.
 *   SanningKladd  prova dig fram: sanningssägare eller lögnare per person.
 *   TabellKladd   kryssrutan: ett tryck kryss, två bock, tre tomt. På mobil
 *                 växlar flikarna mellan paren (skissens Mobil-deduktiv-tabell).
 *   Kedjan        premisskedjan efter facit med ledens namn (termnamn,
 *                 atomnamn) i stället för bokstäver, villkorets nummer på
 *                 länken och lösningens slutsats.
 */

import { Fragment, useMemo, useState } from 'react'
import type { DeduktivLedNamn, DeduktivLosning } from '@/lib/deduktivV1/types'
import type { DeduktivStruktur } from '@/lib/deduktivV1/struktur'
import { initialer, parmFarg, personFarg } from './Bilder'

type PlatsStruktur = Extract<DeduktivStruktur, { slag: 'plats' }>

export interface RemsansNamn {
  titel: string
  uppgift: string
  facit: string
}

/* --------------------------------------------------------------- Brickorna */

function StorParm({ namn, hojd = 74 }: { namn: string; hojd?: number }) {
  const f = parmFarg(namn)
  const vit = f.yta === '#FFFFFF'
  return (
    <svg width={Math.round(hojd * 0.32)} height={hojd} viewBox="0 0 36 116" aria-hidden="true" className="flex-shrink-0">
      <rect width="36" height="116" rx="8" fill={f.kant} />
      <rect x={vit ? 1.2 : 0} y={vit ? 1.2 : 0} width={vit ? 33.6 : 36} height={vit ? 108 : 110} rx="8" fill={f.yta} stroke={vit ? f.kant : 'none'} strokeWidth="2.4" />
      <rect x="8" y="14" width="20" height="30" rx="4" fill={vit ? '#EEF0FB' : '#FFFFFF'} opacity=".92" />
      <circle cx="18" cy="88" r="6.5" fill="none" stroke={vit ? f.kant : '#FFFFFF'} strokeWidth="3" opacity=".8" />
    </svg>
  )
}

function NamnBricka({ i, init }: { i: number; init: string }) {
  return (
    <span className="sess-bricka-namn" style={{ background: personFarg(i) }} aria-hidden="true">
      {init}
    </span>
  )
}

/** Turordningens grupper ur introraden: "Plats 1 till 3 går på måndagen". */
export function grupperUrIntro(intro: string | null): { fran: number; till: number; namn: string }[] {
  const ut: { fran: number; till: number; namn: string }[] = []
  for (const m of (intro ?? '').matchAll(/[Pp]lats (\d+) till (\d+) (?:går )?på (\p{L}+)/gu)) {
    const ord = m[3].replace(/en$/, '')
    const namn = ord.charAt(0).toUpperCase() + ord.slice(1)
    ut.push({ fran: Number(m[1]), till: Number(m[2]), namn })
  }
  return ut
}

/* ------------------------------------------------------------- Platserna */

export function PlatsKladd({
  s,
  intro,
  namn,
  losning,
  tagg,
}: {
  s: PlatsStruktur
  intro: string | null
  namn: RemsansNamn
  losning: DeduktivLosning | null
  /** Villkoret som låste varje plats och stegens ordning (villkorPerPlats), efter facit. */
  tagg: { tagg: (string | null)[]; steg: number[] } | null
}) {
  const n = s.namn.length
  const saker = s.tema === 'saker'
  const init = useMemo(() => initialer(s.namn), [s.namn])
  const grupper = s.tema === 'turordning' ? grupperUrIntro(intro) : []
  const las = s.antagande ? s.antagande.k - 1 : -1
  const [plac, setPlac] = useState<(number | null)[]>(() => Array.from({ length: n }, (_, i) => (i === las && s.antagande ? s.antagande.a : null)))
  const [vald, setVald] = useState<number | null>(null)
  const schema = losning?.schema ?? null
  const fylld = Boolean(schema)
  const index = (x: string) => s.namn.findIndex((m) => m.toLowerCase() === x.toLowerCase())
  const objekt = saker ? 'pärmarna' : 'kollegorna'
  const enObjekt = saker ? 'en pärm' : 'en person'

  const tryckPlats = (p: number) => {
    if (fylld || p === las) return
    if (vald != null) {
      setPlac((f) => f.map((x, i) => (i === p ? vald : x === vald ? null : x)))
      setVald(null)
    } else if (plac[p] != null) {
      setPlac((f) => f.map((x, i) => (i === p ? null : x)))
    }
  }
  const kvar = s.namn.map((_, i) => i).filter((i) => !plac.includes(i))

  const innehall = (p: number) => {
    if (schema) {
      const cell = schema.namn[p] ?? []
      if (cell.length > 1) {
        return (
          <span className="flex flex-col items-center gap-0.5 px-1 text-center">
            {cell.map((x) => (
              <span key={x} className="text-[11px] font-semibold leading-[13px] text-[color:var(--sess-ink-2)]">
                {x}
              </span>
            ))}
          </span>
        )
      }
      const x = cell[0] ?? ''
      const i = index(x)
      return (
        <>
          {saker ? <StorParm namn={x} hojd={56} /> : <NamnBricka i={Math.max(0, i)} init={init[i] ?? x.charAt(0)} />}
          <span className="max-w-full truncate px-1 text-[12px] font-bold leading-4 text-ink-1 lg:text-[14px] lg:leading-[18px]">{saker ? x : x}</span>
          {tagg?.tagg[p] ? <span className="max-w-full truncate px-1 text-[10px] font-medium leading-[13px] text-[color:var(--sess-ink-3)] lg:text-[11px] lg:leading-[14px]">{tagg.tagg[p]}</span> : null}
        </>
      )
    }
    const i = plac[p]
    if (i == null) return null
    return (
      <>
        {saker ? <StorParm namn={s.namn[i]} hojd={56} /> : <NamnBricka i={i} init={init[i]} />}
        <span className="max-w-full truncate px-1 text-[12px] font-bold leading-4 text-ink-1 lg:text-[14px] lg:leading-[18px]">{saker ? s.namn[i].charAt(0).toUpperCase() + s.namn[i].slice(1) : s.namn[i]}</span>
      </>
    )
  }

  return (
    <div className="sess-kladd px-4 pb-4 pt-3.5 lg:px-7 lg:pb-[22px] lg:pt-[18px]" data-deduktiv-remsa={fylld ? 'fylld' : 'tom'} data-kladd="plats">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-sess-display text-[16px] font-bold leading-5 text-ink-1 lg:text-[18px] lg:leading-[22px]">{namn.titel}</p>
        <span className="text-[12px] leading-4 text-[color:var(--sess-ink-2)] lg:text-[13px] lg:leading-[18px]">
          {fylld ? (
            `Fylls i samma ordning som lösningen.${schema?.koppar ? ` Plats ${schema.koppar} är svaret.` : ''}`
          ) : (
            <>
              <span className="lg:hidden">{`Tryck på ${enObjekt}, sedan på en plats.`}</span>
              <span className="hidden lg:inline">{`Flytta ${objekt} medan du tänker. ${namn.titel} räknas inte som svar.`}</span>
            </>
          )}
        </span>
      </div>
      {grupper.length ? (
        <div className="mb-1.5 grid gap-1.5 lg:gap-2.5" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }} aria-hidden="true">
          {grupper.map((g) => (
            <span
              key={g.namn}
              className="flex items-center gap-2 text-[11px] font-bold uppercase leading-4 tracking-[.06em] text-[color:var(--sess-brade-2)] lg:text-[13px] lg:normal-case lg:tracking-normal"
              style={{ gridColumn: `${g.fran} / ${g.till + 1}` }}
            >
              {g.namn}
              <i className="block h-px flex-1 bg-[color:var(--sess-kant)]" />
            </span>
          ))}
        </div>
      ) : null}
      <ol
        aria-label={fylld ? `${namn.titel}, plats för plats` : `${namn.titel}, ${n} platser`}
        className="m-0 grid list-none gap-1.5 p-0 lg:gap-2.5"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: n }, (_, p) => {
          const plats = p + 1
          const svar = schema?.koppar === plats
          const om = (schema ? schema.antagande === plats : p === las) && (schema != null || s.antagande != null)
          const har = schema ? true : plac[p] != null
          const iNamn = schema ? (schema.namn[p] ?? []).join(' eller ') : plac[p] != null ? s.namn[plac[p]!] : null
          const fordrojning = tagg ? Math.min(tagg.steg[p] ?? 0, 6) * 400 : 0
          return (
            <li key={plats} className="flex min-w-0 flex-col items-center gap-1.5" data-plats={plats}>
              <button
                type="button"
                onClick={() => tryckPlats(p)}
                disabled={fylld || p === las}
                aria-label={`Plats ${plats}${iNamn ? `: ${iNamn}` : ', tom'}${svar ? ', svaret' : ''}${om ? ', antagandet i frågan' : ''}${tagg?.tagg[p] ? `, ${tagg.tagg[p]}` : ''}`}
                className={`sess-plats touch-manipulation ${fylld ? 'sess-remsa-in' : ''} ${saker ? 'min-h-[84px] lg:min-h-[132px]' : ''}`}
                style={fylld ? { animationDelay: `${fordrojning}ms` } : undefined}
                data-fylld={har ? '' : undefined}
                data-svar={svar ? '' : undefined}
                data-om={om ? '' : undefined}
                data-mal={!fylld && vald != null && !har ? '' : undefined}
              >
                {om ? (
                  <span className="sess-om-tagg" aria-hidden="true">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                    </svg>
                    Om
                  </span>
                ) : null}
                {innehall(p)}
              </button>
              {saker ? <i className={`sess-hylla -mx-[3px] -mt-1 block h-2.5 self-stretch lg:-mx-[5px] lg:h-3 ${p === 0 ? '' : '!rounded-l-none'} ${p === n - 1 ? '' : '!rounded-r-none'}`} aria-hidden="true" /> : null}
              <span className="sess-platsnr" aria-hidden="true" data-nr-svar={svar ? '' : undefined} data-om={om ? '' : undefined}>
                {plats}
              </span>
            </li>
          )
        })}
      </ol>
      {!fylld ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-t-2 border-[color:var(--sess-kant)] pt-3 lg:mt-4 lg:pt-4">
          <span className="text-[11px] font-semibold uppercase leading-4 tracking-[.08em] text-[color:var(--sess-ink-3)] lg:text-[12px]">Att placera</span>
          <div className="flex flex-wrap items-end gap-2 lg:gap-3" role="group" aria-label="Att placera">
            {kvar.length ? (
              kvar.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setVald((v) => (v === i ? null : i))}
                  aria-pressed={vald === i}
                  aria-label={saker ? `Den ${s.namn[i]}a pärmen` : s.namn[i]}
                  className={`${saker ? 'sess-parm-knapp' : 'sess-bricka-knapp'} flex min-h-11 min-w-11 touch-manipulation flex-col items-center gap-1 p-0.5`}
                >
                  {saker ? <StorParm namn={s.namn[i]} hojd={60} /> : <NamnBricka i={i} init={init[i]} />}
                  {saker ? null : <span className="text-[11px] font-bold leading-[14px] text-ink-1 lg:text-[12px]">{s.namn[i]}</span>}
                </button>
              ))
            ) : (
              <span className="text-[12px] leading-4 text-[color:var(--sess-ink-3)]">{`${namn.titel} räknas inte som svar.`}</span>
            )}
          </div>
          <span className="ml-auto text-[11px] leading-4 text-[color:var(--sess-ink-3)] lg:hidden">Räknas inte som svar</span>
        </div>
      ) : null}
    </div>
  )
}

/* ---------------------------------------------------- Sanning och lögn */

export function SanningKladd({ namn }: { namn: string[] }) {
  const init = useMemo(() => initialer(namn), [namn])
  const [val, setVal] = useState<Record<number, 's' | 'l'>>({})
  const satt = (i: number, v: 's' | 'l') =>
    setVal((f) => {
      const ny = { ...f }
      if (f[i] === v) delete ny[i]
      else ny[i] = v
      return ny
    })
  return (
    <div className="sess-kladd px-4 pb-4 pt-3.5 lg:px-7 lg:pb-[22px] lg:pt-[18px]" data-kladd="sanning">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-sess-display text-[16px] font-bold leading-5 text-ink-1 lg:text-[18px] lg:leading-[22px]">Prova dig fram</p>
        <span className="text-[12px] leading-4 text-[color:var(--sess-ink-2)] lg:text-[13px] lg:leading-[18px]">Anta något och se om det går ihop. Det räknas inte som svar.</span>
      </div>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {namn.map((x, i) => (
          <li key={x} className="flex min-h-[52px] items-center gap-2.5 rounded-[14px] border-2 border-[color:var(--sess-kant)] bg-papper px-2.5 py-1.5 lg:gap-3 lg:px-3">
            <span className="sess-plupp !h-7 !w-7 !rounded-[9px] !text-[13px]" style={{ background: personFarg(i) }} aria-hidden="true">
              {init[i]}
            </span>
            <span className="min-w-0 flex-1 truncate text-[14px] font-semibold leading-5 text-ink-1 lg:text-[15px]">{x}</span>
            <span className="flex flex-shrink-0 gap-1.5" role="group" aria-label={x}>
              <button type="button" className="sess-val touch-manipulation" aria-pressed={val[i] === 's'} onClick={() => satt(i, 's')}>
                Sanningssägare
              </button>
              <button type="button" className="sess-val touch-manipulation" aria-pressed={val[i] === 'l'} onClick={() => satt(i, 'l')}>
                Lögnare
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------ Kryssrutan */

type TabellStruktur = Extract<DeduktivStruktur, { slag: 'tabell' }>

const MALL_NAMN: Record<string, string> = { avd: 'ställe', bil: 'bil', roll: 'roll', lunch: 'lunch', stad: 'stad', kurs: 'kurs', dag: 'dag' }
const BILFARG: Record<string, string> = { grön: '#3E9E74', röd: '#D0533F', svart: '#26262C', vit: '#FFFFFF', blå: '#3B6FD1', gul: '#E8B93A', lila: '#8E5BC9' }

const stor = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)
/** "i kundtjänst" blir "Kundtjänst" i kolumnens rubrik. */
export const vardeNamn = (v: string) => stor(v.replace(/^(i|på)\s+/i, ''))
export const mallNamn = (m: string) => MALL_NAMN[m] ?? m

const VOKAL = /[aeiouyåäöé]/i
/** Konsonantgrupper som kan inleda en svensk stavelse, längst först. */
const START = ['skr', 'spr', 'str', 'stj', 'skj', 'tj', 'sk', 'sp', 'st', 'sj', 'tr', 'pr', 'kr', 'gr', 'br', 'dr', 'fr', 'bl', 'pl', 'kl', 'gl', 'fl', 'sl', 'sm', 'sn', 'sv', 'kv']
/**
 * Mjuka bindestreck i långa ord, så att smala kolumner bryter "Recep-tionen"
 * och "Kund-tjänst" (skissen) mellan stavelser: i en konsonantgrupp mellan
 * två vokaler före den längsta slutdel som kan inleda en stavelse, annars
 * före den sista konsonanten. "ck" delas aldrig.
 */
export function avstava(ord: string): string {
  if (ord.length < 9) return ord
  let ut = ''
  let i = 0
  while (i < ord.length) {
    ut += ord[i]
    if (VOKAL.test(ord[i]) && i >= 1) {
      let j = i + 1
      while (j < ord.length && !VOKAL.test(ord[j])) j++
      const grupp = ord.slice(i + 1, j).toLowerCase()
      if (j < ord.length && grupp.length >= 2 && ord.length - j >= 2) {
        let start = grupp.length - 1
        for (const s of START) {
          if (grupp.endsWith(s) && grupp.length > s.length) {
            start = grupp.length - s.length
            break
          }
        }
        if (grupp[start - 1] === 'c' && grupp[start] === 'k') start = Math.min(grupp.length - 1, start + 1)
        const delning = i + 1 + start
        // Minst tre tecken före bindestrecket.
        if (delning >= 3) {
          ut += ord.slice(i + 1, delning) + '­' + ord.slice(delning, j)
          i = j
          continue
        }
      }
    }
    i++
  }
  return ut
}

type Varde = 'kryss' | 'bock'

function Ruta({ varde, onTryck, etikett }: { varde: Varde | undefined; onTryck: () => void; etikett: string }) {
  return (
    <button type="button" className="sess-kryssruta touch-manipulation" data-varde={varde ?? ''} onClick={onTryck} aria-label={`${etikett}: ${varde === 'bock' ? 'bock' : varde === 'kryss' ? 'kryss' : 'tom'}`}>
      {varde === 'kryss' ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      ) : varde === 'bock' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 12.5l5 5L20 6.5" />
        </svg>
      ) : null}
    </button>
  )
}

function Kolumnrubrik({ v, mall }: { v: string; mall: string }) {
  const farg = mall === 'bil' ? BILFARG[v.toLowerCase()] : undefined
  return (
    <span className="flex min-h-[40px] min-w-0 flex-col items-center justify-end gap-1 text-center text-[11px] font-semibold leading-[13px] text-ink-1 [hyphens:manual]" lang="sv">
      {farg ? <i className="block h-3 w-3 rounded-[4px]" style={{ background: farg, boxShadow: farg === '#FFFFFF' ? 'inset 0 0 0 1.5px var(--sess-streck)' : undefined }} aria-hidden="true" /> : null}
      {avstava(vardeNamn(v))}
    </span>
  )
}

function Rutnat({
  rader,
  radEtikett,
  kolumner,
  mall,
  rubrik,
  nyckel,
  varden,
  tryck,
  className = '',
}: {
  rader: string[]
  radEtikett: (i: number) => React.ReactNode
  kolumner: string[]
  mall: string
  rubrik: string
  nyckel: (r: number, k: number) => string
  varden: Record<string, Varde>
  tryck: (k: string) => void
  className?: string
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="mb-1.5 border-b-2 border-[color:var(--sess-kant)] pb-1 text-center text-[11px] font-bold uppercase leading-4 tracking-[.08em] text-[color:var(--sess-brade-2)]">{rubrik}</p>
      <div className="grid items-end gap-1.5" style={{ gridTemplateColumns: `var(--etikett, minmax(72px, auto)) repeat(${kolumner.length}, minmax(0, 1fr))` }}>
        <span />
        {kolumner.map((k) => (
          <Kolumnrubrik key={k} v={k} mall={mall} />
        ))}
        {rader.map((r, ri) => (
          <Fragment key={r}>
            <span className="flex items-center gap-1.5 self-center text-[13px] font-semibold leading-4 text-ink-1 lg:text-[14px]">{radEtikett(ri)}</span>
            {kolumner.map((k, ki) => {
              const n = nyckel(ri, ki)
              return <Ruta key={k} varde={varden[n]} onTryck={() => tryck(n)} etikett={`${r}, ${vardeNamn(k)}`} />
            })}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

export function TabellKladd({ s }: { s: TabellStruktur }) {
  const init = useMemo(() => initialer(s.namn), [s.namn])
  const [varden, setVarden] = useState<Record<string, Varde>>({})
  const [flik, setFlik] = useState<'pa' | 'pb' | 'ab'>('pa')
  const tryck = (k: string) =>
    setVarden((f) => {
      const ny = { ...f }
      if (!f[k]) ny[k] = 'kryss'
      else if (f[k] === 'kryss') ny[k] = 'bock'
      else delete ny[k]
      return ny
    })
  const { A, B } = s.kategorier
  const person = (i: number) => (
    <>
      <span className="sess-plupp" style={{ background: personFarg(i) }} aria-hidden="true">
        {init[i]}
      </span>
      {s.namn[i]}
    </>
  )
  const flikar: { id: 'pa' | 'pb' | 'ab'; text: string }[] = [
    { id: 'pa', text: `Vem och ${mallNamn(A.mall)}` },
    { id: 'pb', text: `Vem och ${mallNamn(B.mall)}` },
    { id: 'ab', text: `${stor(mallNamn(A.mall))} och ${mallNamn(B.mall)}` },
  ]
  return (
    <div className="sess-kladd px-3.5 pb-4 pt-3.5 lg:px-7 lg:pb-[22px] lg:pt-[18px]" data-kladd="tabell">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 max-lg:hidden">
        <p className="font-sess-display text-[18px] font-bold leading-[22px] text-ink-1">Kryssrutan</p>
        <span className="text-[13px] leading-[18px] text-[color:var(--sess-ink-2)]">Tryck en gång för kryss, två för bock. Rutan räknas inte som svar.</span>
      </div>
      <div role="tablist" aria-label="Kryssrutan" className="mb-3 grid grid-cols-3 gap-1 rounded-[13px] bg-[color:var(--sess-bit)] p-1 lg:hidden">
        {flikar.map((f) => (
          <button key={f.id} type="button" role="tab" aria-selected={flik === f.id} className="sess-flik touch-manipulation" onClick={() => setFlik(f.id)}>
            {f.text}
          </button>
        ))}
      </div>
      <div className="lg:flex lg:gap-6">
        <Rutnat
          className={`lg:flex-[1.15] ${flik === 'pa' ? '' : 'max-lg:hidden'}`}
          rader={s.namn}
          radEtikett={person}
          kolumner={A.varden}
          mall={A.mall}
          rubrik={mallNamn(A.mall)}
          nyckel={(r, k) => `p${r}:A${k}`}
          varden={varden}
          tryck={tryck}
        />
        <Rutnat
          className={`lg:flex-1 lg:[--etikett:0px] ${flik === 'pb' ? '' : 'max-lg:hidden'}`}
          rader={s.namn}
          radEtikett={(i) => <span className="lg:sr-only">{person(i)}</span>}
          kolumner={B.varden}
          mall={B.mall}
          rubrik={mallNamn(B.mall)}
          nyckel={(r, k) => `p${r}:B${k}`}
          varden={varden}
          tryck={tryck}
        />
        <Rutnat
          className={`lg:hidden ${flik === 'ab' ? '' : 'hidden'}`}
          rader={A.varden}
          radEtikett={(i) => vardeNamn(A.varden[i])}
          kolumner={B.varden}
          mall={B.mall}
          rubrik={`${mallNamn(A.mall)} och ${mallNamn(B.mall)}`}
          nyckel={(r, k) => `a${r}:B${k}`}
          varden={varden}
          tryck={tryck}
        />
      </div>
      <p className="mt-2.5 text-center text-[12px] leading-4 text-[color:var(--sess-ink-2)] lg:hidden">Ett tryck ger kryss, två ger bock. Räknas inte som svar.</p>
    </div>
  )
}

/* ---------------------------------------------------------------- Kedjan */

type Led = { fran: string; till: string; nr: number; slag: 'pil' | 'bruten' | 'prickad' }

/** Kedjans länkar ur villkorens form och ledens namn. Null när namnen saknas. */
export function kedjansLankar(s: DeduktivStruktur, ln: DeduktivLedNamn | null | undefined): { lankar: Led[]; neg: Set<string> } | null {
  const neg = new Set<string>()
  if (s.slag === 'kvantor') {
    const t = ln?.termnamn
    if (!t) return null
    const namn = (x: string) => t[x] ?? stor(x)
    const lankar: Led[] = []
    s.villkor.forEach((rad, i) => {
      const l = rad[0]
      if (!l) return
      const nr = i + 1
      if (l.typ === 'ar' || l.typ === 'ar_inte') lankar.push({ fran: stor(l.i ?? ''), till: namn(l.x), nr, slag: l.typ === 'ar' ? 'pil' : 'bruten' })
      else if (l.y) lankar.push({ fran: namn(l.x), till: namn(l.y), nr, slag: l.typ === 'alla' ? 'pil' : l.typ === 'inga' ? 'bruten' : 'prickad' })
    })
    return lankar.length ? { lankar, neg } : null
  }
  if (s.slag === 'om_sa') {
    const a = ln?.atomnamn
    if (!a) return null
    const namn = (x: { a: number; neg: boolean }) => {
      const n = a[x.a] ?? ''
      const k = `${x.neg ? '!' : ''}${n}`
      if (x.neg) neg.add(k)
      return k
    }
    const lankar: Led[] = []
    s.villkor.forEach((v, i) => {
      if (v.typ === 'om') lankar.push({ fran: namn(v.p), till: namn(v.q), nr: i + 1, slag: 'pil' })
    })
    return lankar.length ? { lankar, neg } : null
  }
  return null
}

/** Länkarna som segment: en ny rad när kedjan inte hänger ihop med förra länken. */
export function kedjansSegment(lankar: Led[]): { start: string; steg: { led: Led; till: string }[] }[] {
  const seg: { start: string; steg: { led: Led; till: string }[] }[] = []
  for (const l of lankar) {
    const sista = seg[seg.length - 1]
    const svans = sista ? (sista.steg.length ? sista.steg[sista.steg.length - 1].till : sista.start) : null
    if (sista && svans === l.fran) sista.steg.push({ led: l, till: l.till })
    else if (sista && l.slag !== 'pil' && svans === l.till) sista.steg.push({ led: l, till: l.fran })
    else seg.push({ start: l.fran, steg: [{ led: l, till: l.till }] })
  }
  return seg
}

function Lank({ led }: { led: Led }) {
  return (
    <span className="mx-0.5 inline-flex flex-shrink-0 flex-col items-center gap-0.5" aria-label={`villkor ${led.nr}${led.slag === 'bruten' ? ', bryter kedjan' : ''}`}>
      <span className="sess-domsteg-nr !h-[18px] !min-w-[18px] !px-1 !text-[10px]">{led.nr}</span>
      <svg width="30" height="12" viewBox="0 0 30 12" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {led.slag === 'bruten' ? (
          <>
            <path d="M2 6h26" stroke="var(--sess-fel)" />
            <path d="M15 1v10" stroke="var(--sess-fel)" />
          </>
        ) : (
          <path d="M2 6h24M21 1.5l5 4.5-5 4.5" stroke="var(--sess-brade)" strokeDasharray={led.slag === 'prickad' ? '2 4' : undefined} />
        )}
      </svg>
    </span>
  )
}

function Nod({ id, neg }: { id: string; neg: Set<string> }) {
  const ar = neg.has(id)
  const text = ar ? id.slice(1) : id
  return (
    <span className="sess-led" style={ar ? { borderStyle: 'dashed' } : undefined}>
      {ar ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--sess-fel)" strokeWidth="3.4" strokeLinecap="round" aria-label="inte" className="mr-1.5 flex-shrink-0">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      ) : null}
      {text}
    </span>
  )
}

/** Lösningens slutsats: den sista meningen som börjar med "Alltså". */
export function slutsatsUr(l: DeduktivLosning | null): string | null {
  if (!l) return null
  for (let i = l.steg.length - 1; i >= 0; i--) {
    const m = /Alltså[^.]*\./.exec(l.steg[i].foljd)
    if (m) return m[0]
  }
  return null
}

export function Kedjan({ s, ledNamn, losning }: { s: DeduktivStruktur; ledNamn: DeduktivLedNamn | null | undefined; losning: DeduktivLosning | null }) {
  const k = kedjansLankar(s, ledNamn)
  if (!k) return null
  const segment = kedjansSegment(k.lankar)
  const slut = slutsatsUr(losning)
  return (
    <div className="sess-kladd sess-kedja-in px-4 pb-4 pt-3.5 lg:px-7 lg:pb-[22px] lg:pt-[18px]" data-kedjan>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-sess-display text-[16px] font-bold leading-5 text-ink-1 lg:text-[18px] lg:leading-[22px]">Kedjan</p>
        <span className="text-[12px] leading-4 text-[color:var(--sess-ink-2)] lg:text-[13px] lg:leading-[18px]">Så hänger villkoren ihop. Siffran visar vilket villkor som bär länken.</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {segment.map((sg, i) => (
          <div key={i} className="flex flex-wrap items-end gap-y-2">
            <Nod id={sg.start} neg={k.neg} />
            {sg.steg.map((st, j) => (
              <span key={j} className="inline-flex items-end">
                <Lank led={st.led} />
                <Nod id={st.till} neg={k.neg} />
              </span>
            ))}
          </div>
        ))}
      </div>
      {slut ? (
        <p className="sess-slutsats mt-3">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" className="flex-shrink-0">
            <circle cx="12" cy="12" r="11" fill="var(--sess-ratt)" />
            <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="var(--papper)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {slut}
        </p>
      ) : null}
    </div>
  )
}
