'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Live-demo som speglar /dashboard/linkedin-optimizer Step 3 (Result split-view):
 * 1. Topp: mini-LinkedIn-header + sektion-tabs
 * 2. Score-cirklar (Fore / Efter) med animerad procent
 * 3. Fore/Efter-kort sida vid sida (eller staplade pa mobil)
 * 4. Loopar genom 3 sektioner (Headline / Om mig / Erfarenhet) var ~14 sek
 */

type SectionKey = 'headline' | 'om' | 'erfarenhet'

interface Scenario {
  key: SectionKey
  label: string
  beforeScore: number
  afterScore: number
  before: string
  after: string
  improvements: string[]
}

const SCENARIOS: Scenario[] = [
  {
    key: 'headline',
    label: 'Rubrik',
    beforeScore: 32,
    afterScore: 87,
    before: 'Marknadsförare',
    after:
      'Marknadsförare som driver SaaS-tillväxt | Inbound, content, performance | Jobbar med B2B-bolag i tillväxtfas',
    improvements: ['Branschspecifika keywords', 'Mätbar specialisering', 'Tydlig målgrupp'],
  },
  {
    key: 'om',
    label: 'Om mig',
    beforeScore: 41,
    afterScore: 89,
    before:
      'Jag är en passionerad och driven marknadsförare som älskar att jobba med människor och utveckla varumärken.',
    after:
      'Driver inbound och content marketing för SaaS-bolag i scale-up-fas. På Klarna och Voi har jag byggt content-program som genererat 12 000+ leads och sänkt CAC med 38%. Specialiserad på B2B-positionering och GTM-strategi för techbolag som siktar på Series B+.',
    improvements: ['Konkreta resultat', 'Specifika nischer', 'Inga buzzwords'],
  },
  {
    key: 'erfarenhet',
    label: 'Erfarenhet',
    beforeScore: 38,
    afterScore: 84,
    before: 'Marknadsförare på Klarna 2021-2023. Ansvarade för marknadsföring och kampanjer.',
    after:
      'Senior Content Marketing Manager · Klarna · 2021-2023\n\nLedde content-strategin för Klarnas B2B-vertical. Byggde redaktionellt team från 0 till 4 skribenter och drev fram en content-pipeline som producerade 40+ artiklar per kvartal.\n\n• Genererade 8 200 MQL via SEO-content (+220% YoY)\n• Sänkte CAC med 38% genom organisk distribution',
    improvements: ['STAR-struktur', 'Kvantifiering', 'Action verbs'],
  },
]

const SCENARIO_DURATION_MS = 14000

export default function LinkedinOptimeringLiveDemo() {
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const scenario = SCENARIOS[scenarioIdx]

  useEffect(() => {
    const t = setTimeout(() => {
      setScenarioIdx((prev) => (prev + 1) % SCENARIOS.length)
    }, SCENARIO_DURATION_MS)
    return () => clearTimeout(t)
  }, [scenarioIdx])

  return (
    <div
      className="rounded-3xl bg-white border border-orange-100 overflow-hidden lg:sticky lg:top-6 w-full"
      style={{
        boxShadow: '0 16px 48px -20px rgba(249, 115, 22, 0.28)',
      }}
    >
      {/* Mini-LinkedIn-header */}
      <div className="px-4 sm:px-5 py-3 bg-orange-50/40 border-b border-orange-100">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black flex-shrink-0"
            style={{
              background:
                'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
            }}
          >
            A
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-black text-slate-900 truncate">
              Anna Lindberg
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              Stockholm · Marknadsförare
            </div>
          </div>
        </div>
      </div>

      {/* Sektion-tabs */}
      <div className="px-4 sm:px-5 pt-3 pb-2 border-b border-orange-100 bg-white">
        <div className="flex gap-1 overflow-x-auto -mx-1 px-1 scrollbar-none">
          {SCENARIOS.map((s, i) => (
            <button
              key={s.key}
              disabled
              aria-hidden="true"
              tabIndex={-1}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors flex-shrink-0 cursor-default ${
                i === scenarioIdx
                  ? 'text-white'
                  : 'text-slate-500 bg-orange-50 border border-orange-100'
              }`}
              style={
                i === scenarioIdx
                  ? {
                      background:
                        'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                    }
                  : undefined
              }
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Score-hero */}
      <div className="px-4 sm:px-5 py-4 bg-orange-50/30 border-b border-orange-100">
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <ScoreCircle key={`before-${scenarioIdx}`} value={scenario.beforeScore} variant="before" label="Före" />
          <ArrowBetween />
          <ScoreCircle key={`after-${scenarioIdx}`} value={scenario.afterScore} variant="after" label="Efter" />
        </div>
      </div>

      {/* Fore/Efter-kort */}
      <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-[280px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`before-card-${scenarioIdx}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 sm:p-4"
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-2">
              Före
            </div>
            <p className="text-[12px] sm:text-[13px] text-slate-600 leading-relaxed whitespace-pre-line">
              {scenario.before}
            </p>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={`after-card-${scenarioIdx}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-2xl border border-orange-200 p-3 sm:p-4"
            style={{
              background:
                'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
              boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.2)',
            }}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700 mb-2">
              Efter
            </div>
            <p className="text-[12px] sm:text-[13px] text-slate-800 leading-relaxed whitespace-pre-line font-medium">
              {scenario.after}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Forbattringar */}
      <div className="px-4 sm:px-5 py-3 border-t border-orange-100 bg-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={`imp-${scenarioIdx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-wrap gap-1.5"
          >
            {scenario.improvements.map((imp, i) => (
              <motion.span
                key={imp}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, delay: 0.05 * i }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] sm:text-[11px] font-bold text-emerald-700"
              >
                <span className="text-emerald-500">+</span>
                {imp}
              </motion.span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// === Score-cirkel ===

function ScoreCircle({
  value,
  variant,
  label,
}: {
  value: number
  variant: 'before' | 'after'
  label: string
}) {
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  const stroke =
    variant === 'before'
      ? '#94A3B8'
      : 'url(#lo-score-after)'
  const textColor = variant === 'before' ? '#64748B' : '#DC2626'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-14 h-14 sm:w-16 sm:h-16">
        <svg viewBox="0 0 60 60" className="w-full h-full -rotate-90" fill="none">
          <defs>
            <linearGradient id="lo-score-after" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#F97316" />
              <stop offset="0.55" stopColor="#DC2626" />
              <stop offset="1" stopColor="#BE185D" />
            </linearGradient>
          </defs>
          <circle cx="30" cy="30" r={radius} stroke="#FED7AA" strokeWidth="5" fill="white" opacity={variant === 'before' ? 0.5 : 1} />
          <motion.circle
            cx="30"
            cy="30"
            r={radius}
            stroke={stroke}
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center text-sm sm:text-base font-black"
          style={{ color: textColor }}
        >
          {value}
        </div>
      </div>
      <span
        className={`text-[10px] font-bold uppercase tracking-[0.14em] ${
          variant === 'before' ? 'text-slate-500' : 'text-orange-700'
        }`}
      >
        {label}
      </span>
    </div>
  )
}

function ArrowBetween() {
  return (
    <svg
      width="24"
      height="20"
      viewBox="0 0 24 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lo-arrow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F97316" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
      </defs>
      <line x1="2" y1="10" x2="20" y2="10" stroke="url(#lo-arrow)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 16 5 L 22 10 L 16 15" stroke="url(#lo-arrow)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}
