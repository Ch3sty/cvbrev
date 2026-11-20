'use client'

/**
 * Sessionsramen (plan-testflode-2026-11-20 avsnitt 1): en ram för alla
 * lägen och typer.
 *
 *   +----------------------------------------------------------+
 *   | [X]  Figurserier                          3 / 15   (o)   |  huvud 56 px, papper
 *   |      Nivåtest, grundnivå                                  |
 *   |■■■■■■■■■■■■■■■□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□|  framstegsstapel 6 px
 *   |  [uppgift och svar, Förklaringen i Träna]                 |  main, golv, enda scrollytan
 *   | [‹ eller Vet inte]  [          Nästa                   ] |  fot 72 px + safe area
 *   +----------------------------------------------------------+
 *
 * Ramen läser lägesreglerna och fattar inga beslut om typen; typen ritar
 * bara sin uppgift i main. Huvudets och fotens innehåll följer
 * innehållsformens kolumn, framstegsstapeln går över hela bredden.
 * fixed inset-0 på alla enheter: sidomenyn är borta under sessionen.
 *
 * X öppnar alltid avbryt-dialogen (utom i genomgången, där X stänger).
 * Andra trycket på X stänger dialogen igen: i appen Testklar trycker
 * Android-tillbaka på krysset (data-kryss).
 *
 * Tangentbord: A till F eller 1 till 6 markerar, Enter trycker på
 * primärknappen, Backsteg eller vänsterpil går till föregående där det är
 * tillåtet, Esc öppnar avbryt-dialogen. Av när en dialog eller arket är öppet.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { IkonChev, IkonTillbaka, IkonX } from '@/components/illustrations/RumSymboler'
import { KNAPP_PRIMAR } from '@/components/shell/knappar'
import { SESSION } from './copy'
import type { Innehallsform, Lage } from './lagesregler'
import RamDialog from './RamDialog'
import Uppgiftsarket, { type ArkCell } from './Uppgiftsarket'
import { useRamLage } from './useRamLage'

export interface RamPrimar {
  text: string
  onClick: () => void
  disabled?: boolean
  /** Spinner i knappen medan servern svarar (Träna, Nivåkollens sista). */
  laddar?: boolean
  data?: string
}

export type RamVanster =
  | { typ: 'tillbaka'; onClick: () => void; disabled?: boolean }
  | { typ: 'vet_inte'; text: string; onClick: () => void; disabled?: boolean }

export interface SessionsRamProps {
  lage: Lage
  titel: string
  undertitel: string
  form: Innehallsform
  /** "3 / 15". Null döljer räknaren. */
  raknare: { nr: number; antal: number } | null
  /** 0 till 1, null döljer stapelns fyllning. */
  framsteg: number | null
  klocka?: ReactNode
  /** Uppgiftens nyckel: byts den rullas main till toppen och uppgiften glider in. */
  nyckel?: string
  /** Samma underlag som förra uppgiften: rullningen står kvar. */
  behallRullning?: boolean
  fot: { vanster?: RamVanster | null; primar: RamPrimar } | null
  /** Utanför genomgången: X frågar först. */
  bekraftaAvbryt: boolean
  /** Efter bekräftad avbrytning, eller direkt när bekraftaAvbryt är falskt. */
  onAvbryt: () => void
  /** Lämna in-dialogen, styrd av läget. */
  lamnaIn?: {
    open: boolean
    obesvarade: number
    onBekrafta: () => void | Promise<void>
    onStang: () => void
    /** Egna ord (I-provet: "Avsluta deltestet?"), etapp 4. Utelämnade: "Lämna in?". */
    titel?: string
    text?: string
    bekrafta?: string
  } | null
  /** Uppgiftsarket, bara i lägen med väg tillbaka. */
  ark?: { celler: ArkCell[]; onValj: (i: number) => void; grupper?: { fran: number; rubrik: string }[] } | null
  /** Bokstäverna markerar alternativ. */
  tangent?: { antal: number; onValj: (i: number) => void } | null
  /** Raden ovanför foten, till exempel "Ett svar sparades inte". */
  rad?: ReactNode
  /**
   * Underlaget (typens underlag, etapp 2): egen spalt till vänster på dator,
   * fäst överst på mobil. Monteras om bara när nyckeln byts, så att texten
   * står kvar (med sin rullning) medan påståendena byts.
   */
  underlag?: { nyckel: string; innehall: ReactNode } | null
  children: ReactNode
}

