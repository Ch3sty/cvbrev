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

  // OBS: falla ALDRIG tillbaka på CV:ts filnamn, det innehåller ofta
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
          <span className="text-meta text-ink-3">Ej synlig</span>
        ) : undefined
      }
    >
      <div
        className={`w-full rounded-lg border border-kant bg-insunken p-4 shadow-insunken sm:p-5 ${
          !isOn ? 'opacity-70' : ''
        }`}
      >
        {/* Huvud */}
        <div className="mb-3 flex items-center gap-3">
          <span
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-kant bg-panel text-base font-semibold text-ink-2"
            aria-hidden="true"
          >
            {avatarInitial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-kort text-ink-1">{displayName}</p>
            <p className="truncate text-meta text-ink-3">
              {[region, isOpen ? 'Öppen profil' : 'Anonym'].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>

        {/* Senioritet: samma rad som rekryterarnas träffkort */}
        {seniorityRow.length > 0 && (
          <p className="-mt-1 mb-2.5 text-meta text-ink-2">
            <span className="font-medium text-ink-1">{seniorityRow[0]}</span>
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
          <p className="mb-2.5 line-clamp-2 text-meta leading-snug text-ink-2">
            {profile.pitch!.trim()}
          </p>
        )}

        {/* Söker mig till: kandidatens egna kontexttaggar, självpresentation */}
        {profile.context_tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
            <span className="text-steg uppercase text-ink-3">Söker mig till</span>
            {profile.context_tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md border border-kant bg-panel px-2.5 py-0.5 text-meta text-ink-2"
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
                className="inline-flex items-center rounded-md border border-kant bg-panel px-2.5 py-1 text-meta font-medium text-ink-1"
              >
                {badge.label}
              </span>
            ))}
            {personalityChips.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center rounded-md border border-kant bg-panel px-2.5 py-1 text-meta text-ink-2"
              >
                {chip}
              </span>
            ))}
          </div>
        )}

        {/* Arbetsstil: exakt det rekryteraren ser, arketyp + två spektra + trivs-rad */}
        {workStyle && (
          <div className="mb-2.5 rounded-lg border border-kant bg-panel px-3 py-2.5">
            <p className="text-sm font-medium text-ink-1">{workStyle.archetype.title}</p>
            {cardWorkStyle ? (
              <div className="mt-2">
                <CardWorkStyleStrip data={cardWorkStyle} thrivesForm="candidate" />
              </div>
            ) : (
              <ul className="mt-1 space-y-0.5">
                {workStyle.statements.slice(0, 2).map((statement) => (
                  <li
                    key={statement}
                    className="flex items-start gap-1.5 text-meta leading-snug text-ink-2"
                  >
                    <span
                      className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-3"
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
              className="inline-flex items-center rounded-md border border-kant bg-panel px-2.5 py-1 text-meta text-ink-2"
            >
              {skill}
            </span>
          ))}
          {!role && (
            <span className="text-meta text-ink-3">
              Din yrkesroll saknas ännu. Analysera ditt CV så hämtar vi roll och
              kompetenser automatiskt.
            </span>
          )}
          {role && testBadges.length === 0 && personalityChips.length === 0 && skillChips.length === 0 && (
            <span className="text-meta text-ink-3">
              Gör tester så fylls kortet på med verifierade resultat.
            </span>
          )}
        </div>

        {/* Fot: villkoren får radbrytas fritt, knappen ligger alltid längst ned till höger */}
        <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2 border-t border-kant pt-3">
          <span className="min-w-0 flex-1 basis-52 text-meta text-ink-3">
            {footParts.length > 0 ? footParts.join(' · ') : 'Inga villkor angivna ännu'}
          </span>
          <button
            type="button"
            disabled
            title="Så ser knappen ut för rekryteraren"
            className="inline-flex h-11 shrink-0 cursor-not-allowed items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white opacity-40"
          >
            Visa intresse
          </button>
        </div>
      </div>
    </SectionCard>
  );
}
