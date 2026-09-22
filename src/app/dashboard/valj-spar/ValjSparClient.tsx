'use client'

/**
 * Spårvalet i FlowShell, tre skärmar på samma adress.
 *
 *   1.1   frågan, tre valkort, Börja gratis som riktig sekundärknapp
 *   1.2   paketet och villkoren, med längdval när spåret är Allt
 *   1.1b  gratisanvändarens spårfråga, utan priser
 *
 * Skärmarna är steg i ett flöde, inte tre sidor: tillbaka går till föregående
 * steg, inte ur appen, och framstegslinjen är trådens betydelse här också.
 *
 * Skisser, komponentkarta och acceptanskriterier: Fas 2A skärm 1.1 till 1.3,
 * Fas 2D del 1. Strängarna ligger i src/lib/onboarding/program.ts med sina
 * T-id, så copy och kod inte kan glida isär.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import FlowShell from '@/components/shell/FlowShell'
import ChoiceCard from '@/components/shell/ChoiceCard'
import MarginPlate from '@/components/shell/MarginPlate'
import Segment from '@/components/shell/Segment'
import StatusRow from '@/components/shell/StatusRow'
import FlowError from '@/components/shell/FlowError'
import { IkonCv, IkonAnalys, IkonHem } from '@/components/illustrations/Ikoner'
import { IlluPlattaPremium } from '@/components/illustrations/TradenScener'
import { capture } from '@/lib/analytics/events'
import {
  SPARVAL,
  SPARVAL_GRATIS,
  PAKETSKARM,
  PAKET,
  ALLT_LANGDER,
  paketForTrack,
  fornyelserad,
  type PlanKeyPaket,
  type Track,
} from '@/lib/onboarding/program'

type Steg = 'val' | 'paket' | 'gratisval'

/** Nästa dragning, svensk tid, i formen "3 oktober". */
function nastaDragning(paket: { key: PlanKeyPaket }): string {
  const dagar = paket.key === 'all_month' ? 30 : paket.key === 'all_quarter' ? 90 : 7
  const d = new Date(Date.now() + dagar * 24 * 60 * 60 * 1000)
  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Stockholm',
  }).format(d)
}

/** Sluttid för Allt-dagen: klockslag, inte datum (avsnitt 8). */
function dygnSlutar(): string {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000)
  return new Intl.DateTimeFormat('sv-SE', {
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Stockholm',
  }).format(d)
}

export interface ValjSparClientProps {
  initialTrack: Track | null
  /** Paketet ur ?paket, om länken bar med sig ett. Förväljer även längden. */
  initialPlanKey?: PlanKeyPaket | null
  /**
   * Kontot har en löpande prenumeration. Dirigentens beslut D48b: dagläget är
   * då inaktivt i längdvalet, eftersom bytet nedåt vore en uppsägning plus ett
   * engångsköp och inte ett längdbyte.
   */
  harLopandePrenumeration?: boolean
}

