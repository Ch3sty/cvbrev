'use client'

/**
 * Produktvalet som öppnas från betalväggarna och prissidan
 * (docs/plan-paket-och-onboarding.md, ägarens beslut 4).
 *
 * Sex paket, men tre val: paketet väljs först, längden efteråt. CV-paketet och
 * Träningspaketet finns bara som vecka och får därför inget längdval alls. Väljs
 * Hela paketet visas fyra längder som ett Segment, och veckan är förvald.
 *
 * Postar till /api/stripe/create-plan-session { plan } och skickar vidare
 * till Stripe ({ url }).
 *
 * Egen portal på z-100 eftersom den öppnas inifrån flödesskal och sheets
 * som själva ligger på z-50. Det föreslagna spåret är det framhävda och
 * markeras som ett val: kant ink-1, ingen orange ram.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { PLANS, PLAN_BY_KEY, type PlanKey } from '@/lib/plans/plans'
import { capture } from '@/lib/analytics/events'
import type { PaywallVariant } from './paywall-copy'
import type { PremiumLossItem } from '@/app/api/premium/usage-summary/route'
import { IlluDagspass, IlluVecka, IlluManad, IlluKvartal } from '@/components/illustrations/PriserIllustrations'

export type PlanOrder = 'daypass-first' | 'month-first'

/** De tre valen. Allt är ett spår i valet, en längd i steget efter. */
type Val = 'cv_week' | 'test_week' | 'allt'

/** Längderna på Hela paketet, i den ordning kassan visar dem. */
const ALLT_LANGDER: readonly PlanKey[] = ['all_day', 'all_week', 'all_month', 'all_quarter']

interface UpgradeSheetProps {
  open: boolean
  onClose: () => void
  order?: PlanOrder
  /**
   * Varifrån arket öppnades. Låg förut som metadata på checkout-sessionen.
   * Sedan arket slutade öppna kassan själv (ångerrättssamtycket, avsnitt 8)
   * sätts den metadatan av köpsteget i stället, och fältet står kvar för
   * anropsplatsernas skull. Ska ursprunget tillbaka in i mätningen är det en
   * parameter på /dashboard/valj-spar, inte en rad här.
   */
  source?: string
  /**
   * Betalväggen som öppnade arket. Sätts av PaywallCard och avgör vilken
   * variant paywall-händelserna hamnar på. Öppnas arket från prissidan eller
   * statusraden hör det inte till någon betalvägg, och då mäts det inte här.
   */
  variant?: PaywallVariant
  /** Paketet betalväggen föreslog. Styr vilket val som står först. */
  suggestedPlan?: PlanKey
  /**
   * Visa "det här förlorar du" ovanför produkterna. Sätts av statusraden och
   * vid engångsköp som håller på att ta slut.
   */
  showLossSummary?: boolean
}

// Bilderna är ritade efter längd, inte efter spår. Spårveckorna delar
// veckobilden, eftersom de är just veckor.
const ICONS: Record<PlanKey, React.ComponentType<{ size?: number; className?: string }>> = {
  cv_week: IlluVecka,
  test_week: IlluVecka,
  all_day: IlluDagspass,
  all_week: IlluVecka,
  all_month: IlluManad,
  all_quarter: IlluKvartal,
}

const SEGMENT_KNAPP =
  'flex-1 rounded-md px-2 py-2 text-meta font-medium transition-colors min-h-[44px]'

