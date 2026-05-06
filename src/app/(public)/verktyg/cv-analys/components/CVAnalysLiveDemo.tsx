'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Check, Sparkles, TrendingUp } from 'lucide-react'

/**
 * Live-demo som speglar dashboard-flodet i /dashboard/cv-analys:
 * 1. Ladda upp CV
 * 2. Vi analyserar (progress)
 * 3. ATS-poang i cirkel + grade
 * 4. Kategori-uppdelning som staplar
 * 5. Forbattringsforslag som kort
 * 6. Before/after-textbyte
 * 7. ATS-cirkel animerar till nytt vardet + total-impact
 * Loopar genom 3 yrken var ~16 sekund.
 */

interface KategoriPoang {
  namn: string
  procent: number
}

interface Forbattring {
  titel: string
  impact: number
}

interface ForeEfter {
  fore: string
  efter: string
}

interface Scenario {
  cvNamn: string
  yrke: string
  startPoang: number
  slutPoang: number
  startGrade: string
  slutGrade: string
  kategorier: KategoriPoang[]
  forbattringar: Forbattring[]
  foreEfter: ForeEfter
}

const SCENARIOS: Scenario[] = [
  {
    cvNamn: 'marknadsforare-cv-2026.pdf',
    yrke: 'Marknadsförare',
    startPoang: 62,
    slutPoang: 89,
    startGrade: 'C',
    slutGrade: 'A',
    kategorier: [
      { namn: 'Struktur', procent: 78 },
      { namn: 'Språk', procent: 65 },
      { namn: 'Nyckelord', procent: 41 },
      { namn: 'Kvantifiering', procent: 38 },
    ],
    forbattringar: [
      { titel: 'Profilbeskrivning', impact: 8 },
      { titel: 'Rollerförbättringar', impact: 12 },
      { titel: 'Nyckelord', impact: 7 },
    ],
    foreEfter: {
      fore: 'Ansvarig för säljteamet och uppföljning av kampanjer.',
      efter:
        'Ledde säljteam på 12 personer och drev kampanjer som ökade omsättningen 23% under 18 månader.',
    },
  },
  {
    cvNamn: 'systemutvecklare-cv.pdf',
    yrke: 'Systemutvecklare',
    startPoang: 54,
    slutPoang: 86,
    startGrade: 'D',
    slutGrade: 'A',
    kategorier: [
      { namn: 'Struktur', procent: 70 },
      { namn: 'Språk', procent: 58 },
      { namn: 'Nyckelord', procent: 35 },
      { namn: 'Kvantifiering', procent: 42 },
    ],
    forbattringar: [
      { titel: 'Tekniska nyckelord', impact: 14 },
      { titel: 'Rollbeskrivningar', impact: 11 },
      { titel: 'Profilstyckning', impact: 7 },
    ],
    foreEfter: {
      fore: 'Arbetade med backend-utveckling i ett agilt team.',
      efter:
        'Byggde mikrotjänster i Node.js och TypeScript som hanterade 8 miljoner förfrågningar dagligen för ett team på sju utvecklare.',
    },
  },
  {
    cvNamn: 'sjukskoterska-cv.pdf',
    yrke: 'Sjuksköterska',
    startPoang: 68,
    slutPoang: 91,
    startGrade: 'C',
    slutGrade: 'A',
    kategorier: [
      { namn: 'Struktur', procent: 82 },
      { namn: 'Språk', procent: 71 },
      { namn: 'Nyckelord', procent: 48 },
      { namn: 'Kvantifiering', procent: 35 },
    ],
    forbattringar: [
      { titel: 'Vårdspecialiseringar', impact: 10 },
      { titel: 'Patientvolymer', impact: 9 },
      { titel: 'Certifieringar', impact: 4 },
    ],
    foreEfter: {
      fore: 'Arbetar som sjuksköterska på akutmottagning.',
      efter:
        'Bemannade akutmottagning med 18 patienter per skift och tog ansvar för triagering enligt RETTS samt mentorskap för tre kollegor.',
    },
  },
]

type DemoStep =
  | 'upload'
  | 'analyzing'
  | 'score-start'
  | 'kategorier'
  | 'forbattringar'
  | 'foreefter'
  | 'score-slut'

