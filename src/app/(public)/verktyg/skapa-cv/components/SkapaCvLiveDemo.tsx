'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'

/**
 * Live-demo som speglar /dashboard/skapa-cv-flodet.
 * - Progress-prickar 1->7 (samma stil som SkapaCvProgress)
 * - Vanster: animerade input-fields som typewriter:as in
 * - Hoger: mini A4-CV som fylls i i sekvens
 * - Loopar genom 3 yrken (~14 sek per varv)
 */

interface InputAnim {
  label: string
  value: string
  /** ms efter scenarie-start nar input ska borja typas */
  startAtMs: number
  /** ms typewriter-tid per tecken */
  charMs?: number
}

interface Scenario {
  yrkeChip: string // visas i CV-preview kontaktrad
  steg1Inputs: InputAnim[] // Kontakt
  steg3Inputs: InputAnim[] // Erfarenhet
  steg5Skills: string[] // Kompetenser
  template: string
}

const SCENARIOS: Scenario[] = [
  {
    yrkeChip: 'Marknadsförare',
    steg1Inputs: [
      { label: 'Fullständigt namn', value: 'Anna Andersson', startAtMs: 200 },
      { label: 'E-post', value: 'anna@email.se', startAtMs: 1400 },
      { label: 'Jobbtitel', value: 'Senior Marknadsförare', startAtMs: 2400 },
    ],
    steg3Inputs: [
      { label: 'Position', value: 'Senior Marknadsförare', startAtMs: 4200 },
      { label: 'Företag', value: 'Spotify', startAtMs: 5400 },
    ],
    steg5Skills: ['Figma', 'Design Systems', 'Användartester', 'A/B-testning'],
    template: 'Modern Minimal',
  },
  {
    yrkeChip: 'Systemutvecklare',
    steg1Inputs: [
      { label: 'Fullständigt namn', value: 'Erik Lindberg', startAtMs: 200 },
      { label: 'E-post', value: 'erik@email.se', startAtMs: 1400 },
      { label: 'Jobbtitel', value: 'Systemutvecklare', startAtMs: 2400 },
    ],
    steg3Inputs: [
      { label: 'Position', value: 'Senior Backend Developer', startAtMs: 4200 },
      { label: 'Företag', value: 'Klarna', startAtMs: 5400 },
    ],
    steg5Skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
    template: 'Klassisk Professionell',
  },
  {
    yrkeChip: 'Sjuksköterska',
    steg1Inputs: [
      { label: 'Fullständigt namn', value: 'Sara Nilsson', startAtMs: 200 },
      { label: 'E-post', value: 'sara@email.se', startAtMs: 1400 },
      { label: 'Jobbtitel', value: 'Sjuksköterska', startAtMs: 2400 },
    ],
    steg3Inputs: [
      { label: 'Position', value: 'Sjuksköterska Akut', startAtMs: 4200 },
      { label: 'Företag', value: 'Karolinska', startAtMs: 5400 },
    ],
    steg5Skills: ['Triage RETTS', 'Patientvård', 'Mentor', 'Akutsjukvård'],
    template: 'Klassisk Professionell',
  },
]

const STEG_TIMINGS = [
  { step: 1, ms: 0 },
  { step: 2, ms: 3500 },
  { step: 3, ms: 4000 },
  { step: 4, ms: 6500 },
  { step: 5, ms: 7000 },
  { step: 6, ms: 9500 },
  { step: 7, ms: 10000 },
]

const SCENARIO_DURATION_MS = 14000

