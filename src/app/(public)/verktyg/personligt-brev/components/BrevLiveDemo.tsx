'use client'

import { useEffect, useState } from 'react'
import { FileText, Check, ChevronDown } from 'lucide-react'

/**
 * Demon i heron på /verktyg/personligt-brev. Speglar det riktiga flödet:
 * CV, annons med markerade nyckelord, mall och ton, brevet rad för rad.
 * Loopar i cirka 14 sekunder per exempel. På mobil fälls brevet ut under
 * formuläret. Tokens ur docs/designsystem.md, inga övertoningar och ingen
 * animationsmotor.
 */

const SCENARIOS = [
  {
    cvName: 'marknadsforare-cv-2024.pdf',
    company: 'Spotify',
    position: 'Senior UX Designer',
    keywords: ['Figma', 'Design Systems', 'Användartester'],
    annonsText:
      'Vi söker en Senior UX Designer som kan leda design systems-arbetet och driva användartester. Erfarenhet av Figma och B2C-produkter krävs.',
    template: 'Modern',
    tone: 'Entusiastisk',
    letterLines: [
      { text: 'Hej Spotify-teamet,', delay: 0 },
      { text: '', delay: 200 },
      {
        text: 'Tjänsten som Senior UX Designer fångade mig direkt, särskilt arbetet med era',
        delay: 400,
      },
      {
        text: 'design systems och hur ni låter användartester driva besluten.',
        delay: 700,
      },
      { text: '', delay: 200 },
      {
        text: 'Med fem år i Figma och ledarskap för fyra produktteam, är jag van vid att',
        delay: 400,
      },
      {
        text: 'bygga skalbara komponentbibliotek som faktiskt används.',
        delay: 700,
      },
    ],
  },
  {
    cvName: 'frontend-developer-cv.pdf',
    company: 'Klarna',
    position: 'Frontend Engineer',
    keywords: ['React', 'TypeScript', 'Tillgänglighet'],
    annonsText:
      'Klarna söker en frontend-utvecklare som brinner för React, TypeScript och tillgänglighet. Du blir en del av vårt checkout-team.',
    template: 'Klassisk',
    tone: 'Professionell',
    letterLines: [
      { text: 'Hej Klarnas rekryteringsteam,', delay: 0 },
      { text: '', delay: 200 },
      {
        text: 'Rollen som frontend-utvecklare i ert checkout-team passar precis där jag',
        delay: 400,
      },
      {
        text: 'vill växa, och React och TypeScript är min vardag sedan tre år.',
        delay: 700,
      },
      { text: '', delay: 200 },
      {
        text: 'Tillgänglighet är inget jag bockar av efteråt, utan något jag bygger in från',
        delay: 400,
      },
      { text: 'första prototypen. Det är så jag jobbar.', delay: 700 },
    ],
  },
  {
    cvName: 'projektledare-cv-v3.pdf',
    company: 'Volvo',
    position: 'Projektledare Digital',
    keywords: ['Agile', 'Stakeholder management', 'Roadmaps'],
    annonsText:
      'Volvo söker en erfaren projektledare för digitala initiativ. Du driver agile-team och samordnar stakeholders över avdelningar.',
    template: 'Sidofält',
    tone: 'Självsäker',
    letterLines: [
      { text: 'Hej Volvo,', delay: 0 },
      { text: '', delay: 200 },
      {
        text: 'Att leda digitala projekt över tunga organisationer är där jag levererar',
        delay: 400,
      },
      {
        text: 'bäst. Sju år som projektledare, varav fyra med agile-team i industri.',
        delay: 700,
      },
      { text: '', delay: 200 },
      {
        text: 'Stakeholder-arbete är inte krångligt. Det är att lyssna, översätta och',
        delay: 400,
      },
      { text: 'leverera roadmaps som håller över tid.', delay: 700 },
    ],
  },
]

const STEPS = [
  { id: 1, label: 'CV' },
  { id: 2, label: 'Annons' },
  { id: 3, label: 'Mall' },
  { id: 4, label: 'Ton' },
  { id: 5, label: 'Klart' },
]

