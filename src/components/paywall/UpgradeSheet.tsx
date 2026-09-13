'use client'

/**
 * Produktval som öppnas från betalväggarna och prissidan.
 * Postar till /api/stripe/create-plan-session { plan } och redirectar till
 * Stripe hosted checkout ({ url }). Dagspass först i betalväggar, månad
 * först på prissidan.
 *
 * Egen portal på z-100 eftersom den öppnas inifrån flödesskal och sheets
 * som själva ligger på z-50. Det första alternativet är det framhävda och
 * markeras som ett val: kant ink-1, ingen orange ram.
 */

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { PLANS, type PlanKey } from '@/lib/plans/plans'
import type { PremiumLossItem } from '@/app/api/premium/usage-summary/route'
import { IlluDagspass, IlluVecka, IlluManad, IlluKvartal } from '@/components/illustrations/PriserIllustrations'

export type PlanOrder = 'daypass-first' | 'month-first'

interface UpgradeSheetProps {
  open: boolean
  onClose: () => void
  order?: PlanOrder
  /** Varifrån sheeten öppnades, loggas som metadata på checkout-sessionen */
  source?: string
  /**
   * Visa "det här förlorar du" ovanför produkterna. Sätts av statusraden dag
   * 4 till 5 och vid engångsköp som håller på att ta slut. Raderna sorteras
   * efter vad användaren faktiskt hunnit använda.
   */
  showLossSummary?: boolean
}

const ICONS: Record<PlanKey, React.ComponentType<{ size?: number; className?: string }>> = {
  daypass: IlluDagspass,
  week: IlluVecka,
  month: IlluManad,
  quarter: IlluKvartal,
}

export default function UpgradeSheet({ open, onClose, order = 'daypass-first', source, showLossSummary }: UpgradeSheetProps) {
  const [loading, setLoading] = useState<PlanKey | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [losses, setLosses] = useState<PremiumLossItem[] | null>(null)

  // Hämtas först när sheeten öppnas: ingen anledning att fråga i förväg.
  useEffect(() => {
    if (!open || !showLossSummary || losses) return
    let cancelled = false
    fetch('/api/premium/usage-summary')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.losses) setLosses(data.losses as PremiumLossItem[])
      })
      .catch(() => {
        /* utan svar visar vi bara produkterna */
      })
    return () => {
      cancelled = true
    }
  }, [open, showLossSummary, losses])

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
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <button
        aria-label="Stäng"
        className="absolute inset-0 bg-ink-1/40 motion-safe:animate-[fadeInPlace_200ms_ease-out]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-sheet-title"
        className="relative max-h-[90dvh] w-full overflow-y-auto rounded-t-xl border border-kant bg-panel p-4 shadow-svav motion-safe:animate-[sheetUp_240ms_ease-out] sm:max-w-lg sm:rounded-xl sm:p-6 sm:motion-safe:animate-[fadeInPlace_240ms_ease-out]"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="upgrade-sheet-title" className="text-kort text-ink-1">
              Välj hur länge du vill ha Premium
            </h2>
            <p className="mt-1 text-sm leading-[22px] text-ink-2">
              Alla alternativ ger samma funktioner. Skillnaden är hur länge.
            </p>
          </div>
          <button
            onClick={onClose}
            className="-mr-2 -mt-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-2 hover:bg-insunken hover:text-ink-1"
            aria-label="Stäng"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        {/* Vad gratisnivån ger, rangordnat efter vad hon faktiskt använt
            under perioden. Raden hon använt mest står först. */}
        {showLossSummary && losses && losses.length > 0 ? (
          <div className="mb-4 rounded-lg border border-kant bg-insunken p-3 shadow-insunken">
            <p className="text-sm font-medium text-ink-1">Så här blir det på gratisnivån</p>
            <ul className="mt-2 space-y-1.5">
              {losses.map((loss) => (
                <li key={loss.label} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0 text-ink-2">{loss.label}</span>
                  <span className="whitespace-nowrap font-medium text-ink-1">{loss.free}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <ul className="space-y-2">
          {plans.map((plan, i) => {
            const Icon = ICONS[plan.key]
            const highlighted = i === 0
            return (
              <li key={plan.key}>
                <button
                  onClick={() => start(plan.key)}
                  disabled={loading !== null}
                  className={`flex w-full items-center gap-3 rounded-lg border bg-panel p-3 text-left transition-[border-color] duration-[120ms] disabled:opacity-60 ${
                    highlighted ? 'border-ink-1 shadow-val' : 'border-kant hover:border-kant-stark'
                  }`}
                >
                  <span className="shrink-0 text-ink-1">
                    <Icon size={40} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-semibold text-ink-1">{plan.name}</span>
                      <span className="whitespace-nowrap text-sm font-semibold tabular-nums text-ink-1">
                        {plan.amount} kr
                        <span className="ml-1 text-meta font-normal text-ink-3">{plan.suffix}</span>
                      </span>
                    </span>
                    <span className="mt-0.5 block text-meta text-ink-2">{plan.body}</span>
                    {plan.perMonth ? (
                      <span className="mt-0.5 block text-meta font-medium text-ink-3">{plan.perMonth}</span>
                    ) : null}
                  </span>
                  {loading === plan.key ? (
                    <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-kant border-t-ink-1" aria-hidden="true" />
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>

        {error ? <p className="mt-3 text-sm text-fel">{error}</p> : null}
        <p className="mt-4 text-meta text-ink-3">
          Engångsköp dras aldrig automatiskt. Prenumerationer avslutar du med ett klick i ditt konto.
        </p>
      </div>
    </div>,
    document.body
  )
}
