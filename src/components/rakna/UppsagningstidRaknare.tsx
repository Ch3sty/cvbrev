'use client'

import { useState } from 'react'

/**
 * Uppsägningstid enligt LAS (1982:80). 11 §: minst en månads uppsägningstid
 * för båda parter; vid uppsägning från arbetsgivarens sida har arbetstagaren
 * rätt till 2/3/4/5/6 månader vid 2/4/6/8/10 års sammanlagd anställningstid.
 * Provanställning: kan avbrytas utan uppsägningstid (6 §), arbetsgivaren ska
 * underrätta minst två veckor i förväg (31 §). Kollektivavtal kan avvika.
 */

const fmtDatum = new Intl.DateTimeFormat('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })

function lasManader(anstallningsAr: number): number {
  if (anstallningsAr >= 10) return 6
  if (anstallningsAr >= 8) return 5
  if (anstallningsAr >= 6) return 4
  if (anstallningsAr >= 4) return 3
  if (anstallningsAr >= 2) return 2
  return 1
}

export default function UppsagningstidRaknare() {
  const [vem, setVem] = useState<'sjalv' | 'arbetsgivare'>('sjalv')
  const [prov, setProv] = useState(false)
  const [start, setStart] = useState('2020-01-01')
  const [uppsagning, setUppsagning] = useState(() => new Date().toISOString().slice(0, 10))

  const startD = new Date(start)
  const uppsD = new Date(uppsagning)
  const giltiga = !Number.isNaN(startD.getTime()) && !Number.isNaN(uppsD.getTime()) && uppsD >= startD

  const anstallningsAr = giltiga ? (uppsD.getTime() - startD.getTime()) / (365.25 * 24 * 3600 * 1000) : 0
  const manader = vem === 'arbetsgivare' ? lasManader(anstallningsAr) : 1

  let sistaDag: Date | null = null
  if (giltiga && !prov) {
    sistaDag = new Date(uppsD)
    sistaDag.setMonth(sistaDag.getMonth() + manader)
  }

  return (
    <div className="not-prose my-8 rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50/70 to-white p-6 sm:p-8">
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setVem('sjalv')}
          className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
            vem === 'sjalv' ? 'border-orange-600 bg-orange-600 text-white' : 'border-orange-200 bg-white text-slate-700 hover:border-orange-400'
          }`}
        >
          Jag säger upp mig själv
        </button>
        <button
          type="button"
          onClick={() => setVem('arbetsgivare')}
          className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
            vem === 'arbetsgivare' ? 'border-orange-600 bg-orange-600 text-white' : 'border-orange-200 bg-white text-slate-700 hover:border-orange-400'
          }`}
        >
          Arbetsgivaren säger upp
        </button>
      </div>

      <label className="mb-4 flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={prov} onChange={(e) => setProv(e.target.checked)} className="accent-orange-600" />
        Anställningen är en provanställning
      </label>

      {!prov && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="startdatum" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Anställningen började
            </label>
            <input
              id="startdatum"
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="uppsagningsdatum" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Uppsägningen lämnas
            </label>
            <input
              id="uppsagningsdatum"
              type="date"
              value={uppsagning}
              onChange={(e) => setUppsagning(e.target.value)}
              className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      <div className="mt-5 rounded-xl border border-orange-200 bg-white p-4 sm:p-5">
        {prov ? (
          <>
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">Provanställning</p>
            <p className="mb-2 text-lg font-black text-slate-900">Ingen uppsägningstid enligt LAS</p>
            <p className="mb-0 text-sm text-slate-600">
              En provanställning får avbrytas i förtid av båda parter om inget annat
              avtalats (6 § LAS). Arbetsgivaren ska underrätta dig minst två veckor i
              förväg (31 § LAS). Kollektivavtal kan innehålla längre tider, till
              exempel en månads ömsesidig uppsägningstid.
            </p>
          </>
        ) : giltiga ? (
          <>
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
              {vem === 'arbetsgivare' ? 'Din uppsägningstid enligt LAS' : 'Uppsägningstid vid egen uppsägning'}
            </p>
            <p className="mb-2 text-2xl font-black text-slate-900">
              {manader} {manader === 1 ? 'månad' : 'månader'}
            </p>
            {sistaDag && (
              <p className="mb-2 text-sm text-slate-700">
                Sista anställningsdag: <strong>{fmtDatum.format(sistaDag)}</strong>
              </p>
            )}
            <p className="mb-0 text-sm text-slate-600">
              {vem === 'arbetsgivare'
                ? `Sammanlagd anställningstid ${Math.floor(anstallningsAr)} år ger ${manader} ${manader === 1 ? 'månads' : 'månaders'} uppsägningstid enligt 11 § LAS.`
                : 'Vid egen uppsägning gäller en månads uppsägningstid enligt 11 § LAS, oavsett anställningstid, om inte ditt anställningsavtal eller kollektivavtal anger längre tid.'}
            </p>
          </>
        ) : (
          <p className="mb-0 text-sm text-slate-600">Ange giltiga datum, uppsägningsdatumet måste vara efter startdatumet.</p>
        )}
      </div>

      <p className="mb-0 mt-4 text-xs text-slate-500">
        Beräkningen följer lagen om anställningsskydd. Kollektivavtal och enskilda
        anställningsavtal kan ge längre uppsägningstider, kontrollera alltid ditt
        avtal. Vägledning, inte juridisk rådgivning.
      </p>
    </div>
  )
}
