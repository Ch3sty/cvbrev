'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ProfileSectionProps {
  /** Stora rubriken */
  title: string;
  /** Subtitel/förklaring */
  description: string;
  /** Eyebrow-text ovanför rubriken (uppercase) */
  eyebrow?: string;
  /** Custom SVG-illustration (en av ProfileIcons/TonalityIcons) */
  icon?: ReactNode;
  /** Sektionens innehåll */
  children: ReactNode;
  /** Animation-fördröjning för stagger */
  delay?: number;
}

/**
 * Återanvändbart sektion-skal för profilsidan. White card med orange/röd DNA,
 * subtilt prick-pattern, ikon vänster, titel+beskrivning höger.
 */
export default function ProfileSection({
  title,
  description,
  eyebrow,
  icon,
  children,
  delay = 0,
}: ProfileSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay }}
      className="relative overflow-hidden rounded-3xl bg-white p-5 sm:p-7"
      style={{
        border: '1px solid rgba(249, 115, 22, 0.18)',
        boxShadow: '0 8px 32px -16px rgba(249, 115, 22, 0.18)',
      }}
    >
      {/* Subtilt prick-pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
        aria-hidden="true"
      >
        <pattern id={`section-dots-${title.replace(/\s+/g, '-')}`} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="1" fill="#FB923C" />
        </pattern>
        <rect width="100%" height="100%" fill={`url(#section-dots-${title.replace(/\s+/g, '-')})`} />
      </svg>

      {/* Header */}
      <header className="relative flex items-start gap-3.5 mb-5 sm:mb-6">
        {icon && (
          <div
            className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white"
            style={{
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
              boxShadow: '0 6px 16px -6px rgba(220, 38, 38, 0.45)',
            }}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1">
              {eyebrow}
            </div>
          )}
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
            {description}
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="relative">{children}</div>
    </motion.section>
  );
}
