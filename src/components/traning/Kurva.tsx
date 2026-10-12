/**
 * Kurvan i Rekryteringstester (spec-rummen 4.4, konceptets .kurva i 1b,
 * 1c, 1e, 1f, 1g, 1h, W1, W3 och F1). Nivå per dag på väggen, med
 * sikteband, provlinje, planraden längst ner och axeln i HTML under.
 *
 * Två viewBoxar, aldrig skalad text (W1-kravet): 380 x 150 på mobil och
 * 840 x 170 på dator, och för hela kurvan (F1) 380 x 200 och 840 x 220.
 * Hemvyn ritar båda och visar den ena per brytpunkt.
 *
 *   x  = 30 + dagindex x (336 / (antal dagar - 1)) mobil, 40 + ... x 776 dator
 *   y  = tre heltal: golvet floor(min nivå), taket golvet + 2 men minst
 *        ceil(sikte); 22 px per nivå mobil, 25 dator
 *   sikteband från mätningens dag, 6 px i --ljus med opacitet 0,10, streckad
 *        linje ovanpå
 *   linjen bryts vid dagar utan punkt (vilodagar), separata <path>
 *   mätning och ommätning r 5,5 med kant i koppar-ljus, pass r 3,5,
 *        generalrepetition kvadrat, senaste punkten r 4,5 med lyster
 *   planraden: gjorda fyllda, kommande ihåliga, ommätning tjockare,
 *        generalrepetition ihålig kvadrat, låsta (gratis) fyllda i väggens kant
 *   provlinjen lodrät i vagg-mjuk; passerat prov i koppar med fylld kvadrat
 *
 * Rörelse bara vid ny punkt: klassen .motion på omslaget (globals.css)
 * ritar linjen, tonar ytan och tänder den nya punkten en gång.
 * prefers-reduced-motion ger sluttillståndet direkt.
 *
 * Exempeltalen ritar aldrig över 7,5; produktionskurvan ritar vad datan
 * säger, men y-axeln toppar vid 10.
 *
 * Server component. Våg 3b importerar den för M1, O1 och F1.
 */

import type { Nivapunkt } from '@/lib/traning/milstolpar'
import type { PlanDag } from '@/lib/traning/plan'
import { dagarMellan, laggTill, type Dag } from '@/lib/traning/datum'
import { kortDatum } from '@/lib/traning/rubrik'
import { HEM } from '@/lib/traning/hem-copy'
import { nivaKort } from '@/lib/traning/pass-copy'

export interface KurvaProps {
  punkter: readonly Nivapunkt[]
  plan: readonly PlanDag[]
  idag: Dag
  /** Mätningens dag, kurvans första dag och siktebandets start. */
  start: Dag
  prov?: Dag | null
  sikte?: number | null
  bredd: 'mobil' | 'dator'
  /** Rita kurvan en gång (linjen, ytan, den nya punkten). */
  nyPunkt?: boolean
  /**
   * 150 (hemvyn) eller 200 (hela kurvan) på mobil. 'kompakt' är hemvyn på
   * mobil, 126: etiketterna "Mål" och "Prov" på en rad ovanför översta
   * rutlinjen (beslut-hemvy, tillägget 2026-10-11 punkt 5). Bara mobil.
   */
  hojd?: 'hem' | 'full' | 'kompakt'
  ariaLabel: string
  /** Utan planraden längst ner. */
  utanPlan?: boolean
  /** Provet har varit (1e): linjen i koppar med fylld kvadrat. */
  provPasserat?: boolean
  /** Unikt prefix för gradienterna när flera kurvor står på samma sida. */
  idPrefix?: string
  /**
   * Hemvyn (beslut-hemvy 2026-10-11 punkt 2): inget tal vid senaste punkten
   * och bara ordet under mätningen. Axeln är visualiseringen.
   */
  utanPunktTal?: boolean
  /** Ingen datumrad under kurvan (hemvyn 1c på mobil, art-director 2026-10-12: kopparknappen ovanför 620 px). */
  utanAxel?: boolean
  className?: string
}

