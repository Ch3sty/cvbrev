'use client'

/**
 * Diagrammen i Siffror och tabeller (omgång 3 steg 2b, skissens
 * Test-siffror-diagram, -cirkel, -linje och Mobil-siffror-diagram).
 *
 *   Staplar   breda staplar med rundad topp, värdet inne i stapelns topp,
 *             hårlinjer i rutnätets färg och en mörk baslinje. Före facit
 *             står alla i seriens indigo; efter facit tänds staplarna frågan
 *             räknar på (losning.anvander.staplar) i koppar och de andra
 *             tonas till den ljusa serien.
 *   Linje     tjock indigo linje, ljus yta under, streckade lod till
 *             baslinjen, vita punkter med indigo ring och värdet ovanför.
 *             Efter facit fylls punkterna i anvander.punkter med koppar.
 *   Munk      sektorerna i seriens färger med värdet på ringen, summan i
 *             mitten när banken har den (centerLabel), legenden till höger
 *             (under på mobil). Efter facit står sektorerna i
 *             anvander.sektorer kvar och legendraden tänds grönt; omfattar
 *             anvander alla sektorer tänds den som är svaret.
 *
 * Text står som HTML, inte som SVG-text, så att etiketterna har samma
 * storlek på telefonen som på datorn; munkens procent står på ringen i SVG.
 * Alla värden står utskrivna, eftersom uppgifterna kräver exakta tal.
 */

import { formatTal, medEnhet } from '@/components/tests/numerical-shared/charts/format'

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

/** Facits markering: etiketterna (staplar, sektorer) eller x-värdena (punkter) som ska tändas. */
export interface DiagramMarkering {
  etiketter: string[]
}

/** Seriens färger per rad och sektor, som tokens. */
export const SERIE = ['var(--sess-serie-1)', 'var(--sess-serie-2)', 'var(--sess-serie-3)', 'var(--sess-serie-4)', 'var(--sess-serie-5)', 'var(--sess-serie-6)']

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

/** Munkens färger: den fjärde är den ljusa serien (skissen Test-siffror-cirkel). */
const MUNK = ['var(--sess-serie-1)', 'var(--sess-serie-2)', 'var(--sess-serie-3)', 'var(--sess-serie-ljus)', 'var(--sess-serie-4)', 'var(--sess-serie-5)']
const MUNK_INK = ['var(--sess-serie-ink)', '#1A1206', '#0E1330', 'var(--ink-1)', '#1A1206', 'var(--sess-serie-ink)']

/** Jämförelse utan skiftläge och extra blanksteg. */
export const lika = (a: string | number, b: string | number) => String(a).replace(/\s+/g, ' ').trim().toLowerCase() === String(b).replace(/\s+/g, ' ').trim().toLowerCase()

/** Värdet med kort enhet ("12 kg", "45 %"), annars bara talet. */
function etikett(v: number, unit?: string): string {
  const e = (unit ?? '').trim()
  return e && e.length <= 2 ? medEnhet(v, e) : formatTal(v)
}

const HOJD = 'h-[200px] lg:h-[300px]'
/** Plottens luft: 16 px ovanför, 30 px under för x-etiketterna, 40 px till vänster för skalan. */
const PLOT = 'absolute bottom-[30px] left-10 right-1 top-4 lg:left-14 lg:right-2'

function Axel({ streck, y }: { streck: number[]; y: (v: number) => number }) {
  return (
    <div className={PLOT} aria-hidden="true">
      {streck.map((v, i) => (
        <div key={v} className="absolute inset-x-0" style={{ top: `${y(v)}%` }}>
          <i
            className="absolute inset-x-0 top-0 block"
            style={i === 0 ? { height: 2.5, marginTop: -1, borderRadius: 2, background: 'var(--sess-brade)' } : { height: 1.5, background: 'var(--sess-rutnat)' }}
          />
          <span className="absolute -left-10 top-0 w-8 -translate-y-1/2 text-right text-[11px] font-medium leading-[14px] text-[color:var(--sess-ink-3)] lg:-left-14 lg:w-11 lg:text-[13px] lg:leading-4">
            {formatTal(v)}
          </span>
        </div>
      ))}
    </div>
  )
}

