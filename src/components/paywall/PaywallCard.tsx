'use client'

/**
 * Gemensam betalvägg (docs/designsystem.md, "Betalväggar", och
 * docs/plan-paket-och-onboarding.md Fas 2B avsnitt 4).
 *
 * Kortet är en upphöjd panel (kant-stark): det är inte en position, det är
 * ett erbjudande. Marginalplattan bär vyns enda illustration, handlingen är
 * en ink-knapp, det sekundära alltid en textlänk. Värdet visas alltid före
 * spärren: brevet syns i sin helhet ovanför, fynden står ovanför kortet.
 *
 * Efter paketomgången bär kortet feature och scope. Knappen leder till
 * köpsteget för paketet i knappen, och varje visning skjuter både paywall_shown och feature_blocked
 * så att vi ser var fel spår tar i taket.
 *
 * Har användaren ett betalt spår som inte räcker är det inte en betalvägg
 * utan en uppgradering, och då renderas FelSpar i stället.
 */

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { capture } from '@/lib/analytics/events'
import { getPaywallCopy, planForPaywall, VARIANT_FEATURE, type PaywallVariant } from './paywall-copy'
import { scopeHasFeature, type Feature, type Scope } from '@/lib/access/features'
import type { PlanKey } from '@/lib/plans/plans'
import { PREMIUM_HREF } from '@/lib/premium/premiumEntry'
import { kopstegHref } from '@/lib/onboarding/steps'
import UpgradeSheet, { type PlanOrder } from './UpgradeSheet'
import FelSpar from './FelSpar'
import MarginPlate from '@/components/shell/MarginPlate'
import {
  IlluPlattaNedladdning,
  IlluPlattaCvPoang,
  IlluPlattaPremium,
  IlluPlattaTest,
  IlluPlattaAnsokan,
  IlluPlattaPresentation,
} from '@/components/illustrations/TradenScener'
import { IlluDagensBrev, IlluAnalysDelvis, IlluNedgraderad } from '@/components/illustrations/PaywallIllustrations'
import { IlluDoldTraff } from '@/components/illustrations/JobbmatchningIllustrations'

/** Spårvalet. Knappen går hit med paketet förvalt (B3:s flöde 1). */
export const SPARVAL_HREF = '/dashboard/valj-spar'

export interface PaywallCardProps {
  variant: PaywallVariant
  /**
   * Funktionen som spärrade. Utelämnas den härleds den ur varianten, så
   * befintliga anropare fortsätter fungera.
   */
  feature?: Feature
  /** Användarens betalda paket, eller null på gratisnivån. */
  scope?: Scope | null
  /** Spåret hon valde i onboardingen. Styr vilket paket som föreslås. */
  track?: Scope | null
  /** Sann när kontot redan har funktionen. Kortet ritas då inte alls. */
  isPremium?: boolean
  /** Antal fynd totalt, variant analys */
  findingsTotal?: number
  /** Antal suddade träffar, variant jobbtraffar */
  hiddenCount?: number
  /** Kvotnyckel + återställningstid, variant kvot och test-tak */
  quota?: { feature: string; nextResetAt: string }
  /** Variant nedladdning: sekundär handling kopierar texten */
  onCopy?: () => void
  /** Variant nedgraderad: sekundär handling stänger kortet */
  onDismiss?: () => void
  /**
   * Generisk sekundär handling. Ersätter standardlänken i de varianter som
   * annars pekar på prenumerationssidan.
   */
  onSecondary?: () => void
  /**
   * Mellanskillnaden i kronor vid en uppgradering. Skickas vidare till
   * FelSpar, som är den enda yta där beloppet är sant (2A).
   */
  priceDeltaKr?: number | null
  /**
   * Utan panel och illustration: bara text och handling. För de vyer som
   * redan har en egen ram runt betalväggen (2A).
   */
  bare?: boolean
  /** Ordning i produktvalet. */
  planOrder?: PlanOrder
  className?: string
}

const ILLU: Record<PaywallVariant, React.ComponentType<{ size?: number; className?: string }>> = {
  mall: IlluPlattaPremium,
  testniva: IlluPlattaTest,
  analys: IlluAnalysDelvis,
  'analys-omkorning': IlluAnalysDelvis,
  nedladdning: IlluPlattaNedladdning,
  'cv-export': IlluPlattaNedladdning,
  jobbtraffar: IlluDoldTraff,
  chatt: IlluPlattaPremium,
  historik: IlluPlattaTest,
  kvot: IlluDagensBrev,
  'test-tak': IlluPlattaTest,
  nedgraderad: IlluNedgraderad,
  'cv-antal': IlluPlattaCvPoang,
  'af-rapport': IlluPlattaAnsokan,
  linkedin: IlluPlattaPresentation,
  'bli-upptackt': IlluPlattaPremium,
}

const LINK =
  'inline-flex min-h-[44px] items-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1'

