'use client'

/**
 * Talserier, spatial förmåga och ordförråd i ramen (plan-testflode-2026-11-20
 * avsnitt 3.3 och 3.7, etapp 4). Samma uppgift i alla lägen: nivåtestet,
 * Träna, I-provet och genomgången. Innehållsformen är Smal (432 på dator).
 *
 *   Talserie   talraden i en ram överst (rutor 56 × 48, "?" i luckan,
 *              tabulära siffror i display), eyebrow-frågan, fem rader 52 px.
 *              Efter facit fylls luckan med rätt tal i bläck med 2 px positiv
 *              ram, och regelns bågar ritas under raden.
 *   Spatial    figurkortet överst: figuren 160 px till vänster, eyebrow och
 *              uppgiften till höger (pappersvikningens steg i en rad över
 *              texten). Fyra rutor 2 × 2 på mobil, fyra i rad på dator. Efter
 *              facit visas uppvikningen eller den rätta figuren under svaren.
 *   Ordförråd  ordkortet överst: etiketten (synonym eller motsatsord), ordet i
 *              versaler och hjälpraden, fyra till fem rader under.
 *
 * Figurerna ritas av motorns ritare inne i .matrisyta, så att färgrollerna
 * följer bläck och papper i mörkt läge. Alla rutor har aspect-ratio (CLS 0).
 * Ingen koppar i uppgiften: rätt är positiv, fel är fel, efter facit.
 */

import type { ReactNode } from 'react'
import { SpatialSvg } from '@/lib/spatialV1/ritare'
import type { GenomgangSpatial, KubFigur, SpatialFigur, VisadSpatial } from '@/lib/spatialV1/types'
import type { GenomgangTalserie, VisadTalserie } from '@/lib/talserierV1/types'
import { visaTal } from '@/lib/talserierV1/layout'
import type { Steg2Kind } from '@/app/dashboard/tester/testConfig'
import { FORM_NAMN, SPATIAL_TYP_NAMN } from '@/lib/tester/steg2/namn'
import { SvarRad, SvarRuta, tillstandFor } from '../Svarskort'
import type { RamFacit, RamUppgift, TypRitare, UppgiftProps } from '../typ'

/* ------------------------------------------------------------------ Typerna */

export interface OrdVisad {
  id?: string
  typ: 'synonym' | 'antonym'
  ord: string
  options: string[]
}

interface OrdGenomgang extends OrdVisad {
  rattVisat: number
  misstag: string[]
  facit_betyder: string
  exempel: string
  arMotsats: boolean[]
}

export type Steg2U =
  | (RamUppgift & { kind: 'talserie'; v: VisadTalserie })
  | (RamUppgift & { kind: 'spatial'; v: VisadSpatial })
  | (RamUppgift & { kind: 'ordforrad'; v: OrdVisad })

/** Motorns visade uppgift till ramens form. Nyckeln är uppgiftens id (nivåtest) eller passets nyckel. */
export function tillSteg2U(kind: Steg2Kind, raw: unknown, nyckel?: string): Steg2U {
  const r = raw as { id?: string; nyckel?: string }
  const n = nyckel ?? r.nyckel ?? r.id ?? ''
  if (kind === 'talserie') return { nyckel: n, kind, v: raw as VisadTalserie }
  if (kind === 'spatial') return { nyckel: n, kind, v: raw as VisadSpatial }
  return { nyckel: n, kind, v: raw as OrdVisad }
}

/**
 * Facit och förklaring ur motorns genomgång, samma i alla lägen: talserien
 * har en regel, spatial och ordförrådet förklarar i löptext. Misstaget är
 * det för hennes val. Genomgången följer med som data (bågarna, uppvikningen).
 */
