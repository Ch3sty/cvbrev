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
 *   resultat  ProvResultatSida (omgång 3): huvudtalet, remsan, det enda
 *             öppna facit som servern valde, de andra uppgifterna låsta och
 *             spärren med data-cta="prova-gate" till /register?test=.
 *
 * Facit finns aldrig i klienten före rättningen. Rättningen svarar med antal
 * rätt, vilka positioner som blev fel, percentilen och facit för exakt en
 * uppgift (oppet-facit.ts). Kropparna mot /api/public/test-session är som förut: matrisen
 * startas utan kropp, typerna med { typ }, rättningen { token, answers }.
 */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { capture } from '@/lib/analytics/events'
import { sparaProvkalla, sparaProvkallaUrAdress } from '@/lib/analytics/provkalla'
import { readPendingTestSession, storePendingTestSession } from '@/lib/letters/claim-draft-client'
import { lasRattning, lasSparatProv, sparaProv, type ProvaResultat, type Rutnat } from '@/lib/tests/prova-lokalt'
import ProvResultatSida, { sparrVisad } from '@/components/publikt/prov/ProvResultatSida'
import { loggaInHref } from '@/components/registrering/RegisterKontoSteg'
import { PROVA } from '@/components/registrering/registrering-copy'
import { PROV_COPY, PROV_MITT_TEST, PROV_TYPER, arNyProvTyp, type ProvStart, type ProvTyp, type PublikUppgift } from '@/lib/tests/prov-typer'
import type { VnUnderlag } from '@/lib/tester/pass-typer'
import SessionsRam from '@/components/session/SessionsRam'
import Startskarm from '@/components/session/Startskarm'
import { SESSION } from '@/components/session/copy'
import { ramUnderlag } from '@/components/session/lagen/gemensamt'
import { LANK } from '@/components/shell/knappar'
import ProvUppgiftVy from '@/components/publikt/prov/ProvUppgiftVy'
import { TESTGLYFER, type TestTyp } from '@/components/illustrations/TestGlyfer'
import { PROV_NAMN, franMatris, franPublika, provForm, varmProvet, type MatrisFraga, type ProvPost } from '@/components/publikt/prov/provPost'
import { PROV_RAM } from '@/components/publikt/prov/prov-copy'

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
  // Startsvarets uppgifter (utan facit) och underlaget, för resultatet och återställningen.
  const [visning, setVisning] = useState<{ uppgifter: unknown[]; underlag: Record<string, VnUnderlag> }>({ uppgifter: [], underlag: {} })
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
    const sparadTyp: ProvTyp = sparat.typ && arNyProvTyp(sparat.typ) ? sparat.typ : 'matris'
    if (sparadTyp !== 'matris') setTyp(sparadTyp)
    setToken(sparat.token)
    setRutnat(sparat.rutnat)
    // Uppgifterna som de visades, så att miniatyrerna och det öppna facit ritas likadant.
    const underlag = (sparat.underlag ?? {}) as Record<string, VnUnderlag>
    if (sparat.uppgifter?.length) {
      setPoster(sparadTyp === 'matris' ? (sparat.uppgifter as MatrisFraga[]).map(franMatris) : franPublika(sparat.uppgifter as PublikUppgift[], underlag))
      setVisning({ uppgifter: sparat.uppgifter, underlag })
    } else if (sparadTyp === 'matris' && sparat.rutnat.length) {
      setPoster(sparat.rutnat.map((g, i) => franMatris({ id: `r${i}`, grid: g, options: [] })))
    }
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
        setVisning({ uppgifter: s.uppgifter, underlag: s.underlag ?? {} })
        setToken(s.token)
      } else {
        const s = data as StartResponse
        nya = s.questions.map(franMatris)
        setDeltest([])
        setRutnat(s.questions.map((q) => q.grid))
        setVisning({ uppgifter: s.questions, underlag: {} })
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
      const r: ProvaResultat = lasRattning(data)
      setResult(r)
      sparaProv(t, r, rutnat, typ, visning)
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
      sparrVisad(typ, 'prova', result)
    }
  }, [phase, result, typ])

  // Token i fliken medan resultatet står framme (Tillbaka från registreringen, Google).
  useEffect(() => {
    if (phase === 'result' && token) storePendingTestSession(token)
  }, [phase, token])

  if (phase === 'result' && result && token) {
    return (
      <ProvResultatSida
        typ={typ}
        result={result}
        token={token}
        poster={poster}
        underlag={visning.underlag}
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

/** Typvalets kort: testelementet Nios glyf per typ, I-provet som sex deltester. */
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
        <g key={i}>
          <rect x={6 + (i % 3) * 13} y={12 + Math.floor(i / 3) * 13} width="10" height="10" rx="2.5" fill={i === 4 ? 'var(--koppar)' : 'none'} stroke="currentColor" strokeWidth="2" />
        </g>
      ))}
    </svg>
  )
}

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
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="text-[11px] font-semibold uppercase leading-4 tracking-[.08em] text-koppar-ink">{PROV_RAM.start.valjTyp}</p>
            <p className="text-[13px] leading-[18px] text-ink-2">{PROV_RAM.start.valjTypRad}</p>
          </div>
          <nav aria-label={PROV_RAM.start.valjTypAria} className="prov3-typval mt-3" data-prova-typval>
            {TYPVAL.filter((t) => (PROV_TYPER as readonly string[]).includes(t)).map((t) => {
              const aktiv = t === typ
              return (
                <Link
                  key={t}
                  href={t === 'matris' ? PROVA_PATH : `${PROVA_PATH}?typ=${t}`}
                  replace
                  scroll={false}
                  aria-current={aktiv ? 'page' : undefined}
                  className="prov3-typkort"
                >
                  <i aria-hidden="true">
                    <TypGlyf typ={t} />
                  </i>
                  <span>{PROV_NAMN[t]}</span>
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
