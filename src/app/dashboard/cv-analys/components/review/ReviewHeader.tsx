'use client';

import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Key } from 'lucide-react';
import CVThumbnailIllustration from './CVThumbnailIllustration';

interface ReviewHeaderProps {
  changeCount: number;
  atsImprovement: number;
  keywordsAdded: number;
  thumbnailSeed?: string;
  editedSections: {
    profile: boolean;
    roleIndices: number[];
    skills: boolean;
  };
  onDotClick?: (sectionId: string) => void;
}

export default function ReviewHeader({
  changeCount,
  atsImprovement,
  keywordsAdded,
  thumbnailSeed,
  editedSections,
  onDotClick,
}: ReviewHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl"
      style={{
        background:
          'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 50%, #FECACA 100%)',
        border: '1px solid rgba(249, 115, 22, 0.2)',
        boxShadow: '0 16px 40px -20px rgba(220, 38, 38, 0.22)',
      }}
    >
      {/* Subtilt prick-pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
        aria-hidden="true"
      >
        <pattern id="review-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="1" fill="#FB923C" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#review-dots)" />
      </svg>

      <div className="relative p-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-[180px,1fr] gap-5 sm:gap-6 items-center">
          {/* CV-thumbnail */}
          <div className="flex justify-center sm:justify-start">
            <div className="w-[160px] sm:w-[180px]">
              <CVThumbnailIllustration
                seed={thumbnailSeed}
                editedSections={editedSections}
                onDotClick={onDotClick}
              />
            </div>
          </div>

          {/* Stats + text */}
          <div className="text-center sm:text-left">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
              Granska din nya version
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight mb-2">
              {changeCount > 0
                ? `Vi har gjort ${changeCount} ${changeCount === 1 ? 'ändring' : 'ändringar'} åt dig`
                : 'Inga ändringar valda'}
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed mb-4">
              Klicka på en sektion nedan eller på en orange prick i ditt CV för att se exakt
              vad vi har ändrat.
            </p>

            {/* Stats-rad */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <Stat
                icon={<Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />}
                value={changeCount}
                label={changeCount === 1 ? 'ändring' : 'ändringar'}
              />
              <Stat
                icon={<TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />}
                value={`+${atsImprovement}`}
                label="ATS-poäng"
              />
              <Stat
                icon={<Key className="w-3.5 h-3.5" strokeWidth={2.5} />}
                value={keywordsAdded}
                label="nyckelord"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
}) {
  return (
    <div
      className="rounded-xl px-2.5 py-2 flex flex-col items-center sm:items-start gap-0.5"
      style={{
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(249, 115, 22, 0.18)',
      }}
    >
      <span
        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.16em]"
        style={{ color: '#9A3412' }}
      >
        {icon}
        {label}
      </span>
      <span className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums">
        {value}
      </span>
    </div>
  );
}
