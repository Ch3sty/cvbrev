'use client';

/**
 * Jobbmatchningens interaktiva del.
 *
 * CV-listan, låsen och det aktiverade CV:t kommer färdiga som props från
 * page.tsx, som läste dem på servern. Ingen spinner vid mount, ingen
 * hämtningskedja: första HTML innehåller CV-korten.
 *
 * Själva matchningen är oförändrad. Jobben hämtas fortfarande av
 * edge-funktionen match-jobs när användaren söker, och vad gratisnivån får se
 * avgörs fortfarande av POST /api/jobs/redact på servern.
 */

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';

import { useNotification } from '@/context/notificationcontext';

// Components
import CVActivationCard from './components/CVActivationCard';
import CvSelectorCard from './components/CvSelectorCard';
import EmptyStatePrompt from './components/EmptyStatePrompt';
import JobMatchingOnboarding from './components/JobMatchingOnboarding';
import MatchingHowItWorks from './components/MatchingHowItWorks';
import JobResultsGrid from './components/JobResultsGrid';
import JobSearchLoader from './components/JobSearchLoader';
import JobFilterPanel, { type JobFilters, DEFAULT_FILTERS, countActiveFilters } from './components/JobFilterPanel';
import RedactedJobCard from './components/RedactedJobCard';
import PaywallCard from '@/components/paywall/PaywallCard';
import PageHeader from '@/components/shell/PageHeader';
import EmptyState from '@/components/shell/EmptyState';
import FlowError from '@/components/shell/FlowError';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import { IlluTomSokning } from '@/components/illustrations/TradenScener';
import type { JobRedactionResult } from '@/app/api/jobs/redact/route';
import { applyClientFilters, rankGlobalJobs } from './data/job-filtering';
import { SWEDISH_MUNICIPALITIES } from './data/swedish-municipalities';
import type { ActiveCVData, JobbmatchningData } from './getJobbmatchningData';

/**
 * Jobbdetaljerna öppnas först när användaren klickar ett kort, och drar in
 * hela annonsvyn med matchningsförklaring och analysval. Modalen laddas därför
 * när den behövs i stället för i sidans första paket. Ingen höjd behöver
 * reserveras: den ligger över sidan och flyttar ingenting.
 */
const JobDetailModal = dynamic(() => import('./components/JobDetailModal'), {
  ssr: false,
});

