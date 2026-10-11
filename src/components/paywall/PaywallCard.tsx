'use client'

/**
 * Gemensam betalvägg (spec-rummen våg 5, docs/design/copy-premium-2026-10-11.md).
 *
 * Bara Jobbcoach Premium säljs. Kortet är papper med kant, rubriken säger
 * Premium ("Mallen ingår i Premium"), brödtexten vad som ingår, prisraden
 * fulla namnet med pris och period (paywallPrisrad), kopparknappen
 * "Köp Premium, {pris i månaden}" (kopKnapp via paywall-copy) och det
 * sekundära alltid en textlänk. Värdet visas alltid före spärren: brevet
 * syns i sin helhet ovanför, fynden står ovanför kortet.
 *
 * En betalvägg bär alltid sin egen knapp, och en fast fot ligger aldrig
 * ovanpå en betalvägg (art-director 20.2 fråga 1).
 *
 * Mätning, en gång per montering: paywall_shown, feature_blocked och
 * betalvagg_visad (spec-rummen avsnitt 7) med platsen. Köpknappen skickar
 * platsen vidare till köpsteget (kopstegHref), så att köpet kan räknas per
 * exponering.
 *
 * Har användaren ett betalt spår som inte räcker (befintlig kund med
 * CV-paketet eller Träningspaketet) renderas FelSpar i stället.
 */

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { capture, type BetalvaggPlats } from '@/lib/analytics/events'
import { getPaywallCopy, planForPaywall, PAKETRADER, VARIANT_FEATURE, type PaywallVariant } from './paywall-copy'
import { scopeHasFeature, type Feature, type Scope } from '@/lib/access/features'
import { SALD_PLAN, saljbarPlan, type PlanKey } from '@/lib/plans/plans'
import { kopstegHref, PRISER_HREF } from '@/lib/onboarding/steps'
import { KNAPP_PRIMAR, KNAPPRAD, LANK } from '@/components/shell/knappar'
import FelSpar from './FelSpar'

export { PRISER_HREF }

/** Platsen för mätningen, per variant (spec-rummen avsnitt 7). */
export const PLATS_FOR_VARIANT: Record<PaywallVariant, BetalvaggPlats> = {
  mall: 'mall',
  testniva: 'testniva',
  analys: 'analys',
  'analys-omkorning': 'analys',
  nedladdning: 'nedladdning',
  'cv-export': 'cv_export',
  jobbtraffar: 'jobbtraffar',
  chatt: 'chatt',
  historik: 'historik',
  linkedin: 'linkedin',
  'bli-upptackt': 'bli_upptackt',
  kvot: 'kvot',
  'test-tak': 'test_tak',
  nedgraderad: 'nedgraderad',
  'cv-antal': 'cv_antal',
  'af-rapport': 'af_rapport',
}

/** Sekundära texter som betyder prissidan, inte en handling i vyn. */
function arPrisText(text: string): boolean {
  return text === PAKETRADER.jamfor || text === 'Se priset'
}

