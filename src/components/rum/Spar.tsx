/**
 * Spåret (spec-rummen 4.4, konceptets J1 och J2): Jobbsökets instrument på
 * väggen. En rad per sökt tjänst och fyra stationer, Sökt, Svar, Intervju
 * och Erbjudande. Kopparlinjen går fram till den station tjänsten nått, den
 * aktuella punkten är r 6,5 med lyster, en tyst tjänst står som ihålig
 * kopparring vid Sökt med antalet dagar bredvid.
 *
 * Två viewBoxar i stället för skalad text (W1-kravet): mobil 380 bred,
 * dator 420. 40 px per rad. Text i SVG bara 11 och 13 px, och hela läget
 * läses upp av aria-label.
 *
 * Ingen hook utom useId (unika gradient-id), så komponenten kan stå i både
 * server- och klientträd.
 */

import { useId } from 'react'
import type { SparRad } from '@/lib/rum/jobbsok'
import { SPAR } from '@/lib/rum/copy'

export interface SparProps {
  rader: SparRad[]
  bredd: 'mobil' | 'dator'
  ariaLabel: string
  className?: string
}

const GEOMETRI = {
  mobil: { w: 380, x: [100, 186, 272, 358], namnMax: 12 },
  dator: { w: 420, x: [116, 210, 304, 398], namnMax: 14 },
} as const

const RAD = 40
const TOPP = 40

function kortaNamn(namn: string, max: number): string {
  return namn.length > max ? `${namn.slice(0, max - 1).trimEnd()}…` : namn
}

export default function Spar({ rader, bredd, ariaLabel, className }: SparProps) {
  const id = useId().replace(/:/g, '')
  const g = GEOMETRI[bredd]
  const h = TOPP + RAD * (rader.length - 1) + 26
  const sista = g.x[3]
  return (
    <div className={className}>
      <svg viewBox={`0 0 ${g.w} ${h}`} role="img" aria-label={ariaLabel} className="block h-auto w-full overflow-visible">
        <defs>
          <radialGradient id={`${id}-lyster`} cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="var(--koppar-ljus)" stopOpacity=".55" />
            <stop offset=".55" stopColor="var(--koppar)" stopOpacity=".18" />
            <stop offset="1" stopColor="var(--koppar)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {SPAR.stationer.map((s, i) => (
          <text
            key={s}
            x={g.x[i]}
            y={12}
            textAnchor={i === 3 ? 'end' : 'middle'}
            fontSize={11}
            fontWeight={500}
            fill="var(--vagg-mjuk)"
          >
            {s}
          </text>
        ))}
        {rader.map((r, i) => {
          const y = TOPP + RAD * i
          const xNu = g.x[r.station]
          return (
            <g key={r.id}>
              <text x={0} y={y + 4} fontSize={13} fontWeight={700} fill="var(--vagg-ink)" className="font-display">
                {kortaNamn(r.namn, g.namnMax)}
              </text>
              <line x1={g.x[0]} x2={sista} y1={y} y2={y} stroke="var(--vagg-kant)" strokeWidth={2} />
              {r.station > 0 ? (
                <line x1={g.x[0]} x2={xNu} y1={y} y2={y} stroke="var(--koppar)" strokeWidth={2.5} />
              ) : null}
              {g.x.map((x, j) => {
                if (j < r.station) return <circle key={j} cx={x} cy={y} r={4} fill="var(--koppar)" stroke="var(--koppar)" strokeWidth={1.5} />
                if (j > r.station)
                  return <circle key={j} cx={x} cy={y} r={4} fill="var(--vagg)" stroke="var(--vagg-mjuk)" strokeWidth={1.5} />
                if (r.tyst)
                  return <circle key={j} cx={x} cy={y} r={6.5} fill="var(--vagg)" stroke="var(--koppar)" strokeWidth={2} />
                return (
                  <g key={j}>
                    <circle cx={x} cy={y} r={12} fill={`url(#${id}-lyster)`} />
                    <circle cx={x} cy={y} r={6.5} fill="var(--koppar)" stroke="var(--vagg)" strokeWidth={3} />
                  </g>
                )
              })}
              {r.etikett ? (
                r.tyst ? (
                  <text x={xNu + 16} y={y + 4} fontSize={11} fontWeight={500} fill="var(--vagg-mjuk)">
                    {r.etikett}
                  </text>
                ) : (
                  <text
                    x={xNu}
                    y={y + 22}
                    textAnchor={r.station === 3 ? 'end' : 'middle'}
                    fontSize={11}
                    fontWeight={r.station === 2 ? 600 : 500}
                    fill={r.station === 2 ? 'var(--koppar-ljus)' : 'var(--vagg-mjuk)'}
                  >
                    {r.etikett}
                  </text>
                )
              ) : null}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
