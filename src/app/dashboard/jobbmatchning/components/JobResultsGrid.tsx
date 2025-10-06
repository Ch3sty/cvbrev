'use client';

import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Target, Sparkles } from 'lucide-react';
import JobCard from './JobCard';

interface JobResultsGridProps {
  jobs: any[];
  selectedAnalysis: any;
  onJobSelect: (job: any) => void;
  selectedAnalysisId?: string;
  cvId?: string;
}

const StatWidget = ({ title, value, icon: Icon, color }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-6 shadow-lg"
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <motion.h3
      className="text-3xl font-bold text-gray-900 mb-1"
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {value}
    </motion.h3>
    <p className="text-gray-600 text-sm">{title}</p>
  </motion.div>
);

export default function JobResultsGrid({ jobs, selectedAnalysis, onJobSelect, selectedAnalysisId, cvId }: JobResultsGridProps) {
  const highMatches = jobs.filter(j => j.relevance >= 70).length;
  const mediumMatches = jobs.filter(j => j.relevance >= 40 && j.relevance < 70).length;
  const avgRelevance = jobs.length > 0
    ? Math.round(jobs.reduce((sum, j) => sum + (j.relevance || 0), 0) / jobs.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatWidget
          title="Totalt antal matchningar"
          value={jobs.length}
          icon={Target}
          color="from-blue-500 to-indigo-600"
        />

        <StatWidget
          title="Höga matchningar (>70%)"
          value={highMatches}
          icon={TrendingUp}
          color="from-green-500 to-emerald-600"
        />

        <StatWidget
          title="Medel matchningar (40-70%)"
          value={mediumMatches}
          icon={BarChart3}
          color="from-yellow-500 to-orange-600"
        />

        <StatWidget
          title="Genomsnittlig relevans"
          value={`${avgRelevance}%`}
          icon={Sparkles}
          color="from-purple-500 to-pink-600"
        />
      </motion.div>

      {/* Selected Analysis Info */}
      {selectedAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Matchning baserad på:</p>
              <p className="font-semibold text-gray-900">{selectedAnalysis.displayName}</p>
            </div>
            {selectedAnalysis.atsScore !== undefined && (
              <div className="text-right">
                <p className="text-sm text-gray-600">ATS-poäng</p>
                <p className="text-2xl font-bold text-indigo-600">{selectedAnalysis.atsScore}/100</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.map((job, index) => (
          <JobCard
            key={job.id}
            job={job}
            index={index}
            onSelect={onJobSelect}
            selectedAnalysisId={selectedAnalysisId}
            cvId={cvId}
          />
        ))}
      </div>

      {/* Empty State */}
      {jobs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Inga jobb hittades
          </h3>
          <p className="text-gray-500">
            Prova att ändra dina sökkriterier eller välj en annan CV-analys
          </p>
        </motion.div>
      )}
    </div>
  );
}