interface Matt {
  W: number
  H: number
  x0: number
  xW: number
  yBas: number
  span: number
  planY: number
  ytaBotten: number
  yTopp: number
  r: { pass: number; om: number; senast: number; lyster: number; plan: number; planOm: number; nu: number }
}

const MATT: Record<'mobil' | 'dator', Record<'hem' | 'full', Matt> & { kompakt?: Matt }> = {
  mobil: {
    kompakt: { W: 380, H: 126, x0: 30, xW: 336, yBas: 66, span: 44, planY: 108, ytaBotten: 94, yTopp: 6, r: { pass: 3.5, om: 5.5, senast: 4.5, lyster: 14, plan: 3, planOm: 4.5, nu: 4.5 } },
    hem: { W: 380, H: 150, x0: 30, xW: 336, yBas: 90, span: 44, planY: 132, ytaBotten: 118, yTopp: 14, r: { pass: 3.5, om: 5.5, senast: 4.5, lyster: 14, plan: 3, planOm: 4.5, nu: 4.5 } },
    full: { W: 380, H: 200, x0: 30, xW: 336, yBas: 150, span: 120, planY: 176, ytaBotten: 162, yTopp: 14, r: { pass: 4, om: 6, senast: 5, lyster: 16, plan: 3, planOm: 4.5, nu: 5 } },
  },
  dator: {
    hem: { W: 840, H: 170, x0: 40, xW: 776, yBas: 101, span: 50, planY: 152, ytaBotten: 136, yTopp: 16, r: { pass: 4, om: 6, senast: 5, lyster: 16, plan: 3.5, planOm: 5, nu: 5 } },
    full: { W: 840, H: 220, x0: 40, xW: 776, yBas: 165, span: 125, planY: 200, ytaBotten: 185, yTopp: 16, r: { pass: 4, om: 6, senast: 5, lyster: 16, plan: 3.5, planOm: 5, nu: 5 } },
  },
}

export interface Geometri {
  matt: Matt
  forsta: Dag
  sista: Dag
  antal: number
  lo: number
  hi: number
  etiketter: number[]
  x: (dag: Dag) => number
  y: (niva: number) => number
}

/** Räknar skalorna. Exporterad för testerna. */
export function kurvansGeometri(p: Pick<KurvaProps, 'punkter' | 'plan' | 'idag' | 'start' | 'prov' | 'sikte' | 'bredd' | 'hojd'>): Geometri {
  const matt = (p.hojd === 'kompakt' ? MATT[p.bredd].kompakt : undefined) ?? MATT[p.bredd][p.hojd === 'full' ? 'full' : 'hem']
  const forsta = p.start
  const planSista = p.plan.length ? p.plan[p.plan.length - 1].dag : null
  const kandidater = [p.prov ?? null, planSista, p.idag, ...p.punkter.map((q) => q.dag)].filter(Boolean) as Dag[]
  let sista = kandidater.reduce((a, b) => (b > a ? b : a), forsta)
  if (sista === forsta) sista = laggTill(forsta, 7)
  const antal = dagarMellan(forsta, sista) + 1

  const nivaer = p.punkter.map((q) => q.niva)
  const min = nivaer.length ? Math.min(...nivaer) : p.sikte ?? 5
  const max = nivaer.length ? Math.max(...nivaer) : min
  let lo: number
  let hi: number
  let etiketter: number[]
  if ((p.hojd ?? 'hem') !== 'full') {
    lo = Math.max(1, Math.floor(min + 1e-9))
    hi = Math.max(lo + 2, Math.ceil((p.sikte ?? 0) - 1e-9), Math.ceil(max - 1e-9))
    if (hi > 10) {
      hi = 10
      lo = Math.min(lo, 8)
    }
    const mitt = Math.round((lo + hi) / 2)
    etiketter = [hi, mitt, lo]
  } else {
    lo = Math.max(1, Math.floor(min + 1e-9) - 1)
    hi = Math.min(10, Math.max(lo + 4, Math.ceil(Math.max(max, p.sikte ?? 0) - 1e-9) + 1))
    const steg = hi - lo <= 4 ? 1 : Math.ceil((hi - lo) / 4)
    etiketter = []
    for (let v = hi; v >= lo; v -= steg) etiketter.push(v)
  }
  const x = (dag: Dag) => matt.x0 + (antal > 1 ? (dagarMellan(forsta, dag) * matt.xW) / (antal - 1) : 0)
  const y = (niva: number) => matt.yBas - ((niva - lo) / (hi - lo)) * matt.span
  return { matt, forsta, sista, antal, lo, hi, etiketter, x, y }
}

