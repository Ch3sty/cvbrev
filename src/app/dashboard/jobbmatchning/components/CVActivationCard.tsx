'use client';

import { IkonCv } from '@/components/illustrations/Ikoner';
import CvHeroStrip from './CvHeroStrip';
import RoleMatchCard from './RoleMatchCard';
import SkillCloud from './SkillCloud';
import EducationTimeline from './EducationTimeline';

interface OccupationMatch {
  original: string;
  normalized: string;
  concept_id: string | null;
  alternative_labels: string[];
  confidence: 'high' | 'medium' | 'low';
}

interface Education {
  degree: string;
  field: string;
  institution: string;
  year: string;
}

interface CV {
  id: string;
  file_name: string;
  created_at: string;
}

interface ActiveCVData {
  cv_id: string;
  extracted_occupations: OccupationMatch[];
  extracted_skills: string[];
  extracted_educations: Education[];
  extracted_location: string | null;
  parsed_at: string;
}

interface CVActivationCardProps {
  cv: CV;
  isActive: boolean;
  activeData: ActiveCVData | null;
  onActivate: (cvId: string) => Promise<void>;
  onSearchJobs?: () => void;
  isActivating: boolean;
}

/**
 * Det aktiva CV:t, eller raden för att aktivera ett. Aktivt läge staplar
 * fyra paneler: sammanfattningen, yrkesrollerna, kompetenserna och
 * utbildningen. Inaktivt läge är en rad med en ink-knapp.
 */
export default function CVActivationCard({
  cv,
  isActive,
  activeData,
  onActivate,
  onSearchJobs,
  isActivating,
}: CVActivationCardProps) {
  // Inaktivt: en rad med filen och en ink-knapp
  if (!isActive) {
    return (
      <section className="rounded-xl border border-kant bg-panel p-4">
        <div className="flex items-start gap-3">
          <IkonCv className="mt-0.5 shrink-0 text-ink-2" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-kort text-ink-1">{cv.file_name}</h3>
            <p className="mt-0.5 text-meta text-ink-3">
              Uppladdat {new Date(cv.created_at).toLocaleDateString('sv-SE')} · inaktivt
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onActivate(cv.id)}
          disabled={isActivating}
          className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover disabled:opacity-40"
        >
          {isActivating ? 'Aktiverar' : 'Aktivera för jobbmatchning'}
        </button>
      </section>
    );
  }

  // Aktivt state - full upplevelse med alla moduler
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Gradient hero */}
      <CvHeroStrip
        fileName={cv.file_name}
        uploadedAt={cv.created_at}
        rolesCount={activeData?.extracted_occupations.length || 0}
        skillsCount={activeData?.extracted_skills.length || 0}
        educationsCount={activeData?.extracted_educations.length || 0}
        location={activeData?.extracted_location || null}
        isActive
      />

      {/* 2. Yrkesroller - horisontell grid */}
      {activeData && activeData.extracted_occupations.length > 0 && (
        <section className="rounded-xl border border-kant bg-panel p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-ink-3">Yrkesroller som matchar</h2>
            <span className="text-meta tabular-nums text-ink-3">
              {activeData.extracted_occupations.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeData.extracted_occupations.map((occ, i) => (
              <RoleMatchCard
                key={`${occ.normalized}-${i}`}
                normalized={occ.normalized}
                original={occ.original}
                alternativeLabels={occ.alternative_labels || []}
                confidence={occ.confidence}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. Kompetens-cloud + 4. Tidslinje i grid pa desktop */}
      {activeData &&
        (activeData.extracted_skills.length > 0 ||
          activeData.extracted_educations.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5">
            {/* Kompetenser - bredare kolumn */}
            {activeData.extracted_skills.length > 0 && (
              <div className="rounded-xl border border-kant bg-panel p-4 lg:col-span-3">
                <SkillCloud skills={activeData.extracted_skills} />
              </div>
            )}

            {/* Utbildnings-tidslinje - smalare kolumn */}
            {activeData.extracted_educations.length > 0 && (
              <div className="rounded-xl border border-kant bg-panel p-4 lg:col-span-2">
                <EducationTimeline educations={activeData.extracted_educations} />
              </div>
            )}
          </div>
        )}

      {/* 5. Diskret länk till sökvyn (stora CTA-knappen borttagen, aktivering
          öppnar redan sökvyn automatiskt; denna är för redan aktiva CV:n) */}
      {onSearchJobs && (
        <button
          type="button"
          onClick={onSearchJobs}
          className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 hover:bg-insunken"
        >
          Visa matchande jobb
        </button>
      )}

      {/* Analyserad-datum */}
      {activeData && (
        <p className="text-center text-meta text-ink-3">
          Analyserad {new Date(activeData.parsed_at).toLocaleDateString('sv-SE')}
        </p>
      )}
    </div>
  );
}
