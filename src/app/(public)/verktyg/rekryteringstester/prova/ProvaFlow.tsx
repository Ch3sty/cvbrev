'use client'

/**
 * Provet utan konto (docs/plan-konvertering.md, C9) i sessionsramen, omgång 2
 * steg C (skissen KtViRMpthysT8t34isdnPK, Prova-start, Prova-uppgift och
 * Prova-resultat, godkänd av ägaren).
 *
 * Tre vyer:
 *   start     ramens Startskarm i publikt läge: typens scen, rubriken, de
 *             tre reglerna och det lyfta kortet med typvalet och en
 *             kopparknapp (data-cta="prova-start"). Renderas på servern.
 *   uppgift   SessionsRam i publikt läge: ingen klocka, ingen Förklaring,
 *             inget facit, ingen väg tillbaka. Ett tryck markerar, Nästa
 *             bekräftar och går vidare, sista knappen är Visa resultatet.
 *             Uppgiften ritas av typens komponent (session/typer), samma som
 *             inloggat. Avbryt frågar "Avbryta provet? Inget sparas.".
 *   resultat  ramens resultatbild: väggen med ringen och "3 av 5 rätt",
 *             Uppgiftslistan låst (utfallet per uppgift, aldrig rätt svar)
 *             och spärren med data-cta="prova-gate" till /register?test=.
 *
 * Facit finns aldrig i klienten: rättningen sker på servern, som bara svarar
 * med antal rätt, vilka positioner som blev fel och, när underlaget räcker,
 * percentilen. Kropparna mot /api/public/test-session är som förut: matrisen
 * startas utan kropp, typerna med { typ }, rättningen { token, answers }.
 */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { capture } from '@/lib/analytics/events'
import { sparaProvkalla, sparaProvkallaUrAdress } from '@/lib/analytics/provkalla'
import { readPendingTestSession, storePendingTestSession } from '@/lib/letters/claim-draft-client'
import { lasSparatProv, sparaProv, type ProvaResultat, type Rutnat } from '@/lib/tests/prova-lokalt'
import { loggaInHref } from '@/components/registrering/RegisterKontoSteg'
import { PROVA } from '@/components/registrering/registrering-copy'
import { PROV_COPY, PROV_MITT_TEST, PROV_TYPER, arNyProvTyp, type ProvStart, type ProvTyp, type PublikUppgift } from '@/lib/tests/prov-typer'
import type { VnUnderlag } from '@/lib/tester/pass-typer'
import SessionsRam from '@/components/session/SessionsRam'
import Startskarm from '@/components/session/Startskarm'
import Uppgiftslistan from '@/components/session/Uppgiftslistan'
import Dagsring from '@/components/rum/Dagsring'
import { Las } from '@/components/session/Marke'
import { IkonX } from '@/components/illustrations/RumSymboler'
import { KLART, SESSION } from '@/components/session/copy'
import { ramUnderlag } from '@/components/session/lagen/gemensamt'
import { KNAPP_PRIMAR, LANK } from '@/components/shell/knappar'
import type { RamFacit, TypRitare } from '@/components/session/typ'
import type { ListPost } from '@/components/session/Uppgiftslistan'
import ProvUppgiftVy from '@/components/publikt/prov/ProvUppgiftVy'
import { PROV_NAMN, franMatris, franPublika, provForm, varmProvet, type MatrisFraga, type ProvPost, type ProvU } from '@/components/publikt/prov/provPost'
import { PROV_RAM, forklaringOrd } from '@/components/publikt/prov/prov-copy'

/** Introts exempel för typerna utöver matrisen (sidan läser det fortfarande; startskärmen visar scenen i stället). */
export interface ProvExempel {
  uppgift: PublikUppgift
  underlag: Record<string, VnUnderlag>
}

interface StartResponse {
  token: string
  questions: MatrisFraga[]
  total: number
}

type Phase = 'intro' | 'running' | 'result'

