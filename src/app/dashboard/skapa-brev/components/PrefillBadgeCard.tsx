'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Building2, Briefcase, Check } from 'lucide-react';
import { PrefillIcon } from './illustrations/LetterFlowIcons';

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-xl border border-orange-200 bg-white p-5 sm:p-7"
    >
      <div className="relative flex items-start gap-4 sm:gap-5">
        <div className="flex-shrink-0">
          <PrefillIcon className="w-12 h-12 sm:w-14 sm:h-14" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1">
            Förifyllt från jobbmatchningen
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight leading-tight text-neutral-900">
            {jobTitle || 'Tjänsten'}
          </h2>
          {company && (
            <p className="text-sm sm:text-base text-neutral-600 mt-0.5 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 flex-shrink-0" strokeWidth={2.25} />
              <span className="truncate">{company}</span>
            </p>
          )}

          <div className="mt-3.5 flex flex-wrap gap-2">
            {hasCv && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs font-medium">
                <Check className="w-3.5 h-3.5" strokeWidth={2.75} />
                CV vald
              </span>
            )}
            {hasJobDescription && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs font-medium">
                <Briefcase className="w-3.5 h-3.5" strokeWidth={2.5} />
                Annons hämtad
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onJumpToTemplate}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 transition-colors min-h-[44px]"
          >
            Hoppa till brevmall
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </motion.section>
  );
}
