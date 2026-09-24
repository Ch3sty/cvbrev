'use client'

/**
 * Spårvalet och köpsteget (docs/design/spec-prissida-2026-09-22.html,
 * sektion 2, mittersta och högra telefonen).
 *
 *   1.1   "Vad ska du göra den här veckan?", tre kort med illustration,
 *         värderubrik, fyra "du får"-rader och prisrad. Primär "Fortsätt med
 *         <paket>", sekundär "Börja gratis i stället".
 *   1.2   "<Paket>, från i kväll": kvittot med fyra rader, villkorsraderna,
 *         första steget, "Vill du ha allt i stället?" med längdvalet,
 *         samtyckesrutan och "Till betalning, 79 kr".
 *   1.1b  gratisanvändarens spårfråga, utan priser. Nås bara om inget spår
 *         är valt, vilket förvalet gör ovanligt.
 *
 * Skärmarna är steg i ett flöde, inte tre sidor: tillbaka går till
 * föregående steg, och framstegslinjen är tråden. All logik för samtycke,
 * create-plan-session och händelser är kvar från förra versionen.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import FlowShell from '@/components/shell/FlowShell'
import ChoiceCard from '@/components/shell/ChoiceCard'
import FlowError from '@/components/shell/FlowError'
import LangdVal from '@/components/pricing/LangdVal'
import { IkonCv, IkonAnalys, IkonHem } from '@/components/illustrations/Ikoner'
import {
  IlluScenAllt,
  IlluScenCv,
  IlluScenMatris,
} from '@/components/illustrations/PriserScener'
import { capture } from '@/lib/analytics/events'
import { SPARVAL_GRATIS, type PlanKeyPaket, type Track } from '@/lib/onboarding/program'
import { PLAN_BY_KEY, paketNamn, type PlanKey, type PlanLength } from '@/lib/plans/plans'
import {
  KOPSTEG,
  KOPSTEG_FAR,
  PAKET_PLAN,
  SPARVAL,
  nastaDragningText,
  planForLangd,
  samtyckeVidKop,
  type PaketId,
} from '@/components/pricing/paket-copy'

type Steg = 'val' | 'paket' | 'gratisval'

const TRACK_FOR: Record<PaketId, Track> = { cv: 'cv', test: 'tester', allt: 'allt' }
const PAKET_FOR: Record<Track, PaketId> = { cv: 'cv', tester: 'test', allt: 'allt' }

const SCEN = { cv: IlluScenCv, test: IlluScenMatris, allt: IlluScenAllt } as const

/**
 * Nästa dragning, svensk tid, i formen "29 september". Räknad som Stripe
 * räknar den från köpet: samma datum nästa månad, inte trettio dagar.
 */
function nastaDragning(plan: PlanKey): string {
  return nastaDragningText(plan)
}

