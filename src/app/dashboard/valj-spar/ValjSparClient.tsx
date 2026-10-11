'use client'

/**
 * Köpsteget (spec-rummen våg 5, copy-premium avsnitt 3).
 *
 * Bara Jobbcoach Premium, 149 kr i månaden, säljs, så steget har inget
 * spårval och inget längdval längre. Det visar Premium direkt:
 *
 *   kop        Rubriken "Jobbcoach Premium" (fulla namnet en gång), prisraden
 *              i kort form, vad som ingår, villkorsraderna, första steget,
 *              ångerrättssamtycket (lagkrav, oförändrat) och knappen "Till
 *              betalning, 149 kr". Foten har "Börja gratis i stället".
 *   gratisval  gratisanvändarens fråga "Vad vill du börja med?", utan
 *              priser. Nås bara via Börja gratis när inget spår är sparat,
 *              och aldrig för den som hoppade över samma fråga i
 *              registreringen (utanGratisfraga).
 *
 * Platsen (?plats=) följer med till create-plan-session som source, så att
 * köpet kan räknas per betalvägg (spec-rummen avsnitt 7). Ett 400 med
 * saljs: false (gammal klient, osålt paket) visas som ett fel, aldrig som
 * klart.
 */

import { LANK } from '@/components/shell/knappar'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import FlowShell from '@/components/shell/FlowShell'
import ChoiceCard from '@/components/shell/ChoiceCard'
import FlowError from '@/components/shell/FlowError'
import { Check } from '@/components/illustrations/RumIkoner'
import { IkonCv, IkonAnalys, IkonHem } from '@/components/illustrations/Ikoner'
import { IlluScenCv } from '@/components/illustrations/PriserScener'
import { capture } from '@/lib/analytics/events'
import { SPARVAL_GRATIS, type Track } from '@/lib/onboarding/program'
import { PLAN_BY_KEY, SALD_PLAN, type PlanKey } from '@/lib/plans/plans'
import {
  KOPSTEG,
  PAKET_KORT,
  SPARVAL,
  nastaDragningText,
  samtyckeVidKop,
} from '@/components/pricing/paket-copy'

type Steg = 'kop' | 'gratisval'

/**
 * Köpets ursprung som source i sessionens metadata. Prissidan,
 * registreringen och prenumerationssidan står för sig själva, allt annat är en betalvägg
 * ("betalvagg:matning"), och utan plats är det köpsteget självt.
 */
export function kopSource(plats: string | null | undefined): string {
  if (!plats) return 'onboarding_paket'
  if (plats === 'priser' || plats === 'registrering' || plats === 'prenumeration') return plats
  return `betalvagg:${plats}`
}

export interface ValjSparClientProps {
  /** Spåret som redan är sparat i profilen, om något. */
  initialTrack: Track | null
  /** Paketet som säljs. Sidan normaliserar ?paket= med saljbarPlan. */
  plan?: PlanKey
  /** ?plats=, betalväggen eller ytan köpet startade på. */
  plats?: string | null
  /**
   * Hon hoppade över "Vad vill du börja med?" i registreringen. Börja gratis
   * utan sparat spår går då direkt till hemskärmen: frågan ställs högst en
   * gång (QA 2026-09-24, iakttagelse 2).
   */
  utanGratisfraga?: boolean
}

