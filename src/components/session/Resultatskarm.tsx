'use client'

/**
 * Resultatskärmen, samma komponent i alla lägen. Omgång 3, steg 3b ritar om
 * den efter skissens förlagor:
 *
 *   Träna (Trana-klar)      målgången: nivån efter träningen som rubrik och
 *                           mätare (bara när motorn gav nivån), uppgifternas
 *                           nivå som linje eller brickor, det du missade och
 *                           ett enda nästa steg. Genomgången står under.
 *   Testlägen (Resultat-test) nivåtest, Nivåkollen och övningsprov: huvudtalet,
 *                           förra försöket (bara när det finns), brickorna,
 *                           nivån (bara när den finns), tiden per uppgift mot
 *                           provets tid (bara när tiderna finns), genomgången
 *                           med första missen utfälld, Var du tappade per
 *                           mönster och nästa steg med sidans enda
 *                           kopparknapp (fast fot på telefon).
 *   Utan uppgiftslista      personlighetstestet: den tidigare vyn, oförändrad.
 *
 * Brickorna, tiderna och utfallen räknas ur `genomgang.lista`, som lägena
 * redan bygger efter avslutet; inget facit läses före avslutet. Data som
 * saknas ritas inte: inget förra försök ger ingen bricka, ingen nivå ingen
 * mätare, inga tider inga staplar.
 */

import { useRef, type ReactNode } from 'react'
import Link from 'next/link'
import Dagsring from '@/components/rum/Dagsring'
import { Rad } from '@/components/rum/Rader'
import Nivaskala from '@/components/traning/Nivaskala'
import { IkonX } from '@/components/illustrations/RumSymboler'
import { KNAPP_PRIMAR, KNAPP_SEKUNDAR, LANK } from '@/components/shell/knappar'
import { antalOrd, KLART, SESSION } from './copy'
import type { Lage } from './lagesregler'
import { useRamLage } from './useRamLage'
import Uppgiftslistan, { type UppgiftslistanProps } from './Uppgiftslistan'
import type { GenomgangPost, RamUppgift } from './typ'
import Genomgangen from './resultat/Genomgangen'
import {
  Bitar,
  brickAria,
  Brickremsa,
  budgetOrd,
  IkonPil,
  NivaMatare,
  nivaText,
  Panel,
  PROVETS_NIVA,
  TidStaplar,
  TidTal,
  VaggFormer,
  type BrickUtfall,
} from './resultat/delar'

export interface ResultatTal {
  varde: string
  etikett: string
  koppar?: boolean
}

/** Målgången i Träna: nivån före och efter (slutför-svarets niva_fore och niva_efter) och varje uppgifts nivå (svarens uppgift_niva). */
export interface MalData {
  fore: number | null
  efter: number | null
  /** Uppgiftens nivå per index, null där motorn inte gav den. */
  nivaer: (number | null)[]
}

export interface TappadRad {
  namn: string
  meta: string
  andel: number
  /** Rätt och antal i mönstret: bitarna i Var du tappade. Utelämnade: stapeln. */
  ratt?: number
  antal?: number
}

export interface ResultatskarmProps {
  lage: Lage
  titel: string
  undertitel: string
  datum?: string | null
  onStang: () => void
  eyebrow?: string
  /** Ringen, fylld till andelen rätt. Utelämnad i Nivåkollen, där nivån är talet. */
  ring?: { andel: number; aria: string } | null
  huvudtal: string
  /** Liten text efter huvudtalet, till exempel "av 10" efter nivån. */
  huvudtalEfter?: string | null
  tal: ResultatTal[]
  mening?: string | null
  nivaskala?: { nu: number; fran: number | null; aria: string } | null
  /** En rad på väggen, till exempel att Nivåkollen är gjord i dag. */
  rad?: string | null
  /**
   * Genomgången. null bara i personlighetstestet, som saknar rätt svar: då
   * står `lyft` i kortets plats.
   */
  genomgang: {
    titel: string
    text?: string | null
    miniatyrer?: ReactNode
    onGaIgenom: () => void
    onVisaAlla?: (() => void) | null
    // Typerna blandas (I-provet), så listan tas emot otypad här.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lista?: Omit<UppgiftslistanProps<any>, 'onGaIgenom'> | null
  } | null
  /** Det lyfta kortets innehåll när genomgången saknas (personlighetsprofilen). */
  lyft?: ReactNode
  /** Kort mellan det lyfta kortet och Nästa steg (personlighetsprofilens dimensioner). */
  innehall?: ReactNode
  tappade?: { titel?: string | null; rader: TappadRad[] } | null
  tempo?: { titel: string; text?: string | null; innehall?: ReactNode } | null
  /** Färdiga kort i Var du tappades och Tempots plats (nivåtestets TappadeKort och TempoKort). */
  tappadeKort?: ReactNode
  tempoKort?: ReactNode
  nastaSteg: {
    titel: string
    text?: string | null
    knapp: { text: string; href?: string; onClick?: () => void; data?: string }
    extra?: ReactNode
    /** Mönstret nästa steg tränar ("Växande steg", "tre fel av fyra"). */
    monster?: { namn: string; rad?: string | null } | null
  }
  status?: ReactNode
  tillbakaHref: string
  motion?: boolean
  /** Omgång 3: målgången i Träna. Utelämnad: rubriken är huvudtalet och mätaren ritas inte. */
  mal?: MalData | null
  /** Omgång 3: nivån på resultatet, 1 till 10. Utelämnad: nivaskala.nu, annars ingen mätare. */
  niva?: number | null
  /** Omgång 3: förra försöket på samma test. Utelämnat: ingen bricka. */
  forra?: { ratt: number; antal: number; namn: string } | null
  /** Omgång 3: mönstret per uppgift, taggen i genomgången. */
  monster?: (string | null)[] | null
  /** Omgång 3: länken "Gör ett nytt övningsprov" bredvid tillbaka. */
  igen?: { text: string; href: string } | null
}

