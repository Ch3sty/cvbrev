'use client'

/**
 * Arket med Jobbcoach Premium (spec-rummen våg 5, copy-premium avsnitt 3).
 *
 * Bara Premium, 149 kr i månaden, säljs, så arket har ett kort: namnet,
 * vad som ingår, prisraden i kort form och köpknappen. Inget längdval och
 * inga spår; veckan är inte längre förvald eftersom den inte säljs.
 *
 * Knappen bär köpet till köpsteget, där ångerrättssamtycket kryssas på samma
 * skärm som betalningsknappen (avsnitt 8). Betalväggens variant följer med
 * som plats, så att köpet räknas per yta i subscription_paid.
 *
 * Egen portal på z-100 eftersom den öppnas inifrån flödesskal och sheets
 * som själva ligger på z-50.
 */

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { SALD_PLAN, kopKnapp, type PlanKey } from '@/lib/plans/plans'
import { capture } from '@/lib/analytics/events'
import type { PaywallVariant } from './paywall-copy'
import type { PremiumLossItem } from '@/app/api/premium/usage-summary/route'
import { Check } from '@/components/illustrations/RumIkoner'
import { KNAPP_PRIMAR } from '@/components/shell/knappar'
import { PAKET_KORT, UPPGRADERING_ARK } from '@/components/pricing/paket-copy'
import { kopstegHref } from '@/lib/onboarding/steps'

export type PlanOrder = 'daypass-first' | 'month-first'

interface UpgradeSheetProps {
  open: boolean
  onClose: () => void
  /** Står kvar för anroparna; det finns bara ett paket att ordna. */
  order?: PlanOrder
  /** Står kvar för anroparna. Platsen läses ur variant. */
  source?: string
  /**
   * Betalväggen som öppnade arket. Avgör vilken variant paywall-händelserna
   * hamnar på, och följer med till köpsteget som plats.
   */
  variant?: PaywallVariant
  /** Står kvar för anroparna; förslaget är alltid det som säljs. */
  suggestedPlan?: PlanKey
  /** Visa "så här blir det på gratisnivån" ovanför kortet. */
  showLossSummary?: boolean
}

const kort = PAKET_KORT.allt

export default function UpgradeSheet({ open, onClose, variant, showLossSummary }: UpgradeSheetProps) {
  const [busy, setBusy] = useState(false)
  const [losses, setLosses] = useState<PremiumLossItem[] | null>(null)
  const pathname = usePathname()
  const surface = pathname ?? ''

  // Arket är i sig en betalvägg: en gång per öppning, inte per omritning.
  useEffect(() => {
    if (!open || !variant) return
    capture('paywall_shown', { variant, surface, suggestedPlan: SALD_PLAN })
  }, [open, variant, surface])

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
        /* utan svar visar vi bara kortet */
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

  const kop = () => {
    if (variant) capture('paywall_cta_clicked', { variant, surface, plan: SALD_PLAN, cta: 'primary' })
    setBusy(true)
    window.location.href = kopstegHref(SALD_PLAN, variant ?? null)
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <button
        aria-label={UPPGRADERING_ARK.stang}
        className="absolute inset-0 bg-[color:var(--dimma,rgba(10,12,30,.55))] motion-safe:animate-[fadeInPlace_200ms_ease-out]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-sheet-title"
        className="relative max-h-[90dvh] w-full overflow-y-auto rounded-t-ark border border-kant bg-papper p-4 text-ink-1 shadow-svav motion-safe:animate-[sheetUp_240ms_ease-out] sm:max-w-lg sm:rounded-ark sm:p-6 sm:motion-safe:animate-[fadeInPlace_240ms_ease-out]"
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h2 id="upgrade-sheet-title" className="text-kort-t text-ink-1">
              {kort.namn}
            </h2>
            <p className="mt-1 text-meta text-ink-3">{kort.beskrivning}</p>
          </div>
          <button
            onClick={() => {
              if (variant) capture('paywall_cta_clicked', { variant, surface, cta: 'secondary' })
              onClose()
            }}
            className="-mr-2 -mt-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-2 hover:bg-papper-2 hover:text-ink-1"
            aria-label={UPPGRADERING_ARK.stang}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        {/* Vad gratisnivån ger, rangordnat efter vad hon faktiskt använt
            under perioden. Raden hon använt mest står först. */}
        {showLossSummary && losses && losses.length > 0 ? (
          <div className="mb-4 rounded-2xl border border-kant bg-papper-2 p-3">
            <p className="text-sm font-medium text-ink-1">{UPPGRADERING_ARK.gratisRubrik}</p>
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

        <p className="text-ey text-ink-3">{kort.listEtikett}</p>
        <ul className="mt-2 grid gap-2">
          {kort.ingar.map((rad) => (
            <li key={rad} className="flex items-start gap-2.5 text-sm leading-5 text-ink-1">
              <Check className="mt-px h-[18px] w-[18px] shrink-0 text-ton-ink" strokeWidth={2} aria-hidden="true" />
              <span>{rad}</span>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-sm leading-[21px] text-ink-2">{kort.prisrad}</p>
        <button type="button" onClick={kop} disabled={busy} className={`${KNAPP_PRIMAR} mt-2.5`}>
          {kopKnapp()}
        </button>
        <p className="mt-3 text-meta text-ink-3">{UPPGRADERING_ARK.fotnot}</p>
      </div>
    </div>,
    document.body
  )
}