export default function CVAnalysLiveDemo() {
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [step, setStep] = useState<DemoStep>('upload')

  const scenario = SCENARIOS[scenarioIdx]

  useEffect(() => {
    const timings: Array<[number, DemoStep]> = [
      [0, 'upload'],
      [1200, 'analyzing'],
      [3000, 'score-start'],
      [4800, 'kategorier'],
      [7000, 'forbattringar'],
      [9500, 'foreefter'],
      [12500, 'score-slut'],
    ]

    const timeouts: NodeJS.Timeout[] = []
    timings.forEach(([ms, s]) => {
      timeouts.push(setTimeout(() => setStep(s), ms))
    })

    timeouts.push(
      setTimeout(() => {
        setScenarioIdx((prev) => (prev + 1) % SCENARIOS.length)
        setStep('upload')
      }, 16000)
    )

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [scenarioIdx])

  const isShowingSlutPoang = step === 'score-slut'
  const aktuellPoang = isShowingSlutPoang
    ? scenario.slutPoang
    : step === 'score-start' ||
      step === 'kategorier' ||
      step === 'forbattringar' ||
      step === 'foreefter'
    ? scenario.startPoang
    : 0

  return (
    <div
      className="rounded-3xl bg-white border border-orange-100 p-5 sm:p-6 lg:sticky lg:top-6 w-full"
      style={{
        boxShadow: '0 16px 48px -20px rgba(249, 115, 22, 0.28)',
      }}
    >
      {/* CV-fil overst */}
      <div
        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all mb-4 ${
          step === 'upload' || step === 'analyzing'
            ? 'border-orange-200 bg-orange-50/50'
            : 'border-emerald-200 bg-emerald-50/40'
        }`}
      >
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
              <div className="text-sm font-bold text-slate-900 truncate">
                {scenario.cvNamn}
              </div>
              <div className="text-[11px] text-slate-500">
                {scenario.yrke} · PDF · 2 sidor
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        {step !== 'upload' && step !== 'analyzing' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"
          >
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </motion.div>
        )}
      </div>

      {/* Analyzing-progress */}
      {step === 'analyzing' && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles
              className="w-4 h-4 text-orange-600 animate-pulse"
              strokeWidth={2.5}
            />
            <span className="text-xs font-bold text-slate-700">
              Vi analyserar ditt CV...
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
        </div>
      )}

      {/* Result-blocket: ATS-cirkel + kategorier sida vid sida */}
      {(step === 'score-start' ||
        step === 'kategorier' ||
        step === 'forbattringar' ||
        step === 'foreefter' ||
        step === 'score-slut') && (
        <div className="grid grid-cols-[auto_1fr] gap-4 mb-4">
          {/* ATS-cirkel */}
          <ATSCircle
            poang={aktuellPoang}
            grade={
              isShowingSlutPoang ? scenario.slutGrade : scenario.startGrade
            }
            slut={isShowingSlutPoang}
          />

          {/* Kategori-staplar */}
          <div className="space-y-2 self-center min-w-0">
            {scenario.kategorier.map((kat, idx) => (
              <KategoriStapel
                key={kat.namn}
                kat={kat}
                visible={
                  step === 'kategorier' ||
                  step === 'forbattringar' ||
                  step === 'foreefter' ||
                  step === 'score-slut'
                }
                delay={idx * 0.08}
              />
            ))}
          </div>
        </div>
      )}

      {/* Forbattringar */}
      {(step === 'forbattringar' ||
        step === 'foreefter' ||
        step === 'score-slut') && (
        <div className="space-y-1.5 mb-3">
          {scenario.forbattringar.map((forb, idx) => (
            <motion.div
              key={`${scenarioIdx}-${forb.titel}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-orange-50/60 border border-orange-100"
            >
              <span className="text-xs sm:text-sm font-bold text-slate-700">
                {forb.titel}
              </span>
              <span
                className="text-xs font-black px-2 py-0.5 rounded-full text-white"
                style={{
                  background: 'linear-gradient(135deg, #F97316, #DC2626)',
                }}
              >
                +{forb.impact} ATS
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Before/after */}
      {(step === 'foreefter' || step === 'score-slut') && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-orange-100 overflow-hidden mb-3"
        >
          <div className="bg-rose-50 border-b border-orange-100 px-3 py-2">
            <div className="text-[9px] font-black uppercase tracking-wide text-rose-700 mb-0.5">
              Före
            </div>
            <p className="text-[11px] text-rose-900/80 leading-snug line-through decoration-rose-300">
              {scenario.foreEfter.fore}
            </p>
          </div>
          <div className="bg-emerald-50 px-3 py-2">
            <div className="text-[9px] font-black uppercase tracking-wide text-emerald-700 mb-0.5">
              Efter
            </div>
            <p className="text-[11px] text-emerald-900 leading-snug font-medium">
              {scenario.foreEfter.efter}
            </p>
          </div>
        </motion.div>
      )}

      {/* Total-impact-banner */}
      {step === 'score-slut' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-white font-bold text-sm"
          style={{
            background:
              'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
            boxShadow: '0 8px 20px -8px rgba(220, 38, 38, 0.45)',
          }}
        >
          <TrendingUp className="w-4 h-4" strokeWidth={2.8} />
          <span>
            Total ökning: +{scenario.slutPoang - scenario.startPoang} poäng
          </span>
        </motion.div>
      )}
    </div>
  )
}

// === ATS-cirkel-komponent ===

interface ATSCircleProps {
  poang: number
  grade: string
  slut: boolean
}

function ATSCircle({ poang, grade, slut }: ATSCircleProps) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (poang / 100) * circumference

  return (
    <div className="relative w-[112px] h-[112px] flex-shrink-0">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full -rotate-90"
        fill="none"
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#FED7AA"
          strokeWidth="8"
          fill="white"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          stroke="url(#cva-circle-grad)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient
            id="cva-circle-grad"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0" stopColor="#F97316" />
            <stop offset="0.55" stopColor="#DC2626" />
            <stop offset="1" stopColor="#BE185D" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          key={`poang-${poang}-${slut}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-2xl font-black text-slate-900 leading-none"
        >
          {poang}
        </motion.div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-orange-700 mt-1">
          ATS · {grade}
        </div>
      </div>
    </div>
  )
}

// === Kategori-stapel ===

interface KategoriStapelProps {
  kat: KategoriPoang
  visible: boolean
  delay: number
}

function KategoriStapel({ kat, visible, delay }: KategoriStapelProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-0.5">
        <span className="text-[10px] sm:text-[11px] font-bold text-slate-700">
          {kat.namn}
        </span>
        <span className="text-[10px] font-black text-orange-700">
          {visible ? kat.procent : 0}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-orange-100 overflow-hidden">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: visible ? `${kat.procent}%` : '0%' }}
          transition={{ duration: 0.8, delay, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #F97316, #DC2626)',
          }}
        />
      </div>
    </div>
  )
}