export interface PaywallCardProps {
  variant: PaywallVariant
  /**
   * Funktionen som spärrade. Utelämnas den härleds den ur varianten, så
   * befintliga anropare fortsätter fungera.
   */
  feature?: Feature
  /** Användarens betalda paket, eller null på gratisnivån. */
  scope?: Scope | null
  /** Spåret hon valde i onboardingen. Styr inte längre förslaget. */
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
   * Generisk sekundär handling. Ersätter länken till prissidan med en knapp
   * som bär variantens egen text ("Välj bland de 3 fria", "Inte nu").
   */
  onSecondary?: () => void
  /**
   * Mellanskillnaden i kronor för en befintlig spårkund. Skickas vidare till
   * FelSpar; gratiskonton ser den aldrig.
   */
  priceDeltaKr?: number | null
  /**
   * Utan panel: bara text och handling. För de vyer som redan har en egen
   * ram runt betalväggen.
   */
  bare?: boolean
  /** Platsen för betalvagg_visad. Utelämnas den följer den varianten. */
  plats?: BetalvaggPlats
  /** Dagar kvar till provdatum, för mätningen. null där det saknas. */
  dagarKvar?: number | null
  className?: string
}

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
  plats,
  dagarKvar = null,
  className,
}: PaywallCardProps) {
  const [reminder, setReminder] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [copied, setCopied] = useState(false)
  const pathname = usePathname()
  const surface = pathname ?? ''

  const sparradFeature = feature ?? VARIANT_FEATURE[variant] ?? null
  const suggestedPlan = planForPaywall(variant, { feature: sparradFeature ?? undefined, track })
  const knappPlan: PlanKey = saljbarPlan(suggestedPlan ?? SALD_PLAN)
  const platsen: BetalvaggPlats = plats ?? PLATS_FOR_VARIANT[variant]

  // Har hon ett betalt spår som inte täcker funktionen är det fel spår i
  // taket. FelSpar äger den ytan och skjuter sina egna händelser.
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
      suggestedPlan: knappPlan,
      price_shown: true,
    })
    capture('betalvagg_visad', { plats: platsen, dagar_kvar: dagarKvar })
    // Var fel spår tar i taket. Skjuts en gång per montering, samma som ovan.
    if (sparradFeature) {
      capture('feature_blocked', { feature: sparradFeature, scope, surface })
    }
  }, [isPremium, felSpar, variant, surface, sparradFeature, knappPlan, scope, platsen, dagarKvar])

  const ctaClicked = (cta: 'primary' | 'secondary') =>
    capture('paywall_cta_clicked', { variant, surface, cta, plan: knappPlan, plats: platsen })

  // Kontot har redan funktionen. Ingen betalvägg.
  if (isPremium) return null

  if (felSpar && sparradFeature) {
    return (
      <FelSpar
        feature={sparradFeature}
        scope={scope as Exclude<Scope, never>}
        priceDeltaKr={priceDeltaKr ?? null}
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
    plan: knappPlan,
  })

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

  /** Knappen har namngett paket och pris, så den går direkt till köpsteget. */
  const primarHandling = () => {
    ctaClicked('primary')
    window.location.href = kopstegHref(copy.plan ?? knappPlan, platsen)
  }

  const lank = `${LANK} inline-flex min-h-11 items-center justify-center self-center`

  // Länken till prissidan: "Se priset" där copyn säger det, annars "Se vad
  // som ingår". En variants egen sekundära text ("Inte nu", "Kör
  // grundnivån igen") hör till en knapp med onSecondary, aldrig till länken.
  const prisLank = (
    <Link href={PRISER_HREF} className={lank} onClick={() => ctaClicked('secondary')}>
      {copy.secondary === 'Se priset' ? copy.secondary : PAKETRADER.jamfor}
    </Link>
  )

  const secondary = (() => {
    switch (variant) {
      case 'nedladdning':
        return (
          <button
            type="button"
            className={lank}
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
        if (!quota) return prisLank
        if (reminder === 'saved')
          return (
            <span className="inline-flex min-h-11 items-center justify-center gap-1.5 text-sm font-medium text-positiv">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-6" /></svg>
              Vi mejlar dig när den öppnar
            </span>
          )
        return (
          <button
            type="button"
            className={lank}
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
            className={lank}
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
        // gammalt CV") vinner över länken till prissidan. Säger copyn "Se
        // vad som ingår" eller "Se priset" är det länken ändå.
        if (onSecondary && !arPrisText(copy.secondary))
          return (
            <button
              type="button"
              className={lank}
              onClick={() => {
                ctaClicked('secondary')
                onSecondary()
              }}
            >
              {copy.secondary}
            </button>
          )
        return prisLank
    }
  })()

  const innehall = (
    <>
      <h3 className="text-kort text-ink-1">{copy.title}</h3>
      <p className="mt-1 text-sm leading-[22px] text-ink-2">{copy.body}</p>
      {copy.prisrad ? <p className="mt-2 text-sm font-medium text-ink-1">{copy.prisrad}</p> : null}
      <div className={KNAPPRAD}>
        <button type="button" onClick={primarHandling} className={KNAPP_PRIMAR}>
          {copy.primary}
        </button>
        {secondary}
      </div>
      {reminder === 'error' ? (
        <p className="mt-1 text-meta text-fel">Kunde inte spara påminnelsen. Försök igen.</p>
      ) : null}
    </>
  )

  // Utan panel: vyn har redan en egen ram, och två ramar i varandra läser
  // som en bugg.
  if (bare) return <div className={className}>{innehall}</div>

  return (
    <section
      className={`rounded-2xl border border-kant bg-papper p-4 ${className ?? ''}`}
      aria-label={copy.title}
    >
      {innehall}
    </section>
  )
}