export default function JobbmatchningClient({
  initialData,
}: {
  initialData: JobbmatchningData;
}) {
  // Låsen räknades på servern med samma getActiveCvIds som useCvQuota använde.
  const lockedCvIds = useMemo(
    () => new Set(initialData.lockedCvIds),
    [initialData.lockedCvIds]
  );
  const isCvLocked = (cvId: string) => lockedCvIds.has(cvId);
  const { successWithMascotAndActivity } = useNotification();
  // Premium avgörs inte längre i klienten: /api/jobs/redact bestämmer vad som
  // får visas, så en manipulerad klientflagga kan inte låsa upp träffarna.

  // Mjuk gate: utan CV visar vi <JobMatchingOnboarding /> istallet for att
  // redirecta. Anvandaren ska forsta vad funktionen ar innan vi skickar dem
  // till CV-uppladdningen. CV-rakning gors via cvs.length nedan.

  // State
  const [cvs, setCvs] = useState(initialData.cvs);
  const [activeCV, setActiveCV] = useState<ActiveCVData | null>(
    initialData.activeCV
  );
  const [activeCVId, setActiveCVId] = useState<string | null>(
    initialData.activeCV?.cv_id ?? null
  );
  const [jobs, setJobs] = useState<any[]>([]);
  const [customSearch, setCustomSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showDistantJobs, setShowDistantJobs] = useState(false); // Filter för jobb >100km
  const [showSearchView, setShowSearchView] = useState(false); // Visa sökning eller CV-val
  const [hasMore, setHasMore] = useState(false); // Flag för progressive loading
  const [loadingMore, setLoadingMore] = useState(false); // Loading state för bakgrundshämtning
  const [filters, setFilters] = useState<JobFilters>(DEFAULT_FILTERS); // Filtertillstånd
  const [totalResults, setTotalResults] = useState(0); // Totalt antal matchande jobb
  // Globala pooler (remote / erfarenhet-fria) från global_job_cache. Hämtas lazy
  // första gången respektive filter slås på och rankas mot CV:t klientsidigt.
  const [globalRemote, setGlobalRemote] = useState<any[] | null>(null);
  const [globalNoExp, setGlobalNoExp] = useState<any[] | null>(null);
  const [loadingGlobal, setLoadingGlobal] = useState(false);

  // Loading states. CV-listan är server-läst och finns redan, så den börjar
  // aldrig i laddning. Flaggan finns kvar för omhämtningen efter en aktivering.
  const [loadingCVs, setLoadingCVs] = useState(false);
  const [activatingCVId, setActivatingCVId] = useState<string | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Constants for free tier limits
  const FREE_TIER_JOB_LIMIT = 10;

  // Filter som FORTFARANDE behöver servern. Omfattning, publicerat, sortering
  // och ort görs numera klientsidigt (applyClientFilters) och skickas INTE hit.
  // remote/noExperience ändrar genuint vilka jobb som finns och hämtas separat
  // via den globala cachen (se hämtning av remote/erfarenhet-fria jobb).
  const buildActiveFilters = (_f: JobFilters): Record<string, unknown> => {
    // Inga server-side filter på CV-grundsökningen längre, den ska vara bred
    // och stabilt cachebar. remote/noExperience hanteras via global cache.
    return {};
  };

  // Ingen hämtning vid mount längre: servern har redan läst CV-listan och det
  // aktiverade CV:t, och skickat dem som props. fetchActiveCV finns kvar nedan
  // för omhämtningen direkt efter att användaren aktiverat ett CV.

  // Progressive loading: Ladda resterande 250 jobb i bakgrunden efter top 50
  useEffect(() => {
    if (hasMore && jobs.length === 50) {
      fetchMoreJobs(50, 550); // offset, limit, hämtar resten upp till 600
    }
  }, [hasMore, jobs.length]);

  // Filterändringar görs KLIENTSIDIGT på redan hämtade jobb (se applyClientFilters)
  // i stället för att söka om mot servern. Det undviker onödiga anrop och skyddar
  // gratisanvändarnas sökkvot. Endast initial CV-sökning + fritext träffar servern.

  // CV-kontext för att ranka globala jobb (ort → koordinat + skills).
  const cvContext = () => {
    const loc = activeCV?.extracted_location?.toLowerCase().trim();
    const muni = loc
      ? SWEDISH_MUNICIPALITIES.find(
          (m) => m.name.toLowerCase() === loc || loc.includes(m.name.toLowerCase())
        )
      : undefined;
    return {
      skills: activeCV?.extracted_skills || [],
      lat: muni?.lat ?? null,
      lon: muni?.lon ?? null,
    };
  };

  // Hämta en global pool ('remote' | 'no_experience') ur global_job_cache och
  // ranka mot CV:t. Läses direkt via supabase-klienten (RLS tillåter SELECT för
  // inloggade). Ingen server-omsökning, ingen påverkan på sökkvoten.
  const loadGlobalPool = async (cacheKey: 'remote' | 'no_experience') => {
    setLoadingGlobal(true);
    try {
      const { data, error } = await supabase
        .from('global_job_cache')
        .select('jobs')
        .eq('cache_key', cacheKey)
        .maybeSingle();
      if (error || !data) return;
      const ranked = rankGlobalJobs(data.jobs || [], cvContext());
      if (cacheKey === 'remote') setGlobalRemote(ranked);
      else setGlobalNoExp(ranked);
    } catch (err) {
      console.error(`Error loading global pool ${cacheKey}:`, err);
    } finally {
      setLoadingGlobal(false);
    }
  };

  // Hämta global pool lazy första gången respektive filter slås på.
  useEffect(() => {
    if (filters.remote && globalRemote === null) loadGlobalPool('remote');
    if (filters.noExperience && globalNoExp === null) loadGlobalPool('no_experience');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.remote, filters.noExperience]);

  // Baslista som visas: noExperience (bredast) > remote > CV-jobb. remote/
  // noExperience byter helt datakälla till respektive global pool.
  const baseJobs: any[] = filters.noExperience
    ? (globalNoExp || [])
    : filters.remote
    ? (globalRemote || [])
    : jobs;
  const usingGlobalPool = filters.noExperience || filters.remote;

  // Den lista användaren faktiskt ser, lyft ur JSX så suddningen kan fråga
  // servern om exakt den ordningen.
  const filteredJobs = useMemo(
    () => applyClientFilters(baseJobs, filters, showDistantJobs),
    [baseJobs, filters, showDistantJobs]
  );

  // Våg 1 punkt 5: servern avgör vad gratisnivån får se. Vi skickar id och
  // relevans i visningsordning och får tillbaka vilka som visas i klartext
  // plus avidentifierade platshållare. Texten i de suddade lämnar aldrig
  // servern, så en blur i CSS räcker inte och behövs inte.
  const [redaction, setRedaction] = useState<JobRedactionResult | null>(null);

  useEffect(() => {
    if (filteredJobs.length === 0) {
      setRedaction(null);
      return;
    }
    let cancelled = false;
    const payload = filteredJobs.map((j: any) => ({ id: j.id, relevance: j.relevance }));

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

  const fetchActiveCV = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('active_cv_for_matching')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle(); // Använd maybeSingle() istället för single() för att undvika 406-fel

      if (error) {
        console.error('Error fetching active CV:', error);
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Du måste vara inloggad');

      const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/parse-cv-for-matching`;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cvId,
          userId: session.user.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunde inte aktivera CV');
      }

      const result = await response.json();

      if (result.success) {
        // Update active CV state
        await fetchActiveCV();

        // Aktivering öppnar sökvyn direkt (ersätter den tidigare stora CTA-knappen)
        setShowSearchView(true);
        fetchJobs();
      }
    } catch (err) {
      console.error('Error activating CV:', err);
      setError(err instanceof Error ? err.message : 'Ett fel uppstod vid CV-aktivering');
    } finally {
      setActivatingCVId(null);
    }
  };

  const fetchJobs = async (searchQuery?: string) => {
    if (!activeCVId && !activeCV) {
      setError('Inget aktivt CV. Aktivera ett CV först.');
      return;
    }

    setLoadingJobs(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Du måste vara inloggad');

      const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/match-jobs`;

      const requestBody: any = {
        userId: session.user.id
      };

      if (searchQuery) {
        requestBody.customQuery = searchQuery;
      }

      // Server-side filter → JobSearch-API:t. Skicka bara aktiva värden så
      // edge-funktionens filter_hash blir stabilt (tomt filter = standardcache).
      const activeFilters = buildActiveFilters(filters);
      if (Object.keys(activeFilters).length > 0) {
        requestBody.filters = activeFilters;
      }

      // Klient-timeout: hindra att UI:t fastnar på "Förbereder vy / 100%" om
      // edge-funktionen mot förmodan inte svarar. Servern är tidsbudgeterad till
      // ~150s, så 160s klient-timeout ger den marginal att svara först.
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(160000)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Kunde inte hämta jobbannonser');
      }

      const data = await response.json();

      if (data.success) {
        setJobs(data.jobs || []);
        setHasMore(data.hasMore || false); // Spara hasMore flag
        setTotalResults(data.totalAvailable || data.totalResults || (data.jobs?.length ?? 0));

        // Show notification when jobs are found
        if (data.jobs && data.jobs.length > 0) {
          successWithMascotAndActivity(
            `Vi hittade ${data.jobs.length} matchande jobb. Utforska träffarna nedan.`,
            'jobs-found',
            'jobs_searched',
            'sökte matchande jobb',
            {
              jobs_count: data.jobs.length,
              search_query: searchQuery || 'auto',
              cv_id: activeCVId
            },
            4000
          );
        }
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      // Skilj timeout/abort från övriga fel för ett begripligt meddelande.
      if (err instanceof DOMException && err.name === 'TimeoutError') {
        setError('Sökningen tog längre tid än väntat. Försök igen, andra försöket går oftast snabbt.');
      } else {
        setError(err instanceof Error ? err.message : 'Ett fel uppstod. Försök igen.');
      }
    } finally {
      setLoadingJobs(false);
    }
  };

  // Progressive loading: Hämta resterande jobb i bakgrunden
  const fetchMoreJobs = async (offset: number, limit: number) => {
    if (loadingMore) return; // Förhindra dubbel-hämtning

    setLoadingMore(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/match-jobs`;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        // Skicka MED filtren så vi träffar samma cache-rad (filter_hash) som
        // fetchJobs. Utan detta blev filter_hash '' → ofiltrerad standardcache
        // → ofiltrerade jobb fylldes på efter de första 50.
        body: JSON.stringify({
          userId: session.user.id,
          offset,
          limit,
          ...(Object.keys(buildActiveFilters(filters)).length > 0
            ? { filters: buildActiveFilters(filters) }
            : {})
        })
      });

      if (!response.ok) return;

      const data = await response.json();

      if (data.success && data.jobs?.length > 0) {
        // Dedup på id vid sammanslagning, skyddar mot dubbletter (t.ex. om en
        // cache-race gör att samma jobb returneras igen). Dubblett-id:n bryter
        // annars Reacts key-rendering så filtrering inte syns på korten.
        setJobs(prev => {
          const seen = new Set(prev.map(j => j.id));
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
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSearch.trim()) {
      fetchJobs(customSearch);
    } else {
      fetchJobs();
    }
  };

  const handleSearchJobs = () => {
    setShowSearchView(true);
    fetchJobs();
  };

  const handleBackToCVs = () => {
    setShowSearchView(false);
    setJobs([]);
    setCustomSearch('');
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-16">
      <PageHeader
        title="Jobbmatchning"
        description={
          showSearchView
            ? 'Jobb matchade mot ditt CV.'
            : activeCV
            ? 'Ditt CV är aktivt och redo att söka jobb.'
            : 'Välj ett CV nedan för att börja.'
        }
        action={
          showSearchView ? (
            <button
              type="button"
              onClick={handleBackToCVs}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 hover:bg-insunken"
            >
              Tillbaka till mina CV
            </button>
          ) : undefined
        }
      />

      <div>
        {/* CV Activation Section (dölj när sökvyn visas) */}
        {!showSearchView && (
          <div>
            {loadingCVs ? (
              <LoadingSkeleton variant="card" count={2} label="Hämtar dina CV" />
            ) : cvs.length === 0 ? (
              <JobMatchingOnboarding />
            ) : (
              <>
                <h2 className="mb-3 text-sm font-medium text-ink-3">Dina CV</h2>
              <div className="space-y-4 sm:space-y-6">
                {/* 3-stegs-instruktion + info-popover */}
                <MatchingHowItWorks />

                {/* Aktivt CV-kort i full bredd */}
                {activeCVId && cvs.find(cv => cv.id === activeCVId) && (
                  <CVActivationCard
                    key={activeCVId}
                    cv={cvs.find(cv => cv.id === activeCVId)!}
                    isActive={true}
                    activeData={activeCV}
                    onActivate={handleActivateCV}
                    onSearchJobs={handleSearchJobs}
                    isActivating={activatingCVId === activeCVId}
                  />
                )}

                {/* Inget aktivt CV, illustrerat onboarding-prompt */}
                {!activeCVId && <EmptyStatePrompt />}

                {/* Inactive CV Cards Grid - Below */}
                {cvs.filter(cv => cv.id !== activeCVId).length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-ink-3">
                      {activeCVId ? 'Andra CV' : 'Välj ett CV att aktivera'}
                    </h3>
                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {cvs
                        .filter(cv => cv.id !== activeCVId)
                        .map((cv) => (
                          <CvSelectorCard
                            key={cv.id}
                            cv={cv}
                            onActivate={handleActivateCV}
                            isActivating={activatingCVId === cv.id}
                            isLocked={isCvLocked(cv.id)}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </div>
              </>
            )}
          </div>
        )}

        {/* Job Search Section (visa endast när showSearchView är true) */}
        {showSearchView && (
          <div className="space-y-6">
              {/* Tydlig sökruta, egen rubrik, stor, alltid synlig överst */}
              <section className="rounded-xl border border-kant bg-panel p-4">
                <form onSubmit={handleSearch}>
                  <label htmlFor="job-search" className="block">
                    <span className="mb-1 block text-sm font-medium text-ink-2">
                      Sök fritt eller förfina matchningen
                    </span>
                    <input
                      id="job-search"
                      type="text"
                      value={customSearch}
                      onChange={(e) => setCustomSearch(e.target.value)}
                      enterKeyHint="search"
                      inputMode="search"
                      autoComplete="off"
                      placeholder="projektledare bygg"
                      className="h-11 w-full rounded-lg border border-kant bg-insunken px-3 text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1"
                    />
                    <span className="mt-1 block text-meta text-ink-3">
                      Lämna tomt så matchar vi mot ditt CV.
                    </span>
                  </label>
                  <button
                    type="submit"
                    disabled={loadingJobs}
                    className="mt-3 inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover disabled:opacity-40"
                  >
                    {loadingJobs ? 'Söker' : 'Sök'}
                  </button>
                </form>
              </section>

              {/* Mobil: filter-knapp (öppnar drawer). Desktop: i sidebar nedan. */}
              <div className="lg:hidden">
                <JobFilterPanel filters={filters} onChange={setFilters} userLocation={activeCV?.extracted_location} jobs={baseJobs} />
              </div>

              {/* Error Message */}
              {error && !loadingJobs && (
                <FlowError
                  message={error}
                  onRetry={() => fetchJobs(customSearch.trim() || undefined)}
                />
              )}

              {/* Tvåkolumns-layout: filter-sidebar (desktop) + resultat */}
              <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5 sm:gap-6">
                {/* Desktop-sidebar */}
                <div className="hidden lg:block">
                  <JobFilterPanel filters={filters} onChange={setFilters} userLocation={activeCV?.extracted_location} jobs={baseJobs} />
                </div>

                {/* Huvudkolumn: räknare + resultat. Klientsidig filtrering på
                    redan hämtade jobb, ingen omsökning. remote/noExperience
                    byter baslista till respektive global pool. */}
                <div className="min-w-0 space-y-5">
                  {(() => {
                    const isLoading = loadingJobs || (usingGlobalPool && loadingGlobal);
                    if (isLoading || baseJobs.length === 0) return null;
                    const distantCount = baseJobs.filter(j => j.distance && j.distance > 100).length;

                    // Serverns svar styr. Innan det kommit visar vi bara det
                    // gratisnivån säkert får se, aldrig hela listan.
                    const visibleIds = redaction
                      ? new Set(redaction.visibleIds)
                      : new Set(
                          filteredJobs
                            .slice(0, FREE_TIER_JOB_LIMIT)
                            .map((j: any) => String(j.id))
                        );
                    const displayedJobs = redaction?.isPremium
                      ? filteredJobs
                      : filteredJobs.filter((j: any) => visibleIds.has(String(j.id)));
                    const redactedJobs = redaction?.redacted ?? [];

                    return (
                      <>
                        {/* Resultaträknare */}
                        <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-kant bg-panel p-4 sm:flex-row sm:items-center">
                          <p className="text-meta text-ink-3">
                            <span className="tabular-nums text-ink-1">{filteredJobs.length}</span> matchande jobb
                            {countActiveFilters(filters) > 0 && (
                              <> · {countActiveFilters(filters)} filter aktiva</>
                            )}
                          </p>
                          {distantCount > 0 && (
                            <label className="flex min-h-11 cursor-pointer items-center gap-2">
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
                        </div>

                        {filteredJobs.length === 0 ? (
                          <EmptyState
                            illustration={IlluTomSokning}
                            title="Inga jobb matchar dina filter"
                            description="Prova att rensa ett filter så breddas listan."
                          />
                        ) : (
                        <>
                          <JobResultsGrid
                            jobs={displayedJobs}
                            selectedAnalysis={null}
                            onJobSelect={setSelectedJob}
                            selectedAnalysisId={undefined}
                            cvId={activeCVId || undefined}
                          />

                          {/* Resten av träffarna finns kvar i listan, men
                              suddade. Servern har redan tagit bort texten. */}
                          {redactedJobs.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                              {redactedJobs.map((job) => (
                                <RedactedJobCard key={job.placeholderId} job={job} />
                              ))}
                            </div>
                          )}
                        </>
                        )}

                        {/* Betalväggen ligger under listan, inte i stället för
                            den. Värdet syns först, spärren sedan. */}
                        {redactedJobs.length > 0 && (
                          <PaywallCard
                            variant="jobbtraffar"
                            hiddenCount={redactedJobs.length}
                            className="mt-2"
                          />
                        )}
                      </>
                    );
                  })()}

                  {/* No results message, baslistan tom och inget laddas */}
                  {!loadingJobs && !(usingGlobalPool && loadingGlobal) && baseJobs.length === 0 && (
                    <EmptyState
                      illustration={IlluTomSokning}
                      title="Inga jobb hittades"
                      description={
                        countActiveFilters(filters) > 0
                          ? 'Prova att rensa ett filter så breddas listan.'
                          : 'Prova att söka igen, eller med andra ord.'
                      }
                    />
                  )}

                  {/* Loading State, CV-sökning eller global pool */}
                  {(loadingJobs || (usingGlobalPool && loadingGlobal)) && (
                    <JobSearchLoader
                      isSearching={true}
                      jobsFound={null}
                      error={error}
                    />
                  )}
                </div>
              </div>
          </div>
        )}
      </div>

      {/* Hela annonsen i ett ark */}
      <JobDetailModal
        job={selectedJob}
        cvId={activeCVId || undefined}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
}
