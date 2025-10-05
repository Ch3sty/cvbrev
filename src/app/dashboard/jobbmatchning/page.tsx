'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  Briefcase,
  MapPin,
  Calendar,
  TrendingUp,
  Search,
  Filter,
  ExternalLink,
  Loader2,
  Sparkles,
  Building2,
  Clock
} from 'lucide-react';

interface JobAd {
  id: string;
  headline: string;
  employer: {
    name: string;
    url?: string;
  };
  workplace_address: {
    municipality?: string;
    region?: string;
    country?: string;
  };
  description: {
    text: string;
    text_formatted?: string;
  };
  employment_type?: {
    label: string;
  };
  publication_date: string;
  application_deadline?: string;
  application_details?: {
    url?: string;
    email?: string;
  };
  occupation?: {
    label: string;
  };
  relevance?: number;
}

interface SearchTerms {
  occupations: string[];
  skills: string[];
  locations: string[];
}

export default function JobbmatchningPage() {
  const [jobs, setJobs] = useState<JobAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerms, setSearchTerms] = useState<SearchTerms | null>(null);
  const [customSearch, setCustomSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobAd | null>(null);

  const supabase = createClient();

  const fetchJobs = async (searchQuery?: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Du måste vara inloggad');
      }

      const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/match-jobs`;

      const requestBody: any = {};

      if (searchQuery) {
        requestBody.customParams = {
          q: searchQuery,
          limit: 20
        };
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
        setJobs(data.jobs);
        setSearchTerms(data.searchTerms);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err instanceof Error ? err.message : 'Ett fel uppstod');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSearch.trim()) {
      fetchJobs(customSearch);
    }
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 70) return 'bg-green-500';
    if (relevance >= 40) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getRelevanceLabel = (relevance: number) => {
    if (relevance >= 70) return 'Hög matchning';
    if (relevance >= 40) return 'Medel matchning';
    return 'Låg matchning';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Jobbmatchning
              </h1>
              <p className="text-gray-600 mt-1">
                AI-driven matchning baserad på ditt CV
              </p>
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={customSearch}
                onChange={(e) => setCustomSearch(e.target.value)}
                placeholder="Sök efter jobb, t.ex. 'JavaScript utvecklare'..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Sök
              </button>
            </div>
          </form>

          {/* Search terms chips */}
          {searchTerms && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex flex-wrap gap-2"
            >
              <span className="text-sm text-gray-600">Söker baserat på:</span>
              {searchTerms.occupations.map((occ, i) => (
                <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                  {occ}
                </span>
              ))}
              {searchTerms.skills.slice(0, 5).map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-gray-600">Söker efter matchande jobb...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-6"
          >
            <p className="text-red-600">{error}</p>
            {error.includes('CV') && (
              <p className="text-sm text-red-500 mt-2">
                Du behöver först ladda upp och analysera ditt CV under &quot;CV-analys&quot;
              </p>
            )}
          </motion.div>
        )}

        {/* Jobs grid */}
        {!loading && !error && jobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedJob(job)}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all cursor-pointer group"
              >
                {/* Relevance badge */}
                {job.relevance !== undefined && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${getRelevanceColor(job.relevance)}`} />
                    <span className="text-sm font-medium text-gray-600">
                      {getRelevanceLabel(job.relevance)} ({job.relevance}%)
                    </span>
                  </div>
                )}

                {/* Job title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {job.headline}
                </h3>

                {/* Company */}
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <Building2 className="w-4 h-4" />
                  <span className="font-medium">{job.employer.name}</span>
                </div>

                {/* Location */}
                {job.workplace_address && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {[
                        job.workplace_address.municipality,
                        job.workplace_address.region
                      ].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                {/* Employment type */}
                {job.employment_type && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                    <Briefcase className="w-4 h-4" />
                    <span>{job.employment_type.label}</span>
                  </div>
                )}

                {/* Description preview */}
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {job.description.text}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Publicerad {new Date(job.publication_date).toLocaleDateString('sv-SE')}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-indigo-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No results */}
        {!loading && !error && jobs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Inga jobb hittades
            </h3>
            <p className="text-gray-500">
              Prova att ändra dina sökkriterier eller ladda upp ett nytt CV
            </p>
          </motion.div>
        )}
      </div>

      {/* Job detail modal */}
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
              className="bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            >
              {/* Relevance */}
              {selectedJob.relevance !== undefined && (
                <div className="flex items-center gap-3 mb-4">
                  <div className={`px-4 py-2 rounded-xl ${getRelevanceColor(selectedJob.relevance)} text-white font-semibold`}>
                    {selectedJob.relevance}% matchning
                  </div>
                </div>
              )}

              <h2 className="text-3xl font-bold text-gray-900 mb-4">
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

              <button
                onClick={() => setSelectedJob(null)}
                className="mt-4 w-full py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
              >
                Stäng
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
