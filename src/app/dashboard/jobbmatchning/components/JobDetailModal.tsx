'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  X,
  ArrowLeft,
  Building2,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  AlertCircle,
  GraduationCap,
  Car,
  Search,
  Phone,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { coverLetterPrefill } from '@/store/cover-letter-store';

interface JobDetailModalProps {
  job: any | null;
  cvId?: string;
  onClose: () => void;
}

/**
 * Detalj-modal for ett enskilt jobb.
 * - Mobil: full-screen med tillbaka-pil
 * - Desktop: centrerad modal med backdrop
 * - Sticky bottom-bar med "Skapa brev" + "Ansok hos X"
 * - Orange/rod accent som matchar dashboarden
 */
export default function JobDetailModal({ job, cvId, onClose }: JobDetailModalProps) {
  const router = useRouter();

  const applicationUrl =
    job?.application_details?.url || job?.application_url || job?.webpage_url;
  const isViaAF = job?.application_details?.via_af === true;
  const applyButtonText = isViaAF
    ? 'Ansök via AF'
    : `Ansök hos ${job?.employer?.name || 'företaget'}`;

  const handleCreateLetter = () => {
    console.log('[handleCreateLetter] clicked', { cvId, hasJob: !!job });
    if (!cvId) {
      console.warn('[handleCreateLetter] aborted: no cvId. activeCV ej satt?');
      return;
    }
    if (!job) {
      console.warn('[handleCreateLetter] aborted: no job');
      return;
    }
    const data = {
      cvId,
      jobTitle: job.headline,
      company: job.employer?.name || '',
      jobDescription: buildJobDescription(job),
    };
    console.log('[handleCreateLetter] writing prefill', {
      cvId: data.cvId,
      jobTitle: data.jobTitle,
      company: data.company,
      jobDescriptionLength: data.jobDescription.length,
    });
    coverLetterPrefill.set(data);
    // Verifiera direkt att skrivningen lyckades
    const verify = coverLetterPrefill.read();
    console.log('[handleCreateLetter] post-write read:', {
      hasData: !!verify,
      jobDescriptionLength: verify?.jobDescription.length,
    });
    router.push('/dashboard/skapa-brev');
  };

  return (
    <AnimatePresence>
      {job && (
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] sm:flex sm:items-center sm:justify-center sm:p-4"
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full h-full sm:h-auto sm:max-w-3xl sm:max-h-[90vh] sm:rounded-3xl overflow-hidden flex flex-col"
        >
          {/* Header — sticky pa toppen */}
          <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-white">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-slate-700 hover:text-slate-900 -ml-2 px-2 py-2 rounded-lg hover:bg-slate-100 transition-colors touch-manipulation min-h-[44px]"
              aria-label="Stäng jobbdetaljer"
            >
              <ArrowLeft className="w-5 h-5 sm:hidden" />
              <span className="text-sm font-medium sm:hidden">Tillbaka</span>
              <X className="w-5 h-5 hidden sm:block" />
            </button>

            {job.relevance !== undefined && (
              <div
                className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                  job.relevance >= 70
                    ? 'bg-emerald-100 text-emerald-700'
                    : job.relevance >= 40
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
                title="Hur väl jobbet matchar ditt CV"
              >
                {job.relevance}% matchar ditt CV
              </div>
            )}
          </div>

          {/* Scrollable content */}
          <div
            className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6"
            style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
          >
            {/* Logo + titel + foretag */}
            <div className="flex items-start gap-3 sm:gap-4 mb-5">
              {job.logo_url ? (
                <img
                  src={job.logo_url}
                  alt={job.employer?.name || 'Företag'}
                  className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover bg-slate-100"
                />
              ) : (
                <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-xl sm:text-2xl">
                  {(job.employer?.name || 'U')
                    .split(' ')
                    .map((w: string) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-2 break-words">
                  {job.headline}
                </h2>
                <div className="flex items-center gap-2 text-slate-700">
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span className="font-semibold break-words">{job.employer?.name}</span>
                </div>
              </div>
            </div>

            {/* Meta-info */}
            <div className="space-y-2 mb-6 text-sm">
              {job.workplace_address && (
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="break-words">
                    {[
                      job.workplace_address.municipality,
                      job.workplace_address.region,
                      job.workplace_address.country,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}
              {job.employment_type && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Briefcase className="w-4 h-4 shrink-0" />
                  <span>{job.employment_type.label}</span>
                </div>
              )}
              {job.publication_date && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>
                    Publicerad {new Date(job.publication_date).toLocaleDateString('sv-SE')}
                  </span>
                </div>
              )}
              {job.application_deadline && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>
                    Sista ansökningsdag{' '}
                    {new Date(job.application_deadline).toLocaleDateString('sv-SE')}
                  </span>
                </div>
              )}
            </div>

            {/* Viktiga krav */}
            {(job.experience_required ||
              job.driving_license_required ||
              (job.driving_license && job.driving_license.length > 0) ||
              job.access_to_own_car) && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-bold text-amber-900">Viktiga krav</h3>
                </div>
                <div className="space-y-2 text-sm text-amber-800">
                  {job.experience_required && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 shrink-0" />
                      <span className="font-medium">Erfarenhet krävs</span>
                    </div>
                  )}
                  {(job.driving_license_required ||
                    (job.driving_license && job.driving_license.length > 0)) && (
                    <div className="flex items-start gap-2">
                      <Car className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium mb-1">Körkort krävs</p>
                        {job.driving_license && job.driving_license.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {job.driving_license.map((license: any, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-700 rounded text-xs font-medium"
                              >
                                {license.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {job.access_to_own_car && (
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 shrink-0" />
                      <span className="font-medium">Tillgång till egen bil krävs</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Strukturerad beskrivning */}
            <div className="space-y-6">
              {job.description?.needs && (
                <Section icon={Search} title="Vi söker">
                  <div
                    className="text-slate-700 prose max-w-none prose-sm"
                    dangerouslySetInnerHTML={{ __html: job.description.needs }}
                  />
                </Section>
              )}

              {job.description?.company_information && (
                <Section icon={Building2} title="Om företaget">
                  <div
                    className="text-slate-700 prose max-w-none prose-sm"
                    dangerouslySetInnerHTML={{ __html: job.description.company_information }}
                  />
                </Section>
              )}

              {job.description?.text && (
                <Section icon={Briefcase} title="Arbetsuppgifter">
                  <div
                    className="text-slate-700 prose max-w-none prose-sm whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: job.description.text_formatted || job.description.text,
                    }}
                  />
                </Section>
              )}

              {/* Krav (måste) + Meriterande */}
              <RequirementsBlock job={job} />

              {/* Villkor / Conditions */}
              {job.description?.conditions && (
                <Section title="Vi erbjuder">
                  <div
                    className="text-slate-700 prose max-w-none prose-sm"
                    dangerouslySetInnerHTML={{ __html: job.description.conditions }}
                  />
                </Section>
              )}

              {/* Salary & Benefits */}
              {(job.salary_description || job.access) && (
                <div className="p-4 bg-blue-50 rounded-2xl">
                  <h3 className="text-base font-bold text-slate-900 mb-2">Villkor</h3>
                  {job.salary_description && (
                    <p className="text-sm text-slate-700 mb-1">
                      <strong>Lön:</strong> {job.salary_description}
                    </p>
                  )}
                  {job.access && (
                    <p className="text-sm text-slate-700">
                      <strong>Tillträde:</strong> {job.access}
                    </p>
                  )}
                </div>
              )}

              {/* Kontaktperson */}
              {job.application_contacts &&
                (job.application_contacts.name ||
                  job.application_contacts.email ||
                  job.application_contacts.telephone) && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Phone className="w-5 h-5 text-orange-600" />
                      <h3 className="text-base font-bold text-orange-900">Kontaktperson</h3>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      {job.application_contacts.name && (
                        <p className="text-slate-800">
                          <strong>Namn:</strong> {job.application_contacts.name}
                        </p>
                      )}
                      {job.application_contacts.description && (
                        <p className="text-slate-700">{job.application_contacts.description}</p>
                      )}
                      {job.application_contacts.email && (
                        <p className="text-slate-800">
                          <strong>E-post:</strong>{' '}
                          <a
                            href={`mailto:${job.application_contacts.email}`}
                            className="text-orange-600 hover:underline break-all"
                          >
                            {job.application_contacts.email}
                          </a>
                        </p>
                      )}
                      {job.application_contacts.telephone && (
                        <p className="text-slate-800">
                          <strong>Telefon:</strong>{' '}
                          <a
                            href={`tel:${job.application_contacts.telephone}`}
                            className="text-orange-600 hover:underline"
                          >
                            {job.application_contacts.telephone}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Padding så sticky bottom-bar inte täcker innehållet */}
            <div className="h-4" />
          </div>

          {/* Sticky bottom-bar med Skapa personligt brev + Ansok.
              Pa mobil maste vi lyfta baren over MobileBottomNav (~80px hojd
              + safe-area). Pa desktop ar nav-baren gomd (lg:hidden) sa
              standard-padding racker. */}
          {(cvId || applicationUrl) && (
            <div
              className="flex-shrink-0 flex flex-col sm:flex-row gap-2 sm:gap-3 px-3 sm:px-4 pt-3 sm:pt-4 pb-3 sm:pb-4 border-t border-slate-200 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.04)] z-[1] mb-[calc(env(safe-area-inset-bottom)+88px)] lg:mb-0"
            >
              {cvId && (
                <button
                  onClick={handleCreateLetter}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 border-2 border-orange-200 text-orange-700 bg-white rounded-xl text-sm font-semibold hover:bg-orange-50 hover:border-orange-300 transition-colors touch-manipulation min-h-[48px]"
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>Skapa personligt brev</span>
                </button>
              )}
              {applicationUrl && (
                <a
                  href={applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-[2] flex items-center justify-center gap-1.5 px-3 py-3 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all touch-manipulation min-h-[48px] text-center break-words"
                  style={{ background: 'linear-gradient(90deg, #F97316, #DC2626)' }}
                >
                  <span className="break-words">{applyButtonText}</span>
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </a>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
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

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon?: typeof Search;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-orange-600" />}
        {title}
      </h3>
      {children}
    </div>
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
      className={`gap-6 p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 ${
        hasMustHave && hasNiceToHave ? 'grid sm:grid-cols-2' : ''
      }`}
    >
      {hasMustHave && <ReqColumn data={job.must_have} title="Krav (måste)" tone="red" />}
      {hasNiceToHave && (
        <ReqColumn data={job.nice_to_have} title="Meriterande" tone="green" />
      )}
    </div>
  );
}

function ReqColumn({
  data,
  title,
  tone,
}: {
  data: any;
  title: string;
  tone: 'red' | 'green';
}) {
  const titleClass = tone === 'red' ? 'text-red-700' : 'text-emerald-700';
  const pillClass =
    tone === 'red'
      ? 'bg-red-50 border-red-200 text-red-700'
      : 'bg-emerald-50 border-emerald-200 text-emerald-700';

  return (
    <div>
      <h3 className={`text-base font-bold mb-3 ${titleClass}`}>{title}</h3>
      <div className="space-y-3">
        {data.skills && data.skills.length > 0 && (
          <ReqGroup label="Kompetenser">
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((skill: any, i: number) => (
                <span
                  key={i}
                  className={`px-2 py-1 border rounded text-xs font-medium ${pillClass}`}
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
                <span key={i} className={`px-2 py-1 border rounded text-xs ${pillClass}`}>
                  {lang.label}
                </span>
              ))}
            </div>
          </ReqGroup>
        )}
        {data.work_experiences && data.work_experiences.length > 0 && (
          <ReqGroup label="Arbetserfarenhet">
            <ul className="text-sm text-slate-600 space-y-1">
              {data.work_experiences.map((exp: any, i: number) => (
                <li key={i}>• {exp.label}</li>
              ))}
            </ul>
          </ReqGroup>
        )}
        {data.education && data.education.length > 0 && (
          <ReqGroup label="Utbildning">
            <ul className="text-sm text-slate-600 space-y-1">
              {data.education.map((edu: any, i: number) => (
                <li key={i}>• {edu.label}</li>
              ))}
            </ul>
          </ReqGroup>
        )}
        {data.education_level && data.education_level.length > 0 && (
          <ReqGroup label="Utbildningsnivå">
            <ul className="text-sm text-slate-600 space-y-1">
              {data.education_level.map((level: any, i: number) => (
                <li key={i}>• {level.label}</li>
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
      <p className="text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
        {label}
      </p>
      {children}
    </div>
  );
}
