'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Clock, ArrowRight } from 'lucide-react'

/**
 * Live-demo som speglar /dashboard/tester-flodet:
 * 1. Topp: testtyp-pill + progress + timer
 * 2. Sjalva fragan (matris / verbal / numerisk)
 * 3. Svarsval som markeras automatiskt med ratt svar efter ~2 sek
 * 4. Loopar genom 3 testtyper var ~12 sek
 */

type TestType = 'matris' | 'verbal' | 'numerisk'
type Phase = 'fraga' | 'svar'

interface Scenario {
  type: TestType
  label: string
  questionNum: number
  totalQuestions: number
  timer: string
  correctIdx: number
  options: string[]
}

const SCENARIOS: Scenario[] = [
  {
    type: 'matris',
    label: 'Matrislogik',
    questionNum: 3,
    totalQuestions: 15,
    timer: '01:24',
    correctIdx: 2,
    options: ['A', 'B', 'C', 'D', 'E', 'F'],
  },
  {
    type: 'verbal',
    label: 'Verbalt resonemang',
    questionNum: 7,
    totalQuestions: 48,
    timer: '04:12',
    correctIdx: 2,
    options: ['Sant', 'Falskt', 'Går ej att avgöra'],
  },
  {
    type: 'numerisk',
    label: 'Numeriskt resonemang',
    questionNum: 5,
    totalQuestions: 24,
    timer: '03:08',
    correctIdx: 1,
    options: ['9,4 %', '11,3 %', '13,2 %', '15,8 %'],
  },
]

const SCENARIO_DURATION_MS = 12000
const FRAGA_DURATION_MS = 2200

