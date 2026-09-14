'use client'

/**
 * Gemensam betalvägg (docs/designsystem.md, "Betalväggar").
 *
 * Kortet är en upphöjd panel (kant-stark): det är inte en position, det är
 * ett erbjudande. Marginalplattan bär vyns enda illustration, handlingen är
 * en ink-knapp, det sekundära alltid en textlänk. Värdet visas alltid före
 * spärren: brevet syns i sin helhet ovanför, fynden står ovanför kortet.
 * Returnerar null för premium. Copy ordagrant från paywall-copy.ts.
 */

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { capture } from '@/lib/analytics/events'
import { getPaywallCopy, type PaywallVariant } from './paywall-copy'
import { PREMIUM_HREF } from '@/lib/premium/premiumEntry'
import UpgradeSheet, { type PlanOrder } from './UpgradeSheet'
import MarginPlate from '@/components/shell/MarginPlate'
import {
  IlluPlattaNedladdning,
  IlluPlattaCvPoang,
  IlluPlattaPremium,
  IlluPlattaTest,
  IlluPlattaAnsokan,
} from '@/components/illustrations/TradenScener'
import { IlluDagensBrev, IlluAnalysDelvis, IlluNedgraderad } from '@/components/illustrations/PaywallIllustrations'
import { IlluDoldTraff } from '@/components/illustrations/JobbmatchningIllustrations'

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
  nedladdning: IlluPlattaNedladdning,
  'cv-export': IlluPlattaNedladdning,
  kvot: IlluDagensBrev,
  analys: IlluAnalysDelvis,
  'test-tak': IlluPlattaTest,
  nedgraderad: IlluNedgraderad,
  'cv-antal': IlluPlattaCvPoang,
  jobbtraffar: IlluDoldTraff,
  'af-rapport': IlluPlattaAnsokan,
}

const LINK =
  'inline-flex min-h-[44px] items-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1'

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
  const pathname = usePathname()
  const surface = pathname ?? ''

  // En gång per montering, aldrig per omritning. Refen överlever både
  // omritningar och StrictMode:s dubbelkörning i utvecklingsläge.
  const shownRef = useRef(false)
  useEffect(() => {
    if (isPremium || shownRef.current) return
    shownRef.current = true
    capture('paywall_shown', { variant, surface })
  }, [isPremium, variant, surface])

  const ctaClicked = (cta: 'primary' | 'secondary') =>
    capture('paywall_cta_clicked', { variant, surface, cta })

  if (isPremium) return null

  const copy = getPaywallCopy(variant, {
    findingsTotal,
    hiddenCount,
    quotaFeature: quota?.feature,
  })
  const Illu = ILLU[variant] ?? IlluPlattaPremium

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
    switch (variant) {
      case 'nedladdning':
        return (
          <button
            type="button"
            className={LINK}
            onClick={() => {
              ctaClicked('secondary')
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
        if (!quota)
          return (
            <Link href={PREMIUM_HREF} className={LINK} onClick={() => ctaClicked('secondary')}>
              Se vad Premium kostar
            </Link>
          )
        if (reminder === 'saved')
          return (
            <span className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-positiv">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-6" /></svg>
              Vi mailar dig imorgon
            </span>
          )
        return (
          <button
            type="button"
            className={LINK}
            onClick={() => {
              ctaClicked('secondary')
              void remind()
            }}
            disabled={reminder === 'saving'}
          >
            {reminder === 'saving' ? 'Sparar' : copy.secondary}
          </button>
        )
      case 'nedgraderad':
        return (
          <button
            type="button"
            className={LINK}
            onClick={() => {
              ctaClicked('secondary')
              onDismiss?.()
            }}
          >
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
            <button
              type="button"
              className={LINK}
              onClick={() => {
                ctaClicked('secondary')
                onSecondary()
              }}
            >
              {copy.secondary}
            </button>
          )
        return (
          <Link href={PREMIUM_HREF} className={LINK} onClick={() => ctaClicked('secondary')}>
            {copy.secondary}
          </Link>
        )
    }
  })()

  return (
    <section
      className={`rounded-xl border border-kant-stark bg-panel p-4 ${className ?? ''}`}
      aria-label={copy.title}
    >
      <div className="flex items-start gap-3">
        <MarginPlate>
          <Illu size={48} />
        </MarginPlate>
        <div className="min-w-0 flex-1">
          <h3 className="text-kort text-ink-1">{copy.title}</h3>
          <p className="mt-1 text-sm leading-[22px] text-ink-2">{copy.body}</p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                ctaClicked('primary')
                setSheetOpen(true)
              }}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover sm:w-auto"
            >
              {copy.primary}
            </button>
          </div>
          <div className="mt-1">{secondary}</div>
          {reminder === 'error' ? (
            <p className="mt-1 text-meta text-fel">Kunde inte spara påminnelsen. Försök igen.</p>
          ) : null}
        </div>
      </div>
      <UpgradeSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        order={planOrder}
        source={`paywall:${variant}`}
        variant={variant}
      />
    </section>
  )
}
