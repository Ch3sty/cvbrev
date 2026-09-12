'use client'

/**
 * Fyra produktkort enligt A7 i docs/plan-konvertering.md. Delas av
 * /priser och startsidans DetailedPricingSection så att de aldrig glider isär.
 *
 * Desktop: fyra jämnbreda kort. Månad markerad med orange 1 px ram och
 * ring-4 ring-orange-50, Kvartal med 99 kr per månad utskrivet.
 * Mobil: Månad expanderad överst, tre kollapsade rader under.
 *
 * Design: border i stället för skugga, rounded-xl, font-semibold som tyngst,
 * en enda fylld orange yta (den primära knappen på det markerade kortet).
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PLANS, type Plan, type PlanKey } from '@/lib/plans/plans'
import {
  IlluDagspass,
  IlluVecka,
  IlluManad,
  IlluKvartal,
} from '@/components/illustrations/PriserIllustrations'

const ICONS: Record<PlanKey, React.ComponentType<{ size?: number; className?: string }>> = {
  daypass: IlluDagspass,
  week: IlluVecka,
  month: IlluManad,
  quarter: IlluKvartal,
}

/** Mobilordning: Månad först och öppen, resten kollapsade. */
const MOBILE_ORDER: PlanKey[] = ['month', 'quarter', 'week', 'daypass']

function Check({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="15"
      height="15"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3.5 8.5l3 3 6-6" />
    </svg>
  )
}

interface PlanCardsProps {
  /** Rubrik ovanför kortraden. Utelämnas på prissidan, där heron tar den. */
  heading?: string
  className?: string
}

