'use client'

/**
 * Spärren i brevrummet (skissens Sparr-nedladdning-1440, Sparr-vecka-1440 och
 * Mobil-sparr), i två varianter:
 *
 *   nedladdning  PDF och Word ingår i Premium. Brevet i sin helhet till
 *                vänster (dator) eller överst (telefon), "Kopiera texten i
 *                stället" som det fria alternativet.
 *   vecka        Veckans gratisbrev är skrivet (kvoten letter_generation).
 *                Veckoremsan till vänster (dator) eller överst (telefon),
 *                "Påminn mig" som det fria alternativet.
 *
 * Dialog i två fält från 1060 px, ark nerifrån under. Laddas dynamiskt via
 * BrevSparrLaddare, så att ingen sida bär koden förrän spärren öppnas.
 *
 * Logiken är PaywallCard:s (src/components/paywall/PaywallCard.tsx), ärvd
 * rad för rad: rubrik, brödtext, prisrad och köpknapp ur getPaywallCopy
 * (variant nedladdning, eller kvot med letter_generation), kampanjpriset
 * genom useKampanjPris, paywall_shown och feature_blocked en gång per
 * öppning, betalvagg_visad genom useBetalvaggVisad, paywall_cta_clicked med
 * samma fält, påminnelsen genom /api/quota/remind. Har kontot ett betalt
 * spår som inte räcker (CV-paketet, Träningspaketet) går knappen till
 * prenumerationssidan i stället för köpsteget, utan kampanjpris.
 *
 * Det enda spärren själv äger är skissens: de tre punkterna med bock, raden
 * PDF, Word och Utan tak, och veckoremsan.
 *
 * Fokus fångas i dialogen, Esc och dimman stänger, sidan bakom är låst och
 * fokus går tillbaka dit det kom ifrån.
 */

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { capture, type BetalvaggPlats } from '@/lib/analytics/events'
import { getPaywallCopy, planForPaywall, PAKETRADER, VARIANT_FEATURE, type PaywallVariant } from '@/components/paywall/paywall-copy'
import { scopeHasFeature, type Scope } from '@/lib/access/features'
import { SALD_PLAN, saljbarPlan, type PlanKey } from '@/lib/plans/plans'
import { kopstegHref, PRISER_HREF } from '@/lib/onboarding/steps'
import { PREMIUM_HREF } from '@/lib/premium/premiumEntry'
import { useKampanjPris } from '@/components/kampanj/KampanjPrisKontext'
import { useBetalvaggVisad } from '@/hooks/useBetalvaggVisad'
import { useFriSikt } from '@/components/shared/useFriSikt'
import { Formatmarken } from './delar'
import { IkonBock, IkonFlagga, IkonFram, IkonKlocka, IkonKopiera, IkonKuvert, IkonPortfolj, IkonStang } from './ikoner'
import { veckoremsa } from './veckoremsa'

export type BrevSparrVariant = 'nedladdning' | 'vecka'

export interface BrevSparrProps {
  variant: BrevSparrVariant
  onClose: () => void
  /** Brevets bild (BrevArk eller BrevMiniatyr från arket). Visas i variant nedladdning. */
  children?: ReactNode
  /** Överraden över brevet, "Ditt brev till Nordanvind Energi". */
  brevRubrik?: string
  /** "Kopiera texten i stället": kopierar brevets text. Spärren stänger efteråt. */
  onKopiera?: () => void | Promise<void>
  /** Variant vecka: när nästa gratisbrev öppnar (ISO eller Date, ur kvoten). */
  nastaGratis?: string | Date | null
  /** Dagens datum (tester och förhandsvisning). Standard: nu. */
  idag?: Date
  /** Variant vecka: jobbet hon ville skriva till. Annonsen ligger kvar. */
  jobb?: { titel: string; foretag: string; sistaDag?: string | null } | null
  /** Användarens betalda paket, null på gratisnivån (som PaywallCard). */
  scope?: Scope | null
  /** Spåret ur onboardingen (som PaywallCard). */
  track?: Scope | null
  /** Sann när kontot redan har funktionen: inget ritas. */
  isPremium?: boolean
  /** Adressen köpet ska tillbaka till (köpstegets retur). */
  returTill?: string | null
  /** Mallen nedladdningen gällde, med i mätningen och köpet. */
  mall?: { id: string; tier: 'free' | 'premium' } | null
}

