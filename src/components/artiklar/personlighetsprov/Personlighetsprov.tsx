'use client'

/**
 * Personlighetsprovet (docs/design/rod-trad-prov-spec-2026-09-24.md, avsnitt 3,
 * design docs/design/rod-trad-prov-2026-09-24.html, Del A med finishomgången).
 *
 * En panel som byter innehåll på plats: inbjudan, svarar, laddar, resultat,
 * plus fel och kvot. Tjugo påståenden ett i taget, en femgradig skala som
 * reglage, profilen direkt och spärren före tolkningen. Omvändningen,
 * kravprofilerna och intervjupunkterna lämnar aldrig servern före claim:
 * de låsta blocken är tomma platshållare.
 *
 * Rubriken är ett p med display-stil, aldrig h2 eller h3, så artikelns
 * rubrikträd är orört. Inga data-cta-position-attribut, så panelen räknas
 * inte som ett reklamkort. Panelens höjd låses av citatets min-höjd (två
 * rader), reglagets fasta höjd och det valda ordets reserverade rad.
 */

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import Link from 'next/link'
import { ArrowRight, Lock } from 'lucide-react'
import { capture } from '@/lib/analytics/events'
import { storePendingPersonlighet } from '@/lib/letters/claim-draft-client'
import { IlluBlurGate } from '@/components/illustrations/StartFlowIllustrations'
import { IlluProfilPentagon } from '@/components/illustrations/TestIllustrations'
import { useFriSikt } from '@/components/shared/useFriSikt'
import LoadingSkeleton from '@/components/shell/LoadingSkeleton'
import FlowError from '@/components/shell/FlowError'
import StatusRow from '@/components/shell/StatusRow'
import {
  ANTAL_PASTAENDEN,
  SKALA,
  SMAKPROV_PASTAENDEN,
  blandaOrdning,
  textFor,
  type SkalVarde,
  type SmakprovId,
} from '@/lib/personlighet/smakprov-pastaenden'
import type { Faktor } from '@/lib/personlighet/smakprov-tolkning'
import { COPY } from './personlighetsprov-copy'
import Segmentrad from './Segmentrad'

export interface PersonlighetsprovProps {
  /** Artikelns slug eller 'verktyg/personlighetstest', för eventen och source_page. */
  slug?: string
}

type Phase = 'inbjudan' | 'svarar' | 'laddar' | 'resultat'
type FelTyp = 'server' | 'natverk'

interface Resultat {
  token: string
  mening: string
  faktorer: Array<{ key: Faktor; namn: string; bandOrd: string; segment: number; lasning: string }>
  lockedCounts: { krav: number; intervju: number; omvanda: number }
  expiresAt: string | null
  href?: string
}

interface Sparat {
  token: string
  svar: Partial<Record<SmakprovId, SkalVarde>>
  start?: number
}

const KNAPP =
  'inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover sm:w-auto'
const TEXTLANK =
  'inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1'
const PANEL = 'not-prose relative my-8 overflow-hidden rounded-xl border border-kant bg-panel p-4 sm:p-6'

/** Platshållarradernas bredder, ur designfilen. */
const BREDD = {
  krav: [88, 76, 92, 70, 84, 78],
  intervju: [84, 90, 72, 86, 64],
  omvanda: [80, 68, 50],
}

/** Ordningen i femhörningen, medurs från toppen. */
const PENTAGON: readonly Faktor[] = ['conscientiousness', 'extraversion', 'stability', 'agreeableness', 'openness']

/** Ett tryck går vidare efter 160 ms, så att fyllningen hinner synas. */
const VIDARE_MS = 160
/** Skelettet står minst så här länge, så att bytet inte blinkar. */
const MIN_LADDNING_MS = 450

const LAGRING = (token: string) => `jc_smakprov_${token}`
const AKTIV = 'jc_smakprov_aktiv'

