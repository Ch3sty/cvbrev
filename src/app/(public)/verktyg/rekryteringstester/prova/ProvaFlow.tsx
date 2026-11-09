'use client'

/**
 * Fem matrislogikfrågor utan konto (docs/plan-konvertering.md, C9), i
 * flödesskalet enligt skissen docs/design/skiss-prov-konto-2026-11-09.html
 * (godkänd av ägaren 2026-11-09).
 *
 * Tre vyer i skalet: intron på väggen med provbladet, frågan med matrisen och
 * alternativen bredvid varandra från 900 px, och resultatet med ringen och
 * spärren med besökarens fem brickor. Toppraden har bara loggan och Logga in;
 * tråden visar framsteget, 20 procent per fråga. Samtycket ligger under den
 * scrollande mitten (globals.css, .pub-flode-skal), så useFriSikt behövs inte.
 *
 * Frågorna kommer från samma V7-pool som det inloggade grundtestet. Facit
 * finns aldrig i klienten: rättningen sker på servern, som bara svarar med
 * antal rätt, vilka positioner som blev fel och, när underlaget räcker,
 * percentilen. Rätt alternativ och reglerna kommer först med kontot.
 */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { FigurV7, LuckaV7 } from '@/lib/logicTestV7/layered.v7'
import type { LayeredCell } from '@/lib/logicTestV7/layered.v7'
import { capture } from '@/lib/analytics/events'
import { sparaProvkalla, sparaProvkallaUrAdress } from '@/lib/analytics/provkalla'
import { readPendingTestSession, storePendingTestSession } from '@/lib/letters/claim-draft-client'
import { lasSparatProv, sparaProv, type ProvaResultat, type Rutnat } from '@/lib/tests/prova-lokalt'
import PubliktFlodesskal from '@/components/registrering/PubliktFlodesskal'
import { loggaInHref } from '@/components/registrering/RegisterKontoSteg'
import { KONTO_PANEL, PROVA, SKAL } from '@/components/registrering/registrering-copy'
import ProvBrickor from '@/components/publikt/ProvBrickor'
import { MATRIS_EXPERT_ALTERNATIV, MATRIS_EXPERT_RUTOR, MatrisFigur, MatrisLucka } from '@/components/publikt/MatrisExpert'
import TypUppgiftVy from '@/components/publikt/prov/TypUppgiftVy'
import { PROV_TYP_PANEL } from '@/components/registrering/registrering-copy'
import { PROV_COPY, PROV_MITT_TEST, arNyProvTyp, provAntal, type ProvStart, type ProvTyp, type PublikUppgift } from '@/lib/tests/prov-typer'
import type { VnUnderlag } from '@/lib/tester/pass-typer'

/** Introts exempel för typerna utöver matrisen: en riktig uppgift ur banken, utan facit. */
export interface ProvExempel {
  uppgift: PublikUppgift
  underlag: Record<string, VnUnderlag>
}

interface PublicQuestion {
  id: string
  grid: (LayeredCell | null)[][]
  options: LayeredCell[]
}

interface StartResponse {
  token: string
  questions: PublicQuestion[]
  total: number
}

type Phase = 'intro' | 'running' | 'result'

const BOKSTAV = 'ABCDEFGH'