const PUNKTER: Record<'nedladdning' | 'nedladdningMobil' | 'vecka', readonly [string, string][]> = {
  nedladdning: [
    ['Brevet laddas ner direkt efter köpet', ', i mallen du har valt'],
    ['Alla mallar', ' för både CV och brev, så att ansökan hör ihop'],
    ['Hela CV-analysen och alla rekryteringstester', ' ingår också'],
  ],
  nedladdningMobil: [
    ['Brevet laddas ner direkt', ' efter köpet'],
    ['Skriv utan veckotak', ', ett brev för varje annons'],
    ['Alla mallar', ' för både CV och brev'],
  ],
  vecka: [
    ['Skriv det här brevet nu', ', och ett för varje annons du vill söka'],
    ['Ladda ner som PDF och Word', ', i alla mallar'],
    ['Hela CV-analysen och alla rekryteringstester', ' ingår också'],
  ],
}

const FOKUSBARA = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Dator från 1060 px: dialogen är 1020 px bred. */
function useDator(): boolean {
  const [dator, setDator] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 1060px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1060px)')
    const byt = () => setDator(mq.matches)
    byt()
    mq.addEventListener('change', byt)
    return () => mq.removeEventListener('change', byt)
  }, [])
  return dator
}

/** "Jobbcoach Premium, 149 kr i månaden. Säg upp när du vill." på två rader, första meningen fet. */
function Prisrad({ text }: { text: string }) {
  const i = text.indexOf('. ')
  if (i < 0) return <b>{text}</b>
  return (
    <>
      <b>{text.slice(0, i + 1)}</b>
      <br /> {text.slice(i + 2)}
    </>
  )
}

