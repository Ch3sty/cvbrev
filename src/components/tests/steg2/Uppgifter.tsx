'use client'

/**
 * Uppgifterna i testplanens steg 2 (skiss-tester-steg2-2026-11-09, flikarna
 * Talserier och Spatial förmåga): frågan och alternativen under testet, och
 * genomgången efter svaret. Samma delar används i nivåtestet, passet och
 * I-prov-provet.
 *
 * Talserier: raden som rutor med tabulära siffror (15 px på 360, 17 px från
 * 400), luckan som matrisens lucka (streckad, frågetecken), efter svaret
 * kopparram med talet. Fem alternativ som rader, sorterade som en tallinje.
 * I genomgången ritas den dolda regeln som små bågar mellan rutorna;
 * varvade serier får ton-blått och koppar på varannan ruta (skissens beslut 6).
 *
 * Spatial förmåga: två gånger två för alla tre formerna (beslut 2).
 * Referensen står i samma rutstorlek som alternativen och frågan till höger
 * om den. Pappersvikningens sekvens som tre små rutor med pil mellan.
 * Figurerna ritas av motorns ritare (src/lib/spatialV1/ritare.tsx) i
 * .matrisyta, så att färgrollerna följer ljust och mörkt läge.
 */

import type { ReactNode } from 'react'
import { SpatialSvg } from '@/lib/spatialV1/ritare'
import type { GenomgangSpatial, KubFigur, SpatialFigur, VisadSpatial } from '@/lib/spatialV1/types'
import type { GenomgangTalserie, TalserieBage, VisadTalserie } from '@/lib/talserierV1/types'
import { visaTal } from '@/lib/talserierV1/layout'
import type { Steg2Kind } from '@/app/dashboard/tester/testConfig'
import { FORM_NAMN } from '@/lib/tester/steg2/namn'

export const BOKSTAV = ['A', 'B', 'C', 'D', 'E', 'F']

/** Alternativens kant: rätt i koppar, valt i bläck, övriga dämpade efter svaret. */
function altKlass(arVald: boolean, arRatt: boolean, avslojad: boolean) {
  const kant = arRatt
    ? arVald
      ? 'border-koppar shadow-[inset_0_0_0_1px_var(--koppar),0_0_0_3px_var(--koppar-mjuk)]'
      : 'border-koppar shadow-[inset_0_0_0_1px_var(--koppar)]'
    : arVald
      ? 'border-ink-1 shadow-[inset_0_0_0_1px_var(--ink-1)]'
      : 'border-kant'
  const dim = avslojad && !arVald && !arRatt ? 'opacity-[.38]' : ''
  return `${kant} ${dim} ${avslojad ? 'cursor-default' : 'active:bg-papper-2'}`
}

/* ================================================================ Talserier */

function talparText(o: number[]): string {
  return o.map(visaTal).join(' och ')
}