const KOLUMN: Record<Innehallsform, string> = {
  smal: 'max-w-[560px] lg:max-w-[432px]',
  mellan: 'max-w-[560px]',
  remsa: 'max-w-[672px]',
  bred: 'max-w-[560px] lg:max-w-[1000px]',
}

export function Snurra() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" className="sess-snurr flex-shrink-0">
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="2" />
      <path d="M14 8a6 6 0 0 0-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

const ARVEND = new Set(['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT', 'SUMMARY'])

export default function SessionsRam({
  lage,
  titel,
  undertitel,
  form,
  raknare,
  framsteg,
  klocka,
  nyckel,
  behallRullning = false,
  fot,
  bekraftaAvbryt,
  onAvbryt,
  lamnaIn = null,
  ark = null,
  tangent = null,
  rad,
  underlag = null,
  children,
}: SessionsRamProps) {
  const fotRef = useRef<HTMLElement | null>(null)
  const mainRef = useRef<HTMLElement | null>(null)
  const innehallRef = useRef<HTMLDivElement | null>(null)
  const raknarRef = useRef<HTMLButtonElement | null>(null)
  const [fragarAvbryt, setFragarAvbryt] = useState(false)
  const [arkOppet, setArkOppet] = useState(false)
  useRamLage(fotRef, Boolean(fot))

  // Ny uppgift: till toppen (utom samma underlag) och fokus på uppgiftens
  // rubrik, utan synlig ring och utan att rulla.
  const forsta = useRef(true)
  useEffect(() => {
    if (forsta.current) {
      forsta.current = false
      return
    }
    if (!behallRullning && mainRef.current) mainRef.current.scrollTop = 0
    const rubrik = innehallRef.current?.querySelector<HTMLElement>('[data-uppgift-rubrik]')
    rubrik?.focus({ preventScroll: true })
    // behallRullning läses vid bytet, inte som beroende.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nyckel])

  const trycktKryss = useCallback(() => {
    if (bekraftaAvbryt) setFragarAvbryt((v) => !v)
    else onAvbryt()
  }, [bekraftaAvbryt, onAvbryt])

  // Avbryt-dialogen stängd med Fortsätt eller Esc: dialogen lämnar fokus på
  // krysset, och då hade Enter direkt efter öppnat den igen. Fokus går till
  // uppgiftens rubrik i stället, så att Enter trycker på primärknappen
  // (etapp 4, rättelse från etapp 2).
  const avbrytVarOppen = useRef(false)
  useEffect(() => {
    if (fragarAvbryt) {
      avbrytVarOppen.current = true
      return
    }
    if (!avbrytVarOppen.current) return
    avbrytVarOppen.current = false
    const mal = innehallRef.current?.querySelector<HTMLElement>('[data-uppgift-rubrik]') ?? mainRef.current
    mal?.focus({ preventScroll: true })
  }, [fragarAvbryt])

  const dialogOppen = fragarAvbryt || arkOppet || Boolean(lamnaIn?.open)

  // Tangentbordet. Refs så att lyssnaren inte byts per tick.
  const stateRef = useRef({ fot, tangent, dialogOppen, trycktKryss })
  stateRef.current = { fot, tangent, dialogOppen, trycktKryss }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = stateRef.current
      if (s.dialogOppen || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
      const mal = e.target as HTMLElement | null
      const iFalt = mal?.tagName === 'INPUT' || mal?.tagName === 'TEXTAREA' || mal?.isContentEditable
      if (iFalt) return
      // Tangenten hör till en dialog eller arket. Dialogen kan redan ha
      // stängts av samma tryck (Sheet lyssnar på document, React ritar om i
      // mikrotasken före window), så tillståndet ovan räcker inte.
      if (mal?.closest?.('[role="dialog"]')) return
      if (e.key === 'Escape') {
        e.preventDefault()
        s.trycktKryss()
        return
      }
      if (e.key === 'Enter') {
        // En knapp med fokus trycks av webbläsaren själv.
        if (mal && ARVEND.has(mal.tagName)) return
        const p = s.fot?.primar
        if (p && !p.disabled && !p.laddar) {
          e.preventDefault()
          p.onClick()
        }
        return
      }
      if (e.key === 'Backspace' || e.key === 'ArrowLeft') {
        const v = s.fot?.vanster
        if (v?.typ === 'tillbaka' && !v.disabled) {
          e.preventDefault()
          v.onClick()
        }
        return
      }
      if (!s.tangent) return
      const k = e.key.toLowerCase()
      let i = 'abcdef'.indexOf(k)
      if (i < 0 && /^[1-6]$/.test(k)) i = Number(k) - 1
      if (i >= 0 && k.length === 1 && i < s.tangent.antal) {
        e.preventDefault()
        s.tangent.onValj(i)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const kolumn = KOLUMN[form]
  const vanster = fot?.vanster ?? null
  const primar = fot?.primar ?? null

  return (
    <div className="fixed inset-0 z-50 flex h-dvh flex-col bg-golv font-sess-text" data-sessionsram={lage} data-pass-shell>
      <header className="flex-shrink-0 bg-papper">
        <div className={`mx-auto flex h-14 w-full items-center gap-1.5 pl-1 pr-2 lg:pr-1 ${kolumn}`}>
          <button
            type="button"
            onClick={trycktKryss}
            aria-label={bekraftaAvbryt ? SESSION.avbryt.aria : SESSION.resultat.stang}
            data-kryss=""
            className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] text-ink-1 transition-colors hover:bg-papper-2"
          >
            <IkonX />
          </button>
          <p className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-semibold leading-5 text-ink-1" data-ram-titel>
              {titel}
            </span>
            <span className="block truncate text-xs font-medium leading-4 text-ink-3" data-ram-undertitel>
              {undertitel}
            </span>
          </p>
          {raknare ? (
            ark ? (
              <button
                ref={raknarRef}
                type="button"
                onClick={() => setArkOppet(true)}
                aria-label={SESSION.raknare.oppna(raknare.nr, raknare.antal)}
                aria-haspopup="dialog"
                aria-expanded={arkOppet}
                className="inline-flex h-11 flex-shrink-0 items-center gap-0.5 rounded-[10px] pl-2.5 pr-1.5 text-[13px] font-medium tabular-nums text-ink-2 transition-colors hover:bg-papper-2"
                data-raknare
              >
                {raknare.nr} / {raknare.antal}
                <IkonChev size={16} className="rotate-90 text-ink-3" />
              </button>
            ) : (
              <span className="inline-flex h-11 flex-shrink-0 items-center px-2 text-[13px] font-medium tabular-nums text-ink-2" aria-hidden="true" data-raknare>
                {raknare.nr} / {raknare.antal}
              </span>
            )
          ) : null}
          {klocka ? <span className="ml-1 flex-shrink-0">{klocka}</span> : null}
        </div>
        <div
          className="relative h-1.5 w-full overflow-hidden bg-kant"
          role={raknare ? 'progressbar' : undefined}
          aria-label={raknare ? SESSION.framstegAria(raknare.nr, raknare.antal) : undefined}
          aria-valuemin={raknare ? 0 : undefined}
          aria-valuemax={raknare ? raknare.antal : undefined}
          aria-valuenow={raknare ? raknare.nr : undefined}
        >
          <i
            className="sess-framsteg absolute inset-0 block bg-koppar"
            style={{ transform: `scaleX(${Math.max(0, Math.min(1, framsteg ?? 0))})` }}
          />
        </div>
        {raknare ? (
          <span className="sr-only" aria-live="polite">
            {SESSION.raknare.aria(raknare.nr, raknare.antal)}
          </span>
        ) : null}
      </header>

      <main ref={mainRef} tabIndex={-1} className="min-h-0 flex-1 overflow-y-auto overscroll-contain outline-none">
        <div ref={innehallRef} className={`serie-kolumn mx-auto w-full px-4 pb-6 pt-4 lg:pb-10 lg:pt-10 ${kolumn}`}>
          {underlag ? (
            <div className="lg:grid lg:grid-cols-[minmax(0,560px)_minmax(0,400px)] lg:items-start lg:gap-10" data-ram-bred>
              <div
                key={`u-${underlag.nyckel}`}
                // Fäst överst på mobil medan hon svarar. När Förklaringen står
                // under svaren (Träna, genomgången) rullar underlaget med, så
                // att påståendet och rätt svar syns ovanför förklaringen.
                className="sess-in sticky top-0 z-10 -mx-4 -mt-4 bg-golv px-4 pb-3 pt-4 max-lg:[&:has(~*_[data-forklaringen])]:static lg:top-0 lg:m-0 lg:bg-transparent lg:p-0"
                data-ram-underlag
              >
                {underlag.innehall}
              </div>
              <div key={nyckel} className={nyckel ? 'sess-in' : undefined}>
                {children}
              </div>
            </div>
          ) : (
            <div key={nyckel} className={nyckel ? 'sess-in' : undefined}>
              {children}
            </div>
          )}
        </div>
      </main>

      {rad ? <div className={`mx-auto w-full flex-shrink-0 px-4 pb-2 ${kolumn}`}>{rad}</div> : null}

      {fot && primar ? (
        <footer ref={fotRef} className="flex-shrink-0 border-t border-kant bg-papper" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div className={`mx-auto flex min-h-[72px] w-full items-center gap-3 px-4 py-3 ${kolumn}`}>
            {vanster?.typ === 'tillbaka' ? (
              <button
                type="button"
                onClick={vanster.onClick}
                disabled={vanster.disabled}
                aria-label={SESSION.foregaende}
                className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-kant-stark bg-papper text-ink-1 transition-colors hover:bg-papper-2 disabled:cursor-not-allowed disabled:opacity-40"
                data-foregaende
              >
                <IkonTillbaka />
              </button>
            ) : vanster?.typ === 'vet_inte' ? (
              <button
                type="button"
                onClick={vanster.onClick}
                disabled={vanster.disabled}
                className="inline-flex min-h-11 max-w-[46%] flex-shrink items-center px-1 text-left text-sm font-medium leading-[18px] text-ink-1 underline decoration-kant-stark underline-offset-4 disabled:opacity-40"
                data-vet-inte
              >
                {vanster.text}
              </button>
            ) : null}
            <button
              type="button"
              onClick={primar.onClick}
              disabled={primar.disabled || primar.laddar}
              aria-busy={primar.laddar || undefined}
              className={`${KNAPP_PRIMAR} min-w-0 flex-1 touch-manipulation disabled:cursor-not-allowed`}
              data-primar={primar.data ?? ''}
            >
              {primar.laddar ? <Snurra /> : null}
              <span className="truncate">{primar.text}</span>
            </button>
          </div>
        </footer>
      ) : null}

      <RamDialog
        open={fragarAvbryt}
        titel={SESSION.avbryt.titel(lage)}
        text={SESSION.avbryt.text(lage)}
        primar={SESSION.avbryt.fortsatt}
        lank={SESSION.avbryt.avbryt}
        onPrimar={() => setFragarAvbryt(false)}
        onLank={() => {
          setFragarAvbryt(false)
          onAvbryt()
        }}
        onStang={() => setFragarAvbryt(false)}
        data="avbryt"
      />
      {lamnaIn ? (
        <RamDialog
          open={lamnaIn.open}
          titel={lamnaIn.titel ?? SESSION.lamnaIn.titel}
          text={lamnaIn.text ?? SESSION.lamnaIn.text(lamnaIn.obesvarade)}
          primar={lamnaIn.bekrafta ?? SESSION.lamnaIn.bekrafta}
          lank={SESSION.lamnaIn.fortsatt}
          onPrimar={lamnaIn.onBekrafta}
          onLank={lamnaIn.onStang}
          onStang={lamnaIn.onStang}
          data="lamna-in"
        />
      ) : null}
      {ark ? (
        <Uppgiftsarket
          open={arkOppet}
          celler={ark.celler}
          grupper={ark.grupper}
          ankare={raknarRef.current}
          onStang={() => setArkOppet(false)}
          onValj={(i) => {
            setArkOppet(false)
            ark.onValj(i)
          }}
        />
      ) : null}
    </div>
  )
}
