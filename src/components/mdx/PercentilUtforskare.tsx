'use client'

import { useState } from 'react'

/**
 * Interaktiv percentilutforskare för insikten om percentiler och normgrupper.
 * Visar var en percentil hamnar på normalfördelningen, vilken stanine den
 * motsvarar och hur brett det statistiska likvärdighetsspannet är vid en
 * given reliabilitet (95 % konfidens, SEM = SD * sqrt(1 - reliabilitet)).
 */

function normCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x))
  const d = 0.3989422804014327 * Math.exp((-x * x) / 2)
  const p =
    d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
  return x >= 0 ? 1 - p : p
}

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

function stanine(z: number): number {
  return Math.max(1, Math.min(9, Math.round(z * 2 + 5)))
}

// SVG-geometri
const W = 600
const H = 190
const KURVA_H = 150
const Z_MAX = 3.2

function zTillX(z: number): number {
  return ((z + Z_MAX) / (2 * Z_MAX)) * W
}

function kurvY(z: number): number {
  const topp = 1 / Math.sqrt(2 * Math.PI)
  const fi = Math.exp((-z * z) / 2) / Math.sqrt(2 * Math.PI)
  return KURVA_H - (fi / topp) * (KURVA_H - 14)
}

function kurvPath(fran: number, till: number, stangd: boolean): string {
  const steg = 80
  const h = (till - fran) / steg
  let d = ''
  for (let i = 0; i <= steg; i++) {
    const z = fran + i * h
    d += `${i === 0 ? 'M' : 'L'}${zTillX(z).toFixed(1)},${kurvY(z).toFixed(1)}`
  }
  if (stangd) {
    d += `L${zTillX(till).toFixed(1)},${KURVA_H}L${zTillX(fran).toFixed(1)},${KURVA_H}Z`
  }
  return d
}

export default function PercentilUtforskare() {
  const [percentil, setPercentil] = useState(68)
  const [reliabilitet, setReliabilitet] = useState(0.9)

  const z = normInv(percentil / 100)
  const sem = Math.sqrt(1 - reliabilitet)
  const zLag = z - 1.96 * sem
  const zHog = z + 1.96 * sem
  const pLag = Math.max(1, Math.round(normCdf(zLag) * 100))
  const pHog = Math.min(99, Math.round(normCdf(zHog) * 100))
  const st = stanine(z)

  return (
    <div className="not-prose my-10 rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50/70 to-white p-6 sm:p-8">
      <h2 className="text-xl font-black text-slate-900 mb-1">
        Utforska percentilen
      </h2>
      <p className="text-sm text-slate-600 mb-6">
        Dra i reglaget så ser du var resultatet hamnar i normgruppen, vilken
        stanine det motsvarar och hur brett spannet av statistiskt likvärdiga
        resultat faktiskt är.
      </p>

      {/* Reglage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label htmlFor="perc-slider" className="text-sm font-bold text-slate-800">
              Kandidatens percentil
            </label>
            <span className="text-sm font-black text-orange-700 tabular-nums">{percentil}</span>
          </div>
          <input
            id="perc-slider"
            type="range"
            min={1}
            max={99}
            step={1}
            value={percentil}
            onChange={(e) => setPercentil(Number(e.target.value))}
            className="w-full accent-orange-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>1</span>
            <span>99</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 mb-2">Testets reliabilitet</p>
          <div className="flex gap-2">
            {[
              { varde: 0.8, label: '0,80 (vanligt)' },
              { varde: 0.9, label: '0,90 (välgjort)' },
            ].map((alt) => (
              <button
                key={alt.varde}
                type="button"
                onClick={() => setReliabilitet(alt.varde)}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                  reliabilitet === alt.varde
                    ? 'border-orange-600 bg-orange-600 text-white'
                    : 'border-orange-200 bg-white text-slate-700 hover:border-orange-400'
                }`}
              >
                {alt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Kurvan */}
      <div className="rounded-xl border border-orange-100 bg-white p-3 sm:p-4 mb-4 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[420px]" role="img"
          aria-label={`Normalfördelningskurva med markering på percentil ${percentil}`}>
          {/* likvärdighetsspann */}
          <path d={kurvPath(Math.max(-Z_MAX, zLag), Math.min(Z_MAX, zHog), true)} fill="#fdba74" opacity={0.45} />
          {/* area under kurvan upp till percentilen */}
          <path d={kurvPath(-Z_MAX, z, true)} fill="#fed7aa" opacity={0.5} />
          {/* själva kurvan */}
          <path d={kurvPath(-Z_MAX, Z_MAX, false)} fill="none" stroke="#0f172a" strokeWidth={2} />
          {/* markör */}
          <line x1={zTillX(z)} y1={kurvY(z)} x2={zTillX(z)} y2={KURVA_H} stroke="#ea580c" strokeWidth={2.5} />
          <circle cx={zTillX(z)} cy={kurvY(z)} r={5} fill="#ea580c" />
          {/* baslinje */}
          <line x1={0} y1={KURVA_H} x2={W} y2={KURVA_H} stroke="#cbd5e1" strokeWidth={1} />
          {/* stanine-band */}
          {Array.from({ length: 9 }, (_, i) => {
            const n = i + 1
            const fran = n === 1 ? -Z_MAX : (n - 5.5) / 2
            const till = n === 9 ? Z_MAX : (n - 4.5) / 2
            return (
              <g key={n}>
                <rect
                  x={zTillX(fran)}
                  y={KURVA_H + 6}
                  width={zTillX(till) - zTillX(fran)}
                  height={20}
                  rx={3}
                  fill={n === st ? '#ea580c' : '#f1f5f9'}
                  stroke="#e2e8f0"
                />
                <text
                  x={(zTillX(fran) + zTillX(till)) / 2}
                  y={KURVA_H + 20}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={700}
                  fill={n === st ? '#ffffff' : '#94a3b8'}
                >
                  {n}
                </text>
              </g>
            )
          })}
          <text x={4} y={H - 2} fontSize={10} fill="#94a3b8">stanine</text>
        </svg>
      </div>

      {/* Avläsning */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl border border-orange-100 bg-white px-4 py-3">
          <p className="text-xs text-slate-500 mb-0.5">Bättre än</p>
          <p className="text-lg font-black text-slate-900 mb-0">{percentil} % av normgruppen</p>
        </div>
        <div className="rounded-xl border border-orange-100 bg-white px-4 py-3">
          <p className="text-xs text-slate-500 mb-0.5">Stanine</p>
          <p className="text-lg font-black text-slate-900 mb-0">{st} av 9</p>
        </div>
        <div className="rounded-xl border border-orange-100 bg-white px-4 py-3">
          <p className="text-xs text-slate-500 mb-0.5">Statistiskt likvärdigt spann</p>
          <p className="text-lg font-black text-orange-700 mb-0">percentil {pLag}-{pHog}</p>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-0">
        Spannet är ett 95-procentigt konfidensintervall kring observerad poäng
        (SEM = SD × roten ur 1 − reliabiliteten). Läsningen: en kandidat på
        percentil {percentil} kan inte skiljas statistiskt från någon i spannet
        {' '}{pLag}-{pHog}. Rangordna därför aldrig på små percentilskillnader.
      </p>
    </div>
  )
}