/** En punkt per dag: dagens sista punkt bär nivån, en mätning den dagen bär märket. */
function perDag(punkter: readonly Nivapunkt[]): { dag: Dag; niva: number; typ: Nivapunkt['typ'] }[] {
  const m = new Map<Dag, { dag: Dag; niva: number; typ: Nivapunkt['typ'] }>()
  for (const q of punkter) {
    const fore = m.get(q.dag)
    const tung = q.typ === 'matning' || q.typ === 'ommatning'
    m.set(q.dag, { dag: q.dag, niva: q.niva, typ: fore && (fore.typ === 'matning' || fore.typ === 'ommatning') && !tung ? fore.typ : q.typ })
  }
  return [...m.values()].sort((a, b) => (a.dag < b.dag ? -1 : 1))
}

/** Sammanhängande dagar blir en linje; en dag utan punkt bryter den. */
export function segment(punkter: readonly { dag: Dag }[]): number[][] {
  const ut: number[][] = []
  punkter.forEach((q, i) => {
    if (i > 0 && dagarMellan(punkter[i - 1].dag, q.dag) === 1) ut[ut.length - 1].push(i)
    else ut.push([i])
  })
  return ut
}

/** Nivån som den renderas: 3, 5,6, aldrig "3,0" (copy-plan avsnitt 3). */
function fmt(n: number): string {
  return nivaKort(n)
}

const r1 = (n: number) => Math.round(n * 10) / 10


/* ------------------------------------------------------------ texten */

/**
 * All text på instrumenten är HTML över SVG:n, placerad i procent av
 * viewBoxen (art-director 20.2 fråga 3: SVG:n håller geometri, texten skalas
 * aldrig). `y` är ankarpunkten i viewBoxens enheter: över (textens nederkant
 * vid y), mitt eller under (textens överkant vid y).
 */
const TXT = {
  ax: 'text-[11px] font-medium leading-[14px] text-vagg-mjuk',
  k: 'font-display text-[13px] font-bold leading-4 text-koppar-ljus',
  soft: 'text-[11px] font-medium leading-[14px] text-vagg-mjuk',
  sikte: 'text-[11px] font-medium leading-[14px] text-ljus',
} as const

function Lapp({
  x,
  y,
  W,
  H,
  ankX,
  ankY,
  className,
  children,
}: {
  x: number
  y: number
  W: number
  H: number
  ankX: 'start' | 'mitt' | 'slut'
  ankY: 'over' | 'mitt' | 'under'
  className: string
  children: React.ReactNode
}) {
  const tx = ankX === 'start' ? '0' : ankX === 'mitt' ? '-50%' : '-100%'
  const ty = ankY === 'over' ? '-100%' : ankY === 'mitt' ? '-50%' : '0'
  return (
    <span
      className={`absolute whitespace-nowrap ${className}`}
      style={{ left: `${((x / W) * 100).toFixed(2)}%`, top: `${((y / H) * 100).toFixed(2)}%`, transform: `translate(${tx}, ${ty})` }}
    >
      {children}
    </span>
  )
}

