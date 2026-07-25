'use client'

import { useState } from 'react'

/**
 * Transparenskollen: interaktiv lägesbild i pillarinsikten om
 * lönetransparensdirektivet. Välj arbetsgivartyp + storlek → vad som bör
 * behandlas som gällande redan nu, var man hamnar i rapporteringstrappan
 * och vad som är klokt att göra. Läget per juli 2026, efter det svenska
 * stoppet i mars 2026. Vägledning, inte juridisk rådgivning.
 */

type Sektor = 'offentlig' | 'privat'
type Storlek = 'under100' | 's100' | 's150' | 's250'

const SEKTORER: { id: Sektor; label: string }[] = [
  { id: 'privat', label: 'Privat arbetsgivare' },
  { id: 'offentlig', label: 'Offentlig arbetsgivare' },
]

const STORLEKAR: { id: Storlek; label: string }[] = [
  { id: 'under100', label: 'Färre än 100 anställda' },
  { id: 's100', label: '100 till 149' },
  { id: 's150', label: '150 till 249' },
  { id: 's250', label: '250 eller fler' },
]

const NU_LAGE: Record<Sektor, string> = {
  offentlig:
    'Offentliga arbetsgivare står närmast smällen i rättsosäkerheten: tillräckligt klara och ovillkorliga direktivbestämmelser kan i vissa fall åberopas mot det allmänna med direkt effekt, även utan svensk lag. Behandla rekryteringsreglerna som gällande redan nu: löneinformation till kandidater i så god tid att en informerad förhandling är möjlig, och ingen lönehistorikfråga.',
  privat:
    'Direkt effekt gäller inte mellan enskilda, men svenska domstolar ska tolka befintlig rätt, som diskrimineringslagens likalöneregler, i ljuset av direktivet. En lön som ankrats i kandidatens lönehistorik försvagar er i en likalönetvist redan i dag. Rekryteringsreglerna är dessutom god praxis oavsett juridiken: spann tidigt räddar processer som annars spricker på lönebud i slutskedet.',
}

const RAPPORT: Record<Storlek, { rubrik: string; text: string }> = {
  under100: {
    rubrik: 'Ingen lönerapportering',
    text: 'Rapporteringstrappan börjar vid 100 arbetstagare, så rapporteringskraven når er inte ens när lagen kommer. Men rekryteringsreglerna gäller alla arbetsgivare oavsett storlek, och trappan är inte statisk: växer ni förbi 100 kliver ni in i den, räknat vid rapporteringstillfället.',
  },
  s100: {
    rubrik: 'Första rapporten senast 7 juni 2031, sedan vart tredje år',
    text: 'Enligt direktivets tidtabell rapporterar ni löneskillnader mellan kvinnor och män första gången senast den 7 juni 2031 och därefter vart tredje år. Visar rapporten en oförklarad skillnad på minst fem procent i någon arbetstagarkategori, som inte åtgärdats inom sex månader, väntar gemensam lönebedömning med arbetstagarföreträdarna.',
  },
  s150: {
    rubrik: 'Första rapporten senast 7 juni 2027, sedan vart tredje år',
    text: 'Enligt direktivets tidtabell rapporterar ni löneskillnader mellan kvinnor och män första gången senast den 7 juni 2027 och därefter vart tredje år. Visar rapporten en oförklarad skillnad på minst fem procent i någon arbetstagarkategori, som inte åtgärdats inom sex månader, väntar gemensam lönebedömning med arbetstagarföreträdarna.',
  },
  s250: {
    rubrik: 'Första rapporten senast 7 juni 2027, sedan varje år',
    text: 'Enligt direktivets tidtabell rapporterar ni löneskillnader mellan kvinnor och män första gången senast den 7 juni 2027 och därefter varje år. Visar rapporten en oförklarad skillnad på minst fem procent i någon arbetstagarkategori, som inte åtgärdats inom sex månader, väntar gemensam lönebedömning med arbetstagarföreträdarna.',
  },
}

export default function Transparenskollen() {
  const [sektor, setSektor] = useState<Sektor>('privat')
  const [storlek, setStorlek] = useState<Storlek>('s100')

  const rapport = RAPPORT[storlek]
  const harRapportkrav = storlek !== 'under100'

  const attGora: string[] = [
    'Bestäm ett lönespann per roll innan rekryteringen startar, förankrat i lönekartläggningen.',
    'Rensa lönehistorikfrågan ur intervjumallar och ansökningsformulär, fråga om löneförväntan i stället.',
    'Informera kandidater om lön eller spann tidigt i processen, i annonsen eller före intervjun.',
    'Håll den årliga lönekartläggningen levande, den är redan svensk lag och direktivförberedelsens kärna.',
  ]
  if (harRapportkrav) {
    attGora.push(
      'Testkör en lönerapport ur kartläggningsdatan och hitta eventuella femprocentare innan en offentlig rapport gör det.'
    )
  }

  return (
    <div className="not-prose my-10 rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50/70 to-white p-6 sm:p-8">
      <h2 className="text-xl font-black text-slate-900 mb-1">Transparenskollen</h2>
      <p className="text-sm text-slate-600 mb-5">
        Välj arbetsgivartyp och storlek så visas vad som är klokt att behandla
        som gällande redan nu, var ni hamnar i rapporteringstrappan och vad ni
        bör göra. Läget per 2026, efter det svenska stoppet.
      </p>

      <div className="mb-3">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Arbetsgivartyp</p>
        <div className="flex flex-wrap gap-2">
          {SEKTORER.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSektor(s.id)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                s.id === sektor
                  ? 'border-orange-600 bg-orange-600 text-white'
                  : 'border-orange-200 bg-white text-slate-700 hover:border-orange-400'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Storlek</p>
        <div className="flex flex-wrap gap-2">
          {STORLEKAR.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStorlek(s.id)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                s.id === storlek
                  ? 'border-orange-600 bg-orange-600 text-white'
                  : 'border-orange-200 bg-white text-slate-700 hover:border-orange-400'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 mb-4">
        <div className="rounded-xl border border-amber-200 bg-white p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className="text-sm font-bold text-slate-900 mb-0">Behandla som gällande redan nu</p>
            <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
              Rättsosäkert läge
            </span>
          </div>
          <p className="text-sm text-slate-700 mb-0">{NU_LAGE[sektor]}</p>
        </div>

        <div className="rounded-xl border border-orange-200 bg-white p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className="text-sm font-bold text-slate-900 mb-0">{rapport.rubrik}</p>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                harRapportkrav ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {harRapportkrav ? 'Direktivets tidtabell' : 'Utanför trappan'}
            </span>
          </div>
          <p className="text-sm text-slate-700 mb-0">{rapport.text}</p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-white p-4 sm:p-5">
          <p className="text-sm font-bold text-slate-900 mb-2">Att göra nu</p>
          <ul className="space-y-1.5 mb-0 list-none pl-0">
            {attGora.map((rad) => (
              <li key={rad} className="text-sm text-slate-700 flex gap-2">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>{rad}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-0">
        Datumen är direktivets tidtabell, svensk genomförandelag saknas sedan
        stoppet i mars 2026 och kan ändra både datum och detaljer. Vägledning,
        inte juridisk rådgivning.
      </p>
    </div>
  )
}
