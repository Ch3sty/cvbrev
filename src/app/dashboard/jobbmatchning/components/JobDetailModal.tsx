'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sheet from '@/components/shell/Sheet';
import { coverLetterPrefill } from '@/store/cover-letter-store';
import { capture } from '@/lib/analytics/events';

interface JobDetailModalProps {
  job: any | null;
  cvId?: string;
  onClose: () => void;
}

/**
 * Hela annonsen i ett ark: bottenark på mobil, dialog på desktop. Panelen
 * bär rubriken och fakta i meta, kraven ligger som listor och handlingarna
 * i arkets fot med en ink-knapp för ansökan.
 */
export default function JobDetailModal({ job, cvId, onClose }: JobDetailModalProps) {
  const router = useRouter();

  const applicationUrl =
    job?.application_details?.url || job?.application_url || job?.webpage_url;
  const isViaAF = job?.application_details?.via_af === true;
  const applyButtonText = isViaAF
    ? 'Ansök via Arbetsförmedlingen'
    : `Ansök hos ${job?.employer?.name || 'företaget'}`;

  const handleCreateLetter = () => {
    if (!cvId || !job) return;
    // Samma händelse som i listan: brevet är målet, oavsett var knappen satt.
    capture('match_letter_started', {
      job_id: String(job.id ?? ''),
      relevance:
        typeof job.relevance === 'number' ? Math.round(job.relevance) : undefined,
    });
    coverLetterPrefill.set({
      cvId,
      jobTitle: job.headline,
      company: job.employer?.name || '',
      jobDescription: buildJobDescription(job),
      jobAdUrl: applicationUrl || undefined,
    });
    router.push('/dashboard/skapa-brev');
  };

  // "Markera som sökt" direkt från annonsen, för jobb man söker utan brev.
  const [markState, setMarkState] = useState<'idle' | 'saving' | 'done'>('idle');
  useEffect(() => {
    setMarkState('idle');
  }, [job?.id]);

  const handleMarkApplied = async () => {
    if (!job || markState !== 'idle') return;
    setMarkState('saving');
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: job.headline || 'Okänd tjänst',
          company: job.employer?.name || 'Okänd arbetsgivare',
          location: job.workplace_address?.municipality || null,
          application_channel: 'ad',
          job_ad_url: applicationUrl || null,
          cv_id: cvId || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setMarkState('done');
      capture('match_applied', { job_id: String(job.id ?? '') });
    } catch (error) {
      console.error('Kunde inte markera som sökt:', error);
      setMarkState('idle');
    }
  };

  const meta = job
    ? [
        job.workplace_address
          ? [
              job.workplace_address.municipality,
              job.workplace_address.region,
              job.workplace_address.country,
            ]
              .filter(Boolean)
              .join(', ')
          : null,
        job.employment_type?.label ?? null,
        job.publication_date
          ? `Publicerad ${new Date(job.publication_date).toLocaleDateString('sv-SE')}`
          : null,
        job.application_deadline
          ? `Sista dag ${new Date(job.application_deadline).toLocaleDateString('sv-SE')}`
          : null,
      ].filter(Boolean)
    : [];

  const krav = job
    ? [
        job.experience_required ? 'Erfarenhet krävs' : null,
        job.driving_license_required ||
        (job.driving_license && job.driving_license.length > 0)
          ? job.driving_license?.length
            ? `Körkort: ${job.driving_license.map((l: any) => l.label).join(', ')}`
            : 'Körkort krävs'
          : null,
        job.access_to_own_car ? 'Tillgång till egen bil krävs' : null,
      ].filter(Boolean)
    : [];

  return (
    <Sheet
      open={!!job}
      onClose={onClose}
      title={job?.headline ?? 'Tjänsten'}
      description={job?.employer?.name ?? undefined}
      size="lg"
      footer={
        <div className="space-y-3">
          {applicationUrl && (
            <a
              href={applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-center text-sm font-semibold text-white hover:bg-ink-hover"
            >
              {applyButtonText}
            </a>
          )}
          <div className="flex flex-wrap items-center gap-4">
            {cvId && (
              <button
                type="button"
                onClick={handleCreateLetter}
                className="inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
              >
                Skapa personligt brev
              </button>
            )}
            <button
              type="button"
              onClick={handleMarkApplied}
              disabled={markState !== 'idle'}
              className="inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1 disabled:no-underline disabled:opacity-60"
            >
              {markState === 'done'
                ? 'Loggad som sökt'
                : markState === 'saving'
                ? 'Sparar'
                : 'Markera som sökt'}
            </button>
          </div>
        </div>
      }
    >
      {job && (
        <div className="space-y-5">
          {job.relevance !== undefined && (
            <div>
              <p className="text-tal tabular-nums text-ink-1">{job.relevance}</p>
              <p className="text-meta text-ink-3">procent match mot ditt CV</p>
            </div>
          )}

          {meta.length > 0 && <p className="text-meta text-ink-3">{meta.join(' · ')}</p>}

          {krav.length > 0 && (
            <section className="rounded-lg border border-kant bg-insunken p-3 shadow-insunken">
              <h3 className="text-sm font-medium text-ink-1">Viktiga krav</h3>
              <ul className="mt-1.5 space-y-1">
                {krav.map((k) => (
                  <li key={k as string} className="text-meta text-ink-2">
                    {k}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {job.description?.needs && (
            <Section title="Vi söker">
              <div
                className="prose prose-sm max-w-none text-ink-2"
                dangerouslySetInnerHTML={{ __html: job.description.needs }}
              />
            </Section>
          )}

          {job.description?.company_information && (
            <Section title="Om företaget">
              <div
                className="prose prose-sm max-w-none text-ink-2"
                dangerouslySetInnerHTML={{ __html: job.description.company_information }}
              />
            </Section>
          )}

          {job.description?.text && (
            <Section title="Arbetsuppgifter">
              <div
                className="prose prose-sm max-w-none whitespace-pre-wrap text-ink-2"
                dangerouslySetInnerHTML={{
                  __html: job.description.text_formatted || job.description.text,
                }}
              />
            </Section>
          )}

          <RequirementsBlock job={job} />

          {job.description?.conditions && (
            <Section title="Vi erbjuder">
              <div
                className="prose prose-sm max-w-none text-ink-2"
                dangerouslySetInnerHTML={{ __html: job.description.conditions }}
              />
            </Section>
          )}

          {(job.salary_description || job.access) && (
            <Section title="Villkor">
              {job.salary_description && (
                <p className="text-sm text-ink-2">Lön: {job.salary_description}</p>
              )}
              {job.access && <p className="text-sm text-ink-2">Tillträde: {job.access}</p>}
            </Section>
          )}

          {job.application_contacts &&
            (job.application_contacts.name ||
              job.application_contacts.email ||
              job.application_contacts.telephone) && (
              <Section title="Kontaktperson">
                <div className="space-y-1 text-sm text-ink-2">
                  {job.application_contacts.name && <p>{job.application_contacts.name}</p>}
                  {job.application_contacts.description && (
                    <p className="text-meta text-ink-3">
                      {job.application_contacts.description}
                    </p>
                  )}
                  {job.application_contacts.email && (
                    <p>
                      <a
                        href={`mailto:${job.application_contacts.email}`}
                        className="break-all text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
                      >
                        {job.application_contacts.email}
                      </a>
                    </p>
                  )}
                  {job.application_contacts.telephone && (
                    <p>
                      <a
                        href={`tel:${job.application_contacts.telephone}`}
                        className="text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
                      >
                        {job.application_contacts.telephone}
                      </a>
                    </p>
                  )}
                </div>
              </Section>
            )}
        </div>
      )}
    </Sheet>
  );
}

/**
 * Bygger en rik, naturlig jobbeskrivning från Arbetsförmedlingens job-objekt.
 * Inkluderar titel, foretag, plats, anstallningsform, deadlines, krav, samt
 * den ursprungliga annonstexten. Anvands som prefill till brev-wizarden sa
 * AI:n far full kontext utan att anvandaren behover skriva om allt.
 */
function buildJobDescription(job: any): string {
  const parts: string[] = [];

  if (job.headline) parts.push(job.headline);
  if (job.employer?.name) parts.push(`Företag: ${job.employer.name}`);

  const locationParts = [
    job.workplace_address?.municipality,
    job.workplace_address?.region,
    job.workplace_address?.country,
  ].filter(Boolean);
  if (locationParts.length > 0) {
    parts.push(`Plats: ${locationParts.join(', ')}`);
  }

  if (job.employment_type?.label) {
    parts.push(`Anställningsform: ${job.employment_type.label}`);
  }

  if (job.application_deadline) {
    const date = new Date(job.application_deadline).toLocaleDateString('sv-SE');
    parts.push(`Sista ansökningsdag: ${date}`);
  }

  // Krav (must_have)
  if (job.must_have) {
    const mustHave: string[] = [];
    if (job.must_have.skills?.length) {
      mustHave.push(
        `Kompetenser: ${job.must_have.skills.map((s: any) => s.label).join(', ')}`
      );
    }
    if (job.must_have.languages?.length) {
      mustHave.push(
        `Språk: ${job.must_have.languages.map((l: any) => l.label).join(', ')}`
      );
    }
    if (job.must_have.work_experiences?.length) {
      mustHave.push(
        `Erfarenhet: ${job.must_have.work_experiences.map((e: any) => e.label).join(', ')}`
      );
    }
    if (job.must_have.education?.length) {
      mustHave.push(
        `Utbildning: ${job.must_have.education.map((e: any) => e.label).join(', ')}`
      );
    }
    if (mustHave.length > 0) {
      parts.push(`\nKrav (måste):\n- ${mustHave.join('\n- ')}`);
    }
  }

  // Meriterande (nice_to_have)
  if (job.nice_to_have) {
    const niceToHave: string[] = [];
    if (job.nice_to_have.skills?.length) {
      niceToHave.push(
        `Kompetenser: ${job.nice_to_have.skills.map((s: any) => s.label).join(', ')}`
      );
    }
    if (job.nice_to_have.languages?.length) {
      niceToHave.push(
        `Språk: ${job.nice_to_have.languages.map((l: any) => l.label).join(', ')}`
      );
    }
    if (niceToHave.length > 0) {
      parts.push(`\nMeriterande:\n- ${niceToHave.join('\n- ')}`);
    }
  }

  // Annonstexten (huvudinnehållet)
  const stripHtml = (html: string) =>
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

  if (job.description?.text) {
    parts.push(`\nAnnonstext:\n${stripHtml(job.description.text)}`);
  }

  if (job.description?.needs && !job.description?.text) {
    parts.push(`\nVi söker:\n${stripHtml(job.description.needs)}`);
  }

  if (job.description?.company_information) {
    parts.push(
      `\nOm företaget:\n${stripHtml(job.description.company_information)}`
    );
  }

  return parts.join('\n\n').trim();
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-1.5 text-kort text-ink-1">{title}</h3>
      {children}
    </section>
  );
}

function RequirementsBlock({ job }: { job: any }) {
  const hasMustHave =
    job.must_have &&
    ((job.must_have.skills && job.must_have.skills.length > 0) ||
      (job.must_have.languages && job.must_have.languages.length > 0) ||
      (job.must_have.work_experiences && job.must_have.work_experiences.length > 0) ||
      (job.must_have.education && job.must_have.education.length > 0) ||
      (job.must_have.education_level && job.must_have.education_level.length > 0));

  const hasNiceToHave =
    job.nice_to_have &&
    ((job.nice_to_have.skills && job.nice_to_have.skills.length > 0) ||
      (job.nice_to_have.languages && job.nice_to_have.languages.length > 0) ||
      (job.nice_to_have.work_experiences && job.nice_to_have.work_experiences.length > 0) ||
      (job.nice_to_have.education && job.nice_to_have.education.length > 0) ||
      (job.nice_to_have.education_level && job.nice_to_have.education_level.length > 0));

  if (!hasMustHave && !hasNiceToHave) return null;

  return (
    <div
      className={`gap-5 rounded-lg border border-kant bg-insunken p-3 shadow-insunken ${
        hasMustHave && hasNiceToHave ? 'grid sm:grid-cols-2' : ''
      }`}
    >
      {hasMustHave && <ReqColumn data={job.must_have} title="Krav" />}
      {hasNiceToHave && <ReqColumn data={job.nice_to_have} title="Meriterande" />}
    </div>
  );
}

function ReqColumn({ data, title }: { data: any; title: string }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-medium text-ink-1">{title}</h4>
      <div className="space-y-3">
        {data.skills && data.skills.length > 0 && (
          <ReqGroup label="Kompetenser">
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((skill: any, i: number) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-md border border-kant bg-panel px-2 py-0.5 text-meta text-ink-2"
                >
                  {skill.label}
                </span>
              ))}
            </div>
          </ReqGroup>
        )}
        {data.languages && data.languages.length > 0 && (
          <ReqGroup label="Språk">
            <div className="flex flex-wrap gap-1.5">
              {data.languages.map((lang: any, i: number) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-md border border-kant bg-panel px-2 py-0.5 text-meta text-ink-2"
                >
                  {lang.label}
                </span>
              ))}
            </div>
          </ReqGroup>
        )}
        {data.work_experiences && data.work_experiences.length > 0 && (
          <ReqGroup label="Arbetserfarenhet">
            <ul className="space-y-1 text-meta text-ink-2">
              {data.work_experiences.map((exp: any, i: number) => (
                <li key={i}>{exp.label}</li>
              ))}
            </ul>
          </ReqGroup>
        )}
        {data.education && data.education.length > 0 && (
          <ReqGroup label="Utbildning">
            <ul className="space-y-1 text-meta text-ink-2">
              {data.education.map((edu: any, i: number) => (
                <li key={i}>{edu.label}</li>
              ))}
            </ul>
          </ReqGroup>
        )}
        {data.education_level && data.education_level.length > 0 && (
          <ReqGroup label="Utbildningsnivå">
            <ul className="space-y-1 text-meta text-ink-2">
              {data.education_level.map((level: any, i: number) => (
                <li key={i}>{level.label}</li>
              ))}
            </ul>
          </ReqGroup>
        )}
      </div>
    </div>
  );
}

function ReqGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-meta text-ink-3">{label}</p>
      {children}
    </div>
  );
}
