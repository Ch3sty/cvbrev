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
 * CV-paketet eller Träningspaketet) är väggen densamma, men knappen öppnar
 * ingen ny kassa. Den går till prenumerationssidan, där priset byts på
 * samma prenumeration (spec-rummen 17.5).
 */

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { capture, type BetalvaggPlats } from '@/lib/analytics/events'
import { getPaywallCopy, planForPaywall, PAKETRADER, VARIANT_FEATURE, type PaywallVariant } from './paywall-copy'
import { scopeHasFeature, type Feature, type Scope } from '@/lib/access/features'
import { SALD_PLAN, saljbarPlan, type PlanKey } from '@/lib/plans/plans'
import { kopstegHref, PRISER_HREF } from '@/lib/onboarding/steps'
import { PREMIUM_HREF } from '@/lib/premium/premiumEntry'
import { KNAPP_PRIMAR, KNAPPRAD, LANK } from '@/components/shell/knappar'
import { useKampanjPris } from '@/components/kampanj/KampanjPrisKontext'
import Bankbredd from '@/components/publikt/Bankbredd'
import type { TestTyp } from '@/components/illustrations/TestGlyfer'
import { PASS_COPY } from '@/lib/traning/pass-copy'
import { SparrArk, SparrFot, SparrVagg, type SparrData } from './TestSparr'

export { PRISER_HREF }

/** Platsen för mätningen, per variant (spec-rummen avsnitt 7). */
export const PLATS_FOR_VARIANT: Record<PaywallVariant, BetalvaggPlats> = {
  mall: 'mall',
  testniva: 'testniva',
  analys: 'analys',
  'analys-omkorning': 'analys',
  nedladdning: 'nedladdning',
  'cv-export': 'cv_export',
  'cv-export-word': 'cv_export_word',
  jobbtraffar: 'jobbtraffar',
  chatt: 'chatt',
  historik: 'historik',
  linkedin: 'linkedin',
  kvot: 'kvot',
  'test-tak': 'test_tak',
  nedgraderad: 'nedgraderad',
  'cv-antal': 'cv_antal',
  'af-rapport': 'af_rapport',
}

/**
 * Prisraden på två rader (ägarens granskning 2026-11-15): priset först,
 * "Säg upp när du vill." på egen rad, också med kampanjpriset. Mellanslaget
 * efter radbrytningen syns inte men håller texten hel för skärmläsare och
 * sökning. En rad utan andra mening (LinkedIn-väggens korta form) står kvar.
 */
function prisradPaTvaRader(prisrad: string): React.ReactNode {
  const i = prisrad.indexOf('. ')
  if (i < 0) return prisrad
  return (
    <>
      {prisrad.slice(0, i + 1)}
      <br />
      {' '}
      {prisrad.slice(i + 2)}
    </>
  )
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
   * Utan panel: bara text och handling. För de vyer som redan har en egen
   * ram runt betalväggen.
   */
  bare?: boolean
  /** Platsen för betalvagg_visad. Utelämnas den följer den varianten. */
  plats?: BetalvaggPlats
  /** Dagar kvar till provdatum, för mätningen. null där det saknas. */
  dagarKvar?: number | null
  /**
   * Testtypen väggen gäller, variant testniva och test-tak: markeras i
   * Bankbredd mellan brödtext och prisrad (docs/design/bankbredd-2026-11-19.md
   * avsnitt 4). Utan typ, eller för personlighetstestet som saknar bank, står
   * alla åtta staplar i samma vikt.
   */
  testTyp?: TestTyp
  /**
   * Mallen väggen gäller (mallflödet, affärsgranskningen L1): med i
   * paywall_shown och paywall_cta_clicked, och köpknappen bär den och
   * köpreturen till kassan.
   */
  mall?: { id: string; tier: 'free' | 'premium'; retur?: string | null } | null
  /**
   * Gratisnivåns grundnivåtest kvar i dag (Gratislage.grundKvarIdag), variant
   * testniva. Är det 0 erbjuder kortet inget nytt grundtest: det sekundära
   * blir länken "Se vad som ingår" (textdäcket F4) och köpknappen står kvar.
   * Utelämnat (okänt) gäller copyns sekundära som förut.
   */
  grundKvarIdag?: number | null
  /**
   * Testväggarna i sessionsramen (plan-testflode-2026-11-20 avsnitt 8 och 9,
   * etapp 7): testtypen och ramens läge följer med i betalvagg_visad,
   * paywall_cta_clicked (och test_kind i paywall_shown), så att väggen kan
   * läsas per typ och läge. Övriga egenskaper är oförändrade.
   */
  matning?: { test_kind: string; lage: string } | null
  /**
   * Startskärmens delning på mobil (avsnitt 9.2: knappen i fotens position).
   * 'kort': allt utom köpknappen på mobil (knappen står kvar från lg).
   * 'fot': bara köpknappen, utan mätning av visningen (kortet mäter).
   * Utelämnad: hela kortet som förut.
   */
  del?: 'kort' | 'fot'
  className?: string
  /**
   * Omgång 3 (steg 3b): spärrarnas nya utseende i testflödet (Sparr-kvot på
   * startskärmen, Sparr-test i arket). Utelämnat: testflödets väggar (med
   * `matning`, eller variant test-tak) får det nya, alla andra (CV, brev,
   * mallar) ritas som förut. 'kort' tvingar det tidigare kortet.
   */
  utseende?: 'kort' | 'test'
  /** Hennes siffror i den nya spärren (dagens resultat, nivån, mönstret, provet). Saknas en faller raden bort. */
  sparrData?: SparrData | null
  /** Arkets kryss i det nya utseendet (GraValSheet). */
  onStang?: (() => void) | null
}

