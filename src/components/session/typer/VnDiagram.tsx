'use client'

/**
 * Diagrammen i Siffror och tabeller i ramen (plan-testflode-2026-11-20
 * avsnitt 3.6, omgång 2 steg B1, skissen Siffror-diagram-facit).
 *
 *   Staplar och linjer: y-axel med tre till fyra rena skalstreck och
 *   hårlinjer i kant, nollan syns alltid i stapeldiagram. Höjden är 220 px
 *   på mobil och 280 px på dator. Staplar högst 24 px breda med 4 px rundad
 *   topp och rak fot; linjen 2 px med 8 px punkter och 2 px papperring.
 *   Munken: en kulör i fyra ljushetssteg, 2 px ytgap mellan segmenten,
 *   värdet inne i ringen när segmentet rymmer det, legenden med värden kvar.
 *
 * diagram-test i fyra ljushetssteg, ink för all text (aldrig seriens färg),
 * ingen legend för en serie: rubriken säger vad som visas. Alla värden står
 * utskrivna, eftersom uppgifterna kräver exakta tal; därför inget
 * hovringslager (det skulle bara upprepa etiketterna).
 *
 * Text står som HTML, inte som SVG-text, så att etiketterna har samma
 * storlek på telefonen som på datorn. Bara linjen och munkringen är SVG.
 *
 * Markeringen i facit (`markering`): staplarna eller punkterna som facit
 * räknar på får positiv ram och de andra dämpas till 38 %. Formen finns;
 * banken har ännu inte vilka staplar en uppgift räknar på, så ingen typ
 * skickar den än (ingen markering hellre än en gissning).
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

/** Facits markering: index i diagrammets data. */
export interface DiagramMarkering {
  index: number[]
}

/** De fyra stegen; ett femte segment får det ljusaste med glesare yta. */
const STEG = [1, 0.75, 0.55, 0.4, 0.26]

/** Värdet med kort enhet ("12 kg", "45 %"), annars bara talet; längre enheter ("MSEK") står en gång under diagrammet. */
function etikett(v: number, unit?: string): string {
  const e = (unit ?? '').trim()
  return e && e.length <= 2 ? medEnhet(v, e) : formatTal(v)
}
const langEnhet = (unit?: string) => ((unit ?? '').trim().length > 2 ? (unit ?? '').trim() : null)

/** Rena skalsteg (1, 2, 2,5 eller 5 gånger en tiopotens), tre till fyra intervall. */
export function skala(lag: number, hog: number): { min: number; max: number; steg: number; streck: number[] } {
  const span = Math.max(hog - lag, Math.abs(hog) * 0.1, 1e-9)
  const ratt = span / 4
  const p = Math.pow(10, Math.floor(Math.log10(ratt)))
  const steg = [1, 2, 2.5, 5, 10].map((m) => m * p).find((x) => span / x <= 4) ?? 10 * p
  const min = Math.floor(lag / steg) * steg
  const max = Math.ceil(hog / steg) * steg
  const streck: number[] = []
  for (let v = min; v <= max + steg / 2; v += steg) streck.push(Number(v.toFixed(10)))
  return { min, max: max === min ? min + steg : max, steg, streck }
}

const HOJD = 'h-[220px] lg:h-[280px]'
/** Plottens inre luft: 20 px ovanför för värdena, 24 px under för x-etiketterna, 44 px till vänster för skalan. */
const PLOT = 'absolute bottom-6 left-11 right-0 top-5'

function Rubrik({ titel, axel }: { titel?: string; axel?: string }) {
  if (!titel && !axel) return null
  return (
    <p className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 text-[13px] leading-[18px]">
      {titel ? <span className="font-semibold text-ink-1">{titel}</span> : <span />}
      {axel ? <span className="text-ink-3">{axel}</span> : null}
    </p>
  )
}

