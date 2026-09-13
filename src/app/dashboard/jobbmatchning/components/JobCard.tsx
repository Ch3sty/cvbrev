'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { useCoverLetterStore } from '@/store/cover-letter-store';

interface JobCardProps {
  job: any;
  index: number;
  onSelect: (job: any) => void;
  selectedAnalysisId?: string;
  cvId?: string;
}

/**
 * Ett jobb i träfflistan. Panel med matchningen som stort tal, titel som
 * kortrubrik och fakta i meta. Handlingarna är en ink-knapp för ansökan och
 * en textlänk för brevet. Ingen skugga, ingen färgkodad badge.
 */
export default function JobCard({ job, onSelect, cvId }: JobCardProps) {
  const router = useRouter();
  const { setPrefillData } = useCoverLetterStore();

  const applicationUrl =
    job.application_details?.url || job.application_url || job.webpage_url;
  const isViaAF = job.application_details?.via_af === true;
  const skills: any[] = job.must_have?.skills ?? [];

  const deadlineText = (() => {
    if (!job.application_deadline) return null;
    const deadline = new Date(job.application_deadline);
    const daysLeft = Math.ceil(
      (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysLeft < 0) return { text: 'Ansökningstiden har gått ut', urgent: false, gone: true };
    if (daysLeft <= 7)
      return {
        text: `${daysLeft} dag${daysLeft === 1 ? '' : 'ar'} kvar att söka`,
        urgent: true,
        gone: false,
      };
    return {
      text: `Sista dag ${deadline.toLocaleDateString('sv-SE')}`,
      urgent: false,
      gone: false,
    };
  })();

  return (
    <article className="rounded-xl border border-kant bg-panel">
      <button
        type="button"
        onClick={() => onSelect(job)}
        className="block w-full p-4 text-left hover:bg-insunken"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-kort text-ink-1">{job.headline}</h3>
            <p className="mt-0.5 text-meta text-ink-3">
              {job.employer?.name || 'Okänt företag'}
              {job.workplace_address && (
                <>
                  {' · '}
                  {job.workplace_address.municipality || job.workplace_address.region}
                  {job.distance !== null &&
                    job.distance !== undefined &&
                    job.distance <= 100 && <> ({Math.round(job.distance)} km)</>}
                </>
              )}
            </p>
          </div>

          {job.relevance !== undefined && (
            <div className="shrink-0 text-right">
              <p className="text-tal tabular-nums text-ink-1">{job.relevance}</p>
              <p className="text-meta text-ink-3">% match</p>
            </div>
          )}
        </div>

        <p className="mt-3 line-clamp-3 text-sm leading-[22px] text-ink-2">
          {job.description?.text || job.description?.needs || 'Ingen beskrivning tillgänglig'}
        </p>

        {(job.employment_type || job.scope_of_work || job.experience_required) && (
          <p className="mt-2 text-meta text-ink-3">
            {[
              job.employment_type?.label,
              job.scope_of_work && (job.scope_of_work.min || job.scope_of_work.max)
                ? job.scope_of_work.min === job.scope_of_work.max
                  ? `${job.scope_of_work.min} %`
                  : `${job.scope_of_work.min || 0}-${job.scope_of_work.max || 100} %`
                : null,
              job.experience_required ? 'Erfarenhet krävs' : null,
              job.driving_license_required ||
              (job.driving_license && job.driving_license.length > 0)
                ? job.driving_license?.[0]?.label || 'Körkort'
                : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}

        {skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {skills.slice(0, 5).map((skill: any, i: number) => (
              <span
                key={i}
                className="inline-flex items-center rounded-md border border-kant bg-insunken px-2 py-0.5 text-meta text-ink-2"
              >
                {skill.label}
              </span>
            ))}
            {skills.length > 5 && (
              <span className="inline-flex items-center px-1 text-meta text-ink-3">
                +{skills.length - 5} till
              </span>
            )}
          </div>
        )}

        <p className="mt-3 flex items-center gap-1 text-meta text-ink-3">
          <span>Läs mer om tjänsten</span>
          <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
        </p>
      </button>

      <div className="border-t border-kant px-4 py-3">
        <p className="text-meta text-ink-3">
          {job.publication_date
            ? `Publicerad ${new Date(job.publication_date).toLocaleDateString('sv-SE')}`
            : 'Publiceringsdatum okänt'}
          {deadlineText && (
            <>
              {' · '}
              <span className={deadlineText.urgent || deadlineText.gone ? 'text-varning' : undefined}>
                {deadlineText.text}
              </span>
            </>
          )}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {applicationUrl && (
            <a
              href={applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover"
            >
              {isViaAF ? 'Ansök via Arbetsförmedlingen' : 'Ansök'}
            </a>
          )}

          {cvId && (
            <button
              type="button"
              onClick={() => {
                setPrefillData({
                  cvId: cvId,
                  jobTitle: job.headline,
                  company: job.employer.name,
                  jobDescription: `${job.headline}\n\nFöretag: ${job.employer.name}\n\n${job.description.text}`,
                });
                router.push('/dashboard/skapa-brev');
              }}
              className="inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
            >
              Skapa personligt brev
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
