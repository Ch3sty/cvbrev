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

import './kopsteg.css'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import FlowShell from '@/components/shell/FlowShell'
import { useFriSikt } from '@/components/shared/useFriSikt'
import ChoiceCard from '@/components/shell/ChoiceCard'
import FlowError from '@/components/shell/FlowError'
import { Check } from '@/components/illustrations/RumIkoner'
import { IkonCv, IkonAnalys, IkonHem } from '@/components/illustrations/Ikoner'
import { IlluScenCv } from '@/components/illustrations/PriserScener'
import { capture } from '@/lib/analytics/events'
import { SPARVAL_GRATIS, type Track } from '@/lib/onboarding/program'
import { PLAN_BY_KEY, SALD_PLAN, type PlanKey } from '@/lib/plans/plans'
import { KAMPANJ_ORD, type KampanjVisning } from '@/lib/kampanj/kampanj'
import { KampanjUr } from '@/components/kampanj/KampanjMarke'
import { DORR_IKON } from '@/components/rum/Dorrnav'
import { RUM_NAMN } from '@/lib/rum/copy'
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
  /** ?mall=, mallen köpet gäller (mallflödet), med i source. */
  mall?: string | null
  /** ?retur=, galleriet med CV och mall valda, dit kassan skickar tillbaka. */
  retur?: string | null
  /**
   * Hon hoppade över "Vad vill du börja med?" i registreringen. Börja gratis
   * utan sparat spår går då direkt till hemskärmen: frågan ställs högst en
   * gång (QA 2026-09-24, iakttagelse 2).
   */
  utanGratisfraga?: boolean
  /** Kampanjpriset som gäller kontot just nu, eller null (lib/kampanj). */
  kampanj?: KampanjVisning | null
}

