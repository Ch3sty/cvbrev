'use client'

/**
 * Diagrammen i Siffror och tabeller i ramen (plan-testflode-2026-11-20
 * avsnitt 3.6): diagram-test i fyra ljushetssteg (100, 75, 55 och 40
 * procent), ink-3 för axlar och etiketter, aldrig åtta kulörer och aldrig
 * hårdkodad orange. Höjden är låst till 240 px i underlaget.
 *
 * Text står som HTML, inte som SVG-text, så att etiketterna har samma
 * storlek på telefonen som på datorn. Bara linjen och munkringen är SVG.
 * Alla värden står utskrivna: uppgifterna kräver exakta tal.
 */

import { formatTal, medEnhet } from '@/components/tests/numerical-shared/charts/format'
import s from './vn.module.css'

interface Stapel {
  label: string
  value: number
}
interface Punkt {
  x: string | number
  y: number
}

export type VnDiagramConfig =
  | { chartType: 'bar'; title?: string; data: Stapel[]; unit?: string; yAxisLabel?: string }
  | { chartType: 'pie'; title?: string; data: Stapel[]; unit?: string; centerLabel?: string }
  | { chartType: 'line'; title?: string; data: Punkt[]; unit?: string; xAxisLabel?: string; yAxisLabel?: string }

/** De fyra stegen; ett femte segment får det ljusaste med glesare yta. */
const STEG = [1, 0.75, 0.55, 0.4, 0.26]

/** Värdet med kort enhet ("12 kg", "45 %"), annars bara talet; den långa enheten står under diagrammet. */
function etikett(v: number, unit?: string): string {
  const e = (unit ?? '').trim()
  return e && e.length <= 4 ? medEnhet(v, e) : formatTal(v)
}
const langEnhet = (unit?: string) => ((unit ?? '').trim().length > 4 ? (unit ?? '').trim() : null)

function Rubrik({ titel, axel }: { titel?: string; axel?: string }) {
  if (!titel && !axel) return null
  return (
    <p className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 text-[13px] leading-[18px]">
      {titel ? <span className="font-semibold text-ink-1">{titel}</span> : <span />}
      {axel ? <span className="text-ink-3">{axel}</span> : null}
    </p>
  )
}

