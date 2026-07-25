'use client'

import { useState } from 'react'

/**
 * Vad kostar en anställd 2026. Arbetsgivaravgift 31,42 % (20,81 % på lönedelar
 * upp till 25 000 kr/mån för den som fyllt 18 men inte 23 år, ersättningar
 * utbetalda apr 2026-sep 2027). Kollektivavtal tjänstemän (ITP1 enligt
 * Avtalat): ålderspension 4,5 % av lön upp till 52 125 kr/mån (7,5
 * inkomstbasbelopp) och 30 % däröver, försäkringar (TGL, TFA, TRR,
 * sjukförsäkring) schablonerade till 0,4 %, särskild löneskatt 24,26 % på
 * pensionspremier. Semestertillägg 0,43 % per dag enligt semesterlagen.
 */

const fmt = new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 })

const AGA = 0.3142
const AGA_UNG = 0.2081
const UNG_TAK = 25000
const ITP_GRANS = 52125
const ITP_LAG = 0.045
const ITP_HOG = 0.3
const FORSAKRINGAR = 0.004
const SLP = 0.2426
const TILLAGG_PER_DAG = 0.0043

export default function AnstalldKostnad() {
  const [lon, setLon] = useState('38000')
  const [ung, setUng] = useState(false)
  const [avtal, setAvtal] = useState(true)
  const [dagar, setDagar] = useState('25')

  const lonNum = Math.max(0, parseInt(lon.replace(/\s/g, ''), 10) || 0)
  const dagarNum = Math.max(0, parseInt(dagar, 10) || 0)

  const semestertillagg = (lonNum * TILLAGG_PER_DAG * dagarNum) / 12
  const lonebas = lonNum + semestertillagg

  const aga = ung
    ? Math.min(lonebas, UNG_TAK) * AGA_UNG + Math.max(0, lonebas - UNG_TAK) * AGA
    : lonebas * AGA

  const pension = avtal ? Math.min(lonNum, ITP_GRANS) * ITP_LAG + Math.max(0, lonNum - ITP_GRANS) * ITP_HOG : 0
  const slp = pension * SLP
  const forsakringar = avtal ? lonNum * FORSAKRINGAR : 0

  const total = lonebas + aga + pension + slp + forsakringar
  const rader: [string, number][] = [
    ['Bruttolön', lonNum],
    ['Semestertillägg (utslaget per månad)', semestertillagg],
    [ung ? 'Arbetsgivaravgift (nedsatt för unga)' : 'Arbetsgivaravgift 31,42 %', aga],
    ...(avtal
      ? ([
          ['Tjänstepension ITP1', pension],
          ['Särskild löneskatt på pensionen 24,26 %', slp],
          ['Avtalsförsäkringar (TGL, TFA, TRR m.m.)', forsakringar],
        ] as [string, number][])
      : []),
  ]

  return (
    <div className="not-prose my-8 rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50/70 to-white p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="akLon" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Månadslön före skatt (kr)
          </label>
          <input
            id="akLon"
            type="text"
            inputMode="numeric"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="akDagar" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Semesterdagar
          </label>
          <input
            id="akDagar"
            type="text"
            inputMode="numeric"
            value={dagar}
            onChange={(e) => setDagar(e.target.value)}
            className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={avtal} onChange={(e) => setAvtal(e.target.checked)} className="accent-orange-600" />
          Kollektivavtal med tjänstepension (ITP1)
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={ung} onChange={(e) => setUng(e.target.checked)} className="accent-orange-600" />
          Den anställda är 18-22 år
        </label>
      </div>

      <div className="mt-5 rounded-xl border border-orange-200 bg-white p-4 sm:p-5">
        <dl className="mb-4 space-y-1.5">
          {rader.map(([namn, belopp]) => (
            <div key={namn} className="flex items-baseline justify-between gap-3 text-sm">
              <dt className="text-slate-600">{namn}</dt>
              <dd className="ml-0 font-semibold text-slate-900">{fmt.format(belopp)} kr</dd>
            </div>
          ))}
        </dl>
        <div className="border-t border-orange-100 pt-3">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="mb-0 text-xs font-bold uppercase tracking-wide text-slate-400">Kostnad per månad</p>
              <p className="mb-0 text-2xl font-black text-slate-900">{fmt.format(total)} kr</p>
            </div>
            <div>
              <p className="mb-0 text-xs font-bold uppercase tracking-wide text-slate-400">Kostnad per år</p>
              <p className="mb-0 text-2xl font-black text-slate-900">{fmt.format(total * 12)} kr</p>
            </div>
            <div>
              <p className="mb-0 text-xs font-bold uppercase tracking-wide text-slate-400">Gånger bruttolönen</p>
              <p className="mb-0 text-2xl font-black text-slate-900">
                {lonNum > 0 ? (total / lonNum).toFixed(2).replace('.', ',') : '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="mb-0 mt-4 text-xs text-slate-500">
        Direkta lönekostnader. Utrustning, lokalyta, utbildning och
        rekryteringskostnaden tillkommer. Ungdomsnedsättningen gäller
        ersättningar som betalas ut april 2026 till september 2027 för den som
        fyllt 18 men inte 23 år. Vägledning, inte rådgivning.
      </p>
    </div>
  )
}