export default function Kurva(props: KurvaProps) {
  const { idag, prov = null, sikte = null, bredd, nyPunkt, ariaLabel, utanPlan, provPasserat, utanPunktTal, className } = props
  const g = kurvansGeometri(props)
  const { matt, x, y } = g
  const dator = bredd === 'dator'
  const kompakt = !dator && props.hojd === 'kompakt'
  const id = `${props.idPrefix ?? 'kurva'}-${bredd}-${props.hojd ?? 'hem'}`
  const dagar = perDag(props.punkter)
  const segs = segment(dagar)
  const senast = dagar[dagar.length - 1]
  const idagPlan = props.plan.find((d) => d.dag === idag)
  const xSlut = x(g.sista)
  const passIdagKvar = idagPlan && idagPlan.status === 'idag'
  // Siktets etikett flyttar under linjen när senaste punktens tal står i vägen.
  const sikteKrock = !utanPunktTal && !!senast && sikte != null && xSlut - x(senast.dag) < (dator ? 150 : 80) && Math.abs(y(senast.niva) - y(sikte)) < 20
  const { W, H } = matt
  const K = HEM.kurva

  return (
    <div className={`${nyPunkt ? 'motion' : ''} ${className ?? ''}`}>
      <div className="relative mt-2">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} className="kurva block h-auto w-full overflow-visible">
          <defs>
            <linearGradient id={`${id}-yta`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#E07A2F" stopOpacity=".38" />
              <stop offset="1" stopColor="#E07A2F" stopOpacity="0" />
            </linearGradient>
            <radialGradient id={`${id}-lyster`} cx=".5" cy=".5" r=".5">
              <stop offset="0" stopColor="#F4B98A" stopOpacity=".55" />
              <stop offset=".55" stopColor="#E07A2F" stopOpacity=".18" />
              <stop offset="1" stopColor="#E07A2F" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* rutnätet: tre heltal */}
          {g.etiketter.map((v) => (
            <line key={v} x1={matt.x0} x2={matt.x0 + matt.xW} y1={r1(y(v))} y2={r1(y(v))} stroke="var(--vagg-kant)" strokeWidth="1" />
          ))}

          {/* siktet */}
          {sikte != null && (prov || provPasserat) ? (
            <g>
              {!provPasserat ? (
                <rect x={x(g.forsta)} y={r1(y(sikte)) - 3} width={r1(xSlut - x(g.forsta))} height="6" fill="var(--ljus)" opacity=".10" />
              ) : null}
              <line x1={x(g.forsta)} x2={xSlut} y1={r1(y(sikte))} y2={r1(y(sikte))} stroke="var(--ljus)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
            </g>
          ) : null}

          {/* ytan och linjen, bruten vid dagar utan punkt */}
          {segs.map((s, i) => {
            if (s.length < 2) return null
            const pts = s.map((j) => `${r1(x(dagar[j].dag))} ${r1(y(dagar[j].niva))}`)
            const d = `M${pts.join(' L')}`
            const forstaX = r1(x(dagar[s[0]].dag))
            const sistaX = r1(x(dagar[s[s.length - 1]].dag))
            return (
              <g key={`seg-${i}`}>
                <path className="yta" d={`${d} L${sistaX} ${matt.ytaBotten} L${forstaX} ${matt.ytaBotten} Z`} fill={`url(#${id}-yta)`} />
                <path
                  className="linje"
                  d={d}
                  pathLength={700}
                  fill="none"
                  stroke="var(--koppar)"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )
          })}

          {/* lystern bakom senaste punkten */}
          {senast ? <circle cx={r1(x(senast.dag))} cy={r1(y(senast.niva))} r={matt.r.lyster} fill={`url(#${id}-lyster)`} /> : null}

          {/* punkterna */}
          {dagar.map((q, i) => {
            const cx = r1(x(q.dag))
            const cy = r1(y(q.niva))
            const sista = i === dagar.length - 1
            const ny = sista && nyPunkt ? ' ny' : ''
            if (q.typ === 'general') {
              return <rect key={q.dag} className={`punkt${ny}`} x={cx - 4} y={cy - 4} width="8" height="8" rx="1.5" fill="var(--koppar)" stroke="var(--vagg)" strokeWidth="2" />
            }
            if (q.typ === 'matning' || q.typ === 'ommatning') {
              return <circle key={q.dag} className={`punkt om${ny}`} cx={cx} cy={cy} r={matt.r.om} fill="var(--koppar)" stroke="var(--koppar-ljus)" strokeWidth="2.5" />
            }
            return <circle key={q.dag} className={`punkt${ny}`} cx={cx} cy={cy} r={sista ? matt.r.senast : matt.r.pass} fill="var(--koppar)" stroke="var(--vagg)" strokeWidth="2" />
          })}

          {/* dagens ihåliga punkt när passet inte är gjort */}
          {passIdagKvar && senast && idag > senast.dag ? (
            idagPlan!.typ === 'general' ? (
              <rect x={r1(x(idag)) - 4} y={r1(y(senast.niva)) - 4} width="8" height="8" rx="1.5" fill="none" stroke="var(--koppar)" strokeWidth="2" strokeDasharray="3 3" />
            ) : (
              <circle cx={r1(x(idag))} cy={r1(y(senast.niva))} r={matt.r.nu} fill="none" stroke="var(--koppar)" strokeWidth="2" strokeDasharray="3 3" />
            )
          ) : null}

          {/* provet */}
          {prov ? (
            <g>
              <line
                x1={r1(x(prov))}
                x2={r1(x(prov))}
                y1={matt.yTopp}
                y2={utanPlan ? matt.ytaBotten : matt.planY + 6}
                stroke={provPasserat ? 'var(--koppar)' : 'var(--vagg-mjuk)'}
                strokeWidth="1.5"
              />
              {provPasserat ? <rect x={r1(x(prov)) - 4} y={matt.yTopp - 4} width="8" height="8" rx="1.5" fill="var(--koppar)" /> : null}
            </g>
          ) : null}

          {/* planraden */}
          {!utanPlan ? (
            <g aria-hidden="true">
              {props.plan.map((d) => (
                <Planmarke key={d.dag} dag={d} cx={r1(x(d.dag))} cy={matt.planY} matt={matt} />
              ))}
            </g>
          ) : null}
        </svg>

        {/* texten i HTML, aldrig skalad */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {g.etiketter.map((v) => (
            <Lapp key={v} x={matt.x0 - (dator ? 12 : 10)} y={y(v)} W={W} H={H} ankX="slut" ankY="mitt" className={TXT.ax}>
              {v}
            </Lapp>
          ))}
          {kompakt ? (
            // Ett etikettband: målet och provet på samma rad ovanför översta rutlinjen.
            prov && !provPasserat ? (
              <Lapp x={x(prov) - 4} y={matt.yBas - matt.span - 4} W={W} H={H} ankX="slut" ankY="over" className="flex items-baseline gap-3">
                {sikte != null ? <span className={TXT.sikte}>{K.sikte(fmt(sikte))}</span> : null}
                <span className={TXT.soft}>{K.prov}</span>
              </Lapp>
            ) : !prov && !provPasserat ? (
              <Lapp x={xSlut} y={matt.yBas - matt.span - 4} W={W} H={H} ankX="slut" ankY="over" className={TXT.soft}>
                {K.siktetSatts}
              </Lapp>
            ) : null
          ) : sikte != null && (prov || provPasserat) && !provPasserat ? (
            <Lapp x={xSlut - 6} y={sikteKrock ? y(sikte) + 4 : y(sikte) - 3} W={W} H={H} ankX="slut" ankY={sikteKrock ? 'under' : 'over'} className={TXT.sikte}>
              {dator ? K.sikteDator(fmt(sikte)) : K.sikte(fmt(sikte))}
            </Lapp>
          ) : !prov && !provPasserat ? (
            <Lapp x={xSlut} y={31} W={W} H={H} ankX="slut" ankY="over" className={TXT.soft}>
              {K.siktetSatts}
            </Lapp>
          ) : null}
          {senast && !utanPunktTal ? (
            <Lapp x={x(senast.dag)} y={y(senast.niva) - 7} W={W} H={H} ankX={dagar.length === 1 ? 'start' : 'mitt'} ankY="over" className={TXT.k}>
              {fmt(senast.niva)}
            </Lapp>
          ) : null}
          {dagar[0] && dagar[0].dag === g.forsta ? (
            <Lapp x={matt.x0} y={y(dagar[0].niva) + 7} W={W} H={H} ankX="start" ankY="under" className={TXT.soft}>
              {dator && !utanPunktTal ? K.matningDator(fmt(dagar[0].niva)) : K.matning}
            </Lapp>
          ) : null}
          {prov && !provPasserat && !kompakt ? (
            <Lapp x={x(prov) - 4} y={matt.yTopp + 1} W={W} H={H} ankX="slut" ankY="over" className={TXT.soft}>
              {K.prov}
            </Lapp>
          ) : null}
        </div>
      </div>
      {props.utanAxel ? null : <Axel g={g} idag={idag} prov={prov} plan={props.plan} provPasserat={provPasserat} dator={dator} />}
    </div>
  )
}