export default function ProvaFlow({ typ: typProp = 'matris', exempel = null }: { typ?: ProvTyp; exempel?: ProvExempel | null }) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [typ, setTyp] = useState<ProvTyp>(typProp)
  const [session, setSession] = useState<StartResponse | null>(null)
  // Typerna utöver matrisen (spec-prov-fler-typer-2026-11-09).
  const [typSession, setTypSession] = useState<ProvStart | null>(null)
  const [typSvar, setTypSvar] = useState<(string | null)[]>([])
  const [rutnat, setRutnat] = useState<Rutnat[]>([])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<ProvaResultat | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registerHref, setRegisterHref] = useState<string | null>(null)
  const aterstalld = useRef(false)
  const rotRef = useRef<HTMLDivElement>(null)

  // Ny vy eller ny fråga börjar överst i den scrollande mitten.
  useEffect(() => {
    const mitt = rotRef.current?.closest('main')
    if (mitt && typeof mitt.scrollTo === 'function') mitt.scrollTo({ top: 0 })
  }, [phase, index])

  // Valet och artikeln ur adressen (?mitt_test=, ?fran=), för kontots källa.
  useEffect(() => {
    sparaProvkallaUrAdress(window.location.search, 'smakprov')
  }, [])

  // Tillbaka från registreringen: resultatet står kvar.
  useEffect(() => {
    const sparat = lasSparatProv(readPendingTestSession())
    if (!sparat) return
    aterstalld.current = true
    if (sparat.typ && arNyProvTyp(sparat.typ)) setTyp(sparat.typ)
    setSession({ token: sparat.token, questions: [], total: sparat.result.total })
    setRutnat(sparat.rutnat)
    setResult(sparat.result)
    setPhase('result')
    capture('sample_restored', { kind: 'test' })
  }, [])

  async function start() {
    setLoading(true)
    setError(null)
    setRegisterHref(null)
    try {
      const ny = arNyProvTyp(typ)
      const res = await fetch('/api/public/test-session', {
        method: 'POST',
        ...(ny ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ typ }) } : {}),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message ?? data.error ?? 'Kunde inte starta provet.')
        if (typeof data.registerHref === 'string') setRegisterHref(data.registerHref)
        return
      }
      if (ny) {
        const s = data as ProvStart
        setTypSession(s)
        setSession({ token: s.token, questions: [], total: s.total })
        setRutnat([])
        setTypSvar(new Array(s.uppgifter.length).fill(null))
        setIndex(0)
        setPhase('running')
        capture('sample_started', { kind: 'test', cluster: 'test', test_kind: typ, plats: 'prova' })
        const mitt = PROV_MITT_TEST[typ]
        sparaProvkalla({ via: 'smakprov', ...(mitt ? { mitt_test: mitt } : {}) })
        return
      }
      const started = data as StartResponse
      setSession(started)
      setRutnat(started.questions.map((q) => q.grid))
      setAnswers(new Array(started.questions.length).fill(-1))
      setIndex(0)
      setPhase('running')
      capture('sample_started', { kind: 'test', cluster: 'test' })
      // Kom besökaren från en artikel blir källan smakprov:<slug>.
      sparaProvkalla({ via: 'smakprov' })
    } catch {
      setError('Vi nådde inte servern. Kontrollera uppkopplingen och försök igen.')
    } finally {
      setLoading(false)
    }
  }

  async function submit(finalAnswers: (number | string | null)[], token: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/public/test-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, answers: finalAnswers }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Kunde inte rätta provet.')
        return
      }
      const r: ProvaResultat = {
        score: data.score,
        total: data.total,
        fel: Array.isArray(data.fel) ? data.fel : [],
        percentile: typeof data.percentile === 'number' ? data.percentile : null,
      }
      setResult(r)
      sparaProv(token, r, rutnat, typ)
      setPhase('result')
    } catch {
      setError('Vi nådde inte servern. Försök igen.')
    } finally {
      setLoading(false)
    }
  }

  function choose(optionIndex: number) {
    if (!session || loading) return
    const next = [...answers]
    next[index] = optionIndex
    setAnswers(next)

    if (index + 1 < session.questions.length) {
      setIndex(index + 1)
    } else {
      void submit(next, session.token)
    }
  }

  function chooseTyp(svar: string) {
    if (!typSession || loading) return
    const next = [...typSvar]
    next[index] = svar
    setTypSvar(next)
    if (index + 1 < typSession.uppgifter.length) setIndex(index + 1)
    else void submit(next, typSession.token)
  }

  useEffect(() => {
    if (phase === 'result' && result && !aterstalld.current) {
      capture('sample_completed', { kind: 'test', cluster: 'test', test_kind: typ })
      capture('signup_gate_shown', { kind: 'test', cluster: 'test', test_kind: typ })
    }
  }, [phase, result, typ])

  const antal = typSession?.uppgifter.length || session?.questions.length || session?.total || provAntal(typ)
  const framsteg = phase === 'intro' ? 0 : phase === 'running' ? ((index + 1) / antal) * 100 : 100
  const loginHref = loggaInHref({
    intent: null,
    smakprov: phase === 'result' && session ? { typ: 'test', token: session.token } : null,
  })

  return (
    <PubliktFlodesskal
      bredd="full"
      framsteg={framsteg}
      toppLank={{ href: loginHref, text: SKAL.loggaIn, forklaring: SKAL.harKonto }}
    >
      <div ref={rotRef} className="pub-prov">
        {phase === 'intro' ? (
          <Intro typ={typ} exempel={exempel} loading={loading} error={error} registerHref={registerHref} onStart={start} />
        ) : null}

        {phase === 'running' && typSession && typSession.uppgifter[index] ? (
          <TypFraga
            typ={typ}
            uppgift={typSession.uppgifter[index]}
            underlag={typSession.underlag}
            seed={typSession.token}
            nu={index + 1}
            av={typSession.uppgifter.length}
            loading={loading}
            error={error}
            onSvar={chooseTyp}
          />
        ) : null}

        {phase === 'running' && session && !typSession ? (
          <Fraga
            fraga={session.questions[index]}
            nu={index + 1}
            av={session.questions.length}
            loading={loading}
            error={error}
            onVal={choose}
          />
        ) : null}

        {phase === 'result' && result && session ? (
          <ResultGate result={result} token={session.token} rutnat={rutnat} typ={typ} />
        ) : null}
      </div>
    </PubliktFlodesskal>
  )
}

