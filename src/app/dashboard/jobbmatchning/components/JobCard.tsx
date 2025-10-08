'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  MapPin,
  Briefcase,
  Clock,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  Brain,
  Key,
  FileCheck,
  AlertTriangle,
  Navigation,
  FileText
} from 'lucide-react';
import { useCoverLetterStore } from '@/store/cover-letter-store';

interface JobCardProps {
  job: any;
  index: number;
  onSelect: (job: any) => void;
  selectedAnalysisId?: string;
  cvId?: string;
}

const BentoCard = ({ children, className = "", onClick, ...props }: any) => (
  <motion.div
    className={`
      relative bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50
      shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group cursor-pointer
      ${className}
    `}
    onClick={onClick}
    whileHover={{
      scale: 1.02,
      y: -4,
    }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    {...props}
  >
    {/* Glassmorphism glow effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

    {/* Hover gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 via-purple-500/0 to-blue-500/0
                    group-hover:from-pink-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5
                    transition-all duration-500 pointer-events-none" />

    {/* Shimmer effect on hover */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full
                      bg-gradient-to-r from-transparent via-white/20 to-transparent
                      transition-transform duration-1000 ease-out" />
    </div>

    <div className="relative z-10">{children}</div>
  </motion.div>
);

export default function JobCard({ job, index, onSelect, selectedAnalysisId, cvId }: JobCardProps) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { setPrefillData } = useCoverLetterStore();

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 80) return 'from-green-500 to-emerald-500';
    if (relevance >= 60) return 'from-blue-500 to-indigo-500';
    if (relevance >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-gray-400 to-gray-500';
  };

  const getRelevanceLabel = (relevance: number) => {
    if (relevance >= 80) return 'Perfekt matchning';
    if (relevance >= 60) return 'Mycket bra matchning';
    if (relevance >= 40) return 'Bra matchning';
    if (relevance >= 20) return 'OK matchning';
    return 'Låg matchning';
  };

  const hasMatchDetails = job.matchDetails && (
    job.matchDetails.matchedOccupations?.length > 0 ||
    job.matchDetails.matchedSkills?.length > 0 ||
    job.matchDetails.matchedKeywords?.length > 0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <BentoCard onClick={() => onSelect(job)}>
        <div className="p-6">
          {/* Relevance Badge */}
          {job.relevance !== undefined && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  {getRelevanceLabel(job.relevance)}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {job.relevance}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${job.relevance}%` }}
                  transition={{ delay: 0.3 + index * 0.05, duration: 0.8 }}
                  className={`h-full bg-gradient-to-r ${getRelevanceColor(job.relevance)}`}
                />
              </div>
            </div>
          )}

          {/* Logo + Header */}
          <div className="flex items-start gap-3 mb-4">
            {/* Company Logo */}
            {job.logo_url ? (
              <img
                src={job.logo_url}
                alt={job.employer?.name || 'Företag'}
                className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                onError={(e) => {
                  // Fallback till initialer om bilden inte laddas
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg ${job.logo_url ? 'hidden' : ''}`}>
              {(job.employer?.name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>

            {/* Title & Company */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">
                {job.headline}
              </h3>
              <div className="flex items-center gap-2 text-gray-700">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="font-medium truncate text-sm">{job.employer?.name || 'Okänt företag'}</span>
              </div>
            </div>
          </div>

          {/* Location with Distance */}
          {job.workplace_address && (
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {[
                  job.workplace_address.municipality,
                  job.workplace_address.region
                ].filter(Boolean).join(', ')}
                {job.distance !== null && job.distance !== undefined && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({Math.round(job.distance)} km)
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Long Distance Warning */}
          {!job.isRemote && job.distance !== null && job.distance > 200 && (
            <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-orange-800">
                  <strong>Långt avstånd:</strong> Denna tjänst ligger {Math.round(job.distance)} km bort. Jobb över 200 km får max 20% matchning.
                </p>
              </div>
            </div>
          )}

          {/* Industry Requirement Warning */}
          {job.industryPenalty > 0 && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-red-800">
                  <strong>Branschkrav:</strong> Detta jobb har branschspecifika krav som inte matchar din bakgrund (-{job.industryPenalty}p).
                </p>
              </div>
            </div>
          )}

          {/* Remote Badge */}
          {job.isRemote && (
            <div className="mb-3 inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
              <Navigation className="w-3 h-3" />
              <span>Distansarbete</span>
            </div>
          )}

          {/* Employment Type & Scope */}
          <div className="flex items-center gap-3 text-gray-600 text-sm mb-3">
            {job.employment_type && (
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{job.employment_type.label}</span>
              </div>
            )}
            {job.scope_of_work && (job.scope_of_work.min || job.scope_of_work.max) && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                {job.scope_of_work.min === job.scope_of_work.max
                  ? `${job.scope_of_work.min}%`
                  : `${job.scope_of_work.min || 0}-${job.scope_of_work.max || 100}%`}
              </span>
            )}
          </div>

          {/* Must-Have Skills (Top 3) */}
          {job.must_have?.skills && job.must_have.skills.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                <Key className="w-3 h-3" />
                Krav:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {job.must_have.skills.slice(0, 3).map((skill: any, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs font-medium"
                  >
                    {skill.label}
                  </span>
                ))}
                {job.must_have.skills.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                    +{job.must_have.skills.length - 3} till
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Description Preview (max 2 lines) */}
          <div className="mb-4">
            <p className="text-gray-600 text-sm line-clamp-2">
              {job.description?.text || job.description?.needs || 'Ingen beskrivning tillgänglig'}
            </p>
          </div>

          {/* REMOVED: Scoring Explanation - visa endast % */}

          {/* Match Details Expandable (OLD - fallback för gamla jobb) */}
          {hasMatchDetails && (
            <div className="mb-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(!showDetails);
                }}
                className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">
                    Varför matchning?
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: showDetails ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-4 h-4 text-purple-600" />
                </motion.div>
              </button>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 space-y-3">
                      {/* Geografisk matchning */}
                      {job.workplace_address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700">Geografisk plats:</p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              {job.workplace_address.municipality || job.workplace_address.region}
                              {job.description?.text?.toLowerCase().includes('distans') && (
                                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                  Distansarbete
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Yrkestitelmatchning */}
                      {job.matchDetails.matchedOccupations?.length > 0 && (
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700">Yrkestitelmatchning:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {job.matchDetails.matchedOccupations.map((occ: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs"
                                >
                                  {occ}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Närliggande yrken hint */}
                      {job.queryType === 'related' && (
                        <div className="flex items-start gap-2">
                          <Briefcase className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700">Närliggande yrkesroll</p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              Detta jobb matchar en roll som är nära relaterad till din erfarenhet
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Matchande kompetenser */}
                      {job.matchDetails.matchedSkills?.length > 0 && (
                        <div className="flex items-start gap-2">
                          <Brain className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700">Matchande kompetenser från din analys:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {job.matchDetails.matchedSkills.slice(0, 5).map((skill: any, i: number) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs"
                                >
                                  {skill.skill}
                                </span>
                              ))}
                              {job.matchDetails.matchedSkills.length > 5 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                  +{job.matchDetails.matchedSkills.length - 5} till
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Matchande nyckelord */}
                      {job.matchDetails.matchedKeywords?.length > 0 && (
                        <div className="flex items-start gap-2">
                          <Key className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700">Matchande nyckelord:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {job.matchDetails.matchedKeywords.slice(0, 5).map((kw: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Rollbaserade keywords */}
                      {job.matchDetails.matchedRoleKeywords?.length > 0 && (
                        <div className="flex items-start gap-2">
                          <FileCheck className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700">Matchande erfarenheter från dina roller:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {job.matchDetails.matchedRoleKeywords.slice(0, 5).map((kw: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            {/* Publication Date and Deadline */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="w-3 h-3" />
                <span>
                  {job.publication_date
                    ? `Publicerad ${new Date(job.publication_date).toLocaleDateString('sv-SE')}`
                    : 'Publiceringsdatum okänt'}
                </span>
              </div>
              {job.application_deadline && (() => {
                const deadline = new Date(job.application_deadline);
                const today = new Date();
                const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysLeft <= 7 && daysLeft > 0;
                const isExpired = daysLeft < 0;

                return (
                  <div className={`flex items-center gap-1.5 font-medium ${isExpired ? 'text-red-600' : isUrgent ? 'text-orange-600 animate-pulse' : 'text-orange-600'}`}>
                    <Clock className="w-3 h-3" />
                    <span>
                      {isExpired
                        ? 'Ansökningstiden utgången'
                        : isUrgent
                          ? `${daysLeft} dag${daysLeft === 1 ? '' : 'ar'} kvar!`
                          : `Sök senast: ${deadline.toLocaleDateString('sv-SE')}`
                      }
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-2">
              {/* Create Cover Letter Button */}
              {selectedAnalysisId && cvId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPrefillData({
                      cvId: cvId,
                      jobTitle: job.headline,
                      company: job.employer.name,
                      jobDescription: `${job.headline}\n\nFöretag: ${job.employer.name}\n\n${job.description.text}`
                    });
                    router.push('/dashboard/skapa-brev');
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-center rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                >
                  <FileText className="w-4 h-4" />
                  <span>Skapa personligt brev</span>
                  <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                </button>
              )}

              {/* Apply Button - Dynamisk text */}
              {(job.application_details?.url || job.application_url || job.webpage_url) && (() => {
                const applicationUrl = job.application_details?.url || job.application_url || job.webpage_url;
                const isViaAF = job.application_details?.via_af === true;
                const buttonText = isViaAF
                  ? 'Ansök via Arbetsförmedlingen'
                  : `Ansök hos ${job.employer?.name || 'företaget'}`;

                return (
                  <a
                    href={applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="block w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-center rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                  >
                    <span>{buttonText}</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                );
              })()}
            </div>
          </div>
        </div>
      </BentoCard>
    </motion.div>
  );
}
