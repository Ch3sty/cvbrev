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
 * CV Hero-strip - gradient banner som fungerar som visuell topp pa CVActivationCard.
 * Inspirerad av StreakHero pa dashboarden: gradient orange-rod, custom SVG-dekoration
 * i bakgrunden, stora stat-cells och status-pille.
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
      className="relative overflow-hidden rounded-3xl text-white"
      style={{
        background: 'linear-gradient(135deg, #F97316 0%, #DC2626 60%, #BE185D 100%)',
        boxShadow: '0 20px 40px -12px rgba(220, 38, 38, 0.35)',
      }}
    >
      {/* Custom SVG-dekoration: stiliserade dokument-papper i bakgrunden */}
      <svg
        className="absolute -right-12 -top-8 opacity-15 pointer-events-none"
        width="280"
        height="280"
        viewBox="0 0 280 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Bakre dokument */}
        <rect
          x="60"
          y="60"
          width="120"
          height="160"
          rx="12"
          stroke="white"
          strokeWidth="2"
          opacity="0.5"
          transform="rotate(-8 120 140)"
        />
        {/* Mellandokument */}
        <rect
          x="80"
          y="50"
          width="120"
          height="160"
          rx="12"
          stroke="white"
          strokeWidth="2"
          opacity="0.7"
          transform="rotate(4 140 130)"
        />
        {/* Främre dokument med "rader" */}
        <rect
          x="100"
          y="40"
          width="120"
          height="160"
          rx="12"
          fill="white"
          fillOpacity="0.08"
          stroke="white"
          strokeWidth="2"
          opacity="0.9"
        />
        {/* Text-rader pa framre dokument */}
        <line x1="115" y1="65" x2="200" y2="65" stroke="white" strokeWidth="2" opacity="0.4" />
        <line x1="115" y1="80" x2="180" y2="80" stroke="white" strokeWidth="2" opacity="0.3" />
        <line x1="115" y1="105" x2="200" y2="105" stroke="white" strokeWidth="2" opacity="0.3" />
        <line x1="115" y1="120" x2="170" y2="120" stroke="white" strokeWidth="2" opacity="0.25" />
        <line x1="115" y1="140" x2="195" y2="140" stroke="white" strokeWidth="2" opacity="0.25" />
        <line x1="115" y1="155" x2="160" y2="155" stroke="white" strokeWidth="2" opacity="0.2" />
        {/* Subtila prickar */}
        <circle cx="40" cy="220" r="3" fill="white" opacity="0.3" />
        <circle cx="55" cy="240" r="2" fill="white" opacity="0.25" />
        <circle cx="30" cy="195" r="2" fill="white" opacity="0.2" />
      </svg>

      <div className="relative p-5 sm:p-6">
        {/* Topp-rad: filnamn + status */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80 mb-1.5">
              Aktivt CV
            </div>
            <h3 className="text-xl sm:text-2xl font-bold leading-tight break-words">
              {fileName}
            </h3>
            <p className="text-xs sm:text-sm opacity-85 mt-1.5 flex items-center gap-1.5">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2.25} />
              Uppladdat {new Date(uploadedAt).toLocaleDateString('sv-SE')}
            </p>
          </div>

          {isActive && (
            <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[11px] font-semibold border border-white/30">
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
              Aktiverat
            </span>
          )}
        </div>

        {/* Stat-cells (som i StreakHero) */}
        <div className="flex flex-wrap items-stretch gap-x-5 sm:gap-x-7 gap-y-3 pt-4 border-t border-white/20">
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
      <div className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">{label}</div>
      <div
        className={`font-bold tabular-nums ${
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
  return <div className="w-px self-stretch bg-white/20 hidden sm:block" />;
}
