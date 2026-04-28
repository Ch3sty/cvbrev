'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  Search,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Crown,
} from 'lucide-react';
import { useProfile } from '@/hooks/use-profile';
import { useCvQuota } from '@/hooks/useCvQuota';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/context/notificationcontext';

// Components
import CVActivationCard from './components/CVActivationCard';
import InactiveCVCard from './components/InactiveCVCard';
import MatchingHowItWorks from './components/MatchingHowItWorks';
import JobResultsGrid from './components/JobResultsGrid';
import JobSearchLoader from './components/JobSearchLoader';
import JobDetailModal from './components/JobDetailModal';

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
  const { cvCount, loading: cvQuotaLoading } = useCvQuota();
  const router = useRouter();
  const { successWithMascotAndActivity } = useNotification();
  const isPremium = subscriptionTier === 'premium';

  // Hård gating: utan CV → tillbaka till CV-uppladdning
  useEffect(() => {
    if (!cvQuotaLoading && cvCount === 0) {
      router.push('/dashboard/profil/cv?reason=cv-required');
    }
  }, [cvCount, cvQuotaLoading, router]);

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

  // Loading states
  const [loadingCVs, setLoadingCVs] = useState(true);
  const [activatingCVId, setActivatingCVId] = useState<string | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Constants for free tier limits
  const FREE_TIER_JOB_LIMIT = 10;

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

        // Automatically start job search after activation
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

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunde inte hämta jobbannonser');
      }

      const data = await response.json();

      if (data.success) {
        setJobs(data.jobs || []);
        setHasMore(data.hasMore || false); // Spara hasMore flag

        // Show notification when jobs are found
        if (data.jobs && data.jobs.length > 0) {
          successWithMascotAndActivity(
            `${data.jobs.length} jobb hittade! Utforska dina matchningar nedan.`,
            '/images/maskot/success-jobs-found.svg',
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
      setError(err instanceof Error ? err.message : 'Ett fel uppstod');
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
        body: JSON.stringify({
          userId: session.user.id,
          offset,
          limit
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
      {/* Premium Dynamic Background - Same as Dashboard */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.9 }}
      >
        {/* Primary gradient foundation */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-slate-50/50" />

        {/* Secondary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-50/20 to-pink-50/30" />

        {/* Animated morphing gradient orbs */}
        <motion.div
          className="absolute top-[10%] left-[5%] w-[500px] h-[500px]"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, rgba(147, 51, 234, 0.05) 40%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            x: [0, 150, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute top-[30%] right-[10%] w-[600px] h-[600px]"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, rgba(139, 92, 246, 0.04) 40%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, -200, 0],
            y: [0, 150, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute bottom-[20%] left-[15%] w-[400px] h-[400px]"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.03) 40%, transparent 70%)',
            filter: 'blur(70px)',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: "easeInOut"
          }}
        />

        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.015,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z\'/%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '40px 40px',
          }}
        />
      </motion.div>

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
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Dina CV:n</h2>

            {loadingCVs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : cvs.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200 p-6 sm:p-8 text-center">
                <p className="text-sm sm:text-base text-gray-600 mb-4">Du har inga uppladdade CV:n än.</p>
                <a
                  href="/dashboard/profil/cv"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all touch-manipulation min-h-[44px] text-sm sm:text-base font-medium"
                >
                  Ladda upp CV
                  <ArrowRight className="w-4 h-4 flex-shrink-0" />
                </a>
              </div>
            ) : (
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

                {/* Inget aktivt CV — empty state */}
                {!activeCVId && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex items-center justify-center min-h-[140px] sm:min-h-[180px]">
                    <div className="text-center">
                      <p className="text-sm sm:text-base text-slate-700 font-medium mb-1">Inget aktivt CV</p>
                      <p className="text-xs sm:text-sm text-slate-500">Klicka på ett CV nedan för att aktivera det</p>
                    </div>
                  </div>
                )}

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
                          <InactiveCVCard
                            key={cv.id}
                            cv={cv}
                            onActivate={handleActivateCV}
                            isActivating={activatingCVId === cv.id}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </div>
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
              {/* Custom Search */}
              <form onSubmit={handleSearch} className="mb-4 sm:mb-6">
                <div className="relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    value={customSearch}
                    onChange={(e) => setCustomSearch(e.target.value)}
                    placeholder="Förfina sökningen, t.ex. 'JavaScript utvecklare'..."
                    className="w-full pl-10 sm:pl-12 pr-20 sm:pr-28 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base"
                  />
                  <button
                    type="submit"
                    disabled={loadingJobs}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 sm:px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all disabled:opacity-50 touch-manipulation min-h-[40px] text-sm sm:text-base font-medium"
                  >
                    {loadingJobs ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    ) : (
                      'Sök'
                    )}
                  </button>
                </div>
              </form>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-3 sm:p-4"
                >
                  <p className="text-sm sm:text-base text-red-600">{error}</p>
                </motion.div>
              )}

              {/* Distance Filter */}
              {!loadingJobs && jobs.length > 0 && (() => {
                const nearbyCount = jobs.filter(j => !j.distance || j.distance <= 100).length;
                const distantCount = jobs.filter(j => j.distance && j.distance > 100).length;
                return (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 bg-white/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
                    <label className="flex items-center gap-2 cursor-pointer group touch-manipulation">
                      <input
                        type="checkbox"
                        checked={showDistantJobs}
                        onChange={(e) => setShowDistantJobs(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 touch-manipulation"
                      />
                      <span className="text-xs sm:text-sm text-gray-700 group-hover:text-indigo-600 transition-colors">
                        Visa jobb &gt;100 km bort
                      </span>
                    </label>
                    <div className="text-xs text-gray-500 ml-6 sm:ml-0">
                      ({nearbyCount} nära, {distantCount} långt)
                    </div>
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
                        className="mt-4 sm:mt-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl sm:rounded-2xl border-2 border-pink-200/40 p-6 sm:p-8 text-center"
                      >
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-3 sm:mb-4">
                          <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-pink-600 flex-shrink-0" />
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
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-pink-500/25 transition-all duration-300 hover:scale-105 touch-manipulation min-h-[44px] text-sm sm:text-base"
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
                <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200 p-8 sm:p-12 text-center">
                  <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-gray-600">Inga jobb hittades. Prova att söka igen.</p>
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
