'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, Send } from 'lucide-react'

/**
 * Live-demo som speglar /dashboard/jobbcoachen-flodet:
 * 1. User-bubbla (fraga) tippar in
 * 2. Typing-indikator (3 prickar bouncing)
 * 3. Assistant-bubbla med text + (Kalla N)-citat
 * 4. Kalle-pills under svaret
 * 5. Loopar genom 3 scenarier (lon / arbetsratt / karriarbyte)
 *
 * Persona: Karriarguiden. Samtalspartner forst, uppslagsverk sist.
 * Inga em-dash, inga rubriker, "vi"-ton.
 */

interface Source {
  label: string
  org: string
}

interface Scenario {
  user: string
  answer: string
  sources: Source[]
}

const SCENARIOS: Scenario[] = [
  {
    user: 'Vad är marknadslönen för en undersköterska i Stockholm?',
    answer:
      'Medianlönen för undersköterskor i Stockholmsregionen ligger på cirka 30 200 kr i månaden enligt SCB:s lönestatistik 2024 (Källa 1). Med 3 års erfarenhet och natt-tillägg kan du landa runt 32 500 (Källa 2). Vill du se hur du argumenterar för en höjning?',
    sources: [
      { label: 'SCB Lönestatistik 2024', org: 'SCB' },
      { label: 'Kommunal löneavtal', org: 'Fackförbund' },
    ],
  },
  {
    user: 'Min chef sa upp mig idag, vad har jag för rättigheter?',
    answer:
      'Tråkigt att höra. Enligt LAS måste arbetsgivaren ha saklig grund och uppsägningen gäller skriftligt (Källa 1). Uppsägningstiden är minst 1 månad om du jobbat under 2 år, och upp till 6 månader om du varit där 10+ år (Källa 2). Vill du att vi går igenom vad du bör begära innan du skriver under något?',
    sources: [
      { label: 'LAS § 7 och § 11', org: 'Arbetsförmedlingen' },
      { label: 'Unionen Uppsägning', org: 'Fackförbund' },
    ],
  },
  {
    user: 'Är det för sent att byta bransch som 42-åring?',
    answer:
      'Inte alls. SCB:s arbetskraftsundersökning visar att var fjärde person mellan 40 och 50 byter bransch minst en gång (Källa 1). Det som funkar bäst är att börja från dina överförbara kompetenser. Vad jobbar du med idag, så ser vi vilka roller som ligger nära?',
    sources: [
      { label: 'SCB Arbetskraftsundersökning', org: 'SCB' },
      { label: 'Yrkesväxling', org: 'Arbetsförmedlingen' },
    ],
  },
]

const SCENARIO_DURATION_MS = 13000
const TYPING_DURATION_MS = 1600

type Phase = 'fraga' | 'typing' | 'svar'

export default function JobbcoachenLiveDemo() {
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('fraga')

  const scenario = SCENARIOS[scenarioIdx]

  useEffect(() => {
    setPhase('fraga')

    const timeouts: NodeJS.Timeout[] = []
    timeouts.push(setTimeout(() => setPhase('typing'), 700))
    timeouts.push(setTimeout(() => setPhase('svar'), 700 + TYPING_DURATION_MS))
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
    <div className="w-full overflow-hidden rounded-xl border border-kant bg-panel">
      {/* Huvud */}
      <div className="flex items-center gap-3 border-b border-kant px-4 py-3.5 sm:px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-insunken text-ink-1">
          <CoachAvatar />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-ink-1">Karriärguiden</div>
          <div className="flex items-center gap-1.5 text-meta text-ink-3">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-positiv" aria-hidden="true" />
            Svarar med svenska källor
          </div>
        </div>
      </div>

      {/* Samtalet */}
      <div className="min-h-[360px] bg-insunken px-4 py-4 shadow-insunken sm:min-h-[400px] sm:px-5 sm:py-5">
        <div className="space-y-3">
          {/* Frågan */}
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-xl rounded-tr-md bg-ink-1 px-4 py-2.5 text-[13px] font-medium leading-snug text-white sm:max-w-[80%] sm:text-sm">
              {scenario.user}
            </div>
          </div>

          {/* Skriver */}
          {phase === 'typing' && (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-1.5 rounded-xl rounded-tl-md border border-kant bg-panel px-4 py-3">
                <TypingDot delay={0} />
                <TypingDot delay={150} />
                <TypingDot delay={300} />
              </div>
            </div>
          )}

          {/* Svaret */}
          {phase === 'svar' && (
            <div className="flex justify-start">
              <div className="max-w-[88%] space-y-2 sm:max-w-[85%]">
                <div className="rounded-xl rounded-tl-md border border-kant bg-panel px-4 py-3 text-[13px] leading-relaxed text-ink-2 sm:text-sm">
                  <FormattedAnswer text={scenario.answer} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {scenario.sources.map((src, i) => (
                    <SourcePill key={i} num={i + 1} src={src} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Låst fält */}
      <div className="border-t border-kant bg-panel px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 rounded-lg border border-kant bg-insunken px-3.5 py-2.5 shadow-insunken">
          <span className="flex-1 truncate text-[12px] text-ink-3 sm:text-[13px]">Logga in för att fråga själv</span>
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-1 text-white opacity-40"
          >
            <Send className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </div>
  )
}

// === Coachens avatar ===

function CoachAvatar() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="11" cy="9" r="3" fill="currentColor" />
      <path d="M 5 18 Q 5 13 11 13 Q 17 13 17 18" fill="currentColor" />
    </svg>
  )
}

// === Skrivprick ===

function TypingDot({ delay }: { delay: number }) {
  return (
    <span
      className="block h-1.5 w-1.5 animate-bounce rounded-full bg-ink-3"
      style={{ animationDelay: `${delay}ms` }}
    />
  )
}

// === Svar med (Källa N) som siffra ===

function FormattedAnswer({ text }: { text: string }) {
  const parts = text.split(/(\(Källa \d+\))/g)
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\(Källa (\d+)\)$/)
        if (match) {
          return (
            <span
              key={i}
              className="mx-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-ink-1 align-middle text-[10px] font-semibold text-white"
            >
              {match[1]}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

// === Källa ===

function SourcePill({ num, src }: { num: number; src: Source }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-kant bg-panel px-2.5 py-1 text-[11px] font-semibold text-ink-2">
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-ink-1 text-[9px] text-white">
        {num}
      </span>
      <span className="max-w-[140px] truncate sm:max-w-[180px]">{src.label}</span>
      <ExternalLink className="h-3 w-3 shrink-0 text-ink-3" strokeWidth={2.5} aria-hidden="true" />
    </div>
  )
}
