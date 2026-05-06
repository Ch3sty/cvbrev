'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
const ANSWER_REVEAL_MS = 800

type Phase = 'fraga' | 'typing' | 'svar'

export default function JobbcoachenLiveDemo() {
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('fraga')

  const scenario = SCENARIOS[scenarioIdx]

  useEffect(() => {
    setPhase('fraga')

    const timeouts: NodeJS.Timeout[] = []
    timeouts.push(
      setTimeout(() => setPhase('typing'), 700)
    )
    timeouts.push(
      setTimeout(() => setPhase('svar'), 700 + TYPING_DURATION_MS)
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
      className="rounded-3xl bg-white border border-orange-100 overflow-hidden lg:sticky lg:top-6 w-full"
      style={{
        boxShadow: '0 16px 48px -20px rgba(249, 115, 22, 0.28)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 sm:px-5 py-3.5 text-white"
        style={{
          background:
            'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        }}
      >
        <div className="w-9 h-9 rounded-full bg-white/95 flex items-center justify-center flex-shrink-0">
          <CoachAvatar />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-black truncate">Karriärguiden</div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/85">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-300" />
            </span>
            Online · Svarar med svenska källor
          </div>
        </div>
      </div>

      {/* Chat-yta */}
      <div className="px-4 sm:px-5 py-4 sm:py-5 bg-orange-50/30 min-h-[360px] sm:min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`scen-${scenarioIdx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            {/* User-fraga */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex justify-end"
            >
              <div
                className="max-w-[85%] sm:max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-md text-white text-[13px] sm:text-sm leading-snug font-medium"
                style={{
                  background:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                }}
              >
                {scenario.user}
              </div>
            </motion.div>

            {/* Typing-indikator */}
            {phase === 'typing' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-white border border-orange-100 inline-flex items-center gap-1.5">
                  <TypingDot delay={0} />
                  <TypingDot delay={0.15} />
                  <TypingDot delay={0.3} />
                </div>
              </motion.div>
            )}

            {/* Assistant-svar */}
            {phase === 'svar' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex justify-start"
              >
                <div className="max-w-[88%] sm:max-w-[85%] space-y-2">
                  <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-white border border-orange-100 text-[13px] sm:text-sm text-slate-700 leading-relaxed">
                    <FormattedAnswer text={scenario.answer} />
                  </div>

                  {/* Kalle-pills */}
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: ANSWER_REVEAL_MS / 1000, duration: 0.3 }}
                    className="flex flex-wrap gap-1.5"
                  >
                    {scenario.sources.map((src, i) => (
                      <SourcePill key={i} num={i + 1} src={src} />
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Disabled input */}
      <div className="px-4 sm:px-5 py-3 border-t border-orange-100 bg-white">
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-orange-50/60 border border-orange-100">
          <span className="flex-1 text-[12px] sm:text-[13px] text-slate-500 truncate">
            Logga in för att fråga själv
          </span>
          <button
            disabled
            aria-hidden="true"
            tabIndex={-1}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0 cursor-default"
            style={{
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
              opacity: 0.85,
            }}
          >
            <Send className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  )
}

// === Coach-avatar ===

function CoachAvatar() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="11" cy="9" r="3" fill="#DC2626" />
      <path d="M 5 18 Q 5 13 11 13 Q 17 13 17 18" fill="#DC2626" />
    </svg>
  )
}

// === Typing-prick ===

function TypingDot({ delay }: { delay: number }) {
  return (
    <motion.span
      className="block w-1.5 h-1.5 rounded-full bg-orange-400"
      animate={{ y: [0, -3, 0] }}
      transition={{
        duration: 0.9,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  )
}

// === Formaterat svar med (Kalla N) som badge ===

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
              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black text-white align-middle mx-0.5"
              style={{
                background:
                  'linear-gradient(135deg, #F97316, #DC2626)',
              }}
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

// === Kalle-pill ===

function SourcePill({ num, src }: { num: number; src: Source }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-orange-200 text-[11px] font-bold text-slate-700">
      <span
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] text-white"
        style={{
          background: 'linear-gradient(135deg, #F97316, #DC2626)',
        }}
      >
        {num}
      </span>
      <span className="truncate max-w-[140px] sm:max-w-[180px]">
        {src.label}
      </span>
      <ExternalLink
        className="w-3 h-3 text-orange-600 flex-shrink-0"
        strokeWidth={2.5}
      />
    </div>
  )
}