const TILLBAKA = '/verktyg/rekryteringstester'
const PROVA_PATH = '/verktyg/rekryteringstester/prova'

/** Typvalets ordning på startskärmen: matrisen först, I-provet sist. */
const TYPVAL: readonly ProvTyp[] = ['matris', 'figurserie', 'talserie', 'numerisk', 'verbal', 'deduktiv', 'spatial', 'ordforrad', 'iprov']

export default function ProvaFlow({ typ: typProp = 'matris' }: { typ?: ProvTyp; exempel?: ProvExempel | null }) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('intro')
  const [typ, setTyp] = useState<ProvTyp>(typProp)
  const [token, setToken] = useState<string | null>(null)
  const [poster, setPoster] = useState<ProvPost[]>([])
  const [deltest, setDeltest] = useState<(string | null)[]>([])
  const [svar, setSvar] = useState<(string | number | null)[]>([])
  const [rutnat, setRutnat] = useState<Rutnat[]>([])
  const [index, setIndex] = useState(0)
  const [vald, setVald] = useState<number | null>(null)
  const [result, setResult] = useState<ProvaResultat | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registerHref, setRegisterHref] = useState<string | null>(null)
  const aterstalld = useRef(false)

  // Valet och artikeln ur adressen (?mitt_test=, ?fran=, /pedro med utm), för kontots källa.
  useEffect(() => {
    sparaProvkallaUrAdress(window.location.search, 'smakprov')
  }, [])

  // Tillbaka från registreringen: resultatet står kvar.
  useEffect(() => {
    const sparat = lasSparatProv(readPendingTestSession())
    if (!sparat) return
    aterstalld.current = true
    if (sparat.typ && arNyProvTyp(sparat.typ)) setTyp(sparat.typ)
    setToken(sparat.token)
    setRutnat(sparat.rutnat)
    setResult(sparat.result)
    setPhase('result')
    capture('sample_restored', { kind: 'test' })
  }, [])

  // Startskärmen: servern värms medan hon läser reglerna, så att Starta
  // inte väntar på en kall funktion (slutkontrollen omgång 2).
  useEffect(() => {
    if (phase === 'intro') varmProvet()
  }, [phase])

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
      let nya: ProvPost[]
      if (ny) {
        const s = data as ProvStart
        nya = franPublika(s.uppgifter, s.underlag)
        setDeltest(s.uppgifter.map((u) => u.deltest ?? null))
        setRutnat([])
        setToken(s.token)
      } else {
        const s = data as StartResponse
        nya = s.questions.map(franMatris)
        setDeltest([])
        setRutnat(s.questions.map((q) => q.grid))
        setToken(s.token)
      }
      setPoster(nya)
      setSvar(new Array(nya.length).fill(null))
      setIndex(0)
      setVald(null)
      setPhase('running')
      capture('sample_started', { kind: 'test', cluster: 'test', test_kind: typ, plats: 'prova' })
      // Kom besökaren från en artikel blir källan smakprov:<slug>.
      const mitt = PROV_MITT_TEST[typ]
      sparaProvkalla({ via: 'smakprov', ...(mitt ? { mitt_test: mitt } : {}) })
    } catch {
      setError('Vi nådde inte servern. Kontrollera uppkopplingen och försök igen.')
    } finally {
      setLoading(false)
    }
  }

  async function submit(alla: (string | number | null)[], t: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/public/test-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: t, answers: alla }),
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
      sparaProv(t, r, rutnat, typ)
      setPhase('result')
    } catch {
      setError('Vi nådde inte servern. Försök igen.')
    } finally {
      setLoading(false)
    }
  }

  /** Nästa (eller Visa resultatet): det markerade svaret gäller och nästa uppgift kommer. */
  function bekrafta() {
    const post = poster[index]
    if (!post || vald === null || loading || !token) return
    const next = [...svar]
    next[index] = post.varde(vald)
    setSvar(next)
    if (index + 1 < poster.length) {
      setIndex(index + 1)
      setVald(null)
    } else {
      void submit(next, token)
    }
  }

  function tillStart() {
    setPhase('intro')
    setPoster([])
    setSvar([])
    setIndex(0)
    setVald(null)
    setResult(null)
    setError(null)
    aterstalld.current = false
  }

  useEffect(() => {
    if (phase === 'result' && result && !aterstalld.current) {
      capture('sample_completed', { kind: 'test', cluster: 'test', test_kind: typ, plats: 'prova' })
      capture('signup_gate_shown', { kind: 'test', cluster: 'test', test_kind: typ, plats: 'prova' })
    }
  }, [phase, result, typ])

  if (phase === 'result' && result && token) {
    return (
      <ProvResultat
        typ={typ}
        result={result}
        token={token}
        poster={poster}
        rutnat={rutnat}
        onStang={() => router.push(TILLBAKA)}
        onGorOm={() => {
          aterstalld.current = false
          tillStart()
        }}
      />
    )
  }

  if (phase === 'running' && poster[index]) {
    const post = poster[index]
    const antal = poster.length
    const sista = index + 1 >= antal
    return (
      <SessionsRam
        lage="publikt"
        titel={PROV_NAMN[typ]}
        undertitel={PROV_RAM.undertitel(antal)}
        form={provForm([post])}
        raknare={{ nr: index + 1, antal }}
        framsteg={index / antal}
        nyckel={post.u.nyckel}
        underlag={ramUnderlag(post.ritare, post.u)}
        scen={typ}
        bekraftaAvbryt
        onAvbryt={tillStart}
        tangent={loading ? null : { antal: post.ritare.antalAlternativ(post.u), onValj: setVald }}
        fot={{
          primar: {
            text: sista ? SESSION.knapp.visaResultat : SESSION.knapp.nasta,
            onClick: bekrafta,
            disabled: vald === null,
            laddar: loading,
            data: 'prova-nasta',
          },
        }}
        rad={
          error ? (
            <p role="alert" className="rounded-xl border border-kant bg-papper px-3.5 py-2.5 text-sm leading-5 text-ink-1">
              {error}
            </p>
          ) : null
        }
      >
        <ProvUppgiftVy post={post} nr={index + 1} antal={antal} vald={vald} onValj={setVald} last={loading} deltest={deltest[index]} />
      </SessionsRam>
    )
  }

  return <ProvStartskarm typ={typ} loading={loading} error={error} registerHref={registerHref} onStart={start} onStang={() => router.push(TILLBAKA)} />
}

