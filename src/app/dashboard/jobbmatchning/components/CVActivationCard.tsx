'use client';

import { CheckCircle2, Lock, FileText, Search, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
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
 * Orkestrator-komponent for det aktiva (eller aktivera-bara) CV-kortet.
 * Komponerar fyra distinkta visuella moduler:
 *   1. CvHeroStrip   - gradient hero med stat-cells (rolesCount/skills/edu)
 *   2. RoleMatchCard - horisontell grid av yrkesroller med ConfidenceMeter
 *   3. SkillCloud    - kompetenser med gradient-djup
 *   4. EducationTimeline - vertikal tidslinje med ar-prickar
 *
 * Inaktivt state: kompakt rad med fil-info och Aktivera-knapp.
 */
export default function CVActivationCard({
  cv,
  isActive,
  activeData,
  onActivate,
  onSearchJobs,
  isActivating,
}: CVActivationCardProps) {
  // Inaktivt state - kompakt rad
  if (!isActive) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all p-4 sm:p-5"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
            <FileText className="w-5 h-5" strokeWidth={2.25} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                  {cv.file_name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  Uppladdat {new Date(cv.created_at).toLocaleDateString('sv-SE')}
                </p>
              </div>
              <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium">
                <Lock className="w-3 h-3" />
                Inaktivt
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onActivate(cv.id)}
          disabled={isActivating}
          className="w-full py-3 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2 relative overflow-hidden shadow-sm hover:shadow-md disabled:cursor-wait"
          style={{ background: 'linear-gradient(90deg, #F97316, #DC2626)' }}
        >
          {isActivating ? (
            <>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <PulsingDots />
              <span className="relative z-10">Aktiverar CV...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
              Aktivera för jobbmatchning
            </>
          )}
        </button>
      </motion.div>
    );
  }

  // Aktivt state - full upplevelse med alla moduler
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-4 sm:space-y-5"
    >
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
        <section className="bg-white rounded-2xl border border-slate-200 p-5">
          <header className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Yrkesroller som matchar
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold tabular-nums">
                {activeData.extracted_occupations.length}
              </span>
            </div>
          </header>

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
              <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-5">
                <SkillCloud skills={activeData.extracted_skills} />
              </div>
            )}

            {/* Utbildnings-tidslinje - smalare kolumn */}
            {activeData.extracted_educations.length > 0 && (
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
                <EducationTimeline educations={activeData.extracted_educations} />
              </div>
            )}
          </div>
        )}

      {/* 5. CTA-banner */}
      {onSearchJobs && (
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.99 }}
          onClick={onSearchJobs}
          className="w-full py-4 rounded-2xl text-white font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-base sm:text-lg"
          style={{
            background: 'linear-gradient(90deg, #F97316, #DC2626)',
            boxShadow: '0 12px 24px -8px rgba(220, 38, 38, 0.4)',
          }}
        >
          <Search className="w-5 h-5 flex-shrink-0" strokeWidth={2.25} />
          <span className="text-center leading-tight">
            Hitta lediga tjänster som matchar ditt valda CV
          </span>
        </motion.button>
      )}

      {/* Analyserad-datum */}
      {activeData && (
        <p className="text-xs text-slate-500 flex items-center gap-1.5 justify-center">
          <Calendar className="w-3 h-3" />
          Analyserad {new Date(activeData.parsed_at).toLocaleDateString('sv-SE')}
        </p>
      )}
    </motion.div>
  );
}

function PulsingDots() {
  return (
    <div className="flex gap-1">
      {[0, 0.2, 0.4].map((delay, i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-white rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay }}
        />
      ))}
    </div>
  );
}
