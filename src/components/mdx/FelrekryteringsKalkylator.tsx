'use client'

import { useState } from 'react'

/**
 * Interaktiv felrekryteringskalkylator för insikten "Vad kostar en
 * felrekrytering?". Samma antaganden som artikelns räkneexempel:
 * arbetsgivarkostnad ~1,42x bruttolön, halv produktivitet fram till avslut,
 * produktionsbortfall/teampåverkan och omrekrytering skalade mot lönenivån.
 */

const BAS_LON = 40_000 // referenslönen i artikelns räkneexempel
const ARBETSGIVARFAKTOR = 1.42
const DIREKTA_KOSTNADER = 90_000 // annons, tester, ~30 h intern tid
const BAS_PRODUKTIONSBORTFALL = 150_000 // vid baslön och 10 månader
const BAS_OMREKRYTERING = 200_000 // vid baslön

function kr(n: number): string {
  return `${Math.round(n / 1000) * 1000}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' kr'
}

export default function FelrekryteringsKalkylator() {
  const [manadslon, setManadslon] = useState(40_000)
  const [manader, setManader] = useState(10)

  const lonefaktor = manadslon / BAS_LON
  const arbetsgivarkostnad = manadslon * ARBETSGIVARFAKTOR

  const improduktivLon = arbetsgivarkostnad * manader * 0.5
  const produktionsbortfall = BAS_PRODUKTIONSBORTFALL * lonefaktor * (manader / 10)
  const omrekrytering = BAS_OMREKRYTERING * lonefaktor
  const total = DIREKTA_KOSTNADER + improduktivLon + produktionsbortfall + omrekrytering

  const poster = [
    { label: 'Direkta kostnader (annons, tester, intern tid)', varde: DIREKTA_KOSTNADER },
    { label: `Improduktiv lönekostnad (${manader} mån, halv produktivitet)`, varde: improduktivLon },
    { label: 'Produktionsbortfall och teampåverkan', varde: produktionsbortfall },
    { label: 'Omrekrytering och ny upplärning', varde: omrekrytering },
  ]

  return (
    <div className="not-prose my-10 rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50/70 to-white p-6 sm:p-8">
      <h2 className="text-xl font-black text-slate-900 mb-1">
        Räkna på er egen felrekrytering
      </h2>
      <p className="text-sm text-slate-600 mb-6">
        Samma antaganden som räkneexemplet ovan, försiktigt räknade. Justera
        lön och tid så ser du hur kalkylen rör sig.
      </p>

      {/* Reglage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label htmlFor="kalkyl-lon" className="text-sm font-bold text-slate-800">
              Månadslön (brutto)
            </label>
            <span className="text-sm font-black text-orange-700 tabular-nums">
              {kr(manadslon)}
            </span>
          </div>
          <input
            id="kalkyl-lon"
            type="range"
            min={25_000}
            max={90_000}
            step={1_000}
            value={manadslon}
            onChange={(e) => setManadslon(Number(e.target.value))}
            className="w-full accent-orange-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>25&nbsp;000</span>
            <span>90&nbsp;000</span>
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label htmlFor="kalkyl-manader" className="text-sm font-bold text-slate-800">
              Månader innan anställningen avslutas
            </label>
            <span className="text-sm font-black text-orange-700 tabular-nums">
              {manader} mån
            </span>
          </div>
          <input
            id="kalkyl-manader"
            type="range"
            min={4}
            max={18}
            step={1}
            value={manader}
            onChange={(e) => setManader(Number(e.target.value))}
            className="w-full accent-orange-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>4</span>
            <span>18</span>
          </div>
        </div>
      </div>

      {/* Poster */}
      <div className="rounded-xl border border-orange-100 bg-white overflow-hidden mb-4">
        {poster.map((post) => (
          <div
            key={post.label}
            className="flex items-center justify-between gap-4 px-4 sm:px-5 py-3 border-b border-orange-50 last:border-b-0"
          >
            <span className="text-sm text-slate-600">{post.label}</span>
            <span className="text-sm font-bold text-slate-900 tabular-nums whitespace-nowrap">
              {kr(post.varde)}
            </span>
          </div>
        ))}
      </div>

      {/* Summa */}
      <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-900 px-4 sm:px-5 py-4">
        <span className="text-sm font-bold text-white">
          Uppskattad totalkostnad
        </span>
        <span className="text-xl sm:text-2xl font-black text-orange-400 tabular-nums whitespace-nowrap">
          {kr(total)}
        </span>
      </div>

      <p className="text-xs text-slate-500 mt-4 mb-0">
        Modellen är en förenkling: arbetsgivarkostnad ca 1,42 gånger bruttolönen,
        halv produktivitet fram till avslut, övriga poster skalade mot lönenivån.
        Verkliga utfall varierar med roll, bransch och hur snabbt beslutet fattas.
      </p>
    </div>
  )
}
