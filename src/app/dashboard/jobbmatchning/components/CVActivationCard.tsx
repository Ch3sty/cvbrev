'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Lock,
  FileText,
  Briefcase,
  GraduationCap,
  MapPin,
  ChevronDown,
  ChevronUp,
  Search,
  Calendar,
  Wrench,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function CVActivationCard({
  cv,
  isActive,
  activeData,
  onActivate,
  onSearchJobs,
  isActivating,
}: CVActivationCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`relative rounded-3xl transition-all overflow-hidden ${
        isActive
          ? 'bg-white border border-orange-200/60'
          : 'bg-white border border-slate-200 hover:border-orange-300 hover:shadow-md'
      }`}
      style={
        isActive
          ? { boxShadow: '0 16px 36px -12px rgba(249, 115, 22, 0.18)' }
          : undefined
      }
    >
      {/* Gradient highlight bar pa toppen for aktivt CV */}
      {isActive && (
        <div
          className="absolute top-0 inset-x-0 h-1"
          style={{ background: 'linear-gradient(90deg, #F97316, #DC2626)' }}
        />
      )}

      <div className="p-5 sm:p-6">
        {/* Header: ikon + titel + datum + status-badge */}
        <div className="flex items-start gap-3 mb-5">
          <div
            className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
              isActive ? 'text-white' : 'bg-slate-100 text-slate-500'
            }`}
            style={
              isActive
                ? {
                    background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                    boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.35)',
                  }
                : undefined
            }
          >
            <FileText className="w-5 h-5" strokeWidth={2.25} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                  {cv.file_name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  Uppladdat {new Date(cv.created_at).toLocaleDateString('sv-SE')}
                </p>
              </div>

              {/* Status pill — i header-flow, inte absolut */}
              {isActive ? (
                <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Aktiverat
                </span>
              ) : (
                <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium">
                  <Lock className="w-3 h-3" />
                  Inaktivt
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Aktivt CV — visa extraherade fält */}
        {isActive && activeData && (
          <div className="space-y-4">
            {/* Yrkesroller */}
            {activeData.extracted_occupations.length > 0 && (
              <SectionBlock
                icon={Briefcase}
                title="Yrkesroller"
                count={activeData.extracted_occupations.length}
              >
                <div className="flex flex-wrap gap-1.5">
                  {activeData.extracted_occupations.slice(0, 3).map((occ, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        occ.confidence === 'high'
                          ? 'bg-orange-50 border border-orange-200 text-orange-700'
                          : 'bg-slate-100 border border-slate-200 text-slate-600'
                      }`}
                    >
                      {occ.normalized}
                      {occ.confidence === 'high' && (
                        <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
                      )}
                    </span>
                  ))}
                  {activeData.extracted_occupations.length > 3 && (
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs">
                      +{activeData.extracted_occupations.length - 3} till
                    </span>
                  )}
                </div>
              </SectionBlock>
            )}

            {/* Kompetenser */}
            {activeData.extracted_skills.length > 0 && (
              <SectionBlock
                icon={Wrench}
                title="Kompetenser"
                count={activeData.extracted_skills.length}
              >
                <div className="flex flex-wrap gap-1.5">
                  {activeData.extracted_skills.slice(0, 5).map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                  {activeData.extracted_skills.length > 5 && (
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs">
                      +{activeData.extracted_skills.length - 5} till
                    </span>
                  )}
                </div>
              </SectionBlock>
            )}

            {/* Plats */}
            {activeData.extracted_location && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{activeData.extracted_location}</span>
              </div>
            )}

            {/* Toggle detaljer */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Dölj detaljer
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Visa alla detaljer
                </>
              )}
            </button>

            {/* Detalj-vy */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-5 pt-4 border-t border-slate-200">
                    {/* Alla yrkesroller */}
                    <div>
                      <SectionLabel
                        icon={Briefcase}
                        title="Alla yrkesroller"
                        count={activeData.extracted_occupations.length}
                      />
                      <div className="space-y-2">
                        {activeData.extracted_occupations.map((occ, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-xl border ${
                              occ.confidence === 'high'
                                ? 'bg-orange-50/50 border-orange-200/60'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-slate-900">
                                  {occ.normalized}
                                </p>
                                {occ.original !== occ.normalized && (
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    Ursprunglig: {occ.original}
                                  </p>
                                )}
                                {occ.alternative_labels.length > 0 && (
                                  <p className="text-xs text-slate-500 mt-1.5">
                                    Synonymer:{' '}
                                    {occ.alternative_labels.slice(0, 3).join(', ')}
                                    {occ.alternative_labels.length > 3 &&
                                      ` +${occ.alternative_labels.length - 3}`}
                                  </p>
                                )}
                              </div>
                              <ConfidencePill confidence={occ.confidence} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Alla kompetenser */}
                    {activeData.extracted_skills.length > 0 && (
                      <div>
                        <SectionLabel
                          icon={Wrench}
                          title="Alla kompetenser"
                          count={activeData.extracted_skills.length}
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {activeData.extracted_skills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Utbildningar */}
                    {activeData.extracted_educations &&
                      activeData.extracted_educations.length > 0 && (
                        <div>
                          <SectionLabel
                            icon={GraduationCap}
                            title="Utbildningar"
                            count={activeData.extracted_educations.length}
                          />
                          <div className="space-y-2">
                            {activeData.extracted_educations.map((edu, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200"
                              >
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                                  <GraduationCap
                                    className="w-4 h-4 text-slate-500"
                                    strokeWidth={2.25}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm text-slate-900">
                                    {edu.degree}
                                    {edu.field && ` — ${edu.field}`}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {edu.institution} ({edu.year})
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Analyserad-datum */}
            <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-3 border-t border-slate-100">
              <Calendar className="w-3 h-3" />
              Analyserad {new Date(activeData.parsed_at).toLocaleDateString('sv-SE')}
            </p>
          </div>
        )}

        {/* Knappar */}
        {!isActive ? (
          <button
            onClick={() => onActivate(cv.id)}
            disabled={isActivating}
            className="w-full mt-4 py-3 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2 relative overflow-hidden shadow-sm hover:shadow-md disabled:cursor-wait"
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
        ) : (
          onSearchJobs && (
            <button
              onClick={onSearchJobs}
              className="w-full mt-5 py-3 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              style={{ background: 'linear-gradient(90deg, #F97316, #DC2626)' }}
            >
              <Search className="w-5 h-5" strokeWidth={2.25} />
              Sök matchande jobb
            </button>
          )
        )}
      </div>
    </motion.div>
  );
}

function SectionBlock({
  icon: Icon,
  title,
  count,
  children,
}: {
  icon: typeof Briefcase;
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <SectionLabel icon={Icon} title={title} count={count} />
      {children}
    </div>
  );
}

function SectionLabel({
  icon: Icon,
  title,
  count,
}: {
  icon: typeof Briefcase;
  title: string;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-3.5 h-3.5 text-slate-500" strokeWidth={2.25} />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </span>
      {count !== undefined && (
        <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold tabular-nums">
          {count}
        </span>
      )}
    </div>
  );
}

function ConfidencePill({ confidence }: { confidence: 'high' | 'medium' | 'low' }) {
  if (confidence === 'high') {
    return (
      <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold whitespace-nowrap">
        <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
        Verifierad
      </span>
    );
  }
  if (confidence === 'medium') {
    return (
      <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold whitespace-nowrap">
        Medium
      </span>
    );
  }
  return (
    <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-semibold whitespace-nowrap">
      Låg
    </span>
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
