'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  Sparkles,
  Search,
  Loader2,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Building2,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  X
} from 'lucide-react';

// Components
import CVActivationCard from './components/CVActivationCard';
import MatchExplanation from './components/MatchExplanation';
import JobResultsGrid from './components/JobResultsGrid';

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
  // State
  const [cvs, setCvs] = useState<CV[]>([]);
  const [activeCV, setActiveCV] = useState<ActiveCVData | null>(null);
  const [activeCVId, setActiveCVId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [customSearch, setCustomSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showDistantJobs, setShowDistantJobs] = useState(false); // Filter för jobb >100km
  const [showSearchView, setShowSearchView] = useState(false); // Visa sökning eller CV-val

  // Loading states
  const [loadingCVs, setLoadingCVs] = useState(true);
  const [activatingCV, setActivatingCV] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch CVs and active CV on mount
  useEffect(() => {
    fetchCVs();
    fetchActiveCV();
  }, []);

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
    setActivatingCV(true);
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
      setActivatingCV(false);
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
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err instanceof Error ? err.message : 'Ett fel uppstod');
    } finally {
      setLoadingJobs(false);
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Jobbmatchning
                </h1>
                <p className="text-gray-600 mt-1">
                  {showSearchView
                    ? 'Matchade jobbannonser baserat på ditt CV'
                    : activeCV
                    ? 'Aktivt CV - redo att söka jobb'
                    : 'Aktivera ett CV för att börja matcha jobb'
                  }
                </p>
              </div>
            </div>

            {/* Back button när i sökvyn */}
            {showSearchView && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleBackToCVs}
                className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:bg-white transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Tillbaka till CV-val
              </motion.button>
            )}
          </div>

          {/* Match Explanation */}
          <MatchExplanation />
        </motion.div>

        {/* CV Activation Section (dölj när sökvyn visas) */}
        {!showSearchView && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dina CV:n</h2>

            {loadingCVs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : cvs.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 p-8 text-center">
                <p className="text-gray-600 mb-4">Du har inga uppladdade CV:n än.</p>
                <a
                  href="/dashboard/cv"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Ladda upp CV
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {cvs.map((cv) => (
                  <CVActivationCard
                    key={cv.id}
                    cv={cv}
                    isActive={activeCVId === cv.id}
                    activeData={activeCVId === cv.id ? activeCV : null}
                    onActivate={handleActivateCV}
                    onSearchJobs={handleSearchJobs}
                    isActivating={activatingCV}
                  />
                ))}
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
              <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={customSearch}
                    onChange={(e) => setCustomSearch(e.target.value)}
                    placeholder="Förfina sökningen, t.ex. 'JavaScript utvecklare'..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={loadingJobs}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loadingJobs ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
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
                  className="bg-red-50 border border-red-200 rounded-2xl p-4"
                >
                  <p className="text-red-600">{error}</p>
                </motion.div>
              )}

              {/* Distance Filter */}
              {!loadingJobs && jobs.length > 0 && (() => {
                const nearbyCount = jobs.filter(j => !j.distance || j.distance <= 100).length;
                const distantCount = jobs.filter(j => j.distance && j.distance > 100).length;
                return (
                  <div className="flex items-center justify-end gap-3 bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={showDistantJobs}
                        onChange={(e) => setShowDistantJobs(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-indigo-600 transition-colors">
                        Visa jobb &gt;100 km bort
                      </span>
                    </label>
                    <div className="text-xs text-gray-500">
                      ({nearbyCount} nära, {distantCount} långt)
                    </div>
                  </div>
                );
              })()}

              {/* Results Grid */}
              {!loadingJobs && jobs.length > 0 && (
                <JobResultsGrid
                  jobs={showDistantJobs ? jobs : jobs.filter(j => !j.distance || j.distance <= 100)}
                  selectedAnalysis={null}
                  onJobSelect={setSelectedJob}
                  selectedAnalysisId={undefined}
                  cvId={activeCVId || undefined}
                />
              )}

              {/* No results message */}
              {!loadingJobs && jobs.length === 0 && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 p-12 text-center">
                  <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Inga jobb hittades. Prova att söka igen.</p>
                </div>
              )}

              {/* Loading State */}
              {loadingJobs && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                  <p className="text-gray-600">Söker matchande jobb...</p>
                </div>
              )}
          </motion.div>
        )}
      </div>

      {/* Job Detail Modal */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedJob(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedJob(null)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Relevance */}
              {selectedJob.relevance !== undefined && (
                <div className="flex items-center gap-3 mb-6">
                  <div className={`px-4 py-2 rounded-xl text-white font-semibold ${
                    selectedJob.relevance >= 70
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : selectedJob.relevance >= 40
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                      : 'bg-gradient-to-r from-gray-400 to-gray-500'
                  }`}>
                    {selectedJob.relevance}% matchning
                  </div>
                </div>
              )}

              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {selectedJob.headline}
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-700">
                  <Building2 className="w-5 h-5" />
                  <span className="font-semibold">{selectedJob.employer.name}</span>
                </div>

                {selectedJob.workplace_address && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span>
                      {[
                        selectedJob.workplace_address.municipality,
                        selectedJob.workplace_address.region,
                        selectedJob.workplace_address.country
                      ].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                {selectedJob.employment_type && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Briefcase className="w-5 h-5" />
                    <span>{selectedJob.employment_type.label}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>Publicerad: {new Date(selectedJob.publication_date).toLocaleDateString('sv-SE')}</span>
                </div>

                {selectedJob.application_deadline && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Clock className="w-5 h-5" />
                    <span>Sista ansökningsdag: {new Date(selectedJob.application_deadline).toLocaleDateString('sv-SE')}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="prose max-w-none mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Beskrivning</h3>
                <div
                  className="text-gray-700 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: selectedJob.description.text_formatted || selectedJob.description.text
                  }}
                />
              </div>

              {/* Apply button */}
              {selectedJob.application_details?.url && (
                <a
                  href={selectedJob.application_details.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Ansök nu
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
