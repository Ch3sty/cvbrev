'use client'

/**
 * Startskärmen (plan-testflode-2026-11-20 avsnitt 4.1), byggd ur
 * övningsprovets Startark. Den enda plats där en session skapas, och den
 * renderas på servern med initialdata. Uppifrån:
 *
 *   1  topprad på väggen med tillbaka och lägets namn (inte i nivåtestets
 *      startsida, där rummets egen topprad står)
 *   2  eyebrow i koppar-ljus: typens namn
 *   3  rubriken i .text-h1
 *   4  scenen: typens provblad, 160 × 120 till höger på dator, 96 px hög
 *      över texten på mobil, ritas in 600 ms första gången
 *   5  tre regler, alltid tre och i samma ordning: omfång, återkoppling,
 *      vad som sparas (Träna: kryssrutan som andra regel)
 *   6  det lyfta kortet med exakt en kopparknapp och en fotnot; knappen står
 *      i foten på mobil
 *
 * Låst läge: kortet byts mot betalväggen (PaywallCard eller kvotkortet) som
 * anroparen ritar; ingen kopparknapp i foten då.
 */

import { useEffect, useRef, type ReactNode } from 'react'
import Link from 'next/link'
import { IkonFlagga, IkonInfo, IkonKlocka, IkonTillbaka } from '@/components/illustrations/RumSymboler'
import { KNAPP_PRIMAR } from '@/components/shell/knappar'
import { scenFor, type ScenId } from './scener'
import { SESSION, LAGESNAMN } from './copy'
import { sessionHandelser, type SessionHandelseBas } from './handelser'
import { Snurra } from './SessionsRam'
import { useRamLage } from './useRamLage'

export interface StartRegel {
  titel: string
  text?: string | null
}

export interface StartKnapp {
  text: string
  onClick: () => void
  laddar?: boolean
  disabled?: boolean
}

export interface StartskarmProps {
  bas: SessionHandelseBas
  /** Nivåtestets startsida: i rummet, utan egen topprad och fot. */
  inline?: boolean
  /** Toppradens tillbaka (fasta varianten). */
  tillbakaHref?: string
  eyebrow: string
  rubrik: string
  /** Formatraden under rubriken (övningsprovets format). */
  formatrad?: string | null
  scen: ScenId
  /** Rita in scenen (första visningen, inte vid Fortsätt eller betalväggen). */
  rita?: boolean
  regler: [StartRegel, StartRegel | null, StartRegel]
  /** Träna: kryssrutan i regel 2. */
  kryssruta?: { varde: boolean; onAndra: (v: boolean) => void } | null
  knapp?: StartKnapp | null
  /** Raden över knappen i kortet ("Du har 9 uppgifter kvar.", fel). */
  kortRad?: ReactNode
  fotnot?: string | null
  /** Betalväggen eller kvotkortet i kortets plats. */
  sparr?: ReactNode
  sparrad: 'none' | 'quota' | 'premium'
  fortsattTillganglig: boolean
  /** Under kortet: Ditt bästa, Dina försök, hjälpen. */
  efter?: ReactNode
  /** Toppraden i rummet (inline): anroparens egen. */
  topprad?: ReactNode
}

const IKON = [IkonKlocka, IkonInfo, IkonFlagga]

function Kryssruta({ varde, onAndra }: { varde: boolean; onAndra: (v: boolean) => void }) {
  return (
    <label className="flex min-h-[52px] cursor-pointer items-center gap-3 px-3.5 py-2" data-kryssruta>
      <input type="checkbox" className="peer sr-only" checked={varde} onChange={(e) => onAndra(e.target.checked)} />
      <span
        aria-hidden="true"
        className={`inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border-2 transition-colors duration-150 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-vagg-ink ${
          varde ? 'border-koppar bg-koppar text-[color:var(--koppar-text,#1a1a1a)]' : 'border-vagg-mjuk bg-transparent'
        }`}
      >
        {varde ? (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        ) : null}
      </span>
      <span className="min-w-0">
        <b className="block text-sm font-semibold leading-[19px] text-vagg-ink">{SESSION.start.kryssruta}</b>
        <span className="block text-[12px] leading-4 text-vagg-mjuk">{varde ? SESSION.start.kryssrutaPa : SESSION.start.kryssrutaAv}</span>
      </span>
    </label>
  )
}

function Vaggen({ p, topp }: { p: StartskarmProps; topp: ReactNode }) {
  const Scen = scenFor(p.scen)
  return (
    <>
      {topp}
      <div className="flex flex-col lg:flex-row-reverse lg:items-center lg:gap-10">
        <div className="illu-vagg mx-auto mt-1 flex-shrink-0 lg:mx-0 lg:mt-0" aria-hidden="true">
          <Scen rita={p.rita} className="h-24 w-auto lg:h-[120px] lg:w-[160px]" />
        </div>
        <div className="mt-4 min-w-0 flex-1 lg:mt-0">
          <p className="text-ey uppercase text-koppar-ljus">{p.eyebrow}</p>
          <h1 className="text-h1 mt-1 text-vagg-ink" data-start-rubrik>
            {p.rubrik}
          </h1>
          {p.formatrad ? <p className="mt-2 text-[15px] leading-[22px] text-vagg-mjuk">{p.formatrad}</p> : null}
        </div>
      </div>
      <ul aria-label={SESSION.start.reglerAria} className="mt-5 list-none overflow-hidden rounded-xl border border-vagg-kant bg-white/[.05] p-0" data-start-regler>
        {p.regler.map((r, i) => {
          const Ikon = IKON[i]
          const kant = i ? 'border-t border-vagg-kant' : ''
          if (!r && p.kryssruta) {
            return (
              <li key="kryss" className={kant}>
                <Kryssruta varde={p.kryssruta.varde} onAndra={p.kryssruta.onAndra} />
              </li>
            )
          }
          if (!r) return null
          return (
            <li key={i} className={`flex min-h-[52px] items-center gap-3 px-3.5 py-2.5 ${kant}`}>
              <Ikon size={28} className="flex-shrink-0 text-vagg-ink" />
              <span className="min-w-0">
                <b className="block text-sm font-semibold leading-[19px] text-vagg-ink">{r.titel}</b>
                {r.text ? <span className="mt-0.5 block text-[12px] leading-4 text-vagg-mjuk">{r.text}</span> : null}
              </span>
            </li>
          )
        })}
      </ul>
    </>
  )
}