function Punkter({ rader }: { rader: readonly [string, string][] }) {
  return (
    <ul className="b3-sparr-ing">
      {rader.map(([fet, rest]) => (
        <li key={fet}>
          <i aria-hidden="true">
            <IkonBock size={12} strokeWidth={3.6} />
          </i>
          <span>
            <b>{fet}</b>
            {rest}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default function BrevSparr({
  variant,
  onClose,
  children,
  brevRubrik,
  onKopiera,
  nastaGratis = null,
  idag,
  jobb = null,
  scope = null,
  track = null,
  isPremium,
  returTill = null,
  mall = null,
}: BrevSparrProps) {
  const pathname = usePathname()
  const surface = pathname ?? ''
  const kampanj = useKampanjPris()
  const kampanjNyckel = kampanj?.nyckel ?? null
  const dator = useDator()
  const rubrikId = useId()
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [reminder, setReminder] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [kopierar, setKopierar] = useState(false)

  const paywallVariant: PaywallVariant = variant === 'nedladdning' ? 'nedladdning' : 'kvot'
  const platsen: BetalvaggPlats = variant === 'nedladdning' ? 'nedladdning' : 'kvot'
  const quotaFeature = 'letter_generation'
  const sparradFeature = VARIANT_FEATURE[paywallVariant] ?? null
  const suggestedPlan = planForPaywall(paywallVariant, { feature: sparradFeature ?? undefined, track })
  const knappPlan: PlanKey = saljbarPlan(suggestedPlan ?? SALD_PLAN)

  // Ett betalt spår som inte täcker funktionen: samma vägg, men knappen går
  // till prenumerationssidan och priset byts där (PaywallCard, spec-rummen 17.5).
  const sparKund = !isPremium && (scope === 'cv' || scope === 'tester') && (sparradFeature === null || !scopeHasFeature(scope, sparradFeature))

  const copy = getPaywallCopy(paywallVariant, {
    quotaFeature,
    track,
    plan: knappPlan,
    plats: platsen,
    kampanj: sparKund ? null : kampanj,
  })

  const remsa = variant === 'vecka' && nastaGratis ? veckoremsa(nastaGratis, idag ?? new Date()) : null
  const nastaIso = nastaGratis ? (typeof nastaGratis === 'string' ? nastaGratis : nastaGratis.toISOString()) : null

  // Mätningen, en gång per öppning (spärren monteras när den öppnas).
  useBetalvaggVisad(platsen, !isPremium)
  const visadRef = useRef(false)
  useEffect(() => {
    if (isPremium || visadRef.current) return
    visadRef.current = true
    capture('paywall_shown', {
      variant: paywallVariant,
      surface,
      ...(sparradFeature ? { feature: sparradFeature } : {}),
      suggestedPlan: knappPlan,
      price_shown: true,
      kampanj: kampanjNyckel,
      ...(mall ? { template: mall.id, tier: mall.tier } : {}),
    })
    if (sparradFeature) capture('feature_blocked', { feature: sparradFeature, scope, surface })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPremium])

  const ctaClicked = useCallback(
    (cta: 'primary' | 'secondary') =>
      capture('paywall_cta_clicked', {
        variant: paywallVariant,
        surface,
        cta,
        plan: knappPlan,
        plats: platsen,
        kampanj: kampanjNyckel,
        ...(mall ? { template: mall.id, tier: mall.tier } : {}),
      }),
    [paywallVariant, surface, knappPlan, platsen, kampanjNyckel, mall],
  )

  const kop = () => {
    ctaClicked('primary')
    window.location.href = sparKund ? PREMIUM_HREF : kopstegHref(copy.plan ?? knappPlan, platsen, { retur: returTill, mall: mall?.id ?? null })
  }

  const kopiera = async () => {
    if (kopierar) return
    ctaClicked('secondary')
    setKopierar(true)
    try {
      await onKopiera?.()
    } finally {
      setKopierar(false)
      onClose()
    }
  }

  const paminn = async () => {
    if (!nastaIso || reminder === 'saving' || reminder === 'saved') return
    ctaClicked('secondary')
    setReminder('saving')
    try {
      const res = await fetch('/api/quota/remind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature: quotaFeature, remindAfter: nastaIso }),
      })
      setReminder(res.ok ? 'saved' : 'error')
    } catch {
      setReminder('error')
    }
  }

  // Esc stänger, Tab stannar i dialogen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const el = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOKUSBARA)).filter((x) => x.getClientRects().length > 0)
      if (!el.length) return
      const forsta = el[0]
      const sista = el[el.length - 1]
      const aktiv = document.activeElement
      if (e.shiftKey && (aktiv === forsta || aktiv === panelRef.current)) {
        e.preventDefault()
        sista.focus()
      } else if (!e.shiftKey && aktiv === sista) {
        e.preventDefault()
        forsta.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Sidan bakom låst, scrollläget behålls (samma som Sheet).
  useEffect(() => {
    const y = window.scrollY
    const b = document.body
    const forut = { position: b.style.position, top: b.style.top, width: b.style.width, overflow: b.style.overflow }
    b.style.position = 'fixed'
    b.style.top = `-${y}px`
    b.style.width = '100%'
    b.style.overflow = 'hidden'
    return () => {
      Object.assign(b.style, forut)
      window.scrollTo(0, y)
    }
  }, [])

  // Fokus in i dialogen, och tillbaka dit det kom ifrån.
  useEffect(() => {
    const tillbaka = document.activeElement as HTMLElement | null
    const id = window.requestAnimationFrame(() => panelRef.current?.focus())
    return () => {
      window.cancelAnimationFrame(id)
      tillbaka?.focus?.()
    }
  }, [])

  // Samtyckesraden ligger aldrig över spärren.
  useFriSikt(panelRef, true)

  if (isPremium || typeof document === 'undefined') return null

  const ogon = variant === 'nedladdning' ? `Nedladdning ingår i ${PAKETRADER.bricka}` : `Brev utan tak ingår i ${PAKETRADER.bricka}`
  const lang = variant === 'vecka'

  const fel = reminder === 'error' ? <p className="b3-sparr-felrad">Kunde inte spara påminnelsen. Försök igen.</p> : null

  const prislank = (
    <Link href={PRISER_HREF} className="b3-sparr-lank" onClick={() => ctaClicked('secondary')}>
      {PAKETRADER.jamfor}
    </Link>
  )

  const kopknapp = (
    <button type="button" className="b3-stor bred platt" onClick={kop} data-sparr-kop>
      {copy.primary}
    </button>
  )

  const remsaEl = remsa ? (
    <ol className="b3-veckoremsa" role="img" aria-label={remsa.etikett}>
      {remsa.dagar.map((d) => (
        <li key={d.datum} className="b3-dag" data-lage={d.lage}>
          <i aria-hidden="true">{d.lage === 'gjord' ? <IkonKuvert size={18} /> : d.lage === 'nasta' ? <IkonFlagga size={18} /> : null}</i>
          {d.etikett}
        </li>
      ))}
    </ol>
  ) : null

  const dagarEl = remsa ? (
    <p className="b3-dagar">
      <span className="b3-dagar-tal" aria-hidden="true">
        {remsa.dagarKvar}
      </span>
      <span className="b3-dagar-rad">
        <span className="sr-only">{remsa.dagarKvar} </span>
        {remsa.dagarKvar === 1 ? 'dag till nästa' : 'dagar till nästa'}
        <br />
        <b>gratisbrev</b>
      </span>
    </p>
  ) : null

  const paminnText =
    reminder === 'saved' ? 'Vi mejlar dig när den öppnar' : reminder === 'saving' ? 'Sparar' : 'Påminn mig'

  /* ------------------------------------------------------------ dator */
  const datorVy = (
    <div className="b3-sparr-dator">
      <div className="b3-sparr-vagg">
        <span className="b3-sparr-cirkel" aria-hidden="true" style={{ width: 300, height: 300, right: -130, top: -130 }} />
        <svg className="b3-sparr-kulle" width="450" height="200" viewBox="0 0 450 200" aria-hidden="true" style={{ bottom: 92 }}>
          <path d="M0 200V120C120 90 260 150 450 60V200Z" style={{ fill: 'var(--b3-kulle-1)' }} />
        </svg>
        {variant === 'nedladdning' ? (
          <>
            <div className="b3-sparr-topp-rad">
              <p className="b3-ogon" style={{ color: 'var(--vagg-mjuk)' }}>
                {brevRubrik ?? 'Ditt personliga brev'}
              </p>
              <Formatmarken />
            </div>
            <div className="b3-sparr-brev">
              {children ? <div className="b3-sparr-brev-ark">{children}</div> : null}
            </div>
            {onKopiera ? (
              <button type="button" className="b3-sparr-fri" onClick={kopiera} disabled={kopierar}>
                <span className="b3-sparr-fri-ik" aria-hidden="true">
                  <IkonKopiera size={20} />
                </span>
                <span>
                  <b>{copy.secondary}</b>
                  <small>Ingår gratis. Klistra in den där du söker.</small>
                </span>
                <IkonFram className="ml-auto shrink-0" />
              </button>
            ) : null}
          </>
        ) : (
          <>
            <p className="b3-ogon" style={{ position: 'relative', color: 'var(--vagg-mjuk)' }}>
              Gratisnivån · ett brev var sjunde dag
            </p>
            <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 26 }}>
              {dagarEl}
              {remsaEl}
            </div>
            {nastaIso && remsa ? (
              <button type="button" className="b3-sparr-fri" onClick={paminn} disabled={reminder === 'saving' || reminder === 'saved'} data-sparr-paminn={reminder === 'saved' ? 'sparad' : ''}>
                <span className="b3-sparr-fri-ik" aria-hidden="true">
                  {reminder === 'saved' ? <IkonBock size={18} strokeWidth={3} /> : <IkonKlocka size={20} />}
                </span>
                <span>
                  <b>{paminnText}</b>
                  <small>{`Vi mejlar dig ${remsa.nastaText}, när nästa brev öppnar.`}</small>
                </span>
                {reminder === 'saved' ? null : <IkonFram className="ml-auto shrink-0" />}
              </button>
            ) : null}
          </>
        )}
      </div>
      <div className="b3-sparr-papper">
        <button type="button" className="b3-sparr-stang papper" aria-label="Stäng" onClick={onClose}>
          <IkonStang />
        </button>
        <p className="b3-ogon-golv">{ogon}</p>
        <h2 id={rubrikId} className="b3-sparr-rubrik" data-lang={lang ? '' : undefined}>
          {copy.title}
        </h2>
        <p className="b3-sparr-text">{copy.body}</p>
        {variant === 'nedladdning' ? (
          <div className="b3-sparr-sif" role="img" aria-label="PDF att bifoga, Word att ändra i själv, och brev utan veckotak.">
            <div>
              <b>PDF</b>
              <span>färdig fil att bifoga i ansökan</span>
            </div>
            <div>
              <b>Word</b>
              <span>ändra själv, när du vill</span>
            </div>
            <div>
              <b>Utan tak</b>
              <span>ett brev för varje annons</span>
            </div>
          </div>
        ) : jobb ? (
          <div className="b3-sparr-jobb">
            <span className="b3-sparr-jobb-ik" aria-hidden="true">
              <IkonPortfolj />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <b>{jobb.titel}</b>
              <small>{`${jobb.foretag}. Annonsen ligger kvar här tills du skriver brevet.`}</small>
            </span>
            {jobb.sistaDag ? <span className="b3-vantar">{jobb.sistaDag}</span> : null}
          </div>
        ) : null}
        <Punkter rader={variant === 'nedladdning' ? PUNKTER.nedladdning : PUNKTER.vecka} />
        <div className="b3-sparr-slut">
          <p className="b3-sparr-pris">{copy.prisrad ? <Prisrad text={copy.prisrad} /> : null}</p>
          <div className="b3-sparr-knappar">
            {kopknapp}
            {prislank}
          </div>
          {fel}
        </div>
      </div>
    </div>
  )

  /* ------------------------------------------------------------ telefon */
  const mobilVy = (
    <div className="b3-sparr-mobil">
      <div className="b3-sparr-vagg b3-sparr-topp" data-vecka={variant === 'vecka' ? '' : undefined}>
        <span className="b3-sparr-cirkel" aria-hidden="true" style={{ width: 240, height: 240, right: -100, top: -110 }} />
        <svg className="b3-sparr-kulle" width="100%" height="90" viewBox="0 0 412 90" preserveAspectRatio="none" aria-hidden="true" style={{ bottom: 0 }}>
          <path d="M0 90V52C110 30 240 70 412 20V90Z" style={{ fill: 'var(--b3-kulle-1)' }} />
        </svg>
        <div className="b3-sparr-topp-rad">
          {variant === 'nedladdning' ? (
            <Formatmarken />
          ) : (
            <p className="b3-ogon" style={{ color: 'var(--vagg-mjuk)' }}>
              Gratisnivån · ett brev var sjunde dag
            </p>
          )}
          <button type="button" className="b3-sparr-stang" aria-label="Stäng" onClick={onClose}>
            <IkonStang size={20} strokeWidth={2.2} />
          </button>
        </div>
        {variant === 'nedladdning' ? (
          children ? (
            <div className="b3-sparr-topp-ark">{children}</div>
          ) : null
        ) : (
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
            {dagarEl}
            {remsaEl}
          </div>
        )}
      </div>
      <div className="b3-sparr-papper b3-sparr-kropp">
        <p className="b3-ogon-golv">{ogon}</p>
        <h2 id={rubrikId} className="b3-sparr-rubrik">
          {copy.title}
        </h2>
        <p className="b3-sparr-text">{copy.body}</p>
        <Punkter rader={variant === 'nedladdning' ? PUNKTER.nedladdningMobil : PUNKTER.vecka} />
        <p className="b3-sparr-pris">{copy.prisrad ? <Prisrad text={copy.prisrad} /> : null}</p>
        <div className="b3-sparr-knappar">
          {kopknapp}
          {variant === 'nedladdning' && onKopiera ? (
            <button type="button" className="b3-sparr-fri-mobil" onClick={kopiera} disabled={kopierar}>
              <IkonKopiera />
              {copy.secondary}
            </button>
          ) : null}
          {variant === 'vecka' && nastaIso ? (
            <button type="button" className="b3-sparr-fri-mobil" onClick={paminn} disabled={reminder === 'saving' || reminder === 'saved'} data-sparr-paminn={reminder === 'saved' ? 'sparad' : ''}>
              {reminder === 'saved' ? <IkonBock size={16} strokeWidth={3} /> : <IkonKlocka size={17} />}
              {paminnText}
            </button>
          ) : null}
        </div>
        {fel}
      </div>
    </div>
  )

  return createPortal(
    <div className="b3-sparr-rot">
      <button type="button" className="b3-sparr-dimma" aria-label="Stäng" tabIndex={-1} onClick={onClose} />
      <div ref={panelRef} className="b3-sparr" role="dialog" aria-modal="true" aria-labelledby={rubrikId} tabIndex={-1} data-sparr-variant={variant}>
        {dator ? datorVy : mobilVy}
      </div>
    </div>,
    document.body,
  )
}