function lasSparat(): Sparat | null {
  try {
    const token = sessionStorage.getItem(AKTIV)
    if (!token) return null
    const raw = sessionStorage.getItem(LAGRING(token))
    if (!raw) return null
    const data = JSON.parse(raw) as Sparat
    return data && data.token === token ? data : null
  } catch {
    return null
  }
}

function spara(data: Sparat) {
  try {
    sessionStorage.setItem(AKTIV, data.token)
    sessionStorage.setItem(LAGRING(data.token), JSON.stringify(data))
  } catch {
    // Privat läge: provet fungerar, men överlever inte en omladdning.
  }
}

function rensa(token: string | null) {
  try {
    sessionStorage.removeItem(AKTIV)
    if (token) sessionStorage.removeItem(LAGRING(token))
  } catch {
    // Inget att städa.
  }
}

/**
 * En ny token vars ordning börjar på påstående 1, som redan syns i
 * inbjudan. I snitt tjugo försök, inget märkbart.
 */
function nyToken(forsta: SmakprovId): { token: string; ordning: SmakprovId[] } {
  for (let i = 0; i < 500; i++) {
    const token = crypto.randomUUID()
    const ordning = blandaOrdning(token)
    if (ordning[0] === forsta) return { token, ordning }
  }
  const token = crypto.randomUUID()
  return { token, ordning: blandaOrdning(token) }
}

const FORSTA = SMAKPROV_PASTAENDEN[0].id

