'use client'

/**
 * Talserier, spatial förmåga och ordförråd i ramen (plan-testflode-2026-11-20
 * avsnitt 3.3 och 3.7, etapp 4; omgång 2 steg B2; omgång 3 steg 2a, skissens
 * Test-talserier, Test-talserier-par, Test-spatial-*, Test-ordforrad,
 * Test-ordforrad-motsats och mobilbrädena). Samma uppgift i alla lägen:
 * nivåtestet, Träna, Nivåkollen, I-provet, genomgången och Uppgiftslistan.
 *
 *   Talserie   brädet med talen på vita brickor och luckan som streckad
 *              kopparruta (Talrad i skala 1,5, krymper med brädet). Efter
 *              facit ritas bågarna in med steget på en ljus bricka, luckan
 *              fylls grön och hennes fel står som ett streckat steg till en
 *              röd bricka ("ditt steg: −8"). Kolumnen 780 på dator med frågan
 *              överst; på telefonen brädet först. Två luckor på telefonen: två
 *              rader om fyra numrerade brickor (minst 72 px) med en böjd linje
 *              från radslut till radstart, svaren som rader ner till foten.
 *   Spatial    brädet med rutnät till vänster på dator (data-brade-layout
 *              "sida"), figuren direkt på brädet och en skylt om regeln.
 *              Vriden figur: efter facit står den första och rätt svar bredvid
 *              varandra med vridningen i koppar. Vikningen: stegen numrerade på
 *              brädet; efter facit uppvikningen baklänges i en rad under (på
 *              telefonen i stegens plats, så att brädet behåller höjden).
 *   Ordförråd  ordkortet som en bunt papper med relationen i en bricka, ordet
 *              stort och hjälpraden; svaren tre och två. Domen till höger på
 *              dator med ordboksartikeln: rätt ord och dess betydelse, exemplet
 *              och källan (ingen källa när definitionen är vår egen), och hennes
 *              ord med betydelsen.
 *
 * Figurerna ritas av motorns ritare: på brädet i väggfärg (.sess-fig-ruta),
 * i klossarna i figurens bläck (.sess-fig). Alla rutor har aspect-ratio eller
 * fast höjd och alla rörelser är transform och opacity (CLS 0).
 */

import { Fragment, type CSSProperties, type ReactNode } from 'react'
import { SpatialSvg, arkTransform, brickAxel, halR } from '@/lib/spatialV1/ritare'
import type { ArkStansFigur, ArkUtFigur, BrickFigur, GenomgangSpatial, KubFigur, Ruta, SpatialFigur, VisadSpatial } from '@/lib/spatialV1/types'
import type { GenomgangTalserie, VisadTalserie } from '@/lib/talserierV1/types'
import { visaTal } from '@/lib/talserierV1/layout'
import type { Steg2Kind } from '@/app/dashboard/tester/testConfig'
import { FORM_NAMN, SPATIAL_TYP_NAMN } from '@/lib/tester/steg2/namn'
import Marke from '../Marke'
import { useRubrikTagg } from '@/components/tests/RubrikTagg'
import { BOKSTAV, SvarRad, SvarRuta, SvarTal, tillstandFor } from '../Svarskort'
import { SESSION } from '../copy'
import GemensamTalrad, { TALRAD_BAGAR, TalradBagar, bagarTiming, type TalradRuta } from '../Talrad'
import type { ForklaringInnehallProps, RamFacit, RamUppgift, TypRitare, UppgiftProps } from '../typ'
import { SerieOrm, SeriePil } from './Figurserie'

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
  /** Var definitionen kommer ifrån (omgång 3): 'egen' visar ingen källa. Utelämnad: Svensk ordbok. */
  facit_betyder_kalla?: 'belagg' | 'egen'
  /** Ordparets verifiering ("SO", "SAOL"), källraden när definitionen är citerad ur belägget. */
  kalla_namn?: string | null
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

/** Etiketten vid hennes steg på brädet (skissen): "ditt steg: −8", "ditt andra tal: +17". */
export function talStegEtikett(steg: { j: number; text: string }[], luckor: number): string {
  const t = steg.map((s) => s.text).join(', ')
  if (luckor < 2) return `ditt steg: ${t}`
  if (steg.length === 1) return `ditt ${steg[0].j === 0 ? 'första' : 'andra'} tal: ${t}`
  return `dina tal: ${t}`
}

