'use client';

import { motion } from 'framer-motion';
import {
  Award,
  Briefcase,
  Compass,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from 'lucide-react';
import PortalCard from '../PortalCard';
import WorkStyleCard from './WorkStyleCard';
import {
  AVAILABILITY_OPTIONS,
  WORKPLACE_OPTIONS,
  EXTENT_OPTIONS,
  FAMILY_LABELS,
  LEVEL_LABELS,
  CONTEXT_TAG_MICROCOPY,
  labelFor,
  seniorityFacts,
  formatShortDate,
  type CandidateDetail,
  type InterestStatus,
} from '../types';

interface ProfileSectionsProps {
  candidate: CandidateDetail;
  interestStatus: InterestStatus;
  /** Delad vy: inga åtgärder, ingen kontaktinfo utöver det maskerade. */
  readOnly?: boolean;
}

/**
 * Detaljprofilens sektioner i beslutsstödsordningen: hero, pitch,
 * snabbsammanfattning, verifierade resultat, arbetsstil, erfarenhet,
 * utbildning, språk och villkor sist. Återanvänds ordagrant av den delade
 * hiring manager-vyn (readOnly).
 */
export default function ProfileSections({
  candidate,
  interestStatus,
  readOnly = false,
}: ProfileSectionsProps) {
  const unlocked = interestStatus === 'accepted' || candidate.visibility === 'open';

  return (
    <div className="space-y-5">
      <Hero candidate={candidate} interestStatus={interestStatus} readOnly={readOnly} />

      {/* Pitch: kandidatens egna ord */}
      {candidate.pitch && (
        <motion.blockquote
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.03 }}
          className="relative rounded-3xl border border-orange-100 bg-orange-50/60 px-5 sm:px-6 py-4 sm:py-5"
        >
          <span
            className="absolute top-2 left-4 text-4xl leading-none font-serif text-orange-300 select-none"
            aria-hidden="true"
          >
            ”
          </span>
          <p className="pl-6 text-[14px] sm:text-[14.5px] text-slate-800 leading-relaxed italic">
            {candidate.pitch}
          </p>
          <footer className="pl-6 mt-1.5 text-[11.5px] font-bold uppercase tracking-wide text-orange-700/70">
            Kandidatens egna ord
          </footer>
        </motion.blockquote>
      )}

      <QuickSummary candidate={candidate} />

      <VerifiedResults candidate={candidate} />

      <WorkStyleCard candidate={candidate} unlocked={unlocked} delay={0.1} />

      {/* Arbetslivserfarenhet */}
      {candidate.experience.length > 0 && (
        <PortalCard title="Arbetslivserfarenhet" delay={0.12}>
          <div className="space-y-4">
            {candidate.experience.map((exp, i) => (
              <div key={i} className="flex gap-3">
                <span
                  className="flex-shrink-0 w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600"
                  aria-hidden="true"
                >
                  <Briefcase className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">{exp.position ?? 'Roll'}</p>
                  <p className="text-[12.5px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                    {exp.company ? (
                      <span>{exp.company}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 text-[11px] font-bold">
                        <Lock className="w-3 h-3" aria-hidden="true" />
                        Visas efter accepterad kontakt
                      </span>
                    )}
                    {exp.period && <span>· {exp.period}</span>}
                  </p>
                  {exp.description && (
                    <p className="mt-1 text-[13px] text-slate-600 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </PortalCard>
      )}

      {/* Utbildning */}
      {candidate.education.length > 0 && (
        <PortalCard title="Utbildning" delay={0.15}>
          <div className="space-y-4">
            {candidate.education.map((edu, i) => (
              <div key={i} className="flex gap-3">
                <span
                  className="flex-shrink-0 w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600"
                  aria-hidden="true"
                >
                  <GraduationCap className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">{edu.degree ?? 'Utbildning'}</p>
                  <p className="text-[12.5px] text-slate-500">
                    {[edu.school, edu.year].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </PortalCard>
      )}

      {/* Språk */}
      {candidate.languages.length > 0 && (
        <PortalCard title="Språk" delay={0.18}>
          <div className="flex flex-wrap gap-1.5">
            {candidate.languages.map((language) => (
              <span
                key={language}
                className="text-[12px] font-semibold rounded-full px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600"
              >
                {language}
              </span>
            ))}
          </div>
        </PortalCard>
      )}

      {/* Villkor, sist */}
      <TermsCard candidate={candidate} />
    </div>
  );
}

// ---------------------------------------------------------------------------

function Hero({
  candidate,
  interestStatus,
  readOnly,
}: {
  candidate: CandidateDetail;
  interestStatus: InterestStatus;
  readOnly: boolean;
}) {
  const roleLabel = candidate.role ?? 'Kandidat';
  const displayName = candidate.fullName ?? roleLabel;
  const region = candidate.regions[0] ?? null;
  const seniority = seniorityFacts(candidate);
  const activeSince = formatShortDate(candidate.activeSince);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative bg-white rounded-3xl border border-orange-100 p-5 sm:p-6 overflow-hidden"
      style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
    >
      <div
        className="absolute top-0 inset-x-0 h-0.5"
        style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626, #BE185D)' }}
        aria-hidden="true"
      />
      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)' }}
          aria-hidden="true"
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight truncate">
            {displayName}
          </h1>
          <p className="text-[13px] text-slate-500 truncate">
            {[
              candidate.fullName ? roleLabel : null,
              region,
              candidate.visibility === 'open' ? 'Öppen profil' : 'Anonym profil',
              activeSince ? `aktiv i poolen sedan ${activeSince}` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
      </div>

      {seniority.length > 0 && (
        <p className="text-[12px] font-medium text-slate-600 leading-relaxed -mt-2 mb-3">
          {seniority.join(' · ')}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {candidate.testBadges.map((badge) => (
          <span
            key={badge.family}
            className="inline-flex items-center gap-1.5 text-[11.5px] font-bold rounded-full px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-900"
          >
            <span className="w-1.5 h-1.5 rounded-sm bg-orange-500 rotate-45" aria-hidden="true" />
            {badge.label}
          </span>
        ))}
        {candidate.skills.map((skill) => (
          <span
            key={skill}
            className="text-[11.5px] font-semibold rounded-full px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Kandidatens självvalda kontexttaggar */}
      {candidate.contextTags.length > 0 && (
        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11.5px] font-bold uppercase tracking-wide text-slate-400">
              Söker mig till
            </span>
            {candidate.contextTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 text-[11.5px] font-bold rounded-full px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800"
              >
                <Compass className="w-3 h-3" aria-hidden="true" />
                {tag}
              </span>
            ))}
          </div>
          <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
            {CONTEXT_TAG_MICROCOPY}
          </p>
        </div>
      )}

      {/* Upplåst kontakt visas direkt i heron (kontaktkortet är ute ur flödet) */}
      {!readOnly && interestStatus === 'accepted' && (candidate.fullName || candidate.email) && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-3">
          <p className="text-[12px] font-bold uppercase tracking-wide text-emerald-700 mb-1.5">
            Kontakt upplåst
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
            {candidate.fullName && (
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-800">
                <User className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                {candidate.fullName}
              </span>
            )}
            {candidate.email && (
              <a
                href={`mailto:${candidate.email}`}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:underline break-all"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                {candidate.email}
              </a>
            )}
          </div>
          <p className="mt-1.5 text-[12px] text-emerald-700/80 leading-relaxed">
            Kandidaten vet att uppgifterna delats med er.
          </p>
        </div>
      )}
    </motion.div>
  );
}

/** Snabbsammanfattning: Erfarenhet / Bäst i / Arbetsstil som tre minikort. */
function QuickSummary({ candidate }: { candidate: CandidateDetail }) {
  let best: { family: string; percentile: number } | null = null;
  for (const badge of candidate.testBadges) {
    if (badge.percentile !== null && (!best || badge.percentile > best.percentile)) {
      best = { family: FAMILY_LABELS[badge.family], percentile: badge.percentile };
    }
  }

  const cards = [
    candidate.yearsOfExperience !== null
      ? {
          icon: Briefcase,
          label: 'Erfarenhet',
          value: `${candidate.yearsOfExperience} år`,
          sub: candidate.latestRole ? `Senast: ${candidate.latestRole.title}` : null,
        }
      : null,
    best
      ? {
          icon: Award,
          label: 'Bäst i',
          value: best.family,
          sub: `Topp ${Math.max(1, 100 - best.percentile)} % av testade`,
        }
      : null,
    candidate.workStyleArchetype
      ? {
          icon: Compass,
          label: 'Arbetsstil',
          value: candidate.workStyleArchetype,
          sub: null,
        }
      : null,
  ].filter((c): c is NonNullable<typeof c> => c !== null);

  if (cards.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
      className="grid gap-3 sm:grid-cols-3"
    >
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-orange-100 bg-white px-4 py-3.5"
          style={{ boxShadow: '0 4px 14px -10px rgba(2, 6, 23, 0.12)' }}
        >
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            <card.icon className="w-3.5 h-3.5" aria-hidden="true" />
            {card.label}
          </p>
          <p className="mt-1 text-[15px] font-extrabold text-slate-900 leading-tight">
            {card.value}
          </p>
          {card.sub && <p className="mt-0.5 text-[12px] text-slate-500 truncate">{card.sub}</p>}
        </div>
      ))}
    </motion.div>
  );
}

function VerifiedResults({ candidate }: { candidate: CandidateDetail }) {
  if (candidate.testResults.length === 0) return null;
  return (
    <PortalCard
      title="Verifierade resultat"
      sub="Slutförda rekryteringstester på Jobbcoach.ai. Verifierat resultat är alltid första slutförda försöket per nivå."
      delay={0.08}
    >
      <div className="space-y-2">
        {candidate.testResults.map((result) => (
          <div
            key={`${result.family}-${result.level}`}
            className="flex items-center justify-between gap-3 flex-wrap rounded-xl border border-orange-100 bg-orange-50/30 px-3.5 py-2.5"
          >
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck className="w-4 h-4 text-orange-600 flex-shrink-0" aria-hidden="true" />
              <span className="text-[13px] font-bold text-slate-800 truncate">
                {FAMILY_LABELS[result.family]} · {LEVEL_LABELS[result.level]}
              </span>
              <span className="text-[11.5px] font-semibold text-slate-400 flex-shrink-0">
                {result.attempts === 1 ? '1 försök' : `${result.attempts} försök`}
              </span>
            </div>
            <span className="text-[12.5px] font-bold text-orange-800 flex-shrink-0">
              {result.percentile !== null
                ? `Topp ${Math.max(1, 100 - result.percentile)} % av ${result.sampleSize ?? '?'} testade`
                : `${result.bestScore}% rätt${
                    result.sampleSize ? ` · ${result.sampleSize} testade hittills` : ''
                  }`}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[12px] text-slate-400 leading-relaxed">
        Percentilerna jämför kandidaten med alla som gjort samma test hos oss.
      </p>
    </PortalCard>
  );
}

function TermsCard({ candidate }: { candidate: CandidateDetail }) {
  const terms = [
    { label: 'Tillträde', value: labelFor(AVAILABILITY_OPTIONS, candidate.availability) },
    {
      label: 'Arbetsplats',
      value:
        candidate.workplace.map((w) => labelFor(WORKPLACE_OPTIONS, w)).filter(Boolean).join(', ') ||
        null,
    },
    {
      label: 'Omfattning',
      value:
        candidate.extent.map((e) => labelFor(EXTENT_OPTIONS, e)).filter(Boolean).join(', ') || null,
    },
    { label: 'Regioner', value: candidate.regions.join(', ') || null },
    { label: 'Körkort', value: candidate.driversLicense ? 'B-körkort' : null },
  ].filter((t) => t.value);

  if (terms.length === 0) return null;

  return (
    <PortalCard title="Villkor" delay={0.2}>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {terms.map((term) => (
          <div key={term.label}>
            <dt className="text-[11.5px] font-bold uppercase tracking-wide text-slate-400">
              {term.label}
            </dt>
            <dd className="text-[13.5px] font-semibold text-slate-800 mt-0.5">{term.value}</dd>
          </div>
        ))}
      </dl>
    </PortalCard>
  );
}