export default function ValjSparClient({
  initialTrack,
  plan = SALD_PLAN,
  plats = null,
  utanGratisfraga = false,
}: ValjSparClientProps) {
  const router = useRouter()
  const [steg, setSteg] = useState<Steg>('kop')
  const [gratisVal, setGratisVal] = useState<'cv' | 'tester' | 'ingen' | null>(null)
  const [samtycke, setSamtycke] = useState(false)
  const [busy, setBusy] = useState(false)
  const [fel, setFel] = useState<string | null>(null)
  const engangs = PLAN_BY_KEY[plan].mode === 'payment'

  // pricing_viewed, paywall_shown och purchase_step_viewed en gång per
  // montering. purchase_step_viewed är trattens fjärde steg.
  const sagt = useRef(false)
  useEffect(() => {
    if (sagt.current) return
    sagt.current = true
    capture('pricing_viewed', { trigger: 'cta' })
    capture('paywall_shown', { variant: 'onboarding_paket', surface: '/dashboard/valj-spar' })
    capture('purchase_step_viewed', { plan, surface: '/dashboard/valj-spar' })
  }, [plan])

  // consent_checked första gången rutan kryssas i. Skiljer "läste och
  // tvekade vid kryssrutan" från "tryckte Till betalning och kom inte fram".
  const samtyckeMatt = useRef(false)
  const bockaSamtycke = useCallback(
    (checked: boolean) => {
      setSamtycke(checked)
      if (checked && !samtyckeMatt.current) {
        samtyckeMatt.current = true
        capture('consent_checked', { plan })
      }
    },
    [plan]
  )

  const sparaSpar = useCallback(async (valt: Track | null, intent: 'purchase' | 'free') => {
    try {
      const res = await fetch('/api/onboarding/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track: valt }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Kunde inte spara valet')

      if (valt) capture('track_selected', { track: valt, surface: 'onboarding', intent })
      const innan = (json?.previousTrack as Track | null) ?? null
      if (innan && valt && innan !== valt) {
        capture('track_changed', { from: innan, to: valt, surface: 'onboarding' })
      }
      capture('onboarding_step_completed', { track: valt, step: 'track_choice', index: 0 })
      return true
    } catch (error: any) {
      setFel(error?.message || 'Valet kunde inte sparas. Försök igen.')
      return false
    }
  }, [])

  /* ------------------------------------------------------- Börja gratis */

  const borjaGratis = useCallback(async () => {
    if (busy) return
    if (!initialTrack && !utanGratisfraga) {
      setSteg('gratisval')
      return
    }
    setBusy(true)
    setFel(null)
    const ok = await sparaSpar(initialTrack, 'free')
    setBusy(false)
    if (ok) router.push('/dashboard')
  }, [initialTrack, busy, utanGratisfraga, sparaSpar, router])

  const avslutaGratis = useCallback(async () => {
    if (!gratisVal || busy) return
    setBusy(true)
    setFel(null)
    const valt: Track | null = gratisVal === 'ingen' ? null : gratisVal
    const ok = await sparaSpar(valt, 'free')
    setBusy(false)
    if (ok) router.push('/dashboard')
  }, [gratisVal, busy, sparaSpar, router])

  /* ------------------------------------------------------- till kassan */

  const tillKassan = useCallback(async () => {
    if (!samtycke || busy) return
    setBusy(true)
    setFel(null)
    capture('paywall_cta_clicked', {
      variant: 'onboarding_paket',
      surface: '/dashboard/valj-spar',
      plan,
      cta: 'primary',
    })
    // Premium ger allt, så spåret blir allt. Annars säger profilen CV och
    // kvittot Premium, och hemskärmen ordnas efter fel spår.
    if (initialTrack !== 'allt') {
      const ok = await sparaSpar('allt', 'purchase')
      if (!ok) {
        setBusy(false)
        return
      }
    }
    try {
      const res = await fetch('/api/stripe/create-plan-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Rutten läser fältet `plan`. consent är ångerrättssamtycket:
        // rutten svarar 400 utan det, och kryssrutan spärrar redan knappen,
        // så fältet är alltid true här. Det är beviskedjan: kryssrutan blir
        // ett fält i kroppen som blir metadata på sessionen.
        body: JSON.stringify({ plan, source: kopSource(plats), consent: samtycke }),
      })
      const json = await res.json().catch(() => ({}))
      // 400 med saljs: false betyder att paketet inte säljs. Det är ett fel
      // med en förklaring, aldrig ett tyst "klart".
      if (res.status === 400 && json?.saljs === false) throw new Error(KOPSTEG.saljsInte)
      if (res.status === 409) throw new Error(json?.error || KOPSTEG.redan)
      if (!res.ok || !json?.url) throw new Error(json?.error || KOPSTEG.felKassa)
      // Omdirigeringen till Stripe är trattens femte steg. Skjuts precis
      // före hoppet: efter det finns ingen sida kvar som kan skicka något.
      capture('checkout_started', { plan, length: PLAN_BY_KEY[plan].length })
      window.location.href = json.url as string
    } catch (error: any) {
      setBusy(false)
      setFel(error?.message || KOPSTEG.felKassa)
    }
  }, [samtycke, busy, plan, plats, initialTrack, sparaSpar])

  const felBanner = fel ? (
    <FlowError message={fel} onRetry={() => setFel(null)} retryLabel="Försök igen" />
  ) : undefined

  /* ============================================================ gratisval */

  if (steg === 'gratisval') {
    return (
      <FlowShell
        title="Kom igång"
        step={1}
        totalSteps={1}
        onBack={() => setSteg('kop')}
        onExit={() => router.push('/dashboard')}
        primaryLabel={SPARVAL_GRATIS.primar}
        onPrimary={avslutaGratis}
        primaryDisabled={!gratisVal}
        primaryBlockedReason="Välj vad du vill börja med."
        primaryBusy={busy}
        busyLabel="Sparar"
        banner={felBanner}
      >
        <p className="text-steg uppercase text-ink-3">{SPARVAL_GRATIS.steg}</p>
        <h2 className="mt-1 text-fraga text-ink-1">{SPARVAL_GRATIS.fraga}</h2>
        <p className="mt-2 text-sm leading-[22px] text-ink-2">{SPARVAL_GRATIS.ingress}</p>

        <div role="radiogroup" aria-label={SPARVAL_GRATIS.fraga} className="mt-5 space-y-3">
          <ChoiceCard
            selected={gratisVal === 'cv'}
            onSelect={() => setGratisVal('cv')}
            title={SPARVAL_GRATIS.kort.cv.titel}
            description={SPARVAL_GRATIS.kort.cv.text}
            leading={<IkonCv />}
          />
          <ChoiceCard
            selected={gratisVal === 'tester'}
            onSelect={() => setGratisVal('tester')}
            title={SPARVAL_GRATIS.kort.tester.titel}
            description={SPARVAL_GRATIS.kort.tester.text}
            leading={<IkonAnalys />}
          />
          <ChoiceCard
            selected={gratisVal === 'ingen'}
            onSelect={() => setGratisVal('ingen')}
            title={SPARVAL_GRATIS.kort.ingen.titel}
            description={SPARVAL_GRATIS.kort.ingen.text}
            leading={<IkonHem />}
          />
        </div>
      </FlowShell>
    )
  }

  /* ============================================================ köpsteget */

  const datum = nastaDragningText(plan)

  return (
    <FlowShell
      title="Kom igång"
      step={1}
      totalSteps={1}
      onExit={() => router.push('/dashboard')}
      primaryLabel={KOPSTEG.primar(plan)}
      onPrimary={tillKassan}
      primaryDisabled={!samtycke}
      primaryBlockedReason={KOPSTEG.samtyckeSparr}
      primaryBusy={busy}
      busyLabel={KOPSTEG.busy}
      banner={felBanner}
      footerSecondary={
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <button type="button" onClick={borjaGratis} disabled={busy} className={`${LANK} min-h-11 disabled:opacity-50`}>
            {SPARVAL.sekundar}
          </button>
          <p className="text-center text-meta text-ink-3 sm:text-left">{KOPSTEG.fotnot}</p>
        </div>
      }
    >
      <h2 className="text-kort-t text-ink-1">{KOPSTEG.rubrik(plan)}</h2>
      <p className="mt-1 text-sm leading-[21px] text-ink-2">{KOPSTEG.prisrad(plan)}</p>
      <p className="mt-0.5 text-meta text-ink-3">{KOPSTEG.under}</p>

      <section
        className="mt-4 rounded-2xl border border-koppar bg-papper p-4 shadow-[inset_0_0_0_1px_var(--koppar)]"
        aria-label={KOPSTEG.farEtikett}
      >
        <p className="text-ey text-ink-3">{KOPSTEG.farEtikett}</p>
        <ul className="mt-2 grid gap-2">
          {PAKET_KORT.allt.ingar.map((rad) => (
            <li key={rad} className="flex items-start gap-2.5 text-sm leading-5 text-ink-1">
              <Check className="mt-px h-[18px] w-[18px] shrink-0 text-ton-ink" strokeWidth={2} aria-hidden="true" />
              <span>{rad}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 grid gap-1 border-t border-kant pt-3 text-[13px]">
          <div className="flex justify-between gap-3">
            <dt className="text-ink-3">{engangs ? KOPSTEG.villkor.galler : KOPSTEG.villkor.fornyas}</dt>
            <dd className="text-right font-medium text-ink-1">{KOPSTEG.fornyasVarde(plan, datum)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink-3">{KOPSTEG.villkor.uppsagning}</dt>
            <dd className="text-right font-medium text-ink-1">{KOPSTEG.villkor.uppsagningVarde}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink-3">{KOPSTEG.villkor.angerratt}</dt>
            <dd className="text-right font-medium text-ink-1">{KOPSTEG.villkor.angerrattVarde}</dd>
          </div>
        </dl>

        <div className="mt-3 flex items-center gap-3 rounded-lg bg-papper-2 p-3 text-ink-1">
          <IlluScenCv className="h-11 w-11 shrink-0" />
          <div>
            <p className="text-sm font-semibold leading-[19px] text-ink-1">{KOPSTEG.forstaSteg.rubrik}</p>
            <p className="text-meta text-ink-3">{KOPSTEG.forstaSteg.text}</p>
          </div>
        </div>
      </section>

      <label className="mt-4 flex min-h-11 cursor-pointer items-start gap-3 text-[13px] leading-[19px] text-ink-2">
        <input
          type="checkbox"
          checked={samtycke}
          onChange={(e) => bockaSamtycke(e.target.checked)}
          // accent-color, inte text-*: webbläsaren ritar rutans fyllning
          // själv och den var annars systemblå.
          style={{ accentColor: 'var(--ink-1)' }}
          className="mt-px h-5 w-5 shrink-0 cursor-pointer rounded border-kant-stark focus:ring-1 focus:ring-ink-1"
        />
        <span>{samtyckeVidKop(plan)}</span>
      </label>
    </FlowShell>
  )
}
