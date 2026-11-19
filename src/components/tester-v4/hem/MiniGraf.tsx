/**
 * Minigrafen i ingångskortet Din utveckling (skissen Hem A): fyra veckor i
 * en testtyp på skalan 1 till 10 med zonerna Grund, Avancerad och Expert.
 * Nivåkollerna som ringar med linje (den senaste fylld, med talet),
 * träningarna med nivå som små punkter, andra mätta typer nedtonade i grått.
 * Med provdatum inom tre veckor går axeln fram till provdagen, streckad.
 *
 * Ritas i två viewBoxar (mobil 340, dator 560) och visas per brytpunkt, så
 * att axeltexten aldrig skalas. Övningsproven står under grafen, aldrig på
 * nivåaxeln. Server component, bara tokens.
 */

import { dagarMellan, laggTill } from '@/lib/traning/datum'
import { kortDatum } from '@/lib/traning/rubrik'
import { talText } from '@/components/tester-v4/Nivaband'
import { KURVA_DAGAR } from '@/lib/tester/v4/modell'
import { DELTYP_NAMN } from '@/lib/traning/mittTest'
import type { Dag, PlanV4, TestTypId, UtvecklingsPunkt } from '@/lib/tester/v4/typer'
import { HEM_V4 } from './copy'

const U = HEM_V4.ingangUtv

/** Provdagen ritas in när den ligger högst så här långt fram. */
export const PROV_INOM_DAGAR = 21
/** Andra typer i grått, högst så här många. */
const ANDRA_MAX = 2

interface Geo {
  W: number
  H: number
  L: number
  R: number
  T: number
  /** Grafytans underkant. */
  B: number
  r: number
}

const GEO: Record<'mobil' | 'dator', Geo> = {
  mobil: { W: 340, H: 226, L: 30, R: 14, T: 14, B: 190, r: 5.5 },
  dator: { W: 560, H: 244, L: 44, R: 40, T: 16, B: 200, r: 6 },
}

const arMatning = (p: UtvecklingsPunkt) => p.slag === 'nivakoll' && p.niva != null && p.raknas

export interface MiniGrafModell {
  fran: Dag
  till: Dag
  idag: Dag
  provdag: Dag | null
  fokus: TestTypId
  matningar: UtvecklingsPunkt[]
  traningar: UtvecklingsPunkt[]
  andra: { typ: TestTypId; punkter: UtvecklingsPunkt[] }[]
}

/** Grafens innehåll ur kurvan. Ren, testas. */
export function miniGrafModell(kurva: readonly UtvecklingsPunkt[], fokus: TestTypId, idag: Dag, plan: PlanV4 | null): MiniGrafModell {
  const fran = laggTill(idag, -(KURVA_DAGAR - 1))
  const pd = plan?.provdatum ?? null
  const provdag = pd && pd > idag && dagarMellan(idag, pd) <= PROV_INOM_DAGAR ? pd : null
  const egna = kurva.filter((p) => p.typ === fokus && p.dag >= fran)
  const andraTyper = [...new Set(kurva.filter((p) => p.typ !== fokus && arMatning(p)).map((p) => p.typ))]
    .map((typ) => ({ typ, punkter: kurva.filter((p) => p.typ === typ && arMatning(p)) }))
    .sort((a, b) => (a.punkter.at(-1)!.dag < b.punkter.at(-1)!.dag ? 1 : -1))
    .slice(0, ANDRA_MAX)
  return {
    fran,
    till: provdag ?? idag,
    idag,
    provdag,
    fokus,
    matningar: egna.filter(arMatning),
    traningar: egna.filter((p) => p.slag === 'trana' && p.niva != null),
    andra: andraTyper,
  }
}

export function harKurva(m: MiniGrafModell): boolean {
  return m.matningar.length > 0 || m.traningar.length > 0
}

