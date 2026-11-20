'use client'

/**
 * Talserier, spatial förmåga och ordförråd i ramen (plan-testflode-2026-11-20
 * avsnitt 3.3 och 3.7, etapp 4; omgång 2 steg B2). Samma uppgift i alla
 * lägen: nivåtestet, Träna, Nivåkollen, I-provet, genomgången och
 * Uppgiftslistan. Innehållsformen är Smal (496 från xl).
 *
 *   Talserie   frågan ovanför kortet, kortet med bara talraden (Talrad, som
 *              reserverar 52 px över och 80 px under raden från start). Efter
 *              facit ritas bågarna in vänster till höger, luckan fylls sist
 *              och hennes fel ritas som ett rött streckat steg med "ditt
 *              svar: −8" (TalradBagar i Talrad.tsx).
 *   Spatial    figurkortet överst: figuren 160 px (200 från xl) till vänster,
 *              eyebrow och uppgiften till höger (pappersvikningens steg i en
 *              rad över texten). Fyra rutor 2 × 2 på mobil, fyra i rad på
 *              dator. Facit visar rörelsen: den vridna figuren vrids till rätt
 *              svars läge med gradetiketten, hennes spegelvända val får
 *              spegellinjen, och vikningens steg ersätter frågans ark i
 *              figurkortet ett i taget med hennes extra eller saknade hål
 *              markerade i fel.
 *   Ordförråd  ordkortet: relationsglyfen i en tonruta, eyebrow, ordet i
 *              versaler 44/48 (34/38 på mobil) och hjälpraden; alternativen i
 *              display 18/600. Facit är en ordboksartikel i Förklaringen
 *              (TypRitare.Forklaring): uppslagsraden, relationen, betydelsen,
 *              exemplet och hennes ord med "inte en synonym".
 *
 * Figurerna ritas av motorns ritare inne i .matrisyta, så att färgrollerna
 * följer bläck och papper i mörkt läge. Alla rutor har aspect-ratio och alla
 * rörelser är transform och opacity (CLS 0). Ingen koppar i uppgiften: rätt
 * är positiv, fel är fel, efter facit.
 */

import { Fragment, type CSSProperties, type ReactNode } from 'react'
import { SpatialSvg, arkTransform, halR } from '@/lib/spatialV1/ritare'
import type { ArkStansFigur, ArkUtFigur, BrickFigur, GenomgangSpatial, KubFigur, Ruta, SpatialFigur, VisadSpatial } from '@/lib/spatialV1/types'
import type { GenomgangTalserie, VisadTalserie } from '@/lib/talserierV1/types'
import { visaTal } from '@/lib/talserierV1/layout'
import type { Steg2Kind } from '@/app/dashboard/tester/testConfig'
import { FORM_NAMN, SPATIAL_TYP_NAMN } from '@/lib/tester/steg2/namn'
import Marke from '../Marke'
import { SvarRad, SvarRuta, tillstandFor } from '../Svarskort'
import GemensamTalrad, { TALRAD_BAGAR, TalradBagar, bagarTiming, type TalradRuta } from '../Talrad'
import type { ForklaringInnehallProps, RamFacit, RamUppgift, TypRitare, UppgiftProps } from '../typ'

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

/** Ordförrådets genomgång har det ordboksartikeln behöver. */
function arOrdArtikel(g: unknown): g is OrdGenomgang {
  const o = g as OrdGenomgang
  return !!o && Array.isArray(o.options) && typeof o.rattVisat === 'number' && typeof o.facit_betyder === 'string'
}

/**
 * Facit och förklaring ur motorns genomgång, samma i alla lägen: talserien
 * har en regel, spatial förklarar i löptext. Misstaget är det för hennes val.
 * Genomgången följer med som data (bågarna, uppvikningen, ordboksartikeln).
 * Ordförrådet (steg B2): ordboksartikeln i Förklaringens kropp bär både
 * betydelsen och hennes ord, så löptext och misstag står tomma när artikeln
 * kan ritas.
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
  if (arOrdArtikel(o) && o.options[ratt]) return { ratt, correct: korrekt, regel: null, text: null, misstag: null, data: g }
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

/**
 * Talraden i ramen: den gemensamma Talrad, som krymper med sin behållare så
 * att hela serien ryms på 412 px och i smala behållare. Platsen över och
 * under raden är reserverad från start, så att bågarna och hennes steg i
 * facit inte flyttar något (CLS 0).
 */
