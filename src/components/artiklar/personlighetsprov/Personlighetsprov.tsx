'use client'

/**
 * Personlighetsprovet (docs/design/rod-trad-prov-spec-2026-09-24.md, avsnitt 3)
 * i omgång 3:s formspråk (skissen "Testerna, omgång 3: publika proven",
 * Publik-personlighet och Publik-personlighet-resultat, beslut C).
 *
 * En scen på golvet som byter innehåll på plats: inbjudan, svarar, laddar,
 * resultat, plus fel och kvot. Huvudet har typens märke, stapeln i bitar
 * (tio bitar om två påståenden) och kapseln "7 av 20". Påståendet står på
 * papper (.sess-personlighet-kort) och skalan är det inloggade testets fem
 * ringar (LikertScale, .sess-skala) med provets egna ord för lägena.
 *
 * Resultatet: alla fem dragen öppet med band, bandord och läsningen (raden
 * om hur en rekryterare läser draget), tydligaste draget först som ett stort
 * kort. Spärren är ett mörkt kort med de låsta raderna: kravprofilerna,
 * intervjuråden och de omvända påståendena. Omvändningen, kravprofilerna och
 * intervjupunkterna lämnar aldrig servern före claim: raderna är tomma
 * platshållare med antal ur lockedCounts.
 *
 * `sida` (verktygssidan /verktyg/personlighetstest): sidans h1 och ingress
 * står ovanför, så panelens eget huvud ritas inte. Resultatet och spärren
 * står i två kolumner från 1024 px, och på telefonen ligger kontoknappen i
 * ett fast ark i tumgrepp. I artiklarna står panelens huvud kvar och allt
 * står i en kolumn.
 *
 * Ett tryck svarar och går vidare efter 160 ms. Påstående 1 och skalan
 * ritas på servern. Rubrikerna är p med display-stil, aldrig h1 till h6, så
 * sidans och artikelns rubrikträd är orört. Inga data-cta-position-attribut.
 * Laddningen behåller påståendets kort och skalans höjd (CLS 0).
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
import { BAND_ORD, type Faktor } from '@/lib/personlighet/smakprov-tolkning'
import { COPY } from './personlighetsprov-copy'

export interface PersonlighetsprovProps {
  /** Artikelns slug eller 'verktyg/personlighetstest', för eventen och source_page. */
  slug?: string
  /** Verktygssidan: inget eget huvud, två kolumner i resultatet, fast ark på telefonen. */
  sida?: boolean
  /** Faktorns "i arbetet"-text per namn (verktygssidans avsnitt De fem faktorerna). */
  iArbetet?: Record<string, string>
}

type Phase = 'inbjudan' | 'svarar' | 'laddar' | 'resultat'
type FelTyp = 'server' | 'natverk'

interface ResultatFaktor {
  key: Faktor
  namn: string
  band?: string
  bandOrd: string
  segment: number
  lasning: string
}

interface Resultat {
  token: string
  mening: string
  faktorer: ResultatFaktor[]
  lockedCounts: { krav: number; intervju: number; omvanda: number }
  expiresAt: string | null
  href?: string
}

interface Sparat {
  token: string
  svar: Partial<Record<SmakprovId, SkalVarde>>
  start?: number
}

