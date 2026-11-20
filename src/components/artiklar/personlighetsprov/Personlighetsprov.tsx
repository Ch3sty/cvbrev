'use client'

/**
 * Personlighetsprovet (docs/design/rod-trad-prov-spec-2026-09-24.md, avsnitt 3)
 * i sessionsramens form, omgång 2 steg C (skissen Personlighetsprov och
 * Personlighetsprov-resultat, godkänd av ägaren).
 *
 * En panel som byter innehåll på plats: inbjudan, svarar, laddar, resultat,
 * plus fel och kvot. Tjugo påståenden ett i taget med Likertkorten ur det
 * inloggade testet (LikertScale), profilen direkt med de fem
 * faktorerna och spärren före tolkningen. Omvändningen, kravprofilerna och
 * intervjupunkterna lämnar aldrig servern före claim: de låsta blocken är
 * tomma platshållare.
 *
 * Ett tryck svarar och går vidare efter 160 ms. Påstående 1 och korten
 * ritas på servern (sidan serverrenderar panelen, mdx-klient utan ssr:
 * false). Rubrikerna är p med display-stil, aldrig h1 till h6, så artikelns
 * rubrikträd är orört. Inga data-cta-position-attribut, så panelen räknas
 * inte som ett reklamkort. Påståendets rad har två raders min-höjd, så att
 * korten inte flyttar mellan påståendena.
 */

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { capture } from '@/lib/analytics/events'
import { storePendingPersonlighet } from '@/lib/letters/claim-draft-client'
import { useFriSikt } from '@/components/shared/useFriSikt'
import LoadingSkeleton from '@/components/shell/LoadingSkeleton'
import FlowError from '@/components/shell/FlowError'
import StatusRow from '@/components/shell/StatusRow'
import LikertScale from '@/components/personalityTest/LikertScale'
import { Las } from '@/components/session/Marke'
import { KNAPP_PRIMAR, LANK } from '@/components/shell/knappar'
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

const KORT = 'rounded-2xl border border-kant bg-papper p-4 sm:p-6'
const LYFT = 'rounded-2xl border border-[color:var(--lyft-kant,var(--kant))] bg-papper p-4 shadow-lyft sm:p-6'
const EYEBROW = 'text-[11px] font-semibold uppercase leading-4 tracking-[.08em]'
const ETIKETTER = SKALA.map((s) => s.label)

/** Platshållarradernas bredder (två rader per låst block, skissen). */
const BREDD = [86, 64]