export default function SkapaCvLiveDemo() {
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [activeStep, setActiveStep] = useState(1)
  const [elapsedMs, setElapsedMs] = useState(0)

  const scenario = SCENARIOS[scenarioIdx]

  // Stega genom 1 -> 7 inom scenario, byt scenario efter ~14 sek
  useEffect(() => {
    setActiveStep(1)
    setElapsedMs(0)

    const stepTimeouts: NodeJS.Timeout[] = []
    STEG_TIMINGS.forEach(({ step, ms }) => {
      stepTimeouts.push(setTimeout(() => setActiveStep(step), ms))
    })

    // Tick var 100ms for typewriter-effekter
    const tickInterval = setInterval(() => {
      setElapsedMs((prev) => prev + 100)
    }, 100)

    const scenarioTimeout = setTimeout(() => {
      setScenarioIdx((prev) => (prev + 1) % SCENARIOS.length)
    }, SCENARIO_DURATION_MS)

    return () => {
      stepTimeouts.forEach(clearTimeout)
      clearInterval(tickInterval)
      clearTimeout(scenarioTimeout)
    }
  }, [scenarioIdx])

  return (
    <div
      className="rounded-3xl bg-white border border-orange-100 p-4 sm:p-5 lg:sticky lg:top-6 w-full"
      style={{
        boxShadow: '0 16px 48px -20px rgba(249, 115, 22, 0.28)',
      }}
    >
      {/* Progress-prickar 1-7 */}
      <div className="flex items-center justify-between gap-1 mb-5 px-1">
        {[1, 2, 3, 4, 5, 6, 7].map((s, i) => {
          const done = activeStep > s
          const current = activeStep === s
          return (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-black transition-all ${
                  done || current ? 'text-white' : 'bg-slate-100 text-slate-400'
                }`}
                style={
                  done || current
                    ? {
                        background:
                          'linear-gradient(135deg, #F97316, #DC2626)',
                      }
                    : undefined
                }
              >
                {done ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={3} /> : s}
              </div>
              {i < 6 && (
                <div
                  className={`flex-1 h-0.5 mx-0.5 sm:mx-1 rounded-full transition-colors ${
                    done ? 'bg-orange-300' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.1fr] gap-4">
        {/* === Inputs (vanster) === */}
        <div className="space-y-2.5">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700">
            {activeStep <= 2 && 'Kontaktuppgifter'}
            {activeStep >= 3 && activeStep <= 4 && 'Erfarenhet'}
            {activeStep >= 5 && activeStep <= 6 && 'Kompetenser'}
            {activeStep === 7 && 'Granska'}
          </div>

          {/* Steg 1: Kontakt */}
          {activeStep <= 2 &&
            scenario.steg1Inputs.map((inp, idx) => (
              <AnimatedInput
                key={`s1-${scenarioIdx}-${idx}`}
                label={inp.label}
                value={inp.value}
                startAtMs={inp.startAtMs}
                elapsedMs={elapsedMs}
              />
            ))}

          {/* Steg 3: Erfarenhet */}
          {activeStep >= 3 && activeStep <= 4 && (
            <AnimatePresence mode="wait">
              <motion.div
                key={`s3-${scenarioIdx}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2.5"
              >
                {scenario.steg3Inputs.map((inp, idx) => (
                  <AnimatedInput
                    key={idx}
                    label={inp.label}
                    value={inp.value}
                    startAtMs={inp.startAtMs}
                    elapsedMs={elapsedMs}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Steg 5: Kompetenser (chips) */}
          {activeStep >= 5 && activeStep <= 6 && (
            <AnimatePresence mode="wait">
              <motion.div
                key={`s5-${scenarioIdx}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-2">
                  Lägg till kompetenser
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {scenario.steg5Skills.map((skill, idx) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25, delay: idx * 0.25 }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white"
                      style={{
                        background:
                          'linear-gradient(135deg, #F97316, #DC2626)',
                      }}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Steg 7: Granska */}
          {activeStep === 7 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-2.5"
            >
              <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wide text-orange-700 mb-1">
                  Vald mall
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {scenario.template}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  className="px-3 py-2.5 rounded-xl text-white font-bold text-xs"
                  style={{
                    background:
                      'linear-gradient(135deg, #F97316, #DC2626)',
                  }}
                >
                  Ladda ner PDF
                </button>
                <button className="px-3 py-2.5 rounded-xl bg-orange-50 text-orange-700 font-bold text-xs border border-orange-200">
                  Word
                </button>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                <Sparkles className="w-3 h-3 text-emerald-600" strokeWidth={2.5} />
                <span className="text-[10px] font-bold text-emerald-700">
                  Auto-saved
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* === CV-preview (hoger) === */}
        <CVPreview scenario={scenario} activeStep={activeStep} />
      </div>
    </div>
  )
}

// === AnimatedInput med typewriter-effekt ===

function AnimatedInput({
  label,
  value,
  startAtMs,
  elapsedMs,
  charMs = 32,
}: {
  label: string
  value: string
  startAtMs: number
  elapsedMs: number
  charMs?: number
}) {
  const startedFor = Math.max(0, elapsedMs - startAtMs)
  const charsToShow = Math.min(value.length, Math.floor(startedFor / charMs))
  const displayed = value.slice(0, charsToShow)
  const isTyping = charsToShow > 0 && charsToShow < value.length

  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-1">
        {label}
      </label>
      <div className="px-2.5 py-2 rounded-lg border border-orange-200 bg-white text-xs sm:text-sm text-slate-800 min-h-[32px] flex items-center">
        {displayed}
        {isTyping && (
          <span
            className="inline-block w-0.5 h-3.5 ml-0.5 bg-orange-500 animate-pulse"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  )
}

// === Mini A4-CV som fylls i live ===

function CVPreview({
  scenario,
  activeStep,
}: {
  scenario: Scenario
  activeStep: number
}) {
  const namn = scenario.steg1Inputs[0].value
  const email = scenario.steg1Inputs[1].value
  const titel = scenario.steg1Inputs[2].value
  const position = scenario.steg3Inputs[0].value
  const foretag = scenario.steg3Inputs[1].value

  return (
    <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden relative">
      {/* Topplist */}
      <div
        className="h-1.5"
        style={{
          background:
            'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        }}
      />

      <div className="p-3 sm:p-4 space-y-2.5 min-h-[300px]">
        {/* Header */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`name-${scenarioIdx(scenario)}-${activeStep >= 1 ? 'on' : 'off'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: activeStep >= 1 ? 1 : 0.3 }}
              transition={{ duration: 0.3 }}
              className="text-sm font-black text-slate-900 leading-tight"
            >
              {namn}
            </motion.div>
          </AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: activeStep >= 1 ? 1 : 0.3 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="text-[10px] text-slate-600 mt-0.5"
          >
            {titel}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: activeStep >= 1 ? 1 : 0.3 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="text-[9px] text-slate-500 mt-0.5"
          >
            {email}
          </motion.div>
        </div>

        <div className="border-t border-orange-50 pt-2.5">
          <div className="text-[8px] font-black uppercase tracking-wider text-orange-700 mb-1.5">
            Erfarenhet
          </div>
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{
              opacity: activeStep >= 3 ? 1 : 0.2,
              y: activeStep >= 3 ? 0 : 4,
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-[10px] font-bold text-slate-900 leading-tight">
              {position}
            </div>
            <div className="text-[9px] text-slate-600 mt-0.5">
              {foretag} · 2022 - Pågående
            </div>
            {activeStep >= 4 && (
              <div className="mt-1.5 space-y-0.5">
                <div className="h-1 bg-slate-200 rounded w-full" />
                <div className="h-1 bg-slate-200 rounded w-5/6" />
                <div className="h-1 bg-slate-200 rounded w-4/6" />
              </div>
            )}
          </motion.div>
        </div>

        {activeStep >= 5 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-orange-50 pt-2.5"
          >
            <div className="text-[8px] font-black uppercase tracking-wider text-orange-700 mb-1.5">
              Kompetenser
            </div>
            <div className="flex flex-wrap gap-1">
              {scenario.steg5Skills.map((skill, idx) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: idx * 0.15 }}
                  className="text-[8px] font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {activeStep === 7 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-2xl"
          >
            <div
              className="px-3 py-2 rounded-full text-white font-black text-xs flex items-center gap-1.5 shadow-lg"
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              }}
            >
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
              CV redo att laddas ner
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Hjalp-funktion for unik nyckel per scenario
function scenarioIdx(s: Scenario): string {
  return s.yrkeChip
}
