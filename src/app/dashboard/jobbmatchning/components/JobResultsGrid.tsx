'use client';

import EmptyState from '@/components/shell/EmptyState';
import { IlluTomSokning } from '@/components/illustrations/TradenScener';
import JobCard from './JobCard';

interface JobResultsGridProps {
  jobs: any[];
  selectedAnalysis: any;
  onJobSelect: (job: any) => void;
  selectedAnalysisId?: string;
  cvId?: string;
}

/**
 * Träfflistan: en sammanfattningsrad i meta, vilket CV matchningen bygger på,
 * och korten i två kolumner. Inga KPI-kort, inga skuggor.
 */
export default function JobResultsGrid({
  jobs,
  selectedAnalysis,
  onJobSelect,
  selectedAnalysisId,
  cvId,
}: JobResultsGridProps) {
  const highMatches = jobs.filter((j) => j.relevance >= 70).length;
  const avgRelevance =
    jobs.length > 0
      ? Math.round(jobs.reduce((sum, j) => sum + (j.relevance || 0), 0) / jobs.length)
      : 0;

  if (jobs.length === 0) {
    return (
      <EmptyState
        illustration={IlluTomSokning}
        title="Inga jobb hittades"
        description="Prova att ändra sökkriterierna eller välj en annan CV-analys."
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="rounded-xl border border-kant bg-panel px-4 py-3">
        <p className="text-meta text-ink-3">
          <span className="tabular-nums text-ink-1">{jobs.length}</span> jobb ·{' '}
          <span className="tabular-nums text-ink-1">{highMatches}</span> över 70 procent ·{' '}
          <span className="tabular-nums text-ink-1">{avgRelevance} %</span> snittrelevans
        </p>

        {selectedAnalysis && (
          <p className="mt-1.5 text-meta text-ink-3">
            Matchad mot{' '}
            <span className="text-ink-1">{selectedAnalysis.displayName}</span>
            {selectedAnalysis.atsScore !== undefined && (
              <>
                {' · ATS '}
                <span className="tabular-nums text-ink-1">
                  {selectedAnalysis.atsScore}/100
                </span>
              </>
            )}
          </p>
        )}
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-5">
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
    </div>
  );
}
