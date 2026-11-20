'use client'

/**
 * Sessionsramen (plan-testflode-2026-11-20 avsnitt 1, omgång 2 steg A,
 * omgång 3 steg 1): en ram för alla lägen och typer.
 *
 * Huvudet (omgång 3, skissens Test-matris och Mobil-matris), på golvet:
 *
 *   dator 72 px   [X] Figurer och mönster      ▬▬▬▬▬▬ bitar ▬▬▬▬▬▬   (3 rätt i rad) (↑ Nivå 3,4) (◔ 0:24)
 *                     Träna, uppgift 5 av 6
 *   mobil 60 px   [X] ▬▬▬ bitar ▬▬▬ (↑ 3,4) (◔ 0:24)
 *                 Figurer och mönster                 Träna, uppgift 5 av 6
 *
 *   - Stapeln i bitar, en per uppgift (BitLage). I Träna rätt, fel, vet och
 *     aktuell; i nivåtest, Nivåkollen, övningsprov och I-prov bara besvarad
 *     eller inte (ur uppgiftsarket). Med uppgiftsarket är stapeln knappen
 *     som öppnar det (data-raknare).
 *   - Nivåkapseln bara i Träna och bara när motorn vet nivån (`niva`).
 *   - "3 rätt i rad" från tre (`iRad`), på mobil i raden under huvudet.
 *   - Klockan är en kapsel (Klocka).
 *
 * Ytan (UX 2026-11-21 punkt 1, oförändrad i omgång 3):
 * - Mobil: foten är en rad över hela bredden längst ned (sticky i main),
 *   Vet inte till vänster och Svara i tumgrepp.
 * - Från lg står foten i kolumnen direkt under innehållet, sticky nedtill i
 *   main när innehållet är längre än skärmen. I Bred följer foten högerspalten.
 * - Kolumnen: Smal 432, Mellan 560, Remsa 672, Bred 1000 (560 + 40 + 400)
 *   från lg och ett steg större från xl (1280): 496, 600, 816 och 1120.
 * - Toppluften från lg: clamp(40px, (100dvh − 920px) / 2, 120px).
 * - Domen (`dom`, Träna) står i fotens ställe: i kolumnen under svaren på
 *   dator, som panel nedtill på mobil (Forklaringen med panel).
 * - Scenen på golvet (`scen`, typens id): ScenGolv nere till höger från 1440.
 *
 * Ramen läser lägesreglerna och fattar inga beslut om typen; typen ritar
 * bara sin uppgift i main. fixed inset-0 på alla enheter.
 *
 * X öppnar alltid avbryt-dialogen (utom i genomgången, där X stänger).
 * Andra trycket på X stänger dialogen igen: i appen Testklar trycker
 * Android-tillbaka på krysset (data-kryss).
 *
 * Tangentbord: A till F eller 1 till 6 markerar, Enter trycker på
 * primärknappen, Backsteg eller vänsterpil går till föregående där det är
 * tillåtet, Esc öppnar avbryt-dialogen. Av när en dialog eller arket är öppet.
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { IkonTillbaka, IkonX } from '@/components/illustrations/RumSymboler'
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

/** En bit i stapeln. */
export type BitLage = 'tom' | 'besvarad' | 'ratt' | 'fel' | 'vet' | 'aktuell'
/** Uppgiftens nivå mot förra uppgiften: pilen i nivåkapseln. */
export type NivaRiktning = 'upp' | 'ner' | 'samma' | null

