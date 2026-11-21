'use client'

/**
 * Skriv brev (/dashboard/skapa-brev): en skärm i stället för dagens sex steg
 * (skissen Skriv-1440 och Mobil-skriv).
 *
 *   före       annonsen, tonen, språket och CV:t; arket visar brevhuvudet
 *   väntar     svaret kommer i ett stycke efter 10 till 15 sekunder; arket
 *              visar huvudet och "Läser annonsens krav mot ditt CV."
 *   spelar     brevet spelas upp stycke för stycke (cirka 700 ms per
 *              stycke) och kraven bockas av när deras mening syns; under
 *              prefers-reduced-motion visas allt direkt
 *   klart      vidare till brevet (?klart=1), historiken ersätts
 *
 * Det som dagens stegflöde gjorde finns kvar: förifyllningen från
 * jobbmatchningen och CV-rummet (cover-letter-store, ?cv=), utkastet i
 * localStorage, tonen ur profilen, namnkravet (422), kvoten (429 ger
 * veckospärren med annonsen kvar), omdirigeringen utan CV (på servern),
 * aktivitetsloggen och frågan om hemskärmen.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import {
  ArbetsYta,
  ArbetsHuvud,
  MallKapsel,
  Blad,
  LitenKnapp,
  StorKnapp,
  Pips,
  BrevSparrLaddare,
  IkonBock,
  IkonPenna,
} from '@/components/brev3/kit'
import NameRequiredNotice from '@/components/shared/NameRequiredNotice'
import { coverLetterPrefill, type CoverLetterPrefillData } from '@/store/cover-letter-store'
import { useNotification } from '@/context/notificationcontext'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import { requestInstallPrompt } from '@/lib/pwa/installPrompt'
import { loadDraft, saveDraft, clearDraft, purgeExpiredDrafts } from '@/lib/flow/draft'
import { brevDataFranBrev, type BrevProfil } from '@/lib/letters/brevData'
import { citatFinns, lasSparadeKrav } from '@/lib/letters/krav'
import { lasSparadeStycken } from '@/lib/letters/stycken'
import { startmallForBrev } from '@/lib/letters/brevRegler'
import { formatGratisbrevDag } from '@/lib/letters/brevKvot'
import { brevMallKort } from '@/lib/letters/brevmall/katalog'
import { PAKETRADER } from '@/components/paywall/paywall-copy'
import type { BrevKrav } from '@/lib/letters/brevmall/typer'
import ArbetsRam from './ArbetsRam'
import ArbetsArk from './ArbetsArk'
import { SprakVal, TonKnappar } from './TonVal'
import { SKRIV, type TonId } from './texter'
import { forladdaRitare, ritaBrev } from './ritare'
import { tomtArk } from './arkHjalp'

const CvVal = dynamic(() => import('./CvVal'), { ssr: false })

/** Utkastet: annonsen, CV:t, tonen och språket (som förut, nu i version 2). */
const UTKAST = 'skapa-brev'
const UTKAST_VERSION = 2
interface Utkast {
  annons: string
  cvId: string | null
  ton: TonId
  sprak: 'sv' | 'en'
}

/** Kortaste annons som går att skriva mot, och gränsen för statusraden. */
const MIN_ANNONS = 20
const BRA_ANNONS = 50
const STYCKE_MS = 700

export interface SkrivCv {
  id: string
  namn: string
  datum: string
  /** CV-mallens id ur CV-byggaren, om det finns. */
  mall: string | null
  /** Yrkestiteln ur CV:t, om det finns. */
  titel: string | null
  last: boolean
}

export interface SkrivBrevProps {
  cvs: SkrivCv[]
  startCvId: string
  harBetalt: boolean
  /** Gratisbrev kvar nu (null = Premium), och dagen nästa öppnar. */
  kvot: { kvar: number | null; nastaOmSkrivet: string | null; nastaNu: string | null }
  startTon: TonId
  profil: BrevProfil | null
  epost: string | null
  /** Arket före skrivandet, ritat på servern i startmallen. */
  tomtArkHtml: string
  /** Brevets datum (ISO), samma som servern ritade med. */
  idag: string
}

type Lage = 'fore' | 'vantar' | 'spelar'

interface SkrivetBrev {
  id: string
  mallId: string
  fontId: string | null
  stycken: string[]
  krav: BrevKrav[] | null
  foretag: string | null
  tjanst: string | null
  rad: Parameters<typeof brevDataFranBrev>[0]
}

function forReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

