'use client'

import { useState } from 'react'

/**
 * Konvertering timlön <-> månadslön med schablonen 174 timmar per månad
 * (40-timmarsvecka: 40 x 52 / 12 = 173,33, avrundat till 174 enligt
 * branschpraxis). Timmarna är justerbara för andra tjänstgöringsgrader.
 */

const fmt = new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 })

export default function TimlonManadslon() {
  const [riktning, setRiktning] = useState<'tillManad' | 'tillTim'>('tillManad')
  const [belopp, setBelopp] = useState('180')
  const [timmar, setTimmar] = useState('174')

  const beloppNum = Math.max(0, parseFloat(belopp.replace(/\s/g, '').replace(',', '.')) || 0)
  const timmarNum = Math.max(1, parseFloat(timmar.replace(',', '.')) || 174)

  const resultat = riktning === 'tillManad' ? beloppNum * timmarNum : beloppNum / timmarNum
  const arslon = riktning === 'tillManad' ? resultat * 12 : beloppNum * 12

  return (
    <div className="not-prose my-8 rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50/70 to-white p-6 sm:p-8">
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => { setRiktning('tillManad'); setBelopp('180') }}
          className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
            riktning === 'tillManad' ? 'border-orange-600 bg-orange-600 text-white' : 'border-orange-200 bg-white text-slate-700 hover:border-orange-400'
          }`}
        >
          Timlön till månadslön
        </button>
        <button
          type="button"
          onClick={() => { setRiktning('tillTim'); setBelopp('31000') }}
          className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
            riktning === 'tillTim' ? 'border-orange-600 bg-orange-600 text-white' : 'border-orange-200 bg-white text-slate-700 hover:border-orange-400'
          }`}
        >
          Månadslön till timlön
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="belopp" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
            {riktning === 'tillManad' ? 'Timlön (kr)' : 'Månadslön (kr)'}
          </label>
          <input
            id="belopp"
            type="text"
            inputMode="decimal"
            value={belopp}
            onChange={(e) => setBelopp(e.target.value)}
            className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="timmar" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Arbetstimmar per månad
          </label>
          <input
            id="timmar"
            type="text"
            inputMode="decimal"
            value={timmar}
            onChange={(e) => setTimmar(e.target.value)}
            className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-orange-200 bg-white p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-0 text-xs font-bold uppercase tracking-wide text-slate-400">
              {riktning === 'tillManad' ? 'Månadslön' : 'Timlön'}
            </p>
            <p className="mb-0 text-2xl font-black text-slate-900">
              {riktning === 'tillManad' ? `${fmt.format(resultat)} kr` : `${resultat.toFixed(2).replace('.', ',')} kr`}
            </p>
          </div>
          <div>
            <p className="mb-0 text-xs font-bold uppercase tracking-wide text-slate-400">Årslön före skatt</p>
            <p className="mb-0 text-2xl font-black text-slate-900">{fmt.format(arslon)} kr</p>
          </div>
        </div>
      </div>

      <p className="mb-0 mt-4 text-xs text-slate-500">
        Schablonen 174 timmar motsvarar heltid med 40-timmarsvecka. Semesterlön
        och ob-tillägg ingår inte i konverteringen.
      </p>
    </div>
  )
}
