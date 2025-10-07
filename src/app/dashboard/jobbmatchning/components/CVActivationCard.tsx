'use client';

import { useState } from 'react';
import { CheckCircle2, Lock, Sparkles, FileText, Briefcase, GraduationCap, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
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
  isActivating: boolean;
}

export default function CVActivationCard({
  cv,
  isActive,
  activeData,
  onActivate,
  isActivating
}: CVActivationCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-xl border-2 p-6 transition-all ${
        isActive
          ? 'border-green-500 bg-green-50/50'
          : 'border-gray-200 bg-white hover:border-pink-200'
      }`}
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        {isActive ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Aktiverat
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
            <Lock className="w-4 h-4" />
            Inaktivt
          </div>
        )}
      </div>

      {/* CV Info */}
      <div className="mb-4 pr-24">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900 truncate">{cv.file_name}</h3>
        </div>
        <p className="text-sm text-gray-500">
          Uppladdat {new Date(cv.created_at).toLocaleDateString('sv-SE')}
        </p>
      </div>

      {/* Extracted Data Preview (if active) */}
      {isActive && activeData && (
        <div className="space-y-3">
          {/* Occupations */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Briefcase className="w-4 h-4 text-pink-600" />
              <span className="text-sm font-medium text-gray-700">Yrkesroller</span>
              <span className="text-xs text-gray-500">({activeData.extracted_occupations.length})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {activeData.extracted_occupations.slice(0, 3).map((occ, i) => (
                <div key={i} className="relative group">
                  <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                    occ.confidence === 'high'
                      ? 'bg-pink-100 text-pink-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {occ.normalized}
                    {occ.confidence === 'high' && <CheckCircle2 className="w-3 h-3" />}
                  </span>
                  {occ.concept_id && (
                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                      <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        ID: {occ.concept_id}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {activeData.extracted_occupations.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  +{activeData.extracted_occupations.length - 3} till
                </span>
              )}
            </div>
          </div>

          {/* Skills */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Kompetenser</span>
              <span className="text-xs text-gray-500">({activeData.extracted_skills.length})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {activeData.extracted_skills.slice(0, 5).map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                  {skill}
                </span>
              ))}
              {activeData.extracted_skills.length > 5 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  +{activeData.extracted_skills.length - 5} till
                </span>
              )}
            </div>
          </div>

          {/* Location */}
          {activeData.extracted_location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{activeData.extracted_location}</span>
            </div>
          )}

          {/* Toggle Details Button */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors"
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

          {/* Detailed View */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  {/* All Occupations */}
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5" />
                      Alla yrkesroller ({activeData.extracted_occupations.length})
                    </p>
                    <div className="space-y-2">
                      {activeData.extracted_occupations.map((occ, i) => (
                        <div key={i} className={`p-2 rounded border ${
                          occ.confidence === 'high'
                            ? 'bg-pink-50 border-pink-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900">{occ.normalized}</p>
                              {occ.original !== occ.normalized && (
                                <p className="text-xs text-gray-500">Original: {occ.original}</p>
                              )}
                              {occ.concept_id && (
                                <p className="text-xs text-gray-500 font-mono">ID: {occ.concept_id}</p>
                              )}
                              {occ.alternative_labels.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Synonymer: {occ.alternative_labels.slice(0, 3).join(', ')}
                                  {occ.alternative_labels.length > 3 && ` +${occ.alternative_labels.length - 3}`}
                                </p>
                              )}
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-medium whitespace-nowrap ${
                              occ.confidence === 'high' ? 'text-green-700' :
                              occ.confidence === 'medium' ? 'text-yellow-700' :
                              'text-gray-600'
                            }`}>
                              {occ.confidence === 'high' && <CheckCircle2 className="w-3.5 h-3.5" />}
                              {occ.confidence === 'high' ? 'Verifierad' :
                               occ.confidence === 'medium' ? 'Medium' : 'Låg'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* All Skills */}
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      Alla kompetenser ({activeData.extracted_skills.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {activeData.extracted_skills.map((skill, i) => (
                        <span key={i} className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded text-xs border border-purple-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Educations */}
                  {activeData.extracted_educations && activeData.extracted_educations.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5" />
                        Utbildningar ({activeData.extracted_educations.length})
                      </p>
                      <div className="space-y-2">
                        {activeData.extracted_educations.map((edu, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs bg-blue-50 p-2.5 rounded border border-blue-200">
                            <GraduationCap className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900">{edu.degree} - {edu.field}</p>
                              <p className="text-gray-600">{edu.institution} ({edu.year})</p>
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

          {/* Parsed Date */}
          <p className="text-xs text-gray-500 flex items-center gap-1.5 pt-2 border-t border-gray-200">
            <Sparkles className="w-3 h-3" />
            Parsad {new Date(activeData.parsed_at).toLocaleDateString('sv-SE')} med AI
          </p>
        </div>
      )}

      {/* Action Button */}
      {!isActive && (
        <button
          onClick={() => onActivate(cv.id)}
          disabled={isActivating}
          className={`w-full py-3 mt-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            isActivating
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700 shadow-md hover:shadow-lg'
          }`}
        >
          {isActivating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Aktiverar CV med AI...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Aktivera för jobbmatchning
            </>
          )}
        </button>
      )}
    </motion.div>
  );
}
