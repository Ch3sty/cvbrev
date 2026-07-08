'use client';

import SectionCard from './SectionCard';
import CardWorkStyleStrip from '@/components/candidate/CardWorkStyleStrip';
import {
  AVAILABILITY_OPTIONS,
  FAMILY_LABELS,
  WORKPLACE_OPTIONS,
  EXTENT_OPTIONS,
  labelFor,
  type CandidateProfileState,
  type CvOption,
  type FamilyKey,
  type SummaryData,
} from './types';

interface RecruiterPreviewCardProps {
  profile: CandidateProfileState;
  summary: SummaryData | null;
  cvs: CvOption[];
  fullName: string | null;
  lastMode: 'anonymous' | 'open';
}

const FAMILY_ORDER: FamilyKey[] = ['matrislogik', 'verbal', 'numerisk'];

/**
 * Så ser rekryterare dig: kandidatkortet byggt live av riktig data.
 * Anonymt läge visar avatar med rollens initial, öppet läge visar namnet.
 */
export default function RecruiterPreviewCard({
  profile,
  summary,
  cvs,
  fullName,
  lastMode,
}: RecruiterPreviewCardProps) {
  const isOn = profile.visibility !== 'off';
  const mode = isOn ? profile.visibility : lastMode;
  const isOpen = mode === 'open';

  // OBS: falla ALDRIG tillbaka på CV:ts filnamn — det innehåller ofta
  // användarens namn och skulle läcka identiteten i anonymt läge.
  const role = summary?.skills?.occupation ?? null;
  const roleLabel = role ?? 'Kandidat';

  const region = profile.regions[0] ?? summary?.skills?.location ?? null;
  const displayName = isOpen && fullName ? fullName : roleLabel;
  const avatarInitial = (isOpen && fullName ? fullName : roleLabel).charAt(0).toUpperCase();

  const testBadges = FAMILY_ORDER.filter((key) => summary?.results?.[key]?.done).map((key) => {
    const result = summary!.results[key];
    return {
      key,
      label:
        result.percentile !== null
          ? `${FAMILY_LABELS[key]} · topp ${Math.max(1, 100 - result.percentile)} %`
          : `${FAMILY_LABELS[key]} · ${result.bestScore}% rätt`,
    };
  });

  const personalityChips =
    profile.show_personality && summary?.personality?.done ? summary.personality.strengths : [];

  // Arbetsstilen delas med samma samtycke som styrkorna (show_personality).
  const workStyle = profile.show_personality ? summary?.personality?.workStyle ?? null : null;
  // Kortets två spektra + trivs-rad, exakt det rekryteraren ser.
  const cardWorkStyle = profile.show_personality
    ? summary?.personality?.cardWorkStyle ?? null
    : null;

  const skillChips = (summary?.skills?.skills ?? []).slice(0, 5);

  // Senioritetsraden: samma tre fakta som rekryterarnas träffkort visar.
  const sen = summary?.seniority;
  const seniorityRow = [
    sen?.yearsOfExperience ? `${sen.yearsOfExperience} års erfarenhet` : null,
    sen?.latestRole
      ? `Senast: ${sen.latestRole.title}${sen.latestRole.years ? ` (${sen.latestRole.years} år)` : ''}`
      : null,
    sen?.educationLevel ?? null,
  ].filter(Boolean) as string[];

  const footParts = [
    labelFor(AVAILABILITY_OPTIONS, profile.availability),
    profile.workplace.length > 0
      ? profile.workplace.map((w) => labelFor(WORKPLACE_OPTIONS, w)).filter(Boolean).join('/')
      : null,
    profile.extent.length > 0
      ? profile.extent.map((e) => labelFor(EXTENT_OPTIONS, e)).filter(Boolean).join('/')
      : null,
    profile.drivers_license ? 'B-körkort' : null,
  ].filter(Boolean) as string[];

  return (
    <SectionCard
      title="Så ser rekryterare dig just nu"
      sub="Förhandsvisningen uppdateras live när du ändrar CV, läge eller villkor."
      delay={0.3}
      headerExtra={
        !isOn ? (
          <span className="text-[11px] font-bold tracking-wide rounded-full px-2.5 py-1 bg-slate-100 text-slate-500">
            Ej synlig
          </span>
        ) : undefined
      }
    >
      <div
        className={`w-full rounded-2xl border border-orange-100 bg-white p-4 sm:p-5 ${
          !isOn ? 'opacity-70' : ''
        }`}
        style={{ boxShadow: '0 4px 14px -10px rgba(2, 6, 23, 0.18)' }}
      >
        {/* Huvud */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)' }}
            aria-hidden="true"
          >
            {avatarInitial}
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-bold text-slate-900 leading-tight truncate">
              {displayName}
            </div>
            <div className="text-[12.5px] text-slate-500 truncate">
              {[region, isOpen ? 'Öppen profil' : 'Anonym'].filter(Boolean).join(' · ')}
            </div>
          </div>
        </div>

        {/* Senioritet: samma rad som rekryterarnas träffkort */}
        {seniorityRow.length > 0 && (
          <p className="text-[12px] text-slate-600 leading-relaxed -mt-1 mb-2.5">
            <span className="font-bold text-slate-900">{seniorityRow[0]}</span>
            {seniorityRow.slice(1).map((fact) => (
              <span key={fact}>
                {' · '}
                {fact}
              </span>
            ))}
          </p>
        )}

        {/* Pitch: kandidatens egna ord */}
        {(profile.pitch ?? '').trim().length > 0 && (
          <p className="mb-2.5 text-[12.5px] italic text-slate-600 leading-relaxed line-clamp-2">
            &rdquo;{profile.pitch!.trim()}&rdquo;
          </p>
        )}

        {/* Söker mig till: kandidatens egna kontexttaggar, självpresentation */}
        {profile.context_tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Söker mig till
            </span>
            {profile.context_tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-semibold rounded-full px-2.5 py-0.5 border border-indigo-300 text-indigo-700 bg-white"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Rad 1: verifierat (testresultat + styrkor) */}
        {(testBadges.length > 0 || personalityChips.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {testBadges.map((badge) => (
              <span
                key={badge.key}
                className="inline-flex items-center gap-1.5 text-[11.5px] font-bold rounded-full px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-900"
              >
                <span className="w-1.5 h-1.5 rounded-sm bg-orange-500 rotate-45" aria-hidden="true" />
                {badge.label}
              </span>
            ))}
            {personalityChips.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-1.5 text-[11.5px] font-bold rounded-full px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" aria-hidden="true" />
                {chip}
              </span>
            ))}
          </div>
        )}

        {/* Arbetsstil: exakt det rekryteraren ser, arketyp + två spektra + trivs-rad */}
        {workStyle && (
          <div className="mb-2.5 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2.5">
            <p className="text-[12.5px] font-bold text-indigo-900">
              {workStyle.archetype.title}
            </p>
            {cardWorkStyle ? (
              <div className="mt-2">
                <CardWorkStyleStrip data={cardWorkStyle} thrivesForm="candidate" />
              </div>
            ) : (
              <ul className="mt-1 space-y-0.5">
                {workStyle.statements.slice(0, 2).map((statement) => (
                  <li
                    key={statement}
                    className="flex items-start gap-1.5 text-[11.5px] text-indigo-900/70 leading-snug"
                  >
                    <span
                      className="w-1 h-1 rounded-full bg-indigo-400 flex-shrink-0 mt-[5px]"
                      aria-hidden="true"
                    />
                    {statement}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Rad 2: kompetenser ur CV:t */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {skillChips.map((skill) => (
            <span
              key={skill}
              className="text-[11.5px] font-semibold rounded-full px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600"
            >
              {skill}
            </span>
          ))}
          {!role && (
            <span className="text-[12px] text-slate-400">
              Din yrkesroll saknas ännu. Analysera ditt CV så hämtar vi roll och
              kompetenser automatiskt.
            </span>
          )}
          {role && testBadges.length === 0 && personalityChips.length === 0 && skillChips.length === 0 && (
            <span className="text-[12px] text-slate-400">
              Gör tester så fylls kortet på med verifierade resultat.
            </span>
          )}
        </div>

        {/* Fot: villkoren får radbrytas fritt, knappen ligger alltid längst ned till höger */}
        <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2 pt-3 border-t border-orange-50">
          <span className="text-[12px] text-slate-500 leading-relaxed min-w-0 flex-1 basis-52">
            {footParts.length > 0 ? footParts.join(' · ') : 'Inga villkor angivna ännu'}
          </span>
          <button
            type="button"
            disabled
            title="Förhandsvisning"
            className="flex-shrink-0 min-h-[36px] px-3.5 rounded-lg text-[12.5px] font-bold text-white opacity-60 cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)' }}
          >
            Visa intresse
          </button>
        </div>
      </div>
    </SectionCard>
  );
}