/* ------------------------------------------------------------ startskärmen */

function ProvStartskarm({
  typ,
  loading,
  error,
  registerHref,
  onStart,
  onStang,
}: {
  typ: ProvTyp
  loading: boolean
  error: string | null
  registerHref: string | null
  onStart: () => void
  onStang: () => void
}) {
  const c = arNyProvTyp(typ) ? PROV_COPY[typ] : null
  const h1 = c ? c.h1 : PROVA.intro.h1
  const ingress = c ? c.ingressFet : PROVA.intro.ingressFet
  const regler = PROV_RAM.start.regler(typ)
  const loginHref = loggaInHref({ intent: null, smakprov: null })
  return (
    <Startskarm
      bas={{ test_kind: typ, lage: 'publikt', niva: null, format: null }}
      // Krysset stänger provet till verktygssidan. onAvbryt i stället för
      // tillbaka-länken: startskärmen skjuter då ingen test_start_viewed,
      // som hör till de inloggade testerna.
      onAvbryt={onStang}
      eyebrow={PROV_NAMN[typ]}
      rubrik={h1}
      formatrad={ingress}
      scen={typ}
      rita
      regler={regler}
      knapp={{ text: PROV_RAM.start.knapp, onClick: onStart, laddar: loading, cta: 'prova-start' }}
      kortRad={
        <>
          <p className="text-[11px] font-semibold uppercase leading-4 tracking-[.08em] text-ink-3">{PROV_RAM.start.valjTyp}</p>
          <nav aria-label={PROV_RAM.start.valjTypAria} className="mt-2.5 flex flex-wrap gap-2" data-prova-typval>
            {TYPVAL.filter((t) => (PROV_TYPER as readonly string[]).includes(t)).map((t) => {
              const aktiv = t === typ
              return (
                <Link
                  key={t}
                  href={t === 'matris' ? PROVA_PATH : `${PROVA_PATH}?typ=${t}`}
                  replace
                  scroll={false}
                  aria-current={aktiv ? 'page' : undefined}
                  className={`inline-flex min-h-10 items-center rounded-full border px-3.5 text-sm font-semibold leading-5 transition-colors ${
                    aktiv ? 'border-ink-1 bg-ink-1 text-papper' : 'border-kant-stark bg-papper text-ink-1 hover:border-ink-1'
                  }`}
                >
                  {PROV_NAMN[t]}
                </Link>
              )
            })}
          </nav>
          {error ? (
            <div role="alert" className="mt-3.5 rounded-xl border border-kant bg-papper-2 px-3.5 py-2.5 text-sm leading-5 text-ink-1">
              <p>{error}</p>
              {registerHref ? (
                <Link href={registerHref} className={`${LANK} mt-1 inline-flex min-h-9 items-center`}>
                  {PROVA.intro.skapaKonto}
                </Link>
              ) : null}
            </div>
          ) : null}
        </>
      }
      fotnot={PROV_RAM.start.fotnot}
      sparrad="none"
      fortsattTillganglig={false}
      efter={
        <div className="mt-5 flex flex-col gap-1 text-sm leading-5 text-ink-2">
          <p>
            {PROVA.intro.merFore}{' '}
            <Link href={TILLBAKA} className={LANK}>
              {PROVA.intro.merLank}
            </Link>
          </p>
          <p>
            Har du redan ett konto?{' '}
            <Link href={loginHref} className={LANK}>
              Logga in
            </Link>
          </p>
        </div>
      }
    />
  )
}

