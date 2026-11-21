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
import { JOBB_HREF, brickBokstaver, dagFor, idagSv, jobbHref, narText, ordtal, soktaHref, sistaAnsokningsdag, sparadFranAnnons } from '@/lib/jobbsok'
import { capture } from '@/lib/analytics/events'
import { requestInstallPrompt } from '@/lib/pwa/installPrompt'
import type { JobRedactionResult } from '@/app/api/jobs/redact/route'
import { applyClientFilters, applyPreferences, rankGlobalJobs } from '@/app/dashboard/jobbmatchning/data/job-filtering'
import { DEFAULT_FILTERS, countActiveFilters, type JobFilters } from '@/app/dashboard/jobbmatchning/data/filter-standard'
import { SWEDISH_MUNICIPALITIES } from '@/app/dashboard/jobbmatchning/data/swedish-municipalities'
import { buildMatchReasons, senastSoktLabel } from '@/app/dashboard/jobbmatchning/data/match-reasons'
import { rankMatches, TOP_N } from '@/app/dashboard/jobbmatchning/data/match-ranking'
import type { ActiveCVData, JobbmatchningData } from '@/app/dashboard/jobbmatchning/getJobbmatchningData'
import type { SenasteKorning } from '@/app/dashboard/jobbmatchning/senasteKorning'
import { toJobPreferences, type JobPreferences } from '@/types/user.types'
import { arNy, arbetsgivareOrt, brevUnderlag, passarSkal, skalKort } from './annons'
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
  userId,
}: {
  initialData: JobbmatchningData
  korning: SenasteKorning | null
  userId: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { successWithMascotAndActivity } = useNotification()

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
  const [jobs, setJobs] = useState<any[]>(franServern?.jobs ?? [])
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

  /* ----------------------------------------------- senaste sökningen lokalt */

  const saveSearch = useCallback(
    (nyaJobs: any[], lasta: number, mer: boolean) => {
      if (!activeCVId || nyaJobs.length === 0) return
      try {
        const payload: SavedSearch = { jobs: nyaJobs.slice(0, SAVED_SEARCH_MAX_JOBS), adsRead: lasta, hasMore: mer, savedAt: Date.now(), cvId: activeCVId }
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
      setJobs(saved.jobs)
      setAdsRead(saved.adsRead ?? saved.jobs.length)
      setHasSearched(true)
      setRestoredAt(saved.savedAt)
      setLastRedaktion(false)
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

  const filteredJobs = useMemo(() => applyClientFilters(applyPreferences(baseJobs, prefs), filters, showDistantJobs), [baseJobs, prefs, filters, showDistantJobs])

  /* ------------------------------------------------------------ matchgraden */

  const { ranked } = useMemo(() => rankMatches(filteredJobs, activeCV, prefs.locations, TOP_N), [filteredJobs, activeCV, prefs.locations])

  const scoreById = useMemo(() => {
    const m = new Map<string, (typeof ranked)[number]['score']>()
    for (const r of ranked) m.set(String(r.job.id), r.score)
    return m
  }, [ranked])

  useEffect(() => {
    if (!hasSearched || loadingJobs || ranked.length === 0) return
    if (restoredAt !== null) return
    saveSearch(
      ranked.map((r) => r.job),
      adsRead,
      hasMore
    )
  }, [hasSearched, loadingJobs, ranked, restoredAt, adsRead, hasMore, saveSearch])

  /* ------------------------------------------------------------ suddningen */

  const [redaction, setRedaction] = useState<JobRedactionResult | null>(franServern?.redaction ?? null)
  const [redactionAsked, setRedactionAsked] = useState(Boolean(franServern))
  /**
   * Gratisnivån från servern har bara de tre öppna annonserna. Suddningen är
   * då redan uträknad där och får inte räknas om på de tre (betalväggen
   * skulle försvinna). Låset släpper vid en ny sökning.
   */
  const [lastRedaktion, setLastRedaktion] = useState(Boolean(franServern?.trimmad))

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
        setLastRedaktion(false)
        setJobs(funna)
        setHasMore(data.hasMore || false)
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
      const job = jobs.find((j) => String(j.id) === id)
      if (job) capture('match_viewed', { job_id: id, relevance: typeof job.relevance === 'number' ? Math.round(job.relevance) : undefined })
    }
  }

  // ?skriv=1 från Översikt (Skriv brev på ett träffkort): öppna brevet för den valda annonsen direkt.
  const skrivKord = useRef(false)
  useEffect(() => {
    if (skrivKord.current || searchParams.get('skriv') !== '1') return
    const id = searchParams.get('annons')
    const job = id ? jobs.find((j) => String(j.id) === id) : null
    if (!job) return
    skrivKord.current = true
    void handleWriteLetter(job)
  }, [searchParams, jobs, handleWriteLetter])

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

  const visibleIds = redaction ? new Set(redaction.visibleIds) : null
  const displayedJobs = redaction?.isPremium ? ranked : visibleIds ? ranked.filter((r) => visibleIds.has(String(r.job.id))) : []
  const redactedJobs = redaction?.redacted ?? []
  const hiddenCount = redaction?.hiddenCount ?? 0
  const waitingForRedaction = ranked.length > 0 && !redactionAsked
  const fallbackJobs = redactionAsked && !redaction ? ranked.slice(0, FREE_TIER_FALLBACK_LIMIT) : []
  const oppnaRader = sortera(displayedJobs.length > 0 ? displayedJobs : fallbackJobs, filters.sort as Sortering)
  const totalt = redaction ? redaction.visibleIds.length + redaction.hiddenCount : ranked.length
  const gratis = redaction ? !redaction.isPremium : false
  const distantCount = baseJobs.filter((j) => j.distance && j.distance > 100).length
  const nyaAntal = oppnaRader.filter((r) => arNy(r.job, initialData.seddaAt)).length
  const idag = idagSv()
  const senastDag = restoredAt ? dagFor(new Date(restoredAt)) : idag
  const senastSokt = senastSoktLabel(restoredAt)

  // Den valda annonsen: adressens, annars den första på dator.
  const valdDold = annonsId?.startsWith('dold-') ? redactedJobs.find((r) => r.placeholderId === annonsId) ?? null : null
  const valdRad = annonsId && !valdDold ? oppnaRader.find((r) => String(r.job.id) === annonsId) ?? null : null
  const datorVal = valdRad ?? (valdDold ? null : oppnaRader[0] ?? null)
  const mobilAnnons = Boolean(annonsId) && !isLoading

  const skalFor = (job: Record<string, any>) => {
    const score = scoreById.get(String(job.id)) ?? buildMatchReasons(job, activeCV, prefs.locations).score
    return { score, ...passarSkal(job, activeCV, prefs.locations, score) }
  }
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

  /* ----- väggen */

  const harTraffar = hasSearched && !isLoading && ranked.length > 0
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
          {totalt} bästa träffarna
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
      {senastSokt ? (
        <p className="j3-fin mb-2" suppressHydrationWarning>
          Senast sökt {senastSokt}.{' '}
          <TextLank liten onClick={fetchJobs}>
            Sök igen
          </TextLank>
        </p>
      ) : null}
      {distantCount > 0 ? (
        <div className="mb-2">
          <Kryss checked={showDistantJobs} onChange={(e) => setShowDistantJobs(e.target.checked)}>
            Visa {distantCount} jobb längre bort än 100 km
          </Kryss>
        </div>
      ) : null}
      {waitingForRedaction ? (
        <RadSkelett rader={3} />
      ) : (
        <TraffLista>
          {raderAttVisa.map((r) => {
            const id = String(r.job.id)
            const sista = sistaAnsokningsdag(r.job)
            const { reasons } = buildMatchReasons(r.job, activeCV, prefs.locations, scoreById.get(id) ?? r.score)
            return (
              <TraffRad
                key={id}
                procent={r.score.score}
                titel={String(r.job.headline ?? '')}
                var={arbetsgivareOrt(r.job, r.score.isRemote)}
                skal={skalKort(reasons)}
                dag={sista && !sista.passerad ? sista.text.replace(/^Sista dag [a-zåäö]+ /, 'Sista dag ') : undefined}
                snart={!!sista && !sista.passerad && sista.dagarKvar <= 7}
                ny={arNy(r.job, initialData.seddaAt)}
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
      const s = skalFor(datorVal.job)
      return <AnnonsPanel job={datorVal.job} procent={s.score.score} skal={s.skal} sista={sistaAnsokningsdag(datorVal.job)} handlingar={handlingarFor(datorVal.job, s.score.score)} />
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
          const s = skalFor(mobilVald.job)
          const sista = sistaAnsokningsdag(mobilVald.job)
          const a = mobilVald.job
          const url = a.application_details?.url || a.application_url || a.webpage_url
          return (
            <>
              <JobbVagg hojd={0} hojdMobil={230} flik={false} tillbaka={{ href: JOBB_HREF, text: 'Matchade jobb' }} atgarder={atgarder}>
                <TjanstHuvud kod={brickBokstaver(String(a.employer?.name ?? ''))} titel={String(a.headline ?? '')} arbetsgivare={arbetsgivareOrt(a)} />
                {sista && !sista.passerad ? (
                  <div className="mt-3">
                    <StatusPiller status={sista.dagarKvar <= 7 ? 'folj-upp' : 'vantar'}>{sista.text}</StatusPiller>
                  </div>
                ) : null}
              </JobbVagg>
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
                  <FastFot>
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
function sortera<T extends { job: Record<string, any> }>(rader: T[], sort: Sortering): T[] {
  if (sort === 'pubdate-desc') return [...rader].sort((a, b) => (Date.parse(b.job.publication_date) || 0) - (Date.parse(a.job.publication_date) || 0))
  if (sort === 'applydate-asc') return [...rader].sort((a, b) => (Date.parse(a.job.application_deadline) || Infinity) - (Date.parse(b.job.application_deadline) || Infinity))
  return rader
}