export default function BrevLiveDemo() {
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [activeStep, setActiveStep] = useState(1)
  const [letterOpen, setLetterOpen] = useState(false)

  const scenario = SCENARIOS[scenarioIdx]

  // Stega genom 1 till 5 och byt sedan exempel
  useEffect(() => {
    const stepTimings = [
      { step: 1, ms: 0 },
      { step: 2, ms: 2200 },
      { step: 3, ms: 5000 },
      { step: 4, ms: 6800 },
      { step: 5, ms: 8400 },
    ]
    const timeouts: NodeJS.Timeout[] = []

    stepTimings.forEach(({ step, ms }) => {
      timeouts.push(setTimeout(() => setActiveStep(step), ms))
    })

    timeouts.push(
      setTimeout(() => {
        setScenarioIdx((prev) => (prev + 1) % SCENARIOS.length)
        setActiveStep(1)
      }, 14000)
    )

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [scenarioIdx])

  return (
    <div className="w-full rounded-xl border border-kant bg-panel p-4 sm:p-5" aria-label="Exempel på hur ett brev skapas">
      {/* Stegen */}
      <ol className="mb-5 flex items-center justify-between px-1">
        {STEPS.map((s, i) => {
          const done = activeStep > s.id
          const current = activeStep === s.id
          return (
            <li key={s.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums transition-colors duration-300 ${
                    done || current ? 'bg-ink-1 text-white' : 'bg-insunken text-ink-3'
                  } ${current ? 'ring-4 ring-kant' : ''}`}
                >
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" /> : s.id}
                </div>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wide ${
                    done || current ? 'text-ink-1' : 'text-ink-3'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-1 mt-[-14px] h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                    done ? 'bg-accent' : 'bg-kant'
                  }`}
                />
              )}
            </li>
          )
        })}
      </ol>

      <div className="space-y-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">Ditt CV</div>
        <div key={`cv-${scenarioIdx}`} className="flex items-center gap-3 rounded-lg border border-kant bg-insunken p-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-ink-1 text-white">
            <FileText className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-ink-1">{scenario.cvName}</div>
            <div className="text-[10px] text-ink-3">PDF · 2 sidor</div>
          </div>
          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-ink-1">
            <Check className="h-3 w-3 text-white" strokeWidth={3} aria-hidden="true" />
          </div>
        </div>

        <div className="pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">Jobbannons</div>
        <div
          className={`min-h-[78px] rounded-lg border p-3 text-xs leading-relaxed transition-colors ${
            activeStep >= 2 ? 'border-kant-stark bg-panel text-ink-2' : 'border-kant bg-insunken text-ink-3'
          }`}
        >
          {activeStep >= 2 ? (
            <div key={`annons-${scenarioIdx}`}>
              <Markerad text={scenario.annonsText} keywords={scenario.keywords} />
            </div>
          ) : (
            <span className="italic text-ink-3">Klistra in annonsen …</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">Mall</div>
            <div
              className={`rounded-lg px-3 py-2 text-center text-xs font-semibold transition-colors ${
                activeStep >= 3 ? 'bg-ink-1 text-white' : 'bg-insunken text-ink-3'
              }`}
            >
              {activeStep >= 3 ? scenario.template : '…'}
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">Ton</div>
            <div
              className={`rounded-lg border px-3 py-2 text-center text-xs font-semibold transition-colors ${
                activeStep >= 4 ? 'border-kant-stark bg-panel text-ink-1' : 'border-kant bg-insunken text-ink-3'
              }`}
            >
              {activeStep >= 4 ? scenario.tone : '…'}
            </div>
          </div>
        </div>
      </div>

      {/* Brevet: utfällbart på mobil, alltid synligt från lg */}
      <button
        type="button"
        onClick={() => setLetterOpen((v) => !v)}
        aria-expanded={letterOpen}
        className="mt-4 flex min-h-11 w-full items-center justify-between rounded-lg border border-kant bg-panel px-3 text-sm font-semibold text-ink-1 lg:hidden"
      >
        <span className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-ink-2" strokeWidth={2.2} aria-hidden="true" />
          Visa exempelbrevet
        </span>
        <ChevronDown
          className={`h-4 w-4 text-ink-2 transition-transform ${letterOpen ? 'rotate-180' : ''}`}
          strokeWidth={2.5}
          aria-hidden="true"
        />
      </button>

      <div className={`mt-4 ${letterOpen ? 'block' : 'hidden lg:block'}`}>
        <LetterMockup key={`letter-${scenarioIdx}`} scenario={scenario} show={activeStep >= 5} />
      </div>
    </div>
  )
}

// Markerar nyckelorden i en text
function Markerad({ text, keywords }: { text: string; keywords: string[] }) {
  const escapedKeywords = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = new RegExp(`(${escapedKeywords.join('|')})`, 'gi')
  const parts = text.split(pattern)

  return (
    <>
      {parts.map((part, i) => {
        const isKeyword = keywords.some((k) => k.toLowerCase() === part.toLowerCase())
        if (isKeyword) {
          return (
            <mark key={i} className="rounded bg-accent-mjuk px-1 py-0.5 font-semibold text-accent-ink">
              {part}
            </mark>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

// Brevet på papper, rad för rad
function LetterMockup({ scenario, show }: { scenario: (typeof SCENARIOS)[number]; show: boolean }) {
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    if (!show) {
      setVisibleLines(0)
      return
    }
    const timeouts: NodeJS.Timeout[] = []
    let cumulative = 0
    scenario.letterLines.forEach((line, idx) => {
      cumulative += line.delay
      timeouts.push(setTimeout(() => setVisibleLines(idx + 1), cumulative))
    })
    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [show, scenario])

  return (
    <div className="relative overflow-hidden rounded-lg border border-kant bg-panel p-5">
      <div className="absolute left-0 right-0 top-0 h-1 bg-accent" aria-hidden="true" />

      <div className="mb-4 pt-1">
        <div className="text-sm font-semibold text-ink-1">Anna Andersson</div>
        <div className="text-[11px] text-ink-3">anna.andersson@email.se · 070-123 45 67</div>
      </div>

      <div className="mb-4 border-b border-kant pb-3">
        <div className="text-xs font-semibold text-ink-1">{scenario.company}</div>
        <div className="text-[11px] text-ink-3">{scenario.position}</div>
      </div>

      <div className="min-h-[120px] space-y-1.5">
        {scenario.letterLines.map((line, idx) => {
          const visible = idx < visibleLines
          if (!line.text) return <div key={idx} className="h-1" aria-hidden="true" />
          return (
            <p
              key={`${idx}-${scenario.company}`}
              className={`text-[11.5px] leading-relaxed text-ink-2 transition-opacity duration-300 ${
                visible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Markerad text={line.text} keywords={scenario.keywords} />
            </p>
          )
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-1.5 border-t border-kant pt-3">
        <span className="rounded-md border border-kant bg-insunken px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-2">
          PDF
        </span>
        <span className="rounded-md border border-kant bg-insunken px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-2">
          Word
        </span>
        <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-ink-3">
          <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
          Sparat
        </span>
      </div>
    </div>
  )
}
