'use client'

import { useState } from 'react'

/**
 * Sourcingtratten: interaktiv kalkyl på sourcingpillaren. Räknar hur många
 * riktade kontakter som krävs för ett antal anställningar, givet kanalkvalitet
 * (svarsfrekvensspann ur LinkedIns InMail-benchmarks) och trattens senare steg.
 * Schabloner, tydligt deklarerade: egna kanaldata slår alltid dessa.
 */

const KANALER = [
  {
    id: 'mass',
    label: 'Massutskick, generiskt',
    beskrivning: 'samma text till många',
    svarsfrekvens: 0.08,
  },
  {
    id: 'riktat',
    label: 'Riktat och personligt',
    beskrivning: 'under 400 tecken, individuellt',
    svarsfrekvens: 0.2,
  },
  {
    id: 'pool',
    label: 'Kandidatpool med opt-in',
    beskrivning: 'kandidaten har valt att vara sökbar',
    svarsfrekvens: 0.35,
  },
] as const

export default function SourcingTratt() {
  const [kanalId, setKanalId] = useState<string>('riktat')
  const [anstallningar, setAnstallningar] = useState(1)
  const [svarTillIntervju, setSvarTillIntervju] = useState(30)
  const [intervjuTillAnstallning, setIntervjuTillAnstallning] = useState(25)

  const kanal = KANALER.find((k) => k.id === kanalId) ?? KANALER[1]

  const intervjuerKravs = anstallningar / (intervjuTillAnstallning / 100)
  const svarKravs = intervjuerKravs / (svarTillIntervju / 100)
  const kontakterKravs = Math.ceil(svarKravs / kanal.svarsfrekvens)

  const steg = [
    { label: 'Riktade kontakter', varde: kontakterKravs },
    { label: `Svar (${Math.round(kanal.svarsfrekvens * 100)} % svarsfrekvens)`, varde: Math.ceil(svarKravs) },
    { label: `Intervjuer (${svarTillIntervju} % av svaren)`, varde: Math.ceil(intervjuerKravs) },
    { label: `Anställningar (${intervjuTillAnstallning} % av intervjuerna)`, varde: anstallningar },
  ]
  const maxVarde = steg[0].varde

  return (
    <div className="not-prose my-10 rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50/70 to-white p-6 sm:p-8">
      <h2 className="text-xl font-black text-slate-900 mb-1">Sourcingtratten</h2>
      <p className="text-sm text-slate-600 mb-6">
        Hur många riktade kontakter kräver era anställningar? Välj kanalkvalitet
        och justera trattens steg, schablonerna bygger på publicerade
        benchmarks och ersätts med fördel av era egna kanaldata.
      </p>

      {/* Kanalval */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
        {KANALER.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => setKanalId(k.id)}
            className={`text-left rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
              k.id === kanalId
                ? 'border-orange-600 bg-orange-600 text-white'
                : 'border-orange-200 bg-white text-slate-700 hover:border-orange-400'
            }`}
          >
            {k.label}
            <span className={`block text-xs font-normal mt-0.5 ${k.id === kanalId ? 'text-orange-100' : 'text-slate-400'}`}>
              {k.beskrivning}, ~{Math.round(k.svarsfrekvens * 100)} % svar
            </span>
          </button>
        ))}
      </div>

      {/* Reglage */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label htmlFor="tratt-anst" className="text-sm font-bold text-slate-800">
              Anställningar att göra
            </label>
            <span className="text-sm font-black text-orange-700 tabular-nums">{anstallningar}</span>
          </div>
          <input
            id="tratt-anst"
            type="range"
            min={1}
            max={10}
            step={1}
            value={anstallningar}
            onChange={(e) => setAnstallningar(Number(e.target.value))}
            className="w-full accent-orange-600"
          />
        </div>
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label htmlFor="tratt-intervju" className="text-sm font-bold text-slate-800">
              Andel svar som blir intervju
            </label>
            <span className="text-sm font-black text-orange-700 tabular-nums">{svarTillIntervju} %</span>
          </div>
          <input
            id="tratt-intervju"
            type="range"
            min={10}
            max={60}
            step={5}
            value={svarTillIntervju}
            onChange={(e) => setSvarTillIntervju(Number(e.target.value))}
            className="w-full accent-orange-600"
          />
        </div>
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label htmlFor="tratt-hire" className="text-sm font-bold text-slate-800">
              Andel intervjuer som blir anställning
            </label>
            <span className="text-sm font-black text-orange-700 tabular-nums">{intervjuTillAnstallning} %</span>
          </div>
          <input
            id="tratt-hire"
            type="range"
            min={10}
            max={50}
            step={5}
            value={intervjuTillAnstallning}
            onChange={(e) => setIntervjuTillAnstallning(Number(e.target.value))}
            className="w-full accent-orange-600"
          />
        </div>
      </div>

      {/* Tratt */}
      <div className="rounded-xl border border-orange-100 bg-white p-4 sm:p-5 mb-4">
        {steg.map((s, i) => (
          <div key={s.label} className="flex items-center gap-3 py-2">
            <span className="text-xs sm:text-sm text-slate-600 w-52 sm:w-64 shrink-0">{s.label}</span>
            <div className="flex-1 h-7 rounded-lg bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-lg ${i === 0 ? 'bg-orange-600' : i === steg.length - 1 ? 'bg-emerald-500' : 'bg-orange-300'}`}
                style={{ width: `${Math.max(3, Math.round((s.varde / maxVarde) * 100))}%` }}
              />
            </div>
            <span className="text-sm font-black text-slate-900 tabular-nums w-14 text-right">{s.varde}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-900 px-4 sm:px-5 py-4 mb-4">
        <span className="text-sm font-bold text-white">
          Riktade kontakter per anställning med vald kanal
        </span>
        <span className="text-xl sm:text-2xl font-black text-orange-400 tabular-nums whitespace-nowrap">
          ~{Math.ceil(kontakterKravs / anstallningar)}
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-0">
        Svarsfrekvenserna är schabloner i nivå med publicerade benchmarks
        (LinkedIns InMail-data: riktade, korta och individuellt skickade
        meddelanden svarar bäst). Trattens senare steg varierar kraftigt med
        roll och marknad, justera mot era egna utfall.
      </p>
    </div>
  )
}
