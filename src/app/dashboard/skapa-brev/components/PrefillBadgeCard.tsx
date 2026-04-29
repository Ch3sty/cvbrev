'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Building2, Briefcase, Check } from 'lucide-react';
import { PrefillSparkleIcon } from './illustrations/LetterFlowIcons';

interface PrefillBadgeCardProps {
  company: string;
  jobTitle: string;
  hasCv: boolean;
  hasJobDescription: boolean;
  onJumpToTemplate: () => void;
}

export default function PrefillBadgeCard({
  company,
  jobTitle,
  hasCv,
  hasJobDescription,
  onJumpToTemplate,
}: PrefillBadgeCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl p-5 sm:p-7 text-white"
      style={{
        background:
          'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        boxShadow: '0 20px 40px -12px rgba(220, 38, 38, 0.35)',
      }}
    >
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <svg width="100%" height="100%" aria-hidden="true">
          <pattern
            id="prefill-dots"
            x="0"
            y="0"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="12" cy="12" r="1" fill="white" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#prefill-dots)" />
        </svg>
      </div>

      <div className="relative flex items-start gap-4 sm:gap-5">
        <div className="flex-shrink-0">
          <PrefillSparkleIcon className="w-12 h-12 sm:w-14 sm:h-14" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80 mb-1">
            Förifyllt från jobbmatchningen
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight leading-tight">
            {jobTitle || 'Tjänsten'}
          </h2>
          {company && (
            <p className="text-sm sm:text-base text-white/90 mt-0.5 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 flex-shrink-0" strokeWidth={2.25} />
              <span className="truncate">{company}</span>
            </p>
          )}

          <div className="mt-3.5 flex flex-wrap gap-2">
            {hasCv && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-medium">
                <Check className="w-3.5 h-3.5" strokeWidth={2.75} />
                CV vald
              </span>
            )}
            {hasJobDescription && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-medium">
                <Briefcase className="w-3.5 h-3.5" strokeWidth={2.5} />
                Annons hämtad
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onJumpToTemplate}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-sm hover:bg-orange-50 transition-colors min-h-[44px] shadow-md"
          >
            Hoppa till brevmall
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </motion.section>
  );
}