/* ------------------------------------------------------------------ hjälp */

function utfallFor(p: GenomgangPost<RamUppgift>): BrickUtfall {
  if (p.facit.correct) return 'ratt'
  if (p.valt == null) return 'obesvarad'
  return 'fel'
}

/** "Fem av sex rätt" ur talen. */
function rattMening(ratt: number, antal: number): string {
  return `${antalOrd(ratt, true)} av ${antalOrd(antal)} rätt`
}

/** Brickan om förra försöket: "Tre fler än förra övningsprovet". */
function forraText(nu: number, forra: { ratt: number; namn: string }): { text: string; riktning: 'upp' | 'ner' | 'samma' } {
  const d = nu - forra.ratt
  if (d === 0) return { text: `Lika många som förra ${forra.namn}`, riktning: 'samma' }
  const n = Math.abs(d)
  return { text: `${antalOrd(n, true)} ${d > 0 ? 'fler' : 'färre'} än förra ${forra.namn}`, riktning: d > 0 ? 'upp' : 'ner' }
}

function Toppen({ p }: { p: ResultatskarmProps }) {
  return (
    <div className="flex h-14 items-center gap-3.5 lg:h-16">
      <button type="button" onClick={p.onStang} aria-label={SESSION.resultat.stang} data-kryss="" className="res-x">
        <IkonX />
      </button>
      <p className="m-0 min-w-0 flex-1 truncate text-sm leading-5 text-vagg-mjuk">
        {p.titel}, {p.undertitel.charAt(0).toLowerCase() + p.undertitel.slice(1)}
      </p>
      {p.datum ? <span className="hidden text-sm leading-5 text-vagg-mjuk sm:inline">{p.datum}</span> : null}
    </div>
  )
}

function NastaKnapp({ knapp, className }: { knapp: ResultatskarmProps['nastaSteg']['knapp']; className?: string }) {
  const klass = `${KNAPP_PRIMAR} res-stor ${className ?? ''}`
  const innehall = (
    <>
      {knapp.text}
      <IkonPil />
    </>
  )
  return knapp.href ? (
    <Link href={knapp.href} onClick={knapp.onClick} className={klass} data-nasta-steg={knapp.data ?? ''}>
      {innehall}
    </Link>
  ) : (
    <button type="button" onClick={knapp.onClick} className={klass} data-nasta-steg={knapp.data ?? ''}>
      {innehall}
    </button>
  )
}

/* ------------------------------------------------------------- Var du tappade */

function TappadeArk({ tappade }: { tappade: NonNullable<ResultatskarmProps['tappade']> }) {
  return (
    <section aria-label={SESSION.resultat.tappade} className="res-ark px-5 pb-3 pt-5 lg:px-[22px]" data-resultat-tappade>
      <p className="res-ey" style={{ color: 'var(--sess-res-sub)' }}>
        {SESSION.resultat.tappade}
      </p>
      {tappade.titel ? <h2 className="mb-2 mt-1 font-sess-display text-[20px] font-extrabold leading-[26px] text-ink-1">{tappade.titel}</h2> : <div className="h-2" />}
      {tappade.rader.map((r) => {
        const harBitar = r.antal != null && r.ratt != null && r.antal > 0 && r.antal <= 24
        return (
          <div key={r.namn} className="res-grp">
            <b>{r.namn}</b>
            <span>{r.meta}</span>
            {harBitar ? (
              <Bitar utfall={Array.from({ length: r.antal! }, (_, i) => (i < r.ratt! ? 'ratt' : 'fel') as BrickUtfall)} />
            ) : (
              <div data-stapel="" className="h-2 overflow-hidden rounded bg-papper-2" aria-hidden="true">
                <div className="h-full rounded" style={{ width: `${Math.round(Math.max(0.04, r.andel) * 100)}%`, background: 'var(--sess-ratt)' }} />
              </div>
            )}
          </div>
        )
      })}
    </section>
  )
}

/* ----------------------------------------------------------- Nästa steg-kortet */

