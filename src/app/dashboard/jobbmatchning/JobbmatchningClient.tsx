'use client';

/**
 * Dina matchningar (docs/plan-jobbmatchning.md, våg 1).
 *
 * Sidan var en engångssökning: välj CV, tryck en knapp, få en lista. Inget
 * visade vad som hände, ingenting knöt träffen till brevet, och preferenser
 * fanns inte. Nu är sidan en kedja som läses uppifrån och ned:
 *
 *   1. Ditt CV, det vi läste ut, med möjlighet att byta och rätta
 *   2. Så söker vi åt dig, alltså preferenserna från profilen
 *   3. Annonser vi läst, med antal och färskhet
 *   4. Träffarna, var och en med matchgrad och två till tre skäl
 *
 * Panelerna binds ihop av tråden (.thread-chain) så att de läses som ett
 * förlopp, inte som fem fristående kort.
 *
 * Matchningens motor är oförändrad. Jobben hämtas fortfarande av
 * edge-funktionen match-jobs, och vad gratisnivån får se avgörs fortfarande
 * av POST /api/jobs/redact på servern. Det som ändrats här är vad
 * användaren ser och förstår, inte vad hon får se.
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

import { useNotification } from '@/context/notificationcontext';

import JobMatchingOnboarding from './components/JobMatchingOnboarding';
import JobSearchLoader from './components/JobSearchLoader';
import JobFilterPanel, {
  type JobFilters,
  DEFAULT_FILTERS,
  countActiveFilters,
} from './components/JobFilterPanel';
import RedactedJobCard from './components/RedactedJobCard';
import MatchRow from './components/MatchRow';
import PaywallCard from '@/components/paywall/PaywallCard';
import PageHeader from '@/components/shell/PageHeader';
import EmptyState from '@/components/shell/EmptyState';
import FlowError from '@/components/shell/FlowError';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import Sheet from '@/components/shell/Sheet';
import ChoiceCard from '@/components/shell/ChoiceCard';
import MarginPlate from '@/components/shell/MarginPlate';
import JobPreferencesFields, {
  jobPreferenceChips,
} from '@/components/jobbmatchning/JobPreferencesFields';
import {
  IlluCvMotAnnonser,
  IlluTomSokning,
  IlluPlattaCvPoang,
} from '@/components/illustrations/TradenScener';
import { capture } from '@/lib/analytics/events';
import type { JobRedactionResult } from '@/app/api/jobs/redact/route';
import {
  applyClientFilters,
  applyPreferences,
  rankGlobalJobs,
} from './data/job-filtering';
import { SWEDISH_MUNICIPALITIES } from './data/swedish-municipalities';
import { senasteLabel } from './data/match-reasons';
import type { ActiveCVData, JobbmatchningData } from './getJobbmatchningData';
import { toJobPreferences, type JobPreferences } from '@/types/user.types';

/**
 * Detaljarket öppnas först när användaren klickar en träff och drar in hela
 * annonsvyn. Det laddas därför när det behövs, inte i sidans första paket.
 */
const JobDetailModal = dynamic(() => import('./components/JobDetailModal'), {
  ssr: false,
});

type AppliedState = 'idle' | 'saving' | 'done';

/**
 * Hur många suddade rader som ritas under de fulla träffarna. Nog för att
 * visa att listan fortsätter, få nog för att betalväggen ska gå att nå med
 * tummen. Antalet dolda står i betalväggens rubrik.
 */
const REDACTED_PREVIEW = 8;