function Planmarke({ dag, cx, cy, matt }: { dag: PlanDag; cx: number; cy: number; matt: Matt }) {
  const r = matt.r.plan
  const kvadrat = (props: { fill: string; stroke?: string; dash?: string; storlek?: number }) => {
    const s = props.storlek ?? 7
    return (
      <rect
        x={cx - s / 2}
        y={cy - s / 2}
        width={s}
        height={s}
        rx="1.5"
        fill={props.fill}
        stroke={props.stroke ?? 'none'}
        strokeWidth={props.stroke ? 1.5 : 0}
        strokeDasharray={props.dash}
      />
    )
  }
  if (dag.typ === 'prov') return null
  if (dag.typ === 'vila') {
    return <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--vagg-svag)" strokeWidth="1.5" strokeDasharray="1 3" />
  }
  const general = dag.typ === 'general'
  const om = dag.typ === 'ommatning' || dag.typ === 'matning'
  switch (dag.status) {
    case 'gjord':
      if (general) return kvadrat({ fill: 'var(--koppar)' })
      return om ? (
        <circle cx={cx} cy={cy} r={matt.r.planOm} fill="var(--koppar)" stroke="var(--koppar-ljus)" strokeWidth="2" />
      ) : (
        <circle cx={cx} cy={cy} r={r} fill="var(--koppar)" />
      )
    case 'idag':
      if (general) return kvadrat({ fill: 'none', stroke: 'var(--koppar)', dash: '3 3', storlek: 8 })
      return <circle cx={cx} cy={cy} r={r + 1} fill="none" stroke="var(--koppar)" strokeWidth="2" strokeDasharray="3 3" />
    case 'last':
      if (general) return kvadrat({ fill: 'var(--vagg-kant)', storlek: 8 })
      return <circle cx={cx} cy={cy} r={om ? matt.r.planOm + 0.5 : r + 1} fill="var(--vagg-kant)" />
    case 'missad':
      return <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--vagg-svag)" strokeWidth="1.5" opacity=".5" />
    default:
      if (general) return kvadrat({ fill: 'none', stroke: 'var(--vagg-svag)' })
      return om ? (
        <circle cx={cx} cy={cy} r={matt.r.planOm} fill="none" stroke="var(--vagg-mjuk)" strokeWidth="2" />
      ) : (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--vagg-svag)" strokeWidth="1.5" />
      )
  }
}

