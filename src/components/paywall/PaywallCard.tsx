'use client'

/**
 * Gemensam betalvägg (docs/plan-konvertering.md, E2). Ersätter QuotaLockCard,
 * QuotaExceededBanner, CvLimitBanner och PremiumRequiredCard.
 *
 * Layout: vitt kort, border, ingen skugga, illustration 48 px till vänster,
 * primärknapp orange, sekundärt alltid textlänk. Returnerar null för premium.
 */

import React, { useState } from 'react'
import Link from 'next/link'
import { getPaywallCopy, type PaywallVariant } from './paywall-copy'
import { PREMIUM_HREF } from '@/lib/premium/premiumEntry'
import UpgradeSheet, { type PlanOrder } from './UpgradeSheet'
import {
  IlluBrevKlart,
  IlluCvStack,
  IlluDagensBrev,
  IlluAnalysDelvis,
  IlluTestTak,
  IlluNedgraderad,
} from '@/components/illustrations/PaywallIllustrations'
import { IlluDoldTraff } from '@/components/illustrations/JobbmatchningIllustrations'
import { IlluAfRapport } from '@/components/illustrations/ApplicationIllustrations'

export interface PaywallCardProps {
  variant: PaywallVariant
  /** Premium ser aldrig en betalvägg */
  isPremium?: boolean
  /** Antal fynd totalt, variant analys */
  findingsTotal?: number
  /** Antal suddade träffar, variant jobbtraffar */
  hiddenCount?: number
  /** Kvotnyckel + återställningstid, variant kvot och test-tak (för "påminn mig") */
  quota?: { feature: string; nextResetAt: string }
  /** Variant nedladdning: sekundär handling kopierar texten */
  onCopy?: () => void
  /** Variant nedgraderad: sekundär handling stänger kortet */
  onDismiss?: () => void
  /**
   * Generisk sekundär handling. Ersätter standardlänken i de varianter som
   * annars pekar på prenumerationssidan, och driver "Ta bort ett gammalt CV".
   */
  onSecondary?: () => void
  /** Ordning i produktvalet. Betalväggar: dagspass först. */
  planOrder?: PlanOrder
  className?: string
}

const ILLU: Record<PaywallVariant, React.ComponentType<{ size?: number; className?: string }>> = {
  nedladdning: IlluBrevKlart,
  'cv-export': IlluCvStack,
  kvot: IlluDagensBrev,
  analys: IlluAnalysDelvis,
  'test-tak': IlluTestTak,
  nedgraderad: IlluNedgraderad,
  'cv-antal': IlluCvStack,
  jobbtraffar: IlluDoldTraff,
  'af-rapport': IlluAfRapport,
}

export default function PaywallCard({
  variant,
  isPremium,
  findingsTotal,
  hiddenCount,
  quota,
  onCopy,
  onDismiss,
  onSecondary,
  planOrder = 'daypass-first',
  className,
}: PaywallCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [reminder, setReminder] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [copied, setCopied] = useState(false)

  if (isPremium) return null

  const copy = getPaywallCopy(variant, {
    findingsTotal,
    hiddenCount,
    quotaFeature: quota?.feature,
  })
  const Illu = ILLU[variant]

  const remind = async () => {
    if (!quota || reminder === 'saving' || reminder === 'saved') return
    setReminder('saving')
    try {
      const res = await fetch('/api/quota/remind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature: quota.feature, remindAfter: quota.nextResetAt }),
      })
      setReminder(res.ok ? 'saved' : 'error')
    } catch {
      setReminder('error')
    }
  }

  const secondary = (() => {
    const cls = 'text-sm font-medium text-neutral-600 hover:text-neutral-900 underline-offset-4 hover:underline'
    switch (variant) {
      case 'nedladdning':
        return (
          <button
            type="button"
            className={cls}
            onClick={() => {
              onCopy?.()
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}
          >
            {copied ? 'Kopierat' : copy.secondary}
          </button>
        )
      case 'kvot':
      case 'test-tak':
        if (!quota) return <Link href={PREMIUM_HREF} className={cls}>Se vad Premium kostar</Link>
        if (reminder === 'saved')
          return (
            <span className="text-sm font-medium text-neutral-700 inline-flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="#1F7A4D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-6" /></svg>
              Vi mailar dig imorgon
            </span>
          )
        return (
          <button type="button" className={cls} onClick={remind} disabled={reminder === 'saving'}>
            {reminder === 'saving' ? 'Sparar…' : copy.secondary}
          </button>
        )
      case 'nedgraderad':
        return (
          <button type="button" className={cls} onClick={onDismiss}>
            {copy.secondary}
          </button>
        )
      case 'analys':
      case 'cv-export':
      case 'cv-antal':
      default:
        // En sekundär handling som hör hemma i vyn (t.ex. "Ta bort ett
        // gammalt CV") vinner över den generiska länken till prissidan.
        if (onSecondary)
          return (
            <button type="button" className={cls} onClick={onSecondary}>
              {copy.secondary}
            </button>
          )
        return <Link href={PREMIUM_HREF} className={cls}>{copy.secondary}</Link>
    }
  })()

  return (
    <section
      className={`bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 ${className ?? ''}`}
      aria-label={copy.title}
    >
      <div className="flex items-start gap-4">
        <span className="shrink-0 text-neutral-900" aria-hidden="true">
          <Illu size={48} />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-neutral-900 tracking-tight">{copy.title}</h3>
          <p className="text-sm text-neutral-600 mt-1 leading-relaxed">{copy.body}</p>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="inline-flex items-center justify-center h-11 px-4 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors w-full sm:w-auto"
            >
              {copy.primary}
            </button>
            {secondary}
          </div>
          {reminder === 'error' ? (
            <p className="text-sm text-red-700 mt-2">Kunde inte spara påminnelsen. Försök igen.</p>
          ) : null}
        </div>
      </div>
      <UpgradeSheet open={sheetOpen} onClose={() => setSheetOpen(false)} order={planOrder} source={`paywall:${variant}`} />
    </section>
  )
}
