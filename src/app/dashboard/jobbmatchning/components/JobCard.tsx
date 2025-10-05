'use client';

import { useState } from 'react';
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
  FileCheck
} from 'lucide-react';

interface JobCardProps {
  job: any;
  index: number;
  onSelect: (job: any) => void;
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

export default function JobCard({ job, index, onSelect }: JobCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 70) return 'from-green-500 to-emerald-500';
    if (relevance >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-gray-400 to-gray-500';
  };

  const getRelevanceLabel = (relevance: number) => {
    if (relevance >= 70) return 'Hög matchning';
    if (relevance >= 40) return 'Medel matchning';
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

          {/* Job Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {job.headline}
          </h3>

          {/* Company */}
          <div className="flex items-center gap-2 text-gray-700 mb-2">
            <Building2 className="w-4 h-4 shrink-0" />
            <span className="font-medium truncate">{job.employer.name}</span>
          </div>

          {/* Location */}
          {job.workplace_address && (
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {[
                  job.workplace_address.municipality,
                  job.workplace_address.region
                ].filter(Boolean).join(', ')}
              </span>
            </div>
          )}

          {/* Employment Type */}
          {job.employment_type && (
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
              <Briefcase className="w-4 h-4 shrink-0" />
              <span className="truncate">{job.employment_type.label}</span>
            </div>
          )}

          {/* Description Preview */}
          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
            {job.description.text}
          </p>

          {/* Match Details Expandable */}
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
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Publicerad {new Date(job.publication_date).toLocaleDateString('sv-SE')}</span>
            </div>
            <ExternalLink className="w-4 h-4 text-indigo-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </BentoCard>
    </motion.div>
  );
}
