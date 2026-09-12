'use client';

// "CV A ger 30 procent svar, CV B ger 8" (planens avsnitt 5).
//
// Visas bara när underlaget räcker: minst två CV med loggade ansökningar och
// minst fem ansökningar med känt CV. Under det visas ett tomt tillstånd som
// säger exakt vad som saknas, eftersom en procentsats på tre ansökningar är
// slump och en tom ruta utan förklaring är värdelös.

import { useEffect, useState } from 'react';
import EmptyState from '@/components/shell/EmptyState';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import { IlluCvJamforelse } from '@/components/illustrations/ApplicationIllustrations';
import {
  compareCvPerformance,
  cvComparisonMissingText,
  type CvComparison,
} from '@/lib/applications/cvComparison';
import type { JobApplication } from '@/lib/applications/status';

interface CvComparisonCardProps {
  applications: JobApplication[];
  /** Sant medan ansökningarna hämtas. */
  isLoading?: boolean;
}

export default function CvComparisonCard({ applications, isLoading }: CvComparisonCardProps) {
  const [cvNames, setCvNames] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/cv/list')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled || !json) return;
        const list = (json.data ?? json.cvs ?? []) as Array<{ id: string; file_name?: string | null }>;
        const map: Record<string, string> = {};
        for (const cv of list) {
          if (cv?.id) map[cv.id] = cv.file_name || 'CV utan namn';
        }
        setCvNames(map);
      })
      .catch(() => {
        if (!cancelled) setCvNames({});
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading || cvNames === null) {
    return <LoadingSkeleton variant="card" label="Läser in jämförelsen" />;
  }

  const comparison = compareCvPerformance(applications, cvNames);

  if (!comparison.hasEnoughData) {
    return (
      <EmptyState
        illustration={IlluCvJamforelse}
        title="Vilket CV ger flest svar?"
        description={cvComparisonMissingText(comparison)}
      />
    );
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
      <h3 className="text-base font-semibold tracking-tight text-neutral-900">
        Svar per CV
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-neutral-600">
        Så många av ansökningarna med varje CV som fått svar. Använd det som
        fungerar bäst på de jobb du vill ha mest.
      </p>

      <ul className="mt-4 space-y-3">
        {comparison.rows.map((row, i) => (
          <li key={row.cvId}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate text-sm font-medium text-neutral-900">
                {row.name}
              </span>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-neutral-900">
                {row.replyRate} %
              </span>
            </div>

            {/* Stapeln är jämförelsen. Bara den bästa raden får accentfärg,
                så ögat hittar svaret utan att vi skriver ut det. */}
            <div
              className="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-100"
              role="presentation"
            >
              <div
                className={`h-full rounded-full ${i === 0 ? 'bg-orange-600' : 'bg-neutral-300'}`}
                style={{ width: `${Math.max(row.replyRate, 2)}%` }}
              />
            </div>

            <p className="mt-1 text-xs text-neutral-500 tabular-nums">
              {row.replies} svar på {row.applications}{' '}
              {row.applications === 1 ? 'ansökan' : 'ansökningar'}
            </p>
          </li>
        ))}
      </ul>

      {comparison.unknownCvCount > 0 ? (
        <p className="mt-4 border-t border-neutral-200 pt-3 text-xs text-neutral-500">
          {comparison.unknownCvCount === 1
            ? '1 ansökan saknar valt CV och räknas inte här.'
            : `${comparison.unknownCvCount} ansökningar saknar valt CV och räknas inte här.`}{' '}
          Välj CV när du loggar, så blir jämförelsen mer träffsäker.
        </p>
      ) : null}
    </section>
  );
}
