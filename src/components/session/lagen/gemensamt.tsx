'use client'

// Delat mellan lägesflödena: sparfelsraden, felkortet, avbrottet när sidan
// lämnas och tiden som tickar.

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { KNAPP_PRIMAR, LANK } from '@/components/shell/knappar'
import { SESSION } from '../copy'
import type { RamUppgift, TypRitare } from '../typ'
import type { UppgiftslistanProps } from '../Uppgiftslistan'

/** "Ett svar sparades inte." med Försök igen, ovanför foten. Aldrig blockerande. */
export function Sparfelsrad({ antal, onForsok }: { antal: number; onForsok: () => void }) {
  if (antal <= 0) return null
  return (
    <p role="alert" className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-kant bg-papper px-3.5 py-1.5 text-sm leading-5 text-ink-1" data-sparfel>
      <span>{antal === 1 ? SESSION.sparfel.rad : SESSION.sparfel.flera(antal)}</span>
      <button type="button" onClick={onForsok} className={`${LANK} inline-flex min-h-11 items-center`}>
        {SESSION.sparfel.knapp}
      </button>
    </p>
  )
}

/** Meddelandekortet i main: startfel, hämtfel, avslutsfel (mönstret från det raderade FigurPassFlode). */
export function Meddelande({ titel, text, children }: { titel: string; text?: string | null; children?: ReactNode }) {
  return (
    <section role="status" className="rounded-xl border border-kant bg-papper p-4" data-meddelande>
      <h2 className="text-kort-t text-ink-1">{titel}</h2>
      {text ? <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{text}</p> : null}
      {children}
    </section>
  )
}

export function ForsokIgen({ onClick, tillbakaHref, tillbaka }: { onClick: () => void; tillbakaHref?: string; tillbaka?: string }) {
  return (
    <div className="mt-3.5 flex flex-col items-stretch gap-2.5">
      <button type="button" onClick={onClick} className={KNAPP_PRIMAR}>
        {SESSION.knapp.forsokIgen}
      </button>
      {tillbakaHref ? (
        <a href={tillbakaHref} className={`${LANK} inline-flex min-h-9 items-center justify-center`}>
          {tillbaka}
        </a>
      ) : null}
    </div>
  )
}

/** Typens underlag till ramens plats (etapp 2), null när typen ritar allt själv. */
export function ramUnderlag<U extends RamUppgift>(ritare: TypRitare<U>, u: U, genomgang = false): { nyckel: string; innehall: ReactNode } | null {
  const ul = ritare.underlag
  if (!ul) return null
  const Ritare = ul.Ritare
  return { nyckel: ul.nyckel(u), innehall: <Ritare u={u} genomgang={genomgang} /> }
}

/** Sekunder sedan en tidpunkt, uppdaterat varje sekund medan aktiv. */
export function useSekunderSedan(fran: number | null, aktiv: boolean): number {
  const [nu, setNu] = useState(() => Date.now())
  useEffect(() => {
    if (!aktiv) return
    setNu(Date.now())
    const t = setInterval(() => setNu(Date.now()), 1000)
    return () => clearInterval(t)
  }, [aktiv, fran])
  return fran == null ? 0 : Math.max(0, (nu - fran) / 1000)
}

/**
 * test_session_abandoned när sidan lämnas mitt i en session (avsnitt 8.2).
 * En gång per session; X-avbrottet skjuter sin egen.
 */
export function useLamnadSida(aktiv: boolean, skjut: () => void) {
  const ref = useRef(skjut)
  ref.current = skjut
  const skjuten = useRef(false)
  useEffect(() => {
    if (!aktiv) return
    const onHide = () => {
      if (skjuten.current) return
      skjuten.current = true
      ref.current()
    }
    window.addEventListener('pagehide', onHide)
    return () => window.removeEventListener('pagehide', onHide)
  }, [aktiv])
  return () => {
    skjuten.current = true
  }
}

/**
 * Uppgiftslistan färdig från läget (omgång 2 steg A): resultatets ctrl.lista
 * i Träna, Nivåkollen och övningsprovet. Typens resultatvy lägger den i
 * Resultatskarm som genomgang.lista; "Gå igenom" är genomgang.onGaIgenom.
 */
export type ResultatLista<U extends RamUppgift> = Omit<UppgiftslistanProps<U>, 'onGaIgenom'>

/** ResultatLista utan typparameter, för typernas resultatvyer som bara skickar den vidare till Resultatskarm. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResultatListaVidare = ResultatLista<any>