export default function ValjSparClient({
  initialTrack,
  plan = SALD_PLAN,
  plats = null,
  mall = null,
  retur = null,
  utanGratisfraga = false,
  kampanj: kampanjFranServern = null,
}: ValjSparClientProps) {
  const router = useRouter()
  const [steg, setSteg] = useState<Steg>('kop')
  const [gratisVal, setGratisVal] = useState<'cv' | 'tester' | 'ingen' | null>(null)
  const [samtycke, setSamtycke] = useState(false)
  // Kampanjen kan bytas av kassan (409 prisAndrat) om den börjar eller slutar
  // medan steget är öppet. Då visas det nya priset och rutan kryssas ur.
  const [kampanj, setKampanj] = useState<KampanjVisning | null>(kampanjFranServern)
  const [busy, setBusy] = useState(false)
  const [fel, setFel] = useState<string | null>(null)
  // Spårkunden (409 med upgradeAvailable) byter på prenumerationssidan, inte i
  // en ny kassa. Då leder felraden dit i stället för "Försök igen".
  const [tillByte, setTillByte] = useState<string | null>(null)
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
  // Samtycket till kakor ligger aldrig över köpvillkoret (klicktestet
  // 2026-11-08: på Pixel 7 täckte det rutan som måste kryssas för kassan).
  const villkorRef = useRef<HTMLLabelElement | null>(null)
  useFriSikt(villkorRef, steg === 'kop')
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
      if (!res.ok) throw new Error(json?.error || KOPSTEG.sparaFel)

      if (valt) capture('track_selected', { track: valt, surface: 'onboarding', intent })
      const innan = (json?.previousTrack as Track | null) ?? null
      if (innan && valt && innan !== valt) {
        capture('track_changed', { from: innan, to: valt, surface: 'onboarding' })
      }
      capture('onboarding_step_completed', { track: valt, step: 'track_choice', index: 0 })
      return true
    } catch (error: any) {
      setFel(error?.message || KOPSTEG.sparaFel)
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
    setTillByte(null)
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
        body: JSON.stringify({
          plan,
          source: mall ? `${kopSource(plats)}:${mall}` : kopSource(plats),
          consent: samtycke,
          kampanj: kampanj?.nyckel ?? null,
          ...(retur ? { retur } : {}),
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (res.status === 409 && json?.prisAndrat) {
        setBusy(false)
        setKampanj((json.kampanj as KampanjVisning | null) ?? null)
        setSamtycke(false)
        setFel(json?.error || KOPSTEG.felKassa)
        capture('kampanj_pris_andrat', { till: json?.kampanj?.nyckel ?? 'ordinarie' })
        return
      }
      // 400 med saljs: false betyder att paketet inte säljs. Det är ett fel
      // med en förklaring, aldrig ett tyst "klart".
      if (res.status === 400 && json?.saljs === false) throw new Error(KOPSTEG.saljsInte)
      if (res.status === 409 && json?.upgradeAvailable) {
        setBusy(false)
        setTillByte(typeof json?.bytUrl === 'string' ? json.bytUrl : KOPSTEG.prenumerationHref)
        setFel(json?.error || KOPSTEG.redan)
        return
      }
      if (res.status === 409) throw new Error(json?.error || KOPSTEG.redan)
      if (!res.ok || !json?.url) throw new Error(json?.error || KOPSTEG.felKassa)
      // Omdirigeringen till Stripe är trattens femte steg. Skjuts precis
      // före hoppet: efter det finns ingen sida kvar som kan skicka något.
      capture('checkout_started', { plan, length: PLAN_BY_KEY[plan].length, kampanj: kampanj?.nyckel ?? null })
      window.location.href = json.url as string
    } catch (error: any) {
      setBusy(false)
      setFel(error?.message || KOPSTEG.felKassa)
    }
  }, [samtycke, busy, plan, plats, mall, retur, initialTrack, sparaSpar, kampanj])

  const felBanner = fel ? (
    tillByte ? (
      <FlowError
        message={fel}
        onRetry={() => router.push(tillByte)}
        retryLabel={KOPSTEG.tillPrenumeration}
      />
    ) : (
      <FlowError message={fel} onRetry={() => setFel(null)} retryLabel={KOPSTEG.forsokIgen} />
    )
  ) : undefined

  /* ============================================================ gratisval */

  if (steg === 'gratisval') {
    return (
      <FlowShell
        title={KOPSTEG.topp}
        step={1}
        totalSteps={1}
        onBack={() => setSteg('kop')}
        onExit={() => router.push('/dashboard')}
        primaryLabel={SPARVAL_GRATIS.primar}
        onPrimary={avslutaGratis}
        primaryDisabled={!gratisVal}
        primaryBlockedReason={KOPSTEG.gratisSparr}
        primaryBusy={busy}
        busyLabel={KOPSTEG.sparar}
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

  // Köpsteget i rummens form (spec-kampanjmarke-2026-11-23 avsnitt 6.4):
  // väggen bär namnet och priset, två lyfta kort bär vad som ingår och
  // villkoren, foten bär samtycket direkt intill knappen. Juridiken
  // (samtycket, villkorens värden) står ordagrant som förut, och kryssrutan
  // spärrar fortfarande knappen. data-rum="tran" ger indigons tokens.
  return (
    <div data-rum="tran" className="contents">
      <FlowShell
        title={KOPSTEG.topp}
        step={1}
        totalSteps={1}
        utanRaknare
        bred
        onExit={() => router.push('/dashboard')}
        banner={felBanner ? <div className="px-4 pt-4">{felBanner}</div> : undefined}
        footer={
          <div className="kop-fot">
            <label ref={villkorRef} className="kop-samtycke">
              <input
                type="checkbox"
                checked={samtycke}
                onChange={(e) => bockaSamtycke(e.target.checked)}
                aria-describedby="kop-hjalp"
              />
              <span>{samtyckeVidKop(plan, new Date(), kampanj)}</span>
            </label>
            <div className="kop-betala">
              <button type="button" className="kop-knapp" onClick={tillKassan} disabled={!samtycke || busy}>
                {busy ? KOPSTEG.busy : KOPSTEG.primar(plan, kampanj)}
              </button>
              <p id="kop-hjalp" className="kop-hjalp" aria-live="polite">
                {samtycke ? KOPSTEG.fotnot : KOPSTEG.samtyckeSparr}
              </p>
            </div>
          </div>
        }
      >
        <div className={`kop${kampanj ? ` km-tema-${kampanj.tema}` : ''}`}>
          <section className="kop-vagg" aria-label={KOPSTEG.rubrik(plan)}>
            <div className="kop-vagg-in">
              <div>
                {kampanj ? (
                  <p className="kop-huvud">
                    <span className="km-platta">{kampanj.namn}</span>
                    <span className="kop-forsta">{KAMPANJ_ORD.forsta}</span>
                  </p>
                ) : null}
                <h2 className="kop-rubrik">{KOPSTEG.rubrik(plan)}</h2>
                {kampanj ? (
                  <>
                    <p className="kop-pris">
                      <b>{kampanj.pris} kr</b>
                      <span className="kop-bredvid">
                        <s>
                          <span className="sr-only">{KAMPANJ_ORD.ordinarie} </span>
                          {PLAN_BY_KEY[plan].amount} kr
                        </s>
                        <span className="km-spar">{KAMPANJ_ORD.sparar(kampanj)}</span>
                      </span>
                    </p>
                    <p className="kop-prisrad">{KOPSTEG.prisradKampanjUtanBelopp()}</p>
                  </>
                ) : (
                  <>
                    <p className="kop-pris">
                      <b>{PLAN_BY_KEY[plan].amount} kr</b>
                    </p>
                    <p className="kop-prisrad">{KOPSTEG.prisradUtanBelopp(plan)}</p>
                  </>
                )}
                <p className="kop-under">{KOPSTEG.under}</p>
              </div>
              {kampanj ? (
                <div className="kop-tid">
                  <KampanjUr k={kampanj} storlek="stor" />
                </div>
              ) : (
                <ul className="kop-delar" aria-label="Alla fyra delarna ingår">
                  {(['tran', 'cv', 'brev', 'jobb'] as const).map((del) => {
                    const Ikon = DORR_IKON[del]
                    return (
                      <li key={del} data-del={del}>
                        <i aria-hidden="true">
                          <Ikon size={18} />
                        </i>
                        {RUM_NAMN[del]}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </section>

          <div className="kop-golv">
            <section className="kop-kort" aria-label={KOPSTEG.farEtikett}>
              <p className="kop-ey">{KOPSTEG.farEtikett}</p>
              <ul className="kop-lista">
                {PAKET_KORT.allt.ingar.map((rad) => (
                  <li key={rad}>
                    <span className="kop-bock" aria-hidden="true">
                      <Check strokeWidth={3} />
                    </span>
                    <span>{rad}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="kop-kort" aria-label="Villkor">
              <dl className="kop-villkor">
                <div>
                  <dt>{engangs ? KOPSTEG.villkor.galler : KOPSTEG.villkor.fornyas}</dt>
                  <dd>{KOPSTEG.fornyasVarde(plan, datum)}</dd>
                </div>
                <div>
                  <dt>{KOPSTEG.villkor.uppsagning}</dt>
                  <dd>{KOPSTEG.villkor.uppsagningVarde}</dd>
                </div>
                <div>
                  <dt>{KOPSTEG.villkor.angerratt}</dt>
                  <dd>{KOPSTEG.villkor.angerrattVarde}</dd>
                </div>
              </dl>
              <div className="kop-forsta-steg">
                <IlluScenCv className="kop-scen" />
                <div>
                  <b>{KOPSTEG.forstaSteg.rubrik}</b>
                  <span>{KOPSTEG.forstaSteg.text}</span>
                </div>
              </div>
            </section>
            <p className="kop-gratis">
              <button type="button" onClick={borjaGratis} disabled={busy}>
                {SPARVAL.sekundar}
              </button>
            </p>
          </div>
        </div>
      </FlowShell>
    </div>
  )
}