/** Raden som rutor. `svar` fyller luckorna efter svaret; `bagar` ritar regeln (genomgången). */
export function TalserieRad({
  visade,
  luckor,
  svar = null,
  bagar = null,
}: {
  visade: number[]
  luckor: 1 | 2
  svar?: number[] | null
  bagar?: TalserieBage[] | null
}) {
  const n = visade.length + luckor
  const serieFor = new Map<number, 0 | 1>()
  for (const b of bagar ?? []) {
    if (b.serie === undefined) continue
    for (const i of [...b.fran, b.till]) serieFor.set(i, b.serie)
  }
  const varvad = serieFor.size > 0
  const ruta = (i: number): ReactNode => {
    const lucka = i >= visade.length
    const tal = lucka ? svar?.[i - visade.length] ?? null : visade[i]
    const serie = serieFor.get(i)
    const farg =
      varvad && serie === 0
        ? 'border-ton-ink text-ton-ink'
        : varvad && serie === 1
          ? 'border-koppar text-koppar-ink'
          : lucka && tal !== null
            ? 'border-koppar text-koppar-ink'
            : 'border-kant text-ink-1'
    const yta = lucka && tal !== null ? 'bg-koppar-mjuk' : lucka ? 'bg-papper-2' : 'bg-papper'
    return (
      <span
        key={i}
        className={`flex h-11 min-w-0 items-center justify-center rounded-lg border ${lucka && tal === null ? 'border-dashed border-kant-stark text-ink-3' : farg} ${yta} text-[15px] font-bold tabular-nums tracking-[-.01em] min-[400px]:text-[17px]`}
        aria-label={lucka ? (tal === null ? 'lucka' : `lucka, ${visaTal(tal)}`) : visaTal(visade[i])}
      >
        {tal === null ? '?' : visaTal(tal)}
      </span>
    )
  }
  return (
    <div className="relative" data-talserie-rad>
      <div className="grid gap-[3px] min-[400px]:gap-1.5" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }} role="list" aria-label="Talraden">
        {Array.from({ length: n }, (_, i) => ruta(i))}
      </div>
      {bagar && bagar.length ? (
        <div className="relative mt-1 h-5" aria-hidden="true">
          {bagar.map((b, k) => {
            const fran = b.fran[b.fran.length - 1]
            const mitt = ((fran + b.till + 1) / 2 / n) * 100
            const farg = b.serie === 1 ? 'text-koppar-ink' : b.serie === 0 ? 'text-ton-ink' : 'text-ink-3'
            return (
              <span
                key={k}
                className={`absolute top-0 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold leading-4 tabular-nums ${farg} ${b.serie === 1 ? 'top-2.5' : ''}`}
                style={{ left: `${mitt}%` }}
              >
                {b.text}
              </span>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export function TalserieAlternativ({
  options,
  valt,
  ratt = null,
  onValj,
  disabled,
}: {
  options: number[][]
  valt: number | null
  ratt?: number | null
  onValj?: (i: number) => void
  disabled?: boolean
}) {
  const avslojad = ratt != null
  return (
    <div role="radiogroup" aria-label="Ditt svar" className="flex flex-col gap-2" data-steg2-alternativ>
      {options.map((o, i) => {
        const arVald = valt === i
        const arRatt = avslojad && ratt === i
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={arVald}
            aria-label={`${BOKSTAV[i]}. ${talparText(o)}${arVald ? ', ditt svar' : ''}${arRatt ? ', rätt svar' : ''}`}
            disabled={disabled || avslojad}
            onClick={() => onValj?.(i)}
            className={`relative flex min-h-[46px] touch-manipulation items-center gap-3 rounded-xl border bg-papper px-3.5 py-2 text-left text-[16px] leading-5 text-ink-1 transition-[border-color,opacity] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-koppar-ink motion-reduce:transition-none ${altKlass(arVald, arRatt, avslojad)}`}
          >
            <span className={`w-4 shrink-0 text-[12px] font-semibold ${arRatt ? 'text-koppar-ink' : arVald ? 'text-ink-1' : 'text-ink-3'}`} aria-hidden="true">
              {BOKSTAV[i]}
            </span>
            <span className="min-w-0 flex-1 font-medium tabular-nums">{talparText(o)}</span>
            {arRatt ? <span className="absolute right-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-koppar" aria-hidden="true" /> : null}
          </button>
        )
      })}
    </div>
  )
}

export function TalserieUppgift({
  u,
  valt,
  ratt = null,
  onValj,
  disabled,
  genomgang = null,
}: {
  u: VisadTalserie
  valt: number | null
  ratt?: number | null
  onValj?: (i: number) => void
  disabled?: boolean
  genomgang?: GenomgangTalserie | null
}) {
  const svar = ratt != null ? u.options[ratt] : null
  return (
    <div className="flex flex-col gap-3" data-steg2-uppgift="talserie">
      <div className="rounded-2xl border border-kant bg-papper px-3 pb-3 pt-3">
        <p className="mb-2.5 text-ey uppercase text-ink-3">
          {genomgang ? (genomgang.bagar.some((b) => b.serie !== undefined) ? 'Regeln: två serier om vartannat' : 'Regeln') : u.luckor === 2 ? 'Vilka två tal kommer härnäst, i ordning?' : 'Vilket tal kommer härnäst?'}
        </p>
        <TalserieRad visade={u.visade} luckor={u.luckor} svar={svar} bagar={genomgang?.bagar ?? null} />
      </div>
      {genomgang ? null : (
        <>
          <TalserieAlternativ options={u.options} valt={valt} ratt={ratt} onValj={onValj} disabled={disabled} />
          {u.luckor === 2 ? <p className="px-0.5 text-xs leading-4 text-ink-3">Första talet är den vänstra luckan, andra talet den högra.</p> : null}
        </>
      )}
    </div>
  )
}

/* ========================================================== Spatial förmåga */

function Figur({ fig, className = '' }: { fig: SpatialFigur; className?: string }) {
  return <SpatialSvg fig={fig} className={`block h-full w-full ${className}`} />
}

const FORM_ETIKETT: Record<string, string> = { A: 'Figuren', C: 'Tärningen' }

function formNamn(u: Pick<VisadSpatial, 'form' | 'klipp'>) {
  return u.form === 'B' && u.klipp ? FORM_NAMN.Bklipp : FORM_NAMN[u.form]
}

const STEG_ETIKETT = ['Vik', 'Vik', 'Vik', 'Stansa']

export function SpatialAlternativ({
  options,
  valt,
  ratt = null,
  onValj,
  disabled,
  liten = false,
}: {
  options: SpatialFigur[]
  valt: number | null
  ratt?: number | null
  onValj?: (i: number) => void
  disabled?: boolean
  /** Genomgången: fyra i rad, mindre. */
  liten?: boolean
}) {
  const avslojad = ratt != null
  return (
    <div role="radiogroup" aria-label="Svarsalternativ" className={`matrisyta grid gap-2.5 ${liten ? 'grid-cols-4 gap-2' : 'grid-cols-2 lg:grid-cols-4'}`} data-steg2-alternativ>
      {options.map((o, i) => {
        const arVald = valt === i
        const arRatt = avslojad && ratt === i
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={arVald}
            aria-label={`Alternativ ${BOKSTAV[i]}${arVald ? ', ditt svar' : ''}${arRatt ? ', rätt svar' : ''}`}
            disabled={disabled || avslojad}
            onClick={() => onValj?.(i)}
            className={`relative [aspect-ratio:1/1] touch-manipulation rounded-xl border bg-papper transition-[border-color,opacity] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-koppar motion-reduce:transition-none ${altKlass(arVald, arRatt, avslojad)}`}
          >
            <span aria-hidden="true" className={`absolute left-2 top-1.5 z-10 text-[11px] font-semibold ${arRatt ? 'text-koppar-ink' : arVald ? 'text-ink-1' : 'text-ink-3'}`}>
              {BOKSTAV[i]}
            </span>
            {arRatt ? <span aria-hidden="true" className="absolute right-2 top-2 z-10 h-2.5 w-2.5 rounded-full bg-koppar" /> : null}
            <span className={`absolute ${liten ? 'inset-1' : 'inset-3'}`}>
              <Figur fig={o} />
            </span>
          </button>
        )
      })}
    </div>
  )
}

/** Pappersvikningens sekvens: tre eller fyra små rutor med pil mellan (skissen). */
function Sekvens({ figurer, etiketter }: { figurer: SpatialFigur[]; etiketter?: string[] }) {
  return (
    <div className="matrisyta flex items-stretch gap-1 lg:max-w-[400px]" data-spatial-sekvens>
      {figurer.map((f, i) => (
        <div key={i} className="contents">
          {i > 0 ? (
            <span aria-hidden="true" className="flex w-3 shrink-0 items-center justify-center text-ink-3">
              <svg viewBox="0 0 10 10" width="10" height="10"><path d="M3 2l4 3-4 3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col items-center rounded-xl border border-kant bg-papper-2 px-1 pb-1 pt-1">
            <span className="block [aspect-ratio:1/1] w-full">
              <Figur fig={f} />
            </span>
            <span className="text-[11px] font-semibold leading-4 text-ink-3">
              {etiketter?.[i] ?? (i === figurer.length - 1 ? STEG_ETIKETT[3] : STEG_ETIKETT[i])}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function SpatialUppgift({
  u,
  valt,
  ratt = null,
  onValj,
  disabled,
}: {
  u: VisadSpatial
  valt: number | null
  ratt?: number | null
  onValj?: (i: number) => void
  disabled?: boolean
}) {
  const fraga = (
    <div className="min-w-0">
      <p className="text-ey uppercase text-ink-3">{formNamn(u)}</p>
      <h2 className="mt-1 font-display text-[19px] font-bold leading-[24px] tracking-[-.015em] text-ink-1 min-[400px]:text-[20px]">{u.fraga}</h2>
      {u.form === 'A' ? <p className="mt-1.5 text-[13px] leading-[18px] text-ink-3">Spegelbilder räknas inte. Ett av fyra.</p> : null}
    </div>
  )
  return (
    <div className="flex flex-col gap-3" data-steg2-uppgift="spatial" data-form={u.form}>
      {u.form === 'B' && u.sekvens ? (
        <>
          <Sekvens figurer={u.sekvens} />
          {fraga}
        </>
      ) : u.referens ? (
        <div className="grid grid-cols-2 items-center gap-2.5">
          <div className="matrisyta relative [aspect-ratio:1/1] rounded-xl border border-kant bg-papper-2" data-spatial-referens>
            <span className="absolute left-2 top-1.5 z-10 text-[11px] font-semibold uppercase tracking-[.04em] text-ink-3">{FORM_ETIKETT[u.form]}</span>
            <span className="absolute inset-3">
              <Figur fig={u.referens} />
            </span>
          </div>
          {fraga}
        </div>
      ) : (
        fraga
      )}
      <SpatialAlternativ options={u.options} valt={valt} ratt={ratt} onValj={onValj} disabled={disabled} />
    </div>
  )
}

/** Genomgången av en spatial uppgift (skissen, flikens tre genomgångar). */
export function SpatialGenomgangVy({ g, valt }: { g: GenomgangSpatial; valt: number | null }) {
  const facit = g.options[g.rattVisat]
  let bild: ReactNode
  if (g.form === 'B' && g.uppvikning?.length) {
    bild = <Sekvens figurer={g.uppvikning} etiketter={g.uppvikning.map((_, i, a) => (i === a.length - 1 ? 'Uppvikt' : 'Vik upp'))} />
  } else if (g.referens) {
    const markera = g.form === 'C' && valt !== null && valt !== g.rattVisat ? g.avslojande?.[valt] ?? [] : []
    const ref: SpatialFigur = g.referens.kind === 'kub' ? ({ ...(g.referens as KubFigur), markera } as KubFigur) : g.referens
    bild = (
      <div className="matrisyta flex items-center gap-2">
        <div className="relative [aspect-ratio:1/1] flex-1 rounded-xl border border-kant bg-papper-2">
          <span className="absolute left-2 top-1.5 z-10 text-[11px] font-semibold uppercase tracking-[.04em] text-ink-3">{FORM_ETIKETT[g.form]}</span>
          <span className="absolute inset-3">
            <Figur fig={ref} />
          </span>
        </div>
        <span aria-hidden="true" className="text-ink-3">
          <svg viewBox="0 0 16 16" width="16" height="16"><path d="M3 8h9M8.5 4.5L12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <div className="relative [aspect-ratio:1/1] flex-1 rounded-xl border border-koppar bg-papper shadow-[inset_0_0_0_1px_var(--koppar)]">
          <span className="absolute left-2 top-1.5 z-10 text-[11px] font-semibold text-koppar-ink">{BOKSTAV[g.rattVisat]}</span>
          <span className="absolute inset-3">
            <Figur fig={facit} />
          </span>
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3" data-steg2-genomgang="spatial">
      {bild}
      <Facitkort ratt={g.rattVisat} forklaring={g.forklaring} valt={valt} misstag={valt !== null && valt !== g.rattVisat ? g.misstag[valt] || null : null} />
      <SpatialAlternativ options={g.options} valt={valt} ratt={g.rattVisat} disabled liten />
    </div>
  )
}

/* ================================================================ Ordförråd */

/** Uppgiften som ordförrådets motor visar (ordforradV1 VisadOrd). */
export interface OrdUppgiftData {
  id: string
  typ: 'synonym' | 'antonym'
  ord: string
  options: string[]
}
/** Genomgången (ordforradV1 GenomgangOrd). */
export interface OrdGenomgangData extends OrdUppgiftData {
  rattVisat: number
  misstag: string[]
  facit_betyder: string
  exempel: string
  arMotsats: boolean[]
}

/** Etiketten byter färg och tecken mellan synonym och motsatsord (skissens beslut 7). */
function OrdEtikett({ typ }: { typ: 'synonym' | 'antonym' }) {
  const syn = typ === 'synonym'
  return (
    <p className={`inline-flex items-center gap-1.5 text-ey uppercase ${syn ? 'text-ton-ink' : 'text-[color:var(--motsats)]'}`} data-ord-typ={typ}>
      <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
        {syn ? (
          <g fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="7.5" cy="10" r="5" /><circle cx="12.5" cy="10" r="5" /></g>
        ) : (
          <path d="M8 10H2.5M5 7l-3 3 3 3M12 10h5.5M15 7l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
      {syn ? 'Synonym' : 'Motsatsord'}
    </p>
  )
}

export function OrdUppgift({ u, valt, ratt = null, onValj, disabled }: { u: OrdUppgiftData; valt: number | null; ratt?: number | null; onValj?: (i: number) => void; disabled?: boolean }) {
  const avslojad = ratt != null
  return (
    <div className="flex flex-col gap-3" data-steg2-uppgift="ordforrad">
      <div className="rounded-2xl border border-kant bg-papper px-4 py-3.5">
        <OrdEtikett typ={u.typ} />
        <p className="mt-1.5 break-words font-display text-[28px] font-bold uppercase leading-[34px] tracking-[.02em] text-ink-1">{u.ord}</p>
        <p className="mt-1 text-[13px] leading-[18px] text-ink-3">{u.typ === 'synonym' ? 'Vilket ord betyder ungefär detsamma?' : 'Vilket ord betyder motsatsen?'}</p>
      </div>
      <div role="radiogroup" aria-label="Ditt svar" className="flex flex-col gap-2" data-steg2-alternativ>
        {u.options.map((o, i) => {
          const arVald = valt === i
          const arRatt = avslojad && ratt === i
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={arVald}
              aria-label={`${BOKSTAV[i]}. ${o}${arVald ? ', ditt svar' : ''}${arRatt ? ', rätt svar' : ''}`}
              disabled={disabled || avslojad}
              onClick={() => onValj?.(i)}
              className={`relative flex min-h-[46px] touch-manipulation items-center gap-3 rounded-xl border bg-papper px-3.5 py-2 text-left text-[17px] leading-5 text-ink-1 transition-[border-color,opacity] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-koppar-ink ${altKlass(arVald, arRatt, avslojad)}`}
            >
              <span className={`w-4 shrink-0 text-[12px] font-semibold ${arRatt ? 'text-koppar-ink' : arVald ? 'text-ink-1' : 'text-ink-3'}`} aria-hidden="true">{BOKSTAV[i]}</span>
              <span className="min-w-0 flex-1">{o}</span>
              {arRatt ? <span className="absolute right-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-koppar" aria-hidden="true" /> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function OrdGenomgangVy({ g, valt }: { g: OrdGenomgangData; valt: number | null }) {
  const misstag = valt !== null && valt !== g.rattVisat ? (g.arMotsats[valt] ? 'Det är motsatsen.' : g.misstag[valt] || null) : null
  return (
    <div className="flex flex-col gap-3" data-steg2-genomgang="ordforrad">
      <OrdUppgift u={g} valt={valt} ratt={g.rattVisat} disabled />
      <Facitkort ratt={g.rattVisat} forklaring={`${g.options[g.rattVisat]}: ${g.facit_betyder} ${g.exempel}`} valt={valt} misstag={misstag} />
    </div>
  )
}

/* =============================================================== Gemensamt */

/** "Rätt svar är C", förklaringen och misstaget för hennes val (skissen). */
export function Facitkort({
  ratt,
  forklaring,
  valt,
  misstag,
  vetInte = false,
}: {
  ratt: number
  forklaring: string
  valt: number | null
  misstag: string | null
  vetInte?: boolean
}) {
  return (
    <section className="rounded-2xl border border-kant bg-papper px-4 py-3.5" data-steg2-facit aria-live="polite">
      <h3 className="text-ey uppercase text-koppar-ink">Rätt svar är {BOKSTAV[ratt]}</h3>
      <p className="mt-1.5 text-[15px] leading-[22px] text-ink-1">{forklaring}</p>
      {valt !== null && valt !== ratt && misstag ? (
        <p className="mt-2 text-[15px] leading-[22px] text-ink-1">
          <b className="font-semibold">Du valde {BOKSTAV[valt]}.</b> {misstag}
        </p>
      ) : valt === null && vetInte ? (
        <p className="mt-2 text-[15px] leading-[22px] text-ink-2">Du valde Vet inte.</p>
      ) : null}
    </section>
  )
}

export function TalserieGenomgangVy({ g, valt }: { g: GenomgangTalserie; valt: number | null }) {
  return (
    <div className="flex flex-col gap-3" data-steg2-genomgang="talserie">
      <TalserieUppgift u={g} valt={valt} ratt={g.rattVisat} genomgang={g} />
      <Facitkort ratt={g.rattVisat} forklaring={g.regel} valt={valt} misstag={valt !== null && valt !== g.rattVisat ? g.misstag[valt] || null : null} />
      <TalserieAlternativ options={g.options} valt={valt} ratt={g.rattVisat} disabled />
    </div>
  )
}

/** En uppgift under testet, per typ. */
export function Steg2Uppgift(p: {
  kind: Steg2Kind
  u: unknown
  valt: number | null
  ratt?: number | null
  onValj?: (i: number) => void
  disabled?: boolean
}) {
  if (p.kind === 'talserie') return <TalserieUppgift u={p.u as VisadTalserie} valt={p.valt} ratt={p.ratt} onValj={p.onValj} disabled={p.disabled} />
  if (p.kind === 'spatial') return <SpatialUppgift u={p.u as VisadSpatial} valt={p.valt} ratt={p.ratt} onValj={p.onValj} disabled={p.disabled} />
  if (p.kind === 'ordforrad') return <OrdUppgift u={p.u as OrdUppgiftData} valt={p.valt} ratt={p.ratt} onValj={p.onValj} disabled={p.disabled} />
  return null
}

/** Genomgången av en uppgift, per typ. */
export function Steg2Genomgang({ kind, g, valt }: { kind: Steg2Kind; g: unknown; valt: number | null }) {
  if (kind === 'talserie') return <TalserieGenomgangVy g={g as GenomgangTalserie} valt={valt} />
  if (kind === 'spatial') return <SpatialGenomgangVy g={g as GenomgangSpatial} valt={valt} />
  if (kind === 'ordforrad') return <OrdGenomgangVy g={g as OrdGenomgangData} valt={valt} />
  return null
}

/** Antal alternativ, för tangentbordet. */
export function antalAlternativ(u: unknown): number {
  return ((u as { options?: unknown[] })?.options ?? []).length
}

/** Miniatyren i resultatets genomgångskort: talraden i små rutor, eller spatial förmågas referensfigur. */
export function Steg2Miniatyr({ g }: { g: unknown }) {
  const t = g as Partial<VisadTalserie> & Partial<VisadSpatial>
  if (Array.isArray(t.visade)) {
    const n = t.visade.length + (t.luckor ?? 1)
    return (
      <span className="grid [aspect-ratio:1/1] content-center gap-[2px]" style={{ gridTemplateColumns: `repeat(${Math.min(n, 4)}, minmax(0, 1fr))` }} aria-hidden="true">
        {Array.from({ length: n }, (_, i) => (
          <span
            key={i}
            className={`flex h-5 items-center justify-center rounded-[4px] border text-[9px] font-bold tabular-nums ${i >= t.visade!.length ? 'border-dashed border-koppar text-koppar-ink' : 'border-kant text-ink-1'}`}
          >
            {i >= t.visade!.length ? '?' : visaTal(t.visade![i])}
          </span>
        ))}
      </span>
    )
  }
  const ord = (g as Partial<OrdUppgiftData>).ord
  if (typeof ord === 'string') {
    return (
      <span className="flex [aspect-ratio:1/1] items-center justify-center overflow-hidden rounded-md border border-kant bg-papper-2 px-1" aria-hidden="true">
        <span className="truncate text-[11px] font-bold uppercase tracking-[.02em] text-ink-1">{ord}</span>
      </span>
    )
  }
  const fig = t.referens ?? t.sekvens?.[t.sekvens.length - 1] ?? (t.options?.[0] as SpatialFigur | undefined)
  return <span className="matrisyta block [aspect-ratio:1/1]">{fig ? <Figur fig={fig} /> : null}</span>
}