/**
 * Talraden på brädet: den gemensamma Talrad i skala 1,5, som krymper med
 * brädet så att hela serien ryms. Platsen över och under raden är
 * reserverad från start, så att bågarna och hennes steg i facit inte flyttar
 * något (CLS 0).
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
      skala={1.5}
      ovan={TALRAD_BAGAR.ovan}
      under={TALRAD_BAGAR.under}
      overlay={bagar.length ? (g) => <TalradBagar g={g} bagar={bagar} visade={u.visade} svar={hennes} etikett={talStegEtikett} /> : undefined}
    />
  )
}

/** Två luckor på telefonen: två rader om fyra numrerade brickor (skissens Mobil-talserier-par-tva). */
function TalTvaRader({ u, facit }: { u: VisadTalserie; facit: number | null }) {
  const svar = facit != null ? u.options[facit] ?? null : null
  const n = u.visade.length + u.luckor
  const kolumner = Math.ceil(n / 2)
  return (
    <div className="sess-serie-rad" data-kolumner={kolumner} aria-hidden="true">
      {Array.from({ length: n }, (_, i) => {
        const lucka = i >= u.visade.length
        const tal = lucka ? svar?.[i - u.visade.length] ?? null : u.visade[i]
        const text = tal === null ? '?' : visaTal(tal)
        return (
          <div key={i} className="sess-serie-plats">
            <div className="relative">
              <div className="sess-talruta" data-lucka={lucka ? (tal === null ? 'tom' : 'fylld') : undefined} data-tecken={Math.min(5, Math.max(3, text.length))}>
                {text}
              </div>
              {(i + 1) % kolumner !== 0 && i < n - 1 ? <SeriePil /> : null}
            </div>
            <span className="sess-serie-nr" data-lucka={lucka ? '' : undefined}>
              {i + 1}
            </span>
          </div>
        )
      })}
      {kolumner === 4 ? (
        <span className="pointer-events-none absolute inset-0">
          <SerieOrm bredd={334} hojd={232} radMitt={41} mitt={116} rad2Mitt={169} />
        </span>
      ) : null}
    </div>
  )
}