function Staplar({ c }: { c: Extract<VnDiagramConfig, { chartType: 'bar' }> }) {
  const max = Math.max(1, ...c.data.map((d) => d.value))
  return (
    <figure className="m-0" aria-label={`Stapeldiagram: ${c.data.map((d) => `${d.label} ${medEnhet(d.value, c.unit ?? '')}`).join(', ')}`}>
      <Rubrik titel={c.title} axel={c.yAxisLabel} />
      <div className="flex h-[176px] items-end gap-1.5 border-b border-ink-3 sm:gap-2.5" aria-hidden="true">
        {c.data.map((d) => (
          <div key={d.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
            <span className="mb-1 whitespace-nowrap text-[12px] font-semibold leading-4 tabular-nums text-ink-1">{etikett(d.value, c.unit)}</span>
            <span className={`${s.stapel} block w-full max-w-[56px] rounded-t-[4px]`} style={{ height: `${Math.max(2, (d.value / max) * 142)}px`, background: 'var(--sd)' }} />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1.5 sm:gap-2.5" aria-hidden="true">
        {c.data.map((d) => (
          <span key={d.label} className="min-w-0 flex-1 text-center text-[11px] leading-[14px] text-ink-3 [overflow-wrap:anywhere] sm:text-[12px]">
            {d.label}
          </span>
        ))}
      </div>
      {langEnhet(c.unit) ? <p className="mt-1 text-right text-[11px] leading-4 text-ink-3">{langEnhet(c.unit)}</p> : null}
    </figure>
  )
}

function Linje({ c }: { c: Extract<VnDiagramConfig, { chartType: 'line' }> }) {
  const ys = c.data.map((d) => d.y)
  const max = Math.max(...ys)
  const min = Math.min(...ys)
  const lag = min - (max - min) * 0.25
  const hog = max + (max - min) * 0.1 || max + 1
  const span = hog - lag || 1
  const n = c.data.length
  const x = (i: number) => (n <= 1 ? 50 : 4 + (i / (n - 1)) * 92)
  const y = (v: number) => 100 - ((v - lag) / span) * 100
  const linje = c.data.map((d, i) => `${i ? 'L' : 'M'} ${x(i)} ${y(d.y)}`).join(' ')
  const yta = `${linje} L ${x(n - 1)} 100 L ${x(0)} 100 Z`
  return (
    <figure className="m-0" aria-label={`Linjediagram: ${c.data.map((d) => `${d.x} ${medEnhet(d.y, c.unit ?? '')}`).join(', ')}`}>
      <Rubrik titel={c.title} axel={c.yAxisLabel} />
      <div className="relative h-[160px] border-b border-ink-3" aria-hidden="true">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 top-5 h-[calc(100%-20px)] w-full overflow-visible">
          <path d={yta} fill="var(--sd)" opacity=".12" />
          <path d={linje} fill="none" stroke="var(--sd)" strokeWidth="2.25" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        </svg>
        <div className="absolute inset-x-0 bottom-0 top-5">
          {c.data.map((d, i) => (
            <span key={i} className="absolute" style={{ left: `${x(i)}%`, top: `${y(d.y)}%` }}>
              <i className="absolute -left-[5px] -top-[5px] block h-2.5 w-2.5 rounded-full border-2 bg-papper" style={{ borderColor: 'var(--sd)' }} />
              <b className="absolute -top-[22px] left-0 -translate-x-1/2 whitespace-nowrap text-[12px] font-semibold leading-4 tabular-nums text-ink-1">{etikett(d.y, c.unit)}</b>
            </span>
          ))}
        </div>
      </div>
      <div className="relative mt-1.5 h-4" aria-hidden="true">
        {c.data.map((d, i) => (
          <span key={i} className="absolute -translate-x-1/2 whitespace-nowrap text-[11px] leading-4 text-ink-3 sm:text-[12px]" style={{ left: `${x(i)}%` }}>
            {d.x}
          </span>
        ))}
      </div>
      {c.xAxisLabel || langEnhet(c.unit) ? (
        <p className="mt-1 flex justify-between text-[11px] leading-4 text-ink-3">
          <span>{c.xAxisLabel ?? ''}</span>
          <span>{langEnhet(c.unit) ?? ''}</span>
        </p>
      ) : null}
    </figure>
  )
}

function Munk({ c }: { c: Extract<VnDiagramConfig, { chartType: 'pie' }> }) {
  const total = c.data.reduce((a, d) => a + d.value, 0) || 1
  const R = 15.915
  let fore = 0
  return (
    <figure className="m-0" aria-label={`Cirkeldiagram: ${c.data.map((d) => `${d.label} ${medEnhet(d.value, c.unit ?? '%')}`).join(', ')}`}>
      <Rubrik titel={c.title} />
      <div className="flex items-center gap-4 sm:gap-6">
        <svg viewBox="0 0 42 42" width="132" height="132" className="flex-shrink-0 -rotate-90" aria-hidden="true">
          {c.data.map((d, i) => {
            const andel = (d.value / total) * 100
            const el = (
              <circle
                key={d.label}
                cx="21"
                cy="21"
                r={R}
                fill="none"
                stroke="var(--sd)"
                strokeOpacity={STEG[i % STEG.length]}
                strokeWidth="8"
                strokeDasharray={`${Math.max(0, andel - 0.6)} ${100 - Math.max(0, andel - 0.6)}`}
                strokeDashoffset={-fore}
              />
            )
            fore += andel
            return el
          })}
        </svg>
        <ul className="m-0 flex min-w-0 list-none flex-col gap-1.5 p-0" aria-hidden="true">
          {c.data.map((d, i) => (
            <li key={d.label} className="flex items-center gap-2 text-[13px] leading-[18px]">
              <i className="block h-3 w-3 flex-shrink-0 rounded-[3px]" style={{ background: 'var(--sd)', opacity: STEG[i % STEG.length] }} />
              <span className="min-w-0 text-ink-2">{d.label}</span>
              <b className="ml-auto whitespace-nowrap pl-2 font-semibold tabular-nums text-ink-1">{medEnhet(d.value, c.unit ?? '%')}</b>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  )
}

export default function VnDiagram({ config }: { config: unknown }) {
  const c = config as VnDiagramConfig | null
  if (!c || !Array.isArray((c as { data?: unknown }).data) || !c.data.length) return null
  return (
    <div className={`${s.diagram} max-h-[240px] overflow-hidden`} data-vn-diagram={c.chartType}>
      {c.chartType === 'bar' ? <Staplar c={c} /> : c.chartType === 'pie' ? <Munk c={c} /> : <Linje c={c} />}
    </div>
  )
}