/* ------------------------------------------------------------ delar */

function Pil() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="pub-prov-pil">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function Segment({ av, klara, className = '' }: { av: number; klara: number; className?: string }) {
  return (
    <div className={`pub-prov-segment ${className}`.trim()} aria-hidden="true">
      {Array.from({ length: av }, (_, i) => (
        <i key={i} className={i < klara ? 'klar' : undefined} />
      ))}
    </div>
  )
}

function Intro({
  typ,
  exempel,
  loading,
  error,
  registerHref,
  onStart,
}: {
  typ: ProvTyp
  exempel: ProvExempel | null
  loading: boolean
  error: string | null
  registerHref: string | null
  onStart: () => void
}) {
  const c = arNyProvTyp(typ) ? PROV_COPY[typ] : null
  const n = provAntal(typ)
  const t = c
    ? {
        ...PROVA.intro,
        kick: c.kick,
        h1: c.h1,
        ingressFet: c.ingressFet,
        ingress: c.ingress,
        steg: [n === 6 ? 'Sex uppgifter' : 'Fem uppgifter', 'Resultatet direkt', 'Kontot visar vad du missade'],
        bladKick: 'Så ser en uppgift ut',
        bladFotRubrik:
          c.forklaring === 'regeln'
            ? 'Regeln bakom uppgiften'
            : c.forklaring === 'lösningen'
              ? 'Lösningen'
              : c.forklaring === 'tekniken'
                ? 'Tekniken bakom svaret'
                : 'Förklaringen',
        bladFot: 'Visas för varje uppgift när provet är hämtat till ditt konto.',
      }
    : PROVA.intro
  return (
    <>
      <section className="pub-rum-tran pub-yta-vagg pub-prov-intro">
        <div className="pub-prov-wrap pub-prov-intro-g">
          <div>
            <p className="pub-kick">{t.kick}</p>
            <h1 className="pub-prov-h1">{t.h1}</h1>
            <p className="pub-ingress pub-prov-ingress">
              <b>{t.ingressFet}</b>
              {t.ingress}
            </p>
            <ol className="pub-prov-steg">
              {t.steg.map((s, i) => (
                <li key={s}>
                  <b>{i + 1}</b>
                  {s}
                </li>
              ))}
            </ol>
            {error ? (
              <div className="pub-prov-fel" role="alert">
                <p>{error}</p>
                {registerHref ? (
                  <Link href={registerHref} className="pub-lank">
                    {t.skapaKonto}
                  </Link>
                ) : null}
              </div>
            ) : null}
            <div className="pub-prov-handling">
              <button type="button" onClick={onStart} disabled={loading} data-cta="prova-start" className="pub-knapp">
                {loading ? t.knappBusy : t.knapp}
                {loading ? null : <Pil />}
              </button>
              <span className="pub-liten">{t.liten}</span>
            </div>
          </div>

          {c && exempel ? (
            <div className="pub-prov-blad pub-prov-blad-intro pub-prov-blad-typ" aria-hidden="true" inert>
              <div className="pub-prov-blad-topp">
                <p className="pub-kick">{t.bladKick}</p>
                <Segment av={n} klara={1} />
              </div>
              <TypUppgiftVy uppgift={exempel.uppgift} underlag={exempel.underlag} nr={1} antal={n} seed="exempel" onSvar={() => {}} disabled />
              <div className="pub-prov-blad-fot">
                <Las />
                <div>
                  <b>{t.bladFotRubrik}</b>
                  {t.bladFot}
                </div>
              </div>
            </div>
          ) : (
          <div className="pub-prov-blad pub-prov-blad-intro" aria-hidden="true">
            <div className="pub-prov-blad-topp">
              <p className="pub-kick">{t.bladKick}</p>
              <Segment av={5} klara={1} />
            </div>
            <div className="pub-prov-matris">
              <div className="pub-prov-matris-g">
                {MATRIS_EXPERT_RUTOR.map((r, i) => (
                  <div key={i}>
                    <svg viewBox="0 0 100 100" focusable="false">
                      <MatrisFigur ruta={r} streck={3.6} />
                    </svg>
                  </div>
                ))}
                <div className="lucka">
                  <svg viewBox="0 0 100 100" focusable="false">
                    <MatrisLucka streck={3.6} />
                  </svg>
                </div>
              </div>
            </div>
            <div className="pub-prov-alt pub-prov-alt-intro">
              {MATRIS_EXPERT_ALTERNATIV.map((a) => (
                <div key={a.bokstav} className={a.bokstav === 'C' ? 'vald' : undefined}>
                  <b>{a.bokstav}</b>
                  <svg viewBox="0 0 100 100" focusable="false">
                    <MatrisFigur ruta={a.ruta} streck={3.6} />
                  </svg>
                </div>
              ))}
            </div>
            <div className="pub-prov-blad-fot">
              <Las />
              <div>
                <b>{t.bladFotRubrik}</b>
                {t.bladFot}
              </div>
            </div>
          </div>
          )}
        </div>
      </section>
      <p className="pub-prov-mer">
        {t.merFore}{' '}
        <Link href="/verktyg/rekryteringstester" className="pub-lank">
          {t.merLank}
        </Link>
      </p>
    </>
  )
}

