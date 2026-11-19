'use client'

/**
 * Grafen i Din utveckling (planen 3.4, skissens graf()): ren SVG, ingen
 * diagramkod. Serverritad första bild via SSR av klientkomponenten, fast
 * viewBox och höjd ur bredden, så inget hoppar (CLS 0).
 *
 * Tangentbordet: en punkt i taget har tabIndex 0 (rovande fokus). Pilarna
 * går mellan punkterna i tidsordning, Home och End till första och sista,
 * Enter eller mellanslag väljer punkten och visar detaljen under grafen.
 * Varje punkt har en osynlig träffyta på 44 px. Hover förstorar markören men
 * bär aldrig data ensam: detaljen nås med tryck och tangentbord.
 */

import { useRef, useState, type KeyboardEvent } from 'react'
import type { TestTypId } from '@/lib/tester/v4/typer'
import { kortDatum } from '@/lib/traning/rubrik'
import { nastaIndex, nivaText, TRAFF_R, type GrafModell, type Markor, type Ton } from './geometri'
import { UTV, slagEtikett } from './copy'
import Tidslinje from './Tidslinje'
import s from './serier.module.css'

export function tonFarg(ton: Ton, typ: TestTypId): string {
  if (ton === 'koppar') return 'var(--koppar)'
  if (ton === 'neutral') return 'var(--ink-3)'
  return `var(--utv-${typ})`
}

/** Punktens namn för skärmläsaren: typ, slag, datum och värdet. */
export function punktEtikett(m: Markor, namn: Record<TestTypId, string>): string {
  const p = m.punkt
  const delar = [namn[p.typ], slagEtikett(p).toLowerCase(), kortDatum(p.dag)]
  if (p.slag === 'ovningsprov' && p.resultat) delar.push(`${p.resultat.ratt} av ${p.resultat.antal} rätt`)
  else if (p.niva != null) delar.push(`nivå ${nivaText(p.niva)}`)
  if (!p.raknas) delar.push(UTV.detalj.raknasInte.toLowerCase())
  return delar.join(', ')
}

export interface GrafProps {
  modell: GrafModell
  namn: Record<TestTypId, string>
  valdId: string | null
  onValj: (id: string) => void
  /** Unikt per instans (mobil och dator ritas båda). */
  idPrefix: string
  /** Detaljytan som valet visas i. */
  detaljId: string
}