/** Skalan och hårlinjerna; `y(v)` ger procent uppifrån i plotten. */
function Axel({ streck, y }: { streck: number[]; y: (v: number) => number }) {
  return (
    <div className={PLOT} aria-hidden="true">
      {streck.map((v) => (
        <div key={v} className="absolute inset-x-0" style={{ top: `${y(v)}%` }}>
          <i className={`absolute inset-x-0 top-0 block h-px ${v === 0 ? 'bg-kant-stark' : 'bg-kant'}`} />
          <span className="absolute -left-11 top-0 w-9 -translate-y-1/2 text-right text-[11px] leading-[14px] tabular-nums text-ink-3">{formatTal(v)}</span>
        </div>
      ))}
    </div>
  )
}

function Staplar({ c, markering }: { c: Extract<VnDiagramConfig, { chartType: 'bar' }>; markering?: DiagramMarkering | null }) {
  const varden = c.data.map((d) => d.value)
  const sk = skala(Math.min(0, ...varden), Math.max(0, ...varden))
  const y = (v: number) => ((sk.max - v) / (sk.max - sk.min)) * 100
  const noll = y(0)
  const markerad = (i: number) => (markering ? markering.index.includes(i) : null)
  return (
    <figure className="m-0" aria-label={`Stapeldiagram: ${c.data.map((d) => `${d.label} ${medEnhet(d.value, c.unit ?? '')}`).join(', ')}`}>
      <Rubrik titel={c.title} axel={c.yAxisLabel} />
      <div className={`relative ${HOJD}`} aria-hidden="true" data-diagram-plot>
        <Axel streck={sk.streck} y={y} />
        <div className={`${PLOT} flex`}>
          {c.data.map((d, i) => {
            const m = markerad(i)
            const topp = y(Math.max(0, d.value))
            const hojd = Math.abs(noll - y(d.value))
            return (
              <div key={d.label} className={`relative h-full min-w-0 flex-1 ${m === false ? 'opacity-[.38]' : ''}`} data-stapel={i} data-markerad={m ? '' : undefined}>
                <span
                  className={`${s.stapel} absolute left-1/2 w-[min(24px,70%)] -translate-x-1/2 ${d.value < 0 ? 'rounded-b-[4px]' : 'rounded-t-[4px]'} ${m ? s.markerad : ''}`}
                  style={{ top: `${topp}%`, height: `max(2px, ${hojd}%)`, background: 'var(--sd)' }}
                />
                <span
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap pb-1 text-[12px] font-semibold leading-4 tabular-nums text-ink-1"
                  style={{ top: `${topp}%` }}
                >
                  {etikett(d.value, c.unit)}
                </span>
                <span className="absolute inset-x-0 -bottom-6 truncate px-0.5 text-center text-[11px] leading-5 text-ink-3 sm:text-[12px]">{d.label}</span>
              </div>
            )
          })}
        </div>
      </div>
      {langEnhet(c.unit) ? <p className="mt-1.5 text-right text-[11px] leading-4 text-ink-3">{langEnhet(c.unit)}</p> : null}
    </figure>
  )
}

