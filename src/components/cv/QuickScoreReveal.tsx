'use client'

/**
 * QuickScoreReveal
 * ----------------
 * Aha-momentet direkt efter första CV-uppladdningen. Hämtar en snabb
 * basanalys (/api/cv/quick-score) och visar poängen plus det viktigaste,
 * med en tydlig väg vidare till första brevet.
 *
 * Designen följer docs/plan-konvertering.md: border i stället för skugga,
 * rounded-xl, font-semibold som tyngst, en orange yta.
 */

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { logUserActivity } from '@/lib/activity-logger'
import { IlluCvPoang } from '@/components/illustrations/DashboardIllustrations'

interface QuickScore {
  score: number
  summary: string
  strengths: string[]
  improvements: string[]
  keywords: string[]
}

interface QuickScoreRevealProps {
  cvId: string
  /** Används för aktivitetsloggning (B7). */
  userId?: string
  /** CTA-mål efter aha-momentet. Default: skapa första brevet. */
  nextHref?: string
  nextLabel?: string
}

export default function QuickScoreReveal({
  cvId,
  userId,
  nextHref = '/dashboard/skapa-brev',
  nextLabel = 'Skapa ditt första brev',
}: QuickScoreRevealProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<QuickScore | null>(null)
  const [displayScore, setDisplayScore] = useState(0)
  const [failed, setFailed] = useState(false)
  const logged = useRef(false)

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

  // B7: poängen räknas som visad när den faktiskt står på skärmen.
  useEffect(() => {
    if (!data || !userId || logged.current) return
    logged.current = true
    void logUserActivity(userId, 'quick_score_shown', 'Snabb CV-poäng visades', {
      cvId,
      score: data.score,
    })
  }, [data, userId, cvId])

  // Animera poängen upp till målvärdet
  useEffect(() => {
    if (!data) return
    const target = data.score
    const duration = 1100
    const start = performance.now()
    let frame: number

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayScore(Math.round(eased * target))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [data])

  // Fallback när snabbanalysen inte går igenom: uppladdningen lyckades ändå,
  // så vi bekräftar det och pekar vidare i stället för att visa ingenting.
  if (failed) {
    return (
      <section className="bg-white rounded-xl border border-neutral-200 p-5">
        <h2 className="text-base font-semibold text-neutral-900">Ditt CV är inläst</h2>
        <p className="text-sm text-neutral-600 mt-1">
          Vi hann inte räkna fram poängen den här gången. Du kan gå vidare ändå.
        </p>
        <Link
          href={nextHref}
          className="mt-4 inline-flex items-center justify-center h-11 px-4 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors"
        >
          {nextLabel}
        </Link>
      </section>
    )
  }

  if (loading) {
    return (
      <section className="bg-white rounded-xl border border-neutral-200 p-5" aria-busy="true">
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 rounded-full bg-neutral-100 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2.5">
            <div className="h-5 w-2/3 rounded bg-neutral-100 animate-pulse" />
            <div className="h-4 w-full rounded bg-neutral-100 animate-pulse" />
            <p className="text-sm text-neutral-500 pt-1">Vi läser igenom ditt CV…</p>
          </div>
        </div>
      </section>
    )
  }

  if (!data) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-5 sm:gap-6 items-start">
        <div className="relative flex items-center justify-center w-24 h-24 mx-auto sm:mx-0 text-neutral-900">
          <IlluCvPoang size={96} />
          <span className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold text-neutral-900 tabular-nums leading-none">
              {displayScore}
            </span>
            <span className="text-[10px] text-neutral-500 mt-0.5">av 100</span>
          </span>
        </div>

        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
            Så här ser ditt CV ut för en rekryterare
          </h2>
          <p className="text-sm text-neutral-600 mt-1 leading-relaxed">{data.summary}</p>

          {data.improvements.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-neutral-900 mb-2">Tre saker att fixa</p>
              <ul className="space-y-1.5">
                {data.improvements.slice(0, 3).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-neutral-600 leading-snug">
                    <Check className="w-4 h-4 shrink-0 mt-0.5 text-neutral-400" strokeWidth={2} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link
            href={nextHref}
            className="mt-5 inline-flex items-center justify-center h-11 px-4 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors w-full sm:w-auto"
          >
            {nextLabel}
          </Link>
        </div>
      </div>
    </motion.section>
  )
}
