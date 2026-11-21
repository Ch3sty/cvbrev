'use client'

/**
 * Matchade jobb (/dashboard/jobbmatchning), Jobbsöket omgång 1, etapp 2A
 * (F7; skissen Jobb, Jobb-gratis, Mobil-jobb och Mobil-jobb-annons).
 *
 * Väggen säger hur många jobb som passar och visar Ditt CV och Så söker vi
 * åt dig. Under den listan med träffar; från 1280 px står annonsen bredvid
 * listan, under det är annonsen en egen vy. Vald annons ligger i adressen
 * (?annons=<id>) så att bakåtknappen och delade länkar fungerar. Valet byts
 * med history.pushState, så servern läser inte om körningen för varje klick.
 *
 * Funktionen är dagens (förut JobbmatchningClient): Byt CV, Rätta, Så söker
 * vi åt dig och Filter i rummets ark, omsökningen via edge-funktionen
 * match-jobs, påfyllningen till 600 annonser, sessionStorage-sparningen,
 * suddningen via POST /api/jobs/redact (gratisnivån: tre öppna, fem dolda
 * rader med bara ringen, betalväggen med dagens PaywallCard), "sedda"-
 * markeringen och mätpunkterna. Nytt: senaste körningen läses på servern
 * (senasteKorning.ts), sorteringen Relevans, Nyast, Sista ansökningsdag
 * gäller listan, och handlingarna Skriv brev, Spara till Ska sökas och
 * Markera som sökt står i annonsen.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useNotification } from '@/context/notificationcontext'
import { useDashboardData } from '@/contexts/DashboardDataContext'
import Topprad from '@/components/rum/Topprad'
import {
  JobbVagg,
  VaggHero,
  VaggText,
  Golv,
  FastFot,
  StorKnapp,
  LitenKnapp,
  GlasKnapp,
  TextLank,
  VaggEtikett,
  VaggRuta,
  VaggTal,
  RutaRad,
  TjanstHuvud,
  StatusPiller,
  LyftPanel,
  TraffRad,
  TraffLista,
  FilterRad,
  TomtLage,
  Felruta,
  RadSkelett,
  Skel,
  Kryss,
  IkonPlus,
  IkonSok,
  IkonDokument,
  IkonPil,
} from '@/components/jobb3/kit'
import { CV_HREF } from '@/lib/letters/lage'
import { JOBB_HREF, brickBokstaver, dagFor, idagSv, jobbHref, narText, ordtal, sedanDuTittade, soktaHref, sistaAnsokningsdag, sparadFranAnnons } from '@/lib/jobbsok'
import { capture } from '@/lib/analytics/events'
import { requestInstallPrompt } from '@/lib/pwa/installPrompt'
import type { JobRedactionResult } from '@/app/api/jobs/redact/route'
import { arLangtBort, rankGlobalJobs } from '@/app/dashboard/jobbmatchning/data/job-filtering'
import { DEFAULT_FILTERS, countActiveFilters, type JobFilters } from '@/app/dashboard/jobbmatchning/data/filter-standard'
import { SWEDISH_MUNICIPALITIES } from '@/app/dashboard/jobbmatchning/data/swedish-municipalities'
import { buildMatchReasons, senastSoktLabel } from '@/app/dashboard/jobbmatchning/data/match-reasons'
import type { ActiveCVData, JobbmatchningData } from '@/app/dashboard/jobbmatchning/getJobbmatchningData'
import type { SenasteKorning } from '@/app/dashboard/jobbmatchning/senasteKorning'
import { toJobPreferences, type JobPreferences } from '@/types/user.types'
import { arNy, arbetsgivareOrt, brevUnderlag, passarSkal, skalKort } from './annons'
import { bastaTraffar, lattRad, poolUrval, sammanfattningsJobb, type LattRad } from '@/lib/jobmatching/basta'
import { AnnonsFotMobil, AnnonsKortMobil, AnnonsPanel, AnnonsInnehall, Betalvagg, DoldPanel, DoldPassar, type SoktLage, type SparLage } from './AnnonsVy'
import { ByttCvArk, FilterArk, PrefsArk, RattaArk } from './MatchArk'

/** Gratisnivåns tak, samma tal som FREE_TIER_JOB_LIMIT; bara som sista utväg när suddningssvaret uteblir. */
const FREE_TIER_FALLBACK_LIMIT = 3

/** En lokalt sparad sökning återanvänds högst ett dygn. */
const SAVED_SEARCH_MAX_AGE_MS = 24 * 60 * 60 * 1000

/** Hur många annonser som sparas lokalt (se JobbmatchningClient tidigare: kvoten i sessionStorage). */
const SAVED_SEARCH_MAX_JOBS = 60

/** Rader i listan innan "Visa N till" (skissen: åtta på dator). */
const RADER_FORST = 8

interface SavedSearch {
  jobs: any[]
  adsRead: number
  hasMore: boolean
  savedAt: number
  cvId: string | null
}

function savedSearchKey(userId: string, cvId: string | null): string {
  return `jobbmatchning:senaste:${userId}:${cvId ?? 'utan-cv'}`
}

type Sortering = '' | 'pubdate-desc' | 'applydate-asc'
const SORT_VAL: { id: string; varde: Sortering; text: string }[] = [
  { id: 'relevans', varde: '', text: 'Relevans' },
  { id: 'nyast', varde: 'pubdate-desc', text: 'Nyast' },
  { id: 'dag', varde: 'applydate-asc', text: 'Sista ansökningsdag' },
]

const LOGGA_HREF = soktaHref({ logga: 'sokt' })