export function steg2Facit(kind: Steg2Kind, g: unknown, valt: number | null, correct?: boolean): RamFacit {
  const gg = g as { rattVisat: number; misstag?: string[] }
  const ratt = typeof gg?.rattVisat === 'number' ? gg.rattVisat : -1
  const fel = valt !== null && valt !== ratt
  const korrekt = correct ?? (valt !== null && valt === ratt)
  if (kind === 'talserie') {
    const t = g as GenomgangTalserie
    return { ratt, correct: korrekt, regel: t.regel ?? null, misstag: fel ? t.misstag?.[valt!] || null : null, data: g }
  }
  if (kind === 'spatial') {
    const s = g as GenomgangSpatial
    return { ratt, correct: korrekt, regel: null, text: s.forklaring ?? null, misstag: fel ? s.misstag?.[valt!] || null : null, data: g }
  }
  const o = g as OrdGenomgang
  const misstag = fel ? (o.arMotsats?.[valt!] ? 'Det är motsatsen.' : o.misstag?.[valt!] || null) : null
  // "Därtill betyder utöver det. Exempel: ”Lönen är bra och dessutom …”"
  const ord = o.options?.[ratt] ?? ''
  const betyder = (o.facit_betyder ?? '').trim().replace(/[.]+$/, '')
  const exempel = (o.exempel ?? '').trim()
  const text = ord
    ? [`${ord.charAt(0).toUpperCase()}${ord.slice(1)}${betyder ? ` betyder ${betyder}` : ''}.`, exempel ? `Exempel: ”${exempel}”` : ''].filter(Boolean).join(' ')
    : null
  return { ratt, correct: korrekt, regel: null, text, misstag, data: g }
}

/* ---------------------------------------------------------------- Talserier */

const talparText = (o: number[]) => o.map(visaTal).join(' och ')

/** Siffrornas storlek efter talets längd, så att "−1024" ryms i rutan. */
function talStorlek(tecken: number, rutor: number): string {
  const tat = rutor >= 8
  if (tecken <= 2) return tat ? 'text-[19px] lg:text-[22px]' : 'text-[24px] leading-[28px] lg:text-[28px] lg:leading-[32px]'
  if (tecken === 3) return tat ? 'text-[16px] lg:text-[19px]' : 'text-[20px] lg:text-[24px]'
  return tat ? 'text-[13px] lg:text-[16px]' : 'text-[16px] lg:text-[19px]'
}

