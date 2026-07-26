'use client'

import { useEffect, useState } from 'react'
import kommunerData from '@/data/kommunalskatt-2026.json'
import tabellerData from '@/data/skattetabeller-2026.json'
import { DelaRad, byggUrl, lasQuery, useQuerySynk } from './dela'

/**
 * Lön efter skatt 2026. Bygger på Skatteverkets skattetabeller för månadslön
 * (kolumn 1 för den som inte fyllt 66, kolumn 3 för den som fyllt 66) och
 * Skatteverkets öppna data över kommunala skattesatser. Tabellnummer = summan
 * av skattesatserna (inkl. begravningsavgift och ev. kyrkoavgift) avrundad
 * till hel procent. Över tabellens tak (80 000 kr) extrapoleras med tabellens
 * toppmarginal. Preliminärskatt enligt tabell, inte slutlig skatt.
 */

type Kommun = { namn: string; summa: number; begr: number; kyrka: number }
type Tabell = { max: number; rows: [number, number, number][] }

const KOMMUNER = kommunerData as Kommun[]
const TABELLER = tabellerData as unknown as Record<string, Tabell>

const fmt = new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 })

function tabellNr(k: Kommun, medlem: boolean): number {
  const summa = k.summa + k.begr + (medlem ? k.kyrka : 0)
  return Math.min(42, Math.max(29, Math.round(summa)))
}

function raknaSkatt(lon: number, tabellnr: number, over66: boolean): number {
  const tabell = TABELLER[String(tabellnr)]
  if (!tabell || lon <= 0) return 0
  const kolIdx = over66 ? 2 : 1
  const rows = tabell.rows
  if (lon > tabell.max) {
    const sista = rows[rows.length - 1]
    const nastSista = rows[rows.length - 2]
    const marginal = (sista[kolIdx] - nastSista[kolIdx]) / (sista[0] - nastSista[0])
    return sista[kolIdx] + Math.round(marginal * (lon - tabell.max))
  }
  let skatt = 0
  for (let i = rows.length - 1; i >= 0; i--) {
    if (lon >= rows[i][0]) {
      skatt = rows[i][kolIdx]
      break
    }
  }
  return skatt
}

function KommunVal({ id, varde, onChange }: { id: string; varde: number; onChange: (i: number) => void }) {
  return (
    <select
      id={id}
      value={varde}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
    >
      {KOMMUNER.map((k, i) => (
        <option key={k.namn} value={i}>
          {k.namn}
        </option>
      ))}
    </select>
  )
}

