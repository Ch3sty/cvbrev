'use client'

/**
 * Provsidans startskärm enligt skissen (Publik-prov-start-1440 och -412,
 * ägarens beslut 2026-11-21): väggen i full bredd med topprad, eyebrow, h1,
 * ingressen, Starta provet i hjälten med raden "Inget konto behövs för att
 * prova." och brädet till höger; under väggen panelen med typvalet, de tre
 * punkterna och länken till /verktyg/rekryteringstester. På telefon står
 * knappen i en fast fot i tumgrepp.
 *
 * Egen publik skärm: den delade Startskarm (inloggade lägen) är orörd.
 * Illustrationen är dekor (aria-hidden) och ritas av de riktiga
 * komponenterna: matrisen med brädet och svarsklossar, övriga typer med
 * typens scen. Inget facit: figurerna är ett fast exempel, inte provets.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'
import { IkonFlagga, IkonInfo, IkonKlocka, IkonTillbaka } from '@/components/illustrations/RumSymboler'
import { TESTGLYFER, type TestTyp } from '@/components/illustrations/TestGlyfer'
import { KNAPP_PRIMAR } from '@/components/shell/knappar'
import { Snurra } from '@/components/session/SessionsRam'
import { Tangent } from '@/components/session/Svarskort'
import { scenFor, type ScenId } from '@/components/session/scener'
import { VaggFormer, IkonPil } from '@/components/session/resultat/delar'
import { Matrisen } from '@/components/session/typer/Matris'
import { FigurV7, type LayeredCell } from '@/lib/logicTestV7/layered.v7'
import { PROV_TYPER, type ProvTyp } from '@/lib/tests/prov-typer'
import { PROV_NAMN, PROV_RAM } from './prov-copy'

const PROVA_PATH = '/verktyg/rekryteringstester/prova'
const TILLBAKA = '/verktyg/rekryteringstester'

/** Typvalets ordning: matrisen först, I-provet sist. */
const TYPVAL: readonly ProvTyp[] = ['matris', 'figurserie', 'talserie', 'numerisk', 'verbal', 'deduktiv', 'spatial', 'ordforrad', 'iprov']

const GLYF: Partial<Record<ProvTyp, TestTyp>> = {
  matris: 'matris',
  figurserie: 'figurer',
  talserie: 'talserier',
  numerisk: 'numeriskt',
  verbal: 'verbalt',
  deduktiv: 'deduktiv',
  spatial: 'spatial',
  ordforrad: 'ordforrad',
}

function TypGlyf({ typ }: { typ: ProvTyp }) {
  const g = GLYF[typ]
  if (g) {
    const Glyf = TESTGLYFER[g]
    return <Glyf />
  }
  return (
    <svg viewBox="0 0 48 48" width="48" height="48" focusable="false">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={6 + (i % 3) * 13} y={12 + Math.floor(i / 3) * 13} width="10" height="10" rx="2.5" fill={i === 4 ? 'var(--koppar)' : 'none'} stroke="currentColor" strokeWidth="2" />
      ))}
    </svg>
  )
}

/* ------------------------------------------------------------ illustrationen */

const fig = (base: 'circle' | 'square' | 'triangle', fylld: boolean): LayeredCell => ({ kind: 'stack', base, symbol: 'none', baseFill: fylld ? 'black' : 'none' })

/** Ett fast exempel (skissens bräde): formerna roterar per rad, mittraden fylld. */
const EXEMPEL: (LayeredCell | null)[][] = [
  [fig('circle', false), fig('square', false), fig('triangle', false)],
  [fig('square', true), fig('triangle', true), fig('circle', true)],
  [fig('triangle', false), fig('circle', false), null],
]
const KLOSSAR: { cell: LayeredCell; vrid: number }[] = [
  { cell: fig('square', false), vrid: -6 },
  { cell: fig('square', true), vrid: 3 },
  { cell: fig('circle', false), vrid: -3 },
]