function TalserieUppgift({ u, vald, facit, efterFel, onValj, last, facitData }: UppgiftProps<Extract<Steg2U, { kind: 'talserie' }>>) {
  const v = u.v
  const data = facit != null ? ((facitData as GenomgangTalserie | undefined) ?? null) : null
  const par = v.luckor === 2
  const varvad = Boolean(data?.bagar?.some((b) => b.serie !== undefined))
  // p i artiklarnas provruta (RubrikTagg, omgång 2 steg C), annars h2.
  const Rubrik = useRubrikTagg()
  const fel = facit != null && vald != null && vald !== facit
  return (
    <div className="flex flex-1 flex-col gap-3.5 lg:gap-5" data-steg2-uppgift="talserie" data-brade-layout="tal" data-fyll-hojd={par ? '' : undefined}>
      <div className="lg:order-first">
        <Rubrik tabIndex={-1} data-uppgift-rubrik className="text-fraga text-ink-1 outline-none">
          {par ? 'Vilka två tal kommer härnäst, i ordning?' : 'Vilket tal kommer härnäst?'}
        </Rubrik>
        {par && facit == null ? <p className="mt-1 text-[13px] leading-[18px] text-ink-3">Första talet är den vänstra luckan, andra talet den högra.</p> : null}
      </div>
      <div
        className="sess-brade sess-talbrade order-first lg:order-none"
        role="img"
        aria-label={`Talraden ${v.visade.map(visaTal).join(', ')} och ${par ? 'två luckor' : 'en lucka'}`}
        data-talrad-kort
        data-tva={par ? '' : undefined}
        data-varvad={varvad ? '' : undefined}
      >
        <div className="sess-tal-en">
          <TalserieRad u={v} facit={facit} vald={vald} data={data} />
        </div>
        {par ? (
          <div className="sess-tal-tva">
            <TalTvaRader u={v} facit={facit} />
          </div>
        ) : null}
      </div>
      <div role="radiogroup" aria-label="Svarsalternativ" className={`sess-tal-svar ${par ? 'flex-1 max-lg:[grid-auto-rows:minmax(56px,1fr)]' : ''}`} data-par={par ? '' : undefined} data-steg2-alternativ>
        {v.options.map((o, i) => {
          const t = tillstandFor(i, vald, facit)
          return (
            <SvarTal key={i} i={i} tillstand={t} ditt={facit != null && vald === i} efterFel={efterFel} disabled={last} onValj={onValj}>
              {!par && (t === 'ratt' || t === 'fel') ? (
                <span className="absolute right-2 top-2.5 lg:hidden" aria-hidden="true">
                  <Marke typ={t} storlek={22} fylld pop />
                </span>
              ) : null}
              {par ? (
                <span className="text-[24px] leading-[28px] lg:text-[22px] lg:leading-[28px] xl:text-[24px]">
                  {visaTal(o[0])}
                  <span className="sess-tal-och">och</span>
                  {visaTal(o[1])}
                </span>
              ) : (
                <span className="text-[24px] leading-[28px] lg:text-[28px] lg:leading-[32px]">{o.map(visaTal).join(' och ')}</span>
              )}
            </SvarTal>
          )
        })}
      </div>
      {!par && facit != null ? (
        <p className="-mt-1 flex items-center gap-4 text-[13px] font-semibold leading-4 text-ink-2 lg:hidden" aria-hidden="true">
          {fel ? (
            <span className="inline-flex items-center gap-1.5">
              <Marke typ="fel" storlek={18} fylld />
              {SESSION.svar.ditt}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Marke typ="ratt" storlek={18} fylld />
            {SESSION.svar.ratt}
          </span>
        </p>
      ) : null}
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

function Figur({ fig, ton }: { fig: SpatialFigur; ton?: 'ratt' }) {
  return (
    <span className="block h-full w-full" data-spatial-kind={fig.kind} data-ton={ton}>
      <SpatialSvg fig={fig} className="block h-full w-full" />
    </span>
  )
}

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

/** Vridningen i skissens ord. */
const VRID_ETIKETT = ['', '90 grader medurs', '180 grader', '90 grader moturs']
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
  /** Hennes svar sist: avvikelsen, eller null när hålen inte går att jämföra. */
  fel?: HalAvvikelse | null
}

function vikFacit(v: VisadSpatial, g: GenomgangSpatial, vald: number | null, facit: number): VikSteg[] | null {
  let steg: VikSteg[] | null = null
  if (v.form === 'B' && g.uppvikning?.length) {
    const stansat = v.sekvens?.[v.sekvens.length - 1]
    const k = g.uppvikning.length
    steg = [
      ...(stansat ? [{ fig: stansat as SpatialFigur, etikett: 'Hål' }] : []),
      // Baklänges: den sista vikningen viks upp först (skissen: "2 upp", "1 upp").
      ...g.uppvikning.map((f, i) => ({ fig: f as SpatialFigur, etikett: `${k - i} upp`, positiv: i === k - 1 })),
    ]
  } else if (v.form === 'D' && g.hopvikning?.length) {
    steg = g.hopvikning.map((f, i, a) => ({ fig: f as SpatialFigur, etikett: i === 0 ? 'Arket' : i === a.length - 1 ? 'Ihopvikt' : `Vik ${i}`, positiv: i === a.length - 1 }))
  }
  if (!steg) return null
  if (vald !== null && vald !== facit && v.options[vald] && v.options[facit]) {
    const avv = halAvvikelse(v.options[vald], v.options[facit])
    steg.push({ fig: v.options[vald], etikett: SESSION.svar.ditt, fel: avv ?? null })
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
    return <circle key={key} cx={x} cy={y} r={r} fill="none" stroke="var(--sess-fel)" strokeWidth={2.6} strokeDasharray={streck} strokeLinecap="round" />
  }
  return (
    <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" data-hal-marke>
      {avv.extra.map((h, i) => ring(h, '1.5 2.5', `e${i}`))}
      {avv.saknas.map((h, i) => ring(h, '4 3', `s${i}`))}
    </svg>
  )
}

/** Ett steg på brädet: mörk ruta med numret i en bricka uppe till vänster. */
function StegRuta({ fig, n, ton, fordrojning, children, data }: { fig: SpatialFigur; n: string; ton?: 'ratt' | 'fel'; fordrojning?: number; children?: ReactNode; data?: string }) {
  return (
    <div
      className={`sess-spatial-steg aspect-square ${fordrojning !== undefined ? 'spatial-steg' : ''}`}
      style={fordrojning !== undefined ? { animationDelay: `${fordrojning}ms` } : undefined}
      data-ton={ton}
      data-vik-steg={data}
    >
      <span className="sess-steg-n">{n}</span>
      <span className="relative block h-[84%] w-[84%]">
        <Figur fig={fig} />
        {children}
      </span>
    </div>
  )
}

/** Raden med steg: pil mellan rutorna. */
function StegRad({ antal, children }: { antal: number; children: ReactNode[] }) {
  return (
    <div className={`grid items-center ${antal === 1 ? 'mx-auto max-w-[170px] lg:max-w-[250px]' : ''}`} style={{ gridTemplateColumns: Array.from({ length: antal }, (_, i) => (i ? '14px minmax(0,1fr)' : 'minmax(0,1fr)')).join(' ') }}>
      {children.map((c, i) => (
        <Fragment key={i}>
          {i > 0 ? (
            <span className="flex justify-center text-[color:var(--sess-brade-pil)]" aria-hidden="true">
              <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 2l4 4-4 4" />
              </svg>
            </span>
          ) : null}
          {c}
        </Fragment>
      ))}
    </div>
  )
}

const IKON_VRID = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5" />
  </svg>
)
const IKON_OGA = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
    <circle cx="12" cy="12" r="2.6" />
  </svg>
)
const IKON_SPEGEL = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v18M8 7l-4 5 4 5M16 7l4 5-4 5" />
  </svg>
)

