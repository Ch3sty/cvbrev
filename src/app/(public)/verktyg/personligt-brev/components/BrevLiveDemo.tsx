'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Check, ChevronDown } from 'lucide-react'

/**
 * Live-demo som speglar det riktiga skapa-brev-flödet:
 * CV-val → jobbannons med highlightade nyckelord → mall+ton → brev som skrivs ut.
 * Loopar i ~14 sek. Mobile: brev-mockupen visas som drawer under formen.
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

  // Stega genom 1 → 5 → byt scenario
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

    // Byt scenario efter ~14s
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
    <div className="w-full">
      {/* Desktop: grid med form vänster + brev höger. Mobile: form först, brev som drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        {/* === FORM-MOCKUP === */}
        <div
          className="rounded-3xl bg-white border border-orange-100 p-4 sm:p-5"
          style={{
            boxShadow: '0 12px 40px -16px rgba(249, 115, 22, 0.22)',
          }}
        >
          {/* Progress-prickar */}
          <div className="flex items-center justify-between mb-5 px-1">
            {STEPS.map((s, i) => {
              const done = activeStep > s.id
              const current = activeStep === s.id
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                        done
                          ? 'text-white'
                          : current
                          ? 'text-white ring-4 ring-orange-100'
                          : 'bg-slate-100 text-slate-400'
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
                      {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : s.id}
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wide ${
                        done || current ? 'text-orange-700' : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 mt-[-14px] rounded-full transition-colors duration-300 ${
                        done ? 'bg-orange-300' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Steg 1: CV-val */}
          <div className="space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Ditt CV
            </div>
            <motion.div
              key={`cv-${scenarioIdx}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                activeStep >= 1
                  ? 'border-orange-200 bg-orange-50/50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #F97316, #DC2626)',
                }}
              >
                <FileText className="w-4 h-4" strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {scenario.cvName}
                </div>
                <div className="text-[10px] text-slate-500">PDF · 2 sidor</div>
              </div>
              {activeStep >= 1 && (
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              )}
            </motion.div>

            {/* Steg 2: Annons med highlight */}
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 pt-1">
              Jobbannons
            </div>
            <div
              className={`p-3 rounded-xl border text-xs leading-relaxed transition-colors ${
                activeStep >= 2
                  ? 'border-orange-200 bg-white text-slate-700'
                  : 'border-slate-200 bg-slate-50 text-slate-400'
              }`}
              style={{ minHeight: 78 }}
            >
              {activeStep >= 2 ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`annons-${scenarioIdx}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <HighlightedAnnons
                      text={scenario.annonsText}
                      keywords={scenario.keywords}
                      enabled={activeStep >= 2}
                    />
                  </motion.div>
                </AnimatePresence>
              ) : (
                <span className="italic text-slate-400">Klistra in annons…</span>
              )}
            </div>

            {/* Steg 3 + 4: Mall och Ton som chips */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-1.5">
                  Mall
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`mall-${scenarioIdx}-${activeStep}`}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold text-center transition-all ${
                      activeStep >= 3
                        ? 'text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                    style={
                      activeStep >= 3
                        ? {
                            background:
                              'linear-gradient(135deg, #F97316, #DC2626)',
                          }
                        : undefined
                    }
                  >
                    {activeStep >= 3 ? scenario.template : '...'}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-1.5">
                  Ton
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`ton-${scenarioIdx}-${activeStep}`}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold text-center transition-all border ${
                      activeStep >= 4
                        ? 'border-orange-200 bg-orange-50 text-orange-800'
                        : 'border-slate-200 bg-slate-100 text-slate-400'
                    }`}
                  >
                    {activeStep >= 4 ? scenario.tone : '...'}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* === BREV-MOCKUP === */}
        {/* Mobile: drawer-toggle */}
        <button
          onClick={() => setLetterOpen((v) => !v)}
          className="lg:hidden flex items-center justify-between w-full p-3 rounded-2xl bg-white border border-orange-100 text-sm font-bold text-slate-900 mt-1"
        >
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-600" strokeWidth={2.2} />
            Visa exempel-brev
          </span>
          <ChevronDown
            className={`w-4 h-4 text-orange-600 transition-transform ${
              letterOpen ? 'rotate-180' : ''
            }`}
            strokeWidth={2.5}
          />
        </button>

        <AnimatePresence initial={false}>
          {(letterOpen || true) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`overflow-hidden lg:!overflow-visible lg:!h-auto lg:!opacity-100 ${
                letterOpen ? 'block' : 'hidden lg:block'
              }`}
            >
              <LetterMockup
                key={`letter-${scenarioIdx}`}
                scenario={scenario}
                show={activeStep >= 5}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// === HighlightedAnnons: highlightar nyckelord när enabled ===
function HighlightedAnnons({
  text,
  keywords,
  enabled,
}: {
  text: string
  keywords: string[]
  enabled: boolean
}) {
  if (!enabled) return <span>{text}</span>

  const escapedKeywords = keywords.map((k) =>
    k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  )
  const pattern = new RegExp(`(${escapedKeywords.join('|')})`, 'gi')
  const parts = text.split(pattern)

  return (
    <>
      {parts.map((part, i) => {
        const isKeyword = keywords.some(
          (k) => k.toLowerCase() === part.toLowerCase()
        )
        if (isKeyword) {
          return (
            <motion.mark
              key={i}
              initial={{ backgroundColor: 'rgba(249, 115, 22, 0)' }}
              animate={{ backgroundColor: 'rgba(254, 215, 170, 0.7)' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="px-1 py-0.5 rounded font-bold text-orange-900"
              style={{ backgroundColor: 'rgba(254, 215, 170, 0.7)' }}
            >
              {part}
            </motion.mark>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

// === LetterMockup: A4-look där brevet skrivs ut rad för rad ===
function LetterMockup({
  scenario,
  show,
}: {
  scenario: (typeof SCENARIOS)[number]
  show: boolean
}) {
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
      timeouts.push(
        setTimeout(() => setVisibleLines(idx + 1), cumulative)
      )
    })
    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [show, scenario])

  return (
    <div
      className="rounded-3xl bg-white border border-orange-100 p-4 sm:p-5 lg:sticky lg:top-6"
      style={{
        boxShadow: '0 12px 40px -16px rgba(249, 115, 22, 0.22)',
      }}
    >
      {/* Brev-papper */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 relative overflow-hidden">
        {/* Topplist */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{
            background:
              'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
          }}
        />

        {/* Avsändare */}
        <div className="pt-2 mb-4">
          <div className="text-sm font-bold text-slate-900">Anna Andersson</div>
          <div className="text-[11px] text-slate-500">
            anna.andersson@email.se · 070-123 45 67
          </div>
        </div>

        {/* Mottagare */}
        <div className="mb-4 pb-3 border-b border-slate-100">
          <div className="text-xs font-bold text-slate-900">
            {scenario.company}
          </div>
          <div className="text-[11px] text-slate-500">{scenario.position}</div>
        </div>

        {/* Brevtext */}
        <div className="space-y-1.5 min-h-[120px]">
          {scenario.letterLines.map((line, idx) => {
            const visible = idx < visibleLines
            if (!line.text)
              return (
                <div key={idx} className="h-1" aria-hidden="true" />
              )
            return (
              <motion.p
                key={`${idx}-${scenario.company}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{
                  opacity: visible ? 1 : 0,
                  y: visible ? 0 : 4,
                }}
                transition={{ duration: 0.25 }}
                className="text-[11.5px] leading-relaxed text-slate-700"
              >
                {highlightInLine(line.text, scenario.keywords)}
              </motion.p>
            )
          })}
        </div>

        {/* Footer-badges */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 text-[10px] font-bold uppercase tracking-wide border border-orange-100">
            PDF
          </span>
          <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 text-[10px] font-bold uppercase tracking-wide border border-orange-100">
            Word
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wide border border-emerald-100 ml-auto">
            Sparat
          </span>
        </div>
      </div>
    </div>
  )
}

// Highlight nyckelord inuti själva brevtexten
function highlightInLine(text: string, keywords: string[]) {
  const escapedKeywords = keywords.map((k) =>
    k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  )
  const pattern = new RegExp(`(${escapedKeywords.join('|')})`, 'gi')
  const parts = text.split(pattern)

  return parts.map((part, i) => {
    const isKeyword = keywords.some(
      (k) => k.toLowerCase() === part.toLowerCase()
    )
    if (isKeyword) {
      return (
        <span
          key={i}
          className="px-1 rounded font-bold text-orange-900"
          style={{ backgroundColor: 'rgba(254, 215, 170, 0.6)' }}
        >
          {part}
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })
}