/** Sant när väggen ritas i omgång 3:s utseende för testflödet. */
export function arTestSparr(p: Pick<PaywallCardProps, 'utseende' | 'matning' | 'variant' | 'testTyp'>): boolean {
  if (p.utseende === 'kort') return false
  if (p.testTyp === 'personlighet') return false
  if (p.utseende === 'test') return true
  return p.matning != null || p.variant === 'test-tak'
}

function PaywallCard({
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
  bare,
  plats,
  dagarKvar = null,
  testTyp,
  mall = null,
  grundKvarIdag = null,
  matning = null,
  del,
  className,
  utseende,
  sparrData = null,
  onStang = null,
}: PaywallCardProps) {
  const [reminder, setReminder] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [copied, setCopied] = useState(false)
  const pathname = usePathname()
  const surface = pathname ?? ''
  // Kampanjpriset (K1): bara när servern sett att kontot aldrig haft Premium.
  const kampanj = useKampanjPris()
  const kampanjNyckel = kampanj?.nyckel ?? null

  const sparradFeature = feature ?? VARIANT_FEATURE[variant] ?? null
  const suggestedPlan = planForPaywall(variant, { feature: sparradFeature ?? undefined, track })
  const knappPlan: PlanKey = saljbarPlan(suggestedPlan ?? SALD_PLAN)
  const platsen: BetalvaggPlats = plats ?? PLATS_FOR_VARIANT[variant]

  // Har hon ett betalt spår (CV-paketet eller Träningspaketet) som inte
  // täcker funktionen har hon en prenumeration att byta pris på. Väggen är
  // densamma, knappen går till prenumerationssidan i stället för köpsteget.
  const sparKund =
    !isPremium &&
    (scope === 'cv' || scope === 'tester') &&
    (sparradFeature === null || !scopeHasFeature(scope, sparradFeature))

  // En gång per montering, aldrig per omritning. Refen överlever både
  // omritningar och StrictMode:s dubbelkörning i utvecklingsläge.
  const shownRef = useRef(false)
  useEffect(() => {
    if (isPremium || shownRef.current || del === 'fot') return
    shownRef.current = true
    capture('paywall_shown', {
      variant,
      surface,
      ...(sparradFeature ? { feature: sparradFeature } : {}),
      suggestedPlan: knappPlan,
      price_shown: true,
      kampanj: kampanjNyckel,
      ...(mall ? { template: mall.id, tier: mall.tier } : {}),
      ...(matning ? { test_kind: matning.test_kind } : {}),
    })
    capture('betalvagg_visad', { plats: platsen, dagar_kvar: dagarKvar, ...(matning ? { test_kind: matning.test_kind, lage: matning.lage } : {}) })
    // Var fel spår tar i taket. Skjuts en gång per montering, samma som ovan.
    if (sparradFeature) {
      capture('feature_blocked', { feature: sparradFeature, scope, surface })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPremium, variant, surface, sparradFeature, knappPlan, scope, platsen, dagarKvar, kampanjNyckel, del])

  const ctaClicked = (cta: 'primary' | 'secondary') =>
    capture('paywall_cta_clicked', {
      variant,
      surface,
      cta,
      plan: knappPlan,
      plats: platsen,
      kampanj: kampanjNyckel,
      ...(mall ? { template: mall.id, tier: mall.tier } : {}),
      ...(matning ? { test_kind: matning.test_kind, lage: matning.lage } : {}),
    })

  // Kontot har redan funktionen. Ingen betalvägg.
  if (isPremium) return null


  const copy = getPaywallCopy(variant, {
    findingsTotal,
    hiddenCount,
    quotaFeature: quota?.feature,
    track,
    plan: knappPlan,
    plats: platsen,
    grundKvarIdag,
    // En spårkund har redan en prenumeration och får ingen ny kassa, alltså
    // inget kampanjpris heller.
    kampanj: sparKund ? null : kampanj,
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

  /**
   * Knappen har namngett paket och pris, så den går direkt till köpsteget.
   * En spårkund har redan en prenumeration och får ingen ny kassa: bytet
   * till Premium görs på prenumerationssidan (spec-rummen 17.5).
   */
  const primarHandling = () => {
    ctaClicked('primary')
    window.location.href = sparKund
      ? PREMIUM_HREF
      : kopstegHref(copy.plan ?? knappPlan, platsen, mall ? { mall: mall.id, retur: mall.retur ?? null } : undefined)
  }

  const lank = `${LANK} inline-flex min-h-11 items-center justify-center self-center`

  // Länken till prissidan: "Se priset" där copyn säger det, annars "Se vad
  // som ingår". En variants egen sekundära text ("Inte nu", "Välj bland de
  // 3 fria") hör till en knapp med onSecondary, aldrig till länken.
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
        // Byggarens förslag har inget påminnelsemejl (det skulle säga fel sak).
        if (!quota || quota.feature === 'cv_bygg') return prisLank
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
        // Är dagens grundnivåtest gjort säger copyn "Se vad som ingår" i
        // stället för ett nytt grundtest (F4), och kvotlåsets rubrik säger
        // "Dagens grundnivåtest är gjort" (T11), så ingen statusrad behövs.
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

  // Omgång 3: testflödets spärrar i det nya utseendet. Samma texter, pris,
  // köp, länkar, påminnelse och mätning som kortet nedan; bara ritningen byts.
  if (arTestSparr({ utseende, matning, variant, testTyp })) {
    const slag: 'kvot' | 'premium' = variant === 'test-tak' || platsen === 'kvot' ? 'kvot' : 'premium'
    const kanPaminna = Boolean(quota && quota.feature !== 'cv_bygg' && (variant === 'kvot' || variant === 'test-tak'))
    const paminn = (fot: boolean) =>
      !kanPaminna ? null : reminder === 'saved' ? (
        <span className={`inline-flex min-h-11 items-center gap-1.5 text-sm font-medium ${fot ? 'text-positiv' : 'text-vagg-ink'}`} data-sparr-paminn="sparad">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-6" /></svg>
          Vi mejlar dig när den öppnar
        </span>
      ) : (
        <button
          type="button"
          className={fot ? `${LANK} inline-flex min-h-11 items-center font-semibold` : 'res-tyst'}
          onClick={() => {
            ctaClicked('secondary')
            void remind()
          }}
          disabled={reminder === 'saving'}
          data-sparr-paminn=""
        >
          {reminder === 'saving' ? 'Sparar' : fot ? 'Påminn mig' : 'Påminn mig i morgon'}
        </button>
      )
    const kopEl = (klass: string, fot = false) => (
      <button type="button" onClick={primarHandling} className={`${KNAPP_PRIMAR} res-stor w-full ${klass}`} data-sparr-kop data-paywall-fot={fot ? '' : undefined}>
        {copy.primary}
      </button>
    )
    if (del === 'fot') return <SparrFot kop={kopEl('', true)} slag={slag} paminn={paminn(true)} />
    // Delad på startskärmen: knappen står i foten på telefon, i arket från lg.
    const kop = kopEl(del === 'kort' ? 'hidden lg:inline-flex' : '')
    const felrad = reminder === 'error' ? <p className="mt-1 text-meta text-fel">Kunde inte spara påminnelsen. Försök igen.</p> : null
    // Kvotspärren: påminnelsen står i remsan, länken till prissidan under knappen.
    const sekundar = variant === 'test-tak' || variant === 'kvot' ? prisLank : secondary
    const prisrad = copy.prisrad ? prisradPaTvaRader(copy.prisrad) : null
    const vy = {
      slag,
      plats: platsen,
      testTyp,
      data: sparrData ?? {},
      dagarKvar,
      titel: copy.title,
      body: copy.body,
      prisrad,
      kop,
      sekundar,
      felrad,
    }
    if (bare) return <div className={className}><SparrArk {...vy} onStang={onStang} fotrad={PASS_COPY.betalvagg.text} /></div>
    return <div className={className}><SparrVagg {...vy} paminn={paminn(false)} del={del === 'kort' ? 'kort' : undefined} /></div>
  }

  // Fotens knapp (startskärmen på mobil): samma knapp och handling, inget annat.
  if (del === 'fot') {
    return (
      <button type="button" onClick={primarHandling} className={`${KNAPP_PRIMAR} ${className ?? ''}`} data-paywall-fot>
        {copy.primary}
      </button>
    )
  }

  const innehall = (
    <>
      <h3 className="text-kort-t text-ink-1">{copy.title}</h3>
      <p className="mt-1 text-sm leading-[22px] text-ink-2">{copy.body}</p>
      {variant === 'testniva' || variant === 'test-tak' ? (
        <div className="mt-3">
          <Bankbredd form="rad" yta="ljus" markerad={testTyp && testTyp !== 'personlighet' ? testTyp : undefined} />
        </div>
      ) : null}
      {copy.prisrad ? <p className="mt-2 text-sm font-medium text-ink-1">{prisradPaTvaRader(copy.prisrad)}</p> : null}
      <div className={KNAPPRAD}>
        <button type="button" onClick={primarHandling} className={del === 'kort' ? `${KNAPP_PRIMAR} hidden lg:inline-flex` : KNAPP_PRIMAR}>
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

/** Startskärmen känner igen väggar som kan dela sig i kort och fot (Startskarm, del). */
PaywallCard.fotDel = true as const
/** Omgång 3: väggar som fyller startskärmens vägg i det nya utseendet (Startskarm). */
PaywallCard.helVagg = (p: PaywallCardProps) => arTestSparr(p)

export default PaywallCard
