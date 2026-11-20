'use client'

/**
 * Sessionsramen (plan-testflode-2026-11-20 avsnitt 1, omgång 2 steg A): en
 * ram för alla lägen och typer.
 *
 *   +----------------------------------------------------------+
 *   | [X]  Figurserier                     3 / 16  ( 19:42 )    |  huvud 56 px, papper
 *   |      Nivåtest, grundnivå                                  |
 *   |■■■■■■■■■■■■■■■□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□|  framstegsstapel 6 px
 *   |  [uppgift och svar, Förklaringen i Träna]                 |  main, golv, enda scrollytan
 *   |  [‹]                              [ Nästa      ]          |  foten i kolumnen från lg
 *   |                                               [scen]      |  scenen på golvet från 1440
 *   +----------------------------------------------------------+
 *
 * Ytan (UX 2026-11-21 punkt 1, skissens Main, Ram-prov-2560 och -412):
 * - Mobil som förut i princip: foten är en rad över hela bredden längst ned
 *   (72 px plus safe area), sticky i main, så att svaren syns utan rullning.
 * - Från lg står foten i kolumnen direkt under innehållet, 24 px under sista
 *   svaret, sticky nedtill i main när innehållet är längre än skärmen. Nästa
 *   högst 360 px och högerställd, ‹ eller Vet inte till vänster. I Bred
 *   följer foten högerspalten.
 * - Kolumnen: Smal 432, Mellan 560, Remsa 672, Bred 1000 (560 + 40 + 400)
 *   från lg och ett steg större från xl (1280): 496, 600, 816 och 1120
 *   (640 + 40 + 440). Måtten är innehållets bredd (lagesregler FORM_BREDD).
 * - Toppluften från lg: clamp(40px, (100dvh − 920px) / 2, 120px), så att
 *   rubriken står på samma pixel genom hela sessionen.
 * - Scenen på golvet (`scen`, typens id): ScenGolv nere till höger från 1440.
 *
 * Knappen flyttar aldrig i sidled mellan uppgifter och aldrig inom en
 * uppgift (Vet inte står kvar osynlig, CLS 0).
 *
 * Ramen läser lägesreglerna och fattar inga beslut om typen; typen ritar
 * bara sin uppgift i main. fixed inset-0 på alla enheter: sidomenyn är borta
 * under sessionen.
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
import ScenGolv from './ScenGolv'
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
  /** dold: platsen står kvar osynlig när uppgiften är besvarad, så att knappen bredvid inte flyttar (CLS 0). */
  | { typ: 'vet_inte'; text: string; onClick: () => void; disabled?: boolean; dold?: boolean }

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
  /**
   * Typens id för scenen på golvet (ScenGolv, från 1440 px): samma nycklar
   * som scener/ (matris, figurserie, deduktiv, verbal, numerisk, talserie,
   * spatial, ordforrad, personlighet, iprov). Utelämnad: ingen scen.
   */
  scen?: string | null
  children: ReactNode
}

/** Huvudets kolumn: innehållets bredd plus 16 px på var sida. */
const HUVUD: Record<Innehallsform, string> = {
  smal: 'max-w-[560px] lg:max-w-[464px] xl:max-w-[528px]',
  mellan: 'max-w-[560px] lg:max-w-[592px] xl:max-w-[632px]',
  remsa: 'max-w-[672px] lg:max-w-[704px] xl:max-w-[848px]',
  bred: 'max-w-[560px] lg:max-w-[1032px] xl:max-w-[1152px]',
}

/** Kolumnen från lg (med 16 px sidluft): innehållet blir FORM_BREDD och FORM_BREDD_XL. */
const KOLUMN_LG: Record<Innehallsform, string> = {
  smal: 'lg:max-w-[464px] xl:max-w-[528px]',
  mellan: 'lg:max-w-[592px] xl:max-w-[632px]',
  remsa: 'lg:max-w-[704px] xl:max-w-[848px]',
  bred: 'lg:max-w-[1032px] xl:max-w-[1152px]',
}

