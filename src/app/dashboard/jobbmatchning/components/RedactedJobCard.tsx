'use client';

/**
 * Ett jobb som finns i träfflistan men som gratisnivån inte får se i klartext
 * (våg 1 punkt 5 i docs/plan-inloggat-omdesign.md).
 *
 * Raden renderar aldrig titel, arbetsgivare eller ort, eftersom servern
 * (`/api/jobs/redact`) aldrig skickar dem. Det som visas är platsen i listan
 * och matchningsprocenten, så användaren ser att träffarna finns och hur bra
 * de är, men inte vilka de är. Värdet syns före spärren utan att spärren
 * ger bort det den skyddar.
 *
 * Tråden: en rad i insunken, ingen orange. Föräldern lägger raderna i en
 * panel med divide-y.
 */

import type { RedactedJob } from '@/app/api/jobs/redact/route';
import { IlluDoldTraff } from '@/components/illustrations/JobbmatchningIllustrations';

export default function RedactedJobCard({ job }: { job: RedactedJob }) {
  return (
    <div
      className="flex min-h-14 select-none items-center gap-3 bg-insunken px-4 py-3"
      aria-label={
        job.relevance !== null
          ? `Dold träff, matchar ditt CV till ${job.relevance} procent`
          : 'Dold träff'
      }
    >
      <span className="shrink-0 text-ink-3" aria-hidden="true">
        <IlluDoldTraff size={24} />
      </span>

      <div className="min-w-0 flex-1" aria-hidden="true">
        {/* Platshållarrader. Ingen text, bara ytan en träff tar. */}
        <div className="h-3 w-2/3 rounded bg-kant" />
        <div className="mt-2 h-3 w-1/3 rounded bg-kant" />
      </div>

      <div className="shrink-0 text-right">
        {job.relevance !== null ? (
          <>
            <p className="text-sm font-medium tabular-nums text-ink-1">{job.relevance} %</p>
            <div className="mt-1 h-0.5 w-16 bg-kant" aria-hidden="true">
              <div className="h-full bg-ink-1" style={{ width: `${job.relevance}%` }} />
            </div>
          </>
        ) : (
          <p className="text-meta text-ink-3">Dold träff</p>
        )}
      </div>
    </div>
  );
}