/** Sluttid för Dagspasset: klockslag, inte datum. */
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
   * Kontot har en löpande prenumeration. Dagläget är då inaktivt i
   * längdvalet (D48b): bytet nedåt vore en uppsägning plus ett engångsköp.
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
  // Första kortet är förvalt (specen visar CV-paketet vald), så primären är
  // aldrig tyst spärrad. Ett tidigare spår eller ?paket vinner.
  const [track, setTrack] = useState<Track | null>(initialTrack ?? 'cv')
  const sparatTrack = useRef<Track | null>(null)
  const [gratisVal, setGratisVal] = useState<'cv' | 'tester' | 'ingen' | null>(null)
  const [langd, setLangd] = useState<PlanLength>(() => {
    if (!initialPlanKey || !initialPlanKey.startsWith('all_')) return 'vecka'
    const l = PLAN_BY_KEY[initialPlanKey].length
    if (l === 'dag' && harLopandePrenumeration) return 'vecka'
    return l
  })
  const [samtycke, setSamtycke] = useState(false)
  const [busy, setBusy] = useState(false)
  const [fel, setFel] = useState<string | null>(null)

  const paket: PaketId = PAKET_FOR[track ?? 'cv']
  const plan: PlanKey = paket === 'allt' ? planForLangd(langd) : PAKET_PLAN[paket]
  const engangs = PLAN_BY_KEY[plan].mode === 'payment'

  // pricing_viewed en gång per montering, aldrig per omritning.
  const sagt = useRef(false)
  useEffect(() => {
    if (sagt.current) return
    sagt.current = true
    capture('pricing_viewed', { trigger: 'cta' })
  }, [])

  // paywall_shown och purchase_step_viewed när köpsteget visas, en gång per
  // besök på steget. purchase_step_viewed är trattens fjärde steg och bär
  // planen som stod på kvittot när steget öppnades.
  const visatPaket = useRef(false)
  useEffect(() => {
    if (steg !== 'paket' || visatPaket.current) return
    visatPaket.current = true
    capture('paywall_shown', { variant: 'onboarding_paket', surface: '/dashboard/valj-spar' })
    capture('purchase_step_viewed', { plan, surface: '/dashboard/valj-spar' })
  }, [steg, plan])

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
        sparatTrack.current = valt
        return true
      } catch (error: any) {
        setFel(error?.message || 'Valet kunde inte sparas. Försök igen.')
        return false
      }
    },
    []
  )

  /* -------------------------------------------------- 1.1: vidare till köpsteget */

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
      plan,
      cta: 'primary',
    })
    // Bytte hon till Hela paketet i köpsteget ska spåret följa med, annars
    // säger profilen CV och kvittot Hela paketet.
    if (track && sparatTrack.current !== track) {
      const ok = await sparaSpar(track, 'purchase')
      if (!ok) {
        setBusy(false)
        return
      }
    }
    try {
      const res = await fetch('/api/stripe/create-plan-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Rutten läser fältet `plan`, inte `planKey`. consent är
        // ångerrättssamtycket: rutten svarar 400 utan det, och kryssrutan
        // spärrar redan knappen, så fältet är alltid true här. Det är
        // beviskedjan: kryssrutan blir ett fält i kroppen som blir metadata
        // på sessionen.
        body: JSON.stringify({ plan, source: 'onboarding_paket', consent: samtycke }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.url) throw new Error(json?.error || 'Kassan kunde inte öppnas')
      // Omdirigeringen till Stripe är trattens femte steg. Skjuts precis
      // före hoppet: efter det finns ingen sida kvar som kan skicka något.
      capture('checkout_started', { plan, length: PLAN_BY_KEY[plan].length })
      window.location.href = json.url as string
    } catch (error: any) {
      setBusy(false)
      setFel(error?.message || 'Kassan kunde inte öppnas just nu. Försök igen.')
    }
  }, [samtycke, busy, plan, track, sparaSpar])

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
    const datum = engangs ? dygnSlutar() : nastaDragning(plan)
    const forsta = KOPSTEG.forstaSteg[paket]
    const ForstaScen = paket === 'test' ? IlluScenMatris : IlluScenCv
    const inaktiva: PlanLength[] = harLopandePrenumeration ? ['dag'] : []

    return (
      <FlowShell
        title="Kom igång"
        step={2}
        totalSteps={2}
        onBack={() => setSteg('val')}
        onExit={() => router.push('/dashboard')}
        primaryLabel={KOPSTEG.primar(plan)}
        onPrimary={tillKassan}
        primaryDisabled={!samtycke}
        primaryBlockedReason={KOPSTEG.samtyckeSparr}
        primaryBusy={busy}
        busyLabel="Öppnar kassan"
        banner={felBanner}
        footerSecondary={<p className="text-center text-meta text-ink-3 sm:text-left">{KOPSTEG.fotnot}</p>}
      >
        <p className="text-steg uppercase text-ink-3">Steg 2 av 2</p>
        <h2 className="mt-1 font-display text-[26px] font-bold leading-[31px] tracking-[-0.025em] text-ink-1">
          {KOPSTEG.rubrik(plan)}
        </h2>
        <p className="mt-1 text-sm leading-[22px] text-ink-2">{KOPSTEG.under}</p>

        {/* Kvittot. */}
        <section className="mt-4 rounded-xl border border-kant-stark bg-panel p-4" aria-label="Kvitto">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-display text-xl font-bold tracking-[-0.025em] text-ink-1">
              {paketNamn(plan)}
            </p>
            <p className="font-display text-[26px] font-bold tabular-nums tracking-[-0.025em] text-ink-1">
              {PLAN_BY_KEY[plan].amount} kr{' '}
              <span className="font-sans text-xs font-normal text-ink-3">
                {KOPSTEG.prisEnhet(plan)}
              </span>
            </p>
          </div>

          <p className="mt-3 text-steg uppercase text-ink-3">{KOPSTEG.farEtikett(plan)}</p>
          <ul className="mt-2 grid gap-1 text-[13px] leading-[18px] text-ink-2">
            {KOPSTEG_FAR[paket].map((rad) => (
              <li key={rad.fet} className="flex gap-2">
                <span
                  className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-ink-1"
                  aria-hidden="true"
                />
                <span>
                  <b className="font-semibold text-ink-1">{rad.fet}</b>
                  {rad.text}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-3 grid gap-1 border-t border-kant pt-3 text-[13px]">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-3">{engangs ? KOPSTEG.villkor.galler : KOPSTEG.villkor.fornyas}</dt>
              <dd className="text-right font-medium text-ink-1">{KOPSTEG.fornyasVarde(plan, datum)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-3">{KOPSTEG.villkor.uppsagning}</dt>
              <dd className="text-right font-medium text-ink-1">
                {engangs ? 'behövs inte, inget dras igen' : KOPSTEG.villkor.uppsagningVarde}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-3">{KOPSTEG.villkor.angerratt}</dt>
              <dd className="text-right font-medium text-ink-1">{KOPSTEG.villkor.angerrattVarde}</dd>
            </div>
          </dl>

          <div className="mt-3 flex items-center gap-3 rounded-lg bg-insunken p-3 text-ink-1">
            <ForstaScen className="h-11 w-11 shrink-0" />
            <div>
              <p className="text-sm font-semibold leading-[19px] text-ink-1">{forsta.rubrik}</p>
              <p className="text-xs text-ink-3">{forsta.text}</p>
            </div>
          </div>
        </section>

        {/* Hela paketet i stället, eller längden på Hela paketet. */}
        <section className="mt-3 rounded-xl border border-kant bg-panel px-4 py-3">
          <p className="text-steg uppercase text-ink-3">
            {paket === 'allt' ? KOPSTEG.alltLangd : KOPSTEG.alltIStallet}
          </p>
          <LangdVal
            className="mt-2"
            label={KOPSTEG.alltLangd}
            yta="papper"
            value={paket === 'allt' ? langd : null}
            inaktiva={inaktiva}
            onChange={(ny) => {
              setLangd(ny)
              if (track !== 'allt') setTrack('allt')
              capture('plan_length_changed', { plan: planForLangd(ny), surface: '/dashboard/valj-spar' })
            }}
          />
          {harLopandePrenumeration ? (
            <p className="mt-2 text-meta text-ink-3">{KOPSTEG.dagSparrad}</p>
          ) : null}
        </section>

        <label className="mt-3 flex min-h-11 cursor-pointer items-start gap-3 text-[13px] leading-[19px] text-ink-2">
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

  /* ============================================================= skärm 1.1 */

  return (
    <FlowShell
      title="Kom igång"
      step={1}
      totalSteps={2}
      onExit={() => router.push('/dashboard')}
      primaryLabel={SPARVAL.primar(paket, plan)}
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
            className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-semibold text-ink-1 transition-colors hover:bg-insunken disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[200px]"
          >
            {SPARVAL.sekundar}
          </button>
          <p className="mt-2 text-center text-xs text-ink-3 sm:text-left">{SPARVAL.fotnot}</p>
        </div>
      }
    >
      <p className="text-steg uppercase text-ink-3">Steg 1 av 2</p>
      <h2 className="mt-1 font-display text-[26px] font-bold leading-[31px] tracking-[-0.025em] text-ink-1">
        {SPARVAL.fraga}
      </h2>
      <p className="mt-1 text-sm leading-[22px] text-ink-2">{SPARVAL.under}</p>

      <div role="radiogroup" aria-label={SPARVAL.fraga} className="mt-4 grid gap-3">
        {SPARVAL.kort.map((kort) => (
          <SparKort
            key={kort.paket}
            kort={kort}
            selected={track === TRACK_FOR[kort.paket]}
            onSelect={() => setTrack(TRACK_FOR[kort.paket])}
          />
        ))}
      </div>
    </FlowShell>
  )
}

/**
 * Valkortet i spårvalet (.vkort i specen). Lokalt i sidan: ChoiceCard har
 * varken illustration på insunken platta, "du får"-lista, prisrad eller
 * ink-varianten för det rekommenderade kortet.
 *
 * Val markeras med kant i ink-1 och shadow-val på papper. Det mörka kortet
 * får i stället en ring i ink-1 utanför marken, eftersom en ink-kant är
 * osynlig på en ink-yta. role="radio" med aria-checked som ChoiceCard.
 */
function SparKort({
  kort,
  selected,
  onSelect,
}: {
  kort: (typeof SPARVAL.kort)[number]
  selected: boolean
  onSelect: () => void
}) {
  const rek = kort.paket === 'allt'
  const Scen = SCEN[kort.paket]
  const damp = rek ? 'text-ink-1-mjuk' : 'text-ink-2'
  const meta = rek ? 'text-ink-1-mjuk' : 'text-ink-3'
  const valdKlass = selected
    ? rek
      ? 'border-ink-1 shadow-[0_0_0_2px_var(--mark),0_0_0_4px_var(--ink-1)]'
      : 'border-ink-1 shadow-val'
    : rek
      ? 'border-ink-1'
      : 'border-kant hover:border-kant-stark'

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`grid w-full grid-cols-[56px_1fr] items-start gap-3 rounded-xl border p-4 text-left transition-[border-color,box-shadow] duration-[160ms] ease-out ${
        rek ? 'bg-ink-1 text-white' : 'bg-panel text-ink-1'
      } ${valdKlass}`}
    >
      <span
        className={`grid h-14 w-14 place-items-center rounded-lg ${rek ? 'bg-ink-hover' : 'bg-insunken'}`}
        aria-hidden="true"
      >
        <Scen className="h-11 w-11" />
      </span>
      <span className="min-w-0">
        {rek ? (
          <span className="mb-0.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-1-accent">
            Rekommenderas
          </span>
        ) : null}
        <span className="block text-base font-semibold leading-[21px]">{kort.rubrik}</span>
        <span className={`mt-0.5 block text-[13px] leading-[18px] ${damp}`}>{kort.namn}</span>
      </span>

      <ul
        className={`col-span-2 mt-0.5 grid gap-1 border-t pt-2 text-[13px] leading-[18px] ${damp} ${
          rek ? 'border-ink-1-kant' : 'border-kant'
        }`}
      >
        {kort.duFar.map((rad) => (
          <li key={rad.fet} className="flex gap-2">
            <span
              className={`mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full ${rek ? 'bg-panel' : 'bg-ink-1'}`}
              aria-hidden="true"
            />
            <span>
              <b className={`font-semibold ${rek ? 'text-white' : 'text-ink-1'}`}>{rad.fet}</b>
              {rad.text}
            </span>
          </li>
        ))}
      </ul>

      <span className={`col-span-2 flex items-baseline justify-between gap-3 pt-2 text-[13px] ${meta}`}>
        <span>{kort.prisText}</span>
        <b className={`shrink-0 font-display text-xl font-bold tabular-nums ${rek ? 'text-white' : 'text-ink-1'}`}>
          {kort.pris}
        </b>
      </span>
    </button>
  )
}