export interface SessionsRamProps {
  lage: Lage
  titel: string
  undertitel: string
  form: Innehallsform
  /** Uppgiftens nummer och antal: "uppgift 3 av 15" i undertiteln och stapelns bitar. Null döljer båda. */
  raknare: { nr: number; antal: number } | null
  /** 0 till 1: bitarna när varken `bitar` eller uppgiftsarket finns. */
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
   * fäst överst på mobil. Monteras om bara när nyckeln byts.
   */
  underlag?: { nyckel: string; innehall: ReactNode } | null
  /** Typens id för scenen på golvet (ScenGolv, från 1440 px). Utelämnad: ingen scen. */
  scen?: string | null
  /**
   * Stapelns bitar, en per uppgift (omgång 3). Träna skickar rätt, fel, vet
   * och aktuell; personlighetstestet tio bitar om fem påståenden. Utelämnade:
   * ur uppgiftsarket (besvarad eller inte), annars ur framsteg.
   */
  bitar?: BitLage[] | null
  /** Uppgiftens nivå och riktningen mot förra uppgiften (bara Träna, när motorn vet nivån). */
  niva?: { varde: number; riktning: NivaRiktning } | null
  /** Rätt i rad (Träna): kapseln från tre, borta vid fel. */
  iRad?: number | null
  /**
   * Domen efter svaret (Träna): står i fotens ställe, i kolumnen under
   * svaren på dator och som panel nedtill på mobil. Enter trycker fortfarande
   * på fot.primar (Nästa).
   */
  dom?: ReactNode | null
  children: ReactNode
}

/** Bitarna ur uppgiftsarkets celler: besvarad eller inte. */
export function bitarFranArk(celler: ArkCell[]): BitLage[] {
  return celler.map((c) => (c === 'besvarad' ? 'besvarad' : 'tom'))
}

/** Bitarna ur framsteget: de första besvarade. */
export function bitarFranFramsteg(antal: number, framsteg: number | null): BitLage[] {
  const n = Math.round(Math.max(0, Math.min(1, framsteg ?? 0)) * antal)
  return Array.from({ length: antal }, (_, i) => (i < n ? 'besvarad' : 'tom'))
}

/** Nivån som i resten av produkten: en decimal med komma. */
export const nivaText = (v: number) => (Math.round(v * 10) / 10).toFixed(1).replace('.', ',')

/** Mellanrummet mellan bitarna krymper när de blir många. */
function bitStil(n: number): CSSProperties {
  const [mobil, dator] = n <= 12 ? [5, 8] : n <= 24 ? [3, 5] : [2, 3]
  return { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, ['--bit-gap' as string]: `${mobil}px`, ['--bit-gap-lg' as string]: `${dator}px` }
}

/** Stapeln i bitar (exporteras för testerna och senare steg). */
export function Bitar({ bitar }: { bitar: BitLage[] }) {
  return (
    <span className="sess-bitar w-full" style={bitStil(bitar.length)} aria-hidden="true" data-bitar>
      {bitar.map((b, i) => (
        <i key={i} className="sess-bit" data-bit={b} />
      ))}
    </span>
  )
}

function NivaPil({ riktning }: { riktning: NivaRiktning }) {
  if (riktning !== 'upp' && riktning !== 'ner') return null
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`sess-kapsel-pil flex-shrink-0 ${riktning === 'ner' ? 'rotate-180' : ''}`}
    >
      <path d="M12 19V5M5.5 11.5L12 5l6.5 6.5" />
    </svg>
  )
}

function Bock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  )
}