export default function Startskarm(p: StartskarmProps) {
  const fotRef = useRef<HTMLElement | null>(null)
  const visad = useRef(false)
  useEffect(() => {
    if (visad.current) return
    visad.current = true
    sessionHandelser.startVisad(p.bas, { fortsatt_tillganglig: p.fortsattTillganglig, sparrad: p.sparrad })
    // En gång per montering.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const lyft = 'relative z-[2] -mt-[30px] rounded-2xl border border-[color:var(--lyft-kant)] bg-papper p-4 shadow-lyft sm:p-5'
  const knappEl = (klass: string) =>
    p.knapp ? (
      <button
        type="button"
        onClick={p.knapp.onClick}
        disabled={p.knapp.disabled || p.knapp.laddar}
        aria-busy={p.knapp.laddar || undefined}
        className={`${KNAPP_PRIMAR} ${klass}`}
        data-starta
      >
        {p.knapp.laddar ? <Snurra /> : null}
        {p.knapp.laddar ? SESSION.start.startar : p.knapp.text}
      </button>
    ) : null

  const kort = p.sparr ? (
    <div className="relative z-[2] -mt-[30px]" data-start-sparr={p.sparrad}>
      {p.sparr}
    </div>
  ) : (
    <section className={lyft} data-start-kort>
      {p.kortRad ? <div className="mb-3 text-sm leading-5 text-ink-2">{p.kortRad}</div> : null}
      {knappEl(p.inline ? 'sm:w-auto sm:min-w-[220px]' : 'hidden lg:inline-flex lg:w-auto lg:min-w-[240px]')}
      {p.fotnot ? <p className={`text-[13px] leading-[18px] text-ink-3 ${p.inline ? 'mt-2.5' : 'lg:mt-2.5'}`}>{p.fotnot}</p> : null}
    </section>
  )

  if (p.inline) {
    return (
      <div data-sessionsram="start" data-startskarm={p.bas.lage}>
        <div className="vagg px-4 pb-11 lg:px-10">
          <div className="mx-auto w-full max-w-[1120px]">
            <div className="max-w-3xl">
              <Vaggen p={p} topp={p.topprad ?? null} />
            </div>
          </div>
        </div>
        <div className="flex-1 px-4 lg:px-10">
          <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-4">
            <div className="w-full max-w-3xl">{kort}</div>
            {p.efter}
          </div>
        </div>
      </div>
    )
  }

  return <FastStart p={p} kort={kort} knappEl={knappEl} fotRef={fotRef} />
}

function FastStart({
  p,
  kort,
  knappEl,
  fotRef,
}: {
  p: StartskarmProps
  kort: ReactNode
  knappEl: (klass: string) => ReactNode
  fotRef: React.RefObject<HTMLElement | null>
}) {
  const harFot = Boolean(p.knapp) && !p.sparr
  useRamLage(fotRef, harFot)
  const topp = (
    <div className="-mx-1 flex h-14 items-center gap-2 text-vagg-ink">
      <Link href={p.tillbakaHref ?? '/dashboard/tester'} aria-label={SESSION.start.tillbaka} className="-ml-1 inline-flex h-11 w-11 items-center justify-center rounded-[10px]" data-kryss="">
        <IkonTillbaka />
      </Link>
      <span className="flex-1 text-center text-[15px] font-semibold tracking-[-.01em]">{LAGESNAMN[p.bas.lage]}</span>
      <span className="w-11" aria-hidden="true" />
    </div>
  )
  return (
    <div className="fixed inset-0 z-50 flex h-dvh flex-col bg-golv font-sess-text" data-sessionsram="start" data-startskarm={p.bas.lage}>
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="vagg px-4 pb-11 lg:px-10">
          <div className="mx-auto w-full max-w-[560px] lg:max-w-[672px]">
            <Vaggen p={p} topp={topp} />
          </div>
        </div>
        <div className="px-4 pb-6 lg:px-10">
          <div className="mx-auto w-full max-w-[560px] lg:max-w-[672px]">
            {kort}
            {p.efter}
          </div>
        </div>
      </main>
      {harFot ? (
        <footer ref={fotRef} className="flex-shrink-0 border-t border-kant bg-papper lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div className="mx-auto flex min-h-[72px] w-full max-w-[560px] items-center px-4 py-3">{knappEl('')}</div>
        </footer>
      ) : null}
    </div>
  )
}