export default function UpgradeSheet({
  open,
  onClose,
  order = 'month-first',
  source,
  variant,
  suggestedPlan,
  showLossSummary,
}: UpgradeSheetProps) {
  const [loading, setLoading] = useState<PlanKey | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [losses, setLosses] = useState<PremiumLossItem[] | null>(null)
  /** Längden på Hela paketet. Veckan är förvald (ägarens beslut 4). */
  const [alltLangd, setAlltLangd] = useState<PlanKey>('all_week')
  const pathname = usePathname()
  const surface = pathname ?? ''

  // Arket är i sig en betalvägg: en gång per öppning, inte per omritning.
  useEffect(() => {
    if (!open || !variant) return
    capture('paywall_shown', {
      variant,
      surface,
      ...(suggestedPlan ? { suggestedPlan } : {}),
    })
  }, [open, variant, surface, suggestedPlan])

  // Hämtas först när arket öppnas: ingen anledning att fråga i förväg.
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

  /**
   * Ordningen på de tre valen. Det föreslagna spåret står först, eftersom
   * betalväggen redan sagt vilket paket som löser just den här spärren.
   * Utan förslag står Hela paketet först på prissidan och CV-paketet i betalväggar.
   */
  const ordning: Val[] = useMemo(() => {
    const bas: Val[] =
      order === 'month-first'
        ? ['allt', 'cv_week', 'test_week']
        : ['cv_week', 'test_week', 'allt']
    if (!suggestedPlan) return bas
    const forst: Val =
      suggestedPlan === 'cv_week' ? 'cv_week' : suggestedPlan === 'test_week' ? 'test_week' : 'allt'
    return [forst, ...bas.filter((v) => v !== forst)]
  }, [order, suggestedPlan])

  if (!open || typeof document === 'undefined') return null

  const start = async (plan: PlanKey) => {
    // Först här finns ett produktval, så det är här plan kan följa med.
    if (variant) capture('paywall_cta_clicked', { variant, surface, plan, cta: 'primary' })
    setLoading(plan)
    setError(null)
    // Ångerrättssamtycket (avsnitt 8) ska kryssas på samma skärm som
    // köpknappen. Arket har ingen sådan kryssruta, så det öppnar inte kassan
    // själv utan bär paketet till köpsteget där rutan står bredvid knappen.
    window.location.href = `/dashboard/valj-spar?paket=${plan}`
  }

  /** Ett val, alltså ett spår. Allt bär sitt längdval inuti kortet. */
  const renderaVal = (val: Val, framhavd: boolean) => {
    const plan = PLAN_BY_KEY[val === 'allt' ? alltLangd : val]
    const Icon = ICONS[plan.key]
    const arAllt = val === 'allt'

    return (
      <li key={val}>
        <div
          className={`rounded-lg border bg-panel p-3 transition-[border-color] duration-[120ms] ${
            framhavd ? 'border-ink-1 shadow-val' : 'border-kant'
          }`}
        >
          <button
            onClick={() => start(plan.key)}
            disabled={loading !== null}
            className="flex w-full items-center gap-3 text-left disabled:opacity-60"
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
              <span className="mt-0.5 block text-meta text-ink-2">{plan.audience}</span>
              {plan.perMonth ? (
                <span className="mt-0.5 block text-meta font-medium text-ink-3">{plan.perMonth}</span>
              ) : null}
            </span>
            {loading === plan.key ? (
              <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-kant border-t-ink-1" aria-hidden="true" />
            ) : null}
          </button>

          {/* Längdvalet finns bara på Hela paketet. De andra har bara vecka, och ett
              segment med ett läge vore ingen fråga. Valt läge markeras i
              ink, inte i accent, så det räknas inte som ett orange element. */}
          {arAllt ? (
            <div
              role="radiogroup"
              aria-label="Hur länge"
              className="mt-3 flex gap-1 rounded-lg border border-kant bg-insunken p-1 shadow-insunken"
            >
              {ALLT_LANGDER.map((key) => {
                const langd = PLAN_BY_KEY[key]
                const vald = key === alltLangd
                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={vald}
                    onClick={() => setAlltLangd(key)}
                    className={`${SEGMENT_KNAPP} ${
                      vald ? 'bg-panel text-ink-1 shadow-val' : 'text-ink-2 hover:text-ink-1'
                    }`}
                  >
                    {langd.length === 'dag'
                      ? 'Dag'
                      : langd.length === 'vecka'
                        ? 'Vecka'
                        : langd.length === 'månad'
                          ? 'Månad'
                          : 'Kvartal'}
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>
      </li>
    )
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
              Välj paketet som passar
            </h2>
            <p className="mt-1 text-sm leading-[22px] text-ink-2">
              {PLAN_BY_KEY.cv_week.name} och {PLAN_BY_KEY.test_week.name} ger var sin del. {PLAN_BY_KEY.all_week.name} ger allt, och du väljer själv hur länge.
            </p>
          </div>
          <button
            onClick={() => {
              if (variant) capture('paywall_cta_clicked', { variant, surface, cta: 'secondary' })
              onClose()
            }}
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

        <ul className="space-y-2">{ordning.map((val, i) => renderaVal(val, i === 0))}</ul>

        {error ? <p className="mt-3 text-sm text-fel">{error}</p> : null}
        <p className="mt-4 text-meta text-ink-3">
          {PLAN_BY_KEY.all_day.name} är ett engångsköp och dras aldrig igen. Prenumerationer avslutar du med ett
          klick i ditt konto.
        </p>
      </div>
    </div>,
    document.body
  )
}

/** Alla paket, för de vyer som vill lista dem själva. */
export const ALLA_PAKET = PLANS