const EYEBROW = 'text-[11px] font-semibold uppercase leading-4 tracking-[.08em]'
const ETIKETTER = SKALA.map((s) => s.label)
const TAL_ORD = ['noll', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio']
const talOrd = (n: number) => TAL_ORD[n] ?? String(n)

/** Tio bitar om två påståenden. */
const BITAR = 10
const PER_BIT = ANTAL_PASTAENDEN / BITAR

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

/** Bandets ton: hög i koppar, övriga i indigo. Bandordet bär meningen, inte färgen. */
function bandTon(f: ResultatFaktor): 'hog' | 'mitt' | 'lag' {
  const b = f.band ?? (f.bandOrd === BAND_ORD.high ? 'high' : f.bandOrd === BAND_ORD.low ? 'low' : 'mid')
  return b === 'high' ? 'hog' : b === 'low' ? 'lag' : 'mitt'
}

export default function Personlighetsprov({ slug, sida = false, iArbetet }: PersonlighetsprovProps) {
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
  const [kortetSyns, setKortetSyns] = useState(false)

  const citatRef = useRef<HTMLParagraphElement>(null)
  const resultatRef = useRef<HTMLParagraphElement>(null)
  const felRef = useRef<HTMLDivElement>(null)
  const sparrRef = useRef<HTMLElement>(null)
  const knapparRef = useRef<HTMLDivElement>(null)
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

  // Det fasta arket på telefonen viker undan när kortets egna knappar syns.
  useEffect(() => {
    if (!sida || phase !== 'resultat') return
    const el = knapparRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setKortetSyns(e.isIntersecting), { threshold: 0.6 })
    io.observe(el)
    return () => io.disconnect()
  }, [sida, phase])

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

  /** Ett tryck på en ring. Går vidare efter 160 ms. */
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
    setKortetSyns(false)
    startRef.current = null
    setPhase('inbjudan')
    requestAnimationFrame(() => citatRef.current?.focus())
  }

  const ram = `prov-rum not-prose pp-ram ${sida ? 'pp-sida' : 'my-8'}`
  const etikett = sida ? { 'aria-label': COPY.eyebrow } : { 'aria-labelledby': rubrikId }

  /* -------------------------------------------------------------- huvudet */
  const huvud = sida ? null : (
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
      <aside ref={sparrRef} className={ram} {...etikett}>
        {huvud}
        <div className="pp-scen pp-scen-prov">
          <div className="sess-personlighet-kort">
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
        </div>
      </aside>
    )
  }

  /* ----------------------------------------------------------- resultatet */
  if (phase === 'resultat' && resultat) {
    const inloggad = Boolean(resultat.href)
    const registerHref = `/register?personlighet=${encodeURIComponent(resultat.token)}`
    const [forsta, ...ovriga] = resultat.faktorer
    const arbete = forsta ? iArbetet?.[forsta.namn] : undefined
    const startaKonto = () => capture('signup_started', { cluster: 'test', source_page: kallsida })

    const lasta = [
      { key: 'krav', titel: COPY.sparr.lasta.krav.titel(talOrd(resultat.lockedCounts.krav)), text: COPY.sparr.lasta.krav.text, rader: resultat.lockedCounts.krav, bild: 'krav' as const },
      { key: 'intervju', titel: COPY.sparr.lasta.intervju.titel, text: COPY.sparr.lasta.intervju.text, rader: resultat.lockedCounts.intervju, bild: 'intervju' as const },
      { key: 'omvanda', titel: COPY.sparr.lasta.omvanda.titel, text: COPY.sparr.lasta.omvanda.text, rader: resultat.lockedCounts.omvanda, bild: 'omvanda' as const },
    ]

    return (
      <div className={ram}>
        {huvud}
        <div className="pp-scen pp-scen-res" data-personlighet-resultat>
          <aside {...etikett} aria-live="polite" className="pp-res" data-personlighet-profil>
            <div className="pp-huvud">
              <span className="pp-ik" aria-hidden="true">
                <Citat />
              </span>
              <p ref={resultatRef} tabIndex={-1} className="pp-typ focus:outline-none">
                <span>{COPY.resultat.eyebrow}</span>
                <small>{COPY.resultat.titel}</small>
              </p>
              <span className="sess-kapsel pp-klar">
                <KlarBock />
                <b>{ANTAL_PASTAENDEN}</b> av {ANTAL_PASTAENDEN}
              </span>
            </div>
            <p className="pp-mening">{resultat.mening}</p>

            {forsta ? (
              <div className="sess-personlighet-kort pp-drag" data-drag-forsta={forsta.key}>
                <p className={`${EYEBROW} text-koppar-ink`}>{COPY.resultat.tydligast}</p>
                <div className="pp-dragtopp">
                  <p className="pp-dragnamn">{forsta.namn}</p>
                  <span className="pp-band" data-ton={bandTon(forsta)}>
                    {forsta.bandOrd}
                  </span>
                </div>
                <div className="pp-matare" role="img" aria-label={COPY.segment(forsta.segment)}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <i key={i} data-fylld={i <= forsta.segment ? '' : undefined} />
                  ))}
                </div>
                <div className="pp-andar" aria-hidden="true">
                  <span>{BAND_ORD.low}</span>
                  <span>{BAND_ORD.mid}</span>
                  <span>{BAND_ORD.high}</span>
                </div>
                <div className={`pp-brunnar ${arbete ? '' : 'pp-brunnar-en'}`.trim()}>
                  {arbete ? (
                    <div className="pp-brunn">
                      <p className="pp-brunn-rubrik">
                        <span aria-hidden="true">
                          <IkonVaska />
                        </span>
                        {COPY.resultat.iArbetet}
                      </p>
                      <p className="pp-brunn-text">{arbete}</p>
                    </div>
                  ) : null}
                  <div className="pp-brunn">
                    <p className="pp-brunn-rubrik">
                      <span aria-hidden="true">
                        <IkonLupp />
                      </span>
                      {COPY.resultat.lasning}
                    </p>
                    <p className="pp-brunn-text" data-lasning>
                      {forsta.lasning}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {ovriga.length ? (
              <>
                <p className="pp-fyra">
                  <b>{COPY.resultat.andra(talOrd(ovriga.length))}</b>
                  <span>{COPY.resultat.enRad}</span>
                </p>
                <ul className="pp-rader">
                  {ovriga.map((f) => (
                    <li key={f.key} className="pp-rad" data-drag={f.key}>
                      <div className="pp-rad-topp">
                        <span className="pp-rad-namn">{f.namn}</span>
                        <span className="pp-band pp-band-liten" data-ton={bandTon(f)}>
                          {f.bandOrd}
                        </span>
                        <span className="pp-mini" role="img" aria-label={COPY.segment(f.segment)}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <i key={i} data-fylld={i <= f.segment ? '' : undefined} />
                          ))}
                        </span>
                      </div>
                      <p className="pp-rad-text" data-lasning>
                        {f.lasning}
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </aside>

          <section
            ref={sparrRef}
            aria-label={inloggad ? COPY.inloggad.rubrik : COPY.sparr.eyebrow}
            className="pp-sparr"
            data-personlighet-sparr
          >
            {inloggad ? null : (
              <p className={`${EYEBROW} pp-sparr-kick`}>
                <Las storlek={14} />
                {COPY.sparr.eyebrow}
              </p>
            )}
            <p className="pp-sparr-rubrik">{inloggad ? COPY.inloggad.rubrik : COPY.sparr.rubrik}</p>
            <p className="pp-sparr-text">{inloggad ? COPY.inloggad.text : COPY.sparr.text}</p>

            <div ref={knapparRef} className="pp-knappar">
              {inloggad ? (
                <Link href={resultat.href!} data-cta="personlighetsprov-konto" className={`${KNAPP_PRIMAR} sess-knapp`}>
                  {COPY.inloggad.knapp}
                </Link>
              ) : (
                <Link href={registerHref} data-cta="personlighetsprov-gate" onClick={startaKonto} className={`${KNAPP_PRIMAR} sess-knapp`}>
                  {COPY.sparr.knapp}
                  <Pil />
                </Link>
              )}
              <div className="pp-under">
                {inloggad ? <span /> : <p className="pp-villkor">{COPY.sparr.villkor}</p>}
                <button type="button" onClick={gorOm} className="pp-om">
                  {COPY.sparr.igen}
                </button>
              </div>
            </div>

            {inloggad ? null : (
              <>
                <p className="sr-only">{COPY.last.sr}</p>
                <ul className="pp-lasta">
                  {lasta.map((l) => (
                    <li key={l.key} data-last={l.key}>
                      <span className="pp-lasbild" aria-hidden="true">
                        <LastBild typ={l.bild} rader={l.rader} />
                        <span className="pp-lasikon">
                          <Las storlek={13} />
                        </span>
                      </span>
                      <span className="pp-lastext">
                        <b>{l.titel}</b>
                        <span>{l.text}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>

        {sida && !inloggad ? (
          <div className="pp-ark" data-personlighet-ark data-dold={kortetSyns ? '' : undefined} aria-hidden={kortetSyns || undefined}>
            <Link
              href={registerHref}
              data-cta="personlighetsprov-gate"
              data-plats="ark"
              onClick={startaKonto}
              tabIndex={kortetSyns ? -1 : undefined}
              className={`${KNAPP_PRIMAR} sess-knapp`}
            >
              {COPY.sparr.knapp}
              <Pil />
            </Link>
          </div>
        ) : null}
      </div>
    )
  }

  /* ------------------------------------------ inbjudan, svarar, laddar */
  const laddar = phase === 'laddar'
  const n = laddar ? ANTAL_PASTAENDEN : index + 1
  const felCopy = fel === 'natverk' ? COPY.fel.natverk : COPY.fel.server
  const aktuellBit = Math.floor(index / PER_BIT)
  const bitLage = (i: number) => (laddar || (i + 1) * PER_BIT <= index ? 'besvarad' : i === aktuellBit ? 'aktuell' : undefined)

  return (
    <aside className={ram} {...etikett}>
      {huvud}
      <div className="pp-scen pp-scen-prov" data-personlighet-prov>
        <div className="pp-huvud pp-huvud-prov">
          <div className="pp-huvud-typ">
            <span className="pp-ik" aria-hidden="true">
              <Citat />
            </span>
            <p className="pp-typ">
              <span>{COPY.typ}</span>
              <small>{laddar || fel ? COPY.steg.klart : COPY.steg.hoger}</small>
            </p>
          </div>
          <div className="sess-bitar pp-bitar" style={{ gridTemplateColumns: `repeat(${BITAR}, minmax(0, 1fr))` }} aria-hidden="true">
            {Array.from({ length: BITAR }, (_, i) => (
              <span key={i} className="sess-bit" data-bit={bitLage(i)} />
            ))}
          </div>
          <span className="sess-kapsel pp-raknare" aria-hidden="true">
            <b>{n}</b> av {ANTAL_PASTAENDEN}
          </span>
          <span className="sr-only" aria-live="polite">
            {COPY.steg.raknare(n)}
          </span>
        </div>

        <div className="sess-personlighet-kort pp-kort">
          <Citat stor />
          {laddar ? (
            // Sista påståendet står kvar osynligt under skelettet, så att kortet behåller höjden (CLS 0).
            <div className="pp-laddar-ram">
              <p className="pp-pastaende invisible" aria-hidden="true">
                {textFor(aktuellt)}
              </p>
              <LoadingSkeleton variant="writing" label={COPY.laddar.rubrik} meta={COPY.laddar.meta} className="pp-laddar" />
            </div>
          ) : (
            <p id={citatId} ref={citatRef} tabIndex={-1} className="pp-pastaende focus:outline-none">
              {textFor(aktuellt)}
            </p>
          )}
        </div>

        {fel ? (
          <div ref={felRef} tabIndex={-1} className="pp-fel focus:outline-none">
            <FlowError title={felCopy.rubrik} message={felCopy.text} retryLabel={felCopy.lank} onRetry={() => token && void skicka(token, ordning, svar)} />
          </div>
        ) : (
          <div className={laddar ? 'pp-skala invisible' : 'pp-skala'} aria-hidden={laddar || undefined}>
            <p className="pp-fraga" aria-hidden="true">
              {COPY.fraga}
            </p>
            <LikertScale
              value={laddar ? null : valt}
              onChange={(v) => valj(v as SkalVarde)}
              disabled={laddar}
              etiketter={ETIKETTER}
              ariaLabel={COPY.reglage.etikett}
              ariaDescribedBy={citatId}
            />
          </div>
        )}

        <div className="pp-fotrad">
          <button
            type="button"
            onClick={foregaende}
            aria-label={COPY.tillbaka}
            disabled={index === 0 || laddar}
            className={`sess-kryss pp-tillbaka ${index === 0 || laddar ? 'invisible' : ''}`.trim()}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
          </button>
          <p>{COPY.instruktion}</p>
        </div>
      </div>
      <p className="pp-fotnot">{COPY.fotnot}</p>
    </aside>
  )
}

/* ---------------------------------------------------------------- bilder */

function Citat({ stor = false }: { stor?: boolean }) {
  return (
    <svg viewBox="0 0 56 44" aria-hidden="true" className={stor ? 'pp-citat' : undefined} width={stor ? undefined : 22} height={stor ? undefined : 17}>
      <path d="M0 44V26C0 11 8 2 22 0v9c-6 2-9 7-9 13h9v22H0Zm30 0V26C30 11 38 2 52 0v9c-6 2-9 7-9 13h9v22H30Z" fill="var(--sess-lucka)" />
    </svg>
  )
}

function KlarBock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="var(--sess-ratt)" />
      <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Pil() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function IkonVaska() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" />
    </svg>
  )
}

function IkonLupp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </svg>
  )
}

/** De låsta radernas bild: tomma platshållare, en per låst rad (antal ur lockedCounts). */
function LastBild({ typ, rader }: { typ: 'krav' | 'intervju' | 'omvanda'; rader: number }) {
  const n = Math.max(1, Math.min(rader, 6))
  if (typ === 'omvanda') {
    return (
      <svg viewBox="0 0 116 58" className="pp-lassvg">
        {Array.from({ length: Math.min(n, 3) }, (_, i) => {
          const y = 12 + i * 17
          const vand = i % 2 === 1
          return (
            <g key={i}>
              <rect x="14" y={y - 3} width="72" height="6" rx="3" fill="var(--pp-las-spar)" />
              <circle cx={vand ? 26 : 74} cy={y} r="6" fill={vand ? 'var(--sess-lucka)' : 'var(--pp-las-ljus)'} />
              <path d={vand ? `M98 ${y}h-10m4-4l-4 4 4 4` : `M90 ${y}h10m-4-4l4 4-4 4`} fill="none" stroke={vand ? 'var(--sess-lucka)' : 'var(--pp-las-ljus)'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )
        })}
      </svg>
    )
  }
  const h = 58 / n
  return (
    <svg viewBox="0 0 116 58" className="pp-lassvg">
      {Array.from({ length: n }, (_, i) => {
        const y = i * h + h / 2
        return (
          <g key={i}>
            {typ === 'krav' ? (
              <>
                <rect x="14" y={y - 2.5} width="34" height="5" rx="2.5" fill="var(--pp-las-ljus)" />
                <rect x="54" y={y - 2.5} width="22" height="5" rx="2.5" fill="var(--pp-las-spar)" />
                <rect x="82" y={y - 2.5} width="20" height="5" rx="2.5" fill={i % 3 === 0 ? 'var(--sess-lucka)' : 'var(--pp-las-spar)'} />
              </>
            ) : (
              <>
                <circle cx="18" cy={y} r="3" fill="var(--sess-lucka)" />
                <rect x="26" y={y - 2.5} width={i % 2 ? 60 : 76} height="5" rx="2.5" fill="var(--pp-las-ljus)" />
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}
