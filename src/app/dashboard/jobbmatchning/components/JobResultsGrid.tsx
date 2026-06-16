'use client';

import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import JobCard from './JobCard';

interface JobResultsGridProps {
  jobs: any[];
  selectedAnalysis: any;
  onJobSelect: (job: any) => void;
  selectedAnalysisId?: string;
  cvId?: string;
}

export default function JobResultsGrid({ jobs, selectedAnalysis, onJobSelect, selectedAnalysisId, cvId }: JobResultsGridProps) {
  const highMatches = jobs.filter(j => j.relevance >= 70).length;
  const avgRelevance = jobs.length > 0
    ? Math.round(jobs.reduce((sum, j) => sum + (j.relevance || 0), 0) / jobs.length)
    : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Kompakt summary-rad (ersätter de tidigare 4 KPI-korten) */}
      {jobs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm"
        >
          <span className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-slate-900 tabular-nums">{jobs.length}</span>
            <span className="text-slate-500">jobb totalt</span>
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-emerald-600 tabular-nums">{highMatches}</span>
            <span className="text-slate-500">höga matchningar (&gt;70%)</span>
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-orange-600 tabular-nums">{avgRelevance}%</span>
            <span className="text-slate-500">snittrelevans</span>
          </span>
        </motion.div>
      )}

      {/* Vald analys (kompakt) */}
      {selectedAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-orange-50 border border-orange-200 text-sm"
        >
          <div className="flex items-center gap-2 text-slate-700">
            <span className="text-slate-500">Matchning baserad på:</span>
            <span className="font-semibold text-slate-900">{selectedAnalysis.displayName}</span>
          </div>
          {selectedAnalysis.atsScore !== undefined && (
            <div className="flex items-baseline gap-1.5">
              <span className="text-slate-500">ATS-poäng:</span>
              <span className="font-bold text-orange-600 tabular-nums">{selectedAnalysis.atsScore}/100</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Jobb-grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {jobs.map((job, index) => (
          <JobCard
            key={`${job.id || 'job'}-${index}`}
            job={job}
            index={index}
            onSelect={onJobSelect}
            selectedAnalysisId={selectedAnalysisId}
            cvId={cvId}
          />
        ))}
      </div>

      {/* Empty state */}
      {jobs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">
            Inga jobb hittades
          </h3>
          <p className="text-slate-500">
            Prova att ändra dina sökkriterier eller välj en annan CV-analys
          </p>
        </motion.div>
      )}
    </div>
  );
}
