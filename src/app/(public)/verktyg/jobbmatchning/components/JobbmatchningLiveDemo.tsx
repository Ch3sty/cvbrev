'use client'

import { useEffect, useState } from 'react'
import { FileText, Check, Search, MapPin } from 'lucide-react'

/**
 * Live-demo som speglar /dashboard/jobbmatchning-flodet:
 * 1. "Aktivt CV"-rad overst med fil-namn + grön check
 * 2. Sokare-progress (~2 sek) "Soker X lediga jobb..."
 * 3. 4 jobbkort med match-procent-cirkel
 * 4. Loopar genom 3 yrken var ~13 sek
 */

interface JobItem {
  titel: string
  foretag: string
  ort: string
  distans: string
  procent: number
  initial: string
}

interface Scenario {
  cvNamn: string
  yrke: string
  totalJobb: number
  jobs: JobItem[]
}

/**
 * Scenarier valda for att vara realistiska for svenska arbetssokande.
 * USP: Vi matchar dig mot roller du inte tankt pa sjalv, inte bara din titel.
 *
 * Underskoterska -> aven stodassistent, vardbitrade, boendestodjare
 * Butikssaljare -> aven kundservice, lagerarbete, kassorska
 * Forskollarare -> aven barnskotare, specialpedagog, elevassistent
 */
const SCENARIOS: Scenario[] = [
  {
    cvNamn: 'underskoterska-cv.pdf',
    yrke: 'Undersköterska',
    totalJobb: 1843,
    jobs: [
      {
        titel: 'Undersköterska, hemtjänst',
        foretag: 'Linköpings kommun',
        ort: 'Linköping',
        distans: '4 km',
        procent: 94,
        initial: 'L',
      },
      {
        titel: 'Stödassistent LSS',
        foretag: 'Attendo',
        ort: 'Linköping',
        distans: '6 km',
        procent: 87,
        initial: 'A',
      },
      {
        titel: 'Vårdbiträde, äldreboende',
        foretag: 'Vardaga',
        ort: 'Norrköping',
        distans: '38 km',
        procent: 78,
        initial: 'V',
      },
      {
        titel: 'Boendestödjare, socialpsykiatri',
        foretag: 'Region Östergötland',
        ort: 'Linköping',
        distans: '5 km',
        procent: 65,
        initial: 'R',
      },
    ],
  },
  {
    cvNamn: 'butikssaljare-cv.pdf',
    yrke: 'Butikssäljare',
    totalJobb: 2156,
    jobs: [
      {
        titel: 'Butikssäljare deltid',
        foretag: 'Ica Maxi Stormarknad',
        ort: 'Västerås',
        distans: '3 km',
        procent: 92,
        initial: 'I',
      },
      {
        titel: 'Kundservicemedarbetare',
        foretag: 'Mekonomen',
        ort: 'Västerås',
        distans: '5 km',
        procent: 84,
        initial: 'M',
      },
      {
        titel: 'Lagerarbetare med truckkort',
        foretag: 'Postnord',
        ort: 'Västerås',
        distans: '8 km',
        procent: 76,
        initial: 'P',
      },
      {
        titel: 'Kassörska, säsongsanställning',
        foretag: 'Coop Forum',
        ort: 'Västerås',
        distans: '4 km',
        procent: 62,
        initial: 'C',
      },
    ],
  },
  {
    cvNamn: 'forskollarare-cv.pdf',
    yrke: 'Förskollärare',
    totalJobb: 1462,
    jobs: [
      {
        titel: 'Förskollärare, kommunal förskola',
        foretag: 'Uppsala kommun',
        ort: 'Uppsala',
        distans: '2 km',
        procent: 95,
        initial: 'U',
      },
      {
        titel: 'Barnskötare med pedagogisk inriktning',
        foretag: 'Förskolan Solrosen',
        ort: 'Uppsala',
        distans: '5 km',
        procent: 88,
        initial: 'S',
      },
      {
        titel: 'Specialpedagog förskola',
        foretag: 'Knivsta kommun',
        ort: 'Knivsta',
        distans: '24 km',
        procent: 79,
        initial: 'K',
      },
      {
        titel: 'Elevassistent grundskola',
        foretag: 'Internationella Engelska Skolan',
        ort: 'Uppsala',
        distans: '7 km',
        procent: 67,
        initial: 'I',
      },
    ],
  },
]