function TalserieRad({ u, facit, vald, data }: { u: VisadTalserie; facit: number | null; vald: number | null; data: GenomgangTalserie | null }) {
  const n = u.visade.length + u.luckor
  const svar = facit != null ? u.options[facit] ?? null : null
  const bagar = data?.bagar ?? []
  const tid = bagarTiming(bagar.length)
  const serieFor = new Map<number, 0 | 1>()
  for (const b of bagar) {
    if (b.serie === undefined) continue
    for (const i of [...b.fran, b.till]) serieFor.set(i, b.serie)
  }
  const rutor: TalradRuta[] = Array.from({ length: n }, (_, i) => {
    const lucka = i >= u.visade.length
    const tal = lucka ? svar?.[i - u.visade.length] ?? null : u.visade[i]
    return {
      text: tal === null ? null : visaTal(tal),
      lucka,
      facit: lucka && tal !== null,
      ton: !lucka && serieFor.get(i) === 0,
      fordrojning: bagar.length ? tid.lucka : undefined,
    }
  })
  const hennes = svar && vald != null && vald !== facit && u.options[vald] ? { tal: u.options[vald], ratt: svar } : null
  return (
    <GemensamTalrad
      rutor={rutor}
      ovan={TALRAD_BAGAR.ovan}
      under={TALRAD_BAGAR.under}
      overlay={bagar.length ? (g) => <TalradBagar g={g} bagar={bagar} visade={u.visade} svar={hennes} /> : undefined}
    />
  )
}