/* ------------------------------------------------------------ resultatet */

/** En rad utan uppgift (resultatet återställt ur fliken): numret och utfallet, ingen miniatyr. */
function utanUppgift(typ: ProvTyp): TypRitare<{ nyckel: string }> {
  return { kind: typ, namn: PROV_NAMN[typ], form: 'smal', antalAlternativ: () => 0, Uppgift: () => null }
}

function ProvResultat({
  typ,
  result,
  token,
  poster,
  rutnat,
  onStang,
  onGorOm,
}: {
  typ: ProvTyp
  result: ProvaResultat
  token: string
  poster: ProvPost[]
  rutnat: Rutnat[]
  onStang: () => void
  onGorOm: () => void
}) {
  const registerHref = `/register?test=${encodeURIComponent(token)}`
  const antal = result.total
  const fel = new Set(result.fel)
  const andel = Math.max(0, Math.min(1, antal ? result.score / antal : 0))
  const S = PROV_RAM.sparr
  const loginHref = loggaInHref({ intent: null, smakprov: { typ: 'test', token } })

  useEffect(() => {
    storePendingTestSession(token)
  }, [token])

  // Raderna: uppgifterna när de finns i minnet, annars matrisens rutnät ur fliken eller bara numret.
  const lista: ListPost<ProvU>[] = Array.from({ length: antal }, (_, i) => {
    const facit: RamFacit = { ratt: -1, correct: !fel.has(i), regel: null, misstag: null }
    const p = poster[i] ?? (typ === 'matris' && rutnat[i] ? franMatris({ id: `r${i}`, grid: rutnat[i], options: [] }) : null)
    if (p) return { u: p.u, valt: null, facit, ritare: p.ritare }
    return { u: { nyckel: `r${i}` } as ProvU, valt: null, facit, ritare: utanUppgift(typ) as unknown as TypRitare<ProvU> }
  })

  return (
    <div className="motion fixed inset-0 z-50 flex h-dvh flex-col bg-golv font-sess-text" data-sessionsram="resultat" data-resultatskarm="publikt" role="region" aria-label={KLART.publikt}>
      <main className="sess-tona min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="vagg px-4 pb-11 lg:px-10">
          <div className="mx-auto w-full max-w-[672px]">
            <div className="-mx-1 flex h-14 items-center gap-2 text-vagg-ink">
              <button type="button" onClick={onStang} aria-label={SESSION.resultat.stang} data-kryss="" className="-ml-1 inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px]">
                <IkonX />
              </button>
              <p className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold leading-5">{PROV_NAMN[typ]}</span>
                <span className="block truncate text-xs leading-4 text-vagg-mjuk">{PROV_RAM.undertitel(antal)}</span>
              </p>
            </div>
            <div className="steg s1 mt-3 flex items-center gap-4" role="status">
              <Dagsring status="gjord" storlek={56} fyllAnimering andel={andel} label={SESSION.resultat.ringAria(result.score, antal)} />
              <div className="min-w-0">
                <p className="text-ey uppercase text-koppar-ljus" data-resultat-eyebrow>
                  {KLART.publikt}
                </p>
                <h1 className="text-h1-liten mt-1 text-vagg-ink" data-resultat-huvudtal>
                  {SESSION.resultat.rattAv(result.score, antal)}
                </h1>
              </div>
            </div>
            <p className="steg s2 mt-3.5 max-w-[52ch] text-[15px] leading-[22px] text-vagg-mjuk">{PROV_RAM.resultat.mening(typ, result.fel.length)}</p>
            {result.percentile !== null ? (
              <p className="steg s2 mt-2 flex items-center gap-2 text-sm leading-5 text-vagg-ink" data-resultat-rad>
                <span className="h-2 w-2 shrink-0 rounded-full bg-koppar-ljus" aria-hidden="true" />
                {PROV_RAM.resultat.percentil(result.percentile)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="px-4 pb-8 lg:px-10">
          <div className="mx-auto flex w-full max-w-[672px] flex-col gap-4">
            <div className="steg s3 relative z-[2] -mt-[30px]" data-resultat-lista>
              <Uppgiftslistan<ProvU> ritare={(lista[0]?.ritare ?? utanUppgift(typ)) as TypRitare<ProvU>} lage="publikt" poster={lista} last lasText={`Rätt svar och ${forklaringOrd(typ)}`} />
            </div>

            <section aria-label={S.eyebrow(typ)} className="steg s4 rounded-2xl border border-[color:var(--lyft-kant)] bg-papper p-4 shadow-lyft sm:p-6" data-prova-sparr>
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase leading-4 tracking-[.08em] text-ton-ink">
                <Las storlek={14} />
                {S.eyebrow(typ)}
              </p>
              <p className="mt-2 font-sess-display text-[20px] font-bold leading-[26px] tracking-[-.01em] text-ink-1 sm:text-[22px] sm:leading-7">{S.titel(typ)}</p>
              <p className="mt-1.5 text-[15px] leading-[23px] text-ink-2">{S.text(antal)}</p>
              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
                <Link
                  href={registerHref}
                  data-cta="prova-gate"
                  onClick={() => capture('signup_started', { cluster: 'test', source_page: PROVA_PATH })}
                  className={`${KNAPP_PRIMAR} sm:w-auto sm:min-w-[240px]`}
                >
                  {S.knapp}
                </Link>
                <p className="text-[13px] leading-[18px] text-ink-3">{S.liten}</p>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
                <button type="button" onClick={onGorOm} className={`${LANK} inline-flex min-h-11 items-center`} data-prova-gor-om>
                  {PROV_RAM.resultat.gorOm}
                </button>
                <span className="text-[13px] leading-[18px] text-ink-3">
                  Har du redan ett konto?{' '}
                  <Link href={loginHref} className={LANK}>
                    Logga in
                  </Link>
                </span>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
