'use client'

/**
 * QuickScoreReveal
 * ----------------
 * Aha-moment direkt efter första CV-uppladdningen. Hämtar en snabb basanalys
 * (/api/cv/quick-score) och visar en animerad poängmätare + topp-styrkor och
 * förbättringar, med en tydlig CTA vidare till första brevet.
 *
 * Visas BARA för förstagångsuppladdning (styrs av föräldern).
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Check, TrendingUp, Lightbulb } from 'lucide-react'

interface QuickScore {
  score: number
  summary: string
  strengths: string[]
  improvements: string[]
  keywords: string[]
}

interface QuickScoreRevealProps {
  cvId: string
  /** CTA-mål efter aha-momentet. Default: skapa första brevet. */
  nextHref?: string
  nextLabel?: string
}

export default function QuickScoreReveal({
  cvId,
  nextHref = '/dashboard/skapa-brev',
  nextLabel = 'Skapa ditt första brev',
}: QuickScoreRevealProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<QuickScore | null>(null)
  const [displayScore, setDisplayScore] = useState(0)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        const res = await fetch('/api/cv/quick-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cvId }),
        })
        if (!res.ok) throw new Error('quick-score failed')
        const json = await res.json()
        if (!cancelled && json.success) {
          setData(json)
        } else if (!cancelled) {
          setFailed(true)
        }
      } catch {
        if (!cancelled) setFailed(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [cvId])

  // Animera poängen från 0 upp till målvärdet
  useEffect(() => {
    if (!data) return
    const target = data.score
    const duration = 1100
    const start = performance.now()
    let frame: number

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      setDisplayScore(Math.round(eased * target))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [data])

  // Om snabb-analysen fallerar: visa inget alls (uppladdningen lyckades ändå,
  // och OnboardingNextStep tar över som vanligt).
  if (failed) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl bg-white border border-orange-100 p-5 sm:p-6 lg:p-7"
      style={{ boxShadow: '0 12px 40px -16px rgba(249, 115, 22, 0.22)' }}
    >
      <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-orange-700 mb-4">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
          aria-hidden="true"
        />
        Ditt CV är inläst
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <LoadingState key="loading" />
        ) : data ? (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 lg:gap-8 items-center"
          >
            {/* Poängmätare */}
            <ScoreMeter score={displayScore} />

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-1.5">
                Här är din första snabb-koll
              </h2>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                {data.summary}
              </p>

              <div className="grid sm:grid-cols-2 gap-3 mb-5">
                {data.strengths.length > 0 && (
                  <InsightList
                    icon={<TrendingUp className="w-4 h-4" strokeWidth={2.5} />}
                    title="Styrkor"
                    items={data.strengths}
                    tone="emerald"
                  />
                )}
                {data.improvements.length > 0 && (
                  <InsightList
                    icon={<Lightbulb className="w-4 h-4" strokeWidth={2.5} />}
                    title="Förbättra"
                    items={data.improvements}
                    tone="orange"
                  />
                )}
              </div>

              <Link
                href={nextHref}
                className="group inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-6 py-3.5 rounded-2xl text-white font-black text-sm sm:text-base min-h-[52px] active:scale-[0.98] transition-all"
                style={{
                  background: 'linear-gradient(135deg, #F97316 0%, #DC2626 60%, #BE185D 100%)',
                  boxShadow: '0 12px 32px -10px rgba(220, 38, 38, 0.4)',
                }}
              >
                {nextLabel}
                <ArrowRight
                  className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={2.8}
                />
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  )
}

function ScoreMeter({ score }: { score: number }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex items-center justify-center mx-auto lg:mx-0 w-[140px] h-[140px]">
      <svg width="140" height="140" className="-rotate-90">
        <circle
          cx="70" cy="70" r={radius}
          fill="none" stroke="#fed7aa" strokeWidth="11"
        />
        <circle
          cx="70" cy="70" r={radius}
          fill="none" stroke="url(#scoreGradient)" strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="60%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#BE185D" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-slate-900 tabular-nums leading-none">
          {score}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
          av 100
        </span>
      </div>
    </div>
  )
}

function InsightList({
  icon,
  title,
  items,
  tone,
}: {
  icon: React.ReactNode
  title: string
  items: string[]
  tone: 'emerald' | 'orange'
}) {
  const toneClasses =
    tone === 'emerald'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
      : 'text-orange-700 bg-orange-50 border-orange-100'
  return (
    <div className={`rounded-2xl border p-3.5 ${toneClasses}`}>
      <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider mb-2">
        {icon}
        {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-1.5 text-[13px] text-slate-700 leading-snug">
            <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 opacity-70" strokeWidth={2.5} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function LoadingState() {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-4 py-2"
    >
      <div className="w-[140px] h-[140px] rounded-full bg-orange-50 animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="h-5 w-3/4 rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-4 w-full rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-4 w-5/6 rounded-lg bg-slate-100 animate-pulse" />
        <p className="text-sm text-slate-500 pt-1">Vi läser igenom ditt CV...</p>
      </div>
    </motion.div>
  )
}