/** Skylten om regeln nere till vänster på brädet (skissens text). */
function regelSkylt(v: VisadSpatial): { text: string; ikon: ReactNode } | null {
  if (arKropp(v)) return { text: 'Du tittar från pilens håll', ikon: IKON_OGA }
  if (arSpegling(v)) return (v.referens as BrickFigur).axlar!.length > 1 ? { text: 'Först linje 1, sedan linje 2', ikon: IKON_SPEGEL } : null
  if (v.form === 'A') return { text: 'Får vridas, inte spegelvändas', ikon: IKON_VRID }
  if (v.form === 'C') return { text: 'Tre sidor syns, tre är dolda', ikon: IKON_VRID }
  return null
}

/** Speglingens linjer numrerade i koppar, vid linjens början. */
function AxelNummer({ fig }: { fig: BrickFigur }) {
  return (
    <>
      {fig.axlar?.map((a, i) => {
        const [p] = brickAxel(a)
        return (
          <span
            key={i}
            aria-hidden="true"
            className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[color:var(--sess-lucka)] font-sess-display text-[15px] font-extrabold text-[color:var(--sess-skala-vald-ink)] lg:h-9 lg:w-9 lg:text-[19px]"
            style={{ left: `${p[0]}%`, top: `${p[1]}%` }}
          >
            {i + 1}
          </span>
        )
      })}
    </>
  )
}

/** Brädet för vriden figur, spegling, tärning och kropp. */
function ReferensBrade({ v, referens, g, facit }: { v: VisadSpatial; referens: SpatialFigur; g: GenomgangSpatial | null; facit: number | null }) {
  const vridbar = v.form === 'A' && v.referens?.kind === 'brick' && !arSpegling(v)
  const rattFig = facit != null ? v.options[facit] : null
  const varv = g && vridbar && rattFig?.kind === 'brick' ? kvartsVarv(v.referens as BrickFigur, rattFig) : null
  const skylt = regelSkylt(v)
  const tvaFigurer = Boolean(g && vridbar && rattFig)
  const tarning = v.referens?.kind === 'kub'
  return (
    <div
      className="matrisyta sess-brade sess-spatialbrade sess-fig-ruta relative aspect-[380/250] lg:aspect-[460/500]"
      data-brade-sida
      data-spatial-referens
      role="img"
      aria-label={tvaFigurer && varv !== null ? `Den första figuren och rätt svar, vriden ${VRID_ETIKETT[varv] || 'inte alls'}` : 'Den första figuren'}
    >
      {tvaFigurer && rattFig ? (
        <>
          {varv ? (
            <>
              <svg viewBox="0 0 460 500" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
                <g className="spatial-etikett" style={{ animationDelay: '500ms' }} fill="none" stroke="var(--sess-bage-2)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M286 138C270 96 190 96 174 138" />
                  <path d="M168 118l5 21 20-9" />
                </g>
              </svg>
              <span className="spatial-etikett absolute left-1/2 top-[7%] -translate-x-1/2 lg:top-[11%]" style={{ animationDelay: '700ms' }}>
                <span className="sess-skylt" data-ton="koppar" data-vrid-etikett>
                  {VRID_ETIKETT[varv]}
                </span>
              </span>
            </>
          ) : null}
          <span className="absolute left-[5%] top-[30%] lg:top-[33%]">
            <span className="sess-skylt" data-versal="">
              Den första
            </span>
          </span>
          <span className="spatial-etikett absolute left-[53%] top-[30%] lg:top-[33%]" style={{ animationDelay: '300ms' }}>
            <span className="sess-skylt" data-versal="" data-ton="ratt">
              Vriden, svar {BOKSTAV(facit!)}
            </span>
          </span>
          <span className="absolute left-[4%] top-[42%] h-[46%] w-[42%] lg:top-[42%] lg:h-[40%]">
            <Figur fig={referens} />
          </span>
          <span
            className={`absolute left-[54%] top-[42%] h-[46%] w-[42%] lg:top-[42%] lg:h-[40%] ${varv ? 'spatial-vrid-in' : ''}`}
            style={varv ? ({ '--vrid-fran': `${-VRID_GRADER[varv]}deg` } as CSSProperties) : undefined}
            data-vrid={varv ? VRID_GRADER[varv] : undefined}
          >
            <Figur fig={rattFig} ton="ratt" />
          </span>
        </>
      ) : (
        <span className={`absolute ${tarning ? 'inset-x-[22%] top-[3%] bottom-[16%] lg:inset-x-[10%] lg:top-[4%] lg:bottom-[20%]' : 'inset-x-[18%] top-[4%] bottom-[14%] lg:inset-x-[6%] lg:top-[3%] lg:bottom-[16%]'}`}>
          {tarning ? <span className="absolute inset-x-[16%] bottom-[-4%] h-[9%] rounded-[50%] bg-[color:var(--sess-brade-kant)]" aria-hidden="true" /> : null}
          <span className="relative block h-full w-full">
            <Figur fig={referens} />
            {arSpegling(v) ? <AxelNummer fig={referens as BrickFigur} /> : null}
          </span>
        </span>
      )}
      {skylt ? (
        <span className="absolute bottom-3 left-3 lg:bottom-5 lg:left-5">
          <span className="sess-skylt">
            {skylt.ikon}
            {skylt.text}
          </span>
        </span>
      ) : null}
    </div>
  )
}