function GrafSvg({ m, bredd, planNamn, aria }: { m: MiniGrafModell; bredd: 'mobil' | 'dator'; planNamn: string | null; aria: string }) {
  const g = GEO[bredd]
  const span = Math.max(1, dagarMellan(m.fran, m.till))
  const x = (d: Dag) => g.L + (dagarMellan(m.fran, d) / span) * (g.W - g.L - g.R)
  const y = (v: number) => g.T + ((10 - Math.min(10, Math.max(1, v))) / 9) * (g.B - g.T)
  const yZon = (v: number) => g.T + ((10 - v) / 9) * (g.B - g.T)
  const xIdag = x(m.idag)
  const xSlut = g.W - g.R
  const etikett = { fontSize: 10.5, fontWeight: 600 }
  const axel = { fontSize: 11, fontWeight: 500, fill: 'var(--ink-3)' }
  const mitten = laggTill(m.fran, 14)
  const sista = m.matningar.at(-1)
  const linje = m.matningar.map((p) => `${x(p.dag).toFixed(1)},${y(p.niva!).toFixed(1)}`).join(' ')
  const ringR = g.r

  return (
    <svg viewBox={`0 0 ${g.W} ${g.H}`} role="img" aria-label={aria} className="block h-auto w-full overflow-visible" data-minigraf={bredd}>
      <rect x={g.L} y={yZon(10)} width={xSlut - g.L} height={yZon(7) - yZon(10)} style={{ fill: 'var(--papper-2)' }} />
      <rect x={g.L} y={yZon(7)} width={xSlut - g.L} height={yZon(4) - yZon(7)} style={{ fill: 'var(--ton)' }} opacity={planNamn ? 0.55 : 0.3} />
      <rect x={g.L} y={yZon(4)} width={xSlut - g.L} height={yZon(1) - yZon(4)} style={{ fill: 'var(--papper-2)' }} />
      <text x={g.L + 6} y={yZon(10) + 15} style={{ ...etikett, fill: 'var(--ink-3)' }}>
        Expert
      </text>
      <text x={g.L + 6} y={yZon(7) + 15} style={{ ...etikett, fill: planNamn ? 'var(--ton-ink)' : 'var(--ink-3)' }}>
        {planNamn ? U.axel.provetsNiva : 'Avancerad'}
      </text>
      <text x={g.L + 6} y={yZon(4) + 15} style={{ ...etikett, fill: 'var(--ink-3)' }}>
        Grund
      </text>
      {[10, 7, 4, 1].map((v) => (
        <text key={v} x={g.L - 8} y={yZon(v) + 4} textAnchor="end" style={{ fontSize: 10.5, fill: 'var(--ink-3)' }}>
          {v}
        </text>
      ))}
      <line x1={g.L} y1={g.B} x2={xSlut} y2={g.B} style={{ stroke: 'var(--kant-stark)' }} strokeWidth={1} />
      {m.provdag ? (
        <>
          <line x1={xIdag} y1={g.T} x2={xIdag} y2={g.B + 8} style={{ stroke: 'var(--kant-stark)' }} strokeWidth={1.2} />
          <line x1={xSlut} y1={g.T} x2={xSlut} y2={g.B + 8} style={{ stroke: 'var(--ink-3)' }} strokeWidth={1.4} strokeDasharray="4 4" />
        </>
      ) : null}

      {m.andra.map((a) => {
        const pts = a.punkter.filter((p) => p.dag >= m.fran)
        const s = pts.at(-1)
        if (!s) return null
        const sx = x(s.dag)
        const hoger = sx < xSlut - 120
        return (
          <g key={a.typ} data-andra={a.typ}>
            {pts.length > 1 ? (
              <polyline
                points={pts.map((p) => `${x(p.dag).toFixed(1)},${y(p.niva!).toFixed(1)}`).join(' ')}
                fill="none"
                style={{ stroke: 'var(--ink-3)' }}
                opacity={0.6}
                strokeWidth={2}
                strokeLinecap="round"
              />
            ) : null}
            {pts.map((p) => (
              <circle key={p.id} cx={x(p.dag)} cy={y(p.niva!)} r={ringR - 1} style={{ fill: 'var(--papper)', stroke: 'var(--ink-3)' }} strokeWidth={2} />
            ))}
            <text x={hoger ? sx + 10 : sx - 10} y={y(s.niva!) - 6} textAnchor={hoger ? 'start' : 'end'} style={{ fontSize: 10.5, fontWeight: 500, fill: 'var(--ink-3)' }}>
              {DELTYP_NAMN[a.typ]}
            </text>
          </g>
        )
      })}

      {m.traningar.map((p) => (
        <circle key={p.id} cx={x(p.dag)} cy={y(p.niva!)} r={3} style={{ fill: 'var(--koppar-ljus)' }} data-trana />
      ))}

      {m.matningar.length > 1 ? (
        <polyline points={linje} fill="none" style={{ stroke: 'var(--koppar)' }} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      ) : null}
      {m.matningar.map((p) => {
        const ar = p === sista
        const px = x(p.dag)
        const py = y(p.niva!)
        return (
          <g key={p.id} data-nivakoll={talText(p.niva!)}>
            <circle
              cx={px}
              cy={py}
              r={ar ? ringR + 1 : ringR}
              style={{ fill: ar ? 'var(--koppar)' : 'var(--papper)', stroke: ar ? 'var(--papper)' : 'var(--koppar)' }}
              strokeWidth={2.5}
            />
            <text
              x={px}
              y={ar ? py - 12 : py + 19}
              textAnchor="middle"
              className={ar ? 'font-display' : undefined}
              style={{ fontSize: ar ? 13 : 10.5, fontWeight: ar ? 800 : 600, fill: 'var(--koppar-ink)' }}
            >
              {talText(p.niva!)}
            </text>
          </g>
        )
      })}

      <text x={g.L} y={g.B + 22} textAnchor="start" style={axel}>
        {kortDatum(m.fran)}
      </text>
      {x(mitten) - g.L > 70 && xIdag - x(mitten) > 70 ? (
        <text x={x(mitten)} y={g.B + 22} textAnchor="middle" style={axel}>
          {kortDatum(mitten)}
        </text>
      ) : null}
      {m.provdag ? (
        <>
          {xSlut - xIdag > 46 ? (
            // Provdagens etikett är längre på dator: står de nära slutar "i dag" vid linjen i stället för att centreras.
            <text
              x={bredd === 'dator' && xSlut - xIdag < 110 ? xIdag - 4 : xIdag}
              y={g.B + 22}
              textAnchor={bredd === 'dator' && xSlut - xIdag < 110 ? 'end' : 'middle'}
              style={{ ...axel, fontWeight: 700, fill: 'var(--ink-1)' }}
            >
              {U.axel.idag}
            </text>
          ) : null}
          <text x={xSlut} y={g.B + 22} textAnchor="end" style={axel}>
            {bredd === 'mobil' ? U.axel.provet : U.axel.provetDag(kortDatum(m.provdag))}
          </text>
        </>
      ) : (
        <text x={xSlut} y={g.B + 22} textAnchor="end" style={{ ...axel, fontWeight: 700, fill: 'var(--ink-1)' }}>
          {U.axel.idag}
        </text>
      )}
    </svg>
  )
}

export default function MiniGraf({ m, planNamn }: { m: MiniGrafModell; planNamn: string | null }) {
  const typ = DELTYP_NAMN[m.fokus].toLowerCase()
  const aria = U.grafAria(typ, kortDatum(m.fran), m.provdag ? U.axel.provetDag(kortDatum(m.provdag)) : U.axel.idag, m.matningar.map((p) => talText(p.niva!)).join(', '))
  return (
    <div data-minigraf-rot>
      <div className="sm:hidden">
        <GrafSvg m={m} bredd="mobil" planNamn={planNamn} aria={aria} />
      </div>
      <div className="hidden sm:block">
        <GrafSvg m={m} bredd="dator" planNamn={planNamn} aria={aria} />
      </div>
    </div>
  )
}