/** Ett tryck går vidare efter 160 ms, så att valet hinner synas. */
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
  const [fel, setFel] = useState<FelTyp | null>(null)
  const [kvot, setKvot] = useState<string | null>(null)
  const [resultat, setResultat] = useState<Resultat | null>(null)

  const citatRef = useRef<HTMLParagraphElement>(null)
  const resultatRef = useRef<HTMLParagraphElement>(null)
  const felRef = useRef<HTMLDivElement>(null)
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

  useEffect(
    () => () => {
      if (vidareRef.current) clearTimeout(vidareRef.current)
    },
    []
  )

  // Fokus till påståendet vid varje byte, men bara efter ett val.
  useEffect(() => {
    if (!flyttaFokusRef.current) return
    flyttaFokusRef.current = false
    citatRef.current?.focus({ preventScroll: true })
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

  /** Ett tryck på ett kort. Går vidare efter 160 ms. */
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

  /* -------------------------------------------------------------- huvudet */
  const huvud = (
    <div className="mb-4">
      <p id={rubrikId} className={`${EYEBROW} text-koppar-ink`}>
        {COPY.eyebrow}
      </p>
      <p className="mt-1.5 font-display text-[26px] font-extrabold leading-[30px] tracking-[-0.02em] text-ink-1 [text-wrap:balance] sm:text-[32px] sm:leading-[36px]">
        {COPY.rubrik}
      </p>
      <p className="mt-2 text-[15px] leading-[23px] text-ink-2 sm:text-[17px] sm:leading-[26px]">{COPY.ingress}</p>
    </div>
  )

  /* -------------------------------------------------------------- kvoten */
  if (kvot) {
    return (
      <aside ref={sparrRef} className="prov-rum not-prose my-8" aria-labelledby={rubrikId}>
        {huvud}
        <div className={LYFT}>
          <StatusRow tone="neutral" showDot wrap>
            {kvot}
          </StatusRow>
          <Link
            href="/register"
            data-cta="personlighetsprov-gate"
            onClick={() => capture('signup_started', { cluster: 'test', source_page: kallsida })}
            className={`mt-4 ${KNAPP_PRIMAR} sm:w-auto sm:min-w-[240px]`}
          >
            {COPY.sparr.knapp}
          </Link>
          <p className="mt-3 text-[13px] leading-[18px] text-ink-3">{COPY.sparr.villkor}</p>
        </div>
      </aside>
    )
  }

  /* ----------------------------------------------------------- resultatet */
  if (phase === 'resultat' && resultat) {
    const inloggad = Boolean(resultat.href)
    const registerHref = `/register?personlighet=${encodeURIComponent(resultat.token)}`

    return (
      <div className="prov-rum not-prose my-8">
        <aside aria-labelledby={rubrikId} aria-live="polite">
          {huvud}
          <div className={KORT} data-personlighet-profil>
            <p ref={resultatRef} tabIndex={-1} className={`${EYEBROW} text-ink-3 focus:outline-none`}>
              {COPY.resultat.eyebrow}
            </p>
            <p className="mt-1 font-sess-display text-[20px] font-bold leading-[26px] tracking-[-.01em] text-ink-1">{COPY.resultat.titel}</p>
            <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{resultat.mening}</p>

            <ul className="mt-3 border-t border-kant">
              {resultat.faktorer.map((f) => (
                <li key={f.key} className="border-b border-kant py-3.5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[15px] font-semibold leading-5 text-ink-1">{f.namn}</span>
                    <Segmentrad n={f.segment} className="w-[132px] flex-shrink-0 sm:w-[156px]" />
                  </div>
                  <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{f.lasning}</p>
                </li>
              ))}
            </ul>

            <LastBlock etikett={COPY.last.kravprofiler} />
            <LastBlock etikett={COPY.last.intervju} />
            <LastBlock etikett={COPY.last.omvanda} sista />
            {inloggad ? null : <p className="sr-only">{COPY.last.sr}</p>}
          </div>
        </aside>

        <section ref={sparrRef} aria-label={inloggad ? COPY.inloggad.rubrik : COPY.sparr.eyebrow} className={`mt-4 ${LYFT}`} data-personlighet-sparr>
          {inloggad ? null : (
            <p className={`${EYEBROW} flex items-center gap-2 text-ton-ink`}>
              <Las storlek={14} />
              {COPY.sparr.eyebrow}
            </p>
          )}
          <p className="mt-2 font-sess-display text-[20px] font-bold leading-[26px] tracking-[-.01em] text-ink-1 sm:text-[22px] sm:leading-7">
            {inloggad ? COPY.inloggad.rubrik : COPY.sparr.rubrik}
          </p>
          <p className="mt-1.5 text-[15px] leading-[23px] text-ink-2">{inloggad ? COPY.inloggad.text : COPY.sparr.text}</p>
          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
            {inloggad ? (
              <Link href={resultat.href!} data-cta="personlighetsprov-konto" className={`${KNAPP_PRIMAR} sm:w-auto sm:min-w-[240px]`}>
                {COPY.inloggad.knapp}
              </Link>
            ) : (
              <Link
                href={registerHref}
                data-cta="personlighetsprov-gate"
                onClick={() => capture('signup_started', { cluster: 'test', source_page: kallsida })}
                className={`${KNAPP_PRIMAR} sm:w-auto sm:min-w-[240px]`}
              >
                {COPY.sparr.knapp}
              </Link>
            )}
            {inloggad ? null : <p className="text-[13px] leading-[18px] text-ink-3">{COPY.sparr.villkor}</p>}
          </div>
          <button type="button" onClick={gorOm} className={`${LANK} mt-2 inline-flex min-h-11 items-center`}>
            {COPY.sparr.igen}
          </button>
        </section>
      </div>
    )
  }

  /* ------------------------------------------ inbjudan, svarar, laddar */
  const laddar = phase === 'laddar'
  const n = index + 1
  const framsteg = laddar ? 1 : phase === 'inbjudan' ? 0 : index / ANTAL_PASTAENDEN
  const felCopy = fel === 'natverk' ? COPY.fel.natverk : COPY.fel.server

  return (
    <aside className="prov-rum not-prose my-8" aria-labelledby={rubrikId}>
      {huvud}
      <div className={KORT} data-personlighet-prov>
        <div className="flex items-center justify-between gap-3">
          <span className={`${EYEBROW} tabular-nums text-ink-3`} aria-live="polite">
            {COPY.steg.raknare(laddar ? ANTAL_PASTAENDEN : n)}
          </span>
          <span className="text-[13px] leading-[18px] text-ink-3">{laddar || fel ? COPY.steg.klart : COPY.steg.hoger}</span>
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-kant" aria-hidden="true">
          <span className="block h-full origin-left rounded-full bg-koppar transition-transform duration-200 ease-out motion-reduce:transition-none" style={{ transform: `scaleX(${framsteg})` }} />
        </div>

        {fel ? null : laddar ? (
          <LoadingSkeleton variant="writing" label={COPY.laddar.rubrik} meta={COPY.laddar.meta} className="mt-5" />
        ) : (
          <>
            <div className="mt-4 min-h-[56px] sm:min-h-[60px]">
              <p
                id={citatId}
                ref={citatRef}
                tabIndex={-1}
                className="font-sess-display text-[19px] font-bold leading-[26px] tracking-[-.01em] text-ink-1 [text-wrap:pretty] focus:outline-none sm:text-[22px] sm:leading-[30px]"
              >
                {textFor(aktuellt)}
              </p>
            </div>
            <div className="mt-3.5">
              <LikertScale
                value={valt}
                onChange={(v) => valj(v as SkalVarde)}
                etiketter={ETIKETTER}
                ariaLabel={COPY.reglage.etikett}
                ariaDescribedBy={citatId}
              />
            </div>
            <div className="mt-3.5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <p className="text-[13px] leading-[18px] text-ink-3">{COPY.instruktion}</p>
              {index > 0 ? (
                <button type="button" onClick={foregaende} className={`${LANK} inline-flex min-h-11 flex-shrink-0 items-center self-start sm:self-auto`}>
                  {COPY.tillbaka}
                </button>
              ) : null}
            </div>
          </>
        )}

        {fel ? (
          <div ref={felRef} tabIndex={-1} className="mt-4 focus:outline-none">
            <FlowError title={felCopy.rubrik} message={felCopy.text} retryLabel={felCopy.lank} onRetry={() => token && void skicka(token, ordning, svar)} />
          </div>
        ) : null}
      </div>
      <p className="mt-3 text-[13px] leading-[18px] text-ink-3">{COPY.fotnot}</p>
    </aside>
  )
}

/** Ett låst block: etikett med låset och två tomma platshållarrader. */
function LastBlock({ etikett, sista = false }: { etikett: string; sista?: boolean }) {
  return (
    <div className={`py-4 ${sista ? 'pb-0' : 'border-b border-kant'}`}>
      <p className="flex items-center gap-2 text-sm font-semibold leading-5 text-ink-2">
        <Las storlek={14} className="text-ink-3" />
        {etikett}
      </p>
      <div className="mt-2.5 grid gap-2" aria-hidden="true">
        {BREDD.map((b, i) => (
          <div key={i} className="h-2.5 rounded-full bg-papper-2" style={{ width: `${b}%` }} />
        ))}
      </div>
    </div>
  )
}