export default function ValjSparClient({
  initialTrack,
  initialPlanKey = null,
  harLopandePrenumeration = false,
}: ValjSparClientProps) {
  const router = useRouter()
  const [steg, setSteg] = useState<Steg>('val')
  const [track, setTrack] = useState<Track | null>(initialTrack)
  const [gratisVal, setGratisVal] = useState<'cv' | 'tester' | 'ingen' | null>(null)
  // Förvald längd ur ?paket. Ett spärrat dagläge (D48b) får aldrig bli det
  // förvalda: då hade skärmen öppnat på ett val användaren inte kan köpa.
  const [langd, setLangd] = useState<PlanKeyPaket>(() => {
    if (!initialPlanKey || !initialPlanKey.startsWith('all_')) return 'all_week'
    if (initialPlanKey === 'all_day' && harLopandePrenumeration) return 'all_week'
    return initialPlanKey
  })
  const [samtycke, setSamtycke] = useState(false)
  const [busy, setBusy] = useState(false)
  const [fel, setFel] = useState<string | null>(null)

  const paket = paketForTrack(track ?? 'cv', langd)

  // pricing_viewed en gång per montering, aldrig per omritning.
  const sagt = useRef(false)
  useEffect(() => {
    if (sagt.current) return
    sagt.current = true
    capture('pricing_viewed', { trigger: 'cta' })
  }, [])

  // paywall_shown när paketskärmen visas, en gång per besök på steget.
  const visatPaket = useRef(false)
  useEffect(() => {
    if (steg !== 'paket' || visatPaket.current) return
    visatPaket.current = true
    capture('paywall_shown', { variant: 'onboarding_paket', surface: '/dashboard/valj-spar' })
  }, [steg])

  const sparaSpar = useCallback(
    async (valt: Track | null, intent: 'purchase' | 'free') => {
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
    },
    []
  )

  /* -------------------------------------------------- 1.1: vidare till paketet */

  const vidareTillPaket = useCallback(async () => {
    if (!track || busy) return
    setBusy(true)
    setFel(null)
    const ok = await sparaSpar(track, 'purchase')
    setBusy(false)
    if (ok) setSteg('paket')
  }, [track, busy, sparaSpar])

  /* ------------------------------------------- 1.1: Börja gratis, fullvärdigt val */

  const borjaGratis = useCallback(async () => {
    if (busy) return
    // Utan valt kort vet vi inte spåret än, och då ställer vi frågan utan
    // priser i stället för att gissa (Fas 2D skärm 1.1b).
    if (!track) {
      setSteg('gratisval')
      return
    }
    setBusy(true)
    setFel(null)
    const ok = await sparaSpar(track, 'free')
    setBusy(false)
    if (ok) router.push('/dashboard')
  }, [track, busy, sparaSpar, router])

  /* ------------------------------------------------------- 1.1b: gratisanvändaren */

  const avslutaGratis = useCallback(async () => {
    if (!gratisVal || busy) return
    setBusy(true)
    setFel(null)
    const valt: Track | null = gratisVal === 'ingen' ? null : gratisVal
    const ok = await sparaSpar(valt, 'free')
    setBusy(false)
    if (ok) router.push('/dashboard')
  }, [gratisVal, busy, sparaSpar, router])

  /* ------------------------------------------------------------ 1.2: till kassan */

  const tillKassan = useCallback(async () => {
    if (!samtycke || busy) return
    setBusy(true)
    setFel(null)
    capture('paywall_cta_clicked', {
      variant: 'onboarding_paket',
      surface: '/dashboard/valj-spar',
      cta: 'primary',
    })
    try {
      const res = await fetch('/api/stripe/create-plan-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Rutten läser fältet `plan`, inte `planKey`. Skickas fel namn
        // svarar den 400 "Okänt produktval" och köpet går aldrig igenom.
        body: JSON.stringify({ plan: paket.key, source: 'onboarding_paket' }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.url) throw new Error(json?.error || 'Kassan kunde inte öppnas')
      window.location.href = json.url as string
    } catch (error: any) {
      setBusy(false)
      setFel(error?.message || 'Kassan kunde inte öppnas just nu. Försök igen.')
    }
  }, [samtycke, busy, paket.key])

  const felBanner = fel ? (
    <FlowError message={fel} onRetry={() => setFel(null)} retryLabel="Försök igen" />
  ) : undefined

  /* ============================================================ skärm 1.1b */

  if (steg === 'gratisval') {
    return (
      <FlowShell
        title="Kom igång"
        step={2}
        totalSteps={2}
        onBack={() => setSteg('val')}
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

  /* ============================================================= skärm 1.2 */

  if (steg === 'paket') {
    const datum = paket.engangs ? dygnSlutar() : nastaDragning(paket)
    const visaLangd = track === 'allt'

    return (
      <FlowShell
        title="Paket"
        step={2}
        totalSteps={2}
        onBack={() => setSteg('val')}
        onExit={() => router.push('/dashboard')}
        primaryLabel={paket.knapp}
        onPrimary={tillKassan}
        primaryDisabled={!samtycke}
        primaryBlockedReason={PAKETSKARM.samtyckeSpärr}
        primaryBusy={busy}
        busyLabel="Öppnar kassan"
        banner={felBanner}
        footerSecondary={<p className="text-meta text-ink-3">{PAKETSKARM.kvitto}</p>}
      >
        <p className="text-steg uppercase text-ink-3">Steg 2 av 2</p>
        <h2 className="mt-1 text-fraga text-ink-1">{PAKETSKARM.fraga}</h2>

        {visaLangd ? (
          <div className="mt-4">
            <Segment
              value={langd}
              onChange={(v) => setLangd(v)}
              label={PAKETSKARM.langdLabel}
              options={ALLT_LANGDER.map((key) => ({
                value: key,
                label: PAKET[key].namn.replace('Allt-', ''),
                // D48b: engångsdygnet går inte att välja ovanpå en löpande
                // prenumeration. Läget står kvar men är spärrat, så att
                // längdraden ser likadan ut för alla.
                disabled: key === 'all_day' && harLopandePrenumeration,
              }))}
            />
            {/* En spärrad knapp får aldrig vara tyst om varför. */}
            {harLopandePrenumeration ? (
              <p className="mt-2 text-meta text-ink-3">{PAKETSKARM.dagSpärrad}</p>
            ) : null}
          </div>
        ) : null}

        <section className="mt-4 rounded-xl border border-kant bg-panel">
          <div className="flex items-baseline justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="text-kort text-ink-1">{paket.namn}</p>
              <p className="mt-0.5 text-meta text-ink-3">{paket.intervall}</p>
            </div>
            <p className="shrink-0 text-kort tabular-nums text-ink-1">{paket.belopp} kr</p>
          </div>

          <ul className="divide-y divide-kant border-t border-kant">
            {paket.ingar.map((rad) => (
              <li key={rad} className="flex items-start gap-2 px-4 py-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-ink-2" strokeWidth={1.75} />
                <span className="text-sm leading-[22px] text-ink-1">{rad}</span>
              </li>
            ))}
          </ul>

          {paket.ingarInte ? (
            <p className="border-t border-kant px-4 py-3 text-meta text-ink-3">{paket.ingarInte}</p>
          ) : null}
        </section>

        <div className="mt-4">
          <StatusRow tone="neutral" showDot wrap>
            {fornyelserad(paket, datum)}
          </StatusRow>
        </div>

        <label className="mt-4 flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-kant bg-insunken p-3 shadow-insunken">
          <input
            type="checkbox"
            checked={samtycke}
            onChange={(e) => setSamtycke(e.target.checked)}
            // accent-color, inte text-*: webbläsaren ritar rutans fyllning
            // själv och den var annars systemblå, vilket är den enda färg i
            // vyn som inte kommer ur tokens.
            style={{ accentColor: 'var(--ink-1)' }}
            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-kant-stark focus:ring-1 focus:ring-ink-1"
          />
          <span>
            <span className="block text-sm leading-[22px] text-ink-1">{PAKETSKARM.samtycke}</span>
            <span className="mt-1 block text-meta text-ink-3">{PAKETSKARM.samtyckeHjalp}</span>
          </span>
        </label>

        <button
          type="button"
          onClick={() => setSteg('val')}
          className="mt-4 text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
        >
          {PAKETSKARM.bytPaket}
        </button>
      </FlowShell>
    )
  }

  /* ============================================================= skärm 1.1 */

  return (
    <FlowShell
      title="Kom igång"
      step={1}
      totalSteps={2}
      onExit={() => router.push('/dashboard')}
      primaryLabel={SPARVAL.primar}
      onPrimary={vidareTillPaket}
      primaryDisabled={!track}
      primaryBlockedReason="Välj ett av de tre korten först."
      primaryBusy={busy}
      busyLabel="Sparar"
      banner={felBanner}
      footerSecondary={
        <div>
          <button
            type="button"
            onClick={borjaGratis}
            disabled={busy}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 transition-colors hover:bg-insunken disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[200px]"
          >
            {SPARVAL.gratisKnapp}
          </button>
          <p className="mt-2 text-meta text-ink-3">{SPARVAL.gratisNot}</p>
        </div>
      }
    >
      <p className="text-steg uppercase text-ink-3">Steg 1 av 2</p>
      <h2 className="mt-1 text-fraga text-ink-1">{SPARVAL.fraga}</h2>
      <p className="mt-2 text-sm leading-[22px] text-ink-2">{SPARVAL.ingress}</p>

      <div role="radiogroup" aria-label={SPARVAL.fraga} className="mt-5 space-y-3">
        <ChoiceCard
          selected={track === 'cv'}
          onSelect={() => setTrack('cv')}
          title={SPARVAL.kort.cv.titel}
          description={SPARVAL.kort.cv.text}
          meta={SPARVAL.kort.cv.meta}
          leading={<IkonCv />}
        />
        <ChoiceCard
          selected={track === 'tester'}
          onSelect={() => setTrack('tester')}
          title={SPARVAL.kort.tester.titel}
          description={SPARVAL.kort.tester.text}
          meta={SPARVAL.kort.tester.meta}
          leading={<IkonAnalys />}
        />
        <ChoiceCard
          variant="featured"
          eyebrow="Rekommenderas"
          selected={track === 'allt'}
          onSelect={() => setTrack('allt')}
          title={SPARVAL.kort.allt.titel}
          description={SPARVAL.kort.allt.text}
          meta={SPARVAL.kort.allt.meta}
          leading={
            <MarginPlate>
              <IlluPlattaPremium size={48} />
            </MarginPlate>
          }
        />
      </div>

      <button
        type="button"
        onClick={() => setSteg('gratisval')}
        className="mt-4 text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
      >
        {SPARVAL.hoppaOver}
      </button>
    </FlowShell>
  )
}
