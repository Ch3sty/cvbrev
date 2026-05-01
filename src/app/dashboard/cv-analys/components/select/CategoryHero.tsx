'use client';

import { motion } from 'framer-motion';
import { CheckSquare, Square } from 'lucide-react';
import {
  UserPortraitIcon,
  BriefcaseStackIcon,
  SkillsConstellationIcon,
  AutoMagicIcon,
} from './CategoryIcons';
import type { SelectCategory } from './CategorySegments';

interface CategoryHeroProps {
  category: SelectCategory;
  title: string;
  description: string;
  selectedCount: number;
  totalCount: number;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  /** Auto-kategorin har ingen select-knapp */
  autoMode?: boolean;
}

const ICON_BY_CATEGORY = {
  profile: UserPortraitIcon,
  roles: BriefcaseStackIcon,
  skills: SkillsConstellationIcon,
  auto: AutoMagicIcon,
};

export default function CategoryHero({
  category,
  title,
  description,
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  autoMode = false,
}: CategoryHeroProps) {
  const Icon = ICON_BY_CATEGORY[category];
  const allSelected = selectedCount === totalCount && totalCount > 0;
  const showSelectButton = !autoMode && totalCount > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-3xl"
      style={{
        background:
          autoMode
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.04) 100%)'
            : 'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(220, 38, 38, 0.04) 100%)',
        border: autoMode
          ? '1px solid rgba(16, 185, 129, 0.2)'
          : '1px solid rgba(249, 115, 22, 0.2)',
      }}
    >
      {/* Subtilt prick-pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
        aria-hidden="true"
      >
        <pattern id={`hero-dots-${category}`} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="1" fill={autoMode ? '#10B981' : '#FB923C'} />
        </pattern>
        <rect width="100%" height="100%" fill={`url(#hero-dots-${category})`} />
      </svg>

      <div className="relative p-5 sm:p-6">
        <div className="flex items-start gap-4 sm:gap-5">
          {/* Icon */}
          <div className="flex-shrink-0">
            <Icon className="w-16 h-16 sm:w-20 sm:h-20" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div
              className={`text-[11px] font-semibold uppercase tracking-[0.18em] mb-1 ${
                autoMode ? 'text-emerald-700' : 'text-orange-700'
              }`}
            >
              {autoMode ? 'Tillämpas automatiskt' : 'Du väljer'}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight">
              {title}
            </h3>
            <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">
              {description}
            </p>

            {/* Stats-rad */}
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-2xl font-bold tabular-nums text-transparent bg-clip-text`}
                  style={{
                    backgroundImage: autoMode
                      ? 'linear-gradient(135deg, #10B981, #059669)'
                      : 'linear-gradient(135deg, #F97316, #DC2626)',
                  }}
                >
                  {autoMode ? totalCount : `${selectedCount}/${totalCount}`}
                </span>
                <span className="text-xs text-slate-600">
                  {autoMode
                    ? totalCount === 1
                      ? 'förbättring'
                      : 'förbättringar'
                    : 'valda'}
                </span>
              </div>

              {showSelectButton && (
                <button
                  type="button"
                  onClick={() => (allSelected ? onDeselectAll?.() : onSelectAll?.())}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-white hover:bg-orange-50 transition-colors min-h-[36px]"
                  style={{
                    borderColor: 'rgba(249, 115, 22, 0.35)',
                    color: '#9A3412',
                  }}
                >
                  {allSelected ? (
                    <>
                      <Square className="w-3 h-3" strokeWidth={2.5} />
                      Avmarkera alla
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-3 h-3" strokeWidth={2.5} />
                      Välj alla
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