/** Ungefärlig bredd för en axeltext i viewBoxens enheter (11 px, cirka 6 per tecken). */
function textBredd(text: string): number {
  return text.length * 6 + 10
}

export interface AxelEtikett {
  text: string
  /** x i viewBoxens enheter. */
  x: number
  justering: 'v' | 'm' | 'h'
  koppar?: boolean
}

/**
 * Axelns etiketter i prioritetsordning (art-director 20.5 fråga 1): i dag,
 * start, slut, mittpunkt. "i dag" står alltid; en etikett som krockar med
 * en som redan står faller bort. Exporterad för testerna.
 */
export function axelEtiketter(g: Pick<Geometri, 'forsta' | 'sista' | 'x' | 'matt'>, idag: Dag, plan: readonly PlanDag[], opt: { prov: Dag | null; provPasserat?: boolean; dator: boolean }): AxelEtikett[] {
  const K = HEM.kurva
  const W = g.matt.W
  const spann = (e: AxelEtikett): [number, number] => {
    const b = textBredd(e.text)
    if (e.justering === 'v') return [0, b]
    if (e.justering === 'h') return [e.x - b, e.x]
    return [e.x - b / 2, e.x + b / 2]
  }
  const ut: AxelEtikett[] = []
  const lagg = (e: AxelEtikett) => {
    const [a, b] = spann(e)
    if (ut.some((f) => {
      const [c, d] = spann(f)
      return a < d && c < b
    })) return
    ut.push(e)
  }
  if (idag >= g.forsta && idag <= g.sista) {
    lagg({ text: K.idag, x: g.x(idag), justering: idag === g.forsta ? 'v' : idag === g.sista || g.x(idag) + textBredd(K.idag) / 2 > W ? 'h' : 'm', koppar: true })
  }
  lagg({ text: kortDatum(g.forsta), x: g.x(g.forsta), justering: 'v' })
  lagg({ text: opt.provPasserat && opt.prov ? K.provPasserat(kortDatum(opt.prov)) : kortDatum(g.sista), x: g.x(g.sista), justering: 'h' })
  const kommande = plan.filter((d) => d.typ === 'ommatning' && d.dag > idag)
  for (const m of opt.dator ? kommande : kommande.slice(0, 1)) {
    lagg({ text: opt.dator ? K.ommatningAxel(kortDatum(m.dag)) : kortDatum(m.dag), x: g.x(m.dag), justering: 'm' })
  }
  return ut
}

