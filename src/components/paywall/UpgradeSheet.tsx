'use client'

/**
 * Produktval som öppnas från betalväggarna och prissidan.
 * Postar till /api/stripe/create-plan-session { plan } och redirectar till
 * Stripe hosted checkout ({ url }). Dagspass först i betalväggar, månad
 * först på prissidan.
 */

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { PLANS, type PlanKey } from '@/lib/plans/plans'
import { IlluDagspass, IlluVecka, IlluManad, IlluKvartal } from '@/components/illustrations/PriserIllustrations'

export type PlanOrder = 'daypass-first' | 'month-first'

interface UpgradeSheetProps {
  open: boolean
  onClose: () => void
  order?: PlanOrder
  /** Varifrån sheeten öppnades, loggas som metadata på checkout-sessionen */
  source?: string
}

const ICONS: Record<PlanKey, React.ComponentType<{ size?: number; className?: string }>> = {
  daypass: IlluDagspass,
  week: IlluVecka,
  month: IlluManad,
  quarter: IlluKvartal,
}

export default function UpgradeSheet({ open, onClose, order = 'daypass-first', source }: UpgradeSheetProps) {
  const [loading, setLoading] = useState<PlanKey | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  const ordered =
    order === 'month-first'
      ? ['month', 'quarter', 'week', 'daypass']
      : ['daypass', 'week', 'month', 'quarter']
  const plans = ordered.map((k) => PLANS.find((p) => p.key === k)!)

  const start = async (plan: PlanKey) => {
    setLoading(plan)
    setError(null)
    try {
      const res = await fetch('/api/stripe/create-plan-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, source }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 401) {
        window.location.href = `/login?redirect=${encodeURIComponent(`/kassa?plan=${plan}`)}`
        return
      }
      if (!res.ok || !data?.url) throw new Error(data?.error || 'Kunde inte starta betalningen.')
      window.location.href = data.url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Något gick fel. Försök igen.')
      setLoading(null)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <button
        aria-label="Stäng"
        className="absolute inset-0 bg-neutral-900/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-sheet-title"
        className="relative w-full sm:max-w-lg bg-white rounded-t-xl sm:rounded-xl border border-neutral-200 shadow-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 id="upgrade-sheet-title" className="text-lg font-semibold text-neutral-900 tracking-tight">
              Välj hur länge du vill ha Premium
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Alla alternativ ger samma funktioner. Skillnaden är hur länge.
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-11 w-11 -mr-2 -mt-2 inline-flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
            aria-label="Stäng"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <ul className="space-y-2">
          {plans.map((plan, i) => {
            const Icon = ICONS[plan.key]
            const highlighted = i === 0
            return (
              <li key={plan.key}>
                <button
                  onClick={() => start(plan.key)}
                  disabled={loading !== null}
                  className={`w-full text-left flex items-center gap-4 p-3 rounded-lg border transition-colors disabled:opacity-60 ${
                    highlighted
                      ? 'border-orange-600 ring-4 ring-orange-50'
                      : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  <span className="shrink-0 text-neutral-900">
                    <Icon size={40} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="text-base font-semibold text-neutral-900">{plan.name}</span>
                      <span className="text-base font-semibold text-neutral-900 tabular-nums whitespace-nowrap">
                        {plan.amount} kr
                        <span className="text-xs font-normal text-neutral-500 ml-1">{plan.suffix}</span>
                      </span>
                    </span>
                    <span className="block text-sm text-neutral-600 mt-0.5">{plan.body}</span>
                    {plan.perMonth ? (
                      <span className="block text-xs text-orange-700 font-medium mt-1">{plan.perMonth}</span>
                    ) : null}
                  </span>
                  {loading === plan.key ? (
                    <span className="shrink-0 h-5 w-5 rounded-full border-2 border-neutral-300 border-t-orange-600 animate-spin" aria-hidden="true" />
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>

        {error ? <p className="text-sm text-red-700 mt-3">{error}</p> : null}
        <p className="text-xs text-neutral-500 mt-4">
          Engångsköp dras aldrig automatiskt. Prenumerationer avslutar du med ett klick i ditt konto.
        </p>
      </div>
    </div>,
    document.body
  )
}