export default function PlanCards({ heading, className }: PlanCardsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<PlanKey | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [openMobile, setOpenMobile] = useState<PlanKey>('month')

  const start = async (plan: PlanKey) => {
    setLoading(plan)
    setError(null)
    try {
      const res = await fetch('/api/stripe/create-plan-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, source: 'priser' }),
      })
      // Utloggad går till registrering med produkten i frågesträngen, så
      // hon kan köpa direkt efter att kontot skapats.
      if (res.status === 401) {
        router.push(`/register?redirect=${encodeURIComponent(`/kassa?plan=${plan}`)}`)
        return
      }
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.url) throw new Error(data?.error || 'Kunde inte starta betalningen.')
      window.location.href = data.url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Något gick fel. Försök igen.')
      setLoading(null)
    }
  }

  return (
    <section className={`py-10 sm:py-14 ${className ?? ''}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {heading ? (
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 text-center mb-8">
            {heading}
          </h2>
        ) : null}

        {/* Desktop: fyra jämnbreda kort */}
        <div className="hidden lg:grid grid-cols-4 gap-4 items-stretch">
          {PLANS.map((plan) => (
            <DesktopCard
              key={plan.key}
              plan={plan}
              loading={loading === plan.key}
              disabled={loading !== null}
              onStart={() => start(plan.key)}
            />
          ))}
        </div>

        {/* Mobil och surfplatta: en expanderad, tre kollapsade rader */}
        <div className="lg:hidden space-y-2">
          {MOBILE_ORDER.map((key) => {
            const plan = PLANS.find((p) => p.key === key)!
            return (
              <MobileRow
                key={key}
                plan={plan}
                open={openMobile === key}
                onOpen={() => setOpenMobile(key)}
                loading={loading === key}
                disabled={loading !== null}
                onStart={() => start(key)}
              />
            )
          })}
        </div>

        {error ? <p className="text-sm text-red-700 mt-4 text-center">{error}</p> : null}
      </div>
    </section>
  )
}

function Price({ plan, large }: { plan: Plan; large?: boolean }) {
  return (
    <div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={`font-semibold text-neutral-900 tabular-nums tracking-tight ${large ? 'text-4xl' : 'text-3xl'}`}
        >
          {plan.amount} kr
        </span>
        <span className="text-sm text-neutral-500">{plan.suffix}</span>
      </div>
      {plan.perMonth ? (
        <p className="text-sm font-medium text-orange-700 mt-1">{plan.perMonth}</p>
      ) : null}
    </div>
  )
}

function Cta({
  plan,
  loading,
  disabled,
  onStart,
  filled,
}: {
  plan: Plan
  loading: boolean
  disabled: boolean
  onStart: () => void
  filled: boolean
}) {
  return (
    <button
      type="button"
      onClick={onStart}
      disabled={disabled}
      className={`inline-flex items-center justify-center w-full h-11 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${
        filled
          ? 'bg-orange-600 text-white hover:bg-orange-700'
          : 'bg-white text-neutral-900 border border-neutral-200 hover:border-neutral-400'
      }`}
    >
      {loading ? (
        <span
          className={`h-5 w-5 rounded-full border-2 animate-spin ${
            filled ? 'border-white/40 border-t-white' : 'border-neutral-300 border-t-orange-600'
          }`}
          aria-label="Öppnar betalningen"
        />
      ) : (
        plan.ctaLabel
      )}
    </button>
  )
}

function DesktopCard({
  plan,
  loading,
  disabled,
  onStart,
}: {
  plan: Plan
  loading: boolean
  disabled: boolean
  onStart: () => void
}) {
  const Icon = ICONS[plan.key]
  const highlighted = plan.key === 'month'

  return (
    <div
      className={`relative bg-white rounded-xl border p-5 flex flex-col ${
        highlighted ? 'border-orange-600 ring-4 ring-orange-50' : 'border-neutral-200'
      }`}
    >
      {plan.badge ? (
        <span
          className={`absolute -top-2.5 left-5 px-2 py-0.5 rounded-full text-xs font-semibold ${
            highlighted
              ? 'bg-orange-600 text-white'
              : 'bg-white border border-neutral-200 text-neutral-700'
          }`}
        >
          {plan.badge}
        </span>
      ) : null}

      <span className="text-neutral-900 mb-3">
        <Icon size={56} />
      </span>

      <h3 className="text-base font-semibold text-neutral-900">{plan.name}</h3>
      <div className="mt-2 mb-3">
        <Price plan={plan} />
      </div>
      <p className="text-sm text-neutral-600 leading-relaxed">{plan.body}</p>

      <ul className="mt-4 space-y-2 flex-1">
        {plan.highlights.map((h) => (
          <li key={h} className="flex items-start gap-2">
            <Check className="text-orange-600 shrink-0 mt-0.5" />
            <span className="text-sm text-neutral-700">{h}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <Cta plan={plan} loading={loading} disabled={disabled} onStart={onStart} filled={highlighted} />
      </div>
    </div>
  )
}

function MobileRow({
  plan,
  open,
  onOpen,
  loading,
  disabled,
  onStart,
}: {
  plan: Plan
  open: boolean
  onOpen: () => void
  loading: boolean
  disabled: boolean
  onStart: () => void
}) {
  const Icon = ICONS[plan.key]
  const highlighted = plan.key === 'month'

  if (!open) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="w-full min-h-[56px] flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-200 bg-white text-left hover:border-neutral-400 transition-colors"
      >
        <span className="text-neutral-900 shrink-0">
          <Icon size={32} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-neutral-900">{plan.name}</span>
          {plan.badge ? (
            <span className="block text-xs text-neutral-500">{plan.badge}</span>
          ) : null}
        </span>
        <span className="text-sm font-semibold text-neutral-900 tabular-nums whitespace-nowrap">
          {plan.amount} kr
        </span>
      </button>
    )
  }

  return (
    <div
      className={`relative rounded-xl border bg-white p-4 ${
        highlighted ? 'border-orange-600 ring-4 ring-orange-50' : 'border-neutral-200'
      }`}
    >
      {plan.badge ? (
        <span
          className={`absolute -top-2.5 left-4 px-2 py-0.5 rounded-full text-xs font-semibold ${
            highlighted
              ? 'bg-orange-600 text-white'
              : 'bg-white border border-neutral-200 text-neutral-700'
          }`}
        >
          {plan.badge}
        </span>
      ) : null}

      <div className="flex items-start gap-4">
        <span className="text-neutral-900 shrink-0">
          <Icon size={48} />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-neutral-900">{plan.name}</h3>
          <div className="mt-1">
            <Price plan={plan} large />
          </div>
        </div>
      </div>

      <p className="text-sm text-neutral-600 leading-relaxed mt-3">{plan.body}</p>

      <ul className="mt-3 space-y-2">
        {plan.highlights.map((h) => (
          <li key={h} className="flex items-start gap-2">
            <Check className="text-orange-600 shrink-0 mt-0.5" />
            <span className="text-sm text-neutral-700">{h}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <Cta plan={plan} loading={loading} disabled={disabled} onStart={onStart} filled={highlighted} />
      </div>
    </div>
  )
}