export default function SkrivBrev({ cvs, startCvId, harBetalt, kvot, startTon, profil, epost, tomtArkHtml, idag }: SkrivBrevProps) {
  const router = useRouter()
  const { logActivity } = useNotification()
  const { summary } = useDashboardData()

  // Förifyllningen läses synkront vid första monteringen (modulens cache
  // klarar att Next monterar två gånger).
  const [prefill] = useState<CoverLetterPrefillData | null>(() => coverLetterPrefill.consume())
  const prefillCv = prefill?.cvId && cvs.some((c) => c.id === prefill.cvId && !c.last) ? prefill.cvId : null

  const [annons, setAnnons] = useState(prefill?.jobDescription ?? '')
  const [cvId, setCvId] = useState<string>(prefillCv ?? startCvId)
  const [ton, setTon] = useState<TonId>(startTon)
  const [sprak, setSprak] = useState<'sv' | 'en'>('sv')
  const [lage, setLage] = useState<Lage>('fore')
  const [fel, setFel] = useState<string | null>(null)
  const [namnKravs, setNamnKravs] = useState(false)
  const [sparr, setSparr] = useState<{ nasta: string | null } | null>(null)
  const [visaCvVal, setVisaCvVal] = useState(false)
  const [brev, setBrev] = useState<SkrivetBrev | null>(null)
  const [visade, setVisade] = useState(0)
  const [arkHtml, setArkHtml] = useState(tomtArkHtml)
  const avbryt = useRef<AbortController | null>(null)
  const annonsRef = useRef<HTMLTextAreaElement>(null)

  const cv = cvs.find((c) => c.id === cvId) ?? cvs[0]
  const mallId = brev?.mallId ?? startmallForBrev(cv?.mall ?? null, harBetalt)
  const mall = brevMallKort(mallId)
  const mallNamn = mall?.namn ?? 'Linne'
  const sammaSomCv = !!cv?.mall && cv.mall === mallId
  const profilMedTitel = useMemo<BrevProfil | null>(() => (profil ? { ...profil, titel: cv?.titel ?? profil.titel ?? null } : null), [profil, cv?.titel])

  /* ------------------------------------------------------------ utkastet */

  const utkastLast = useRef(false)
  useEffect(() => {
    if (utkastLast.current) return
    utkastLast.current = true
    purgeExpiredDrafts()
    forladdaRitare()
    // En annons från matchningen väger tyngre än ett gammalt utkast.
    if (prefill?.jobDescription) return
    const u = loadDraft<Utkast>(UTKAST, UTKAST_VERSION)
    if (!u) return
    const d = u.data
    if (d.annons) setAnnons(d.annons)
    if (d.cvId && cvs.some((c) => c.id === d.cvId && !c.last)) setCvId(d.cvId)
    if (d.ton && (d.ton !== 'auto' || harBetalt)) setTon(d.ton)
    if (d.sprak === 'en' || d.sprak === 'sv') setSprak(d.sprak)
  }, [prefill, cvs, harBetalt])

  // Sparas en stund efter senaste ändringen och när fliken göms, aldrig på
  // varje tangenttryck.
  const utkast = useMemo<Utkast>(() => ({ annons, cvId, ton, sprak }), [annons, cvId, ton, sprak])
  useEffect(() => {
    if (lage !== 'fore' || !annons.trim()) return
    const t = setTimeout(() => saveDraft(UTKAST, UTKAST_VERSION, 1, utkast), 800)
    return () => clearTimeout(t)
  }, [utkast, lage, annons])
  useEffect(() => {
    const vidDold = () => {
      if (document.visibilityState === 'hidden' && lage === 'fore' && utkast.annons.trim()) saveDraft(UTKAST, UTKAST_VERSION, 1, utkast)
    }
    document.addEventListener('visibilitychange', vidDold)
    return () => document.removeEventListener('visibilitychange', vidDold)
  }, [utkast, lage])

  /* ------------------------------------------------------------ arket före skrivandet */

  // Ritas om i klienten när mallen, CV:ts titel eller förifyllningens
  // arbetsgivare skiljer sig från det servern ritade.
  const foretagFore = prefill?.company?.trim() || null
  const tjanstFore = prefill?.jobTitle?.trim() || null
  useEffect(() => {
    if (lage !== 'fore') return
    const andrat = mallId !== startmallForBrev(cvs.find((c) => c.id === startCvId)?.mall ?? null, harBetalt) || cvId !== startCvId || foretagFore || tjanstFore || sprak === 'en'
    if (!andrat) {
      setArkHtml(tomtArkHtml)
      return
    }
    let levande = true
    const data = brevDataFranBrev(
      { company: foretagFore ?? SKRIV.arbetsgivaren, job_title: tjanstFore ?? SKRIV.tjanstenDuSoker, language: sprak, body_stycken: [], created_at: idag },
      profilMedTitel,
      { email: epost }
    )
    ritaBrev(mallId, data)
      .then((html) => levande && setArkHtml(tomtArk(html, !foretagFore)))
      .catch(() => {})
    return () => {
      levande = false
    }
  }, [lage, mallId, cvId, startCvId, cvs, harBetalt, foretagFore, tjanstFore, sprak, idag, profilMedTitel, epost, tomtArkHtml])

  /* ------------------------------------------------------------ skriv */

  const skriv = useCallback(async () => {
    if (lage !== 'fore') return
    if (annons.trim().length <= MIN_ANNONS) {
      annonsRef.current?.focus()
      return
    }
    if (!harBetalt && kvot.kvar === 0) {
      setSparr({ nasta: kvot.nastaNu })
      return
    }
    setFel(null)
    setNamnKravs(false)
    setLage('vantar')
    const ctrl = new AbortController()
    avbryt.current = ctrl
    try {
      const svar = await fetch('/api/letters/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({ cv_id: cvId, job_description: annons, tonality: ton, language: sprak, template_id: 'classic' }),
      })
      const json = await svar.json().catch(() => ({}))
      if (ctrl.signal.aborted) return
      if (!svar.ok) {
        const kod = json?.code ?? json?.error
        setLage('fore')
        if (svar.status === 422 || kod === 'name_required') {
          setNamnKravs(true)
          return
        }
        if (svar.status === 429 || kod === 'quota_exceeded') {
          setSparr({ nasta: json?.nextResetAt ?? json?.nextResetDate ?? kvot.nastaNu })
          return
        }
        setFel(SKRIV.felRad)
        return
      }
      const rad = json.data ?? {}
      const stycken = lasSparadeStycken(rad.body_stycken) ?? []
      const nytt: SkrivetBrev = {
        id: rad.id,
        mallId: rad.mall_id ?? mallId,
        fontId: rad.font_id ?? null,
        stycken,
        krav: lasSparadeKrav(rad.kravTraffar ?? rad.krav),
        foretag: rad.company ?? null,
        tjanst: rad.job_title ?? null,
        rad,
      }
      clearDraft(UTKAST, UTKAST_VERSION)
      coverLetterPrefill.reset()
      void logActivity('letter_created', 'genererade ett personligt brev', {
        tonality: ton,
        language: sprak,
        job_description_length: annons.length,
      })
      // Frågan om hemskärmen (docs/plan-pwa.md): brevet ligger nu sparat.
      requestInstallPrompt('letter_saved')
      setBrev(nytt)
      setVisade(forReducedMotion() ? stycken.length : 0)
      setLage('spelar')
    } catch (e: unknown) {
      if (ctrl.signal.aborted) return
      setLage('fore')
      setFel(e instanceof TypeError ? SKRIV.natverksfel : SKRIV.felRad)
    } finally {
      if (avbryt.current === ctrl) avbryt.current = null
    }
  }, [lage, annons, harBetalt, kvot.kvar, kvot.nastaNu, cvId, ton, sprak, mallId, logActivity])

  const avbrytSkrivandet = () => {
    avbryt.current?.abort()
    avbryt.current = null
    setLage('fore')
  }

  /* ------------------------------------------------------------ uppspelningen */

  useEffect(() => {
    if (lage !== 'spelar' || !brev) return
    const n = brev.stycken.length
    if (visade >= n) {
      const t = setTimeout(() => router.replace(`/dashboard/mina-brev/${brev.id}?klart=1`), forReducedMotion() ? 0 : STYCKE_MS)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setVisade((v) => v + 1), visade === 0 ? 250 : STYCKE_MS)
    return () => clearTimeout(t)
  }, [lage, brev, visade, router])

  useEffect(() => {
    if (lage !== 'spelar' || !brev) return
    let levande = true
    const data = brevDataFranBrev(brev.rad, profilMedTitel, { email: epost })
    const skriver = visade < brev.stycken.length ? Math.max(1, visade) : undefined
    ritaBrev(brev.mallId, data, { typsnitt: brev.fontId, skriverTill: skriver })
      .then((html) => levande && setArkHtml(html))
      .catch(() => {})
    return () => {
      levande = false
    }
  }, [lage, brev, visade, profilMedTitel, epost])

  /* ------------------------------------------------------------ skrivbrickans plats */

  const arkRef = useRef<HTMLDivElement>(null)
  const [brickaTop, setBrickaTop] = useState<number | null>(null)
  useLayoutEffect(() => {
    const rot = arkRef.current
    if (!rot || lage === 'fore') return
    const bas = rot.getBoundingClientRect()
    const mal = rot.querySelector('.brev-markor') ?? rot.querySelector('.brev-arende') ?? rot.querySelector('.brev-datum')
    const r = mal?.getBoundingClientRect()
    const top = r ? r.bottom - bas.top + 28 : bas.height * 0.45
    setBrickaTop(Math.min(top, bas.height - 130))
  }, [arkHtml, lage])

  /* ------------------------------------------------------------ texterna */

  const antal = brev?.stycken.length ?? 0
  const pagaende = Math.min(Math.max(1, visade), Math.max(1, antal))
  const krav = brev?.krav ?? null
  const synligaStycken = brev ? brev.stycken.slice(0, visade) : []
  const kravMedSvar = krav ? krav.filter((k) => k.citat && citatFinns(k.citat, synligaStycken)).length : 0
  const visaKrav = lage === 'spelar' && krav && krav.length >= 3

  const underrad =
    brev?.tjanst || brev?.foretag
      ? [brev.tjanst, brev.foretag].filter(Boolean).join(', ')
      : tjanstFore || foretagFore
        ? [tjanstFore, foretagFore].filter(Boolean).join(', ')
        : SKRIV.underradTom

  const annonsLangd = annons.trim().length
  const kanSkriva = annonsLangd > MIN_ANNONS
  const upptagen = lage !== 'fore'
  const nastaDag = kvot.nastaOmSkrivet ? formatGratisbrevDag(kvot.nastaOmSkrivet) : null
  const slutDag = kvot.nastaNu ? formatGratisbrevDag(kvot.nastaNu) : null
  const kvotSlut = !harBetalt && kvot.kvar === 0

  const kvotrad = harBetalt ? null : kvotSlut ? (
    <>
      <b className="text-[color:var(--b3-ink)]">{SKRIV.kvotSlutRubrik}</b> {slutDag ? SKRIV.kvotSlut(slutDag) : null}{' '}
    </>
  ) : (
    <>
      <b className="text-[color:var(--b3-ink)]">{SKRIV.kvotDetHar}</b> {nastaDag ? SKRIV.kvotNasta(nastaDag) : null}{' '}
    </>
  )

  const skrivbricka = (
    <span className="b3-skrivbricka">
      <IkonPenna size={16} />
      {lage === 'spelar' ? SKRIV.skriverStycke(pagaende, antal) : SKRIV.skriverBrevet}
    </span>
  )

  const arkEtikett =
    lage === 'spelar' && brev ? SKRIV.arkEtikettSkriver(mallNamn, Math.min(visade, antal), antal) : SKRIV.arkEtikett(mallNamn)

  /* ------------------------------------------------------------ bladet */

  const fot = (
    <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:gap-3">
      {kvotrad ? (
        <span className="flex items-center gap-3 text-[13px] leading-[18px] text-[color:var(--b3-ink-2)]">
          <span className="hidden xl:inline-flex">
            <Pips fyllda={upptagen || kvotSlut ? 1 : 0} totalt={1} etikett={upptagen ? 'Veckans gratisbrev används nu' : kvotSlut ? 'Veckans gratisbrev är använt' : 'Veckans gratisbrev är kvar'} />
          </span>
          <span>
            {kvotrad}
            <span className="b3-premium-rad" style={{ height: 22, padding: '0 8px', borderRadius: 11 }}>
              {SKRIV.utanTak(PAKETRADER.bricka)}
            </span>
          </span>
        </span>
      ) : null}
      {upptagen ? (
        <LitenKnapp className="xl:ml-auto" onClick={avbrytSkrivandet} disabled={lage === 'spelar'}>
          {SKRIV.avbryt}
        </LitenKnapp>
      ) : (
        <StorKnapp lag platt className="xl:ml-auto" onClick={skriv} disabled={!kanSkriva}>
          <IkonPenna size={18} />
          {SKRIV.skrivBrevet}
        </StorKnapp>
      )}
    </div>
  )

  const blad = (
    <Blad rubrik={SKRIV.bladRubrik} sidorad={SKRIV.bladSidorad} hojd={780} fot={fot}>
      <div className="flex flex-col gap-[14px] pb-2 pt-2 xl:pt-2">
        {fel ? (
          <div role="alert" className="flex items-center gap-3 rounded-[14px] border-2 border-[color:var(--fel)] bg-[color:var(--b3-papper)] px-3 py-2 text-[13px] leading-[18px] text-[color:var(--b3-ink)]">
            <span className="flex-1">{fel}</span>
            <LitenKnapp
              onClick={() => {
                setFel(null)
                void skriv()
              }}
            >
              {SKRIV.forsokIgen}
            </LitenKnapp>
          </div>
        ) : null}
        {namnKravs ? (
          <NameRequiredNotice
            rubrik={SKRIV.namnRubrik}
            text={SKRIV.namnText}
            knapp={SKRIV.namnKnapp}
            onSaved={() => {
              setNamnKravs(false)
              void skriv()
            }}
          />
        ) : null}

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="b3-eyebrow" htmlFor="skriv-annons">
              {SKRIV.annons}
            </label>
            {annons && !upptagen ? (
              <button
                type="button"
                className="inline-flex min-h-[28px] items-center text-[13px] font-semibold leading-[18px] text-[color:var(--b3-ink)] underline underline-offset-[3px]"
                onClick={() => {
                  setAnnons('')
                  clearDraft(UTKAST, UTKAST_VERSION)
                  annonsRef.current?.focus()
                }}
              >
                {SKRIV.bytAnnons}
              </button>
            ) : null}
          </div>
          {prefill?.jobTitle && prefill.jobDescription ? (
            <p className="m-0 mb-2 text-[13px] leading-[18px] text-[color:var(--b3-ink-2)]">
              {prefill.company ? SKRIV.franMatchning(prefill.jobTitle, prefill.company) : SKRIV.franMatchningUtanForetag(prefill.jobTitle)}
            </p>
          ) : null}
          <textarea
            id="skriv-annons"
            ref={annonsRef}
            className="b3-annons"
            value={annons}
            onChange={(e) => setAnnons(e.target.value)}
            placeholder={SKRIV.platshallare}
            readOnly={upptagen}
            aria-describedby={annonsLangd > 0 && annonsLangd < BRA_ANNONS ? 'skriv-annons-rad' : undefined}
          />
          {annonsLangd > 0 && annonsLangd < BRA_ANNONS && !upptagen ? (
            <p id="skriv-annons-rad" className="m-0 mt-1.5 text-[13px] leading-[18px] text-[color:var(--b3-ink-2)]" role="status">
              {SKRIV.forKort}
            </p>
          ) : null}
        </div>

        {visaKrav && krav ? (
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="b3-eyebrow">
                <span className="hidden xl:inline">{SKRIV.kravRubrik}</span>
                <span className="xl:hidden">{SKRIV.kravRubrikMobil}</span>
              </p>
              <span className="text-[13px] font-bold leading-[18px] text-[color:var(--b3-gron-ink)]">{SKRIV.kravSvar(kravMedSvar, krav.length)}</span>
            </div>
            <div className="b3-kravchips" role="img" aria-label={`${kravMedSvar} av ${krav.length} krav har fått ett svar i brevet så här långt.`}>
              {krav.map((k) => {
                const ok = !!k.citat && citatFinns(k.citat, synligaStycken)
                return (
                  <span key={k.krav} data-ok={ok ? '' : undefined}>
                    <i>{ok ? <IkonBock size={11} strokeWidth={4} /> : null}</i>
                    {k.krav}
                  </span>
                )
              })}
            </div>
          </div>
        ) : null}

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="b3-eyebrow">{SKRIV.tonen}</p>
            <SprakVal sprak={sprak} onSprak={setSprak} disabled={upptagen} />
          </div>
          <TonKnappar ton={ton} onTon={setTon} harBetalt={harBetalt} disabled={upptagen} />
        </div>

        {cv ? (
          <div className="flex items-center gap-3 rounded-2xl bg-[color:var(--b3-mjuk)] px-3 py-2.5 xl:px-3.5 xl:py-3">
            <span className="block h-[40px] w-[28px] shrink-0 overflow-hidden rounded-[3px] bg-white shadow-[0_0_0_2px_var(--b3-kant)] xl:h-[42px] xl:w-[30px]" aria-hidden="true">
              {cv.mall ? <img src={`/mallar/v2/${cv.mall}-liten.webp`} alt="" width={30} height={42} className="block h-full w-full object-cover object-top" /> : null}
            </span>
            <span className="min-w-0 flex-1">
              <span className="b3-eyebrow block">{SKRIV.byggerPa}</span>
              <b className="block truncate text-[14px] font-bold leading-[19px] xl:text-[15px] xl:leading-5">{cv.namn}</b>
            </span>
            <button
              type="button"
              className="inline-flex min-h-[44px] items-center text-[14px] font-semibold leading-5 text-[color:var(--b3-ink)] underline underline-offset-[3px] disabled:opacity-50"
              onClick={() => setVisaCvVal(true)}
              disabled={upptagen}
            >
              {SKRIV.bytCv}
            </button>
          </div>
        ) : null}
      </div>
    </Blad>
  )

  const telefonSida =
    lage === 'fore' ? (
      <p className="m-0 text-[13px] leading-[19px] text-[color:var(--vagg-mjuk)]">{SKRIV.telefonArkRad(mallNamn)}</p>
    ) : (
      <>
        {skrivbricka}
        <span className="b3-lop vagg" style={{ marginTop: 12 }}>
          <i />
        </span>
        <p className="m-0 mt-2.5 text-[13px] leading-[19px] text-[color:var(--vagg-mjuk)]">{SKRIV.vantar}</p>
      </>
    )

  const overlay =
    lage !== 'fore' && brickaTop !== null ? (
      <div className="absolute flex flex-col gap-[14px]" style={{ left: 50, right: 50, top: brickaTop }} aria-live="polite">
        <span className="self-start">{skrivbricka}</span>
        <span className="b3-lop">
          <i />
        </span>
        <span className="text-[13px] leading-[19px] text-[#4A3F46]">{SKRIV.vantar}</span>
      </div>
    ) : null

  return (
    <ArbetsRam>
      <ArbetsYta
        telefonArk="litet"
        huvud={
          <ArbetsHuvud
            tillbakaHref="/dashboard/mina-brev"
            rubrik={SKRIV.rubrik}
            underrad={underrad}
            sparstatus="auto"
            mallKapsel={
              <MallKapsel
                namn={mallNamn}
                miniatyr={<img src={`/mallar/v2/${mallId}-liten.webp`} alt="" width={18} height={25} />}
                // MALLVÄLJARE: kopplas in i etapp 3. Brevet finns inte än, så
                // mallväljaren öppnas som ett ark här (byggaren mallar äger den).
                onClick={() => {}}
              />
            }
          />
        }
        telefonArkSida={telefonSida}
        blad={
          <div className="flex flex-1 flex-col pb-[calc(var(--skriv-fot,140px))] xl:pb-0 max-xl:[&_.b3-blad-fot]:fixed max-xl:[&_.b3-blad-fot]:inset-x-0 max-xl:[&_.b3-blad-fot]:bottom-0 max-xl:[&_.b3-blad-fot]:z-20 max-xl:[&_.b3-blad-fot]:m-0 max-xl:[&_.b3-blad-fot]:pb-[max(16px,env(safe-area-inset-bottom))] max-xl:[&_.b3-blad-fot]:shadow-[0_-6px_18px_rgba(0,0,0,.12)]">
            {blad}
          </div>
        }
        ark={<ArbetsArk ref={arkRef} html={arkHtml} ariaLabel={arkEtikett} overlay={overlay} />}
        arkRad={
          <>
            <b>{sammaSomCv ? SKRIV.arkRadSamma(mallNamn) : SKRIV.arkRadAnnan(mallNamn)}</b> {SKRIV.arkRadSlut}
          </>
        }
      />
      {visaCvVal ? (
        <CvVal
          cvs={cvs}
          valt={cvId}
          onVal={(id) => {
            setCvId(id)
            setVisaCvVal(false)
          }}
          onClose={() => setVisaCvVal(false)}
        />
      ) : null}
      <BrevSparrLaddare
        open={!!sparr}
        variant="vecka"
        onClose={() => setSparr(null)}
        nastaGratis={sparr?.nasta ?? null}
        jobb={prefill?.jobTitle ? { titel: prefill.jobTitle, foretag: prefill.company ?? '' } : null}
        scope={summary?.paket?.scope ?? null}
        track={summary?.paket?.track ?? null}
        isPremium={harBetalt}
        returTill="/dashboard/skapa-brev"
      />
    </ArbetsRam>
  )
}