export default function RekryteringstesterLiveDemo() {
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('fraga')

  const scenario = SCENARIOS[scenarioIdx]

  useEffect(() => {
    setPhase('fraga')

    const timeouts: NodeJS.Timeout[] = []
    timeouts.push(setTimeout(() => setPhase('svar'), FRAGA_DURATION_MS))
    timeouts.push(
      setTimeout(() => {
        setScenarioIdx((prev) => (prev + 1) % SCENARIOS.length)
      }, SCENARIO_DURATION_MS)
    )

    return () => timeouts.forEach(clearTimeout)
  }, [scenarioIdx])

  const progressPct = (scenario.questionNum / scenario.totalQuestions) * 100

  return (
    <div
      className="rounded-3xl bg-white border border-orange-100 overflow-hidden lg:sticky lg:top-6 w-full"
      style={{
        boxShadow: '0 16px 48px -20px rgba(249, 115, 22, 0.28)',
      }}
    >
      {/* Topp: testtyp + progress + timer */}
      <div className="px-4 sm:px-5 py-3 border-b border-orange-100 bg-orange-50/40">
        <div className="flex items-center justify-between gap-3 mb-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={`pill-${scenarioIdx}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.25 }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.14em] text-white"
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
              {scenario.label}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Clock className="w-3.5 h-3.5 text-orange-600" strokeWidth={2.5} />
            <AnimatePresence mode="wait">
              <motion.span
                key={`timer-${scenarioIdx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="tabular-nums"
              >
                {scenario.timer}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex-1 h-1.5 rounded-full bg-orange-100 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={`prog-${scenarioIdx}`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background:
                    'linear-gradient(90deg, #F97316, #DC2626, #BE185D)',
                }}
              />
            </AnimatePresence>
          </div>
          <span className="text-[10px] font-bold text-slate-600 tabular-nums">
            {scenario.questionNum}/{scenario.totalQuestions}
          </span>
        </div>
      </div>

      {/* Fraga */}
      <div className="px-4 sm:px-5 py-4 sm:py-5 min-h-[300px] sm:min-h-[340px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`q-${scenarioIdx}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {scenario.type === 'matris' && <MatrisFraga />}
            {scenario.type === 'verbal' && <VerbalFraga />}
            {scenario.type === 'numerisk' && <NumeriskFraga />}
          </motion.div>
        </AnimatePresence>

        {/* Svarsval */}
        <div
          className={`mt-4 grid gap-2 ${
            scenario.type === 'matris'
              ? 'grid-cols-3 sm:grid-cols-6'
              : scenario.type === 'verbal'
              ? 'grid-cols-1'
              : 'grid-cols-2'
          }`}
        >
          {scenario.options.map((opt, i) => {
            const isCorrect = phase === 'svar' && i === scenario.correctIdx
            return (
              <motion.div
                key={`${scenarioIdx}-${i}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
                  isCorrect
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-orange-100 bg-white'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isCorrect
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-orange-200'
                  }`}
                >
                  {isCorrect && (
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.5} />
                  )}
                </div>
                <span
                  className={`text-[12px] sm:text-sm font-bold truncate ${
                    isCorrect ? 'text-emerald-800' : 'text-slate-700'
                  }`}
                >
                  {opt}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Botten: nasta-knapp */}
      <div className="px-4 sm:px-5 py-3 border-t border-orange-100 bg-white flex items-center justify-between gap-3">
        <AnimatePresence>
          {phase === 'svar' && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs font-bold text-emerald-700"
            >
              Rätt svar
            </motion.div>
          )}
        </AnimatePresence>
        <button
          disabled
          aria-hidden="true"
          tabIndex={-1}
          className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold cursor-default"
          style={{
            background: 'linear-gradient(135deg, #F97316, #DC2626)',
            opacity: 0.92,
          }}
        >
          Nästa
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}

// === Matris-fraga: 3x3 grid med rotation-progression (klassiskt SHL-monster) ===

function MatrisFraga() {
  // Klassiskt rotationsmonster: pilen roterar 45 grader per kolumn
  // Rad 1: 0deg, 45deg, 90deg
  // Rad 2: 90deg, 135deg, 180deg
  // Rad 3: 180deg, 225deg, ? (=270deg)
  const cells = [
    { rotation: 0 },
    { rotation: 45 },
    { rotation: 90 },
    { rotation: 90 },
    { rotation: 135 },
    { rotation: 180 },
    { rotation: 180 },
    { rotation: 225 },
    { rotation: null }, // empty
  ]

  return (
    <div>
      <div className="text-xs font-bold text-slate-500 mb-3">
        Vilken form ska stå i den tomma rutan?
      </div>
      <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto">
        {cells.map((cell, i) => (
          <div
            key={i}
            className={`aspect-square rounded-lg border-2 flex items-center justify-center ${
              cell.rotation === null
                ? 'border-dashed border-orange-300 bg-orange-50/50'
                : 'border-orange-100 bg-white'
            }`}
          >
            {cell.rotation !== null ? (
              <ArrowGlyph rotation={cell.rotation} />
            ) : (
              <span className="text-2xl font-black text-orange-300">?</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ArrowGlyph({ rotation }: { rotation: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className="w-7 h-7 sm:w-8 sm:h-8"
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="arrow-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F97316" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
      </defs>
      {/* Pil-skaft */}
      <line
        x1="16"
        y1="24"
        x2="16"
        y2="10"
        stroke="url(#arrow-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Pil-spets */}
      <path
        d="M 11 13 L 16 8 L 21 13"
        stroke="url(#arrow-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

// === Verbal-fraga: textpassage + statement ===

function VerbalFraga() {
  return (
    <div>
      <div className="rounded-xl bg-orange-50/60 border border-orange-100 p-3 mb-3">
        <p className="text-[12px] sm:text-[13px] text-slate-700 leading-relaxed">
          En undersökning från SCB visar att andelen svenskar som arbetar
          hemifrån ökade kraftigt under 2023. Bland tjänstemän rapporterade
          54 % att de arbetade hemifrån minst en dag i veckan, jämfört med
          21 % före pandemin.
        </p>
      </div>
      <div className="text-xs font-bold text-slate-500 mb-1.5">Påstående:</div>
      <p className="text-[13px] sm:text-sm font-bold text-slate-900 leading-snug">
        Mer än hälften av alla svenska arbetstagare jobbar hemifrån varje vecka.
      </p>
    </div>
  )
}

// === Numerisk-fraga: tabell + procent-fraga ===

function NumeriskFraga() {
  return (
    <div>
      <div className="rounded-xl border border-orange-100 overflow-hidden mb-3">
        <div
          className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white"
          style={{
            background: 'linear-gradient(135deg, #F97316, #DC2626)',
          }}
        >
          Försäljning per kvartal (Mkr)
        </div>
        <table className="w-full text-[12px] tabular-nums">
          <thead>
            <tr className="bg-orange-50/60 text-slate-600">
              <th className="text-left px-3 py-1.5 font-bold">Kvartal</th>
              <th className="text-right px-3 py-1.5 font-bold">2023</th>
              <th className="text-right px-3 py-1.5 font-bold">2024</th>
            </tr>
          </thead>
          <tbody className="text-slate-800">
            <tr className="border-t border-orange-100">
              <td className="px-3 py-1.5 font-bold">Q1</td>
              <td className="text-right px-3 py-1.5">142</td>
              <td className="text-right px-3 py-1.5">158</td>
            </tr>
            <tr className="border-t border-orange-100">
              <td className="px-3 py-1.5 font-bold">Q2</td>
              <td className="text-right px-3 py-1.5">156</td>
              <td className="text-right px-3 py-1.5 font-black text-orange-700">
                174
              </td>
            </tr>
            <tr className="border-t border-orange-100">
              <td className="px-3 py-1.5 font-bold">Q3</td>
              <td className="text-right px-3 py-1.5">168</td>
              <td className="text-right px-3 py-1.5">185</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-[13px] sm:text-sm font-bold text-slate-900 leading-snug">
        Med vilken procent ökade Q2-försäljningen från 2023 till 2024?
      </p>
    </div>
  )
}
