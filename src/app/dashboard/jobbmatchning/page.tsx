'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  Search,
  Loader2,
  ArrowLeft,
  Briefcase,
  Crown,
} from 'lucide-react';
import { useProfile } from '@/hooks/use-profile';
import { useCvQuota } from '@/hooks/useCvQuota';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/context/notificationcontext';

// Components
import CVActivationCard from './components/CVActivationCard';
import CvSelectorCard from './components/CvSelectorCard';
import EmptyStatePrompt from './components/EmptyStatePrompt';
import JobMatchingOnboarding from './components/JobMatchingOnboarding';
import MatchingHowItWorks from './components/MatchingHowItWorks';
import JobResultsGrid from './components/JobResultsGrid';
import JobSearchLoader from './components/JobSearchLoader';
import JobDetailModal from './components/JobDetailModal';
import JobFilterPanel, { type JobFilters, DEFAULT_FILTERS, countActiveFilters } from './components/JobFilterPanel';

interface CV {
  id: string;
  file_name: string;
  created_at: string;
}

interface ActiveCVData {
  cv_id: string;
  extracted_occupations: Array<{
    original: string;
    normalized: string;
    concept_id: string | null;
    alternative_labels: string[];
    confidence: 'high' | 'medium' | 'low';
  }>;
  extracted_skills: string[];
  extracted_educations: Array<{
    degree: string;
    field: string;
    institution: string;
    year: string;
  }>;
  extracted_location: string | null;
  parsed_at: string;
}