export default function PaywallCard({
  variant,
  feature,
  scope = null,
  track = null,
  isPremium,
  findingsTotal,
  hiddenCount,
  quota,
  onCopy,
  onDismiss,
  onSecondary,
  priceDeltaKr,
  bare,
  planOrder = 'month-first',
  className,
}: PaywallCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [reminder, setReminder] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [copied, setCopied] = useState(false)
  const pathname = usePathname()
  const surface = pathname ?? ''

  const sparradFeature = feature ?? VARIANT_FEATURE[variant] ?? null
  const suggestedPlan = planForPaywall(variant, { feature: sparradFeature ?? undefined, track })

  // Har hon ett betalt spår som inte täcker funktionen är det fel spår i
  // taket, alltså en uppgradering och inte en spärr. FelSpar äger den ytan
  // och skjuter sina egna händelser.
  const felSpar =
    !isPremium && scope !== null && sparradFeature !== null && !scopeHasFeature(scope, sparradFeature)

  // En gång per montering, aldrig per omritning. Refen överlever både
  // omritningar och StrictMode:s dubbelkörning i utvecklingsläge.
  const shownRef = useRef(false)
  useEffect(() => {
    if (isPremium || felSpar || shownRef.current) return
    shownRef.current = true
    capture('paywall_shown', {
      variant,
      surface,
      ...(sparradFeature ? { feature: sparradFeature } : {}),
      ...(suggestedPlan ? { suggestedPlan: suggestedPlan as PlanKey } : {}),
      // Från paketnamnsbytet 2026-09-24 bär kortet pris i knappen och en
      // prisrad, så avläsningen kan skilja före och efter.
      price_shown: true,
    })
    // Var fel spår tar i taket. Skjuts en gång per montering, samma som ovan.
    if (sparradFeature) {
      capture('feature_blocked', { feature: sparradFeature, scope, surface })
    }
  }, [isPremium, felSpar, variant, surface, sparradFeature, suggestedPlan, scope])

  const ctaClicked = (cta: 'primary' | 'secondary') =>
    capture('paywall_cta_clicked', {
      variant,
      surface,
      cta,
      ...(suggestedPlan ? { plan: suggestedPlan as PlanKey } : {}),
    })

  // Kontot har redan funktionen. Ingen betalvägg.
  if (isPremium) return null

  if (felSpar && sparradFeature) {
    return (
      <FelSpar
        feature={sparradFeature}
        scope={scope as Exclude<Scope, never>}
        priceDeltaKr={priceDeltaKr ?? 20}
        open
        onClose={() => undefined}
        returnPath={surface}
        className={className}
      />
    )
  }

  const copy = getPaywallCopy(variant, {
    findingsTotal,
    hiddenCount,
    quotaFeature: quota?.feature,
    track,
    plan: (suggestedPlan as PlanKey | null) ?? undefined,
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

  /**
   * Knappen har redan namngett paket och pris, så den går direkt till
   * köpsteget för det paketet (QA 2026-09-24, iakttagelse 1), aldrig via
   * produktvalet eller spårvalet. Bara när knappen saknar paket väljs det:
   * med sparat spår i produktvalet, annars i spårvalet.
   */
  const knappPlan: PlanKey | null = copy.plan ?? (suggestedPlan as PlanKey | null) ?? null
  const primarHandling = () => {
    ctaClicked('primary')
    if (knappPlan) {
      window.location.href = kopstegHref(knappPlan)
      return
    }
    if (track) {
      setSheetOpen(true)
      return
    }
    window.location.href = SPARVAL_HREF
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
              Jämför paketen
            </Link>
          )
        if (reminder === 'saved')
          return (
            <span className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-positiv">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-6" /></svg>
              Vi mailar dig när den öppnar
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
      default:
        // En sekundär handling som hör hemma i vyn (till exempel "Ta bort ett
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

  const innehall = (
    <>
      <h3 className="text-kort text-ink-1">{copy.title}</h3>
      <p className="mt-1 text-sm leading-[22px] text-ink-2">{copy.body}</p>
      {copy.prisrad ? (
        <p className="mt-2 text-sm font-medium text-ink-1">{copy.prisrad}</p>
      ) : null}
      <div className="mt-4">
        <button
          type="button"
          onClick={primarHandling}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-ink-hover sm:w-auto"
        >
          {copy.primary}
        </button>
      </div>
      <div className="mt-1">{secondary}</div>
      {reminder === 'error' ? (
        <p className="mt-1 text-meta text-fel">Kunde inte spara påminnelsen. Försök igen.</p>
      ) : null}
    </>
  )

  const arket = (
    <UpgradeSheet
      open={sheetOpen}
      onClose={() => setSheetOpen(false)}
      order={planOrder}
      source={`paywall:${variant}`}
      variant={variant}
      suggestedPlan={(suggestedPlan as PlanKey | null) ?? undefined}
    />
  )

  // Utan panel: vyn har redan en egen ram, och två ramar i varandra läser
  // som en bugg.
  if (bare) {
    return (
      <div className={className}>
        {innehall}
        {arket}
      </div>
    )
  }

  return (
    <section
      className={`rounded-xl border border-kant-stark bg-panel p-4 ${className ?? ''}`}
      aria-label={copy.title}
    >
      <div className="flex items-start gap-3">
        <MarginPlate>
          <Illu size={48} />
        </MarginPlate>
        <div className="min-w-0 flex-1">{innehall}</div>
      </div>
      {arket}
    </section>
  )
}