/** Brädet för vikningen (form B) och ihopvikningen (form D). */
function VikBrade({ v, g, vald, facit }: { v: VisadSpatial; g: GenomgangSpatial | null; vald: number | null; facit: number | null }) {
  const sekvens = (v.sekvens ?? []) as SpatialFigur[]
  const vik = g && facit != null ? vikFacit(v, g, vald, facit) : null
  const D = v.form === 'D'
  const etikett = (i: number) => (!D && i === sekvens.length - 1 ? 'Hål' : String(i + 1))
  const harHalIArket = sekvens.some((f) => 'hal' in f && Array.isArray((f as { hal?: unknown[] }).hal) && (f as { hal: unknown[] }).hal.length > 0)
  const harKlipp = Boolean(v.klipp) || sekvens.some((f) => 'klipp' in f && Array.isArray((f as { klipp?: unknown[] }).klipp) && (f as { klipp: unknown[] }).klipp.length > 0)
  return (
    <div className="matrisyta sess-brade sess-fig-ruta relative p-3.5 lg:p-6" data-brade-sida data-spatial-vikning={v.form}>
      <div className="relative">
        <div className="sess-vik-uppgift" data-dold={vik ? '' : undefined}>
          <p className="sess-spatial-ogon mb-2.5 lg:mb-3">{D ? 'Arket och vikningarna, i tur och ordning' : 'Så veks arket'}</p>
          <div data-spatial-sekvens>
            <StegRad antal={sekvens.length}>
              {sekvens.map((f, i) => (
                <StegRuta key={i} fig={f} n={etikett(i)} />
              ))}
            </StegRad>
          </div>
          {D ? (
            <div className="mt-3 flex flex-wrap gap-2 lg:mt-4">
              <span className="sess-skylt">
                <span className="h-3.5 w-3.5 rounded-[4px] bg-[color:var(--sess-figur-gra)]" aria-hidden="true" />
                Den grå delen viks över den vita
              </span>
              {harHalIArket ? (
                <span className="sess-skylt">
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-current" aria-hidden="true" />
                  Hål
                </span>
              ) : null}
              {harKlipp ? (
                <span className="sess-skylt">
                  <span className="h-3 w-3 bg-current [clip-path:polygon(0_0,100%_0,100%_100%,55%_100%,55%_45%,0_45%)]" aria-hidden="true" />
                  Bortklippt ruta
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        {vik ? (
          <div className="sess-vik-facit lg:mt-5" role="img" aria-label={vik.map((s) => s.etikett).join(', ')} data-spatial-facit>
            {!D ? (
              <p className="sess-spatial-ogon mb-2.5 lg:mb-3" data-ton="ratt">
                Så viks det upp, baklänges
              </p>
            ) : null}
            <StegRad antal={vik.length}>
              {vik.map((s, i) => (
                <div key={i} className="flex min-w-0 flex-col">
                  <StegRuta
                    fig={s.fig}
                    n={s.etikett}
                    ton={s.fel !== undefined ? 'fel' : s.positiv ? 'ratt' : undefined}
                    fordrojning={120 + i * 400}
                    data={s.fel !== undefined ? 'ditt' : s.positiv ? 'ratt' : ''}
                  >
                    {s.fel ? <HalMarke fig={s.fig} avv={s.fel} /> : null}
                  </StegRuta>
                  {s.fel ? (
                    <span className="mt-1 line-clamp-2 text-center text-[11px] font-semibold leading-[14px] text-[color:var(--sess-brade-fel)]">{s.fel.text}</span>
                  ) : null}
                </div>
              ))}
            </StegRad>
          </div>
        ) : null}
      </div>
    </div>
  )
}

/** Spegellinjen på hennes spegelvända val: lodrät streckad linje i fel och "spegelvänd". */
function Spegellinje() {
  return (
    <span className="spatial-etikett pointer-events-none absolute inset-0" style={{ animationDelay: '360ms' }} aria-hidden="true" data-spegellinje>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <line x1="50" y1="2" x2="50" y2="84" stroke="var(--sess-fel)" strokeWidth="2.2" strokeDasharray="4 3.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="absolute inset-x-0 -bottom-1 text-center text-[11px] font-bold uppercase leading-[14px] tracking-[.04em] text-[color:var(--sess-fel-ink)]">spegelvänd</span>
    </span>
  )
}

function SpatialUppgift({ u, vald, facit, efterFel, onValj, last, facitData }: UppgiftProps<Extract<Steg2U, { kind: 'spatial' }>>) {
  const v = u.v
  const g = facit != null ? ((facitData as GenomgangSpatial | undefined) ?? null) : null
  // p i artiklarnas provruta (RubrikTagg, omgång 2 steg C), annars h2.
  const Rubrik = useRubrikTagg()
  // Form C efter fel: sidorna på referensen som avslöjar hennes val markeras.
  const markera = g && v.form === 'C' && vald !== null && vald !== facit ? g.avslojande?.[vald] ?? [] : []
  const referens = v.referens && v.referens.kind === 'kub' && markera.length ? ({ ...(v.referens as KubFigur), markera } as KubFigur) : v.referens

  // Form A (vriden figur, inte speglingen): hennes spegling.
  const vridbar = v.form === 'A' && v.referens?.kind === 'brick' && !arSpegling(v)
  const spegelVal =
    g && vridbar && vald !== null && vald !== facit && v.options[vald]?.kind === 'brick'
      ? arSpegelvand(v.referens as BrickFigur, v.options[vald] as BrickFigur) || /^spegelv/i.test(g.misstag?.[vald] ?? '')
      : false

  const vikForm = (v.form === 'B' || v.form === 'D') && Boolean(v.sekvens?.length)
  const brade = vikForm ? <VikBrade v={v} g={g} vald={vald} facit={facit} /> : referens ? <ReferensBrade v={v} referens={referens} g={g} facit={facit} /> : null

  return (
    <div className="flex flex-col gap-3.5 lg:gap-5" data-steg2-uppgift="spatial" data-form={v.form} data-brade-layout={brade ? 'sida' : undefined}>
      {brade}
      <div className="min-w-0 lg:pt-1" data-spatial-kort>
        <p className="text-[12px] font-semibold uppercase leading-4 tracking-[.08em] text-ink-3">{formNamn(v)}</p>
        <Rubrik tabIndex={-1} data-uppgift-rubrik className="text-fraga mt-1.5 text-ink-1 outline-none lg:mt-2">
          {v.fraga}
        </Rubrik>
        {v.form === 'D' ? <p className="mt-1.5 text-[13px] leading-[18px] text-ink-2">Hål och klipp syns bara där de går genom alla lager.</p> : null}
      </div>
      <div role="radiogroup" aria-label="Svarsalternativ" className="matrisyta sess-fig sess-spatial-svar grid grid-cols-2 gap-2.5 lg:gap-3" data-steg2-alternativ>
        {v.options.map((o, i) => (
          <SvarRuta key={i} i={i} tillstand={tillstandFor(i, vald, facit)} ditt={facit != null && vald === i} efterFel={efterFel} disabled={last} onValj={onValj}>
            <span className="block h-full w-full px-2.5 pb-2.5 pt-6 lg:px-4 lg:pb-3 lg:pt-5">
              <span className="relative mx-auto block aspect-square h-full max-w-full">
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

/** Motsatsens pil åt båda håll (skissens ordkort och artikel). */
function MotsatsPil({ bredd = 26, className = '' }: { bredd?: number; className?: string }) {
  return (
    <svg width={bredd} height={(bredd * 24) / 44} viewBox="0 0 44 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`block flex-shrink-0 ${className}`}>
      <path d="M4 12h36M11 5l-7 7 7 7M33 5l7 7-7 7" />
    </svg>
  )
}

/** Synonym i ton, motsatsord i motsatsfärgen (frågetypen byter färg, så att den som skummar aldrig svarar på fel fråga). */
const relFarg = (typ: 'synonym' | 'antonym') => (typ === 'synonym' ? 'text-ton-ink' : 'text-[color:var(--motsats)]')

/** Ordets storlek efter längden, så att långa ord ryms på kortet. */
function ordStorlek(ord: string): string {
  const n = ord.length
  if (n <= 9) return 'text-[44px] leading-[48px] min-[400px]:text-[48px] min-[400px]:leading-[52px] lg:text-[64px] lg:leading-[68px] xl:text-[76px] xl:leading-[80px]'
  if (n <= 13) return 'text-[36px] leading-[40px] lg:text-[52px] lg:leading-[56px] xl:text-[60px] xl:leading-[64px]'
  return 'text-[28px] leading-[34px] lg:text-[40px] lg:leading-[46px]'
}

function OrdUppgift({ u, vald, facit, efterFel, onValj, last }: UppgiftProps<Extract<Steg2U, { kind: 'ordforrad' }>>) {
  const v = u.v
  const syn = v.typ === 'synonym'
  // p i artiklarnas provruta (RubrikTagg, omgång 2 steg C), annars h2.
  const Rubrik = useRubrikTagg()
  return (
    <div className="flex flex-col gap-5 lg:gap-9" data-steg2-uppgift="ordforrad" data-brade-layout="ord">
      <div className="sess-ordkort" data-ordkort>
        <i aria-hidden="true" />
        <i aria-hidden="true" />
        <div>
          <span className="sess-ordchip" data-typ={v.typ} data-ord-typ={v.typ} data-ord-glyf>
            {syn ? <RelationsGlyf typ="synonym" storlek={22} /> : <MotsatsPil />}
            {syn ? 'Synonym' : 'Motsatsord'}
          </span>
          <Rubrik
            tabIndex={-1}
            data-uppgift-rubrik
            lang="sv"
            className={`mt-3 break-words font-sess-display font-extrabold tracking-[-.03em] text-ink-1 outline-none [hyphens:auto] lg:mt-4 ${ordStorlek(v.ord)}`}
          >
            {v.ord}
          </Rubrik>
          <p className="mt-2 text-[15px] leading-[22px] text-ink-2 lg:mt-2.5 lg:text-[17px] lg:leading-6">{syn ? 'Vilket ord betyder ungefär detsamma?' : 'Vilket ord betyder motsatsen?'}</p>
        </div>
      </div>
      <div role="radiogroup" aria-label="Svarsalternativ" className="sess-ord-alt" data-steg2-alternativ>
        {v.options.map((o, i) => (
          <SvarRad key={i} i={i} tillstand={tillstandFor(i, vald, facit)} ditt={facit != null && vald === i} efterFel={efterFel} disabled={last} onValj={onValj}>
            <span className="font-sess-display text-[19px] font-bold leading-6 lg:text-[21px] lg:leading-[26px]">{o}</span>
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
/** Meningen med stor bokstav först (definitionen står som fras i banken). */
const mening = (s: string) => medPunkt(s.charAt(0).toUpperCase() + s.slice(1))

const KALLA_NAMN: Record<string, string> = { SO: 'Svensk ordbok (SO)', SAOL: 'Svenska Akademiens ordlista (SAOL)' }

/**
 * Källraden under definitionen (omgång 3): ingen när definitionen är vår
 * egen formulering ('egen'). Citerad ur ordparets belägg: verifieringens
 * källa. Annars är definitionen Svensk ordboks.
 */
export function ordKalla(o: Pick<OrdGenomgang, 'facit_betyder_kalla' | 'kalla_namn'>): string | null {
  if (o.facit_betyder_kalla === 'egen') return null
  if (o.facit_betyder_kalla === 'belagg') {
    const namn = (o.kalla_namn ?? '').trim()
    return namn ? `Källa: ${KALLA_NAMN[namn] ?? namn}` : null
  }
  return `Källa: ${KALLA_NAMN.SO}`
}

/**
 * Ordboksartikeln i domen (skissens Test-ordforrad-motsats): två vita kort.
 * Det första med "Rätt synonym" eller "Rätt motsats", uppslagsordet mot rätt
 * ord, betydelsen, exemplet kursivt och källan (ingen när definitionen är vår
 * egen). Det andra, när hon svarade fel, med hennes ord, "inte en synonym"
 * eller "inte motsatsen" och ordets betydelse.
 */
function OrdForklaring({ u, facit, valt }: ForklaringInnehallProps<Steg2U>) {
  if (u.kind !== 'ordforrad' || !arOrdArtikel(facit.data)) return null
  const o = facit.data
  const ratt = o.options[facit.ratt]
  if (!ratt) return null
  const typ = u.v.typ
  const syn = typ === 'synonym'
  const ordet = u.v.ord
  const betyder = mening((o.facit_betyder ?? '').trim())
  const exempel = (o.exempel ?? '').trim()
  const kalla = ordKalla(o)
  const fel = valt !== null && valt !== facit.ratt && o.options[valt] ? valt : null
  const hennesOrd = fel !== null ? o.options[fel] : null
  const hennesText = fel !== null ? (o.arMotsats?.[fel] ? `Det är motsatsen till ${ordet}.` : mening(ordBetydelse(hennesOrd!, o.misstag?.[fel] ?? ''))) : null
  return (
    <div data-ordartikel={typ}>
      <div className="sess-ordartikel">
        <p className="text-[12px] font-semibold uppercase leading-4 tracking-[.08em] text-[color:var(--sess-ratt-ink)]">{syn ? 'Rätt synonym' : 'Rätt motsats'}</p>
        <p className="mt-2 flex flex-wrap items-center gap-x-3.5 gap-y-1" data-uppslag>
          <span className="font-sess-display text-[20px] font-bold leading-[26px] text-ink-2 lg:text-[22px] lg:leading-[28px]">{ordet}</span>
          <span className={syn ? relFarg(typ) : 'text-[color:var(--sess-lucka)]'}>{syn ? <RelationsGlyf typ="synonym" storlek={26} /> : <MotsatsPil bredd={40} />}</span>
          <span className="font-sess-display text-[28px] font-extrabold leading-[32px] text-[color:var(--sess-ratt-ink)] lg:text-[32px] lg:leading-[36px]">{ratt}</span>
        </p>
        <p className="mt-2.5 text-[15px] leading-[22px] text-ink-1">{betyder}</p>
        {exempel ? <p className="mt-1.5 text-[15px] italic leading-[22px] text-ink-2">”{exempel.replace(/^[”"]|[”"]$/g, '')}”</p> : null}
        {kalla ? (
          <p className="mt-2 text-[12px] leading-4 text-ink-3" data-ord-kalla>
            {kalla}
          </p>
        ) : null}
      </div>
      {hennesOrd ? (
        <div className="sess-ordartikel" data-hennes-ord>
          <p className="text-[12px] font-semibold uppercase leading-4 tracking-[.08em] text-[color:var(--sess-fel-ink)]">Ditt ord</p>
          <p className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-sess-display text-[24px] font-extrabold leading-[30px] text-ink-1">{hennesOrd}</span>
            <span className="text-[13px] font-bold leading-[18px] text-[color:var(--sess-fel-ink)]">{syn ? 'inte en synonym' : 'inte motsatsen'}</span>
          </p>
          {hennesText ? <p className="mt-1.5 text-[15px] leading-[22px] text-ink-1">{hennesText}</p> : null}
        </div>
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
  return <span className="matrisyta block h-8 w-8 rounded-[6px] bg-papper-2 p-0.5" data-mini="spatial">{fig ? <SpatialSvg fig={fig} className="block h-full w-full" /> : null}</span>
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
  return <span className="matrisyta block h-12 w-12 rounded-xl border border-kant bg-papper p-1">{fig ? <SpatialSvg fig={fig} className="block h-full w-full" /> : null}</span>
}
