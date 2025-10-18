'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Building2,
  MapPin,
  Briefcase,
  Clock,
  ExternalLink,
  Sparkles,
  FileText,
  Car,
  Search
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
      relative bg-white/90 backdrop-blur-xl rounded-xl border border-gray-200/50
      shadow-sm hover:shadow-lg hover:border-indigo-300/50 transition-all duration-200
      overflow-hidden group cursor-pointer
      ${className}
    `}
    onClick={onClick}
    whileHover={{ scale: 1.01 }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
    {...props}
  >
    {/* Glassmorphism glow effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

    {/* Hover gradient overlay - Blue/Indigo theme */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-indigo-500/0 to-slate-500/0
                    group-hover:from-blue-500/3 group-hover:via-indigo-500/3 group-hover:to-slate-500/2
                    transition-all duration-300 pointer-events-none" />

    {/* Magnifying glass icon - appears on hover */}
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      className="absolute top-4 right-4 bg-indigo-50 border border-indigo-200
                 rounded-full p-2 shadow-sm z-20 opacity-0 group-hover:opacity-100
                 transition-opacity duration-200 pointer-events-none"
    >
      <Search className="w-4 h-4 text-indigo-600" />
    </motion.div>

    <div className="relative z-10">{children}</div>
  </motion.div>
);

export default function JobCard({ job, index, onSelect, cvId }: JobCardProps) {
  const router = useRouter();
  const { setPrefillData } = useCoverLetterStore();

  const getRelevanceBadgeColor = (relevance: number) => {
    if (relevance >= 80) return 'bg-green-50 border-green-200 text-green-700';
    if (relevance >= 60) return 'bg-blue-50 border-blue-200 text-blue-700';
    if (relevance >= 40) return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    return 'bg-gray-50 border-gray-200 text-gray-700';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <BentoCard onClick={() => onSelect(job)}>
        <div className="p-5">
          {/* Header Section - Logo + Title + Relevance Badge */}
          <div className="flex items-start gap-3 mb-3">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              {job.logo_url ? (
                <img
                  src={job.logo_url}
                  alt={job.employer?.name || 'Företag'}
                  className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold text-base ${job.logo_url ? 'hidden' : ''}`}>
                {(job.employer?.name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            </div>

            {/* Title & Company + Location */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2 pr-12">
                {job.headline}
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-slate-600 flex-wrap">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="font-medium truncate">{job.employer?.name || 'Okänt företag'}</span>

                {job.workplace_address && (
                  <>
                    <span className="text-slate-400">·</span>
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {job.workplace_address.municipality || job.workplace_address.region}
                    </span>
                    {job.distance !== null && job.distance !== undefined && job.distance <= 100 && (
                      <span className="text-slate-500 text-xs">({Math.round(job.distance)} km)</span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Relevance Badge - Inline Right */}
            {job.relevance !== undefined && (
              <div className={`flex-shrink-0 px-2.5 py-1 border rounded-lg ${getRelevanceBadgeColor(job.relevance)}`}>
                <span className="text-xs font-semibold">{job.relevance}%</span>
              </div>
            )}
          </div>

          {/* Body Section - Employment, Requirements, Skills, Description */}
          <div className="space-y-3 mb-4">
            {/* Employment Type & Scope - Compact Row */}
            {(job.employment_type || job.scope_of_work) && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                {job.employment_type && (
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 shrink-0" />
                    <span>{job.employment_type.label}</span>
                  </div>
                )}
                {job.scope_of_work && (job.scope_of_work.min || job.scope_of_work.max) && (
                  <>
                    <span className="text-slate-400">·</span>
                    <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded text-xs font-medium">
                      {job.scope_of_work.min === job.scope_of_work.max
                        ? `${job.scope_of_work.min}%`
                        : `${job.scope_of_work.min || 0}-${job.scope_of_work.max || 100}%`}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Requirements - Compact Inline Badges */}
            {((job.driving_license_required || (job.driving_license && job.driving_license.length > 0)) || job.experience_required) && (
              <div className="flex flex-wrap gap-2">
                {/* Driving License */}
                {(job.driving_license_required || (job.driving_license && job.driving_license.length > 0)) && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-md text-xs font-medium text-amber-800">
                    <Car className="w-3.5 h-3.5" />
                    {job.driving_license && job.driving_license.length > 0
                      ? job.driving_license[0].label
                      : 'Körkort'}
                  </span>
                )}
                {/* Experience Required */}
                {job.experience_required && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-md text-xs font-medium text-amber-800">
                    <Briefcase className="w-3.5 h-3.5" />
                    Erfarenhet krävs
                  </span>
                )}
              </div>
            )}

            {/* Must-Have Skills (Top 5) - Compact Pills */}
            {job.must_have?.skills && job.must_have.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {job.must_have.skills.slice(0, 5).map((skill: any, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-xs font-medium"
                  >
                    {skill.label}
                  </span>
                ))}
                {job.must_have.skills.length > 5 && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                    +{job.must_have.skills.length - 5} till
                  </span>
                )}
              </div>
            )}

            {/* Description Preview (3 lines) */}
            <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
              {job.description?.text || job.description?.needs || 'Ingen beskrivning tillgänglig'}
            </p>
          </div>

          {/* Footer Section - Date, Deadline, Buttons */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            {/* Publication Date and Deadline - Compact Row */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
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
                  <div className={`flex items-center gap-1.5 font-medium ${
                    isExpired ? 'text-red-600' :
                    isUrgent ? 'text-orange-600 animate-pulse' :
                    'text-slate-600'
                  }`}>
                    <Clock className="w-3 h-3" />
                    <span>
                      {isExpired
                        ? 'Ansökningstiden utgången'
                        : isUrgent
                          ? `${daysLeft} dag${daysLeft === 1 ? '' : 'ar'} kvar!`
                          : `Sista dag: ${deadline.toLocaleDateString('sv-SE')}`
                      }
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Action Buttons - Horizontal Layout with Hierarchy */}
            <div className="grid grid-cols-5 gap-2">
              {/* Secondary: Create Cover Letter (Outline Button - 40%) */}
              {cvId && (
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
                  className="col-span-2 py-2.5 px-3 border-2 border-indigo-200 text-indigo-700 bg-white text-center rounded-lg text-sm font-medium transition-all duration-200 hover:bg-indigo-50 hover:border-indigo-300 flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Skapa brev</span>
                </button>
              )}

              {/* Primary: Apply Button (Solid - 60%) */}
              {(job.application_details?.url || job.application_url || job.webpage_url) && (() => {
                const applicationUrl = job.application_details?.url || job.application_url || job.webpage_url;
                const isViaAF = job.application_details?.via_af === true;
                const buttonText = isViaAF
                  ? 'Ansök via AF'
                  : `Ansök hos ${job.employer?.name || 'företaget'}`;

                return (
                  <a
                    href={applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={`${cvId ? 'col-span-3' : 'col-span-5'} py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-center rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md flex items-center justify-center gap-1.5`}
                  >
                    <span className="truncate">{buttonText}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
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
