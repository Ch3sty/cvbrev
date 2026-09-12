'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Calendar } from 'lucide-react';

interface CvHeroStripProps {
  fileName: string;
  uploadedAt: string;
  rolesCount: number;
  skillsCount: number;
  educationsCount: number;
  location: string | null;
  isActive: boolean;
}

/**
 * CV Hero-strip - visuell topp pa CVActivationCard.
 * Vit yta med orange accenter, stora stat-cells och status-pille.
 */
export default function CvHeroStrip({
  fileName,
  uploadedAt,
  rolesCount,
  skillsCount,
  educationsCount,
  location,
  isActive,
}: CvHeroStripProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-xl bg-white border border-neutral-200"
    >
      <div className="relative p-5 sm:p-6">
        {/* Topp-rad: filnamn + status */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 mb-1.5">
              Aktivt CV
            </div>
            <h3 className="text-xl sm:text-2xl font-bold leading-tight break-words text-neutral-900">
              {fileName}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1.5 flex items-center gap-1.5">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2.25} />
              Uppladdat {new Date(uploadedAt).toLocaleDateString('sv-SE')}
            </p>
          </div>

          {isActive && (
            <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
              Aktiverat
            </span>
          )}
        </div>

        {/* Stat-cells */}
        <div className="flex flex-wrap items-stretch gap-x-5 sm:gap-x-7 gap-y-3 pt-4 border-t border-neutral-100">
          <Stat label="Roller" value={rolesCount} />
          <Divider />
          <Stat label="Kompetenser" value={skillsCount} />
          <Divider />
          <Stat label="Utbildningar" value={educationsCount} />
          {location && (
            <>
              <Divider />
              <Stat label="Plats" value={location} small />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Stat({
  label,
  value,
  small,
}: {
  label: string;
  value: number | string;
  small?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="text-xs uppercase tracking-wider text-neutral-500 mb-0.5">{label}</div>
      <div
        className={`font-bold tabular-nums text-neutral-900 ${
          small
            ? 'text-sm sm:text-base truncate max-w-[140px] sm:max-w-[180px]'
            : 'text-2xl sm:text-3xl'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="w-px self-stretch bg-neutral-200 hidden sm:block" />;
}
