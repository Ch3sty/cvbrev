'use client'

/**
 * Provsidans resultat, omgång 3 (beslut A, D och E; förlagorna
 * Publik-prov-resultat-1440, -en-1440, -noll-1440 och telefonens -412):
 *
 *   väggen     Provet klart, "2 av 5 rätt" (sidans h1), meningen per variant,
 *              percentilraden som förut och remsan "Dina fem uppgifter" med
 *              utfallet per uppgift
 *   vänster    det enda öppna facit (OppetFacitKort, servern valde uppgiften)
 *   höger      spärrkortet med rubriken per variant, Skapa konto gratis
 *              ovanför vecket vid 1440×768, Google, löftena och villkorsraden
 *   under      de andra uppgifterna: utfallet och låset, aldrig facit
 *   telefon    samma ordning, spärrkortet sist och ett fast ark i tumgrepp
 *              som viker undan när kortet syns
 *
 * Ett äldre sparat prov utan oppet_facit ritas utan det öppna kortet.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { capture } from '@/lib/analytics/events'
import { facitVisat, sparrEgenskaper, sparrKontext } from '@/lib/analytics/sparren'
import { valjOppetFacit } from '@/lib/tests/oppet-facit'
import { FigurV7, LuckaV7, type LayeredCell } from '@/lib/logicTestV7/layered.v7'
import type { ProvaResultat } from '@/lib/tests/prova-lokalt'
import type { ProvTyp } from '@/lib/tests/prov-typer'
import type { VnUnderlag } from '@/lib/tester/pass-typer'
import { IkonX } from '@/components/illustrations/RumSymboler'
import Marke, { Las } from '@/components/session/Marke'
import { SESSION } from '@/components/session/copy'
import { VaggFormer } from '@/components/session/resultat/delar'
import { loggaInHref } from '@/components/registrering/RegisterKontoSteg'
import OppetFacitKort from './OppetFacitKort'
import { ProvSparrArk, ProvSparrKort, type SparrData } from './ProvSparr'
import { oppenPost, PROV_NAMN, type ProvPost } from './provPost'
import { PROV3, PROV_RAM } from './prov-copy'

const PROVA_PATH = '/verktyg/rekryteringstester/prova'
const LAS_OM = '/verktyg/rekryteringstester'

/** Spärrens läge ur resultatet: serverns fält när de finns, annars samma regel i klienten. */
export function sparrLage(result: ProvaResultat) {
  const val = valjOppetFacit(result.fel, result.total)
  const variant = result.variant ?? val.variant
  const antalFel = result.antal_fel ?? val.antal_fel
  const oppenIndex = result.oppet_facit?.index ?? val.index
  const felSet = new Set(result.fel)
  const lasta = Array.from({ length: result.total }, (_, i) => i).filter((i) => i !== oppenIndex && (variant === 'noll' || felSet.has(i)))
  return { variant, antalFel, oppenIndex, lasta, felSet }
}

export function harRutnat(post: ProvPost | null | undefined): boolean {
  return !!post && post.ritare.kind === 'matris' && Array.isArray((post.u as { grid?: unknown }).grid)
}

/** Uppgiften i miniatyr: matrisens rutnät med luckan (bara det hon redan sett), annars typens Miniatyr. */
export function Mini({ post }: { post: ProvPost | null | undefined }) {
  if (!post) return null
  const g = (post.u as { grid?: (LayeredCell | null)[][] }).grid
  if (post.ritare.kind === 'matris' && Array.isArray(g)) {
    return (
      <span className="prov3-rutnat matrisyta" aria-hidden="true">
        {g.flat().slice(0, 9).map((c, i) => (
          <i key={i} data-lucka={c ? undefined : ''}>
            {c ? <FigurV7 cell={c} /> : <LuckaV7 />}
          </i>
        ))}
      </span>
    )
  }
  // Typernas miniatyrer är remsor (talraden, figurserien, ordet) som inte ryms i
  // en kvadrat: rutan bär uppgiftens nummer i stället.
  return null
}