export default function LonEfterSkatt() {
  const [lon, setLon] = useState('35000')
  const [kommunIdx, setKommunIdx] = useState(() => KOMMUNER.findIndex((k) => k.namn === 'Stockholm'))
  const [medlem, setMedlem] = useState(false)
  const [over66, setOver66] = useState(false)
  const [jamfor, setJamfor] = useState(false)
  const [lon2, setLon2] = useState('38000')
  const [kommunIdx2, setKommunIdx2] = useState(() => KOMMUNER.findIndex((k) => k.namn === 'Stockholm'))

  useEffect(() => {
    const q = lasQuery()
    const hittaKommun = (namn: string | null) =>
      namn ? KOMMUNER.findIndex((k) => k.namn.toLowerCase() === namn.toLowerCase()) : -1
    const qLon = q.get('lon')
    if (qLon && /^\d+$/.test(qLon)) setLon(qLon)
    const ki = hittaKommun(q.get('kommun'))
    if (ki >= 0) setKommunIdx(ki)
    if (q.get('kyrka') === '1') setMedlem(true)
    if (q.get('a66') === '1') setOver66(true)
    const qLon2 = q.get('jlon')
    const ki2 = hittaKommun(q.get('jkommun'))
    if (qLon2 || ki2 >= 0) setJamfor(true)
    if (qLon2 && /^\d+$/.test(qLon2)) setLon2(qLon2)
    if (ki2 >= 0) setKommunIdx2(ki2)
  }, [])

  const lonNum = Math.max(0, parseInt(lon.replace(/\s/g, ''), 10) || 0)
  const kommun = KOMMUNER[kommunIdx]
  const tab = tabellNr(kommun, medlem)
  const skatt = raknaSkatt(lonNum, tab, over66)
  const netto = lonNum - skatt

  const lon2Num = Math.max(0, parseInt(lon2.replace(/\s/g, ''), 10) || 0)
  const kommun2 = KOMMUNER[kommunIdx2]
  const tab2 = tabellNr(kommun2, medlem)
  const skatt2 = raknaSkatt(lon2Num, tab2, over66)
  const netto2 = lon2Num - skatt2

  const delParams = {
    lon: String(lonNum),
    kommun: kommun.namn,
    kyrka: medlem ? '1' : null,
    a66: over66 ? '1' : null,
    jlon: jamfor ? String(lon2Num) : null,
    jkommun: jamfor ? kommun2.namn : null,
  }
  useQuerySynk(delParams)
  const delUrl = byggUrl('https://www.jobbcoach.ai/rakna-ut/lon-efter-skatt', delParams)
  const diff = netto2 - netto
  const resultatText = jamfor
    ? `${fmt.format(lonNum)} kr/mån i ${kommun.namn} ger ${fmt.format(netto)} kr efter skatt, ${fmt.format(lon2Num)} kr i ${kommun2.namn} ger ${fmt.format(netto2)} kr. Skillnad: ${diff >= 0 ? '+' : ''}${fmt.format(diff)} kr/mån. Räknat med Skatteverkets skattetabeller 2026: ${delUrl}`
    : `${fmt.format(lonNum)} kr/mån i ${kommun.namn} ger ${fmt.format(netto)} kr efter skatt (skattetabell ${tab}, 2026). Räkna själv: ${delUrl}`

  return (
    <div className="not-prose my-8 rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50/70 to-white p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lon" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Månadslön före skatt
          </label>
          <input
            id="lon"
            type="text"
            inputMode="numeric"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="kommun" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Kommun
          </label>
          <KommunVal id="kommun" varde={kommunIdx} onChange={setKommunIdx} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={medlem} onChange={(e) => setMedlem(e.target.checked)} className="accent-orange-600" />
          Medlem i Svenska kyrkan
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={over66} onChange={(e) => setOver66(e.target.checked)} className="accent-orange-600" />
          Jag har fyllt 66 år
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={jamfor} onChange={(e) => setJamfor(e.target.checked)} className="accent-orange-600" />
          Jämför med en annan lön eller kommun
        </label>
      </div>

      <div className="mt-5 rounded-xl border border-orange-200 bg-white p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="mb-0 text-xs font-bold uppercase tracking-wide text-slate-400">Lön efter skatt</p>
            <p className="mb-0 text-2xl font-black text-slate-900">{fmt.format(netto)} kr</p>
          </div>
          <div>
            <p className="mb-0 text-xs font-bold uppercase tracking-wide text-slate-400">Skatteavdrag</p>
            <p className="mb-0 text-2xl font-black text-slate-900">{fmt.format(skatt)} kr</p>
          </div>
          <div>
            <p className="mb-0 text-xs font-bold uppercase tracking-wide text-slate-400">Skattetabell</p>
            <p className="mb-0 text-2xl font-black text-slate-900">{tab}</p>
          </div>
        </div>
        {lonNum > 0 && (
          <p className="mb-0 mt-3 text-sm text-slate-600">
            Effektiv skatt {((skatt / lonNum) * 100).toFixed(1).replace('.', ',')} procent i {kommun.namn}
            {lonNum > 80000 ? '. Löner över 80 000 kr ligger över tabellens tak och beräknas med tabellens toppmarginal.' : '.'}
          </p>
        )}
      </div>

      {jamfor && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="lon2" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Ny månadslön
              </label>
              <input
                id="lon2"
                type="text"
                inputMode="numeric"
                value={lon2}
                onChange={(e) => setLon2(e.target.value)}
                className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="kommun2" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Ny kommun
              </label>
              <KommunVal id="kommun2" varde={kommunIdx2} onChange={setKommunIdx2} />
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="mb-0 text-xs font-bold uppercase tracking-wide text-slate-400">Ny lön efter skatt</p>
              <p className="mb-0 text-xl font-black text-slate-900">{fmt.format(netto2)} kr</p>
            </div>
            <div>
              <p className="mb-0 text-xs font-bold uppercase tracking-wide text-slate-400">Skillnad per månad</p>
              <p className={`mb-0 text-xl font-black ${netto2 - netto >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {netto2 - netto >= 0 ? '+' : ''}
                {fmt.format(netto2 - netto)} kr
              </p>
            </div>
            <div>
              <p className="mb-0 text-xs font-bold uppercase tracking-wide text-slate-400">Skillnad per år</p>
              <p className={`mb-0 text-xl font-black ${netto2 - netto >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {netto2 - netto >= 0 ? '+' : ''}
                {fmt.format((netto2 - netto) * 12)} kr
              </p>
            </div>
          </div>
        </div>
      )}

      <DelaRad delUrl={delUrl} resultatText={resultatText} />

      <p className="mb-0 mt-4 text-xs text-slate-500">
        Preliminärskatt enligt Skatteverkets skattetabeller för månadslön 2026.
        Din slutliga skatt kan avvika, till exempel vid flera inkomster, avdrag
        eller jämkning. Vägledning, inte skatterådgivning.
      </p>
    </div>
  )
}
