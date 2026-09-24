'use client'

/**
 * Välkomstskärmen (docs/design/spec-onboarding-2026-09-22.html, sektion 1
 * och sektion 4 mitten).
 *
 * Bekräfta vad man har, föreslå första steget. Rubrik, ingress, scenen,
 * "Så här går det till" i tre steg, primärknappen är första steget och
 * sekundärknappen öppnar hjälpredan "Kom igång". Har köparen redan ett CV
 * blir analysen första steget och det liggande CV:t visas som en rad.
 *
 * Skärmen är ett läge, inte en sida: den tar hela skärmen med en egen
 * topprad (kryss och paketets namn) och en egen fot, precis som FlowShell,
 * men utan stegräknare och framstegslinje, för det finns inga steg. Samma
 * data-flow-active-attribut som FlowShell döljer dashboardens header och
 * bottennav. Lokalt i sidan, eftersom FlowShell alltid ritar räknaren.
 */

import { useEffect, useLayoutEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import type { Scope } from '@/lib/access/features'
import { useKomIgang } from '@/components/dashboard/KomIgangContext'
import { IlluValkommenCv, IlluValkommenTest } from '@/components/illustrations/OnboardingScener'
import { IkonCv } from '@/components/illustrations/Ikoner'
import { valkommen, valkommenMedCv, VALKOMMEN_STEG_ETIKETT } from '@/lib/onboarding/komigang'
import { capture } from '@/lib/analytics/events'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

const KNAPP_PRIMAR =
  'inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover sm:w-auto sm:min-w-[220px]'
const KNAPP_SEKUNDAR =
  'inline-flex h-11 w-full items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-semibold text-ink-1 transition-colors hover:bg-insunken sm:w-auto sm:min-w-[220px]'

export interface ValkommenClientProps {
  paket: Scope
  cvNamn: string | null
  cvUppladdat: string | null
  poang: number | null
  /** Köpet var Dagspasset: scopet är allt, men namnet ska vara Dagspasset. */
  dagspass?: boolean
}

export default function ValkommenClient({ paket, cvNamn, cvUppladdat, poang, dagspass = false }: ValkommenClientProps) {
  const router = useRouter()
  const { oppna } = useKomIgang()

  // Samma grepp som FlowShell: skalet äger hela skärmen, header och
  // bottennav döljs via attributet, och variabeln nollas så inget räknar
  // mot ett nav som inte syns. Före paint, så inget hoppar.
  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement
    const previous = root.style.getPropertyValue('--bottom-nav-h')
    root.style.setProperty('--bottom-nav-h', '0px')
    root.setAttribute('data-flow-active', 'true')
    return () => {
      if (previous) root.style.setProperty('--bottom-nav-h', previous)
      else root.style.removeProperty('--bottom-nav-h')
      root.removeAttribute('data-flow-active')
    }
  }, [])

  // welcome_viewed en gång per montering: skärmen är det första köparen ser
  // efter Stripe, och has_cv säger vilken av de två varianterna som visades.
  const matt = useRef(false)
  useEffect(() => {
    if (matt.current) return
    matt.current = true
    capture('welcome_viewed', { paket, has_cv: Boolean(cvNamn) })
  }, [paket, cvNamn])

  const bas = valkommen(paket, dagspass)
  const medCv =
    (paket === 'cv' || paket === 'allt') && cvNamn
      ? valkommenMedCv(paket, cvNamn, cvUppladdat, poang, dagspass)
      : null
  const Scen = paket === 'tester' ? IlluValkommenTest : IlluValkommenCv
  const scenTitel =
    paket === 'tester' ? 'Matrislogik och en klocka' : 'Två CV och en uppladdningspil på tråden'

  const rubrik = medCv?.rubrik ?? bas.rubrik
  const ingress = medCv?.ingress ?? bas.ingress
  const primar = medCv?.primar ?? bas.primar
  const primarHref = medCv?.primarHref ?? bas.primarHref

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-mark lg:left-64">
      <header className="flex-shrink-0 border-b border-kant bg-panel">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-1 px-2">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            aria-label="Till hemskärmen"
            className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-insunken hover:text-ink-1"
          >
            <X className="h-6 w-6" strokeWidth={1.75} />
          </button>
          <h1 className="min-w-0 flex-1 truncate font-display text-[17px] font-extrabold tracking-[-0.02em] text-ink-1">
            {bas.topp}
          </h1>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-3xl px-4 pb-4 pt-5">
          <h2 className="font-display text-[26px] font-bold leading-[31px] tracking-[-0.02em] text-ink-1">
            {rubrik}
          </h2>
          <p className="mt-1.5 text-sm leading-[22px] text-ink-2">{ingress}</p>

          {medCv ? (
            /* Det liggande CV:t som en rad: namnet, när det kom, poängen. */
            <section
              className="mt-4 flex items-center gap-3 rounded-xl border border-kant bg-panel p-4"
              aria-label="Ditt CV"
            >
              <span aria-hidden="true" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-insunken text-ink-2">
                <IkonCv size={24} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-kort text-ink-1">{cvNamn}</span>
                {medCv.cvRad ? <span className="block text-meta text-ink-3">{medCv.cvRad}</span> : null}
              </span>
            </section>
          ) : (
            <div className="mt-4 rounded-xl border border-kant bg-panel p-4 text-ink-1">
              <Scen className="h-auto w-full" title={scenTitel} />
            </div>
          )}

          {medCv ? null : (
            <section className="mt-4" aria-label={VALKOMMEN_STEG_ETIKETT}>
              <p className="text-steg uppercase text-ink-3">{VALKOMMEN_STEG_ETIKETT}</p>
              <ol className="mt-2 grid gap-1.5">
                {bas.steg.map((steg, i) => (
                  <li key={steg} className="flex gap-3 text-sm leading-[22px] text-ink-2">
                    <span className="w-4 shrink-0 font-display font-bold text-ink-1">{i + 1}</span>
                    <span>{steg}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </main>

      <footer
        className="flex-shrink-0 border-t border-kant bg-panel"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
          <Link href={primarHref} className={KNAPP_PRIMAR} onClick={() => router.prefetch(primarHref)}>
            {primar}
          </Link>
          {medCv ? (
            <Link href="/dashboard/profil/cv" className={KNAPP_SEKUNDAR}>
              {medCv.sekundar}
            </Link>
          ) : (
            <button type="button" onClick={() => oppna('valkomst')} className={KNAPP_SEKUNDAR}>
              {bas.sekundar}
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}