export default function ProvResultatSida({
  typ,
  result,
  token,
  poster,
  underlag,
  onStang,
  onGorOm,
}: {
  typ: ProvTyp
  result: ProvaResultat
  token: string
  /** Uppgifterna som de visades (minnet eller fliken); tom lista ritar raderna utan miniatyr. */
  poster: ProvPost[]
  underlag: Record<string, VnUnderlag>
  onStang: () => void
  onGorOm: () => void
}) {
  const antal = result.total
  const { variant, antalFel, oppenIndex, lasta, felSet } = sparrLage(result)
  const oppen = useMemo(() => oppenPost(result.oppet_facit, underlag), [result.oppet_facit, underlag])
  const ktx = useMemo(() => sparrKontext({ test_kind: typ, plats: 'prova' }, result), [typ, result])
  const d: SparrData = {
    typ,
    variant,
    antalFel,
    antal,
    ratt: result.score,
    lasta,
    token,
    ktx,
    sourcePage: PROVA_PATH,
    cta: 'prova-gate',
  }
  const loginHref = loggaInHref({ intent: null, smakprov: { typ: 'test', token } })

  // Arket viker undan när kortet sist på sidan syns (telefon).
  const slutRef = useRef<HTMLDivElement | null>(null)
  const [kortSyns, setKortSyns] = useState(false)
  useEffect(() => {
    const el = slutRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver((p) => setKortSyns(p.some((x) => x.isIntersecting)), { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const andra = Array.from({ length: antal }, (_, i) => i).filter((i) => i !== (oppen ? oppenIndex : -1))
  const andraRatt = andra.filter((i) => !felSet.has(i)).length
  const toppMini = lasta.slice(0, 2).map((i) => (
    <span key={i} className="prov3-mini-ruta" data-las>
      {harRutnat(poster[i]) ? <Mini post={poster[i]} /> : <b>{i + 1}</b>}
      <i aria-hidden="true">
        <Las storlek={11} />
      </i>
    </span>
  ))

  return (
    <div className="motion fixed inset-0 z-50 flex h-dvh flex-col bg-golv font-sess-text" data-sessionsram="resultat" data-resultatskarm="publikt" data-variant={variant}>
      <main className="sess-tona min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="res-vagg px-4 pb-6 lg:px-10 lg:pb-10">
          <VaggFormer hojd={420} />
          <div className="relative mx-auto w-full max-w-[1120px]">
            <div className="flex h-14 items-center gap-3.5 lg:h-16">
              <button type="button" onClick={onStang} aria-label={SESSION.resultat.stang} data-kryss="" className="res-x">
                <IkonX />
              </button>
              <p className="m-0 min-w-0 flex-1 truncate text-sm leading-5 text-vagg-mjuk">{PROV_NAMN[typ]}, prova gratis</p>
              <p className="m-0 hidden text-sm leading-5 text-vagg-mjuk lg:block">
                {PROV3.harKonto}{' '}
                <Link href={loginHref} className="font-semibold text-vagg-ink underline underline-offset-[3px]">
                  {PROV3.loggaIn}
                </Link>
              </p>
            </div>
            <div className="mt-1 grid grid-cols-1 items-center gap-5 lg:mt-3 lg:grid-cols-[minmax(0,1fr)_580px] lg:gap-x-10">
              <div className="steg s1 min-w-0" role="status">
                <p className="res-ey" style={{ color: 'var(--sess-lucka-ink)' }} data-resultat-eyebrow>
                  {PROV3.eyebrow}
                </p>
                <h1 className="res-h1 mt-1.5 lg:mt-2 lg:!text-[64px] lg:!leading-[68px]" data-resultat-huvudtal>
                  {SESSION.resultat.rattAv(result.score, antal)}
                </h1>
                <p className="mt-2.5 max-w-[470px] text-[15px] leading-[22px] text-vagg-mjuk lg:text-[17px] lg:leading-[26px]" data-resultat-mening>
                  {PROV3.mening(typ, variant, result.fel)}
                </p>
                {result.percentile !== null ? (
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium leading-5 text-vagg-ink" data-resultat-rad>
                    <span className="h-2 w-2 shrink-0 rounded-full bg-koppar" aria-hidden="true" />
                    {PROV_RAM.resultat.percentil(result.percentile)}
                  </p>
                ) : null}
              </div>
              <section className="res-panel steg s2 prov3-remsa-panel" aria-label={PROV3.remsaTitel(antal)} data-prov-remsa>
                <p className="hidden items-baseline justify-between gap-3 lg:flex">
                  <b className="font-sess-display text-[20px] font-extrabold leading-6 text-vagg-ink">{PROV3.remsaTitel(antal)}</b>
                  <span className="text-[13px] leading-[18px] text-vagg-mjuk">{PROV3.remsaHoger(result.score, antal)}</span>
                </p>
                <ol className="prov3-remsa" style={{ ['--kol' as string]: antal }}>
                  {Array.from({ length: antal }, (_, i) => {
                    const ratt = !felSet.has(i)
                    return (
                      <li key={i} data-utfall={ratt ? 'ratt' : 'fel'} data-oppen={oppen && i === oppenIndex ? '' : undefined}>
                        <span className="prov3-mini-ruta">{harRutnat(poster[i]) ? <Mini post={poster[i]} /> : <b>{i + 1}</b>}</span>
                        <small>
                          <Marke typ={ratt ? 'ratt' : 'fel'} storlek={18} fylld />
                          <b>{i + 1}</b>
                          <span className="hidden lg:inline">{ratt ? PROV3.remsaRatt : PROV3.remsaFel}</span>
                        </small>
                      </li>
                    )
                  })}
                </ol>
              </section>
            </div>
          </div>
        </div>

        <div className="relative px-4 pb-48 lg:px-10 lg:pb-14">
          <div className="mx-auto grid w-full max-w-[1120px] grid-cols-1 items-start gap-x-10 gap-y-6 pt-6 lg:grid-cols-[minmax(0,680px)_400px] lg:pt-8">
            <div className="min-w-0">
              {oppen ? (
                <section aria-labelledby="prov3-oppen-rubrik" className="steg s3">
                  <div className="mb-3 flex flex-col gap-0.5 lg:flex-row lg:items-baseline lg:justify-between">
                    <h2 id="prov3-oppen-rubrik" className="font-sess-display text-[22px] font-extrabold leading-7 tracking-[-.01em] text-ink-1 lg:text-[26px] lg:leading-8">
                      {PROV3.oppenRubrik(typ, variant, oppenIndex + 1)}
                    </h2>
                    <p className="text-[13px] leading-[18px] text-ink-2 lg:text-sm">{PROV3.oppenHoger}</p>
                  </div>
                  <OppetFacitKort post={oppen} nr={oppenIndex + 1} antal={antal} onSynlig={() => facitVisat(ktx, result.oppet_facit, token)} />
                </section>
              ) : null}
            </div>
            <div className="hidden min-w-0 lg:block">
              <ProvSparrKort d={d} topp={toppMini} />
            </div>

            <section aria-labelledby="prov3-andra-rubrik" className="steg s4 min-w-0 lg:col-span-2" data-prov-andra>
              <div className="mb-3 flex flex-col gap-0.5 lg:flex-row lg:items-baseline lg:justify-between">
                <h2 id="prov3-andra-rubrik" className="font-sess-display text-[22px] font-extrabold leading-7 tracking-[-.01em] text-ink-1 lg:text-[26px] lg:leading-8">
                  {oppen ? PROV3.andraRubrik(andra.length) : PROV3.remsaTitel(antal)}
                </h2>
                <p className="text-[13px] leading-[18px] text-ink-2 lg:text-sm">{PROV3.andraHoger(typ, andraRatt, andra.length - andraRatt)}</p>
              </div>
              <ol className="prov3-andra" style={{ ['--kol' as string]: Math.min(5, andra.length) }}>
                {andra.map((i) => {
                  const ratt = !felSet.has(i)
                  const last = variant === 'noll' || !ratt
                  return (
                    <li key={i} className="prov3-andra-kort" data-utfall={ratt ? 'ratt' : 'fel'} data-last={last ? '' : undefined} data-lista-rad={ratt ? 'ratt' : 'fel'}>
                      <span className="res-nr" data-utfall={ratt ? 'neutral' : 'fel'}>
                        {i + 1}
                      </span>
                      <span className="prov3-andra-mini" aria-hidden="true">
                        <Mini post={poster[i]} />
                      </span>
                      <span className="prov3-andra-t">
                        <b>{PROV3.kortUppgift(i + 1)}</b>
                        <span>
                          <Marke typ={ratt ? 'ratt' : 'fel'} storlek={16} fylld />
                          {ratt ? PROV3.ratt : PROV3.fel}
                        </span>
                      </span>
                      {last ? (
                        <span className="prov3-andra-las" data-lista-las>
                          <i aria-hidden="true">
                            <Las storlek={12} />
                          </i>
                          {ratt ? PROV3.radLasBakom(typ) : PROV3.radLasFel(typ)}
                        </span>
                      ) : (
                        <span className="prov3-andra-ratt">{PROV3.radRatt(typ)}</span>
                      )}
                    </li>
                  )
                })}
              </ol>
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
                <button type="button" onClick={onGorOm} className="prov3-gorom" data-prova-gor-om>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" />
                  </svg>
                  {PROV3.gorOm}
                </button>
                <span className="hidden lg:inline">
                  <Link href={LAS_OM} className="res-lank text-ink-1">
                    {PROV3.lasOm}
                  </Link>
                </span>
                <span className="lg:hidden">
                  <Link href={loginHref} className="res-lank text-ink-1">
                    {PROV3.loggaIn}
                  </Link>
                </span>
              </div>
            </section>

            <div ref={slutRef} className="min-w-0 lg:hidden" data-prov-sparr-slut>
              <ProvSparrKort d={d} topp={toppMini} />
            </div>
          </div>
        </div>
      </main>
      <ProvSparrArk d={d} dold={kortSyns} />
    </div>
  )
}

/** signup_gate_shown med spärrens nya egenskaper, för provsidan och artikeln. */
export function sparrVisad(typ: ProvTyp, plats: 'prova' | 'artikel', result: ProvaResultat, slug?: string) {
  capture('signup_gate_shown', { kind: 'test', cluster: 'test', test_kind: typ, plats, ...(slug ? { slug } : {}), ...sparrEgenskaper(result) })
}