function Las() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="pub-prov-las">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function Fraga({
  fraga,
  nu,
  av,
  loading,
  error,
  onVal,
}: {
  fraga: PublicQuestion
  nu: number
  av: number
  loading: boolean
  error: string | null
  onVal: (i: number) => void
}) {
  const t = PROVA.fraga
  return (
    <>
      <section className="pub-rum-tran pub-yta-vagg pub-prov-fraga-vagg">
        <div className="pub-prov-wrap">
          <div>
            <p className="pub-kick">{t.kick}</p>
            <p className="pub-prov-fraga-rub">{t.rubrik(nu, av)}</p>
          </div>
          <Segment av={av} klara={nu} />
        </div>
      </section>
      <section className="pub-prov-wrap pub-prov-fraga-kropp">
        {/*
          Ingen frågetitel och ingen regel före svar: båda beskriver mönstret
          i ord. De visas i genomgången när provet är hämtat till ett konto.
        */}
        <div className="pub-prov-blad pub-prov-blad-fraga">
          <div className="pub-prov-blad-fraga-g">
            <div className="pub-prov-matris matrisyta">
              <div className="pub-prov-matris-g">
                {fraga.grid.flat().map((cell, i) => (
                  <div key={i} className={cell ? undefined : 'lucka'}>
                    {cell ? <FigurV7 cell={cell} /> : <LuckaV7 />}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h1 className="pub-prov-fraga-txt">{t.fraga}</h1>
              <div className="pub-prov-alt matrisyta">
                {fraga.options.map((option, i) => (
                  <button
                    key={`${fraga.id}-${i}`}
                    type="button"
                    onClick={() => onVal(i)}
                    disabled={loading}
                    aria-label={t.alternativ(BOKSTAV[i])}
                  >
                    <b aria-hidden="true">{BOKSTAV[i]}</b>
                    <FigurV7 cell={option} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          {error ? (
            <p className="pub-prov-fel" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <p className="pub-liten pub-prov-under-blad" aria-live="polite">
          {loading ? t.rattar : t.under}
        </p>
      </section>
    </>
  )
}

/** En uppgift i typerna utöver matrisen, i samma skal som matrisens fråga. */
function TypFraga({
  typ,
  uppgift,
  underlag,
  seed,
  nu,
  av,
  loading,
  error,
  onSvar,
}: {
  typ: ProvTyp
  uppgift: PublikUppgift
  underlag: Record<string, VnUnderlag>
  seed: string
  nu: number
  av: number
  loading: boolean
  error: string | null
  onSvar: (svar: string) => void
}) {
  const c = arNyProvTyp(typ) ? PROV_COPY[typ] : null
  return (
    <>
      <section className="pub-rum-tran pub-yta-vagg pub-prov-fraga-vagg">
        <div className="pub-prov-wrap">
          <div>
            <p className="pub-kick">{c?.fragaKick ?? PROVA.fraga.kick}</p>
            <p className="pub-prov-fraga-rub">{PROV_TYP_PANEL.fraga(nu, av)}</p>
          </div>
          <Segment av={av} klara={nu} />
        </div>
      </section>
      <section className="pub-prov-wrap pub-prov-fraga-kropp">
        <div className="pub-prov-blad pub-prov-blad-typ" key={uppgift.nyckel}>
          <TypUppgiftVy uppgift={uppgift} underlag={underlag} nr={nu} antal={av} seed={seed} onSvar={onSvar} disabled={loading} />
          {error ? (
            <p className="pub-prov-fel" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <p className="pub-liten pub-prov-under-blad" aria-live="polite">
          {loading ? PROVA.fraga.rattar : 'Ingen tidtagning. Nästa uppgift kommer när du svarat.'}
        </p>
      </section>
    </>
  )
}

/**
 * Resultatet och spärren. Antal rätt, vilka som blev fel och, när
 * underlaget räcker, percentilen. Rätt svar och reglerna ligger kvar på
 * servern tills kontot finns. ResultGate behåller data-cta="prova-gate".
 */
function ResultGate({ result, token, rutnat, typ }: { result: ProvaResultat; token: string; rutnat: Rutnat[]; typ: ProvTyp }) {
  const registerHref = `/register?test=${encodeURIComponent(token)}`
  const t = PROVA.resultat
  const ny = arNyProvTyp(typ) ? typ : null
  const andel = Math.max(0, Math.min(1, result.total ? result.score / result.total : 0))

  useEffect(() => {
    storePendingTestSession(token)
  }, [token])

  return (
    <>
      <section className="pub-rum-tran pub-yta-vagg pub-prov-res-vagg">
        <div className="pub-prov-wrap pub-prov-res-g">
          <div className="pub-prov-ring" style={{ ['--p' as string]: andel }} aria-hidden="true">
            <svg viewBox="0 0 132 132" focusable="false">
              <circle className="bak" cx="66" cy="66" r="58" />
              <circle className="fram" cx="66" cy="66" r="58" />
            </svg>
            <div className="siffra">
              {result.score}
              <small>{t.ringAv(result.total)}</small>
            </div>
          </div>
          <div>
            <p className="pub-kick">{t.kick}</p>
            <h1 className="pub-prov-h2">{t.rubrik(result.score, result.total)}</h1>
            {result.percentile !== null ? (
              <div className="pub-prov-kurva">
                <Kurva position={1 - result.percentile / 100} />
                <p>
                  <b>{t.percentil(result.percentile)}</b>
                  {t.percentilUnder}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
      <section className="pub-prov-wrap pub-prov-res-kropp">
        <div className="pub-kort pub-prov-sparr">
          <div>
            <h2 className="pub-prov-h3">{ny ? PROV_TYP_PANEL.sparr(ny, result.fel) : t.sparr(result.fel)}</h2>
            <ProvBrickor totalt={result.total} fel={result.fel} rutnat={rutnat} />
            <ul className="pub-prov-bock">
              {(ny ? PROV_TYP_PANEL.rader(ny, result.fel, result.total) : KONTO_PANEL.rader(result.fel, result.total)).map((r) => (
                <li key={r.fet}>
                  <span>
                    <b>{r.fet}</b>
                    {r.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="pub-prov-sparr-handling">
            <Link
              href={registerHref}
              data-cta="prova-gate"
              onClick={() =>
                capture('signup_started', {
                  cluster: 'test',
                  source_page: '/verktyg/rekryteringstester/prova',
                })
              }
              className="pub-knapp"
            >
              {t.knapp(result.fel)}
              <Pil />
            </Link>
            <p className="pub-liten">{t.liten}</p>
          </div>
        </div>
        <p className="pub-prov-premium">
          <PremiumIkon />
          <span>
            <b className="pub-gradord">{KONTO_PANEL.premiumRad.namn}</b>
            <span>{ny ? PROV_TYP_PANEL.premium(ny) : KONTO_PANEL.premiumRad.text}</span>
          </span>
        </p>
      </section>
    </>
  )
}

/** Klockkurvan med markören (IlluTestResultat), ritad för väggen. */
function Kurva({ position }: { position: number }) {
  const p = Math.min(0.95, Math.max(0.05, position))
  const x = 16 + p * 128
  const bell = Math.exp(-Math.pow((p - 0.5) / 0.24, 2) / 2)
  const y = 78 - bell * 52
  return (
    <svg viewBox="0 0 160 100" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M12 78h136" stroke="currentColor" strokeWidth="3" strokeOpacity=".35" />
      <path d="M16 78c18 0 26-4 34-22s14-30 30-30 22 12 30 30 16 22 34 22" stroke="currentColor" strokeWidth="3" />
      <path d={`M${x.toFixed(1)} ${y.toFixed(1)}v${(78 - y).toFixed(1)}`} stroke="currentColor" strokeWidth="3" strokeOpacity=".45" strokeDasharray="4 5" />
      <circle cx={x.toFixed(1)} cy={y.toFixed(1)} r="8" fill="var(--koppar)" stroke="currentColor" strokeWidth="3" />
    </svg>
  )
}

function PremiumIkon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <rect x="6" y="6" width="52" height="52" rx="8" />
      <path d="M23 6v52M41 6v52M6 23h52M6 41h52" opacity=".45" />
      <circle cx="14.5" cy="14.5" r="3.5" />
      <path d="M28 18h8v-7" />
      <circle cx="32" cy="32" r="3.5" />
      <rect x="44" y="44" width="10" height="10" rx="2" fill="var(--koppar)" stroke="none" />
    </svg>
  )
}
