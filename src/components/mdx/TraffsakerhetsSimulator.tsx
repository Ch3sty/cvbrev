'use client'

import { useState } from 'react'

/**
 * Interaktiv träffsäkerhetssimulator för insikten om urvalsforskningen.
 * Validiteter ur Sackett m.fl. (2022), kombinationen ur samma forskargrupps
 * kompositanalyser. Andelen lyckade rekryteringar beräknas med
 * Taylor-Russell-logik: P(lyckad | vald) under bivariat normalfördelning,
 * givet basfrekvens och selektionskvot.
 */

const METODER = [
  { id: 'ostrukturerad', label: 'Ostrukturerad intervju (magkänsla)', r: 0.19 },
  { id: 'test', label: 'Kognitivt test ensamt', r: 0.31 },
  { id: 'strukturerad', label: 'Strukturerad intervju', r: 0.42 },
  { id: 'kombination', label: 'Strukturerad intervju + test', r: 0.5 },
] as const

// Φ via Abramowitz-Stegun-approximation av felfunktionen
function normCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x))
  const d = 0.3989422804014327 * Math.exp((-x * x) / 2)
  const p =
    d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
  return x >= 0 ? 1 - p : p
}

// Acklams approximation av inversa normalfördelningen
function normInv(p: number): number {
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924]
  const b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857]
  const c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878]
  const d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742]
  const pl = 0.02425
  if (p < pl) {
    const q = Math.sqrt(-2 * Math.log(p))
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  }
  if (p <= 1 - pl) {
    const q = p - 0.5
    const r = q * q
    return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  }
  const q = Math.sqrt(-2 * Math.log(1 - p))
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
}

// P(Y > b | X > a) med korrelation r: numerisk integration över x
function andelLyckade(r: number, basfrekvens: number, selektionskvot: number): number {
  const a = normInv(1 - selektionskvot)
  const b = normInv(1 - basfrekvens)
  const steg = 400
  const bredd = 8
  const h = bredd / steg
  let summa = 0
  for (let i = 0; i <= steg; i++) {
    const x = a + i * h
    const vikt = i === 0 || i === steg ? 1 : i % 2 === 1 ? 4 : 2
    const fi = Math.exp((-x * x) / 2) / Math.sqrt(2 * Math.PI)
    const villkor = 1 - normCdf((b - r * x) / Math.sqrt(1 - r * r))
    summa += vikt * fi * villkor
  }
  const taljare = (summa * h) / 3
  return Math.min(1, taljare / selektionskvot)
}

export default function TraffsakerhetsSimulator() {
  const [metodId, setMetodId] = useState<string>('kombination')
  const [basfrekvens, setBasfrekvens] = useState(50)
  const [selektionskvot, setSelektionskvot] = useState(20)

  const resultat = METODER.map((m) => ({
    ...m,
    andel: andelLyckade(m.r, basfrekvens / 100, selektionskvot / 100),
  }))
  const vald = resultat.find((m) => m.id === metodId) ?? resultat[3]
  const gronaPrickar = Math.round(vald.andel * 10)

  return (
    <div className="not-prose my-10 rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50/70 to-white p-6 sm:p-8">
      <h2 className="text-xl font-black text-slate-900 mb-1">
        Simulera er träffsäkerhet
      </h2>
      <p className="text-sm text-slate-600 mb-6">
        Validiteterna kommer från forskningsgenomgången ovan. Välj metod och
        förutsättningar, så visar simulatorn hur många av tio rekryteringar som
        förväntas lyckas.
      </p>

      {/* Metodval */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
        {METODER.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMetodId(m.id)}
            className={`text-left rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
              m.id === metodId
                ? 'border-orange-600 bg-orange-600 text-white'
                : 'border-orange-200 bg-white text-slate-700 hover:border-orange-400'
            }`}
          >
            {m.label}
            <span className={`block text-xs font-normal mt-0.5 ${m.id === metodId ? 'text-orange-100' : 'text-slate-400'}`}>
              validitet {m.r.toString().replace('.', ',')}
            </span>
          </button>
        ))}
      </div>

      {/* Reglage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label htmlFor="sim-bas" className="text-sm font-bold text-slate-800">
              Andel av kandidaterna som skulle klara rollen
            </label>
            <span className="text-sm font-black text-orange-700 tabular-nums">{basfrekvens} %</span>
          </div>
          <input
            id="sim-bas"
            type="range"
            min={30}
            max={70}
            step={5}
            value={basfrekvens}
            onChange={(e) => setBasfrekvens(Number(e.target.value))}
            className="w-full accent-orange-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>30 %</span>
            <span>70 %</span>
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label htmlFor="sim-kvot" className="text-sm font-bold text-slate-800">
              Andel av kandidaterna ni anställer
            </label>
            <span className="text-sm font-black text-orange-700 tabular-nums">{selektionskvot} %</span>
          </div>
          <input
            id="sim-kvot"
            type="range"
            min={5}
            max={60}
            step={5}
            value={selektionskvot}
            onChange={(e) => setSelektionskvot(Number(e.target.value))}
            className="w-full accent-orange-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>5 %</span>
            <span>60 %</span>
          </div>
        </div>
      </div>

      {/* Utfall: tio rekryteringar */}
      <div className="rounded-xl border border-orange-100 bg-white p-4 sm:p-5 mb-4">
        <p className="text-sm font-bold text-slate-800 mb-3">
          Av tio rekryteringar med {vald.label.toLowerCase()}:
        </p>
        <div className="flex gap-2 mb-2" aria-hidden="true">
          {Array.from({ length: 10 }, (_, i) => (
            <span
              key={i}
              className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full border-2 ${
                i < gronaPrickar
                  ? 'bg-emerald-500 border-emerald-600'
                  : 'bg-slate-100 border-slate-200'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-slate-600">
          <span className="font-black text-emerald-700">{gronaPrickar} av 10</span> förväntas
          bli lyckade ({Math.round(vald.andel * 100)} procent).
        </p>
      </div>

      {/* Jämförelse */}
      <div className="rounded-xl border border-orange-100 bg-white overflow-hidden mb-4">
        {resultat.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-3 px-4 sm:px-5 py-2.5 border-b border-orange-50 last:border-b-0"
          >
            <span className="text-xs sm:text-sm text-slate-600 w-44 sm:w-56 shrink-0">{m.label}</span>
            <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${m.id === metodId ? 'bg-orange-600' : 'bg-orange-300'}`}
                style={{ width: `${Math.round(m.andel * 100)}%` }}
              />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums w-10 text-right">
              {Math.round(m.andel * 100)} %
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-500 mb-0">
        Modellen är en förenkling enligt Taylor-Russell: validiteter ur Sackett
        m.fl. (2022), kombinationens siffra en försiktig sammanvägning ur samma
        forskargrupps kompositanalyser. Den förutsätter att testresultaten är
        kandidatens verifierade egna, oövervakade omtag sänker siffrorna.
      </p>
    </div>
  )
}