export default function JobbmatchningPage() {
  // Hooks
  const { subscriptionTier } = useProfile();
  const { isLocked: isCvLocked } = useCvQuota();
  const router = useRouter();
  const { successWithMascotAndActivity } = useNotification();
  const isPremium = subscriptionTier === 'premium';

  // Mjuk gate: utan CV visar vi <JobMatchingOnboarding /> istallet for att
  // redirecta. Anvandaren ska forsta vad funktionen ar innan vi skickar dem
  // till CV-uppladdningen. CV-rakning gors via cvs.length nedan.

  // State
  const [cvs, setCvs] = useState<CV[]>([]);
  const [activeCV, setActiveCV] = useState<ActiveCVData | null>(null);
  const [activeCVId, setActiveCVId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [customSearch, setCustomSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showDistantJobs, setShowDistantJobs] = useState(false); // Filter för jobb >100km
  const [showSearchView, setShowSearchView] = useState(false); // Visa sökning eller CV-val
  const [hasMore, setHasMore] = useState(false); // Flag för progressive loading
  const [loadingMore, setLoadingMore] = useState(false); // Loading state för bakgrundshämtning
  const [filters, setFilters] = useState<JobFilters>(DEFAULT_FILTERS); // Server-side filter
  const [totalResults, setTotalResults] = useState(0); // Totalt antal matchande jobb

  // Loading states
  const [loadingCVs, setLoadingCVs] = useState(true);
  const [activatingCVId, setActivatingCVId] = useState<string | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Constants for free tier limits
  const FREE_TIER_JOB_LIMIT = 10;

  // Plocka ut bara aktiva filter i edge-funktionens format. Tomma/falska
  // värden utelämnas så att inget filter = standardsökning (stabil cache).
  const buildActiveFilters = (f: JobFilters): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    if (f.remote) out.remote = true;
    if (f.noExperience) out.noExperience = true;
    if (f.worktimeExtent) out.worktimeExtent = f.worktimeExtent;
    if (f.publishedAfterMinutes > 0) out.publishedAfterMinutes = f.publishedAfterMinutes;
    if (f.sort) out.sort = f.sort;
    if (f.municipality.length > 0) out.municipality = f.municipality;
    return out;
  };

  // Fetch CVs and active CV on mount
  useEffect(() => {
    fetchCVs();
    fetchActiveCV();
  }, []);

  // Progressive loading: Ladda resterande 250 jobb i bakgrunden efter top 50
  useEffect(() => {
    if (hasMore && jobs.length === 50) {
      fetchMoreJobs(50, 250); // offset, limit
    }
  }, [hasMore, jobs.length]);

  // Kör om sökningen när filtren ändras (server-side filtrering). Liten debounce
  // så snabba klick på flera filter inte triggar flera anrop. Bara i sökvyn och
  // bara med aktivt CV; fritextsökning får användaren trigga manuellt via Sök.
  useEffect(() => {
    if (!showSearchView || (!activeCVId && !activeCV)) return;
    const t = setTimeout(() => {
      fetchJobs(customSearch.trim() || undefined);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchCVs = async () => {
    setLoadingCVs(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Du måste vara inloggad');

      const { data, error } = await supabase
        .from('cv_texts')
        .select('id, file_name, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCvs(data || []);
    } catch (err) {
      console.error('Error fetching CVs:', err);
      setError(err instanceof Error ? err.message : 'Ett fel uppstod');
    } finally {
      setLoadingCVs(false);
    }
  };

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
        setError('Sökningen tog längre tid än väntat. Försök igen — andra försöket går oftast snabbt.');
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
        setJobs(prev => [...prev, ...data.jobs]); // Lägg till nya jobb
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
    <div className="relative min-h-screen overflow-hidden">
      {/* Subtil orange radial-glow uppe — matchar (public)/auth-DNA */}
      <div
        className="fixed inset-x-0 top-0 h-[50vh] pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(249, 115, 22, 0.08) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto p-6 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6 gap-3">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div
                className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                  boxShadow: '0 8px 20px -6px rgba(220, 38, 38, 0.4)',
                }}
              >
                <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2.25} />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Jobbmatchning
                </h1>
                <p className="text-sm sm:text-base text-slate-600 mt-0.5 truncate">
                  {showSearchView
                    ? 'Matchade jobb baserat på ditt CV'
                    : activeCV
                    ? 'Aktivt CV — redo att söka jobb'
                    : 'Välj ett CV nedan för att börja'}
                </p>
              </div>
            </div>

            {/* Tillbaka-knapp i sökvyn */}
            {showSearchView && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleBackToCVs}
                className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 bg-white rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all touch-manipulation min-h-[44px] sm:min-h-0 text-sm font-medium text-slate-700"
              >
                <ArrowLeft className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Tillbaka</span>
              </motion.button>
            )}
          </div>

        </motion.div>

        {/* CV Activation Section (dölj när sökvyn visas) */}
        {!showSearchView && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {loadingCVs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              </div>
            ) : cvs.length === 0 ? (
              <JobMatchingOnboarding />
            ) : (
              <>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">Dina CV:n</h2>
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

                {/* Inget aktivt CV — illustrerat onboarding-prompt */}
                {!activeCVId && <EmptyStatePrompt />}

                {/* Inactive CV Cards Grid - Below */}
                {cvs.filter(cv => cv.id !== activeCVId).length > 0 && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
                      {activeCVId ? 'Andra CV:n' : 'Välj ett CV att aktivera'}
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
          </motion.div>
        )}

        {/* Job Search Section (visa endast när showSearchView är true) */}
        {showSearchView && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
              {/* Tydlig sökruta — egen rubrik, stor, alltid synlig överst */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
                <label htmlFor="job-search" className="block text-sm font-semibold text-slate-900 mb-2">
                  Sök fritt eller förfina matchningen
                </label>
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5" />
                    <input
                      id="job-search"
                      type="text"
                      value={customSearch}
                      onChange={(e) => setCustomSearch(e.target.value)}
                      placeholder="T.ex. 'projektledare bygg' eller lämna tomt för CV-matchning"
                      className="w-full pl-11 sm:pl-12 pr-24 sm:pr-28 py-3.5 sm:py-4 rounded-xl border-2 border-slate-200 bg-white focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all text-sm sm:text-base"
                    />
                    <button
                      type="submit"
                      disabled={loadingJobs}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-5 sm:px-6 py-2.5 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 touch-manipulation min-h-[40px] text-sm sm:text-base font-semibold"
                      style={{ background: 'linear-gradient(90deg, #F97316, #DC2626)' }}
                    >
                      {loadingJobs ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        'Sök'
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Mobil: filter-knapp (öppnar drawer). Desktop: i sidebar nedan. */}
              <div className="lg:hidden">
                <JobFilterPanel filters={filters} onChange={setFilters} userLocation={activeCV?.extracted_location} />
              </div>

              {/* Error Message */}
              {error && !loadingJobs && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <p className="text-sm sm:text-base text-red-600">{error}</p>
                  <button
                    onClick={() => fetchJobs(customSearch.trim() || undefined)}
                    className="flex-shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium hover:shadow-lg transition-all touch-manipulation min-h-[40px]"
                    style={{ background: 'linear-gradient(90deg, #F97316, #DC2626)' }}
                  >
                    Försök igen
                  </button>
                </motion.div>
              )}

              {/* Tvåkolumns-layout: filter-sidebar (desktop) + resultat */}
              <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5 sm:gap-6">
                {/* Desktop-sidebar */}
                <div className="hidden lg:block">
                  <JobFilterPanel filters={filters} onChange={setFilters} userLocation={activeCV?.extracted_location} />
                </div>

                {/* Huvudkolumn: räknare + resultat */}
                <div className="min-w-0 space-y-5">
                  {/* Resultaträknare */}
                  {!loadingJobs && jobs.length > 0 && (() => {
                    const nearbyCount = jobs.filter(j => !j.distance || j.distance <= 100).length;
                    const distantCount = jobs.filter(j => j.distance && j.distance > 100).length;
                    return (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/70 backdrop-blur-sm rounded-xl p-3.5 sm:p-4 border border-slate-200">
                        <p className="text-sm text-slate-700">
                          <span className="font-bold text-slate-900">{totalResults || jobs.length}</span> matchande jobb
                          {countActiveFilters(filters) > 0 && (
                            <span className="text-orange-600 font-medium"> · {countActiveFilters(filters)} filter aktiva</span>
                          )}
                        </p>
                        {distantCount > 0 && (
                          <label className="flex items-center gap-2 cursor-pointer group touch-manipulation">
                            <input
                              type="checkbox"
                              checked={showDistantJobs}
                              onChange={(e) => setShowDistantJobs(e.target.checked)}
                              className="w-4 h-4 accent-orange-500 border-gray-300 rounded touch-manipulation"
                            />
                            <span className="text-xs sm:text-sm text-slate-600 group-hover:text-orange-600 transition-colors">
                              Visa {distantCount} jobb &gt;100 km bort
                            </span>
                          </label>
                        )}
                      </div>
                    );
                  })()}

                  {/* Results Grid */}
                  {!loadingJobs && jobs.length > 0 && (() => {
                    const filteredJobs = showDistantJobs ? jobs : jobs.filter(j => !j.distance || j.distance <= 100);
                    const displayedJobs = isPremium ? filteredJobs : filteredJobs.slice(0, FREE_TIER_JOB_LIMIT);
                    const hasMoreJobs = !isPremium && filteredJobs.length > FREE_TIER_JOB_LIMIT;

                    return (
                      <>
                        <JobResultsGrid
                          jobs={displayedJobs}
                          selectedAnalysis={null}
                          onJobSelect={setSelectedJob}
                          selectedAnalysisId={undefined}
                          cvId={activeCVId || undefined}
                        />

                        {/* Premium Upgrade Banner för gratis-användare */}
                        {hasMoreJobs && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 sm:mt-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl sm:rounded-2xl border-2 border-orange-200/50 p-6 sm:p-8 text-center"
                          >
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-3 sm:mb-4">
                              <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500 flex-shrink-0" />
                              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                                {filteredJobs.length - FREE_TIER_JOB_LIMIT} fler jobb tillgängliga
                              </h3>
                            </div>
                            <p className="text-sm sm:text-base text-slate-600 mb-5 sm:mb-6 max-w-2xl mx-auto">
                              Vi hittade totalt <strong>{filteredJobs.length} matchande jobb</strong> baserat på ditt CV.
                              Som gratis-användare kan du se de {FREE_TIER_JOB_LIMIT} bästa matchningarna.
                              Uppgradera till Premium för att se alla resultat och få obegränsad tillgång till jobbmatchning.
                            </p>
                            <button
                              onClick={() => router.push('/priser')}
                              className="inline-flex items-center gap-2 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105 touch-manipulation min-h-[44px] text-sm sm:text-base"
                              style={{ background: 'linear-gradient(90deg, #F97316, #DC2626)' }}
                            >
                              <Crown className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                              <span className="truncate">Uppgradera för 149 SEK/månad</span>
                            </button>
                          </motion.div>
                        )}
                      </>
                    );
                  })()}

                  {/* No results message */}
                  {!loadingJobs && jobs.length === 0 && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200 p-8 sm:p-12 text-center">
                      <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-3 sm:mb-4" />
                      <p className="text-sm sm:text-base text-slate-600">
                        {countActiveFilters(filters) > 0
                          ? 'Inga jobb matchar dina filter. Prova att rensa något filter.'
                          : 'Inga jobb hittades. Prova att söka igen.'}
                      </p>
                    </div>
                  )}

                  {/* Loading State */}
                  {loadingJobs && (
                    <JobSearchLoader
                      isSearching={loadingJobs}
                      jobsFound={loadingJobs ? null : (jobs.length > 0)}
                      error={error}
                    />
                  )}
                </div>
              </div>
          </motion.div>
        )}
      </div>

      {/* Job Detail Modal — full-screen pa mobil + sticky bottom-bar */}
      <JobDetailModal
        job={selectedJob}
        cvId={activeCVId || undefined}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
}
