'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'

/**
 * Demon i heron på /verktyg/skapa-cv. Speglar flödet i /dashboard/skapa-cv:
 * stegen 1 till 7, fält som skrivs in och ett litet A4-CV som fylls i.
 * Loopar genom tre yrken, cirka 14 sekunder per varv. Tokens ur
 * docs/designsystem.md, inga övertoningar och ingen animationsmotor.
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

  // Stega genom 1 till 7 inom exemplet och byt exempel efter cirka 14 sekunder
  useEffect(() => {
    setActiveStep(1)
    setElapsedMs(0)

    const stepTimeouts: NodeJS.Timeout[] = []
    STEG_TIMINGS.forEach(({ step, ms }) => {
      stepTimeouts.push(setTimeout(() => setActiveStep(step), ms))
    })

    // Tick var 100 ms för skrivmaskinseffekten
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
    <div className="w-full rounded-xl border border-kant bg-panel p-4 sm:p-5" aria-label="Exempel på hur ett CV byggs">
      {/* Stegen 1 till 7 */}
      <ol className="mb-5 flex items-center justify-between gap-1 px-1">
        {[1, 2, 3, 4, 5, 6, 7].map((s, i) => {
          const done = activeStep > s
          const current = activeStep === s
          return (
            <li key={s} className="flex flex-1 items-center">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-semibold tabular-nums transition-colors sm:h-7 sm:w-7 sm:text-[10px] ${
                  done || current ? 'bg-ink-1 text-white' : 'bg-insunken text-ink-3'
                }`}
              >
                {done ? <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={3} aria-hidden="true" /> : s}
              </div>
              {i < 6 && (
                <div
                  className={`mx-0.5 h-0.5 flex-1 rounded-full transition-colors sm:mx-1 ${done ? 'bg-accent' : 'bg-kant'}`}
                />
              )}
            </li>
          )
        })}
      </ol>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1.1fr]">
        {/* Fälten */}
        <div className="space-y-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            {activeStep <= 2 && 'Kontaktuppgifter'}
            {activeStep >= 3 && activeStep <= 4 && 'Erfarenhet'}
            {activeStep >= 5 && activeStep <= 6 && 'Kompetenser'}
            {activeStep === 7 && 'Granska'}
          </div>

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

          {activeStep >= 3 && activeStep <= 4 && (
            <div key={`s3-${scenarioIdx}`} className="space-y-2.5">
              {scenario.steg3Inputs.map((inp, idx) => (
                <AnimatedInput
                  key={idx}
                  label={inp.label}
                  value={inp.value}
                  startAtMs={inp.startAtMs}
                  elapsedMs={elapsedMs}
                />
              ))}
            </div>
          )}

          {activeStep >= 5 && activeStep <= 6 && (
            <div key={`s5-${scenarioIdx}`}>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
                Lägg till kompetenser
              </div>
              <div className="flex flex-wrap gap-1.5">
                {scenario.steg5Skills.map((skill) => (
                  <span key={skill} className="rounded-lg bg-ink-1 px-2.5 py-1 text-[11px] font-semibold text-white">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeStep === 7 && (
            <div className="space-y-2.5">
              <div className="rounded-lg border border-kant bg-insunken p-3">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-3">Vald mall</div>
                <div className="text-sm font-semibold text-ink-1">{scenario.template}</div>
              </div>

              <div className="grid grid-cols-2 gap-2" aria-hidden="true">
                <span className="rounded-lg bg-ink-1 px-3 py-2.5 text-center text-xs font-semibold text-white">
                  Ladda ner PDF
                </span>
                <span className="rounded-lg border border-kant-stark bg-panel px-3 py-2.5 text-center text-xs font-semibold text-ink-1">
                  Word
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-ink-3">
                <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
                Sparat automatiskt
              </div>
            </div>
          )}
        </div>

        {/* CV:t */}
        <CVPreview scenario={scenario} activeStep={activeStep} />
      </div>
    </div>
  )
}

// Fält med skrivmaskinseffekt
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
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">{label}</div>
      <div className="flex min-h-[32px] items-center rounded-lg border border-kant bg-insunken px-2.5 py-2 text-xs text-ink-1 shadow-insunken sm:text-sm">
        {displayed}
        {isTyping && <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-accent" aria-hidden="true" />}
      </div>
    </div>
  )
}

// Ett litet A4-CV som fylls i
function CVPreview({ scenario, activeStep }: { scenario: Scenario; activeStep: number }) {
  const namn = scenario.steg1Inputs[0].value
  const email = scenario.steg1Inputs[1].value
  const titel = scenario.steg1Inputs[2].value
  const position = scenario.steg3Inputs[0].value
  const foretag = scenario.steg3Inputs[1].value

  return (
    <div className="relative overflow-hidden rounded-lg border border-kant bg-panel">
      <div className="h-1 bg-accent" aria-hidden="true" />

      <div className="min-h-[300px] space-y-2.5 p-3 sm:p-4">
        <div>
          <div className="text-sm font-semibold leading-tight text-ink-1">{namn}</div>
          <div className="mt-0.5 text-[10px] text-ink-2">{titel}</div>
          <div className="mt-0.5 text-[9px] text-ink-3">{email}</div>
        </div>

        <div className="border-t border-kant pt-2.5">
          <div className="mb-1.5 text-[8px] font-semibold uppercase tracking-wider text-ink-3">Erfarenhet</div>
          <div className={`transition-opacity duration-300 ${activeStep >= 3 ? 'opacity-100' : 'opacity-20'}`}>
            <div className="text-[10px] font-semibold leading-tight text-ink-1">{position}</div>
            <div className="mt-0.5 text-[9px] text-ink-2">{foretag} · 2022 till i dag</div>
            {activeStep >= 4 && (
              <div className="mt-1.5 space-y-0.5" aria-hidden="true">
                <div className="h-1 w-full rounded bg-insunken" />
                <div className="h-1 w-5/6 rounded bg-insunken" />
                <div className="h-1 w-4/6 rounded bg-insunken" />
              </div>
            )}
          </div>
        </div>

        {activeStep >= 5 && (
          <div className="border-t border-kant pt-2.5">
            <div className="mb-1.5 text-[8px] font-semibold uppercase tracking-wider text-ink-3">Kompetenser</div>
            <div className="flex flex-wrap gap-1">
              {scenario.steg5Skills.map((skill) => (
                <span key={skill} className="rounded bg-insunken px-1.5 py-0.5 text-[8px] font-semibold text-ink-2">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {activeStep === 7 && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-panel/80">
            <div className="flex items-center gap-1.5 rounded-full bg-ink-1 px-3 py-2 text-xs font-semibold text-white">
              <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
              CV:t är klart att ladda ner
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
