'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Check, Sparkles, MapPin } from 'lucide-react'

/**
 * Live-demo som speglar /dashboard/jobbmatchning-flodet:
 * 1. "Aktivt CV"-rad overst med fil-namn + grön check
 * 2. Sokare-progress (~2 sek) "Soker X lediga jobb..."
 * 3. 4 jobb-kort som fadear in i sekvens, varje med animerad match-procent-cirkel
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

const SCENARIOS: Scenario[] = [
  {
    cvNamn: 'marknadsforare-cv.pdf',
    yrke: 'Marknadsförare',
    totalJobb: 2847,
    jobs: [
      {
        titel: 'Senior Marknadsansvarig',
        foretag: 'Spotify',
        ort: 'Stockholm',
        distans: '3 km',
        procent: 94,
        initial: 'S',
      },
      {
        titel: 'Brand Manager',
        foretag: 'Klarna',
        ort: 'Stockholm',
        distans: '5 km',
        procent: 87,
        initial: 'K',
      },
      {
        titel: 'Digital Marketing Lead',
        foretag: 'King',
        ort: 'Stockholm',
        distans: '7 km',
        procent: 78,
        initial: 'K',
      },
      {
        titel: 'Marknadskoordinator',
        foretag: 'H&M',
        ort: 'Stockholm',
        distans: '4 km',
        procent: 65,
        initial: 'H',
      },
    ],
  },
  {
    cvNamn: 'systemutvecklare-cv.pdf',
    yrke: 'Systemutvecklare',
    totalJobb: 3421,
    jobs: [
      {
        titel: 'Senior Backend Developer',
        foretag: 'Volvo',
        ort: 'Göteborg',
        distans: '6 km',
        procent: 92,
        initial: 'V',
      },
      {
        titel: 'Full-Stack Engineer',
        foretag: 'Tobii',
        ort: 'Stockholm',
        distans: '8 km',
        procent: 84,
        initial: 'T',
      },
      {
        titel: 'TypeScript Developer',
        foretag: 'Skåne IT',
        ort: 'Malmö',
        distans: '12 km',
        procent: 76,
        initial: 'S',
      },
      {
        titel: 'DevOps Engineer',
        foretag: 'Stena',
        ort: 'Göteborg',
        distans: '4 km',
        procent: 62,
        initial: 'S',
      },
    ],
  },
  {
    cvNamn: 'sjukskoterska-cv.pdf',
    yrke: 'Sjuksköterska',
    totalJobb: 1962,
    jobs: [
      {
        titel: 'Sjuksköterska Akut',
        foretag: 'Skånes Universitetssjukhus',
        ort: 'Malmö',
        distans: '2 km',
        procent: 95,
        initial: 'S',
      },
      {
        titel: 'Sjuksköterska Vårdcentral',
        foretag: 'Region Skåne',
        ort: 'Malmö',
        distans: '5 km',
        procent: 88,
        initial: 'R',
      },
      {
        titel: 'Specialistsjuksköterska',
        foretag: 'Lunds Universitetssjukhus',
        ort: 'Lund',
        distans: '18 km',
        procent: 79,
        initial: 'L',
      },
      {
        titel: 'Sjuksköterska Dagvård',
        foretag: 'Privat klinik',
        ort: 'Malmö',
        distans: '7 km',
        procent: 67,
        initial: 'P',
      },
    ],
  },
]

const SCENARIO_DURATION_MS = 13000
const SOKER_DURATION_MS = 1800

export default function JobbmatchningLiveDemo() {
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [phase, setPhase] = useState<'soker' | 'resultat'>('soker')

  const scenario = SCENARIOS[scenarioIdx]

  useEffect(() => {
    setPhase('soker')

    const timeouts: NodeJS.Timeout[] = []
    timeouts.push(
      setTimeout(() => {
        setPhase('resultat')
      }, SOKER_DURATION_MS)
    )

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
    <div
      className="rounded-3xl bg-white border border-orange-100 p-4 sm:p-5 lg:sticky lg:top-6 w-full"
      style={{
        boxShadow: '0 16px 48px -20px rgba(249, 115, 22, 0.28)',
      }}
    >
      {/* Aktivt CV */}
      <div className="flex items-center gap-3 p-3 rounded-2xl border border-emerald-200 bg-emerald-50/40 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #F97316, #DC2626)',
          }}
        >
          <FileText className="w-5 h-5" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`cv-${scenarioIdx}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-xs font-bold uppercase tracking-wide text-emerald-700 mb-0.5">
                Aktivt CV
              </div>
              <div className="text-sm font-bold text-slate-900 truncate">
                {scenario.cvNamn}
              </div>
              <div className="text-[11px] text-slate-500">{scenario.yrke}</div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </div>
      </div>

      {/* Sokare-progress */}
      {phase === 'soker' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mb-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles
              className="w-4 h-4 text-orange-600 animate-pulse"
              strokeWidth={2.5}
            />
            <span className="text-xs font-bold text-slate-700">
              Söker bland {scenario.totalJobb.toLocaleString('sv-SE')} lediga
              jobb...
            </span>
          </div>
          <div className="h-2 rounded-full bg-orange-100 overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.6, ease: 'easeInOut' }}
              className="h-full rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, #F97316, #DC2626, #BE185D)',
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Resultat */}
      {phase === 'resultat' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700">
              Toppmatchningar
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              Sorterade på relevans
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`results-${scenarioIdx}`}
              className="space-y-2.5"
            >
              {scenario.jobs.map((job, idx) => (
                <JobCard key={`${scenarioIdx}-${idx}`} job={job} idx={idx} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

// === Jobb-kort med animerad match-procent-cirkel ===

function JobCard({ job, idx }: { job: JobItem; idx: number }) {
  const isTopMatch = job.procent >= 80
  const isMidMatch = job.procent >= 60 && job.procent < 80

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: idx * 0.18 }}
      className="flex items-center gap-3 p-3 rounded-2xl border border-orange-100 bg-white hover:border-orange-200 transition-colors"
    >
      {/* Foretagslogo */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0"
        style={{
          background: 'linear-gradient(135deg, #F97316, #DC2626)',
        }}
      >
        {job.initial}
      </div>

      {/* Job-info */}
      <div className="flex-1 min-w-0">
        <div className="text-[12px] sm:text-sm font-bold text-slate-900 truncate leading-tight">
          {job.titel}
        </div>
        <div className="text-[11px] text-slate-600 truncate">
          {job.foretag}
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 text-slate-400" strokeWidth={2.2} />
          <span className="text-[10px] text-slate-500">
            {job.ort} · {job.distans}
          </span>
        </div>
      </div>

      {/* Match-procent-cirkel */}
      <MatchCircle
        procent={job.procent}
        isTopMatch={isTopMatch}
        isMidMatch={isMidMatch}
        animDelay={idx * 0.18 + 0.15}
      />
    </motion.div>
  )
}

function MatchCircle({
  procent,
  isTopMatch,
  isMidMatch,
  animDelay,
}: {
  procent: number
  isTopMatch: boolean
  isMidMatch: boolean
  animDelay: number
}) {
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (procent / 100) * circumference

  // Farg baserad pa match-niva
  const strokeColor = isTopMatch
    ? 'url(#match-grad-top)'
    : isMidMatch
    ? 'url(#match-grad-mid)'
    : '#94A3B8'

  const textColor = isTopMatch
    ? '#DC2626'
    : isMidMatch
    ? '#EA580C'
    : '#64748B'

  return (
    <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
      <svg
        viewBox="0 0 60 60"
        className="w-full h-full -rotate-90"
        fill="none"
      >
        <defs>
          <linearGradient id="match-grad-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F97316" />
            <stop offset="0.55" stopColor="#DC2626" />
            <stop offset="1" stopColor="#BE185D" />
          </linearGradient>
          <linearGradient id="match-grad-mid" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FB923C" />
            <stop offset="1" stopColor="#F97316" />
          </linearGradient>
        </defs>
        <circle
          cx="30"
          cy="30"
          r={radius}
          stroke="#FED7AA"
          strokeWidth="5"
          fill="white"
        />
        <motion.circle
          cx="30"
          cy="30"
          r={radius}
          stroke={strokeColor}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, delay: animDelay, ease: 'easeOut' }}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm font-black"
        style={{ color: textColor }}
      >
        {procent}%
      </div>
    </div>
  )
}
