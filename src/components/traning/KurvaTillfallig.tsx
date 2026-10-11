// ersätts av Kurva från våg 2 vid sammanslagningen
//
// Tillfällig kurva för O1 (ommätningen) så att våg 3b går att bygga och
// skärmdumpa innan våg 2:s src/components/traning/Kurva.tsx finns. Samma
// props som specens KurvaProps (spec-rummen 4.4), så att bytet är en import.
// Ritar bara det O1 behöver: tre heltal på y-axeln, siktet, linjen med ytan,
// punkterna (mätning och ommätning tyngre), lystern på senaste punkten och
// provlinjen. Planraden, vilodagarnas luckor och rörelsen ligger i våg 2:s
// Kurva.

import { useId } from 'react'
import type { Nivapunkt } from '@/lib/traning/milstolpar'
import type { PlanDag } from '@/lib/traning/plan'
import { dagarMellan, laggTill } from '@/lib/traning/datum'
import { datumKort } from '@/lib/traning/pass-copy'

export interface KurvaProps {
  punkter: Nivapunkt[]
  plan: PlanDag[]
  idag: string
  /** Mätningens dag. */
  start: string
  prov?: string | null
  sikte?: number | null
  bredd?: 'mobil' | 'dator'
  nyPunkt?: boolean
  hojd?: 'hem' | 'full'
  ariaLabel: string
  utanPlan?: boolean
}

const MATT = {
  mobil: { w: 380, x0: 30, xb: 336, perNiva: 22 },
  dator: { w: 840, x0: 40, xb: 776, perNiva: 25 },
} as const

function Ritning({ p, bredd, id }: { p: KurvaProps; bredd: keyof typeof MATT; id: string }) {
  const m = MATT[bredd]
  const slut = p.prov ?? (p.plan.length ? p.plan[p.plan.length - 1].dag : laggTill(p.idag, 7))
  const dagar = Math.max(1, dagarMellan(p.start, slut))
  const xFor = (dag: string) => m.x0 + (dagarMellan(p.start, dag) / dagar) * m.xb

  const nivaer = p.punkter.map((x) => x.niva)
  const golv = Math.floor(Math.min(...nivaer, p.sikte ?? Infinity))
  const tak = Math.max(golv + 2, Math.ceil(p.sikte ?? 0))
  const topp = 14
  const h = topp + (tak - golv) * m.perNiva + 14
  const yFor = (niva: number) => topp + (tak - niva) * m.perNiva

  const sorterade = [...p.punkter].sort((a, b) => (a.dag < b.dag ? -1 : 1))
  const linje = sorterade.map((x, i) => `${i ? 'L' : 'M'}${xFor(x.dag).toFixed(1)} ${yFor(x.niva).toFixed(1)}`).join(' ')
  const forsta = sorterade[0]
  const sista = sorterade[sorterade.length - 1]
  const yta = sista
    ? `${linje} L${xFor(sista.dag).toFixed(1)} ${h - 6} L${xFor(forsta.dag).toFixed(1)} ${h - 6} Z`
    : ''

  return (
    <div className={bredd === 'mobil' ? 'lg:hidden' : 'hidden lg:block'}>
      <svg viewBox={`0 0 ${m.w} ${h}`} className="kurva block h-auto w-full overflow-visible" role="img" aria-label={p.ariaLabel}>
        <defs>
          <linearGradient id={`${id}-${bredd}-yta`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E07A2F" stopOpacity=".38" />
            <stop offset="1" stopColor="#E07A2F" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`${id}-${bredd}-lyster`} cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#F4B98A" stopOpacity=".55" />
            <stop offset=".55" stopColor="#E07A2F" stopOpacity=".18" />
            <stop offset="1" stopColor="#E07A2F" stopOpacity="0" />
          </radialGradient>
        </defs>
        {Array.from({ length: tak - golv + 1 }, (_, i) => tak - i).map((n) => (
          <g key={n}>
            <line x1={m.x0} x2={m.x0 + m.xb} y1={yFor(n)} y2={yFor(n)} stroke="var(--vagg-kant)" />
            <text x={m.x0 - 10} y={yFor(n) + 4} textAnchor="end" fontSize="11" fontWeight="500" fill="var(--vagg-mjuk)">
              {n}
            </text>
          </g>
        ))}
        {p.sikte != null ? (
          <line
            x1={m.x0}
            x2={m.x0 + m.xb}
            y1={yFor(p.sikte)}
            y2={yFor(p.sikte)}
            stroke="var(--ljus)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
        ) : null}
        {yta ? <path className="yta" d={yta} fill={`url(#${id}-${bredd}-yta)`} /> : null}
        {linje ? (
          <path className="linje" d={linje} fill="none" stroke="var(--koppar)" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" />
        ) : null}
        {sista ? <circle cx={xFor(sista.dag)} cy={yFor(sista.niva)} r={16} fill={`url(#${id}-${bredd}-lyster)`} /> : null}
        {sorterade.map((x, i) => {
          const tung = x.typ === 'matning' || x.typ === 'ommatning'
          const ar = x === sista
          return tung ? (
            <circle
              key={i}
              className={`punkt ${ar && p.nyPunkt ? 'ny' : ''}`}
              cx={xFor(x.dag)}
              cy={yFor(x.niva)}
              r={ar ? 6.5 : 5.5}
              fill="var(--koppar)"
              stroke="var(--koppar-ljus)"
              strokeWidth={2.5}
            />
          ) : (
            <circle key={i} className="punkt" cx={xFor(x.dag)} cy={yFor(x.niva)} r={3.5} fill="var(--koppar)" stroke="var(--vagg)" strokeWidth={2} />
          )
        })}
        {p.prov ? (
          <line x1={xFor(p.prov)} x2={xFor(p.prov)} y1={6} y2={h - 6} stroke="var(--vagg-mjuk)" strokeWidth={1.5} />
        ) : null}
      </svg>
      <div className="relative mt-1.5 h-4 text-[11px] font-medium leading-4 text-vagg-mjuk" aria-hidden="true">
        <span className="absolute left-0" style={{ left: `${(m.x0 / m.w) * 100}%` }}>
          {datumKort(p.start)}
        </span>
        <span
          className="absolute -translate-x-1/2 font-semibold text-koppar-ljus"
          style={{ left: `${(xFor(p.idag) / m.w) * 100}%` }}
        >
          i dag
        </span>
        <span className="absolute -translate-x-full" style={{ left: `${((m.x0 + m.xb) / m.w) * 100}%` }}>
          {datumKort(slut)}
        </span>
      </div>
    </div>
  )
}

export default function KurvaTillfallig(props: KurvaProps) {
  const id = useId().replace(/[:]/g, '')
  if (props.punkter.length === 0) return null
  return (
    <div className="mt-2">
      <Ritning p={props} bredd="mobil" id={id} />
      <Ritning p={props} bredd="dator" id={id} />
    </div>
  )
}