/** Innehållets bredd under lg, som förut (kolumnen 560 eller 672 med 16 px sidluft). */
const MOBIL: Record<Innehallsform, string> = {
  smal: 'max-w-[528px]',
  mellan: 'max-w-[528px]',
  remsa: 'max-w-[640px]',
  bred: 'max-w-[528px]',
}

/** Bred från lg: underlaget (eller villkoren) till vänster, uppgiften och foten till höger. */
const BRED_GRID = 'lg:grid lg:grid-cols-[minmax(0,560px)_minmax(0,400px)] lg:items-start lg:gap-x-10 xl:grid-cols-[minmax(0,640px)_minmax(0,440px)]'
/** Foten i Bred utan underlag (typen ritar sina två spalter själv): knapparna under högerspalten. */
const BRED_FOT = 'lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-x-10 xl:grid-cols-[minmax(0,1fr)_440px]'
/** Toppluften från lg (lagesregler TOPPLUFT). */
const TOPPLUFT = 'lg:pt-[clamp(40px,calc((100dvh_-_920px)_/_2),120px)]'
const TOPPLUFT_STICKY = 'lg:top-[clamp(40px,calc((100dvh_-_920px)_/_2),120px)]'

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
  scen = null,
  children,
}: SessionsRamProps) {
  const fotRef = useRef<HTMLElement | null>(null)
  const mainRef = useRef<HTMLElement | null>(null)
  const innehallRef = useRef<HTMLDivElement | null>(null)
  const raknarRef = useRef<HTMLButtonElement | null>(null)
  const vaktRef = useRef<HTMLDivElement | null>(null)
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

  const vanster = fot?.vanster ?? null
  const primar = fot?.primar ?? null
  const bred = form === 'bred'
  const bredUtanUnderlag = bred && !underlag
  const mobil = MOBIL[form]

  // Foten: en rad över hela bredden längst ned på mobil (sticky i main, mt-auto
  // när innehållet är kort), i kolumnen direkt under innehållet från lg.
  const fotrad =
    (fot && primar) || rad ? (
      <div className="sticky bottom-0 z-20 -mx-4 mt-auto lg:mx-0 lg:mt-0" data-ram-fot>
        {rad ? <div className={`mx-auto w-full bg-golv px-4 pb-2 lg:max-w-none lg:px-0 lg:pb-0 lg:pt-3 ${mobil}`}>{rad}</div> : null}
        {fot && primar ? (
          <footer ref={fotRef} className="border-t border-kant bg-papper pb-[env(safe-area-inset-bottom,0px)] lg:border-0 lg:bg-golv lg:pb-4 lg:pt-6">
            <div className={bredUtanUnderlag ? BRED_FOT : undefined}>
              <div className={`mx-auto flex min-h-[72px] w-full items-center gap-3 px-4 py-3 lg:col-start-2 lg:min-h-0 lg:max-w-none lg:justify-end lg:p-0 ${mobil}`}>
                {vanster?.typ === 'tillbaka' ? (
                  <button
                    type="button"
                    onClick={vanster.onClick}
                    disabled={vanster.disabled}
                    aria-label={SESSION.foregaende}
                    className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-kant-stark bg-papper text-ink-1 transition-colors hover:bg-papper-2 disabled:cursor-not-allowed disabled:opacity-40 lg:mr-auto lg:border-kant"
                    data-foregaende
                  >
                    <IkonTillbaka />
                  </button>
                ) : vanster?.typ === 'vet_inte' ? (
                  <button
                    type="button"
                    onClick={vanster.onClick}
                    disabled={vanster.disabled || vanster.dold}
                    aria-hidden={vanster.dold || undefined}
                    tabIndex={vanster.dold ? -1 : undefined}
                    className={`inline-flex min-h-11 max-w-[46%] flex-shrink items-center px-1 text-left text-sm font-medium leading-[18px] text-ink-1 underline decoration-kant-stark underline-offset-4 lg:mr-auto ${vanster.dold ? 'invisible' : 'disabled:opacity-40'}`}
                    data-vet-inte={vanster.dold ? 'dold' : ''}
                  >
                    {vanster.text}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={primar.onClick}
                  disabled={primar.disabled || primar.laddar}
                  aria-busy={primar.laddar || undefined}
                  className={`${KNAPP_PRIMAR} relative min-w-0 flex-1 touch-manipulation disabled:cursor-not-allowed lg:max-w-[360px] lg:flex-[1_1_220px]`}
                  data-primar={primar.data ?? ''}
                >
                  {/* Snurran står utanför textens flöde och texten byts som ny
                      nod (nyckeln), så att Nästa, Lämna in och laddningen
                      aldrig flyttar något (slutkontrollen omgång 2, CLS 0). */}
                  {primar.laddar ? (
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                      <Snurra />
                    </span>
                  ) : null}
                  <span key={primar.text} className="truncate">
                    {primar.text}
                  </span>
                </button>
              </div>
            </div>
          </footer>
        ) : null}
      </div>
    ) : null

  return (
    <div className="fixed inset-0 z-50 flex h-dvh flex-col bg-golv font-sess-text" data-sessionsram={lage} data-pass-shell data-form={form}>
      <header className="relative z-20 flex-shrink-0 bg-papper">
        <div className={`mx-auto flex h-14 w-full items-center gap-1.5 pl-1 pr-2 lg:pr-1 ${HUVUD[form]}`}>
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
                className="inline-flex h-11 flex-shrink-0 items-center gap-0.5 rounded-[10px] pl-2 pr-1 text-[13px] font-medium tabular-nums text-ink-1 transition-colors hover:bg-papper-2"
                data-raknare
              >
                {raknare.nr} / {raknare.antal}
                <IkonChev size={16} className="rotate-90 text-ink-3" />
              </button>
            ) : (
              <span className="inline-flex h-11 flex-shrink-0 items-center px-1 text-[13px] font-medium tabular-nums text-ink-1" aria-hidden="true" data-raknare>
                {raknare.nr} / {raknare.antal}
              </span>
            )
          ) : null}
          {klocka ? <span className="ml-1.5 flex flex-shrink-0 items-center lg:ml-2">{klocka}</span> : null}
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

      <main ref={mainRef} tabIndex={-1} className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain outline-none">
        <div
          ref={innehallRef}
          className={`mx-auto flex min-h-full w-full flex-col lg:min-h-0 lg:px-4 lg:pb-10 ${TOPPLUFT} ${KOLUMN_LG[form]} ${bred ? BRED_GRID : ''}`}
          data-ram-kolumn
          data-ram-bred={underlag ? '' : undefined}
        >
          {underlag ? (
            <div
              key={`u-${underlag.nyckel}`}
              // Fäst överst på mobil medan hon svarar. När Förklaringen står
              // under svaren (Träna, genomgången) rullar underlaget med, så
              // att påståendet och rätt svar syns ovanför förklaringen.
              className={`sess-in sticky top-0 z-10 bg-golv px-4 pb-3 pt-4 max-lg:[&:has(~*_[data-forklaringen])]:static lg:col-start-1 lg:row-start-1 lg:bg-transparent lg:p-0 ${TOPPLUFT_STICKY}`}
              data-ram-underlag
            >
              <div className={`mx-auto w-full lg:max-w-none ${mobil}`}>{underlag.innehall}</div>
            </div>
          ) : null}
          <div
            className={`flex flex-1 flex-col px-4 lg:block lg:flex-none lg:px-0 ${underlag ? 'pt-0 lg:col-start-2 lg:row-start-1' : `pt-4 lg:pt-0 ${bred ? 'lg:col-span-2' : ''}`}`}
            data-ram-uppgift
          >
            <div key={nyckel} className={`serie-kolumn mx-auto w-full pb-6 lg:max-w-none lg:pb-0 ${mobil} ${nyckel ? 'sess-in' : ''}`}>
              {children}
            </div>
            {fotrad}
            <div ref={vaktRef} aria-hidden="true" className="pointer-events-none -mt-6 h-6" data-ram-vakt />
          </div>
        </div>
      </main>
      {scen ? <ScenGolv id={scen} rot={mainRef} vakt={vaktRef} /> : null}

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