function Staplar({ c, markering }: { c: Extract<VnDiagramConfig, { chartType: 'bar' }>; markering: DiagramMarkering | null }) {
  const varden = c.data.map((d) => d.value)
  const sk = skala(Math.min(0, ...varden), Math.max(0, ...varden))
  const y = (v: number) => ((sk.max - v) / (sk.max - sk.min)) * 100
  const noll = y(0)
  const tand = (d: Stapel) => (markering ? markering.etiketter.some((e) => lika(e, d.label)) : null)
  const manga = c.data.length > 8
  return (
    <figure className="m-0" aria-label={`Stapeldiagram: ${c.data.map((d) => `${d.label} ${medEnhet(d.value, c.unit ?? '')}`).join(', ')}`} data-diagram-figur="bar">
      <div className={`relative ${HOJD}`} aria-hidden="true" data-diagram-plot>
        {/* Nollan först i streck: baslinjen ritas mörk. */}
        <Axel streck={[0, ...sk.streck.filter((v) => v !== 0)]} y={y} />
        <div className={`${PLOT} flex`}>
          {c.data.map((d, i) => {
            const m = tand(d)
            const topp = y(Math.max(0, d.value))
            const hojd = Math.abs(noll - y(d.value))
            const fyll = m == null ? 'var(--sess-serie-1)' : m ? 'var(--sess-lucka)' : 'var(--sess-serie-ljus)'
            const ink = m == null ? 'var(--sess-serie-ink)' : m ? '#1A1206' : 'var(--ink-1)'
            const inne = hojd > 14
            return (
              <div key={`${d.label}-${i}`} className="relative h-full min-w-0 flex-1" data-stapel={i} data-anvand={m ? '' : undefined}>
                <span
                  className={`sess-stapel absolute left-1/2 -translate-x-1/2 ${manga ? 'w-[70%]' : 'w-[min(60px,62%)]'} ${d.value < 0 ? 'rounded-b-[8px] lg:rounded-b-[12px]' : 'rounded-t-[8px] lg:rounded-t-[12px]'}`}
                  style={{ top: `${topp}%`, height: `max(3px, ${hojd}%)`, background: fyll, animationDelay: `${Math.min(i, 8) * 70}ms` }}
                />
                {/* Värdet inne i stapelns topp på dator när den rymmer det (skissen), ovanför på mobil där stapeln är smal. */}
                <span
                  className={`sess-diagram-tal absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[12px] leading-4 text-ink-1 -translate-y-[calc(100%+4px)] lg:text-[19px] lg:leading-[22px] ${
                    inne && !manga ? 'lg:translate-y-[6px] lg:text-[color:var(--stapel-ink)]' : ''
                  } ${manga ? 'lg:!text-[14px]' : ''}`}
                  style={{ top: `${topp}%`, ['--stapel-ink' as string]: ink }}
                >
                  {etikett(d.value, c.unit)}
                </span>
                <span
                  className={`absolute inset-x-0 -bottom-[26px] truncate px-0.5 text-center text-[11px] leading-5 lg:text-[14px] ${m ? 'font-bold text-ink-1' : 'font-medium text-[color:var(--sess-ink-3)]'}`}
                >
                  {d.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </figure>
  )
}

function Linje({ c, markering }: { c: Extract<VnDiagramConfig, { chartType: 'line' }>; markering: DiagramMarkering | null }) {
  const ys = c.data.map((d) => d.y)
  const lagst = Math.min(...ys)
  const hogst = Math.max(...ys)
  // Nollan tas med när den ligger nära; annars en ren skala runt värdena.
  const sk = skala(lagst >= 0 && lagst <= (hogst - lagst) * 1.5 ? 0 : lagst - (hogst - lagst) * 0.15, hogst)
  const y = (v: number) => ((sk.max - v) / (sk.max - sk.min)) * 100
  const n = c.data.length
  const x = (i: number) => (n <= 1 ? 50 : 5 + (i / (n - 1)) * 90)
  const linje = c.data.map((d, i) => `${i ? 'L' : 'M'} ${x(i)} ${y(d.y)}`).join(' ')
  const yta = `${linje} L ${x(n - 1)} 100 L ${x(0)} 100 Z`
  const tand = (d: Punkt) => (markering ? markering.etiketter.some((e) => lika(e, d.x)) : null)
  return (
    <figure className="m-0" aria-label={`Linjediagram: ${c.data.map((d) => `${d.x} ${medEnhet(d.y, c.unit ?? '')}`).join(', ')}`} data-diagram-figur="line">
      <div className={`relative ${HOJD}`} aria-hidden="true" data-diagram-plot>
        <Axel streck={[sk.streck[0], ...sk.streck.slice(1)]} y={y} />
        <div className={PLOT}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
            <path d={yta} fill="var(--sess-indigo-mjuk)" />
            {c.data.map((d, i) => (
              <path key={i} d={`M ${x(i)} ${y(d.y)} V 100`} stroke="var(--sess-ruta-kant)" strokeWidth="1.5" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />
            ))}
            <path d={linje} fill="none" stroke="var(--sess-serie-1)" strokeWidth="4" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
          {c.data.map((d, i) => {
            const m = tand(d)
            return (
              <span key={i} className="absolute" style={{ left: `${x(i)}%`, top: `${y(d.y)}%` }} data-punkt={i} data-anvand={m ? '' : undefined}>
                <i
                  className="sess-punkt absolute -left-[7px] -top-[7px] block h-3.5 w-3.5 rounded-full lg:-left-2 lg:-top-2 lg:h-4 lg:w-4"
                  style={{ background: m ? 'var(--sess-lucka)' : 'var(--papper)', border: `3.5px solid ${m ? 'var(--sess-knapp-kant)' : 'var(--sess-serie-1)'}` }}
                />
                <b className="sess-diagram-tal absolute -top-[26px] left-0 -translate-x-1/2 whitespace-nowrap text-[13px] leading-4 text-ink-1 lg:-top-8 lg:text-[18px] lg:leading-[22px]">
                  {etikett(d.y, c.unit)}
                </b>
              </span>
            )
          })}
          <div className="absolute inset-x-0 -bottom-[28px] h-5">
            {c.data.map((d, i) => (
              <span
                key={i}
                className={`absolute -translate-x-1/2 whitespace-nowrap text-[11px] leading-5 lg:text-[14px] ${tand(d) ? 'font-bold text-ink-1' : 'font-medium text-[color:var(--sess-ink-3)]'}`}
                style={{ left: `${x(i)}%` }}
              >
                {d.x}
              </span>
            ))}
          </div>
        </div>
      </div>
      {c.xAxisLabel ? (
        <p className="mt-1 text-center text-[11px] font-semibold uppercase leading-4 tracking-[.08em] text-[color:var(--sess-ink-3)] lg:text-[12px]">{c.xAxisLabel}</p>
      ) : null}
    </figure>
  )
}

/** Mittens rad: "2 400 GWh totalt" blir talet stort och resten under. */
function delaMitt(t: string): { tal: string; rest: string } {
  const m = /^([\d\s.,]+)\s*(.*)$/.exec(t.trim())
  return m ? { tal: m[1].trim().replace(/(\d)\.(\d)/, '$1,$2'), rest: m[2] } : { tal: t, rest: '' }
}

function Munk({ c, markering, svar }: { c: Extract<VnDiagramConfig, { chartType: 'pie' }>; markering: DiagramMarkering | null; svar: string | null }) {
  const total = c.data.reduce((a, d) => a + d.value, 0) || 1
  const R = 110
  const OMKR = 2 * Math.PI * R
  const GAP = 3
  const enhet = c.unit ?? '%'
  // Tänds alla sektorer pekar facit på svaret (det rätta alternativets etikett).
  let tanda = markering ? c.data.filter((d) => markering.etiketter.some((e) => lika(e, d.label))).map((d) => d.label) : null
  if (tanda && tanda.length === c.data.length && svar) {
    const s = c.data.find((d) => lika(d.label, svar))
    tanda = s ? [s.label] : tanda
  }
  const tand = (d: Stapel) => (tanda ? tanda.some((e) => lika(e, d.label)) : null)
  let fore = 0
  const seg = c.data.map((d, i) => {
    const andel = d.value / total
    const start = fore
    fore += andel
    const mitt = (start + andel / 2) * 2 * Math.PI - Math.PI / 2
    return { d, i, andel, start, lx: 160 + R * Math.cos(mitt), ly: 160 + R * Math.sin(mitt) }
  })
  const mittText = c.centerLabel ? delaMitt(c.centerLabel) : null
  return (
    <figure className="m-0" aria-label={`Cirkeldiagram: ${c.data.map((d) => `${d.label} ${medEnhet(d.value, enhet)}`).join(', ')}`} data-diagram-figur="pie">
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-7">
        <svg viewBox="0 0 320 320" className="h-[190px] w-[190px] flex-shrink-0 lg:h-[300px] lg:w-[300px]" aria-hidden="true">
          <g fill="none" strokeWidth="60" transform="rotate(-90 160 160)">
            {seg.map(({ d, i, andel, start }) => (
              <circle
                key={`${d.label}-${i}`}
                className="sess-sektor"
                cx="160"
                cy="160"
                r={R}
                stroke={MUNK[i % MUNK.length]}
                strokeDasharray={`${Math.max(0, andel * OMKR - GAP)} ${OMKR}`}
                strokeDashoffset={-start * OMKR}
                opacity={tand(d) === false ? 0.3 : 1}
              />
            ))}
          </g>
          {seg.map(({ d, i, andel, lx, ly }) =>
            andel >= 0.07 ? (
              <text
                key={`${d.label}-${i}`}
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="22"
                fontWeight="800"
                fontFamily="var(--font-sess-display)"
                fill={MUNK_INK[i % MUNK_INK.length]}
                opacity={tand(d) === false ? 0.45 : 1}
              >
                {medEnhet(d.value, enhet)}
              </text>
            ) : null
          )}
          {mittText ? (
            <>
              <text x="160" y="160" textAnchor="middle" fontFamily="var(--font-sess-display)" fontSize="36" fontWeight="800" fill="var(--ink-1)">
                {mittText.tal}
              </text>
              {mittText.rest ? (
                <text x="160" y="186" textAnchor="middle" fontSize="16" fontWeight="600" fill="var(--sess-ink-3)">
                  {mittText.rest}
                </text>
              ) : null}
            </>
          ) : null}
        </svg>
        <ul className="m-0 flex w-full min-w-0 flex-1 list-none flex-col gap-1 p-0" aria-hidden="true">
          {c.data.map((d, i) => (
            <li key={`${d.label}-${i}`} className="sess-legend" data-anvand={tand(d) ? '' : undefined} style={{ opacity: tand(d) === false ? 0.55 : 1 }}>
              <i style={{ background: MUNK[i % MUNK.length] }} />
              <span className="min-w-0 text-[14px] font-medium leading-5 text-ink-1 lg:text-[16px] lg:leading-[22px]">{d.label}</span>
              <b className="text-ink-1">{medEnhet(d.value, enhet)}</b>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  )
}

export default function VnDiagram({ config, markering = null, svar = null }: { config: unknown; markering?: DiagramMarkering | null; svar?: string | null }) {
  const c = config as VnDiagramConfig | null
  if (!c || !Array.isArray((c as { data?: unknown }).data) || !c.data.length) return null
  return (
    <div data-vn-diagram={c.chartType} data-markerad={markering ? '' : undefined}>
      {c.chartType === 'bar' ? <Staplar c={c} markering={markering} /> : c.chartType === 'pie' ? <Munk c={c} markering={markering} svar={svar} /> : <Linje c={c} markering={markering} />}
    </div>
  )
}