function NastaKort({ p, mini }: { p: ResultatskarmProps; mini: ReactNode }) {
  const n = p.nastaSteg
  return (
    <section aria-label={SESSION.resultat.nastaSteg} className="res-nasta" data-resultat-nasta>
      <svg width="200" height="200" viewBox="0 0 200 200" aria-hidden="true" className="pointer-events-none absolute -right-[70px] -top-20">
        <circle cx="100" cy="100" r="100" fill="var(--sess-res-panel)" />
      </svg>
      <div className="relative">
        <p className="res-ey" style={{ color: 'var(--sess-lucka-ink)' }}>
          {SESSION.resultat.nastaSteg}
        </p>
        <h2 className="mt-1.5 font-sess-display text-[24px] font-extrabold leading-[30px] tracking-[-.01em] lg:text-[26px]">{n.titel}</h2>
        {n.monster ? (
          <div className="res-nasta-monster">
            {mini ? <span className="res-nasta-mini" aria-hidden="true">{mini}</span> : null}
            <span className="text-sm leading-5">
              <b className="font-semibold">{n.monster.namn}</b>
              {n.monster.rad ? (
                <>
                  <br />
                  <span className="text-vagg-mjuk">{n.monster.rad}</span>
                </>
              ) : null}
            </span>
          </div>
        ) : null}
        {n.text ? <p className="mt-3.5 text-[15px] leading-[22px] text-vagg-mjuk">{n.text}</p> : null}
        <NastaKnapp knapp={n.knapp} className="mt-[18px]" />
        {n.extra ? <div className="text-vagg-mjuk [&_*]:!text-vagg-mjuk [&_a]:!text-vagg-ink">{n.extra}</div> : null}
      </div>
    </section>
  )
}

