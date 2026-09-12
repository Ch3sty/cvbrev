'use client';

/**
 * Ett jobb som finns i träfflistan men som gratisnivån inte får se i klartext
 * (våg 1 punkt 5 i docs/plan-inloggat-omdesign.md).
 *
 * Kortet renderar aldrig titel, arbetsgivare eller ort, eftersom servern
 * (`/api/jobs/redact`) aldrig skickar dem. Det som visas är platsen i listan
 * och matchningsprocenten, så användaren ser att träffarna finns och hur bra
 * de är, men inte vilka de är. Poängen är att visa värdet före spärren utan
 * att ge bort det som spärren skyddar.
 *
 * Designsystemet: rounded-xl, border, ingen skugga, ingen orange yta. Den enda
 * orange ytan i vyn är betalväggens primärknapp under listan.
 */

import type { RedactedJob } from '@/app/api/jobs/redact/route';
import { IlluDoldTraff } from '@/components/illustrations/JobbmatchningIllustrations';

export default function RedactedJobCard({ job }: { job: RedactedJob }) {
  return (
    <div
      className="relative bg-white rounded-xl border border-neutral-200 p-5 select-none"
      aria-label={
        job.relevance !== null
          ? `Dold träff, matchar ditt CV till ${job.relevance} procent`
          : 'Dold träff'
      }
    >
      <div className="flex items-start gap-4">
        <span className="shrink-0 text-neutral-400" aria-hidden="true">
          <IlluDoldTraff size={48} />
        </span>

        <div className="flex-1 min-w-0">
          {job.relevance !== null ? (
            <p className="text-sm font-medium text-neutral-900 tabular-nums">
              {job.relevance} % matchar ditt CV
            </p>
          ) : (
            <p className="text-sm font-medium text-neutral-900">Träff i din lista</p>
          )}

          {/* Platshållarrader. Ingen text, bara ytan ett jobbkort tar. */}
          <div className="mt-3 space-y-2" aria-hidden="true">
            <div className="h-3 rounded bg-neutral-100 w-3/4" />
            <div className="h-3 rounded bg-neutral-100 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}
