'use client'

import { useState } from 'react'

/**
 * Vad en löneförhandling är värd över tid. Jämför löneutvecklingen med och
 * utan en förhandlad höjning, med samma årliga revision i båda scenarierna.
 * Inga externa antaganden, användaren styr revisionstakten själv.
 */

const fmt = new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 })

function ackumulerat(startlon: number, hojning: number, revision: number, ar: number): number {
  let diff = 0
  let utan = startlon
  let med = startlon + hojning
  for (let i = 0; i < ar; i++) {
    diff += (med - utan) * 12
    utan *= 1 + revision
    med *= 1 + revision
  }
  return diff
}

export default function LoneforhandlingsKalkylator() {
  const [lon, setLon] = useState('36000')
  const [hojning, setHojning] = useState('2000')
  const [revision, setRevision] = useState('2,5')

  const lonNum = Math.max(0, parseInt(lon.replace(/\s/g, ''), 10) || 0)
  const hojningNum = Math.max(0, parseInt(hojning.replace(/\s/g, ''), 10) || 0)
  const revisionNum = Math.max(0, parseFloat(revision.replace(',', '.')) || 0) / 100

  const perioder: [string, number][] = [5, 10, 20].map((ar) => [
    `Efter ${ar} år`,
    ackumulerat(lonNum, hojningNum, revisionNum, ar),
  ])

  return (
    <div className="not-prose my-8 rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50/70 to-white p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="lfLon" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Nuvarande månadslön (kr)
          </label>
          <input
            id="lfLon"
            type="text"
            inputMode="numeric"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="lfHojning" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Förhandlad höjning (kr/mån)
          </label>
          <input
            id="lfHojning"
            type="text"
            inputMode="numeric"
            value={hojning}
            onChange={(e) => setHojning(e.target.value)}
            className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="lfRevision" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Årlig revision (%)
          </label>
          <input
            id="lfRevision"
            type="text"
            inputMode="decimal"
            value={revision}
            onChange={(e) => setRevision(e.target.value)}
            className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-orange-200 bg-white p-4 sm:p-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
          Ackumulerad bruttoskillnad jämfört med att inte förhandla
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {perioder.map(([rubrik, belopp]) => (
            <div key={rubrik}>
              <p className="mb-0 text-sm text-slate-600">{rubrik}</p>
              <p className="mb-0 text-2xl font-black text-emerald-700">+{fmt.format(belopp)} kr</p>
            </div>
          ))}
        </div>
        <p className="mb-0 mt-3 text-sm text-slate-600">
          Höjningen räknas upp med samma procentuella revision som resten av
          lönen, det är därför skillnaden växer varje år. Ovanpå detta kommer
          tjänstepensionen, som för de flesta är 4,5 procent av lönen: en högre
          lön i dag är också en högre pensionsinbetalning varje månad framåt.
        </p>
      </div>

      <p className="mb-0 mt-4 text-xs text-slate-500">
        Beloppen är före skatt och bygger på dina egna antaganden om revision.
      </p>
    </div>
  )
}