/** Telefonens fasta fot med nästa steg (skissens Resultat-412). */
function NastaFot({ p, mini }: { p: ResultatskarmProps; mini: ReactNode }) {
  const n = p.nastaSteg
  return (
    <div className="res-fot" data-resultat-fot>
      <div className="mx-auto flex w-full max-w-[560px] flex-col gap-2.5">
        <p className="m-0 flex items-center gap-2.5 text-[13px] leading-[18px] text-vagg-mjuk">
          {mini ? <span className="res-nasta-mini !h-8 !w-8 !rounded-lg" aria-hidden="true">{mini}</span> : null}
          <span className="min-w-0">
            <b className="font-semibold text-vagg-ink">{SESSION.resultat.nastaSteg}:</b> {n.monster ? `${n.titel}, ${n.monster.namn.toLowerCase()}.` : n.titel}
          </span>
        </p>
        <NastaKnapp knapp={n.knapp} className="!h-14" />
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- Resultat-test */

function TestResultat({ p, lista }: { p: ResultatskarmProps; lista: NonNullable<NonNullable<ResultatskarmProps['genomgang']>['lista']> }) {
  const poster = lista.poster as GenomgangPost<RamUppgift>[]
  const utfall = poster.map(utfallFor)
  const ratt = utfall.filter((u) => u === 'ratt').length
  const niva = p.niva ?? p.nivaskala?.nu ?? null
  const budget = lista.budgetPerUppgift ?? null
  // En tid på 0 mättes inte (äldre sessioner) och räknas som saknad.
  const tider = poster.map((x) => (typeof x.tid_s === 'number' && x.tid_s > 0 ? x.tid_s : null))
  const harTider = budget != null && budget > 0 && tider.filter((t) => t != null).length >= Math.max(1, Math.ceil(poster.length / 2))
  const total = tider.reduce<number>((s, t) => s + (t ?? 0), 0)
  const over = tider.filter((t) => t != null && budget != null && t > budget).length
  const forra = p.forra && p.forra.antal === poster.length ? forraText(ratt, p.forra) : null
  const forstaMiss = utfall.findIndex((u) => u !== 'ratt')
  const Mini = forstaMiss >= 0 ? ((poster[forstaMiss] as { ritare?: typeof lista.ritare }).ritare ?? lista.ritare).Miniatyr : undefined
  const mini = p.nastaSteg.monster && Mini && forstaMiss >= 0 ? <Mini u={poster[forstaMiss].u} /> : null

  const tidPanel = harTider ? (
    <Panel titel="Tiden per uppgift" hoger={`provet ger ${budgetOrd(budget!)} per uppgift`} className="steg s2" aria="Tiden per uppgift">
      <div className="mt-3.5">
        <TidStaplar tider={tider} utfall={utfall} budget={budget!} />
      </div>
      <TidTal total={total} budgetTotal={budget! * poster.length} over={over} antal={poster.length} budget={budget!} />
    </Panel>
  ) : null

  return (
    <>
      <div className="res-vagg px-4 pb-16 lg:px-10 lg:pb-[84px]">
        <VaggFormer hojd={640} />
        <div className="relative mx-auto w-full max-w-[1120px]">
          <Toppen p={p} />
          <div className="mt-3 grid grid-cols-1 items-center gap-8 lg:mt-[34px] lg:grid-cols-[520px_minmax(0,540px)] lg:gap-x-[60px]">
            <div className="min-w-0">
              <div className="steg s1" role="status">
                <p className="res-ey" style={{ color: 'var(--sess-lucka-ink)' }} data-resultat-eyebrow>
                  {p.eyebrow ?? KLART[p.lage]}
                </p>
                <h1 className="res-h1 mt-2 lg:mt-3" data-resultat-huvudtal>
                  {p.huvudtal}
                  {p.huvudtalEfter ? <span className="ml-2 align-baseline font-sess-display text-[20px] font-bold tracking-normal text-vagg-mjuk lg:text-[28px]">{p.huvudtalEfter}</span> : null}
                </h1>
                {forra ? (
                  <div className="mt-3.5">
                    <span className="res-upp" data-riktning={forra.riktning} data-resultat-forra>
                      <i>
                        {forra.riktning === 'samma' ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14" /></svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={forra.riktning === 'ner' ? 'rotate-180' : undefined}>
                            <path d="M12 19V5M5.5 11.5L12 5l6.5 6.5" />
                          </svg>
                        )}
                      </i>
                      {forra.text}
                    </span>
                  </div>
                ) : null}
              </div>
              {p.mening ? <p className="steg s2 mt-3 max-w-[480px] text-[15px] leading-[22px] text-vagg-mjuk lg:mt-4 lg:text-[18px] lg:leading-7">{p.mening}</p> : null}
              {p.rad ? (
                <p className="steg s2 mt-3 flex items-center gap-2 text-sm leading-5 text-vagg-ink" data-resultat-rad>
                  <span className="h-2 w-2 shrink-0 rounded-full bg-koppar-ljus" aria-hidden="true" />
                  {p.rad}
                </p>
              ) : null}
              <div className="steg s2 mt-5 lg:mt-7">
                <Brickremsa utfall={utfall} tat aria={brickAria(utfall)} />
              </div>
              {niva != null ? (
                <div className="steg s2 mt-6 lg:mt-[30px]">
                  <NivaMatare nu={niva} etikett="nu" kort />
                </div>
              ) : null}
            </div>
            {tidPanel ? <div className="hidden lg:block">{tidPanel}</div> : null}
          </div>
        </div>
      </div>

      <div className="relative px-4 pb-40 lg:px-10 lg:pb-14">
        <div className="mx-auto -mt-11 grid w-full max-w-[1120px] grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,720px)_360px] lg:gap-x-10 lg:gap-y-5">
          <div className="steg s3 min-w-0" data-resultat-genomgang data-resultat-lista>
            <Genomgangen {...lista} monster={p.monster ?? null} />
          </div>
          <div className="flex min-w-0 flex-col gap-4 lg:gap-5">
            <div className="steg s4 hidden lg:block">
              <NastaKort p={p} mini={mini} />
            </div>
            {p.status ? <div className="steg s4">{p.status}</div> : null}
            {p.innehall ? <div className="steg s4 flex flex-col gap-4">{p.innehall}</div> : null}
            {p.tappadeKort ? <div className="steg s4">{p.tappadeKort}</div> : null}
            {!p.tappadeKort && p.tappade && p.tappade.rader.length ? (
              <div className="steg s4">
                <TappadeArk tappade={p.tappade} />
              </div>
            ) : null}
            {tidPanel ? <div className="steg s4 lg:hidden">{tidPanel}</div> : null}
            {!harTider && p.tempoKort ? <div className="steg s4">{p.tempoKort}</div> : null}
            {!harTider && !p.tempoKort && p.tempo ? (
              <section aria-label={SESSION.resultat.tempo} className="steg s4 res-ark p-4 sm:p-5" data-resultat-tempo>
                <p className="res-ey" style={{ color: 'var(--sess-res-sub)' }}>
                  {SESSION.resultat.tempo}
                </p>
                <p className="mt-1 font-sess-display text-lg font-bold leading-[23px] tracking-[-.01em] text-ink-1">{p.tempo.titel}</p>
                {p.tempo.text ? <p className="mt-0.5 text-sm leading-[21px] text-ink-2">{p.tempo.text}</p> : null}
                {p.tempo.innehall}
              </section>
            ) : null}
            <div className="steg s4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 px-1 lg:justify-between">
              {p.igen ? (
                <Link href={p.igen.href} className="res-lank text-ink-1" data-resultat-igen>
                  {p.igen.text}
                </Link>
              ) : null}
              <Link href={p.tillbakaHref} className="res-lank text-ink-1" data-resultat-tillbaka>
                Tillbaka till Tester
              </Link>
            </div>
          </div>
        </div>
      </div>
      <NastaFot p={p} mini={mini} />
    </>
  )
}

/* ------------------------------------------------------------ Målgången */

function NivaDiagram({ nivaer, utfall, fore }: { nivaer: (number | null)[]; utfall: BrickUtfall[]; fore: number | null }) {
  const W = 492
  const H = 190
  const kanda = nivaer.filter((n): n is number => n != null)
  const lo = Math.min(...kanda, fore ?? Infinity) - 0.4
  const hi = Math.max(...kanda, fore ?? -Infinity) + 0.4
  const y = (n: number) => 150 - ((n - lo) / Math.max(0.5, hi - lo)) * 110
  const steg = (W - 20) / nivaer.length
  const x = (i: number) => 10 + steg * i + steg / 2
  const punkter = nivaer.map((n, i) => (n != null ? { x: x(i), y: y(n), n, i } : null)).filter((v): v is { x: number; y: number; n: number; i: number } => v != null)
  const linje = punkter.map((pt, k) => `${k ? 'L' : 'M'}${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join('')
  const sista = punkter[punkter.length - 1]
  const aria = `${antalOrd(nivaer.length, true)} uppgifter. Nivåerna ${kanda.map(nivaText).join(', ')}. ${utfall
    .map((u, i) => (u === 'ratt' ? null : `${u === 'fel' ? 'Fel' : 'Vet inte'} på uppgift ${i + 1}`))
    .filter(Boolean)
    .join(', ') || 'Alla rätt'}.`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="res-diagram mt-2.5 block h-auto w-full" role="img" aria-label={aria} data-resultat-nivadiagram>
      {fore != null ? (
        <>
          <path d={`M10 ${y(fore).toFixed(1)}H${W - 10}`} stroke="var(--vagg-svag)" strokeWidth="1.5" strokeDasharray="4 5" />
          <text x={W - 10} y={y(fore) + 16} textAnchor="end" fontSize="11" fill="var(--vagg-mjuk)" style={{ fontFamily: 'inherit' }}>
            din nivå när du började, {nivaText(fore)}
          </text>
        </>
      ) : null}
      <path d={linje} fill="none" stroke="var(--ljus)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {punkter.map((pt) => (
        <text key={`n${pt.i}`} x={pt.x} y={pt.y - 22} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--vagg-ink)">
          {nivaText(pt.n)}
        </text>
      ))}
      {punkter.map((pt) => {
        const u = utfall[pt.i]
        const sist = pt === sista
        return (
          <g key={`p${pt.i}`} className="res-prick" style={{ animationDelay: `${300 + pt.i * 80}ms` }}>
            {u === 'ratt' ? (
              <>
                <circle cx={pt.x} cy={pt.y} r="15" fill="var(--koppar)" stroke={sist ? 'var(--vagg-ink)' : 'none'} strokeWidth="2.5" />
                <path d={`M${pt.x - 6.5} ${pt.y + 0.3}l4.2 4.2 8.6-9.2`} fill="none" stroke="var(--sess-res-ratt-ink)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </>
            ) : (
              <>
                <circle cx={pt.x} cy={pt.y} r="15" fill="var(--vagg)" stroke="var(--sess-res-fel-ljus)" strokeWidth="2.5" />
                {u === 'fel' ? (
                  <path d={`M${pt.x - 5.5} ${pt.y - 5.5}l11 11M${pt.x + 5.5} ${pt.y - 5.5}l-11 11`} stroke="var(--sess-res-fel-ljus)" strokeWidth="2.6" strokeLinecap="round" />
                ) : (
                  <text x={pt.x} y={pt.y + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--sess-res-fel-ljus)">?</text>
                )}
              </>
            )}
          </g>
        )
      })}
      {nivaer.map((_, i) => (
        <text key={`x${i}`} x={x(i)} y={182} textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--vagg-mjuk)">
          {i + 1}
        </text>
      ))}
    </svg>
  )
}

function Malgang({ p, lista }: { p: ResultatskarmProps; lista: NonNullable<NonNullable<ResultatskarmProps['genomgang']>['lista']> }) {
  const poster = lista.poster as GenomgangPost<RamUppgift>[]
  const utfall = poster.map(utfallFor)
  const ratt = utfall.filter((u) => u === 'ratt').length
  const antal = poster.length
  const mal = p.mal ?? null
  const efter = mal?.efter ?? null
  const fore = mal?.fore ?? null
  const nivaer = mal?.nivaer ?? []
  const kandaNivaer = nivaer.filter((n) => n != null).length
  const sistaNiva = [...nivaer].reverse().find((n) => n != null) ?? null

  let rubrik = p.huvudtal
  if (efter != null) {
    if (fore == null || efter - fore > 0.05) rubrik = `Du steg till ${nivaText(efter)}`
    else if (Math.abs(efter - fore) <= 0.05) rubrik = `Du ligger kvar på ${nivaText(efter)}`
    else rubrik = `Din nivå är ${nivaText(efter)}`
  }
  const delar: string[] = []
  if (efter != null) {
    delar.push(sistaNiva != null && utfall[utfall.length - 1] === 'ratt' ? `${rattMening(ratt, antal)}, och den sista låg på nivå ${nivaText(sistaNiva)}.` : `${rattMening(ratt, antal)}.`)
    delar.push(efter < PROVETS_NIVA ? `Det är ${nivaText(PROVETS_NIVA - efter)} kvar till provets nivå.` : 'Du är inne på provets nivå.')
  }
  const mening = efter != null ? delar.join(' ') : p.mening ?? null

  const forstaMiss = utfall.findIndex((u) => u !== 'ratt')
  const miss = forstaMiss >= 0 ? poster[forstaMiss] : null
  const missRad = miss ? miss.facit.misstag ?? miss.facit.regel ?? miss.facit.text ?? null : null
  const missMonster = forstaMiss >= 0 ? p.monster?.[forstaMiss] ?? null : null
  const tid = p.tal[0] ?? null

  return (
    <>
      <div className="res-vagg px-4 pb-6 lg:px-10 lg:pb-10">
        <VaggFormer hojd={900} />
        <div className="relative mx-auto flex w-full max-w-[1120px] flex-col">
          <Toppen p={p} />
          <div className="mt-2 grid grid-cols-1 items-center gap-6 lg:mt-14 lg:grid-cols-[520px_minmax(0,540px)] lg:gap-x-[60px]">
            <div className="min-w-0">
              <div className="steg s1" role="status">
                <p className="res-ey" style={{ color: 'var(--sess-lucka-ink)' }} data-resultat-eyebrow>
                  {p.eyebrow ?? KLART[p.lage]}
                </p>
                <h1 className="res-h1 mt-2 lg:mt-3" data-resultat-huvudtal>
                  {rubrik}
                </h1>
              </div>
              {mening ? <p className="steg s2 mt-2.5 max-w-[470px] text-[15px] leading-[22px] text-vagg-mjuk lg:mt-4 lg:text-[18px] lg:leading-7">{mening}</p> : null}
              {efter != null ? (
                <div className="steg s2 mt-6 lg:mt-11">
                  <NivaMatare nu={efter} fore={fore} etikett={fore != null ? 'fore' : 'nu'} kort />
                </div>
              ) : null}
              <dl className="steg s2 mt-6 hidden lg:mt-11 lg:flex">
                {/* Rätt står bara som tal när rubriken är nivån; annars är rubriken redan "X av Y rätt". */}
                {efter != null ? (
                  <div className="res-stat">
                    <dd className="m-0 font-sess-display text-[30px] font-extrabold leading-[34px] tracking-[-.02em]">
                      {ratt} av {antal}
                    </dd>
                    <dt className="text-[13px] leading-[18px] text-vagg-mjuk">rätt</dt>
                  </div>
                ) : null}
                {tid ? (
                  <div className="res-stat">
                    <dd className="m-0 font-sess-display text-[30px] font-extrabold leading-[34px] tracking-[-.02em]">{tid.varde}</dd>
                    <dt className="text-[13px] leading-[18px] text-vagg-mjuk">{tid.etikett}</dt>
                  </div>
                ) : null}
              </dl>
            </div>

            <section className="res-panel steg s3" aria-label="Så gick träningen" data-resultat-uppgifter>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="m-0 font-sess-display text-[18px] font-bold leading-6 lg:text-[20px]">{kandaNivaer >= 2 ? 'Uppgifterna följde dig' : 'Uppgifterna'}</h2>
                {kandaNivaer >= 2 ? <span className="text-[13px] leading-[18px] text-vagg-mjuk">uppgiftens nivå</span> : null}
              </div>
              {kandaNivaer >= 2 ? (
                <NivaDiagram nivaer={nivaer.length === antal ? nivaer : utfall.map((_, i) => nivaer[i] ?? null)} utfall={utfall} fore={fore} />
              ) : (
                <div className="mt-4">
                  <Brickremsa utfall={utfall} aria={brickAria(utfall)} />
                </div>
              )}
              {miss ? (
                <div className="mt-3.5 flex items-center gap-3.5 border-t pt-4" style={{ borderColor: 'var(--sess-res-linje)' }} data-resultat-missen>
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl font-sess-display text-base font-bold" style={{ background: 'var(--vagg)', border: '1.5px solid var(--sess-res-fel-ljus)', color: 'var(--sess-res-fel-ljus)' }}>
                    {forstaMiss + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <b className="block text-[15px] font-semibold leading-5">{missMonster ? `Det du missade: ${missMonster.toLowerCase()}` : 'Det du missade'}</b>
                    {missRad ? <span className="line-clamp-2 text-[13px] leading-[19px] text-vagg-mjuk">{missRad}</span> : null}
                  </div>
                  {lista.onOppna ? (
                    <button type="button" onClick={() => lista.onOppna?.(forstaMiss)} className="res-lank whitespace-nowrap text-sm text-vagg-ink" data-resultat-se-uppgiften>
                      Se uppgiften
                    </button>
                  ) : null}
                </div>
              ) : null}
            </section>
          </div>

          <div className="res-rem steg s4 mt-6 lg:mt-14" data-resultat-nasta>
            <p className="m-0 flex-1 text-[15px] leading-[22px] text-vagg-mjuk">
              <b className="font-semibold text-vagg-ink">{p.nastaSteg.titel}</b>
              {p.nastaSteg.text ? (
                <>
                  <br />
                  {p.nastaSteg.text}
                </>
              ) : null}
            </p>
            {p.nastaSteg.extra ? (
              <div className="min-w-0 text-vagg-mjuk [&_*]:!text-vagg-mjuk [&_a]:!text-vagg-ink [&_a]:!decoration-vagg-svag">{p.nastaSteg.extra}</div>
            ) : null}
            <div className="flex flex-col-reverse items-stretch gap-3 pb-[5px] lg:flex-row lg:items-center">
              <Link href={p.tillbakaHref} className="res-tyst" data-stor="" data-resultat-tillbaka>
                Klar för i dag
              </Link>
              <NastaKnapp knapp={p.nastaSteg.knapp} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-10 pt-6 lg:px-10 lg:pt-10">
        <div className="mx-auto w-full max-w-[1120px]">
          <div className="max-w-[720px]" data-resultat-genomgang data-resultat-lista>
            <Genomgangen {...lista} monster={p.monster ?? null} />
          </div>
          {p.status ? <div className="mt-4 max-w-[720px]">{p.status}</div> : null}
        </div>
      </div>
    </>
  )
}

/* --------------------------------------------------------------- vyn */

export default function Resultatskarm(p: ResultatskarmProps) {
  const fotRef = useRef<HTMLElement | null>(null)
  useRamLage(fotRef, false)
  const motion = p.motion ?? true
  const lista = p.genomgang?.lista ?? null

  if (!lista || !lista.poster.length) return <KlassiskResultat p={p} motion={motion} />

  return (
    <div
      className={`fixed inset-0 z-50 flex h-dvh flex-col bg-golv font-sess-text ${motion ? 'motion' : ''}`}
      data-sessionsram="resultat"
      data-resultat
      data-resultatskarm={p.lage}
      data-resultat-v3={p.lage === 'trana' ? 'malgang' : 'test'}
      role="region"
      aria-label={p.eyebrow ?? KLART[p.lage]}
    >
      <main className="sess-tona min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {p.lage === 'trana' ? <Malgang p={p} lista={lista} /> : <TestResultat p={p} lista={lista} />}
      </main>
    </div>
  )
}

/* ------------------------------------- den tidigare vyn (utan uppgiftslista) */

function Tal({ t }: { t: ResultatTal }) {
  return (
    <div className="flex min-w-0 flex-col-reverse">
      <dt className="mt-1 text-xs leading-4 text-vagg-mjuk">{t.etikett}</dt>
      <dd
        className={`m-0 whitespace-nowrap font-sess-display text-[24px] font-bold leading-[28px] tracking-[-.02em] min-[400px]:text-[28px] min-[400px]:leading-[30px] ${
          t.koppar ? 'text-koppar-ljus' : 'text-vagg-ink'
        }`}
      >
        {t.varde}
      </dd>
    </div>
  )
}

function KlassiskResultat({ p, motion }: { p: ResultatskarmProps; motion: boolean }) {
  const knapp = p.nastaSteg.knapp
  const R = SESSION.resultat
  return (
    <div
      className={`fixed inset-0 z-50 flex h-dvh flex-col bg-golv font-sess-text ${motion ? 'motion' : ''}`}
      data-sessionsram="resultat"
      data-resultat
      data-resultatskarm={p.lage}
      role="region"
      aria-label={p.eyebrow ?? KLART[p.lage]}
    >
      <main className="sess-tona min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="vagg px-4 pb-11 lg:px-10">
          <div className="mx-auto w-full max-w-[672px]">
            <div className="-mx-1 flex h-14 items-center gap-2 text-vagg-ink">
              <button
                type="button"
                onClick={p.onStang}
                aria-label={R.stang}
                data-kryss=""
                className="-ml-1 inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px]"
              >
                <IkonX />
              </button>
              <p className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold leading-5">{p.titel}</span>
                <span className="block truncate text-xs leading-4 text-vagg-mjuk">{p.undertitel}</span>
              </p>
              {p.datum ? <span className="pr-1 text-[13px] tabular-nums text-vagg-mjuk">{p.datum}</span> : null}
            </div>

            <div className="steg s1 mt-3 flex items-center gap-4" role="status">
              {p.ring ? <Dagsring status="gjord" storlek={56} fyllAnimering andel={p.ring.andel} label={p.ring.aria} /> : null}
              <div className="min-w-0">
                <p className="text-ey uppercase text-koppar-ljus" data-resultat-eyebrow>
                  {p.eyebrow ?? KLART[p.lage]}
                </p>
                <h1 className="text-h1-liten mt-1 text-vagg-ink" data-resultat-huvudtal>
                  {p.huvudtal}
                  {p.huvudtalEfter ? (
                    <span className="ml-2 align-baseline font-sess-display text-[20px] font-bold tracking-normal text-vagg-mjuk">{p.huvudtalEfter}</span>
                  ) : null}
                </h1>
              </div>
            </div>
            {p.tal.length ? (
              <dl className="steg s2 mt-4 grid grid-cols-2 gap-3">
                {p.tal.slice(0, 2).map((t) => (
                  <Tal key={t.etikett} t={t} />
                ))}
              </dl>
            ) : null}
            {p.mening ? <p className="steg s2 mt-3.5 max-w-[46ch] text-[15px] leading-[22px] text-vagg-mjuk">{p.mening}</p> : null}
            {p.nivaskala ? (
              <div className="steg s2">
                <Nivaskala className="mt-[18px]" nu={p.nivaskala.nu} fran={p.nivaskala.fran} aria={p.nivaskala.aria} />
              </div>
            ) : null}
            {p.rad ? (
              <p className="steg s2 mt-3.5 flex items-center gap-2 text-sm leading-5 text-vagg-ink" data-resultat-rad>
                <span className="h-2 w-2 shrink-0 rounded-full bg-koppar-ljus" aria-hidden="true" />
                {p.rad}
              </p>
            ) : null}
          </div>
        </div>

        <div className="px-4 pb-8 lg:px-10">
          <div className="mx-auto flex w-full max-w-[672px] flex-col gap-4">
            {p.genomgang?.lista ? (
              <div className="steg s3 relative z-[2] -mt-[30px]" data-resultat-genomgang data-resultat-lista>
                <Uppgiftslistan {...p.genomgang.lista} onGaIgenom={p.genomgang.onGaIgenom} />
              </div>
            ) : p.genomgang ? (
              <section
                aria-label={R.genomgang}
                className="steg s3 relative z-[2] -mt-[30px] rounded-2xl border border-[color:var(--lyft-kant)] bg-papper p-4 shadow-lyft sm:p-5"
                data-resultat-genomgang
              >
                <p className="text-ey uppercase text-koppar-ink">{R.genomgang}</p>
                <h2 className="mt-1 text-kort-t text-ink-1">{p.genomgang.titel}</h2>
                {p.genomgang.text ? <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{p.genomgang.text}</p> : null}
                {p.genomgang.miniatyrer ? <div className="mt-3.5">{p.genomgang.miniatyrer}</div> : null}
                <div className="mt-3.5 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-5">
                  <button type="button" onClick={p.genomgang.onGaIgenom} className={`${KNAPP_SEKUNDAR} sm:w-auto sm:min-w-[160px]`} data-ga-igenom>
                    {R.gaIgenom}
                  </button>
                  {p.genomgang.onVisaAlla ? (
                    <button type="button" onClick={p.genomgang.onVisaAlla} className={`${LANK} inline-flex min-h-11 items-center justify-center`} data-visa-alla>
                      {R.visaAlla}
                    </button>
                  ) : null}
                </div>
              </section>
            ) : p.lyft ? (
              <div className="steg s3 relative z-[2] -mt-[30px]" data-resultat-lyft>
                {p.lyft}
              </div>
            ) : null}

            {p.innehall ? <div className="steg s4 flex flex-col gap-4">{p.innehall}</div> : null}

            {p.tappadeKort ? <div className="steg s4">{p.tappadeKort}</div> : null}
            {!p.tappadeKort && p.tappade && p.tappade.rader.length ? (
              <section aria-label={R.tappade} className="steg s4 rounded-2xl border border-kant bg-papper p-4" data-resultat-tappade>
                <p className="text-ey uppercase text-ink-3">{R.tappade}</p>
                {p.tappade.titel ? <p className="mt-1 font-sess-display text-lg font-bold leading-[23px] tracking-[-.01em] text-ink-1">{p.tappade.titel}</p> : null}
                <div className="-mx-4 -mb-2 mt-1 [&>*+*]:border-t [&>*+*]:border-kant">
                  {p.tappade.rader.map((r, i) => (
                    <Rad key={r.namn} titel={r.namn} meta={r.meta} stapel={{ andel: Math.max(0.04, r.andel), ton: i === 0 ? 'koppar' : 'ton' }} />
                  ))}
                </div>
              </section>
            ) : null}

            {p.tempoKort ? <div className="steg s4">{p.tempoKort}</div> : null}
            {!p.tempoKort && p.tempo ? (
              <section aria-label={R.tempo} className="steg s4 rounded-2xl border border-kant bg-papper p-4 sm:p-5" data-resultat-tempo>
                <p className="text-ey uppercase text-ink-3">{R.tempo}</p>
                <p className="mt-1 font-sess-display text-lg font-bold leading-[23px] tracking-[-.01em] text-ink-1">{p.tempo.titel}</p>
                {p.tempo.text ? <p className="mt-0.5 text-sm leading-[21px] text-ink-2">{p.tempo.text}</p> : null}
                {p.tempo.innehall}
              </section>
            ) : null}

            <section aria-label={R.nastaSteg} className="steg s4 rounded-2xl border border-kant bg-papper p-4 sm:p-5" data-resultat-nasta>
              <p className="text-ey uppercase text-ink-3">{R.nastaSteg}</p>
              <p className="mt-1 font-sess-display text-lg font-bold leading-[23px] tracking-[-.01em] text-ink-1">{p.nastaSteg.titel}</p>
              {p.nastaSteg.text ? <p className="mt-1 text-sm leading-[21px] text-ink-2">{p.nastaSteg.text}</p> : null}
              {p.nastaSteg.extra}
              <div className="mt-3.5">
                {knapp.href ? (
                  <Link href={knapp.href} onClick={knapp.onClick} className={`${KNAPP_PRIMAR} sm:w-auto sm:min-w-[220px]`} data-nasta-steg={knapp.data ?? ''}>
                    {knapp.text}
                  </Link>
                ) : (
                  <button type="button" onClick={knapp.onClick} className={`${KNAPP_PRIMAR} sm:w-auto sm:min-w-[220px]`} data-nasta-steg={knapp.data ?? ''}>
                    {knapp.text}
                  </button>
                )}
              </div>
            </section>

            {p.status ? <div className="steg s4">{p.status}</div> : null}

            <div className="steg s4 flex justify-center">
              <Link href={p.tillbakaHref} className={`${LANK} inline-flex min-h-11 items-center`} data-resultat-tillbaka>
                {R.tillbaka}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
