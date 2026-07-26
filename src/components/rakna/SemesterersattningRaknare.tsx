'use client'

import { useState } from 'react'
import { DelaRad } from './dela'

/**
 * Semesterersättning och semesterlön enligt semesterlagen (1977:480).
 * Sammalöneregeln (16 a §): ordinarie lön under semestern + semestertillägg
 * 0,43 % av månadslönen per betald semesterdag. Vid slutlön används den
 * etablerade dagslöneberäkningen 4,6 % av månadslönen per dag + tillägget.
 * Procentregeln (16 b §): semesterlön = 12 % av förfallen lön under
 * intjänandeåret. Semesterersättning beräknas enligt samma grunder (28-29 §§).
 */

const fmt = new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 })

export default function SemesterersattningRaknare() {
  const [lage, setLage] = useState<'manadslon' | 'procent'>('manadslon')
  const [manadslon, setManadslon] = useState('32000')
  const [dagar, setDagar] = useState('25')
  const [arslon, setArslon] = useState('180000')

  const manadslonNum = Math.max(0, parseInt(manadslon.replace(/\s/g, ''), 10) || 0)
  const dagarNum = Math.max(0, parseInt(dagar, 10) || 0)
  const arslonNum = Math.max(0, parseInt(arslon.replace(/\s/g, ''), 10) || 0)

  const tillaggPerDag = manadslonNum * 0.0043
  const ersattningPerDag = manadslonNum * 0.046 + tillaggPerDag
  const totaltManadslon = ersattningPerDag * dagarNum
  const totaltProcent = arslonNum * 0.12

  return (
    <div className="not-prose my-8 rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50/70 to-white p-6 sm:p-8">
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setLage('manadslon')}
          className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
            lage === 'manadslon' ? 'border-orange-600 bg-orange-600 text-white' : 'border-orange-200 bg-white text-slate-700 hover:border-orange-400'
          }`}
        >
          Månadslön (sammalöneregeln)
        </button>
        <button
          type="button"
          onClick={() => setLage('procent')}
          className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
            lage === 'procent' ? 'border-orange-600 bg-orange-600 text-white' : 'border-orange-200 bg-white text-slate-700 hover:border-orange-400'
          }`}
        >
          Timlön eller rörlig lön (procentregeln)
        </button>
      </div>

      {lage === 'manadslon' ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="semManadslon" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Månadslön (kr)
              </label>
              <input
                id="semManadslon"
                type="text"
                inputMode="numeric"
                value={manadslon}
                onChange={(e) => setManadslon(e.target.value)}
                className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="semDagar" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Antal betalda semesterdagar
              </label>
              <input
                id="semDagar"
                type="text"
                inputMode="numeric"
                value={dagar}
                onChange={(e) => setDagar(e.target.value)}
                className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-5 rounded-xl border border-orange-200 bg-white p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="mb-0 text-xs font-bold uppercase tracking-wide text-slate-400">Semestertillägg per dag</p>
                <p className="mb-0 text-xl font-black text-slate-900">{fmt.format(tillaggPerDag)} kr</p>
              </div>
              <div>
                <p className="mb-0 text-xs font-bold uppercase tracking-wide text-slate-400">Ersättning per dag vid slutlön</p>
                <p className="mb-0 text-xl font-black text-slate-900">{fmt.format(ersattningPerDag)} kr</p>
              </div>
              <div>
                <p className="mb-0 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Semesterersättning, {dagarNum} dagar
                </p>
                <p className="mb-0 text-xl font-black text-slate-900">{fmt.format(totaltManadslon)} kr</p>
              </div>
            </div>
            <p className="mb-0 mt-3 text-sm text-slate-600">
              Tillägget är 0,43 procent av månadslönen per betald semesterdag. Vid
              slutlön ersätts varje sparad dag med dagslön (4,6 procent av
              månadslönen) plus tillägget, alltså 5,03 procent per dag.
            </p>
          </div>
        </>
      ) : (
        <>
          <div>
            <label htmlFor="semArslon" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Sammanlagd lön under intjänandeåret (kr)
            </label>
            <input
              id="semArslon"
              type="text"
              inputMode="numeric"
              value={arslon}
              onChange={(e) => setArslon(e.target.value)}
              className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none sm:max-w-xs"
            />
          </div>
          <div className="mt-5 rounded-xl border border-orange-200 bg-white p-4 sm:p-5">
            <p className="mb-0 text-xs font-bold uppercase tracking-wide text-slate-400">Semesterlön enligt procentregeln</p>
            <p className="mb-2 text-2xl font-black text-slate-900">{fmt.format(totaltProcent)} kr</p>
            <p className="mb-0 text-sm text-slate-600">
              Tolv procent av den förfallna lönen under intjänandeåret (16 b §
              semesterlagen). Betalas ofta ut per uttagen dag eller, som
              semesterersättning, när anställningen avslutas.
            </p>
          </div>
        </>
      )}

      <DelaRad badda={{ slug: 'semesterersattning', titel: 'Räkna ut semesterersättning' }} />

      <p className="mb-0 mt-4 text-xs text-slate-500">
        Beräkningarna följer semesterlagens regler. Kollektivavtal kan ha andra
        procentsatser, till exempel 0,8 procent i tillägg per dag i många
        tjänstemannaavtal. Vägledning, inte juridisk rådgivning.
      </p>
    </div>
  )
}