function TalserieUppgift({ u, vald, facit, efterFel, onValj, last, facitData }: UppgiftProps<Extract<Steg2U, { kind: 'talserie' }>>) {
  const v = u.v
  const data = facit != null ? ((facitData as GenomgangTalserie | undefined) ?? null) : null
  return (
    <div className="flex flex-col gap-3.5 lg:gap-4" data-steg2-uppgift="talserie">
      <h2 tabIndex={-1} data-uppgift-rubrik className="text-fraga text-ink-1 outline-none">
        {v.luckor === 2 ? 'Vilka två tal kommer härnäst, i ordning?' : 'Vilket tal kommer härnäst?'}
      </h2>
      <div className="rounded-2xl border border-kant bg-papper px-3 pb-3 pt-2.5 shadow-[0_1px_2px_rgba(27,34,70,.05)] sm:px-5 sm:pb-4 sm:pt-3.5" data-talrad-kort>
        <TalserieRad u={v} facit={facit} vald={vald} data={data} />
      </div>
      <div role="radiogroup" aria-label="Svarsalternativ" className="flex flex-col gap-2" data-steg2-alternativ>
        {v.options.map((o, i) => (
          <SvarRad key={i} i={i} tillstand={tillstandFor(i, vald, facit)} ditt={facit != null && vald === i} efterFel={efterFel} disabled={last} onValj={onValj}>
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
function Steg({ figurer, etiketter, bred = false }: { figurer: SpatialFigur[]; etiketter: string[]; bred?: boolean }) {
  return (
    <div className="matrisyta flex items-stretch gap-1" data-spatial-sekvens>
      {figurer.map((f, i) => (
        <div key={i} className="contents">
          {i > 0 ? <Pil /> : null}
          <div className={`flex min-w-0 flex-1 flex-col ${bred ? '' : 'max-w-[140px]'} items-center rounded-xl border border-kant bg-papper-2 px-1 pb-1 pt-1`}>
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

/* Vridningen (form A): brickans rutor vrids och speglas för att hitta rätt
   svars läge och se om hennes val är en spegling. */

type Cell = [number, number]
interface Brick {
  cells: Cell[]
  mark?: Cell
}

function normalisera(b: Brick): Brick {
  const mr = Math.min(...b.cells.map((c) => c[0]))
  const mc = Math.min(...b.cells.map((c) => c[1]))
  return { cells: b.cells.map(([r, c]) => [r - mr, c - mc]), mark: b.mark ? [b.mark[0] - mr, b.mark[1] - mc] : undefined }
}

const brickNyckel = (b: Brick) => {
  const n = normalisera(b)
  return `${n.cells.map((c) => c.join(',')).sort().join(';')}|${n.mark ? n.mark.join(',') : ''}`
}

/** Ett kvarts varv medurs: (rad, kolumn) till (kolumn, H − 1 − rad). */
function vridMedurs(b: Brick): Brick {
  const h = Math.max(...b.cells.map((c) => c[0]))
  const f = ([r, c]: Cell): Cell => [c, h - r]
  return normalisera({ cells: b.cells.map(f), mark: b.mark ? f(b.mark) : undefined })
}

function spegla(b: Brick): Brick {
  const w = Math.max(...b.cells.map((c) => c[1]))
  const f = ([r, c]: Cell): Cell => [r, w - c]
  return normalisera({ cells: b.cells.map(f), mark: b.mark ? f(b.mark) : undefined })
}

/** Antalet kvarts varv medurs från `fran` till `till`, eller null när ingen vridning ger figuren. */
export function kvartsVarv(fran: Pick<BrickFigur, 'cells' | 'mark'>, till: Pick<BrickFigur, 'cells' | 'mark'>): number | null {
  if (!fran.cells?.length || !till.cells?.length || fran.cells.length !== till.cells.length) return null
  const mal = brickNyckel({ cells: till.cells as Cell[], mark: till.mark as Cell | undefined })
  let b: Brick = normalisera({ cells: fran.cells as Cell[], mark: fran.mark as Cell | undefined })
  for (let k = 0; k < 4; k++) {
    if (brickNyckel(b) === mal) return k
    b = vridMedurs(b)
  }
  return null
}

/** Sant när `hennes` är referensen spegelvänd (i valfri vridning) och inte bara vriden. */
export function arSpegelvand(ref: Pick<BrickFigur, 'cells' | 'mark'>, hennes: Pick<BrickFigur, 'cells' | 'mark'>): boolean {
  if (kvartsVarv(ref, hennes) !== null) return false
  const sp = spegla({ cells: ref.cells as Cell[], mark: ref.mark as Cell | undefined })
  return kvartsVarv(sp, hennes) !== null
}

const VRID_ETIKETT = ['', '90° medurs', '180°', '90° moturs']
const VRID_GRADER = [0, 90, 180, -90]

/* Vikningen (form B och D): stegen i facit och hennes avvikande hål. */

interface HalAvvikelse {
  extra: Ruta[]
  saknas: Ruta[]
  text: string
}

const TAL_ORD = ['', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex']
const antalOrd = (n: number) => TAL_ORD[n] ?? String(n)

const harHal = (f: SpatialFigur): f is ArkStansFigur | ArkUtFigur => f.kind === 'ark-ut' || f.kind === 'ark-stans'

/** Hennes hål mot rätt svars: extra och saknade, när arken går att jämföra (samma form och, för det vikta arket, samma kontur). */
export function halAvvikelse(hennes: SpatialFigur, ratt: SpatialFigur): HalAvvikelse | null {
  if (!harHal(hennes) || !harHal(ratt) || hennes.kind !== ratt.kind || hennes.n !== ratt.n) return null
  if (hennes.kind === 'ark-stans' && JSON.stringify(hennes.poly) !== JSON.stringify((ratt as ArkStansFigur).poly)) return null
  const k = (r: Ruta) => r.join(',')
  const rattS = new Set(ratt.hal.map(k))
  const hennesS = new Set(hennes.hal.map(k))
  const extra = hennes.hal.filter((r) => !rattS.has(k(r)))
  const saknas = ratt.hal.filter((r) => !hennesS.has(k(r)))
  if (!extra.length && !saknas.length) {
    const klipp = (f: ArkStansFigur | ArkUtFigur) => (f.klipp ?? []).map(k).sort().join(';')
    return klipp(hennes) !== klipp(ratt) ? { extra, saknas, text: 'klippet på fel ställe' } : null
  }
  const text = extra.length && saknas.length
    ? 'hålen på fel ställe'
    : extra.length
      ? `${antalOrd(extra.length)} hål för mycket`
      : `${antalOrd(saknas.length)} hål för lite`
  return { extra, saknas, text }
}

interface VikSteg {
  fig: SpatialFigur
  etikett: string
  positiv?: boolean
  fel?: HalAvvikelse | null
}

function vikFacit(v: VisadSpatial, g: GenomgangSpatial, vald: number | null, facit: number): VikSteg[] | null {
  let steg: VikSteg[] | null = null
  if (v.form === 'B' && g.uppvikning?.length) {
    const stansat = v.sekvens?.[v.sekvens.length - 1]
    steg = [
      ...(stansat ? [{ fig: stansat as SpatialFigur, etikett: 'Stansat' }] : []),
      ...g.uppvikning.map((f, i, a) => ({ fig: f as SpatialFigur, etikett: i === a.length - 1 ? 'Uppvikt' : 'Vik upp', positiv: i === a.length - 1 })),
    ]
  } else if (v.form === 'D' && g.hopvikning?.length) {
    steg = g.hopvikning.map((f, i, a) => ({ fig: f as SpatialFigur, etikett: i === 0 ? 'Arket' : i === a.length - 1 ? 'Ihopvikt' : `Vik ${i}`, positiv: i === a.length - 1 }))
  }
  if (!steg) return null
  if (vald !== null && vald !== facit && v.options[vald] && v.options[facit]) {
    const avv = halAvvikelse(v.options[vald], v.options[facit])
    steg.push({ fig: v.options[vald], etikett: avv ? `Ditt svar: ${avv.text}` : 'Ditt svar', fel: avv ?? null })
  }
  return steg
}

/** Hennes extra hål (prickad ring) och saknade hål (streckad ring) i fel, i figurens viewBox. */
function HalMarke({ fig, avv }: { fig: SpatialFigur; avv: HalAvvikelse }) {
  if (!harHal(fig)) return null
  const poly = fig.kind === 'ark-stans' ? fig.poly : ([[0, 0], [fig.n, 0], [fig.n, fig.n], [0, fig.n]] as [number, number][])
  const { t } = arkTransform(fig.n, poly)
  const r = halR(fig.n) + 3.5
  const ring = ([rad, kol]: Ruta, streck: string, key: string) => {
    const [x, y] = t([kol + 0.5, rad + 0.5])
    return <circle key={key} cx={x} cy={y} r={r} fill="none" stroke="var(--fel)" strokeWidth={2.2} strokeDasharray={streck} strokeLinecap="round" />
  }
  return (
    <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" data-hal-marke>
      {avv.extra.map((h, i) => ring(h, '1.5 2.5', `e${i}`))}
      {avv.saknas.map((h, i) => ring(h, '4 3', `s${i}`))}
    </svg>
  )
}

/**
 * Vikningens steg i facit, i figurkortets plats: rutorna får sin storlek ur
 * platsens mått (container query, size), så att kortet behåller sin höjd.
 * Ett steg i taget, 400 ms isär; sista steget med positiv ram, hennes svar
 * sist med hålen markerade i fel.
 */
function VikFacit({ steg, className = '' }: { steg: VikSteg[]; className?: string }) {
  const n = steg.length
  const sida = `min(calc((100cqw - ${(n - 1) * 20}px) / ${n}), calc(100cqh - 34px), 200px)`
  return (
    <div className={`matrisyta [container-type:size] ${className}`} role="img" aria-label={steg.map((s) => s.etikett).join(', ')} data-spatial-facit>
      <div className="flex h-full items-center justify-center">
        <div className="flex items-start justify-center gap-1">
          {steg.map((s, i) => (
            <Fragment key={i}>
              {i > 0 ? (
                <span className="flex items-center" style={{ height: sida }}>
                  <Pil />
                </span>
              ) : null}
              <span className="spatial-steg flex flex-col items-center" style={{ width: sida, animationDelay: `${120 + i * 400}ms` }} data-vik-steg={s.fel !== undefined ? 'ditt' : s.positiv ? 'ratt' : ''}>
                <span
                  className={`block w-full rounded-xl border p-1 [aspect-ratio:1/1] ${
                    s.positiv ? 'border-positiv bg-positiv-mjuk shadow-[inset_0_0_0_1px_var(--positiv)]' : s.fel !== undefined ? 'border-fel bg-papper-2' : 'border-kant bg-papper-2'
                  }`}
                >
                  <span className="relative block h-full w-full">
                    <Figur fig={s.fig} />
                    {s.fel ? <HalMarke fig={s.fig} avv={s.fel} /> : null}
                  </span>
                </span>
                <span className={`mt-1 line-clamp-2 text-center text-[11px] font-semibold leading-[14px] ${s.fel !== undefined ? 'text-fel' : s.positiv ? 'text-positiv' : 'text-ink-3'}`}>
                  {s.etikett}
                </span>
              </span>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Spegellinjen på hennes spegelvända val: lodrät streckad linje i fel och "spegelvänd". */
function Spegellinje() {
  return (
    <span className="spatial-etikett pointer-events-none absolute inset-0" style={{ animationDelay: '360ms' }} aria-hidden="true" data-spegellinje>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <line x1="50" y1="4" x2="50" y2="84" stroke="var(--fel)" strokeWidth="1.5" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="absolute inset-x-0 bottom-0 text-center text-[11px] font-semibold leading-[14px] text-fel">spegelvänd</span>
    </span>
  )
}

const FIGURKORT_BREDD = 'w-[132px] min-[400px]:w-[148px] lg:w-[160px] xl:w-[200px]'

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

  // Form A (vriden figur, inte speglingen): rätt svars vridning och hennes spegling.
  const vridbar = v.form === 'A' && v.referens?.kind === 'brick' && !arSpegling(v)
  const rattFig = facit != null ? v.options[facit] : null
  const varv = g && vridbar && rattFig?.kind === 'brick' ? kvartsVarv(v.referens as BrickFigur, rattFig) : null
  const spegelVal =
    g && vridbar && vald !== null && vald !== facit && v.options[vald]?.kind === 'brick'
      ? arSpegelvand(v.referens as BrickFigur, v.options[vald] as BrickFigur) || /^spegelv/i.test(g.misstag?.[vald] ?? '')
      : false

  const vik = g && facit != null ? vikFacit(v, g, vald, facit) : null

  let kort: ReactNode
  if ((v.form === 'B' || v.form === 'D') && v.sekvens?.length === 1) {
    // En enda vikning: steget till vänster som referensfiguren, uppgiften till höger.
    // I facit tar vikningens steg hela kortets plats (frågan står kvar osynlig, kortet behåller höjden).
    kort = (
      <div className="relative">
        <div className={`flex items-center gap-3.5 ${vik ? 'opacity-0' : ''}`}>
          <div className={`flex-shrink-0 ${FIGURKORT_BREDD}`}>
            <Steg figurer={v.sekvens} etiketter={[v.form === 'D' ? 'Vik 1' : VIK_ETIKETT[3]]} bred />
          </div>
          {fraga}
        </div>
        {vik ? <VikFacit steg={vik} className="absolute inset-0" /> : null}
      </div>
    )
  } else if ((v.form === 'B' || v.form === 'D') && v.sekvens) {
    const etiketter = v.form === 'D' ? v.sekvens.map((_, i) => `Vik ${i + 1}`) : v.sekvens.map((_, i, a) => (i === a.length - 1 ? VIK_ETIKETT[3] : VIK_ETIKETT[i]))
    kort = (
      <div className="flex flex-col gap-3">
        <div className="relative">
          <div className={vik ? 'opacity-0' : undefined}>
            <Steg figurer={v.sekvens} etiketter={etiketter} />
          </div>
          {vik ? <VikFacit steg={vik} className="absolute inset-0" /> : null}
        </div>
        {fraga}
      </div>
    )
  } else if (referens) {
    const vrid = varv !== null && varv > 0
    kort = (
      <div className="flex items-center gap-3.5">
        <div className={`matrisyta relative flex-shrink-0 rounded-xl border border-kant bg-papper-2 [aspect-ratio:1/1] ${FIGURKORT_BREDD}`} data-spatial-referens>
          <span className="absolute left-2 top-1.5 z-10 text-[11px] font-semibold uppercase tracking-[.04em] text-ink-3">
            {arKropp(v) ? 'Kroppen' : v.form === 'C' ? 'Tärningen' : 'Figuren'}
          </span>
          <span className="absolute inset-3">
            <span className={`block h-full w-full ${vrid ? 'spatial-vrid' : ''}`} style={vrid ? ({ '--vrid': `${VRID_GRADER[varv!]}deg` } as CSSProperties) : undefined} data-vrid={vrid ? VRID_GRADER[varv!] : undefined}>
              <Figur fig={referens} />
            </span>
          </span>
          {vrid ? (
            <span
              className="spatial-etikett absolute bottom-2 left-2 z-10 rounded-md border border-kant bg-papper px-1.5 py-0.5 text-[12px] font-semibold leading-4 text-ink-1"
              style={{ animationDelay: '800ms' }}
              data-vrid-etikett
            >
              {VRID_ETIKETT[varv!]}
            </span>
          ) : null}
        </div>
        {fraga}
      </div>
    )
  } else {
    kort = fraga
  }

  return (
    <div className="flex flex-col gap-3.5 lg:gap-4" data-steg2-uppgift="spatial" data-form={v.form}>
      <div className="rounded-2xl border border-kant bg-papper p-3 shadow-[0_1px_2px_rgba(27,34,70,.05)] lg:p-4" data-spatial-kort>
        {kort}
      </div>
      <div role="radiogroup" aria-label="Svarsalternativ" className="matrisyta grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-2" data-steg2-alternativ>
        {v.options.map((o, i) => (
          <SvarRuta key={i} i={i} tillstand={tillstandFor(i, vald, facit)} ditt={facit != null && vald === i} efterFel={efterFel} disabled={last} onValj={onValj} className="[aspect-ratio:186/150] lg:[aspect-ratio:1/1]">
            <span className="block h-full w-full p-2.5 pt-3.5 lg:p-1.5 lg:pt-2.5">
              <span className="relative block h-full w-full">
                <Figur fig={o} />
                {spegelVal && i === vald ? <Spegellinje /> : null}
              </span>
            </span>
          </SvarRuta>
        ))}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- Ordförråd */

/** Relationsglyfen: två överlappande cirklar för synonym, två som skjuts isär för motsatsord. */
function RelationsGlyf({ typ, storlek }: { typ: 'synonym' | 'antonym'; storlek: number }) {
  return (
    <svg width={storlek} height={storlek} viewBox="0 0 48 48" aria-hidden="true" className="block flex-shrink-0">
      {typ === 'synonym' ? (
        <>
          <circle cx="20" cy="24" r="12" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="28" cy="24" r="12" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <path d="M24 14.6a12 12 0 0 1 0 18.8a12 12 0 0 1 0-18.8z" fill="currentColor" opacity=".25" />
        </>
      ) : (
        <>
          <circle cx="13" cy="24" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="35" cy="24" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <path d="M19 10l-7 5 7 5M29 10l7 5-7 5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" transform="translate(0 9)" />
        </>
      )}
    </svg>
  )
}

/** Synonym i ton, motsatsord i motsatsfärgen (frågetypen byter färg, så att den som skummar aldrig svarar på fel fråga). */
const relFarg = (typ: 'synonym' | 'antonym') => (typ === 'synonym' ? 'text-ton-ink' : 'text-[color:var(--motsats)]')

function OrdUppgift({ u, vald, facit, efterFel, onValj, last }: UppgiftProps<Extract<Steg2U, { kind: 'ordforrad' }>>) {
  const v = u.v
  const syn = v.typ === 'synonym'
  return (
    <div className="flex flex-col gap-3.5 lg:gap-4" data-steg2-uppgift="ordforrad">
      <div className="flex items-center gap-4 rounded-2xl border border-kant bg-papper px-4 py-4 shadow-[0_1px_2px_rgba(27,34,70,.05)] lg:gap-5 lg:px-6 lg:py-5" data-ordkort>
        <span className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-ton lg:h-[72px] lg:w-[72px] lg:rounded-[20px] ${relFarg(v.typ)}`} data-ord-glyf>
          <span className="lg:hidden">
            <RelationsGlyf typ={v.typ} storlek={32} />
          </span>
          <span className="hidden lg:block">
            <RelationsGlyf typ={v.typ} storlek={40} />
          </span>
        </span>
        <div className="min-w-0">
          <p className={`text-[11px] font-semibold uppercase leading-4 tracking-[.08em] ${relFarg(v.typ)}`} data-ord-typ={v.typ}>
            {syn ? 'Synonym' : 'Motsatsord'}
          </p>
          <h2
            tabIndex={-1}
            data-uppgift-rubrik
            lang="sv"
            className="mt-1 break-words font-sess-display text-[34px] font-extrabold uppercase leading-[38px] tracking-[.02em] text-ink-1 outline-none [hyphens:auto] lg:text-[44px] lg:leading-[48px]"
          >
            {v.ord}
          </h2>
          <p className="mt-1.5 text-sm leading-5 text-ink-2">{syn ? 'Vilket ord betyder ungefär detsamma?' : 'Vilket ord betyder motsatsen?'}</p>
        </div>
      </div>
      <div role="radiogroup" aria-label="Svarsalternativ" className="flex flex-col gap-2" data-steg2-alternativ>
        {v.options.map((o, i) => (
          <SvarRad key={i} i={i} tillstand={tillstandFor(i, vald, facit)} ditt={facit != null && vald === i} efterFel={efterFel} disabled={last} onValj={onValj}>
            <span className="font-sess-display text-[18px] font-semibold leading-[22px]">{o}</span>
          </SvarRad>
        ))}
      </div>
    </div>
  )
}

/** Distraktorns betydelse ur misstagstexten: "Stark betyder bland annat som har stor muskelkraft." blir "som har stor muskelkraft." */
export function ordBetydelse(ord: string, misstag: string): string {
  const t = (misstag ?? '').trim()
  const m = t.match(/^(\S+)\s+betyder\s+(?:bland annat\s+)?(.+)$/i)
  if (m && m[1].toLowerCase() === ord.toLowerCase()) return m[2]
  return t
}

const medPunkt = (s: string) => (/[.!?…]$/.test(s) ? s : `${s}.`)

/**
 * Ordboksartikeln i Förklaringen (skissens Ordforrad-facit och
 * Ordforrad-motsats): uppslagsraden ställer orden mot varandra (ORDET,
 * glyfen, rätt ord i display 26/800), under den relationen i ink-3 och
 * betydelsen 16/24, exemplet kursivt; när hon svarade fel en avdelare och
 * hennes ord med krysset och "inte en synonym" i fel, med ordets betydelse.
 */
function OrdForklaring({ u, facit, valt }: ForklaringInnehallProps<Steg2U>) {
  if (u.kind !== 'ordforrad' || !arOrdArtikel(facit.data)) return null
  const o = facit.data
  const ratt = o.options[facit.ratt]
  if (!ratt) return null
  const typ = u.v.typ
  const syn = typ === 'synonym'
  const ordet = u.v.ord
  const betyder = medPunkt((o.facit_betyder ?? '').trim())
  const exempel = (o.exempel ?? '').trim()
  const fel = valt !== null && valt !== facit.ratt && o.options[valt] ? valt : null
  const hennesOrd = fel !== null ? o.options[fel] : null
  const hennesText = fel !== null ? (o.arMotsats?.[fel] ? `Det är motsatsen till ${ordet}.` : medPunkt(ordBetydelse(hennesOrd!, o.misstag?.[fel] ?? ''))) : null
  return (
    <div data-ordartikel={typ}>
      <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${relFarg(typ)}`} data-uppslag>
        <span className="font-sess-display text-[18px] font-semibold uppercase leading-[22px] tracking-[.02em] text-ink-2">{ordet}</span>
        <RelationsGlyf typ={typ} storlek={26} />
        <span className="font-sess-display text-[26px] font-extrabold leading-[30px] text-ink-1">{ratt}</span>
      </p>
      <p className="mt-2.5 text-base leading-6 text-ink-1">
        <span className="mr-1.5 text-[13px] text-ink-3">
          {syn ? 'synonym till' : 'motsats till'} {ordet.toLowerCase()}
        </span>
        {betyder}
      </p>
      {exempel ? <p className="mt-1.5 text-[15px] italic leading-[22px] text-ink-2">”{exempel.replace(/^[”"]|[”"]$/g, '')}”</p> : null}
      {hennesOrd ? (
        <>
          <div className="mb-3 mt-3.5 h-px bg-kant" aria-hidden="true" />
          <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1" data-hennes-ord>
            <Marke typ="fel" storlek={20} />
            <span className="font-sess-display text-[18px] font-bold leading-[22px] text-ink-1">{hennesOrd}</span>
            <span className="text-[12px] font-semibold uppercase leading-4 tracking-[.04em] text-fel">{syn ? 'inte en synonym' : 'inte en motsats'}</span>
          </p>
          {hennesText ? <p className="mt-1.5 text-sm leading-5 text-ink-2">{hennesText}</p> : null}
        </>
      ) : null}
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
  talserie: { kind: 'talserie', namn: NAMN.talserie, form: 'smal', antalAlternativ: (u) => u.v.options.length, Uppgift: Steg2Uppgift, Miniatyr: ListMiniatyr },
  spatial: { kind: 'spatial', namn: NAMN.spatial, form: 'smal', antalAlternativ: (u) => u.v.options.length, Uppgift: Steg2Uppgift, Miniatyr: ListMiniatyr },
  ordforrad: {
    kind: 'ordforrad',
    namn: NAMN.ordforrad,
    form: 'smal',
    antalAlternativ: (u) => u.v.options.length,
    Uppgift: Steg2Uppgift,
    Miniatyr: ListMiniatyr,
    Forklaring: OrdForklaring,
  },
}

/**
 * Uppgiftslistans miniatyr (omgång 2, skissen Resultat-1440): talraden i
 * rutor om 26 × 22 (22 på mobil) med luckan på ton, ordet i versaler bakom
 * relationsglyfen, den spatiala figuren i 32 px.
 */
function ListMiniatyr({ u }: { u: Steg2U }) {
  if (u.kind === 'talserie') {
    const n = u.v.visade.length + u.v.luckor
    return (
      <span className="inline-flex gap-[3px]" data-mini="talserie">
        {Array.from({ length: n }, (_, i) => {
          const lucka = i >= u.v.visade.length
          return (
            <i
              key={i}
              className={`flex h-[22px] w-[22px] items-center justify-center rounded-[5px] font-sess-display text-[10px] font-bold not-italic tabular-nums sm:w-[26px] ${
                lucka ? 'border border-dashed border-kant-stark bg-ton text-ink-3' : 'bg-papper-2 text-ink-1'
              }`}
            >
              {lucka ? '?' : visaTal(u.v.visade[i])}
            </i>
          )
        })}
      </span>
    )
  }
  if (u.kind === 'ordforrad') {
    return (
      <span className="inline-flex h-[26px] max-w-[160px] items-center gap-1.5 rounded-[6px] bg-papper-2 pl-1.5 pr-2" data-mini="ordforrad">
        <span className={relFarg(u.v.typ)}>
          <RelationsGlyf typ={u.v.typ} storlek={16} />
        </span>
        <span className="truncate font-sess-display text-[11px] font-extrabold uppercase tracking-[.03em] text-ink-1">{u.v.ord}</span>
      </span>
    )
  }
  const fig = u.v.referens ?? u.v.sekvens?.[u.v.sekvens.length - 1] ?? u.v.options[0]
  return <span className="matrisyta block h-8 w-8 rounded-[6px] bg-papper-2 p-0.5" data-mini="spatial">{fig ? <Figur fig={fig} /> : null}</span>
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