export default function Graf({ modell, namn, valdId, onValj, idPrefix, detaljId }: GrafProps) {
  const { matt, valbara } = modell
  const valdIndex = valbara.findIndex((m) => m.punkt.id === valdId)
  const [fokus, setFokus] = useState<number | null>(null)
  const [synligFokus, setSynligFokus] = useState<string | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const refs = useRef<Map<string, SVGGElement>>(new Map())

  const tabbIndex = fokus != null && fokus < valbara.length ? fokus : valdIndex >= 0 ? valdIndex : valbara.length - 1

  const flytta = (e: KeyboardEvent<SVGGElement>, i: number, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onValj(id)
      return
    }
    const n = nastaIndex(i, valbara.length, e.key)
    if (n == null) return
    e.preventDefault()
    setFokus(n)
    refs.current.get(valbara[n].punkt.id)?.focus()
  }

  const valbarIndex = new Map(valbara.map((m, i) => [m.punkt.id, i]))
  const plotH = matt.yTid + 10

  return (
    <svg
      viewBox={`0 0 ${matt.W} ${matt.H}`}
      role="group"
      aria-label={UTV.graf.aria}
      className={`block h-auto w-full overflow-visible ${s.rot}`}
      data-graf={idPrefix}
    >
      {/* Zonerna: hårlinjer vid gränserna, namnet uppe till vänster i varje zon. */}
      <g aria-hidden="true">
        {modell.yTicks.map((t) => (
          <g key={t.v}>
            <line x1={matt.L} x2={matt.W - matt.R} y1={t.y} y2={t.y} style={{ stroke: 'var(--kant)' }} strokeWidth={1} />
            <text x={matt.L - 8} y={t.y + 4} textAnchor="end" className="text-ax" style={{ fill: 'var(--ink-3)' }}>
              {t.v}
            </text>
          </g>
        ))}
        {(matt.zonNamn ? modell.zoner : []).map((z) => (
          <text
            key={z.namn}
            x={matt.L + 6}
            y={z.yTopp + 14}
            className="text-ax"
            style={{ fill: 'var(--ink-3)', stroke: 'var(--papper)', strokeWidth: 3, paintOrder: 'stroke' }}
          >
            {UTV.graf.zon[z.namn]}
          </text>
        ))}
        <Tidslinje matt={matt} />
        {modell.provX != null ? (
          <g data-provdag>
            <line
              x1={modell.provX}
              x2={modell.provX}
              y1={matt.T - 8}
              y2={plotH}
              style={{ stroke: 'var(--ink-3)' }}
              strokeWidth={1.5}
              strokeDasharray="3 4"
            />
            <text x={modell.provX - 4} y={matt.T - 10} textAnchor="end" className="text-ax" style={{ fill: 'var(--ink-2)' }}>
              {UTV.graf.provet}
            </text>
          </g>
        ) : null}
        {modell.datum.map((d) => (
          <text key={d.slag} x={d.x} y={matt.yDatum} textAnchor={d.anchor} className="text-ax" style={{ fill: d.slag === 'idag' ? 'var(--ink-1)' : 'var(--ink-3)', fontWeight: d.slag === 'idag' ? 600 : 500 }}>
            {d.slag === 'idag' ? UTV.graf.idag : kortDatum(d.text)}
          </text>
        ))}
      </g>

      {/* Linjerna: nedtonade först, planens sist. */}
      <g aria-hidden="true">
        {modell.linjer.map((l) =>
          l.d ? (
            <path
              key={l.typ}
              d={l.d}
              fill="none"
              style={{ stroke: tonFarg(l.ton, l.typ) }}
              strokeWidth={l.fram ? 2.5 : 2}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={l.dold ? 0.15 : l.ton === 'neutral' ? 0.55 : 1}
              data-linje={l.typ}
            />
          ) : null,
        )}
      </g>

      {/* Den valda punktens lodlinje. */}
      {valdId
        ? modell.markorer
            .filter((m) => m.punkt.id === valdId && !m.dold)
            .map((m) => (
              <line
                key="vald"
                aria-hidden="true"
                x1={m.x}
                x2={m.x}
                y1={matt.T}
                y2={plotH}
                style={{ stroke: tonFarg(m.ton, m.punkt.typ) }}
                strokeWidth={1}
                strokeDasharray="2 3"
              />
            ))
        : null}

      <g role="list" aria-label={UTV.graf.eyebrow}>
        {modell.markorer.map((m) => {
          const id = m.punkt.id
          const i = valbarIndex.get(id)
          const vald = id === valdId
          const stor = vald || hover === id
          const farg = tonFarg(m.ton, m.punkt.typ)
          const op = m.dold ? 0.15 : m.ton === 'neutral' ? 0.6 : 1
          const markor = <Form m={m} farg={farg} stor={stor} vald={vald} />
          if (i == null) {
            return (
              <g key={id} opacity={op} aria-hidden="true">
                {markor}
              </g>
            )
          }
          return (
            <g
              key={id}
              role="listitem"
              opacity={op}
            >
              <g
                ref={(el) => {
                  if (el) refs.current.set(id, el)
                  else refs.current.delete(id)
                }}
                role="button"
                tabIndex={i === tabbIndex ? 0 : -1}
                aria-label={punktEtikett(m, namn)}
                aria-pressed={vald}
                aria-controls={detaljId}
                className={s.punkt}
                data-punkt={id}
                onClick={() => {
                  setFokus(i)
                  onValj(id)
                }}
                onKeyDown={(e) => flytta(e, i, id)}
                onFocus={() => {
                  setFokus(i)
                  setSynligFokus(id)
                }}
                onBlur={() => setSynligFokus((f) => (f === id ? null : f))}
                onPointerEnter={() => setHover(id)}
                onPointerLeave={() => setHover((h) => (h === id ? null : h))}
              >
                <circle cx={m.x} cy={m.y} r={TRAFF_R} fill="transparent" />
                {markor}
                {synligFokus === id ? (
                  <circle cx={m.x} cy={m.y} r={12} fill="none" style={{ stroke: 'var(--fokus)' }} strokeWidth={2} data-fokusring />
                ) : null}
              </g>
            </g>
          )
        })}
      </g>

      {/* Ändetiketterna: planens typer eller den valda, i textens färg. */}
      <g aria-hidden="true">
        {modell.linjer
          .filter((l) => l.etikett)
          .map((l) => (
            <text
              key={l.typ}
              x={(l.etikett as { x: number }).x + 10}
              y={(l.etikett as { y: number }).y - 8}
              className="text-ax"
              style={{
                fill: 'var(--ink-1)',
                fontWeight: 700,
                stroke: 'var(--papper)',
                strokeWidth: 3,
                paintOrder: 'stroke',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {l.etikett?.text}
            </text>
          ))}
      </g>
    </svg>
  )
}

function Form({ m, farg, stor, vald }: { m: Markor; farg: string; stor: boolean; vald: boolean }) {
  const yta = { stroke: 'var(--papper)' }
  switch (m.form) {
    case 'ring':
      return (
        <circle
          cx={m.x}
          cy={m.y}
          r={stor ? 7.5 : 5.5}
          style={{ fill: 'var(--papper)', stroke: farg }}
          strokeWidth={vald ? 3 : 2.5}
          className={s.markor}
          data-form="ring"
        />
      )
    case 'tomring':
      return (
        <circle
          cx={m.x}
          cy={m.y}
          r={stor ? 6.5 : 4.5}
          style={{ fill: 'var(--papper)', stroke: farg }}
          strokeWidth={1.5}
          strokeDasharray="2 2"
          className={s.markor}
          data-form="tomring"
        />
      )
    case 'fyrkant': {
      const k = stor ? 14 : 11
      return (
        <rect
          x={m.x - k / 2}
          y={m.y - k / 2}
          width={k}
          height={k}
          rx={2}
          style={{ ...yta, fill: farg }}
          strokeWidth={1.5}
          data-form="fyrkant"
        />
      )
    }
    default:
      return (
        <circle
          cx={m.x}
          cy={m.y}
          r={stor ? 5.5 : 4}
          style={{ ...yta, fill: farg }}
          strokeWidth={2}
          className={s.markor}
          data-form="punkt"
        />
      )
  }
}
