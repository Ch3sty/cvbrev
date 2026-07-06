'use client';

import SectionCard from './SectionCard';
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

  const selectedCv = cvs.find((cv) => cv.id === profile.cv_id) ?? null;
  const role =
    summary?.skills?.occupation ||
    (selectedCv ? selectedCv.file_name.replace(/\.(pdf|docx?|txt)$/i, '') : null) ||
    'Din yrkesroll';

  const region = profile.regions[0] ?? summary?.skills?.location ?? null;
  const displayName = isOpen && fullName ? fullName : role;
  const avatarInitial = (isOpen && fullName ? fullName : role).charAt(0).toUpperCase();

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

  const skillChips = (summary?.skills?.skills ?? []).slice(0, 5);

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
        className={`max-w-md rounded-2xl border border-orange-100 bg-white p-4 sm:p-5 ${
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

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
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
          {skillChips.map((skill) => (
            <span
              key={skill}
              className="text-[11.5px] font-semibold rounded-full px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600"
            >
              {skill}
            </span>
          ))}
          {testBadges.length === 0 && personalityChips.length === 0 && skillChips.length === 0 && (
            <span className="text-[12px] text-slate-400">
              Välj ett analyserat CV och gör tester så fylls kortet på.
            </span>
          )}
        </div>

        {/* Fot */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-orange-50">
          <span className="text-[12px] text-slate-500 min-w-0 truncate">
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