export default function JobbmatchningClient({
  initialData,
}: {
  initialData: JobbmatchningData;
}) {
  const router = useRouter();
  const supabase = createClient();
  const { successWithMascotAndActivity } = useNotification();

  // Låsen räknades på servern med samma getActiveCvIds som useCvQuota använde.
  const lockedCvIds = useMemo(
    () => new Set(initialData.lockedCvIds),
    [initialData.lockedCvIds]
  );

  /* ------------------------------------------------------------ tillstånd */

  const [cvs] = useState(initialData.cvs);
  const [activeCV, setActiveCV] = useState<ActiveCVData | null>(
    initialData.activeCV
  );
  const [activeCVId, setActiveCVId] = useState<string | null>(
    initialData.activeCV?.cv_id ?? null
  );

  const [prefs, setPrefs] = useState<JobPreferences>(initialData.jobPreferences);
  // Arket redigerar ett utkast, så ett avbrutet ark inte ändrar profilen.
  const [prefsDraft, setPrefsDraft] = useState<JobPreferences>(
    initialData.jobPreferences
  );
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefsSaving, setPrefsSaving] = useState(false);

  const [cvSheetOpen, setCvSheetOpen] = useState(false);
  const [fixSheetOpen, setFixSheetOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Rättningar av det vi läste ut. Vi har inget stöd för att skriva tillbaka
  // till cv-raden (active_cv_for_matching är en vy över parse-resultatet), så
  // borttagningarna gäller den här sökningen och sparas inte. Det står i
  // arket, och är uppskrivet i rapporten.
  const [droppedRoles, setDroppedRoles] = useState<string[]>([]);
  const [droppedSkills, setDroppedSkills] = useState<string[]>([]);

  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showDistantJobs, setShowDistantJobs] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters] = useState<JobFilters>(DEFAULT_FILTERS);
  /** Antal annonser vi läst igenom, alltså före gallringen. */
  const [adsRead, setAdsRead] = useState(0);

  const [globalRemote, setGlobalRemote] = useState<any[] | null>(null);
  const [globalNoExp, setGlobalNoExp] = useState<any[] | null>(null);
  const [loadingGlobal, setLoadingGlobal] = useState(false);

  const [activatingCVId, setActivatingCVId] = useState<string | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedStates, setAppliedStates] = useState<Record<string, AppliedState>>(
    {}
  );

  /* -------------------------------------------------------------- mätning */

  const viewLogged = useRef(false);
  useEffect(() => {
    if (viewLogged.current) return;
    viewLogged.current = true;
    capture('match_page_viewed', {
      has_cv: cvs.length > 0,
      has_preferences:
        prefs.locations.length > 0 ||
        prefs.remote ||
        prefs.extent !== '' ||
        prefs.min_salary !== null,
    });
    // Bara vid första render: sidan visas en gång per besök.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const autoActivated = useRef(false);

  /* ------------------------------------------------------ det vi läste ut */

  const roles = useMemo(
    () =>
      (activeCV?.extracted_occupations ?? []).filter(
        (o) => !droppedRoles.includes(o.normalized)
      ),
    [activeCV, droppedRoles]
  );
  const skills = useMemo(
    () =>
      (activeCV?.extracted_skills ?? []).filter((s) => !droppedSkills.includes(s)),
    [activeCV, droppedSkills]
  );
  const educations = activeCV?.extracted_educations ?? [];
  const laserCv = activatingCVId !== null;
  const cvName =
    cvs.find((cv) => cv.id === (activeCVId ?? activatingCVId))?.file_name ??
    (laserCv ? 'Läser ditt CV' : 'Inget CV valt');

  /* -------------------------------------------------------- globala pooler */

  const cvContext = useCallback(() => {
    const loc = activeCV?.extracted_location?.toLowerCase().trim();
    const muni = loc
      ? SWEDISH_MUNICIPALITIES.find(
          (m) =>
            m.name.toLowerCase() === loc || loc.includes(m.name.toLowerCase())
        )
      : undefined;
    return {
      skills: activeCV?.extracted_skills || [],
      lat: muni?.lat ?? null,
      lon: muni?.lon ?? null,
    };
  }, [activeCV]);

  const loadGlobalPool = useCallback(
    async (cacheKey: 'remote' | 'no_experience') => {
      setLoadingGlobal(true);
      try {
        const { data, error: err } = await supabase
          .from('global_job_cache')
          .select('jobs')
          .eq('cache_key', cacheKey)
          .maybeSingle();
        if (err || !data) return;
        const ranked = rankGlobalJobs(data.jobs || [], cvContext());
        if (cacheKey === 'remote') setGlobalRemote(ranked);
        else setGlobalNoExp(ranked);
      } catch (err) {
        console.error(`Error loading global pool ${cacheKey}:`, err);
      } finally {
        setLoadingGlobal(false);
      }
    },
    [supabase, cvContext]
  );

  useEffect(() => {
    if (filters.remote && globalRemote === null) loadGlobalPool('remote');
    if (filters.noExperience && globalNoExp === null)
      loadGlobalPool('no_experience');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.remote, filters.noExperience]);

  const baseJobs: any[] = filters.noExperience
    ? globalNoExp || []
    : filters.remote
      ? globalRemote || []
      : jobs;
  const usingGlobalPool = filters.noExperience || filters.remote;

  // Preferenserna först, filtren sedan. Panelen "Så söker vi åt dig" står
  // ovanför listan, så listan får inte säga emot den.
  const filteredJobs = useMemo(
    () =>
      applyClientFilters(
        applyPreferences(baseJobs, prefs),
        filters,
        showDistantJobs
      ),
    [baseJobs, prefs, filters, showDistantJobs]
  );

  /* ------------------------------------------------------------ suddningen */

  const [redaction, setRedaction] = useState<JobRedactionResult | null>(null);

  useEffect(() => {
    if (filteredJobs.length === 0) {
      setRedaction(null);
      return;
    }
    let cancelled = false;
    const payload = filteredJobs.map((j: any) => ({
      id: j.id,
      relevance: j.relevance,
    }));

    fetch('/api/jobs/redact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobs: payload }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: JobRedactionResult | null) => {
        if (!cancelled && data) setRedaction(data);
      })
      .catch(() => {
        /* utan svar visar vi inget suddat, aldrig mer än vi får */
      });

    return () => {
      cancelled = true;
    };
  }, [filteredJobs]);

  /* ------------------------------------------------------------ hämtningar */

  const fetchActiveCV = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error: err } = await supabase
        .from('active_cv_for_matching')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (err) {
        console.error('Error fetching active CV:', err);
        return;
      }
      if (data) {
        setActiveCV(data);
        setActiveCVId(data.cv_id);
      }
    } catch (err) {
      console.error('Error fetching active CV:', err);
    }
  };

  const handleActivateCV = async (cvId: string) => {
    setActivatingCVId(cvId);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('Du måste vara inloggad');

      const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/parse-cv-for-matching`;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cvId, userId: session.user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunde inte aktivera CV');
      }

      const result = await response.json();
      if (result.success) {
        // Ett nytt CV betyder ett nytt underlag: gamla träffar och gamla
        // rättningar hör inte längre ihop med det som står i panelen.
        setDroppedRoles([]);
        setDroppedSkills([]);
        setJobs([]);
        setHasSearched(false);
        await fetchActiveCV();
        setCvSheetOpen(false);
      }
    } catch (err) {
      console.error('Error activating CV:', err);
      setError(
        err instanceof Error ? err.message : 'Ett fel uppstod vid CV-aktivering'
      );
    } finally {
      setActivatingCVId(null);
    }
  };

  /**
   * Sidan lovar i sin egen ingress att vi läser CV:t. Då ska användaren inte
   * behöva trycka på en aktiveringsknapp först.
   *
   * Har hon laddat upp ett CV men inget är inläst ännu läser vi det senaste
   * automatiskt. Det var precis det som fällde vyn i klicktestet: CV:t fanns,
   * panelen sa "Inget CV valt", och primärknappen stod låst utan att något
   * förklarade varför. Har hon flera CV tar vi det senaste, och "Byt CV"
   * finns kvar för den som vill något annat.
   */
  useEffect(() => {
    if (autoActivated.current) return;
    if (activeCV || cvs.length === 0) return;

    const forsta = cvs.find((cv) => !lockedCvIds.has(cv.id));
    if (!forsta) return;

    autoActivated.current = true;
    void handleActivateCV(forsta.id);
    // Körs en gång, när sidan öppnas utan inläst CV.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCV, cvs, lockedCvIds]);

  const fetchJobs = async () => {
    if (!activeCVId && !activeCV) {
      setError('Välj ett CV först, så vet vi vad vi ska leta efter.');
      return;
    }

    setLoadingJobs(true);
    setHasSearched(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('Du måste vara inloggad');

      const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/match-jobs`;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: session.user.id }),
        signal: AbortSignal.timeout(160000),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Kunde inte hämta jobbannonser');
      }

      const data = await response.json();

      if (data.success) {
        const funna = data.jobs || [];
        setJobs(funna);
        setHasMore(data.hasMore || false);

        // Hur många annonser vi faktiskt läst igenom. Edge-funktionen svarar
        // med olika fält beroende på om svaret kom ur cachen eller inte, så
        // vi tar det bredaste tal som finns och faller tillbaka på listan.
        const lasta =
          data.totalScanned ??
          data.totalAvailable ??
          data.totalResults ??
          funna.length;
        setAdsRead(lasta);

        capture('match_search_run', {
          ads_read: lasta,
          matches: funna.length,
          custom_query: false,
        });

        if (funna.length > 0) {
          successWithMascotAndActivity(
            `Vi hittade ${funna.length} jobb som passar dig.`,
            'jobs-found',
            'jobs_searched',
            'sökte matchande jobb',
            { jobs_count: funna.length, search_query: 'auto', cv_id: activeCVId },
            4000
          );
        }
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      if (err instanceof DOMException && err.name === 'TimeoutError') {
        setError(
          'Sökningen tog längre tid än väntat. Försök igen, andra försöket går oftast snabbt.'
        );
      } else {
        setError(
          err instanceof Error ? err.message : 'Ett fel uppstod. Försök igen.'
        );
      }
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchMoreJobs = useCallback(
    async (offset: number, limit: number) => {
      if (loadingMore) return;
      setLoadingMore(true);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/match-jobs`;
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: session.user.id, offset, limit }),
        });

        if (!response.ok) return;
        const data = await response.json();

        if (data.success && data.jobs?.length > 0) {
          setJobs((prev) => {
            const seen = new Set(prev.map((j) => j.id));
            const fresh = data.jobs.filter((j: any) => !seen.has(j.id));
            return [...prev, ...fresh];
          });
          setHasMore(data.hasMore || false);
        }
      } catch (err) {
        console.error('Error fetching more jobs:', err);
      } finally {
        setLoadingMore(false);
      }
    },
    [loadingMore, supabase]
  );

  useEffect(() => {
    if (hasMore && jobs.length === 50) fetchMoreJobs(50, 550);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, jobs.length]);

  /* ------------------------------------------------------------ handlingar */

  const savePreferences = async () => {
    setPrefsSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('Du måste vara inloggad');

      const { error: err } = await supabase
        .from('profiles')
        .update({
          job_preferences: prefsDraft,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (err) throw err;

      setPrefs(prefsDraft);
      setPrefsOpen(false);
      capture('match_preferences_saved', {
        source: 'matchningar',
        locations: prefsDraft.locations.length,
        remote: prefsDraft.remote,
        extent: prefsDraft.extent,
        // Bara att fältet är ifyllt. Beloppet lämnar aldrig vår sida.
        has_min_salary: prefsDraft.min_salary !== null,
      });
    } catch (err) {
      console.error('Kunde inte spara preferenser:', err);
      setError('Preferenserna sparades inte. Försök igen.');
    } finally {
      setPrefsSaving(false);
    }
  };

  const openPrefs = () => {
    setPrefsDraft(toJobPreferences(prefs));
    setPrefsOpen(true);
  };

  const handleOpenJob = (job: Record<string, any>) => {
    setSelectedJob(job);
    capture('match_viewed', {
      job_id: String(job.id ?? ''),
      relevance:
        typeof job.relevance === 'number' ? Math.round(job.relevance) : undefined,
    });
  };

  const handleWriteLetter = async (job: Record<string, any>) => {
    capture('match_letter_started', {
      job_id: String(job.id ?? ''),
      relevance:
        typeof job.relevance === 'number' ? Math.round(job.relevance) : undefined,
    });

    // Prefill-mekanismen är oförändrad: sessionStorage skrivs synkront här
    // och läses synkront av skapa-brev vid första mount.
    const { coverLetterPrefill } = await import('@/store/cover-letter-store');
    const annonsUrl =
      job.application_details?.url || job.application_url || job.webpage_url;

    coverLetterPrefill.set({
      cvId: activeCVId || '',
      jobTitle: String(job.headline ?? ''),
      company: job.employer?.name || '',
      jobDescription: buildJobText(job),
      jobAdUrl: annonsUrl || undefined,
    });

    router.push('/dashboard/skapa-brev');
  };

  const handleMarkApplied = async (job: Record<string, any>) => {
    const id = String(job.id ?? '');
    if (appliedStates[id] && appliedStates[id] !== 'idle') return;

    setAppliedStates((prev) => ({ ...prev, [id]: 'saving' }));
    try {
      const annonsUrl =
        job.application_details?.url || job.application_url || job.webpage_url;
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
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      setAppliedStates((prev) => ({ ...prev, [id]: 'done' }));
      capture('match_applied', { job_id: id });
    } catch (err) {
      console.error('Kunde inte markera som sökt:', err);
      setAppliedStates((prev) => ({ ...prev, [id]: 'idle' }));
    }
  };

  /* ------------------------------------------------------------------- vy */

  // Utan CV är sidan obegriplig. Grinden är fortsatt mjuk: introduktionen
  // förklarar vad funktionen är i stället för att skicka iväg användaren.
  if (cvs.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[720px] space-y-4 pb-16 sm:space-y-6">
        <PageHeader
          title="Dina matchningar"
          description="Vi läser ditt CV och letar bland Arbetsförmedlingens annonser efter jobb som passar dig."
        />
        <JobMatchingOnboarding />
      </div>
    );
  }

  const isLoading = loadingJobs || (usingGlobalPool && loadingGlobal);

  const visibleIds = redaction ? new Set(redaction.visibleIds) : null;
  const displayedJobs = redaction?.isPremium
    ? filteredJobs
    : visibleIds
      ? filteredJobs.filter((j: any) => visibleIds.has(String(j.id)))
      : // Innan serverns svar kommit visar vi inget: aldrig mer än vi får.
        [];
  const redactedJobs = redaction?.redacted ?? [];
  const distantCount = baseJobs.filter(
    (j) => j.distance && j.distance > 100
  ).length;

  const senaste = senasteLabel(filteredJobs);
  const chips = jobPreferenceChips(prefs);

  return (
    <div className="mx-auto w-full max-w-[720px] pb-16">
      <PageHeader
        title="Dina matchningar"
        description="Vi läser ditt CV och letar bland Arbetsförmedlingens annonser efter jobb som passar dig."
      />

      {/* Kedjan: panelerna hänger ihop med tråden och läses som ett förlopp. */}
      <div className="thread-chain mt-4 space-y-4 sm:mt-6 sm:space-y-6">
        {/* 1. Ditt CV ------------------------------------------------------ */}
        <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <MarginPlate>
              <IlluPlattaCvPoang size={48} />
            </MarginPlate>
            <div className="min-w-0 flex-1">
              <h2 className="text-kort text-ink-1">Ditt CV</h2>
              <p className="mt-0.5 truncate text-meta text-ink-3">{cvName}</p>
            </div>
          </div>

          {/* Höjden är densamma vare sig CV:t läses eller är läst, så raderna
              under står stilla när talen landar. CLS ska vara noll. */}
          <div className="min-h-[104px]">
          {activeCV ? (
            <>
              <div className="mt-4 flex gap-6">
                <div>
                  <div className="text-tal tabular-nums text-ink-1">
                    {roles.length}
                  </div>
                  <div className="text-meta text-ink-3">roller</div>
                </div>
                <div>
                  <div className="text-tal tabular-nums text-ink-1">
                    {skills.length}
                  </div>
                  <div className="text-meta text-ink-3">kompetenser</div>
                </div>
                <div>
                  <div className="text-tal tabular-nums text-ink-1">
                    {educations.length}
                  </div>
                  <div className="text-meta text-ink-3">utbildningar</div>
                </div>
              </div>

              {activeCV.extracted_location && (
                <p className="mt-2 text-meta text-ink-3">
                  Ort i CV:t: {activeCV.extracted_location}
                </p>
              )}
            </>
          ) : laserCv ? (
            <div className="mt-4">
              <LoadingSkeleton
                variant="writing"
                label="Läser ditt CV"
                meta="Vi plockar ut roller, kompetenser och utbildningar"
              />
            </div>
          ) : (
            <p className="mt-3 text-sm leading-[22px] text-ink-2">
              Välj vilket CV vi ska matcha mot, så läser vi ut roller och
              kompetenser ur det.
            </p>
          )}
          </div>

          <div className="mt-4 flex flex-wrap gap-5">
            <button
              type="button"
              onClick={() => setCvSheetOpen(true)}
              className="text-sm font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark hover:decoration-ink-1"
            >
              {activeCV ? 'Byt CV' : 'Välj CV'}
            </button>
            {activeCV && (
              <button
                type="button"
                onClick={() => setFixSheetOpen(true)}
                className="text-sm font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark hover:decoration-ink-1"
              >
                Rätta
              </button>
            )}
          </div>
        </section>

        {/* 2. Så söker vi åt dig -------------------------------------------- */}
        <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-kort text-ink-1">Så söker vi åt dig</h2>
              <p className="mt-0.5 text-meta text-ink-3">
                Det här styr vilka annonser vi tar med.
              </p>
            </div>
            <button
              type="button"
              onClick={openPrefs}
              className="shrink-0 text-sm font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark hover:decoration-ink-1"
            >
              Ändra
            </button>
          </div>

          <ul className="mt-3 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <li
                key={chip}
                className="rounded-md border border-kant bg-panel px-3 py-1.5 text-sm text-ink-1"
              >
                {chip}
              </li>
            ))}
          </ul>
        </section>

        {/* 3. Annonser vi läst ---------------------------------------------- */}
        <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
          <h2 className="text-kort text-ink-1">Annonser vi läst</h2>

          {isLoading ? (
            <div className="mt-4">
              <LoadingSkeleton
                variant="writing"
                label="Läser annonser"
                meta="Brukar ta 20 sekunder"
              />
              <div className="mt-4">
                <JobSearchLoader isSearching jobsFound={null} error={null} />
              </div>
            </div>
          ) : hasSearched && filteredJobs.length > 0 ? (
            <p className="mt-2 text-sm leading-[22px] text-ink-2">
              <span className="tabular-nums text-ink-1">
                {adsRead.toLocaleString('sv-SE')}
              </span>{' '}
              annonser lästa,{' '}
              <span className="tabular-nums text-ink-1">
                {filteredJobs.length}
              </span>{' '}
              passar dig
              {senaste ? `, senaste ${senaste}` : ''}.
            </p>
          ) : hasSearched ? (
            <div className="mt-3">
              <EmptyState
                bare
                illustration={IlluTomSokning}
                title="Inga annonser passade den här gången"
                description={
                  countActiveFilters(filters) > 0
                    ? 'Prova att rensa ett filter, eller vidga orterna under Så söker vi åt dig.'
                    : 'Vidga orterna under Så söker vi åt dig, eller sök igen om en stund.'
                }
                action={
                  <button
                    type="button"
                    onClick={fetchJobs}
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover"
                  >
                    Sök igen
                  </button>
                }
              />
            </div>
          ) : (
            /* Tomt tillstånd, men inte som EmptyState: scenen står bredvid
               texten i stället för ovanför den. Staplat tryckte
               primärknappen 68 px under vikten på en Pixel 7 med
               e-postbandet uppe, och sidans enda knapp ska nås utan
               scroll. Bredvid varandra ryms både scenen och knappen. */
            <div className="mt-3 flex items-center gap-4">
              <span
                className="shrink-0 text-ink-1"
                aria-hidden="true"
              >
                <IlluCvMotAnnonser size={104} />
              </span>

              <div className="min-w-0">
                <p className="text-kort text-ink-1">Vi har inte letat än</p>
                <p className="mt-1 text-sm leading-[22px] text-ink-2">
                  {laserCv
                    ? 'Vi läser ditt CV först. Om en stund kan du söka.'
                    : 'Tryck här så läser vi igenom Arbetsförmedlingens annonser.'}
                </p>
                <button
                  type="button"
                  onClick={fetchJobs}
                  disabled={!activeCV}
                  className="mt-3 inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover disabled:opacity-40"
                >
                  {laserCv ? 'Läser ditt CV' : 'Hitta jobb som passar'}
                </button>
              </div>
            </div>
          )}
        </section>

        {error && !isLoading && (
          <FlowError message={error} onRetry={fetchJobs} />
        )}

        {/* 4. Träfflistan ---------------------------------------------------- */}
        {!isLoading && hasSearched && filteredJobs.length > 0 && (
          <section className="rounded-xl border border-kant bg-panel">
            <div className="flex items-center justify-between gap-4 border-b border-kant px-4 py-3">
              <p className="text-sm font-medium text-ink-3">
                <span className="tabular-nums">{filteredJobs.length}</span>{' '}
                träffar
              </p>
              <button
                type="button"
                onClick={() => setFilterSheetOpen(true)}
                className="text-sm font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark hover:decoration-ink-1"
              >
                Filter
                {countActiveFilters(filters) > 0
                  ? ` (${countActiveFilters(filters)})`
                  : ''}
              </button>
            </div>

            {distantCount > 0 && (
              <label className="flex min-h-11 cursor-pointer items-center gap-2 border-b border-kant px-4 py-2">
                <input
                  type="checkbox"
                  checked={showDistantJobs}
                  onChange={(e) => setShowDistantJobs(e.target.checked)}
                  className="h-4 w-4 rounded border-kant-stark accent-[var(--ink-1)]"
                />
                <span className="text-meta text-ink-2">
                  Visa {distantCount} jobb längre bort än 100 km
                </span>
              </label>
            )}

            <div className="divide-y divide-kant">
              {displayedJobs.map((job: any, i: number) => (
                <MatchRow
                  key={job.id}
                  job={job}
                  cv={activeCV}
                  position={i + 1}
                  onOpen={handleOpenJob}
                  onWriteLetter={handleWriteLetter}
                  onMarkApplied={handleMarkApplied}
                  appliedState={appliedStates[String(job.id)] ?? 'idle'}
                />
              ))}
            </div>

            {/* Suddade rader visar att träffarna finns, men bara ett tiotal.
                Med alla utskrivna hamnade betalväggen hundratals rader ned,
                utom räckhåll på en telefon, och då säljer den ingenting.
                Antalet står i betalväggens egen rubrik i stället. */}
            {redactedJobs.length > 0 && (
              <div className="divide-y divide-kant border-t border-kant">
                {redactedJobs.slice(0, REDACTED_PREVIEW).map((job) => (
                  <RedactedJobCard key={job.placeholderId} job={job} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Betalväggen under listan, aldrig i stället för den. */}
        {!isLoading && redactedJobs.length > 0 && (
          <PaywallCard variant="jobbtraffar" hiddenCount={redactedJobs.length} />
        )}
      </div>

      {/* ------------------------------------------------------------- ark */}

      {/* Byt CV */}
      <Sheet
        open={cvSheetOpen}
        onClose={() => setCvSheetOpen(false)}
        title="Byt CV"
        description="Matchningen utgår från det CV du väljer här."
      >
        <div role="radiogroup" aria-label="Välj CV" className="space-y-2">
          {cvs.map((cv) => {
            const locked = lockedCvIds.has(cv.id);
            return (
              <ChoiceCard
                key={cv.id}
                selected={cv.id === activeCVId}
                onSelect={() => {
                  if (locked || activatingCVId) return;
                  if (cv.id === activeCVId) {
                    setCvSheetOpen(false);
                    return;
                  }
                  void handleActivateCV(cv.id);
                }}
                title={cv.file_name}
                meta={
                  locked
                    ? 'Låst av CV-kvoten'
                    : activatingCVId === cv.id
                      ? 'Läser CV:t'
                      : new Date(cv.created_at).toLocaleDateString('sv-SE')
                }
              />
            );
          })}
        </div>
      </Sheet>

      {/* Rätta det vi läste ut */}
      <Sheet
        open={fixSheetOpen}
        onClose={() => setFixSheetOpen(false)}
        title="Rätta det vi läste ut"
        description="Ta bort det som inte stämmer, så söker vi inte på det. Ändringarna gäller den här sökningen."
      >
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-ink-1">Roller</p>
            {roles.length === 0 ? (
              <p className="mt-1 text-meta text-ink-3">
                Inga roller kvar. Byt CV om det blev fel.
              </p>
            ) : (
              <ul className="mt-2 flex flex-wrap gap-2">
                {roles.map((role) => (
                  <li key={role.normalized}>
                    <button
                      type="button"
                      onClick={() =>
                        setDroppedRoles((prev) => [...prev, role.normalized])
                      }
                      aria-label={`Ta bort ${role.normalized}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-md border border-kant bg-panel px-3 text-sm text-ink-1 hover:border-kant-stark hover:bg-insunken"
                    >
                      {role.normalized}
                      <span aria-hidden="true" className="text-ink-3">
                        ×
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-ink-1">Kompetenser</p>
            {skills.length === 0 ? (
              <p className="mt-1 text-meta text-ink-3">
                Inga kompetenser kvar. Byt CV om det blev fel.
              </p>
            ) : (
              <ul className="mt-2 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <li key={skill}>
                    <button
                      type="button"
                      onClick={() =>
                        setDroppedSkills((prev) => [...prev, skill])
                      }
                      aria-label={`Ta bort ${skill}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-md border border-kant bg-panel px-3 text-sm text-ink-1 hover:border-kant-stark hover:bg-insunken"
                    >
                      {skill}
                      <span aria-hidden="true" className="text-ink-3">
                        ×
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {(droppedRoles.length > 0 || droppedSkills.length > 0) && (
            <button
              type="button"
              onClick={() => {
                setDroppedRoles([]);
                setDroppedSkills([]);
              }}
              className="text-sm font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark hover:decoration-ink-1"
            >
              Ångra alla borttagningar
            </button>
          )}
        </div>
      </Sheet>

      {/* Så söker vi åt dig */}
      <Sheet
        open={prefsOpen}
        onClose={() => setPrefsOpen(false)}
        title="Så söker vi åt dig"
        description="Sparas på din profil och används i varje sökning."
        size="lg"
        footer={
          <button
            type="button"
            onClick={savePreferences}
            disabled={prefsSaving}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover disabled:opacity-40"
          >
            {prefsSaving ? 'Sparar' : 'Spara'}
          </button>
        }
      >
        <JobPreferencesFields value={prefsDraft} onChange={setPrefsDraft} />
      </Sheet>

      {/* Filter */}
      <Sheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        title="Filter"
        description="Gäller de träffar vi redan hämtat, ingen ny sökning."
        size="lg"
      >
        <JobFilterPanel
          filters={filters}
          onChange={setFilters}
          userLocation={activeCV?.extracted_location}
          jobs={baseJobs}
        />
      </Sheet>

      {/* Hela annonsen i ett ark */}
      <JobDetailModal
        job={selectedJob}
        cvId={activeCVId || undefined}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
}

/**
 * Annonstexten som går med till brevflödet. Samma sammanställning som
 * detaljarket gör, men lyft hit så att "Skriv brev" i listan ger brevet
 * exakt samma underlag som "Skriv brev" inne i arket.
 */
function buildJobText(job: Record<string, any>): string {
  const delar: string[] = [];
  if (job.headline) delar.push(String(job.headline));
  if (job.employer?.name) delar.push(`Arbetsgivare: ${job.employer.name}`);

  const ort =
    job.workplace_address?.municipality || job.workplace_address?.region;
  if (ort) delar.push(`Ort: ${ort}`);

  const text = job.description?.text ?? job.description?.text_formatted ?? '';
  if (text) delar.push(String(text));

  return delar.join('\n\n');
}