function Talrad({ u, facit, data }: { u: VisadTalserie; facit: number | null; data: GenomgangTalserie | null }) {
  const n = u.visade.length + u.luckor
  const svar = facit != null ? u.options[facit] ?? null : null
  const serieFor = new Map<number, 0 | 1>()
  for (const b of data?.bagar ?? []) {
    if (b.serie === undefined) continue
    for (const i of [...b.fran, b.till]) serieFor.set(i, b.serie)
  }
  return (
    <div className="mx-auto w-fit max-w-full">
      <div
        role="list"
        aria-label="Talraden"
        className="grid gap-1 min-[400px]:gap-1.5"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 56px))` }}
        data-talrad
      >
        {Array.from({ length: n }, (_, i) => {
          const lucka = i >= u.visade.length
          const tal = lucka ? svar?.[i - u.visade.length] ?? null : u.visade[i]
          const text = tal === null ? '?' : visaTal(tal)
          const serie = serieFor.get(i)
          const kant = lucka
            ? tal === null
              ? 'border-dashed border-kant-stark bg-papper-2 text-ink-3'
              : 'border-positiv bg-papper text-ink-1 shadow-[inset_0_0_0_1px_var(--positiv)]'
            : serie === 0
              ? 'border-ton-ink bg-papper text-ink-1'
              : 'border-kant bg-papper text-ink-1'
          return (
            <span
              key={i}
              role="listitem"
              aria-label={lucka ? (tal === null ? 'lucka' : `lucka, ${text}`) : text}
              className={`flex h-12 min-w-0 items-center justify-center rounded-xl border font-sess-display font-bold tabular-nums tracking-[-.02em] ${kant} ${talStorlek(text.length, n)}`}
              data-lucka={lucka ? (tal === null ? 'tom' : 'fylld') : undefined}
            >
              {text}
            </span>
          )
        })}
      </div>
      {data?.bagar?.length ? (
        <div className={`relative mt-1.5 ${data.bagar.some((b) => b.serie === 1) ? 'h-9' : 'h-5'}`} aria-hidden="true" data-talrad-bagar>
          {data.bagar.map((b, k) => {
            const fran = b.fran[b.fran.length - 1]
            const mitt = ((fran + b.till + 1) / 2 / n) * 100
            return (
              <span
                key={k}
                className={`absolute -translate-x-1/2 whitespace-nowrap text-[12px] font-semibold leading-4 tabular-nums ${b.serie === 1 ? 'top-[18px] text-ink-2' : b.serie === 0 ? 'top-0 text-ton-ink' : 'top-0 text-ink-2'}`}
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

function TalserieUppgift({ u, vald, facit, efterFel, onValj, last, facitData }: UppgiftProps<Extract<Steg2U, { kind: 'talserie' }>>) {
  const v = u.v
  const data = facit != null ? ((facitData as GenomgangTalserie | undefined) ?? null) : null
  return (
    <div className="flex flex-col gap-3.5 lg:gap-4" data-steg2-uppgift="talserie">
      <div className="rounded-xl border border-kant bg-papper px-3 pb-3.5 pt-3 lg:px-4 lg:pb-4" data-talrad-kort>
        <h2 tabIndex={-1} data-uppgift-rubrik className="mb-3 text-center text-[12px] font-semibold uppercase leading-4 tracking-[.06em] text-ink-3 outline-none">
          {v.luckor === 2 ? 'Vilka två tal kommer härnäst, i ordning?' : 'Vilket tal kommer härnäst?'}
        </h2>
        <Talrad u={v} facit={facit} data={data} />
      </div>
      <div role="radiogroup" aria-label="Svarsalternativ" className="flex flex-col gap-2" data-steg2-alternativ>
        {v.options.map((o, i) => (
          <SvarRad key={i} i={i} tillstand={tillstandFor(i, vald, facit)} efterFel={efterFel} disabled={last} onValj={onValj}>
            <span className="tabular-nums">{talparText(o)}</span>
          </SvarRad>
        ))}
      </div>
      {v.luckor === 2 && facit == null ? <p className="-mt-1 px-0.5 text-[13px] leading-[18px] text-ink-3">Första talet är den vänstra luckan, andra talet den högra.</p> : null}
    </div>
  )
}

/* ---------------------------------------------------------- Spatial förmåga */

const arKropp = (v: Pick<VisadSpatial, 'referens'>) => v.referens?.kind === 'kropp'
const arSpegling = (v: Pick<VisadSpatial, 'referens'>) => v.referens?.kind === 'brick' && !!(v.referens as { axlar?: unknown[] }).axlar?.length

function formNamn(v: Pick<VisadSpatial, 'form' | 'klipp' | 'referens'>): string {
  if (arKropp(v)) return SPATIAL_TYP_NAMN.kropp
  if (arSpegling(v)) return SPATIAL_TYP_NAMN.spegling
  if (v.form === 'A') return SPATIAL_TYP_NAMN.vriden
  if (v.form === 'C') return SPATIAL_TYP_NAMN.tarning
  return v.form === 'B' && v.klipp ? FORM_NAMN.Bklipp : FORM_NAMN[v.form]
}

function Figur({ fig }: { fig: SpatialFigur }) {
  return <SpatialSvg fig={fig} className="block h-full w-full" />
}

function Pil() {
  return (
    <span aria-hidden="true" className="flex w-3 flex-shrink-0 items-center justify-center text-ink-3">
      <svg viewBox="0 0 10 10" width="10" height="10">
        <path d="M3 2l4 3-4 3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

/** Pappersvikningens steg i en rad: små rutor med pil mellan och en etikett under. */
function Steg({ figurer, etiketter, sista, bred = false }: { figurer: SpatialFigur[]; etiketter: string[]; sista?: 'positiv'; bred?: boolean }) {
  return (
    <div className="matrisyta flex items-stretch gap-1" data-spatial-sekvens>
      {figurer.map((f, i) => (
        <div key={i} className="contents">
          {i > 0 ? <Pil /> : null}
          <div
            className={`flex min-w-0 flex-1 flex-col ${bred ? '' : 'max-w-[140px]'} items-center rounded-xl border bg-papper-2 px-1 pb-1 pt-1 ${
              sista && i === figurer.length - 1 ? 'border-positiv shadow-[inset_0_0_0_1px_var(--positiv)]' : 'border-kant'
            }`}
          >
            <span className="block w-full [aspect-ratio:1/1]">
              <Figur fig={f} />
            </span>
            <span className="text-[11px] font-semibold leading-4 text-ink-3">{etiketter[i]}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

const VIK_ETIKETT = ['Vik', 'Vik', 'Vik', 'Stansa']

function SpatialUppgift({ u, vald, facit, efterFel, onValj, last, facitData }: UppgiftProps<Extract<Steg2U, { kind: 'spatial' }>>) {
  const v = u.v
  const g = facit != null ? ((facitData as GenomgangSpatial | undefined) ?? null) : null
  const fraga = (
    <div className="min-w-0">
      <p className="text-[12px] font-semibold uppercase leading-4 tracking-[.06em] text-ink-3">{formNamn(v)}</p>
      <h2 tabIndex={-1} data-uppgift-rubrik className="mt-1 font-sess-display text-[19px] font-bold leading-[24px] tracking-[-.015em] text-ink-1 outline-none lg:text-[20px] lg:leading-[25px]">
        {v.fraga}
      </h2>
      {v.form === 'A' && !arSpegling(v) ? <p className="mt-1.5 text-[13px] leading-[18px] text-ink-2">Spegelbilder räknas inte.</p> : null}
      {v.form === 'D' ? <p className="mt-1.5 text-[13px] leading-[18px] text-ink-2">Hål och klipp syns bara där de går genom alla lager.</p> : null}
    </div>
  )
  // Form C efter fel: sidorna på referensen som avslöjar hennes val markeras.
  const markera = g && v.form === 'C' && vald !== null && vald !== facit ? g.avslojande?.[vald] ?? [] : []
  const referens = v.referens && v.referens.kind === 'kub' && markera.length ? ({ ...(v.referens as KubFigur), markera } as KubFigur) : v.referens

  let kort: ReactNode
  if ((v.form === 'B' || v.form === 'D') && v.sekvens?.length === 1) {
    // En enda vikning: steget till vänster som referensfiguren, uppgiften till höger.
    kort = (
      <div className="flex items-center gap-3.5">
        <div className="w-[132px] flex-shrink-0 min-[400px]:w-[148px] lg:w-[160px]">
          <Steg figurer={v.sekvens} etiketter={[v.form === 'D' ? 'Vik 1' : VIK_ETIKETT[3]]} bred />
        </div>
        {fraga}
      </div>
    )
  } else if ((v.form === 'B' || v.form === 'D') && v.sekvens) {
    const etiketter = v.form === 'D' ? v.sekvens.map((_, i) => `Vik ${i + 1}`) : v.sekvens.map((_, i, a) => (i === a.length - 1 ? VIK_ETIKETT[3] : VIK_ETIKETT[i]))
    kort = (
      <div className="flex flex-col gap-3">
        <Steg figurer={v.sekvens} etiketter={etiketter} />
        {fraga}
      </div>
    )
  } else if (referens) {
    kort = (
      <div className="flex items-center gap-3.5">
        <div className="matrisyta relative w-[132px] flex-shrink-0 rounded-xl border border-kant bg-papper-2 [aspect-ratio:1/1] min-[400px]:w-[148px] lg:w-[160px]" data-spatial-referens>
          <span className="absolute left-2 top-1.5 z-10 text-[11px] font-semibold uppercase tracking-[.04em] text-ink-3">
            {arKropp(v) ? 'Kroppen' : v.form === 'C' ? 'Tärningen' : 'Figuren'}
          </span>
          <span className="absolute inset-3">
            <Figur fig={referens} />
          </span>
        </div>
        {fraga}
      </div>
    )
  } else {
    kort = fraga
  }

  let efter: ReactNode = null
  if (g) {
    if (v.form === 'D' && g.hopvikning?.length) {
      efter = <Steg figurer={g.hopvikning} etiketter={g.hopvikning.map((_, i, a) => (i === 0 ? 'Arket' : i === a.length - 1 ? 'Ihopvikt' : `Vik ${i}`))} sista="positiv" />
    } else if (v.form === 'B' && g.uppvikning?.length) {
      efter = <Steg figurer={g.uppvikning} etiketter={g.uppvikning.map((_, i, a) => (i === a.length - 1 ? 'Uppvikt' : 'Vik upp'))} sista="positiv" />
    }
  }

  return (
    <div className="flex flex-col gap-3.5 lg:gap-4" data-steg2-uppgift="spatial" data-form={v.form}>
      <div className="rounded-xl border border-kant bg-papper p-3 lg:p-3.5" data-spatial-kort>
        {kort}
      </div>
      <div role="radiogroup" aria-label="Svarsalternativ" className="matrisyta grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-2" data-steg2-alternativ>
        {v.options.map((o, i) => (
          <SvarRuta key={i} i={i} tillstand={tillstandFor(i, vald, facit)} efterFel={efterFel} disabled={last} onValj={onValj} className="[aspect-ratio:186/150] lg:[aspect-ratio:1/1]">
            <span className="block h-full w-full p-2.5 pt-3.5 lg:p-1.5 lg:pt-2.5">
              <Figur fig={o} />
            </span>
          </SvarRuta>
        ))}
      </div>
      {efter ? (
        <div data-spatial-facit>
          <p className="mb-1.5 text-[12px] font-semibold uppercase leading-4 tracking-[.06em] text-ink-3">{v.form === 'D' ? 'Så viks det ihop' : 'Så viks det upp'}</p>
          {efter}
        </div>
      ) : null}
    </div>
  )
}

/* ---------------------------------------------------------------- Ordförråd */

function OrdEtikett({ typ }: { typ: 'synonym' | 'antonym' }) {
  const syn = typ === 'synonym'
  return (
    <p className={`inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase leading-4 tracking-[.06em] ${syn ? 'text-ton-ink' : 'text-[color:var(--motsats)]'}`} data-ord-typ={typ}>
      <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
        {syn ? (
          <g fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="7.5" cy="10" r="5" />
            <circle cx="12.5" cy="10" r="5" />
          </g>
        ) : (
          <path d="M8 10H2.5M5 7l-3 3 3 3M12 10h5.5M15 7l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
      {syn ? 'Synonym' : 'Motsatsord'}
    </p>
  )
}

function OrdUppgift({ u, vald, facit, efterFel, onValj, last }: UppgiftProps<Extract<Steg2U, { kind: 'ordforrad' }>>) {
  const v = u.v
  return (
    <div className="flex flex-col gap-3.5 lg:gap-4" data-steg2-uppgift="ordforrad">
      <div className="rounded-xl border border-kant bg-papper px-4 pb-4 pt-3.5" data-ordkort>
        <OrdEtikett typ={v.typ} />
        <h2
          tabIndex={-1}
          data-uppgift-rubrik
          className="mt-1.5 break-words font-sess-display text-[32px] font-extrabold uppercase leading-[36px] tracking-[.02em] text-ink-1 outline-none lg:text-[40px] lg:leading-[44px]"
        >
          {v.ord}
        </h2>
        <p className="mt-1 text-sm leading-5 text-ink-2">{v.typ === 'synonym' ? 'Vilket ord betyder ungefär detsamma?' : 'Vilket ord betyder motsatsen?'}</p>
      </div>
      <div role="radiogroup" aria-label="Svarsalternativ" className="flex flex-col gap-2" data-steg2-alternativ>
        {v.options.map((o, i) => (
          <SvarRad key={i} i={i} tillstand={tillstandFor(i, vald, facit)} efterFel={efterFel} disabled={last} onValj={onValj}>
            {o}
          </SvarRad>
        ))}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- Ritarna */

export function Steg2Uppgift(p: UppgiftProps<Steg2U>) {
  const u = p.u
  if (u.kind === 'talserie') return <TalserieUppgift {...(p as UppgiftProps<Extract<Steg2U, { kind: 'talserie' }>>)} />
  if (u.kind === 'spatial') return <SpatialUppgift {...(p as UppgiftProps<Extract<Steg2U, { kind: 'spatial' }>>)} />
  return <OrdUppgift {...(p as UppgiftProps<Extract<Steg2U, { kind: 'ordforrad' }>>)} />
}

const NAMN: Record<Steg2Kind, string> = { talserie: 'Talserier', spatial: 'Spatial förmåga', ordforrad: 'Ordförråd' }

const RITARE: Record<Steg2Kind, TypRitare<Steg2U>> = {
  talserie: { kind: 'talserie', namn: NAMN.talserie, form: 'smal', antalAlternativ: (u) => u.v.options.length, Uppgift: Steg2Uppgift },
  spatial: { kind: 'spatial', namn: NAMN.spatial, form: 'smal', antalAlternativ: (u) => u.v.options.length, Uppgift: Steg2Uppgift },
  ordforrad: { kind: 'ordforrad', namn: NAMN.ordforrad, form: 'smal', antalAlternativ: (u) => u.v.options.length, Uppgift: Steg2Uppgift },
}

export function steg2Ritare(kind: Steg2Kind): TypRitare<Steg2U> {
  return RITARE[kind]
}

/* ------------------------------------------------------------- Miniatyrerna */

/** Resultatets genomgångskort: upp till sex missar i små rutor, tre på mobil. */
export function Steg2Miniatyrer({ poster }: { poster: Steg2U[] }) {
  if (!poster.length) return null
  return (
    <ul className="flex flex-wrap items-start gap-2 lg:gap-3" aria-hidden="true" data-miniatyrer>
      {poster.slice(0, 6).map((u, i) => (
        <li key={u.nyckel} className={i >= 3 ? 'hidden lg:block' : undefined}>
          <Miniatyr u={u} />
        </li>
      ))}
    </ul>
  )
}

function Miniatyr({ u }: { u: Steg2U }) {
  if (u.kind === 'talserie') {
    const n = u.v.visade.length + u.v.luckor
    return (
      <span className="flex h-12 items-center gap-[3px] rounded-xl border border-kant bg-papper px-2">
        {Array.from({ length: n }, (_, i) => {
          const lucka = i >= u.v.visade.length
          return (
            <span
              key={i}
              className={`flex h-7 min-w-[22px] items-center justify-center rounded-md border px-0.5 text-[11px] font-bold tabular-nums ${lucka ? 'border-dashed border-kant-stark text-ink-3' : 'border-kant text-ink-1'}`}
            >
              {lucka ? '?' : visaTal(u.v.visade[i])}
            </span>
          )
        })}
      </span>
    )
  }
  if (u.kind === 'ordforrad') {
    return (
      <span className="flex h-12 max-w-[160px] items-center rounded-xl border border-kant bg-papper px-3">
        <span className="truncate font-sess-display text-[15px] font-extrabold uppercase tracking-[.02em] text-ink-1">{u.v.ord}</span>
      </span>
    )
  }
  const fig = u.v.referens ?? u.v.sekvens?.[u.v.sekvens.length - 1] ?? u.v.options[0]
  return <span className="matrisyta block h-12 w-12 rounded-xl border border-kant bg-papper p-1">{fig ? <Figur fig={fig} /> : null}</span>
}
