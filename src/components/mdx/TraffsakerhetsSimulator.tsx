'use client'

import { useState } from 'react'
import { DelaRad } from '@/components/rakna/dela'
import { METODER, andelLyckade } from '@/lib/rakna/traffsakerhet'

/**
 * Interaktiv träffsäkerhetssimulator för insikten om urvalsforskningen.
 * Validiteter ur Sackett m.fl. (2022), kombinationen ur samma forskargrupps
 * kompositanalyser. Andelen lyckade rekryteringar beräknas med
 * Taylor-Russell-logik: P(lyckad | vald) under bivariat normalfördelning,
 * givet basfrekvens och selektionskvot.
 */

// Metoderna, validiteterna och Taylor-Russell-räkningen ligger i
// src/lib/rakna/traffsakerhet.ts, delade med kalkylatorn på
// /rakna-ut/traffsakerhet.

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

      <DelaRad badda={{ slug: 'traffsakerhet', titel: 'Träffsäkerhetssimulatorn' }} />

      <p className="text-xs text-slate-500 mb-0">
        Modellen är en förenkling enligt Taylor-Russell: validiteter ur Sackett
        m.fl. (2022), kombinationens siffra en försiktig sammanvägning ur samma
        forskargrupps kompositanalyser. Den förutsätter att testresultaten är
        kandidatens verifierade egna, oövervakade omtag sänker siffrorna.
      </p>
    </div>
  )
}