/**
 * Axeln under kurvan, i HTML (11 px, aldrig skalad): i dag i koppar-ljus,
 * första dagen, sista dagen och nästa ommätning, i den prioriteten.
 */
function Axel({
  g,
  idag,
  prov,
  plan,
  provPasserat,
  dator,
}: {
  g: Geometri
  idag: Dag
  prov: Dag | null
  plan: readonly PlanDag[]
  provPasserat?: boolean
  dator: boolean
}) {
  const W = g.matt.W
  const etiketter = axelEtiketter(g, idag, plan, { prov, provPasserat, dator })
  return (
    <div aria-hidden="true" className="relative mt-1.5 h-4 text-ax text-vagg-mjuk">
      {etiketter.map((e) => (
        <span
          key={`${e.text}-${e.x}`}
          className={`absolute whitespace-nowrap ${e.koppar ? 'font-semibold text-koppar-ljus' : ''} ${
            e.justering === 'm' ? '-translate-x-1/2' : e.justering === 'h' ? '-translate-x-full' : ''
          }`}
          style={{ left: e.justering === 'v' ? 0 : `${((e.x / W) * 100).toFixed(2)}%` }}
        >
          {e.text}
        </span>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------ planbilden */

export interface PlanbildProps {
  plan: readonly PlanDag[]
  idag: Dag
  prov: Dag
  bredd: 'mobil' | 'dator'
  /** Mätningen är gjord: "Mät min nivå" står inte vid i dag. */
  matt?: boolean
  ariaLabel: string
  className?: string
}

/**
 * Planen som bild (1a, W2): före mätningen finns ingen kurva, bara dagarna
 * fram till provet. Ihåliga märken är planerade dagar, luckorna söndagar.
 * Aldrig en tom graf. Texten i HTML som på kurvan.
 */
export function Planbild({ plan, idag, prov, bredd, matt, ariaLabel, className }: PlanbildProps) {
  const dator = bredd === 'dator'
  const W = dator ? 840 : 380
  const H = 100
  const x0 = dator ? 40 : 30
  const xW = dator ? 776 : 336
  const antal = Math.max(2, dagarMellan(idag, prov) + 1)
  const x = (dag: Dag) => Math.round((x0 + (dagarMellan(idag, dag) * xW) / (antal - 1)) * 10) / 10
  const r = dator ? 3.5 : 3
  const om = plan.filter((d) => d.typ === 'ommatning')
  const gen = plan.filter((d) => d.typ === 'general')
  const genMitt = gen.length ? (x(gen[0].dag) + x(gen[gen.length - 1].dag)) / 2 : null
  const last = (d: PlanDag) => d.status === 'last'
  const K = HEM.kurva
  return (
    <div className={`relative mt-2 ${className ?? ''}`}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} className="kurva block h-auto w-full overflow-visible">
        <line x1={x0} x2={x0 + xW} y1="70" y2="70" stroke="var(--vagg-kant)" strokeWidth="1" />
        {plan.map((d) => {
          const cx = x(d.dag)
          if (d.dag === idag) {
            return <circle key={d.dag} cx={cx} cy="70" r="7" fill="none" stroke="var(--koppar)" strokeWidth="2" strokeDasharray="3 3" />
          }
          if (d.typ === 'prov') return null
          if (d.typ === 'vila') {
            return <circle key={d.dag} cx={cx} cy="70" r={r} fill="none" stroke="var(--vagg-svag)" strokeWidth="1.5" strokeDasharray="1 3" />
          }
          if (d.typ === 'general') {
            const s = last(d) ? 8 : 7
            return (
              <rect
                key={d.dag}
                x={cx - s / 2}
                y={70 - s / 2}
                width={s}
                height={s}
                rx="1.5"
                fill={last(d) ? 'var(--vagg-kant)' : 'none'}
                stroke={last(d) ? 'none' : 'var(--vagg-svag)'}
                strokeWidth="1.5"
              />
            )
          }
          if (d.typ === 'ommatning') {
            return last(d) ? (
              <circle key={d.dag} cx={cx} cy="70" r={dator ? 5.5 : 5} fill="var(--vagg-kant)" />
            ) : (
              <circle key={d.dag} cx={cx} cy="70" r={dator ? 5.5 : 5} fill="none" stroke="var(--vagg-mjuk)" strokeWidth="2" />
            )
          }
          return last(d) ? (
            <circle key={d.dag} cx={cx} cy="70" r={r + 1} fill="var(--vagg-kant)" />
          ) : (
            <circle key={d.dag} cx={cx} cy="70" r={r} fill="none" stroke="var(--vagg-svag)" strokeWidth="1.5" />
          )
        })}
        <line x1={x(prov)} x2={x(prov)} y1="40" y2="86" stroke="var(--vagg-mjuk)" strokeWidth="1.5" />
      </svg>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {!matt ? (
          <Lapp x={x0} y={55} W={W} H={H} ankX="start" ankY="over" className={TXT.k}>
            {K.planMat}
          </Lapp>
        ) : null}
        {om
          // En ny mätning nära övningsprovet tappar sin etikett, så texterna aldrig krockar.
          .filter((d) => genMitt == null || Math.abs(x(d.dag) - genMitt) >= (textBredd(K.planOm) + textBredd(dator ? K.planGen : K.planGenKort)) / 2)
          .map((d) => (
            <Lapp key={`om-${d.dag}`} x={x(d.dag)} y={55} W={W} H={H} ankX="mitt" ankY="over" className={TXT.soft}>
              {K.planOm}
            </Lapp>
          ))}
        {genMitt != null ? (
          <Lapp x={genMitt} y={55} W={W} H={H} ankX="mitt" ankY="over" className={TXT.soft}>
            {dator ? K.planGen : K.planGenKort}
          </Lapp>
        ) : null}
        <Lapp x={x(prov) - 4} y={36} W={W} H={H} ankX="slut" ankY="over" className={TXT.soft}>
          {K.prov}
        </Lapp>
        <Lapp x={x0} y={88} W={W} H={H} ankX="start" ankY="under" className={TXT.ax}>
          {K.idag}
        </Lapp>
        {om[0] ? (
          <Lapp x={x(om[0].dag)} y={88} W={W} H={H} ankX="mitt" ankY="under" className={TXT.ax}>
            {kortDatum(om[0].dag)}
          </Lapp>
        ) : null}
        <Lapp x={x(prov)} y={88} W={W} H={H} ankX="slut" ankY="under" className={TXT.ax}>
          {kortDatum(prov)}
        </Lapp>
      </div>
    </div>
  )
}