export default function MatchadeJobb({
  initialData,
  korning,
  lasfel = false,
  userId,
}: {
  initialData: JobbmatchningData
  korning: SenasteKorning | null
  /** Servern kunde inte läsa körningen och hade ingen sammanfattning att visa. */
  lasfel?: boolean
  userId: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { successWithMascotAndActivity } = useNotification()
  const { refresh: refreshSummering } = useDashboardData()

  const lockedCvIds = useMemo(() => new Set(initialData.lockedCvIds), [initialData.lockedCvIds])

  /* ------------------------------------------------------------ tillstånd */

  const [cvs] = useState(initialData.cvs)
  const [activeCV, setActiveCV] = useState<ActiveCVData | null>(initialData.activeCV)
  const [activeCVId, setActiveCVId] = useState<string | null>(initialData.activeCV?.cv_id ?? null)

  const [prefs, setPrefs] = useState<JobPreferences>(initialData.jobPreferences)
  const [prefsDraft, setPrefsDraft] = useState<JobPreferences>(initialData.jobPreferences)
  const [prefsOpen, setPrefsOpen] = useState(false)
  const [prefsSaving, setPrefsSaving] = useState(false)

  const [cvSheetOpen, setCvSheetOpen] = useState(false)
  const [fixSheetOpen, setFixSheetOpen] = useState(false)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  // Rättningar av det vi läste ut gäller den här sökningen och sparas inte.
  const [droppedRoles, setDroppedRoles] = useState<string[]>([])
  const [droppedSkills, setDroppedSkills] = useState<string[]>([])

  // Senaste körningen från servern står i listan direkt (omgång 1).
  const franServern = korning && korning.cvId === (initialData.activeCV?.cv_id ?? null) ? korning : null
  // Sidan skickar bara listans rader och den valda annonsen (rättningsrundan):
  // hela poolen hämtas först när användaren filtrerar, vill se längre bort
  // eller ändrar sökprofilen. Fram till dess är listan serverns rader.
  const [jobs, setJobs] = useState<any[]>([])
  const [poolLaddad, setPoolLaddad] = useState(false)
  const [poolLaddar, setPoolLaddar] = useState(false)
  const [annonser, setAnnonser] = useState<Record<string, Record<string, any>>>(() =>
    franServern?.vald ? { [String(franServern.vald.id)]: franServern.vald } : {}
  )
  const [showDistantJobs, setShowDistantJobs] = useState(false)
  const [hasSearched, setHasSearched] = useState(Boolean(franServern))
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [filters, setFilters] = useState<JobFilters>(DEFAULT_FILTERS)
  const [adsRead, setAdsRead] = useState(franServern?.adsRead ?? 0)

  const [globalRemote, setGlobalRemote] = useState<any[] | null>(null)
  const [globalNoExp, setGlobalNoExp] = useState<any[] | null>(null)
  const [loadingGlobal, setLoadingGlobal] = useState(false)

  /** När den visade sökningen kördes, om den är återställd (servern eller sessionStorage). */
  const [restoredAt, setRestoredAt] = useState<number | null>(franServern?.savedAt ?? null)

  const [activatingCVId, setActivatingCVId] = useState<string | null>(null)
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [visaAlla, setVisaAlla] = useState(false)

  /** Ska sökas och sökt per AF-annons-id, startat ur serverns läsning. */
  const [sparLagen, setSparLagen] = useState<Record<string, SparLage>>(() =>
    Object.fromEntries(Object.entries(initialData.sparade).filter(([, v]) => v === 'sparad').map(([k]) => [k, 'sparad' as SparLage]))
  )
  const [soktLagen, setSoktLagen] = useState<Record<string, SoktLage>>(() =>
    Object.fromEntries(Object.entries(initialData.sparade).filter(([, v]) => v === 'sokt').map(([k]) => [k, 'sokt' as SoktLage]))
  )

  /* -------------------------------------------------------------- mätning */

  const viewLogged = useRef(false)
  useEffect(() => {
    if (viewLogged.current) return
    viewLogged.current = true
    capture('match_page_viewed', {
      has_cv: cvs.length > 0,
      has_preferences: prefs.locations.length > 0 || prefs.remote || prefs.extent !== '' || prefs.min_salary !== null,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Frågan om hemskärmen (docs/plan-pwa.md), efter den första matchningen.
  const installPromptAsked = useRef(false)
  useEffect(() => {
    if (installPromptAsked.current) return
    if (!hasSearched || loadingJobs || jobs.length === 0) return
    installPromptAsked.current = true
    requestInstallPrompt('first_match')
  }, [hasSearched, loadingJobs, jobs.length])

  const autoActivated = useRef(false)

  /** När den senaste färska sökningen gav svar. Det är dess tid som sparas lokalt, inte tiden för sparningen. */
  const sokAt = useRef<number | null>(null)

  /* ----------------------------------------------- senaste sökningen lokalt */

  const saveSearch = useCallback(
    (nyaJobs: any[], lasta: number, mer: boolean) => {
      if (!activeCVId || nyaJobs.length === 0) return
      try {
        const payload: SavedSearch = { jobs: nyaJobs.slice(0, SAVED_SEARCH_MAX_JOBS), adsRead: lasta, hasMore: mer, savedAt: sokAt.current ?? Date.now(), cvId: activeCVId }
        sessionStorage.setItem(savedSearchKey(userId, activeCVId), JSON.stringify(payload))
      } catch {
        /* full eller avstängd lagring: sökningen fungerar ändå */
      }
    },
    [userId, activeCVId]
  )

  // Återställ en lokalt sparad sökning, om den är nyare än serverns körning.
  const restoreAttempted = useRef(false)
  useEffect(() => {
    if (restoreAttempted.current) return
    if (!activeCVId) return
    restoreAttempted.current = true
    try {
      const raw = sessionStorage.getItem(savedSearchKey(userId, activeCVId))
      if (!raw) return
      const saved = JSON.parse(raw) as SavedSearch
      const alder = Date.now() - saved.savedAt
      if (!Array.isArray(saved.jobs) || saved.jobs.length === 0 || alder > SAVED_SEARCH_MAX_AGE_MS) {
        sessionStorage.removeItem(savedSearchKey(userId, activeCVId))
        return
      }
      if (franServern && franServern.savedAt >= saved.savedAt) return
      // Listan, tiden och suddningen byts tillsammans: serverns suddning hör
      // till serverns rader och får inte stå kvar över de återställda.
      setJobs(saved.jobs)
      setAdsRead(saved.adsRead ?? saved.jobs.length)
      setHasSearched(true)
      setRestoredAt(saved.savedAt)
      setPoolLaddad(true)
      setLastRedaktion(false)
      setRedaction(null)
      setRedactionAsked(false)
    } catch {
      /* trasig eller otillgänglig sessionStorage: sidan fungerar utan den */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, activeCVId])

  /* ------------------------------------------------------ det vi läste ut */

  const roles = useMemo(() => (activeCV?.extracted_occupations ?? []).filter((o) => !droppedRoles.includes(o.normalized)), [activeCV, droppedRoles])
  const skills = useMemo(() => (activeCV?.extracted_skills ?? []).filter((s) => !droppedSkills.includes(s)), [activeCV, droppedSkills])
  const educations = activeCV?.extracted_educations ?? []
  const laserCv = activatingCVId !== null
  const cvName = cvs.find((cv) => cv.id === (activeCVId ?? activatingCVId))?.file_name ?? (laserCv ? 'Läser ditt CV' : 'Inget CV valt')

  /* -------------------------------------------------------- globala pooler */

  const cvContext = useCallback(() => {
    const loc = activeCV?.extracted_location?.toLowerCase().trim()
    const muni = loc ? SWEDISH_MUNICIPALITIES.find((m) => m.name.toLowerCase() === loc || loc.includes(m.name.toLowerCase())) : undefined
    return { skills: activeCV?.extracted_skills || [], lat: muni?.lat ?? null, lon: muni?.lon ?? null }
  }, [activeCV])

  const loadGlobalPool = useCallback(
    async (cacheKey: 'remote' | 'no_experience') => {
      setLoadingGlobal(true)
      try {
        const { data, error: err } = await supabase.from('global_job_cache').select('jobs').eq('cache_key', cacheKey).maybeSingle()
        if (err || !data) return
        const ranked = rankGlobalJobs(data.jobs || [], cvContext())
        if (cacheKey === 'remote') setGlobalRemote(ranked)
        else setGlobalNoExp(ranked)
      } catch (err) {
        console.error(`Error loading global pool ${cacheKey}:`, err)
      } finally {
        setLoadingGlobal(false)
      }
    },
    [supabase, cvContext]
  )

  useEffect(() => {
    if (filters.remote && globalRemote === null) loadGlobalPool('remote')
    if (filters.noExperience && globalNoExp === null) loadGlobalPool('no_experience')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.remote, filters.noExperience])

  const baseJobs: any[] = filters.noExperience ? globalNoExp || [] : filters.remote ? globalRemote || [] : jobs
  const usingGlobalPool = filters.noExperience || filters.remote

  const cvOrt = activeCV?.extracted_location ?? null

  /* ------------------------------------------------------------ matchgraden */

  // Samma funktion som servern (bastaTraffar i basta.ts), med filtren och
  // "längre bort" som tillval. I grundläget ger den exakt serverns lista, så
  // att antalet efter en sökning och efter en omladdning är detsamma.
  const ranked = useMemo(
    () => bastaTraffar(baseJobs, activeCV, prefs, { filters, visaLangtBort: showDistantJobs }),
    [baseJobs, activeCV, prefs, filters, showDistantJobs]
  )

  /** Den färska sökningens bästa i grundläget: det servern visar efter en omladdning. */
  const sammanfattning = useMemo(() => (jobs.length > 0 ? sammanfattningsJobb(jobs, activeCV, prefs) : []), [jobs, activeCV, prefs])

  const scoreById = useMemo(() => {
    const m = new Map<string, (typeof ranked)[number]['score']>()
    for (const r of ranked) m.set(String(r.job.id), r.score)
    return m
  }, [ranked])

  // Lokalt sparas samma urval som poolen: de bästa i grundläget först (så att
  // en återställd lista är serverns), sedan närmare och längre bort. Förut
  // sparades listan med de filter som råkade vara valda.
  useEffect(() => {
    if (!hasSearched || loadingJobs || sammanfattning.length === 0) return
    if (restoredAt !== null) return
    saveSearch(poolUrval(jobs, activeCV, prefs, SAVED_SEARCH_MAX_JOBS), adsRead, hasMore)
  }, [hasSearched, loadingJobs, sammanfattning, jobs, activeCV, prefs, restoredAt, adsRead, hasMore, saveSearch])

  // Efter en färsk sökning som gav träffar: de bästa till servern, så att
  // Översikt, sidomenyn och nästa sidladdning har dem även när match-jobs inte
  // hann spara körningen. Första gången så fort första omgången är rankad,
  // och en gång till när påfyllningen ändrat toppen. Förut väntade den på att
  // hasMore blev falskt; laddades sidan om innan påfyllningen var klar (den
  // kan ta lika lång tid som sökningen) skickades ingen alls (slutkontrollen
  // 2026-11-21).
  //
  // Det som skickas är räknat med serverns regel (sammanfattningsJobb). Förut
  // skickades de 60 bästa utan avståndsgräns; servern gallrade bort dem
  // längre bort än 100 km och fick färre träffar än webbläsaren (Jobbsöket
  // omgång 2, "7 jobb passar dig" blev "2" efter omladdning).
  const sammanfattadTopp = useRef<string | null>(null)
  useEffect(() => {
    if (restoredAt !== null || loadingJobs || sammanfattning.length === 0 || !activeCVId) return
    const topp = sammanfattning.map((j) => String(j.id ?? '')).join(',')
    if (sammanfattadTopp.current === topp) return
    sammanfattadTopp.current = topp
    void fetch('/api/jobbmatchning/sammanfattning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobs: sammanfattning, adsRead }),
    }).catch(() => {})
  }, [restoredAt, loadingJobs, sammanfattning, activeCVId, adsRead])

  /** Hämtar poolen (filter, längre bort, ändrad sökprofil). Sidan har annars bara listans rader. */
  const laddaPool = useCallback(async () => {
    if (poolLaddad || poolLaddar || !franServern) return
    setPoolLaddar(true)
    try {
      const res = await fetch('/api/jobbmatchning/pool')
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success || !Array.isArray(json.jobs)) throw new Error(json?.error ?? String(res.status))
      // Listan räknas nu ur poolen: tiden är poolens körning, och serverns
      // suddning (gjord för serverns rader) räknas om.
      setJobs(json.jobs)
      if (typeof json.adsRead === 'number') setAdsRead(json.adsRead)
      if (typeof json.korningAt === 'number' && Number.isFinite(json.korningAt)) setRestoredAt(json.korningAt)
      setPoolLaddad(true)
      setLastRedaktion(false)
      setRedaction(null)
      setRedactionAsked(false)
    } catch (err) {
      console.error('Kunde inte hämta träffarna:', err)
      setError('Vi kunde inte hämta alla träffar just nu. Försök igen.')
    } finally {
      setPoolLaddar(false)
    }
  }, [poolLaddad, poolLaddar, franServern])

  // Filter och "längre bort" behöver poolen; sorteringen gör det inte.
  useEffect(() => {
    if (showDistantJobs || countActiveFilters({ ...filters, sort: '' }) > 0) void laddaPool()
  }, [filters, showDistantJobs, laddaPool])

  /* ------------------------------------------------------------ suddningen */

  const [redaction, setRedaction] = useState<JobRedactionResult | null>(franServern?.redaction ?? null)
  const [redactionAsked, setRedactionAsked] = useState(Boolean(franServern))
  /**
   * Serverns rader har suddningen redan uträknad (gratisnivån får bara de
   * tre öppna). Den räknas om först när poolen hämtats eller en ny sökning
   * körts.
   */
  const [lastRedaktion, setLastRedaktion] = useState(Boolean(franServern))

  useEffect(() => {
    if (lastRedaktion) return
    if (ranked.length === 0) {
      setRedaction(null)
      setRedactionAsked(false)
      return
    }
    let cancelled = false
    const payload = ranked.map((r) => ({ id: r.job.id, relevance: r.score.score }))
    fetch('/api/jobs/redact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobs: payload }) })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: JobRedactionResult | null) => {
        if (cancelled) return
        if (data) setRedaction(data)
        setRedactionAsked(true)
      })
      .catch(() => {
        if (!cancelled) setRedactionAsked(true)
      })
    return () => {
      cancelled = true
    }
  }, [ranked, lastRedaktion])

  /* ------------------------------------------------------------ hämtningar */

  const fetchActiveCV = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return
      const { data, error: err } = await supabase.from('active_cv_for_matching').select('*').eq('user_id', session.user.id).maybeSingle()
      if (err) {
        console.error('Error fetching active CV:', err)
        return
      }
      if (data) {
        setActiveCV(data)
        setActiveCVId(data.cv_id)
      }
    } catch (err) {
      console.error('Error fetching active CV:', err)
    }
  }

  const handleActivateCV = async (cvId: string) => {
    setActivatingCVId(cvId)
    setError(null)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error('Du måste vara inloggad')
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/parse-cv-for-matching`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvId, userId: session.user.id }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Kunde inte aktivera CV')
      }
      const result = await response.json()
      if (result.success) {
        setDroppedRoles([])
        setDroppedSkills([])
        setJobs([])
        setHasSearched(false)
        setRestoredAt(null)
        setLastRedaktion(false)
        await fetchActiveCV()
        setCvSheetOpen(false)
      }
    } catch (err) {
      console.error('Error activating CV:', err)
      setError(err instanceof Error ? err.message : 'Ett fel uppstod vid CV-aktivering')
    } finally {
      setActivatingCVId(null)
    }
  }

  // Har hon laddat upp ett CV men inget är inläst ännu läser vi det senaste automatiskt.
  useEffect(() => {
    if (autoActivated.current) return
    if (activeCV || cvs.length === 0) return
    const forsta = cvs.find((cv) => !lockedCvIds.has(cv.id))
    if (!forsta) return
    autoActivated.current = true
    void handleActivateCV(forsta.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCV, cvs, lockedCvIds])

  const fetchJobs = async () => {
    if (!activeCVId && !activeCV) {
      setError('Välj ett CV först, så vet vi vad vi ska leta efter.')
      return
    }
    setLoadingJobs(true)
    setHasSearched(true)
    setError(null)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error('Du måste vara inloggad')
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/match-jobs`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id }),
        signal: AbortSignal.timeout(160000),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Kunde inte hämta jobbannonser')
      }
      const data = await response.json()
      if (data.success) {
        const funna = data.jobs || []
        sokAt.current = Date.now()
        sammanfattadTopp.current = null
        setLastRedaktion(false)
        setRedaction(null)
        setRedactionAsked(false)
        setPoolLaddad(true)
        setJobs(funna)
        // sparad: false betyder att match-jobs inte kunde spara körningen.
        // Påfyllningen läser den sparade körningen och skulle annars göra om
        // hela sökningen; då nöjer vi oss med första omgången.
        setHasMore(data.sparad === false ? false : data.hasMore || false)
        void fetch('/api/rum/matchningar-sedda', { method: 'POST' }).catch(() => {})
        const lasta = data.totalScanned ?? data.totalAvailable ?? data.totalResults ?? funna.length
        setAdsRead(lasta)
        setRestoredAt(null)
        setVisaAlla(false)
        capture('match_search_run', { ads_read: lasta, matches: funna.length, custom_query: false })
        if (funna.length > 0) {
          successWithMascotAndActivity(
            `Vi läste ${funna.length} annonser åt dig.`,
            'jobs-found',
            'jobs_searched',
            'sökte matchande jobb',
            { jobs_count: funna.length, search_query: 'auto', cv_id: activeCVId },
            4000
          )
        }
      }
    } catch (err) {
      console.error('Error fetching jobs:', err)
      if (err instanceof DOMException && err.name === 'TimeoutError') {
        setError('Sökningen tog längre tid än väntat. Försök igen, andra försöket går oftast snabbt.')
      } else {
        setError(err instanceof Error ? err.message : 'Ett fel uppstod. Försök igen.')
      }
    } finally {
      setLoadingJobs(false)
    }
  }

  const fetchMoreJobs = useCallback(
    async (offset: number, limit: number) => {
      if (loadingMore) return
      setLoadingMore(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) return
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/match-jobs`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: session.user.id, offset, limit }),
        })
        if (!response.ok) return
        const data = await response.json()
        if (data.success && data.jobs?.length > 0) {
          setJobs((prev) => {
            const seen = new Set(prev.map((j) => j.id))
            const fresh = data.jobs.filter((j: any) => !seen.has(j.id))
            return [...prev, ...fresh]
          })
          setHasMore(data.hasMore || false)
        }
      } catch (err) {
        console.error('Error fetching more jobs:', err)
      } finally {
        setLoadingMore(false)
      }
    },
    [loadingMore, supabase]
  )

  useEffect(() => {
    if (hasMore && jobs.length === 50) fetchMoreJobs(50, 550)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, jobs.length])

  /* ------------------------------------------------------------ handlingar */

  const savePreferences = async () => {
    setPrefsSaving(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error('Du måste vara inloggad')
      const { error: err } = await supabase.from('profiles').update({ job_preferences: prefsDraft, updated_at: new Date().toISOString() }).eq('id', session.user.id)
      if (err) throw err
      setPrefs(prefsDraft)
      setPrefsOpen(false)
      // En ny sökprofil gallrar poolen, inte serverns rader.
      void laddaPool()
      capture('match_preferences_saved', {
        source: 'matchningar',
        locations: prefsDraft.locations.length,
        remote: prefsDraft.remote,
        extent: prefsDraft.extent,
        has_min_salary: prefsDraft.min_salary !== null,
      })
    } catch (err) {
      console.error('Kunde inte spara preferenser:', err)
      setError('Preferenserna sparades inte. Försök igen.')
    } finally {
      setPrefsSaving(false)
    }
  }

  const openPrefs = () => {
    const utkast = toJobPreferences(prefs)
    const ort = activeCV?.extracted_location
    if (utkast.locations.length === 0 && ort) utkast.locations = [ort]
    setPrefsDraft(utkast)
    setPrefsOpen(true)
  }

  const handleWriteLetter = useCallback(
    async (job: Record<string, any>) => {
      capture('match_letter_started', {
        job_id: String(job.id ?? ''),
        relevance: typeof job.relevance === 'number' ? Math.round(job.relevance) : undefined,
      })
      // Prefill-mekanismen är oförändrad: sessionStorage skrivs synkront här
      // och läses synkront av skapa-brev vid första mount.
      const { coverLetterPrefill } = await import('@/store/cover-letter-store')
      const annonsUrl = job.application_details?.url || job.application_url || job.webpage_url
      coverLetterPrefill.set({
        cvId: activeCVId || '',
        jobTitle: String(job.headline ?? ''),
        company: job.employer?.name || '',
        jobDescription: brevUnderlag(job),
        jobAdUrl: annonsUrl || undefined,
      })
      router.push('/dashboard/skapa-brev')
    },
    [activeCVId, router]
  )

  const handleSpara = async (job: Record<string, any>, score: number | null) => {
    const id = String(job.id ?? '')
    if (sparLagen[id] === 'sparar' || sparLagen[id] === 'sparad') return
    setSparLagen((p) => ({ ...p, [id]: 'sparar' }))
    try {
      const res = await fetch('/api/jobbsok/ska-sokas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sparadFranAnnons(job, score)),
      })
      const json = await res.json().catch(() => ({}))
      if (res.status === 409 && json?.code === 'redan_sokt') {
        setSparLagen((p) => ({ ...p, [id]: 'idle' }))
        setSoktLagen((p) => ({ ...p, [id]: 'sokt' }))
        return
      }
      if (!res.ok || !json.success) throw new Error(json.error)
      setSparLagen((p) => ({ ...p, [id]: 'sparad' }))
      // Kom igång-brickan "Logga en tjänst du har sökt" bockas av utan omladdning.
      void refreshSummering()
    } catch (err) {
      console.error('Kunde inte spara till Ska sökas:', err)
      setSparLagen((p) => ({ ...p, [id]: 'fel' }))
    }
  }

  const handleMarkApplied = async (job: Record<string, any>) => {
    const id = String(job.id ?? '')
    if (soktLagen[id] === 'sparar' || soktLagen[id] === 'sokt') return
    setSoktLagen((p) => ({ ...p, [id]: 'sparar' }))
    try {
      const annonsUrl = job.application_details?.url || job.application_url || job.webpage_url
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: job.headline || 'Okänd tjänst',
          company: job.employer?.name || 'Okänd arbetsgivare',
          location: job.workplace_address?.municipality || null,
          application_channel: 'ad',
          job_ad_url: annonsUrl || null,
          cv_id: activeCVId || null,
          af_ad_id: id || null,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error)
      setSoktLagen((p) => ({ ...p, [id]: 'sokt' }))
      capture('match_applied', { job_id: id })
      void refreshSummering()
    } catch (err) {
      console.error('Kunde inte markera som sökt:', err)
      setSoktLagen((p) => ({ ...p, [id]: 'fel' }))
    }
  }

  /* --------------------------------------------------------- vald annons */

  const annonsId = searchParams.get('annons')
  const valj = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    // Adressen bär valet; history.pushState byter den utan att servern läser om sidan.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    window.history.pushState(null, '', jobbHref(id))
    if (!window.matchMedia('(min-width: 1280px)').matches) window.scrollTo(0, 0)
    if (!id.startsWith('dold-')) {
      const job = jobs.find((j) => String(j.id) === id) ?? annonser[id]
      capture('match_viewed', { job_id: id, relevance: typeof job?.relevance === 'number' ? Math.round(job.relevance) : undefined })
    }
  }

  // ?skriv=1 från Översikt (Skriv brev på ett träffkort): öppna brevet för den valda annonsen direkt.
  const skrivKord = useRef(false)
  useEffect(() => {
    if (skrivKord.current || searchParams.get('skriv') !== '1') return
    const id = searchParams.get('annons')
    const job = id ? jobs.find((j) => String(j.id) === id) ?? annonser[id] : null
    if (!job) return
    skrivKord.current = true
    void handleWriteLetter(job)
  }, [searchParams, jobs, annonser, handleWriteLetter])

  /* ------------------------------------------------------------------- vy */

  const handlingVagg = (
    <GlasKnapp href={LOGGA_HREF} ikon={<IkonPlus />}>
      Logga sökt tjänst
    </GlasKnapp>
  )
  const atgarder = <Topprad bara="atgarder" />
  const ingress = 'Vi läser ditt CV och letar bland Arbetsförmedlingens annonser. Varje träff säger varför den passar.'

  if (initialData.loadFailed) {
    return (
      <>
        <JobbVagg hojd={436} hojdMobil={338} flik="jobb" handling={handlingVagg} atgarder={atgarder}>
          <VaggHero spalt={560}>
            <VaggText rubrik="Matchade jobb" ingress={ingress} />
          </VaggHero>
        </JobbVagg>
        <Golv>
          <LyftPanel>
            <Felruta text="Vi kunde inte läsa dina CV just nu. Ladda om sidan, så försöker vi igen." onForsok={() => router.refresh()} />
          </LyftPanel>
        </Golv>
      </>
    )
  }

  if (cvs.length === 0) {
    return (
      <>
        <JobbVagg hojd={436} hojdMobil={338} flik="jobb" handling={handlingVagg} atgarder={atgarder}>
          <VaggHero spalt={600}>
            <VaggText ogon="Matchade jobb" rubrik="Först behöver vi ditt CV" ingress="Vi läser ditt CV och letar bland Arbetsförmedlingens annonser efter jobb som passar dig. Varje träff säger varför den passar." bredIngress />
          </VaggHero>
        </JobbVagg>
        <Golv>
          <LyftPanel>
            <TomtLage
              inbaddad
              ikon={<IkonDokument />}
              rubrik="Inget CV än"
              text="Ladda upp ditt CV, så läser vi ut roller och kompetenser och letar jobb som passar. PDF, Word eller text."
              handling={
                <StorKnapp golv href={CV_HREF}>
                  Ladda upp ditt CV
                  <IkonPil />
                </StorKnapp>
              }
            />
          </LyftPanel>
        </Golv>
      </>
    )
  }

  const isLoading = loadingJobs || (usingGlobalPool && loadingGlobal)
  const iSammanfattning = !poolLaddad && !!franServern && jobs.length === 0

  const visibleIds = redaction ? new Set(redaction.visibleIds) : null
  const displayedJobs = redaction?.isPremium ? ranked : visibleIds ? ranked.filter((r) => visibleIds.has(String(r.job.id))) : []
  const redactedJobs = redaction?.redacted ?? []
  const hiddenCount = redaction?.hiddenCount ?? 0
  const waitingForRedaction = !iSammanfattning && ranked.length > 0 && !redactionAsked
  const fallbackJobs = redactionAsked && !redaction ? ranked.slice(0, FREE_TIER_FALLBACK_LIMIT) : []
  // Listans rader: serverns (sammanfattningen) eller poolens.
  const rader: Rad[] = iSammanfattning
    ? franServern!.rader.map((l) => ({ id: l.id, lat: l, job: annonser[l.id] ?? null }))
    : (displayedJobs.length > 0 ? displayedJobs : fallbackJobs).map((r) => ({ id: String(r.job.id), lat: lattRad(r, activeCV, prefs.locations), job: r.job }))
  const antalTraffar = iSammanfattning ? franServern!.rader.length : ranked.length
  const oppnaRader = sortera(rader, filters.sort as Sortering)
  const totalt = redaction ? redaction.visibleIds.length + redaction.hiddenCount : antalTraffar
  const gratis = redaction ? !redaction.isPremium : false
  const distantCount = poolLaddad ? baseJobs.filter((j) => arLangtBort(j, cvOrt, prefs.locations)).length : 0
  const nyaAntal = oppnaRader.filter((r) => arNy(r.lat, initialData.seddaAt)).length
  const idag = idagSv()
  const senastDag = restoredAt ? dagFor(new Date(restoredAt)) : idag
  const senastSokt = senastSoktLabel(restoredAt)
  // "Sedan du tittade i tisdags" över listan, bara när det finns nya träffar.
  const sedanTittade = nyaAntal > 0 ? sedanDuTittade(initialData.seddaAt, idag) : null

  // Den valda annonsen: adressens, annars den första på dator.
  const valdDold = annonsId?.startsWith('dold-') ? redactedJobs.find((r) => r.placeholderId === annonsId) ?? null : null
  const valdRad = annonsId && !valdDold ? oppnaRader.find((r) => r.id === annonsId) ?? null : null
  const datorVal = valdRad ?? (valdDold ? null : oppnaRader[0] ?? null)
  const mobilAnnons = Boolean(annonsId) && !isLoading

  const skalFor = (rad: Rad, job: Record<string, any>) => ({ score: rad.lat.score, ...passarSkal(job, activeCV, prefs.locations, rad.lat.score) })
  const handlingarFor = (job: Record<string, any>, score: number) => {
    const id = String(job.id ?? '')
    return {
      onSkrivBrev: () => void handleWriteLetter(job),
      onSpara: () => void handleSpara(job, score),
      onSokt: () => void handleMarkApplied(job),
      spara: sparLagen[id] ?? 'idle',
      sokt: soktLagen[id] ?? 'idle',
    }
  }
  /** Den valda annonsens hela text, eller en laddare som hämtar den. */
  const helAnnons = (rad: Rad) => rad.job ?? annonser[rad.id] ?? null
  const hamta = (rad: Rad) => <HamtaAnnons id={rad.id} onKlar={(job) => setAnnonser((p) => ({ ...p, [rad.id]: job }))} />

  /* ----- väggen */

  const harTraffar = hasSearched && !isLoading && antalTraffar > 0
  const rubrik = isLoading
    ? 'Vi läser annonserna åt dig'
    : harTraffar
      ? gratis
        ? `${totalt} jobb passar dig, ${ordtal(oppnaRader.length)} är öppna`
        : `${totalt} jobb passar dig${nyaAntal > 0 ? `, ${ordtal(nyaAntal)} är nya` : ''}`
      : hasSearched
        ? 'Inget passade den här gången'
        : 'Jobb som passar ditt CV'
  const ogon = harTraffar && senastDag ? `${adsRead.toLocaleString('sv-SE')} annonser lästa · senast ${narText(senastDag, idag)}` : undefined

  const orterText = (() => {
    const orter = prefs.locations.length > 0 ? [...prefs.locations] : activeCV?.extracted_location ? [activeCV.extracted_location] : []
    if (prefs.remote) orter.push('distans')
    if (orter.length === 0) return 'Ingen ort vald'
    return orter.length === 1 ? orter[0] : `${orter.slice(0, -1).join(', ')} och ${orter[orter.length - 1]}`
  })()
  const omfattning = prefs.extent === 'heltid' ? 'Heltid' : prefs.extent === 'deltid' ? 'Deltid' : 'Heltid och deltid'
  const prefsChips = [
    ...(prefs.locations.length > 0 ? prefs.locations : activeCV?.extracted_location ? [`Från ditt CV: ${activeCV.extracted_location}`] : ['Ingen ort vald']),
    `Distans: ${prefs.remote ? 'ja' : 'nej'}`,
    omfattning,
    `Lön: ${prefs.min_salary !== null ? 'satt' : 'ej satt'}`,
  ]

  const listVagg = (
    <JobbVagg hojd={436} hojdMobil={338} flik="jobb" handling={handlingVagg} atgarder={atgarder} etikett="Matchade jobb">
      <VaggHero
        spalt={470}
        glapp={40}
        bildPlats="bred"
        bild={
          <div className="hidden gap-4 xl:grid xl:grid-cols-2">
            <VaggRuta
              rubrik="Ditt CV"
              lankar={
                <>
                  <button type="button" onClick={() => setCvSheetOpen(true)}>
                    {activeCV ? 'Byt CV' : 'Välj CV'}
                  </button>
                  {activeCV ? (
                    <button type="button" onClick={() => setFixSheetOpen(true)}>
                      Rätta
                    </button>
                  ) : null}
                </>
              }
            >
              <p className="mb-3 mt-2 truncate text-[15px] font-bold leading-5">{cvName}</p>
              {activeCV ? (
                <>
                  <span className="flex gap-[26px]">
                    <VaggTal tal={roles.length} etikett="roller" />
                    <VaggTal tal={skills.length} etikett="kompetenser" />
                    <VaggTal tal={educations.length} etikett="utbildningar" />
                  </span>
                  {activeCV.extracted_location ? <p className="mt-2 text-[13px] leading-[18px] text-[color:var(--vagg-mjuk)]">Ort i CV:t: {activeCV.extracted_location}</p> : null}
                </>
              ) : laserCv ? (
                <span className="flex flex-col gap-2">
                  <Skel vagg b="70%" h={26} />
                  <Skel vagg b="50%" h={14} />
                </span>
              ) : (
                <p className="text-[13px] leading-[18px] text-[color:var(--vagg-mjuk)]">Välj vilket CV vi ska matcha mot.</p>
              )}
            </VaggRuta>
            <VaggRuta
              rubrik="Så söker vi åt dig"
              lankar={
                <button type="button" onClick={openPrefs}>
                  Ändra
                </button>
              }
            >
              <span className="mt-3 flex flex-wrap gap-2">
                {prefsChips.map((c) => (
                  <VaggEtikett key={c}>{c}</VaggEtikett>
                ))}
              </span>
              <p className="mt-3 text-[13px] leading-[18px] text-[color:var(--vagg-mjuk)]">Det här styr vilka annonser vi tar med. Lönen visas aldrig för någon annan.</p>
            </VaggRuta>
          </div>
        }
      >
        <VaggText ogon={ogon} rubrik={rubrik} ingress={ingress} bredIngress />
        <div className="mt-3 flex flex-col gap-2 xl:hidden">
          <RutaRad
            rubrik={cvName}
            text={activeCV ? `${roles.length} roller, ${skills.length} kompetenser, ${educations.length} utbildningar` : undefined}
            handling={activeCV ? 'Byt CV' : 'Välj CV'}
            onClick={() => setCvSheetOpen(true)}
          />
          <RutaRad
            rubrik={orterText}
            text={`${omfattning}. Lön: ${prefs.min_salary !== null ? 'satt, visas aldrig för någon annan' : 'ej satt'}.`}
            handling="Ändra"
            onClick={openPrefs}
          />
        </div>
      </VaggHero>
    </JobbVagg>
  )

  /* ----- listan */

  const raderAttVisa = visaAlla || gratis ? oppnaRader : oppnaRader.slice(0, RADER_FORST)
  const fler = gratis ? 0 : oppnaRader.length - raderAttVisa.length
  const doldaUtanRad = Math.max(0, hiddenCount - redactedJobs.length)

  const lista = (
    <section aria-labelledby="traffar-rubrik" className="px-4 py-5 xl:py-5 xl:pl-5 xl:pr-[14px]">
      <div className="flex items-center justify-between gap-3">
        <h2 id="traffar-rubrik" className="j3-h2 xl:!text-[20px] xl:!leading-[26px]">
          {totalt === 1 ? 'Den bästa träffen' : `${totalt} bästa träffarna`}
        </h2>
        <TextLank liten onClick={() => setFilterSheetOpen(true)}>
          {countActiveFilters({ ...filters, sort: '' }) > 0 ? `Filter (${countActiveFilters({ ...filters, sort: '' })})` : 'Filter'}
        </TextLank>
      </div>
      <div className="my-3">
        <FilterRad
          sort
          etikett="Sortering"
          valt={SORT_VAL.find((s) => s.varde === filters.sort)?.id ?? 'relevans'}
          val={SORT_VAL.map((s) => ({ id: s.id, text: s.text }))}
          onVal={(id) => setFilters((f) => ({ ...f, sort: SORT_VAL.find((s) => s.id === id)?.varde ?? '' }))}
        />
      </div>
      {sedanTittade ? <p className="j3-fin mb-2">{sedanTittade}.</p> : null}
      {senastSokt ? (
        <p className="j3-fin mb-2" suppressHydrationWarning>
          Senast sökt {senastSokt}.{' '}
          <TextLank liten onClick={fetchJobs}>
            Sök igen
          </TextLank>
        </p>
      ) : null}
      {distantCount > 0 || !poolLaddad ? (
        <div className="mb-2">
          <Kryss checked={showDistantJobs} onChange={(e) => setShowDistantJobs(e.target.checked)}>
            {poolLaddad ? `Visa ${distantCount} jobb längre bort än 100 km` : 'Visa jobb längre bort än 100 km'}
          </Kryss>
        </div>
      ) : null}
      {waitingForRedaction || poolLaddar ? (
        <RadSkelett rader={3} />
      ) : (
        <TraffLista>
          {raderAttVisa.map((r) => {
            const id = r.id
            const sista = sistaAnsokningsdag(r.lat)
            return (
              <TraffRad
                key={id}
                procent={r.lat.score.score}
                titel={r.lat.headline}
                var={[r.lat.employer || 'Okänd arbetsgivare', r.lat.score.isRemote ? 'distans' : r.lat.municipality].filter(Boolean).join(', ')}
                skal={skalKort(r.lat.reasons)}
                dag={sista && !sista.passerad ? sista.text.replace(/^Sista dag [a-zåäö]+ /, 'Sista dag ') : undefined}
                snart={!!sista && !sista.passerad && sista.dagarKvar <= 7}
                ny={arNy(r.lat, initialData.seddaAt)}
                href={jobbHref(id)}
                vald={datorVal === r}
                onClick={valj(id)}
              />
            )
          })}
          {redactedJobs.map((d) => (
            <TraffRad key={d.placeholderId} procent={d.relevance ?? 0} href={jobbHref(d.placeholderId)} vald={valdDold?.placeholderId === d.placeholderId} onClick={valj(d.placeholderId)} />
          ))}
        </TraffLista>
      )}
      {fler > 0 ? (
        <div className="mt-3">
          <LitenKnapp bred storlek={48} onClick={() => setVisaAlla(true)}>
            Visa {fler} till
          </LitenKnapp>
        </div>
      ) : null}
      {gratis && hiddenCount > 0 ? (
        <>
          <div className="mt-4 xl:hidden">
            <Betalvagg hiddenCount={hiddenCount} />
          </div>
          <p className="j3-text mt-4">
            {doldaUtanRad > 0 ? (
              <>
                <b>{doldaUtanRad} träffar till är dolda.</b> Matchgraden syns, resten öppnas i Premium.
              </>
            ) : (
              'Matchgraden syns på de dolda träffarna, resten öppnas i Premium.'
            )}
          </p>
        </>
      ) : null}
      <p className="j3-fin mt-4">Matchgraden väger kravprofilens kompetenser mot ditt CV, dina roller, orten och hur färsk annonsen är.</p>
    </section>
  )

  /* ----- annonsen bredvid (dator) */

  const panelHoger = valdDold ? (
    <DoldPanel procent={valdDold.relevance ?? 0} hiddenCount={hiddenCount} />
  ) : datorVal ? (
    (() => {
      const job = helAnnons(datorVal)
      if (!job) return hamta(datorVal)
      const s = skalFor(datorVal, job)
      return <AnnonsPanel job={job} procent={s.score.score} skal={s.skal} sista={sistaAnsokningsdag(job)} handlingar={handlingarFor(job, s.score.score)} />
    })()
  ) : null

  /* ----- lägena utan träffar */

  const tomPanel = laserCv ? (
    <div className="flex flex-col gap-4">
      <TomtLage inbaddad ikon={<IkonDokument />} rubrik="Vi läser ditt CV" text="Vi plockar ut roller, kompetenser och utbildningar. Om en stund kan du söka." />
      <RadSkelett rader={3} />
    </div>
  ) : isLoading ? (
    <div className="flex flex-col gap-4" aria-live="polite">
      <TomtLage inbaddad ikon={<IkonSok />} rubrik="Vi läser Arbetsförmedlingens annonser" text="Det brukar ta 20 sekunder. Vi läser upp till 600 annonser mot ditt CV." />
      <RadSkelett rader={4} />
    </div>
  ) : error ? (
    <Felruta text={error} onForsok={fetchJobs} />
  ) : lasfel && !hasSearched ? (
    // Servern kunde inte läsa körningen (tidsgränsen). Kontot kan ha en
    // körning, så "Vi har inte letat än" vore fel; ett nytt försök läser om sidan.
    <Felruta text="Vi kunde inte hämta alla träffar just nu. Försök igen." onForsok={() => router.refresh()} />
  ) : hasSearched ? (
    <TomtLage
      inbaddad
      ikon={<IkonSok />}
      rubrik="Inget passade den här gången"
      text={[
        countActiveFilters(filters) > 0 ? 'Rensa ett filter.' : null,
        'Vidga orterna under Så söker vi åt dig.',
        prefs.min_salary !== null ? 'Sänk eller ta bort lägsta lön.' : null,
        'Rätta det vi läste ut ur ditt CV.',
      ]
        .filter(Boolean)
        .join(' ')}
      handling={<LitenKnapp onClick={fetchJobs}>Sök igen</LitenKnapp>}
    />
  ) : (
    <TomtLage
      inbaddad
      ikon={<IkonSok />}
      rubrik="Vi har inte letat än"
      text="Tryck här så läser vi igenom Arbetsförmedlingens annonser mot ditt CV."
      handling={
        <StorKnapp golv onClick={fetchJobs} disabled={!activeCV}>
          Hitta jobb som passar
          <IkonPil />
        </StorKnapp>
      }
    />
  )

  /* ----- telefonens annonsvy */

  const mobilVald = valdRad ?? null
  const mobilVy = mobilAnnons ? (
    <div className="xl:hidden">
      {valdDold ? (
        <>
          <JobbVagg hojd={0} hojdMobil={230} flik={false} tillbaka={{ href: JOBB_HREF, text: 'Matchade jobb' }} atgarder={atgarder}>
            <TjanstHuvud kod="" titel="Dold träff" arbetsgivare={`Matchar ditt CV till ${valdDold.relevance ?? 0} procent`} />
          </JobbVagg>
          <Golv>
            <LyftPanel>
              <DoldPassar procent={valdDold.relevance ?? 0} />
            </LyftPanel>
            <div className="mt-5">
              <Betalvagg hiddenCount={hiddenCount} />
            </div>
          </Golv>
        </>
      ) : mobilVald ? (
        (() => {
          const a = helAnnons(mobilVald)
          const l = mobilVald.lat
          // Väggen ritas ur listans rad, så den står kvar medan annonsen hämtas.
          const sista = sistaAnsokningsdag(l)
          const vagg = (
            <JobbVagg hojd={0} hojdMobil={230} flik={false} tillbaka={{ href: JOBB_HREF, text: 'Matchade jobb' }} atgarder={atgarder}>
              <TjanstHuvud kod={brickBokstaver(l.employer)} titel={l.headline} arbetsgivare={[l.employer, l.score.isRemote ? 'distans' : l.municipality].filter(Boolean).join(', ')} />
              {sista && !sista.passerad ? (
                <div className="mt-3">
                  <StatusPiller status={sista.dagarKvar <= 7 ? 'folj-upp' : 'vantar'}>{sista.text}</StatusPiller>
                </div>
              ) : null}
            </JobbVagg>
          )
          if (!a) {
            return (
              <>
                {vagg}
                <Golv>
                  <LyftPanel>{hamta(mobilVald)}</LyftPanel>
                </Golv>
              </>
            )
          }
          const s = skalFor(mobilVald, a)
          const url = a.application_details?.url || a.application_url || a.webpage_url
          return (
            <>
              {vagg}
              <Golv>
                <LyftPanel>
                  <AnnonsKortMobil job={a} procent={s.score.score} skal={s.skal} />
                </LyftPanel>
                <AnnonsInnehall job={a} />
                {url ? (
                  <p className="mt-6">
                    <TextLank href={url} extern>
                      {a.application_details?.via_af === true ? 'Ansök via Arbetsförmedlingen' : `Ansök hos ${a.employer?.name || 'arbetsgivaren'}`}
                    </TextLank>
                  </p>
                ) : null}
                <div className="mt-6">
                  <FastFot rader>
                    <AnnonsFotMobil job={a} handlingar={handlingarFor(a, s.score.score)} />
                  </FastFot>
                </div>
              </Golv>
            </>
          )
        })()
      ) : (
        <>
          <JobbVagg hojd={0} hojdMobil={200} flik={false} tillbaka={{ href: JOBB_HREF, text: 'Matchade jobb' }} atgarder={atgarder}>
            <VaggText rubrik="Annonsen finns inte i dina träffar" />
          </JobbVagg>
          <Golv>
            <LyftPanel>
              <TomtLage inbaddad text="Den kan ha tagits bort, eller hört till en äldre sökning." handling={<LitenKnapp href={JOBB_HREF}>Till alla träffar</LitenKnapp>} />
            </LyftPanel>
          </Golv>
        </>
      )}
    </div>
  ) : null

  return (
    <>
      {mobilVy}
      <div className={mobilAnnons ? 'hidden xl:block' : undefined}>
        {listVagg}
        <Golv>
          {harTraffar ? (
            <LyftPanel delad={432} etikett="Träffarna och annonsen">
              {lista}
              <div className="hidden xl:block">{panelHoger}</div>
            </LyftPanel>
          ) : (
            <LyftPanel>{tomPanel}</LyftPanel>
          )}
          {harTraffar && error ? (
            <div className="mt-4">
              <Felruta text={error} onForsok={fetchJobs} />
            </div>
          ) : null}
          <div className="mt-8 xl:hidden">
            <LitenKnapp storlek={52} bred href={LOGGA_HREF} ikon={<IkonPlus size={20} />}>
              Logga sökt tjänst
            </LitenKnapp>
          </div>
        </Golv>
      </div>

      <ByttCvArk
        open={cvSheetOpen}
        onClose={() => setCvSheetOpen(false)}
        cvs={cvs}
        activeCVId={activeCVId}
        activatingCVId={activatingCVId}
        lockedCvIds={lockedCvIds}
        onValj={(id) => {
          if (id === activeCVId) setCvSheetOpen(false)
          else void handleActivateCV(id)
        }}
      />
      <RattaArk
        open={fixSheetOpen}
        onClose={() => setFixSheetOpen(false)}
        roles={roles.map((r) => r.normalized)}
        skills={skills}
        harAndrat={droppedRoles.length > 0 || droppedSkills.length > 0}
        onTaBortRoll={(r) => setDroppedRoles((p) => [...p, r])}
        onTaBortKompetens={(s) => setDroppedSkills((p) => [...p, s])}
        onAngra={() => {
          setDroppedRoles([])
          setDroppedSkills([])
        }}
      />
      <PrefsArk open={prefsOpen} onClose={() => setPrefsOpen(false)} value={prefsDraft} onChange={setPrefsDraft} onSpara={savePreferences} sparar={prefsSaving} />
      <FilterArk open={filterSheetOpen} onClose={() => setFilterSheetOpen(false)} filters={filters} onChange={setFilters} userLocation={activeCV?.extracted_location} jobs={baseJobs} />
    </>
  )
}

/** Listans ordning: matchgraden (grund), nyast publicerad, eller närmast sista dag. */
function sortera(rader: Rad[], sort: Sortering): Rad[] {
  const t = (v: string | null) => (v ? Date.parse(v) : NaN)
  if (sort === 'pubdate-desc') return [...rader].sort((a, b) => (t(b.lat.publication_date) || 0) - (t(a.lat.publication_date) || 0))
  if (sort === 'applydate-asc') return [...rader].sort((a, b) => (t(a.lat.application_deadline) || Infinity) - (t(b.lat.application_deadline) || Infinity))
  return rader
}

/** En rad i listan: det listan ritar, och hela annonsen när den finns. */
interface Rad {
  id: string
  lat: LattRad
  job: Record<string, any> | null
}

/**
 * Pågående hämtningar per annons. På telefonen står samma annons både i
 * telefonvyn och i den dolda datorpanelen; båda ska dela en förfrågan, inte
 * ställa två (var och en kan läsa hela körningen på servern).
 */
const annonsHamtningar = new Map<string, Promise<Record<string, any> | null>>()

function hamtaAnnonsEnGang(id: string, nytt: boolean): Promise<Record<string, any> | null> {
  const pagar = nytt ? undefined : annonsHamtningar.get(id)
  if (pagar) return pagar
  const lofte = fetch(`/api/jobbmatchning/annons?id=${encodeURIComponent(id)}`)
    .then((r) => (r.ok ? r.json() : null))
    .then((j) => (j?.job ? (j.job as Record<string, any>) : null))
    .finally(() => {
      if (annonsHamtningar.get(id) === lofte) annonsHamtningar.delete(id)
    })
  annonsHamtningar.set(id, lofte)
  return lofte
}

/** Hämtar en annons som inte följde med sidan, och visar panelens skelett så länge. */
function HamtaAnnons({ id, onKlar }: { id: string; onKlar: (job: Record<string, any>) => void }) {
  const [fel, setFel] = useState(false)
  const [forsok, setForsok] = useState(0)
  useEffect(() => {
    let avbruten = false
    setFel(false)
    hamtaAnnonsEnGang(id, forsok > 0)
      .then((job) => {
        if (avbruten) return
        if (job) onKlar(job)
        else setFel(true)
      })
      .catch(() => {
        if (!avbruten) setFel(true)
      })
    return () => {
      avbruten = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, forsok])
  return (
    <div className="px-4 py-5 xl:px-[30px] xl:pb-[30px] xl:pt-[26px]" aria-busy={!fel}>
      {fel ? (
        <Felruta text="Vi kunde inte hämta annonsen just nu." onForsok={() => setForsok((n) => n + 1)} />
      ) : (
        <div className="flex flex-col gap-3" aria-hidden="true">
          <Skel b="60%" h={30} />
          <Skel b="35%" h={16} />
          <Skel h={180} stil={{ borderRadius: 20, marginTop: 12 }} />
          <Skel b="90%" h={12} stil={{ marginTop: 12 }} />
          <Skel b="95%" h={12} />
          <Skel b="70%" h={12} />
        </div>
      )}
    </div>
  )
}
