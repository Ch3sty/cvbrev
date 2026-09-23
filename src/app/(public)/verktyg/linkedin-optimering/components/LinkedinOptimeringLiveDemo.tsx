'use client'

import { useEffect, useState } from 'react'

/**
 * Demo som speglar resultatsteget i /dashboard/linkedin-optimizer: en
 * profilrad, sektionsflikar, poängen före och efter, texterna sida vid sida
 * och vad som blev bättre. Byter sektion var fjortonde sekund.
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
      'Marknadsförare som driver tillväxt för SaaS-bolag | Inbound, innehåll, betald annonsering | Jobbar med B2B-bolag i tillväxtfas',
    improvements: ['Branschens sökord', 'Tydlig specialisering', 'Tydlig målgrupp'],
  },
  {
    key: 'om',
    label: 'Om mig',
    beforeScore: 41,
    afterScore: 89,
    before:
      'Jag är en passionerad och driven marknadsförare som älskar att jobba med människor och utveckla varumärken.',
    after:
      'Driver inbound och innehållsmarknadsföring för SaaS-bolag i tillväxtfas. På Klarna och Voi har jag byggt innehållsprogram som gett över 12 000 leads och sänkt kundanskaffningskostnaden med 38 procent. Specialiserad på B2B-positionering och lanseringsstrategi för techbolag.',
    improvements: ['Konkreta resultat', 'Specifika nischer', 'Inga modeord'],
  },
  {
    key: 'erfarenhet',
    label: 'Erfarenhet',
    beforeScore: 38,
    afterScore: 84,
    before: 'Marknadsförare på Klarna 2021-2023. Ansvarade för marknadsföring och kampanjer.',
    after:
      'Innehållsansvarig, marknad · Klarna · 2021-2023\n\nLedde innehållsstrategin för Klarnas B2B-del. Byggde en redaktion från noll till fyra skribenter och en produktion på över 40 artiklar per kvartal.\n\n• Gav 8 200 kvalificerade leads via sökoptimerat innehåll, 220 procent mer än året innan\n• Sänkte kundanskaffningskostnaden med 38 procent genom organisk spridning',
    improvements: ['STAR-struktur', 'Siffror på resultaten', 'Handlingsverb'],
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
    <div className="w-full overflow-hidden rounded-xl border border-kant bg-panel" aria-label="Exempel på en optimerad LinkedIn-profil">
      {/* Profilrad */}
      <div className="flex items-center gap-3 border-b border-kant px-4 py-3 sm:px-5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-insunken text-sm font-semibold text-ink-1">
          A
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-ink-1">Anna Lindberg</div>
          <div className="truncate text-meta text-ink-3">Stockholm · Marknadsförare</div>
        </div>
      </div>

      {/* Sektionsflikar */}
      <div className="flex gap-1 overflow-x-auto border-b border-kant px-4 py-2 sm:px-5" aria-hidden="true">
        {SCENARIOS.map((s, i) => (
          <span
            key={s.key}
            className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium ${
              i === scenarioIdx ? 'bg-ink-1 text-white' : 'text-ink-3'
            }`}
          >
            {s.label}
          </span>
        ))}
      </div>

      {/* Poängen */}
      <div className="flex items-center justify-center gap-5 border-b border-kant bg-insunken px-4 py-4 sm:px-5">
        <ScoreCircle value={scenario.beforeScore} variant="before" label="Före" />
        <span aria-hidden="true" className="text-lg text-ink-3">
          →
        </span>
        <ScoreCircle value={scenario.afterScore} variant="after" label="Efter" />
      </div>

      {/* Före och efter */}
      <div key={scenarioIdx} className="grid min-h-[280px] grid-cols-1 gap-3 p-4 motion-safe:animate-thread-enter sm:grid-cols-2 sm:p-5">
        <div className="rounded-lg border border-kant p-3 sm:p-4">
          <div className="text-steg uppercase text-ink-3">Före</div>
          <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-ink-2">{scenario.before}</p>
        </div>
        <div className="rounded-lg border border-kant-stark p-3 sm:p-4">
          <div className="text-steg uppercase text-ink-1">Efter</div>
          <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-ink-1">{scenario.after}</p>
        </div>
      </div>

      {/* Förbättringar */}
      <ul className="flex flex-wrap gap-1.5 border-t border-kant px-4 py-3 sm:px-5">
        {scenario.improvements.map((imp) => (
          <li key={imp} className="inline-flex items-center gap-1 rounded-md bg-positiv-mjuk px-2 py-1 text-xs font-medium text-positiv">
            <span aria-hidden="true">+</span>
            {imp}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ScoreCircle({ value, variant, label }: { value: number; variant: 'before' | 'after'; label: string }) {
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  const efter = variant === 'after'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-14 w-14 sm:h-16 sm:w-16">
        <svg viewBox="0 0 60 60" className="h-full w-full -rotate-90" fill="none" aria-hidden="true">
          <circle cx="30" cy="30" r={radius} strokeWidth="5" className="fill-panel stroke-kant" />
          <circle
            cx="30"
            cy="30"
            r={radius}
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={efter ? 'stroke-ink-1' : 'stroke-kant-stark'}
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums sm:text-base ${efter ? 'text-ink-1' : 'text-ink-3'}`}>
          {value}
        </div>
      </div>
      <span className={`text-steg uppercase ${efter ? 'text-ink-1' : 'text-ink-3'}`}>{label}</span>
    </div>
  )
}