export default function Personlighetsprov({ slug }: PersonlighetsprovProps) {
  const rubrikId = useId()
  const citatId = useId()

  const [phase, setPhase] = useState<Phase>('inbjudan')
  const [token, setToken] = useState<string | null>(null)
  const [ordning, setOrdning] = useState<SmakprovId[]>([FORSTA])
  const [svar, setSvar] = useState<Partial<Record<SmakprovId, SkalVarde>>>({})
  const [index, setIndex] = useState(0)
  const [valt, setValt] = useState<SkalVarde | null>(null)
  const [fokusLage, setFokusLage] = useState<SkalVarde | null>(null)
  const [fel, setFel] = useState<FelTyp | null>(null)
  const [kvot, setKvot] = useState<string | null>(null)
  const [resultat, setResultat] = useState<Resultat | null>(null)

  const citatRef = useRef<HTMLParagraphElement>(null)
  const resultatRef = useRef<HTMLParagraphElement>(null)
  const felRef = useRef<HTMLDivElement>(null)
  const stoppRef = useRef<Array<HTMLButtonElement | null>>([])
  const sparrRef = useRef<HTMLElement>(null)
  const startRef = useRef<number | null>(null)
  const vidareRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const flyttaFokusRef = useRef(false)
  useFriSikt(sparrRef, phase === 'resultat' || kvot !== null)

  const kallsida = slug ? (slug.startsWith('verktyg/') ? `/${slug}` : `/artiklar/${slug}`) : undefined
  const aktuellt = ordning[index] ?? FORSTA

  // Återuppta ett påbörjat prov efter omladdning, på rätt påstående och med samma ordning.
  useEffect(() => {
    const s = lasSparat()
    if (!s) return
    const o = blandaOrdning(s.token)
    const n = o.findIndex((id) => s.svar[id] === undefined)
    if (n <= 0) {
      rensa(s.token)
      return
    }
    setToken(s.token)
    setOrdning(o)
    setSvar(s.svar)
    setIndex(n)
    setPhase('svarar')
    startRef.current = s.start ?? Date.now()
  }, [])

  useEffect(() => () => {
    if (vidareRef.current) clearTimeout(vidareRef.current)
  }, [])

  // Fokus till citatet vid varje byte av påstående, men bara efter ett val.
  useEffect(() => {
    if (!flyttaFokusRef.current) return
    flyttaFokusRef.current = false
    citatRef.current?.focus()
  }, [index])

  // Resultatet: fokus, mätning, token inför registreringen.
  useEffect(() => {
    if (phase !== 'resultat' || !resultat) return
    resultatRef.current?.focus()
    capture('sample_completed', {
      kind: 'personality',
      cluster: 'test',
      slug,
      duration_ms: startRef.current ? Date.now() - startRef.current : undefined,
    })
    if (!resultat.href) {
      storePendingPersonlighet(resultat.token)
      capture('signup_gate_shown', { kind: 'personality', cluster: 'test', slug })
    }
  }, [phase, resultat, slug])

  useEffect(() => {
    if (fel) felRef.current?.focus()
  }, [fel])

  const skicka = useCallback(
    async (t: string, o: SmakprovId[], alla: Partial<Record<SmakprovId, SkalVarde>>) => {
      setFel(null)
      setPhase('laddar')
      const start = Date.now()
      const vanta = () => new Promise((r) => setTimeout(r, Math.max(0, MIN_LADDNING_MS - (Date.now() - start))))
      try {
        const res = await fetch('/api/public/personlighetsprov', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: t, answers: o.map((id) => ({ id, value: alla[id] })), slug }),
        })
        const data = await res.json().catch(() => ({}))
        await vanta()
        if (res.ok) {
          rensa(t)
          setResultat(data as Resultat)
          setPhase('resultat')
          return
        }
        if (res.status === 429) {
          setKvot(typeof data.message === 'string' ? data.message : COPY.kvot.ip)
          setPhase('svarar')
          return
        }
        setPhase('svarar')
        setFel('server')
      } catch {
        await vanta()
        setPhase('svarar')
        setFel('natverk')
      }
    },
    [slug]
  )

  /** Ett val på reglaget. Går vidare efter 160 ms. */
  function valj(v: SkalVarde) {
    if (phase === 'laddar' || phase === 'resultat') return
    if (vidareRef.current) clearTimeout(vidareRef.current)
    setValt(v)
    setFel(null)

    let t = token
    let o = ordning
    if (!t) {
      const ny = nyToken(FORSTA)
      t = ny.token
      o = ny.ordning
      setToken(t)
      setOrdning(o)
      startRef.current = Date.now()
      capture('sample_started', { kind: 'personality', cluster: 'test', slug })
    }

    const id = o[index]
    const nya = { ...svar, [id]: v }
    setSvar(nya)
    spara({ token: t, svar: nya, start: startRef.current ?? Date.now() })

    const tt = t
    const oo = o
    vidareRef.current = setTimeout(() => {
      vidareRef.current = null
      if (index >= ANTAL_PASTAENDEN - 1) {
        void skicka(tt, oo, nya)
        return
      }
      const nasta = index + 1
      flyttaFokusRef.current = true
      setPhase('svarar')
      setIndex(nasta)
      setValt(nya[oo[nasta]] ?? null)
    }, VIDARE_MS)
  }

  function foregaende() {
    if (index === 0) return
    if (vidareRef.current) clearTimeout(vidareRef.current)
    const f = index - 1
    flyttaFokusRef.current = true
    setIndex(f)
    setValt(svar[ordning[f]] ?? null)
    setFel(null)
  }

  function gorOm() {
    rensa(token)
    setResultat(null)
    setKvot(null)
    setToken(null)
    setOrdning([FORSTA])
    setSvar({})
    setIndex(0)
    setValt(null)
    setFel(null)
    startRef.current = null
    setPhase('inbjudan')
    requestAnimationFrame(() => citatRef.current?.focus())
  }

  /** Radiogruppen: pilarna flyttar fokus och val, mellanslag och Enter går vidare. */
  function onTangent(e: KeyboardEvent<HTMLDivElement>) {
    const nu = fokusLage ?? valt ?? 3
    let ny: number | null = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') ny = Math.min(5, nu + 1)
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ny = Math.max(1, nu - 1)
    if (e.key === 'Home') ny = 1
    if (e.key === 'End') ny = 5
    if (ny !== null) {
      e.preventDefault()
      setValt(ny as SkalVarde)
      setFokusLage(ny as SkalVarde)
      stoppRef.current[ny - 1]?.focus()
      return
    }
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      valj((fokusLage ?? valt ?? 3) as SkalVarde)
    }
  }

  const eyebrow = (
    <p id={rubrikId} className="text-steg uppercase text-ink-3">
      {COPY.eyebrow}
    </p>
  )
  const rubrik = (
    <p className="mt-2 font-display text-[22px] font-bold leading-7 tracking-[-0.02em] text-ink-1 [text-wrap:balance]">
      {COPY.rubrik}
    </p>
  )

  /* -------------------------------------------------------------- kvoten */
  if (kvot) {
    return (
      <aside ref={sparrRef} className={PANEL} aria-labelledby={rubrikId}>
        {eyebrow}
        {rubrik}
        <StatusRow tone="neutral" showDot wrap className="mt-4">
          {kvot}
        </StatusRow>
        <Link
          href="/register"
          data-cta="personlighetsprov-gate"
          onClick={() => capture('signup_started', { cluster: 'test', source_page: kallsida })}
          className={`mt-4 ${KNAPP}`}
        >
          {COPY.sparr.knapp}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <p className="mt-3 text-meta text-ink-3">{COPY.sparr.villkor}</p>
      </aside>
    )
  }

  /* ----------------------------------------------------------- resultatet */
  if (phase === 'resultat' && resultat) {
    const inloggad = Boolean(resultat.href)
    const registerHref = `/register?personlighet=${encodeURIComponent(resultat.token)}`
    const segmentFor = (k: Faktor) => resultat.faktorer.find((f) => f.key === k)?.segment ?? 3
    const levels = PENTAGON.map((k) => segmentFor(k) / 5)

    return (
      <>
        <aside className={PANEL} aria-labelledby={rubrikId} aria-live="polite">
          <p
            id={rubrikId}
            ref={resultatRef}
            tabIndex={-1}
            className="text-steg uppercase text-ink-3 focus:outline-none"
          >
            {COPY.resultat.eyebrow}
          </p>
          <div className="mt-3 flex items-start gap-4">
            <span className="shrink-0 text-ink-1">
              <IlluProfilPentagon levels={levels} size={96} className="sm:hidden" />
              <IlluProfilPentagon levels={levels} size={112} className="hidden sm:block" />
            </span>
            <p className="mt-1 min-w-0 flex-1 text-varde text-ink-1 sm:text-xl sm:leading-[26px]">
              {resultat.mening}
            </p>
          </div>

          <ul className="mt-4 grid gap-4 border-t border-kant pt-4">
            {resultat.faktorer.map((f) => (
              <li key={f.key}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-semibold leading-5 text-ink-1">{f.namn}</span>
                  <span className="whitespace-nowrap text-meta font-medium text-ink-2">{f.bandOrd}</span>
                </div>
                <Segmentrad n={f.segment} />
                <p className="mt-2 text-sm leading-[22px] text-ink-2 sm:text-[15px] sm:leading-[23px]">{f.lasning}</p>
              </li>
            ))}
          </ul>

          <LastBlock etikett={COPY.last.kravprofiler} bredder={BREDD.krav} forsta />
          <LastBlock etikett={COPY.last.intervju} bredder={BREDD.intervju} />
          <LastBlock etikett={COPY.last.omvanda} bredder={BREDD.omvanda} />
          {inloggad ? null : <p className="sr-only">{COPY.last.sr}</p>}
        </aside>

        <section ref={sparrRef} className="not-prose mb-8 mt-6 rounded-xl border border-kant-stark bg-panel p-4 sm:p-6">
          <div className="sm:flex sm:items-start sm:gap-5">
            <IlluBlurGate size={96} className="hidden shrink-0 text-ink-1 sm:block" />
            <div className="min-w-0 flex-1">
              <p className="text-kort text-ink-1">{inloggad ? COPY.inloggad.rubrik : COPY.sparr.rubrik}</p>
              <p className="mt-1.5 text-sm leading-[22px] text-ink-2">
                {inloggad ? COPY.inloggad.text : COPY.sparr.text}
              </p>
              {inloggad ? (
                <Link href={resultat.href!} data-cta="personlighetsprov-konto" className={`mt-4 ${KNAPP}`}>
                  {COPY.inloggad.knapp}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : (
                <Link
                  href={registerHref}
                  data-cta="personlighetsprov-gate"
                  onClick={() => capture('signup_started', { cluster: 'test', source_page: kallsida })}
                  className={`mt-4 ${KNAPP}`}
                >
                  {COPY.sparr.knapp}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-x-5 text-meta text-ink-3">
                {inloggad ? null : <span>{COPY.sparr.villkor}</span>}
                <button type="button" onClick={gorOm} className={TEXTLANK}>
                  {COPY.sparr.igen}
                </button>
              </div>
            </div>
          </div>
        </section>
      </>
    )
  }

  /* ------------------------------------------ inbjudan, svarar, laddar */
  const laddar = phase === 'laddar'
  const inbjudan = phase === 'inbjudan'
  const n = index + 1
  const framsteg = laddar ? 100 : inbjudan ? 0 : (n / ANTAL_PASTAENDEN) * 100
  const fyllning = valt ? ((valt - 1) / 4) * 100 : 0
  const valtOrd = valt ? SKALA[valt - 1].label : null
  const felCopy = fel === 'natverk' ? COPY.fel.natverk : COPY.fel.server
  // Roving tabindex: det valda läget, annars mitten, är gruppens tabbstopp.
  const tabbStopp = fokusLage ?? valt ?? 3

  return (
    <aside className={PANEL} aria-labelledby={rubrikId}>
      {/* Framstegslinjen: tråden längs panelens överkant, från påstående 2. */}
      {inbjudan ? null : (
        <span
          aria-hidden="true"
          className="absolute -top-px left-0 h-0.5 rounded-sm bg-accent transition-[width] duration-[160ms] ease-out motion-reduce:transition-none"
          style={{ width: `${framsteg}%` }}
        />
      )}
      {eyebrow}
      {inbjudan ? (
        <>
          {rubrik}
          <p className="mt-2 text-sm leading-[22px] text-ink-2 sm:text-base sm:leading-6">{COPY.ingress}</p>
        </>
      ) : null}

      <div className="mt-4 flex justify-between gap-3 text-meta tabular-nums text-ink-3">
        <span aria-live="polite">{COPY.steg.raknare(laddar ? ANTAL_PASTAENDEN : n)}</span>
        <span>{laddar || fel ? COPY.steg.klart : COPY.steg.hoger}</span>
      </div>

      {fel ? null : laddar ? (
        <LoadingSkeleton variant="writing" label={COPY.laddar.rubrik} meta={COPY.laddar.meta} className="mt-4" />
      ) : (
        // Flexkolumn: "Föregående påstående" står före reglaget i DOM:en (Skift+Tab
        // från reglaget når den, spec avsnitt 8 punkt 16) men ritas under det.
        <div className="flex flex-col">
          <div className="mt-3 min-h-[52px] sm:min-h-[56px]">
            <blockquote className="border-l-[3px] border-accent py-0.5 pl-3 font-display text-lg font-semibold leading-6 tracking-[-0.01em] text-ink-1 sm:text-xl sm:leading-[26px]">
              <p id={citatId} ref={citatRef} tabIndex={-1} className="focus:outline-none">
                {textFor(aktuellt)}
              </p>
            </blockquote>
          </div>
          <p className="mt-2 text-meta text-ink-3">{COPY.instruktion}</p>

          {inbjudan ? null : (
            <div className="order-last mt-2 flex items-center justify-between gap-3">
              {index > 0 ? (
                <button type="button" onClick={foregaende} className={TEXTLANK}>
                  {COPY.tillbaka}
                </button>
              ) : (
                <span />
              )}
              <span className="text-meta text-ink-3">{COPY.sparas}</span>
            </div>
          )}

          {/* Reglaget: fem stopp på ett insunket spår, fyllt i bläck till valt läge. */}
          <div className="relative mt-4">
            <div
              aria-hidden="true"
              className="absolute left-[10%] right-[10%] top-[18px] h-2 rounded-full bg-insunken shadow-insunken"
            >
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-ink-1 transition-[width] duration-[160ms] ease-out motion-reduce:transition-none"
                style={{ width: `${fyllning}%` }}
              />
            </div>
            <div
              role="radiogroup"
              aria-label={COPY.reglage.etikett}
              aria-describedby={citatId}
              onKeyDown={onTangent}
              className="relative grid h-11 grid-cols-5"
            >
              {SKALA.map((s) => {
                const ar = valt === s.value
                const passerad = valt !== null && s.value < valt
                return (
                  <button
                    key={s.value}
                    ref={(el) => {
                      stoppRef.current[s.value - 1] = el
                    }}
                    type="button"
                    role="radio"
                    aria-checked={ar}
                    aria-label={`${s.label}, ${COPY.reglage.lage(s.value)}`}
                    tabIndex={s.value === tabbStopp ? 0 : -1}
                    onClick={() => valj(s.value)}
                    onFocus={() => setFokusLage(s.value)}
                    onBlur={() => setFokusLage(null)}
                    className="group relative flex h-11 items-center justify-center rounded-lg outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-[6px] focus-visible:outline-accent"
                  >
                    <span
                      aria-hidden="true"
                      className={`flex items-center justify-center rounded-full border-2 transition-[width,height,background-color,border-color] duration-[160ms] ease-out motion-reduce:transition-none ${
                        ar
                          ? 'h-6 w-6 border-ink-1 bg-ink-1 text-white'
                          : passerad
                            ? 'h-3.5 w-3.5 border-ink-1 bg-ink-1'
                            : 'h-3.5 w-3.5 border-kant-stark bg-panel group-hover:border-ink-1'
                      }`}
                    >
                      {ar ? (
                        <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 10.5l4 4 8-9" />
                        </svg>
                      ) : null}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="mt-0.5 flex justify-between gap-3 text-meta text-ink-3" aria-hidden="true">
              <span>{SKALA[0].label}</span>
              <span>{SKALA[4].label}</span>
            </div>
            <p
              className={`mt-1 min-h-5 text-center text-sm leading-5 ${valtOrd ? 'font-medium text-ink-1' : 'text-ink-3'}`}
              aria-live="polite"
            >
              {valtOrd ?? COPY.reglage.tom}
            </p>
          </div>
        </div>
      )}

      {fel ? (
        <div ref={felRef} tabIndex={-1} className="mt-4 focus:outline-none">
          <FlowError
            title={felCopy.rubrik}
            message={felCopy.text}
            retryLabel={felCopy.lank}
            onRetry={() => token && void skicka(token, ordning, svar)}
          />
        </div>
      ) : null}

      {laddar || fel || !inbjudan ? null : <p className="mt-3 text-meta text-ink-3">{COPY.fotnot}</p>}
    </aside>
  )
}

/** Ett låst block: etikett med hänglås och tomma platshållarrader. */
function LastBlock({ etikett, bredder, forsta }: { etikett: string; bredder: number[]; forsta?: boolean }) {
  return (
    <div className={forsta ? 'mt-4 border-t border-kant pt-4' : 'mt-5'}>
      <p className="flex items-center gap-2 text-sm font-semibold leading-5 text-ink-3">
        <Lock className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
        {etikett}
      </p>
      <div className="mt-2.5 grid gap-2.5" aria-hidden="true">
        {bredder.map((b, i) => (
          <div key={i} className="h-3 rounded bg-kant opacity-[0.55]" style={{ width: `${b}%` }} />
        ))}
      </div>
    </div>
  )
}