function Linje({ c, markering }: { c: Extract<VnDiagramConfig, { chartType: 'line' }>; markering?: DiagramMarkering | null }) {
  const ys = c.data.map((d) => d.y)
  const lagst = Math.min(...ys)
  const hogst = Math.max(...ys)
  // Nollan tas med när den ligger nära; annars en ren skala runt värdena.
  const sk = skala(lagst >= 0 && lagst <= (hogst - lagst) * 1.5 ? 0 : lagst - (hogst - lagst) * 0.15, hogst)
  const y = (v: number) => ((sk.max - v) / (sk.max - sk.min)) * 100
  const n = c.data.length
  const x = (i: number) => (n <= 1 ? 50 : 4 + (i / (n - 1)) * 92)
  const linje = c.data.map((d, i) => `${i ? 'L' : 'M'} ${x(i)} ${y(d.y)}`).join(' ')
  const yta = `${linje} L ${x(n - 1)} 100 L ${x(0)} 100 Z`
  const markerad = (i: number) => (markering ? markering.index.includes(i) : null)
  return (
    <figure className="m-0" aria-label={`Linjediagram: ${c.data.map((d) => `${d.x} ${medEnhet(d.y, c.unit ?? '')}`).join(', ')}`}>
      <Rubrik titel={c.title} axel={c.yAxisLabel} />
      <div className={`relative ${HOJD}`} aria-hidden="true" data-diagram-plot>
        <Axel streck={sk.streck} y={y} />
        <div className={PLOT}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
            <path d={yta} fill="var(--sd)" opacity=".1" />
            <path d={linje} fill="none" stroke="var(--sd)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
          {c.data.map((d, i) => {
            const m = markerad(i)
            return (
              <span key={i} className={`absolute ${m === false ? 'opacity-[.38]' : ''}`} style={{ left: `${x(i)}%`, top: `${y(d.y)}%` }} data-punkt={i}>
                <i
                  className={`absolute -left-[6px] -top-[6px] block h-3 w-3 rounded-full border-2 border-[color:var(--papper)] ${m ? s.markeradPunkt : ''}`}
                  style={{ background: 'var(--sd)' }}
                />
                <b className="absolute -top-6 left-0 -translate-x-1/2 whitespace-nowrap text-[12px] font-semibold leading-4 tabular-nums text-ink-1">{etikett(d.y, c.unit)}</b>
              </span>
            )
          })}
          <div className="absolute inset-x-0 -bottom-6 h-5">
            {c.data.map((d, i) => (
              <span key={i} className="absolute -translate-x-1/2 whitespace-nowrap text-[11px] leading-5 text-ink-3 sm:text-[12px]" style={{ left: `${x(i)}%` }}>
                {d.x}
              </span>
            ))}
          </div>
        </div>
      </div>
      {c.xAxisLabel || langEnhet(c.unit) ? (
        <p className="mt-1.5 flex justify-between text-[11px] leading-4 text-ink-3">
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
  const segment = c.data.map((d, i) => {
    const andel = (d.value / total) * 100
    const mitt = fore + andel / 2
    const start = fore
    fore += andel
    // Mittvinkeln från klockan tolv, medurs.
    const v = (mitt / 100) * 2 * Math.PI - Math.PI / 2
    return { d, i, andel, start, lx: 21 + R * Math.cos(v), ly: 21 + R * Math.sin(v) }
  })
  return (
    <figure className="m-0" aria-label={`Cirkeldiagram: ${c.data.map((d) => `${d.label} ${medEnhet(d.value, c.unit ?? '%')}`).join(', ')}`}>
      <Rubrik titel={c.title} />
      <div className="flex items-center gap-4 sm:gap-7">
        <svg viewBox="0 0 42 42" width="140" height="140" className="flex-shrink-0" aria-hidden="true">
          <g transform="rotate(-90 21 21)">
            {segment.map(({ d, i, andel, start }) => (
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
                strokeDashoffset={-start}
              />
            ))}
          </g>
          {segment.map(({ d, i, andel, lx, ly }) =>
            andel >= 8 ? (
              <text
                key={d.label}
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="3.4"
                fontWeight="600"
                fill={STEG[i % STEG.length] >= 0.75 ? 'var(--sd-pa)' : 'var(--ink-1)'}
                className="tabular-nums"
              >
                {formatTal(d.value)}
              </text>
            ) : null
          )}
        </svg>
        <ul className="m-0 flex min-w-0 flex-1 list-none flex-col gap-1.5 p-0" aria-hidden="true">
          {c.data.map((d, i) => (
            <li key={d.label} className="flex items-center gap-2 text-[13px] leading-[18px] lg:text-sm lg:leading-5">
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

export default function VnDiagram({ config, markering = null }: { config: unknown; markering?: DiagramMarkering | null }) {
  const c = config as VnDiagramConfig | null
  if (!c || !Array.isArray((c as { data?: unknown }).data) || !c.data.length) return null
  return (
    <div className={s.diagram} data-vn-diagram={c.chartType}>
      {c.chartType === 'bar' ? <Staplar c={c} markering={markering} /> : c.chartType === 'pie' ? <Munk c={c} /> : <Linje c={c} markering={markering} />}
    </div>
  )
}