/** Huvudets kolumn bredvid krysset: hela bredden upp till 1440. */
const HUVUD =
  'mx-auto grid w-full max-w-[1440px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2.5 px-4 [grid-template-rows:60px_auto] lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)_minmax(0,1fr)] lg:gap-x-6 lg:px-10 lg:[grid-template-rows:72px]'

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
  bitar = null,
  niva = null,
  iRad = null,
  dom = null,
  children,
}: SessionsRamProps) {
  const fotRef = useRef<HTMLElement | null>(null)
  const mainRef = useRef<HTMLElement | null>(null)
  const innehallRef = useRef<HTMLDivElement | null>(null)
  const raknarRef = useRef<HTMLButtonElement | null>(null)
  const vaktRef = useRef<HTMLDivElement | null>(null)
  const [fragarAvbryt, setFragarAvbryt] = useState(false)
  const [arkOppet, setArkOppet] = useState(false)
  useRamLage(fotRef, Boolean(fot) && !dom)

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

  // Avbryt-dialogen stängd med Fortsätt eller Esc: fokus till uppgiftens
  // rubrik, så att Enter trycker på primärknappen (etapp 4).
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
      // Tangenten hör till en dialog eller arket.
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

  const bitLista: BitLage[] | null = raknare ? (bitar ?? (ark ? bitarFranArk(ark.celler) : bitarFranFramsteg(raknare.antal, framsteg))) : null
  const visaIRad = typeof iRad === 'number' && iRad >= 3
  const uppgiftText = raknare && lage !== 'personlighet' ? `, ${SESSION.huvud.uppgift(raknare.nr, raknare.antal)}` : ''

  // Foten: en rad över hela bredden längst ned på mobil (sticky i main, mt-auto
  // när innehållet är kort), i kolumnen direkt under innehållet från lg.
  // Domen står i fotens ställe.
  const fotrad =
    (fot && primar && !dom) || rad ? (
      <div className={`sticky bottom-0 z-20 -mx-4 lg:mx-0 lg:mt-0 ${dom ? '' : 'mt-auto'}`} data-ram-fot>
        {rad ? <div className={`mx-auto w-full bg-golv px-4 pb-2 lg:max-w-none lg:px-0 lg:pb-0 lg:pt-3 ${mobil}`}>{rad}</div> : null}
        {fot && primar && !dom ? (
          <footer
            ref={fotRef}
            className="border-t-2 border-[color:var(--sess-kant)] bg-papper pb-[env(safe-area-inset-bottom,0px)] lg:border-0 lg:bg-golv lg:pb-4 lg:pt-6"
          >
            <div className={bredUtanUnderlag ? BRED_FOT : undefined}>
              <div className={`mx-auto flex min-h-[84px] w-full items-center gap-3.5 px-4 pb-4 pt-3 lg:col-start-2 lg:min-h-0 lg:max-w-none lg:gap-4 lg:p-0 ${mobil}`}>
                {vanster?.typ === 'tillbaka' ? (
                  <button
                    type="button"
                    onClick={vanster.onClick}
                    disabled={vanster.disabled}
                    aria-label={SESSION.foregaende}
                    className="sess-kryss text-ink-1 disabled:cursor-not-allowed disabled:opacity-40 lg:mr-auto"
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
                    className={`inline-flex min-h-11 max-w-[46%] flex-shrink items-center px-1 text-left text-sm font-medium leading-[18px] text-ink-1 underline decoration-[color:var(--sess-kant)] decoration-2 underline-offset-4 lg:mr-auto ${vanster.dold ? 'invisible' : 'disabled:opacity-40'}`}
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
                  className={`${KNAPP_PRIMAR} sess-knapp relative ml-auto !w-auto min-w-[132px] max-w-full flex-shrink-0 touch-manipulation disabled:cursor-not-allowed lg:min-w-[160px]`}
                  data-primar={primar.data ?? ''}
                >
                  {/* Snurran står utanför textens flöde och texten byts som ny
                      nod (nyckeln), så att Nästa, Lämna in och laddningen
                      aldrig flyttar något (slutkontrollen omgång 2, CLS 0). */}
                  {primar.laddar ? (
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
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
      <header className="relative z-20 flex-shrink-0 bg-golv">
        <div className={HUVUD}>
          {/* Krysset och namnet: en grupp på dator, på mobil står namnet i raden under. */}
          <div className="contents lg:col-start-1 lg:row-start-1 lg:flex lg:min-w-0 lg:items-center lg:gap-3.5">
            <button
              type="button"
              onClick={trycktKryss}
              aria-label={bekraftaAvbryt ? SESSION.avbryt.aria : SESSION.resultat.stang}
              data-kryss=""
              className="sess-kryss col-start-1 row-start-1"
            >
              <IkonX />
            </button>
            <p className="col-span-3 col-start-1 row-start-2 flex min-w-0 items-baseline justify-between gap-3 pb-2 lg:col-span-1 lg:block lg:pb-0">
              <span className="block min-w-0 truncate font-sess-display text-[13px] font-bold leading-4 text-ink-1 lg:text-base lg:leading-5" data-ram-titel>
                {titel}
              </span>
              <span className={`min-w-0 truncate text-xs font-semibold leading-4 text-ink-3 lg:block lg:font-medium ${visaIRad ? 'hidden' : 'block'}`}>
                <span data-ram-undertitel>{undertitel}</span>
                {uppgiftText}
              </span>
              {visaIRad ? (
                <span aria-hidden="true" className="block flex-shrink-0 text-xs font-bold leading-4 text-[color:var(--sess-rad3-ink)] lg:hidden">
                  {SESSION.huvud.iRad(iRad!)}
                </span>
              ) : null}
            </p>
          </div>

          <div className="col-start-2 row-start-1 flex min-w-0 items-center">
            {bitLista ? (
              ark ? (
                <button
                  ref={raknarRef}
                  type="button"
                  onClick={() => setArkOppet(true)}
                  aria-label={SESSION.raknare.oppna(raknare!.nr, raknare!.antal)}
                  aria-haspopup="dialog"
                  aria-expanded={arkOppet}
                  className="flex min-h-11 w-full min-w-0 items-center rounded-xl outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--fokus,var(--ink-1))]"
                  data-raknare
                >
                  <Bitar bitar={bitLista} />
                </button>
              ) : (
                <span className="flex w-full min-w-0 items-center" role="img" aria-label={SESSION.framstegAria(raknare!.nr, raknare!.antal)} data-raknare>
                  <Bitar bitar={bitLista} />
                </span>
              )
            ) : null}
          </div>

          <div className="col-start-3 row-start-1 flex items-center justify-end gap-1.5 lg:gap-2">
            {visaIRad ? (
              // max-lg:!hidden: .sess-kapsel står utanför Tailwinds lager och vinner annars över hidden.
              <span className="sess-kapsel max-lg:!hidden" data-kapsel="rad3" data-i-rad={iRad}>
                <Bock />
                {SESSION.huvud.iRad(iRad!)}
              </span>
            ) : null}
            {niva ? (
              <span className="sess-kapsel" role="img" aria-label={SESSION.huvud.nivaAria(nivaText(niva.varde), niva.riktning)} data-niva={niva.riktning ?? ''}>
                <NivaPil riktning={niva.riktning} />
                <span className="hidden lg:inline" aria-hidden="true">
                  {SESSION.huvud.niva}
                </span>
                <b aria-hidden="true">{nivaText(niva.varde)}</b>
              </span>
            ) : lage === 'trana' && klocka ? (
              // Steg 3b, putsning: kapselns plats hålls från första uppgiften, så
              // att huvudet inte flyttar sig när nivån kommer med första svaret (CLS 0).
              <span className="sess-kapsel invisible" aria-hidden="true" data-niva-plats="">
                <NivaPil riktning={null} />
                <span className="hidden lg:inline">{SESSION.huvud.niva}</span>
                <b>0,0</b>
              </span>
            ) : null}
            {klocka ? <span className="flex flex-shrink-0 items-center">{klocka}</span> : null}
          </div>
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
              // Fäst överst på mobil medan hon svarar. När domen står
              // under svaren rullar underlaget med, så att påståendet och
              // rätt svar syns ovanför domen.
              className={`sess-in sticky top-0 z-10 bg-golv px-4 pb-3 pt-4 max-lg:[&:has(~*_[data-forklaringen])]:static lg:col-start-1 lg:row-start-1 lg:bg-transparent lg:p-0 ${TOPPLUFT_STICKY}`}
              data-ram-underlag
            >
              <div className={`mx-auto w-full lg:max-w-none ${mobil}`}>{underlag.innehall}</div>
            </div>
          ) : null}
          <div
            className={`flex flex-1 flex-col px-4 lg:block lg:flex-none lg:px-0 ${underlag ? 'pt-0 lg:col-start-2 lg:row-start-1' : `pt-2 lg:pt-0 ${bred ? 'lg:col-span-2' : ''}`}`}
            data-ram-uppgift
          >
            <div key={nyckel} className={`serie-kolumn mx-auto w-full pb-6 lg:max-w-none lg:pb-0 ${mobil} ${nyckel ? 'sess-in' : ''}`}>
              {children}
            </div>
            {fotrad}
            {/* Domen är ett direkt barn till kolumnen, så att den kan stå fast nedtill på mobil (sticky). */}
            {dom}
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