function StartBild({ typ }: { typ: ProvTyp }) {
  if (typ !== 'matris') {
    const Scen = scenFor((typ === 'iprov' ? 'iprov' : typ) as ScenId)
    return (
      <div className="illu-vagg prov3-start-scen" aria-hidden="true">
        <Scen rita className="h-auto w-full" />
      </div>
    )
  }
  return (
    <div className="prov3-start-bild" aria-hidden="true">
      <div className="prov3-start-klossar">
        {KLOSSAR.map((k, i) => (
          <span key={i} className="sess-kloss sess-svar-ruta prov3-start-kloss" data-tillstand="neutral" style={{ transform: `rotate(${k.vrid}deg)` }}>
            <Tangent tecken={String.fromCharCode(65 + i)} tillstand="neutral" className="absolute left-2.5 top-2.5" />
            <span className="matrisyta flex h-full w-full items-center justify-center p-4">
              <FigurV7 cell={k.cell} />
            </span>
          </span>
        ))}
      </div>
      <div className="prov3-start-brade">
        <Matrisen grid={EXEMPEL} />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ skärmen */

export interface ProvStartProps {
  typ: ProvTyp
  eyebrow: string
  rubrik: string
  ingressFet: string
  ingress: string
  loading: boolean
  /** Felraden under typvalet (gränsen tre prov per dygn med länken). */
  fel: ReactNode
  loginHref: string
  onStart: () => void
}

function StartKnapp({ p, className = '' }: { p: ProvStartProps; className?: string }) {
  return (
    <button
      type="button"
      onClick={p.onStart}
      disabled={p.loading}
      aria-busy={p.loading || undefined}
      className={`${KNAPP_PRIMAR} res-stor relative !w-auto touch-manipulation ${className}`}
      data-cta="prova-start"
    >
      {p.loading ? (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          <Snurra />
        </span>
      ) : null}
      {PROV_RAM.start.knapp}
      <IkonPil />
    </button>
  )
}

const IKON = [IkonKlocka, IkonInfo, IkonFlagga]

export default function ProvStart(p: ProvStartProps) {
  const regler = PROV_RAM.start.regler(p.typ)
  return (
    <div className="prov3-start bg-golv font-sess-text" data-prov-start>
      <div className="res-vagg prov3-start-vagg px-4 lg:px-10">
        <VaggFormer hojd={620} />
        <div className="relative mx-auto w-full max-w-[1120px]">
          <div className="flex h-16 items-center gap-3 lg:h-[88px] lg:gap-5">
            <Link href={TILLBAKA} aria-label="Tillbaka till Rekryteringstester" className="res-x lg:hidden">
              <IkonTillbaka />
            </Link>
            <Link href="/" className="inline-flex min-h-11 items-center font-sess-display text-[19px] font-extrabold tracking-[-.01em] text-vagg-ink">
              jobbcoach.ai
            </Link>
            <span className="hidden h-5 w-px bg-[color:var(--vagg-svag)] lg:block" aria-hidden="true" />
            <Link href={TILLBAKA} className="hidden min-h-11 items-center gap-2 text-sm text-vagg-mjuk hover:text-vagg-ink lg:inline-flex">
              <IkonTillbaka size={16} />
              Rekryteringstester
            </Link>
            <p className="m-0 ml-auto text-sm text-vagg-mjuk">
              <span className="hidden lg:inline">Har du redan ett konto? </span>
              <Link href={p.loginHref} className="inline-flex min-h-11 items-center font-semibold text-vagg-ink underline underline-offset-[3px]">
                Logga in
              </Link>
            </p>
          </div>

          <div className="grid grid-cols-1 items-center gap-6 pb-8 pt-2 lg:grid-cols-[minmax(0,1fr)_520px] lg:gap-10 lg:pb-[72px] lg:pt-4">
            <div className="min-w-0">
              <p className="res-ey" style={{ color: 'var(--sess-lucka-ink)' }}>
                {p.eyebrow}
              </p>
              <h1 className="res-h1 mt-2 text-vagg-ink lg:mt-3 lg:!text-[60px] lg:!leading-[64px]" data-start-rubrik>
                {p.rubrik}
              </h1>
              <p className="mt-3 max-w-[500px] text-[15px] leading-[22px] text-vagg-mjuk lg:mt-4 lg:text-[19px] lg:leading-[28px]" data-start-ingress>
                <b className="font-semibold text-vagg-ink">{p.ingressFet}</b>
                {p.ingress}
              </p>
              <div className="mt-8 hidden items-center gap-6 lg:flex">
                <StartKnapp p={p} />
                <p className="m-0 max-w-[170px] text-sm leading-5 text-vagg-mjuk">{PROV_RAM.start.fotnot}</p>
              </div>
            </div>
            <div className="flex items-center gap-5 lg:justify-end">
              <StartBild typ={p.typ} />
              {/* Telefon: tre fakta bredvid brädet (skissens -412). */}
              <ul className="m-0 flex list-none flex-col gap-3 p-0 lg:hidden" aria-hidden="true">
                {PROV_RAM.start.fakta(p.typ).map((t, i) => {
                  const Ikon = IKON[i]
                  return (
                    <li key={t} className="flex items-center gap-2.5 text-[15px] font-semibold leading-5 text-vagg-ink">
                      <span className="prov3-start-faktaikon">
                        <Ikon size={18} />
                      </span>
                      {t}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-10">
        <div className="relative mx-auto -mt-6 w-full max-w-[1120px] lg:-mt-14">
          <section className="prov3-start-panel" aria-labelledby="prov3-valj-typ">
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
              <div>
                <p className="res-ey text-koppar-ink">{PROV_RAM.start.valjTyp}</p>
                <h2 id="prov3-valj-typ" className="mt-1 font-sess-display text-[20px] font-extrabold leading-[26px] tracking-[-.01em] text-ink-1 lg:text-[24px] lg:leading-[30px]">
                  {PROV_RAM.start.valjTypRubrik}
                </h2>
              </div>
              <p className="text-[13px] leading-[18px] text-ink-2">{PROV_RAM.start.valjTypRad}</p>
            </div>
            <nav aria-label={PROV_RAM.start.valjTypAria} className="prov3-typval mt-4" data-prova-typval>
              {TYPVAL.filter((t) => (PROV_TYPER as readonly string[]).includes(t)).map((t) => (
                <Link
                  key={t}
                  href={t === 'matris' ? PROVA_PATH : `${PROVA_PATH}?typ=${t}`}
                  replace
                  scroll={false}
                  aria-current={t === p.typ ? 'page' : undefined}
                  className="prov3-typkort"
                >
                  <i aria-hidden="true">
                    <TypGlyf typ={t} />
                  </i>
                  <span>{PROV_NAMN[t]}</span>
                </Link>
              ))}
            </nav>
            {p.fel}
          </section>

          <ul className="prov3-start-punkter" data-start-regler>
            {regler.map((r, i) => {
              const Ikon = IKON[i]
              return (
                <li key={r.titel} data-sista={i === regler.length - 1 ? '' : undefined}>
                  <span className="prov3-start-punktikon" aria-hidden="true">
                    <Ikon size={24} />
                  </span>
                  <span>
                    <b>{r.titel}</b>
                    <span>{r.text}</span>
                  </span>
                </li>
              )
            })}
          </ul>

          <p className="mt-6 pb-40 text-sm leading-5 text-ink-2 lg:pb-16">
            {PROV_RAM.start.merFore}{' '}
            <Link href={TILLBAKA} className="font-semibold text-ink-1 underline underline-offset-[3px]">
              {PROV_RAM.start.merLank}
            </Link>
          </p>
        </div>
      </div>

      {/* Telefon: knappen i tumgrepp. */}
      <div className="prov3-start-fot lg:hidden">
        <StartKnapp p={p} className="!w-full" />
        <p className="m-0 text-center text-[13px] leading-[18px] text-ink-3">{PROV_RAM.start.fotnot}</p>
      </div>
    </div>
  )
}