const SCENARIO_DURATION_MS = 13000
const SOKER_DURATION_MS = 1800

export default function JobbmatchningLiveDemo() {
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [phase, setPhase] = useState<'soker' | 'resultat'>('soker')
  const [fyllt, setFyllt] = useState(false)

  const scenario = SCENARIOS[scenarioIdx]

  useEffect(() => {
    setPhase('soker')
    setFyllt(false)

    const timeouts: NodeJS.Timeout[] = []
    timeouts.push(setTimeout(() => setFyllt(true), 50))
    timeouts.push(setTimeout(() => setPhase('resultat'), SOKER_DURATION_MS))
    timeouts.push(
      setTimeout(() => {
        setScenarioIdx((prev) => (prev + 1) % SCENARIOS.length)
      }, SCENARIO_DURATION_MS)
    )

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [scenarioIdx])

  return (
    <div className="w-full rounded-xl border border-kant bg-panel p-4 sm:p-5">
      {/* Aktivt CV */}
      <div className="mb-4 flex items-center gap-3 rounded-lg border border-kant bg-insunken p-3 shadow-insunken">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-panel text-ink-2">
          <FileText className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-steg uppercase text-positiv">Aktivt CV</div>
          <div className="truncate text-sm font-semibold text-ink-1">{scenario.cvNamn}</div>
          <div className="text-meta text-ink-3">{scenario.yrke}</div>
        </div>
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-positiv">
          <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} aria-hidden="true" />
        </div>
      </div>

      {/* Sökningen */}
      {phase === 'soker' && (
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2">
            <Search className="h-4 w-4 animate-pulse text-ink-2" strokeWidth={2.5} aria-hidden="true" />
            <span className="text-xs font-semibold text-ink-2">
              Söker bland {scenario.totalJobb.toLocaleString('sv-SE')} lediga jobb...
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-insunken">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-[1600ms] ease-in-out"
              style={{ width: fyllt ? '100%' : '0%' }}
            />
          </div>
        </div>
      )}

      {/* Resultat */}
      {phase === 'resultat' && (
        <div className="space-y-2.5">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-steg uppercase text-ink-3">Toppmatchningar</span>
            <span className="text-meta text-ink-3">Sorterade på relevans</span>
          </div>
          <div className="space-y-2.5">
            {scenario.jobs.map((job, idx) => (
              <JobCard key={`${scenarioIdx}-${idx}`} job={job} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// === Jobbkort med match-procent-cirkel ===

function JobCard({ job }: { job: JobItem }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-kant bg-panel p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-insunken text-base font-semibold text-ink-1">
        {job.initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12px] font-semibold leading-tight text-ink-1 sm:text-sm">{job.titel}</div>
        <div className="truncate text-[11px] text-ink-2">{job.foretag}</div>
        <div className="mt-0.5 flex items-center gap-1">
          <MapPin className="h-3 w-3 text-ink-3" strokeWidth={2.2} aria-hidden="true" />
          <span className="text-[11px] text-ink-3">
            {job.ort} · {job.distans}
          </span>
        </div>
      </div>
      <MatchCircle procent={job.procent} />
    </div>
  )
}

function MatchCircle({ procent }: { procent: number }) {
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (procent / 100) * circumference
  const topp = procent >= 80

  return (
    <div className="relative h-14 w-14 shrink-0 sm:h-16 sm:w-16">
      <svg viewBox="0 0 60 60" className="h-full w-full -rotate-90" fill="none" aria-hidden="true">
        <circle cx="30" cy="30" r={radius} strokeWidth="5" className="stroke-insunken" />
        <circle
          cx="30"
          cy="30"
          r={radius}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={topp ? 'stroke-ink-1' : 'stroke-kant-stark'}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold tabular-nums text-ink-1 sm:text-sm">
        {procent}%
      </div>
    </div>
  )
}
