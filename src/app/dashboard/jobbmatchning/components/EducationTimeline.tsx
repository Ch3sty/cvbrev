'use client';

import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

interface Education {
  degree: string;
  field: string;
  institution: string;
  year: string;
}

interface EducationTimelineProps {
  educations: Education[];
}

/**
 * Vertikal tidslinje for utbildningar.
 * - Ar-label till vanster (sm:visible)
 * - SVG-linje med gradient stroke i mitten
 * - Gradient-prick per utbildning
 * - Utbildningskort till hoger
 *
 * Pa mobil staplas det enklare med ar inline.
 */
export default function EducationTimeline({ educations }: EducationTimelineProps) {
  if (educations.length === 0) return null;

  // Sortera fallande pa ar (senaste forst), behall ursprunglig om ar saknas
  const sorted = [...educations].sort((a, b) => {
    const ya = parseInt(a.year, 10);
    const yb = parseInt(b.year, 10);
    if (Number.isNaN(ya) || Number.isNaN(yb)) return 0;
    return yb - ya;
  });

  return (
    <section>
      <header className="flex items-center gap-2 mb-4">
        <GraduationCap className="w-3.5 h-3.5 text-slate-500" strokeWidth={2.25} />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Utbildningar
        </span>
        <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold tabular-nums">
          {educations.length}
        </span>
      </header>

      <div className="relative pl-3 sm:pl-0">
        {/* Vertikal linje (gradient stroke pa SVG) */}
        <svg
          className="absolute left-[10px] sm:left-[68px] top-2 bottom-2 w-0.5 pointer-events-none"
          aria-hidden="true"
          preserveAspectRatio="none"
          viewBox="0 0 2 100"
        >
          <defs>
            <linearGradient id="edu-timeline-gradient" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F97316" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#DC2626" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <line x1="1" y1="0" x2="1" y2="100" stroke="url(#edu-timeline-gradient)" strokeWidth="2" />
        </svg>

        <ul className="space-y-4">
          {sorted.map((edu, i) => (
            <motion.li
              key={`${edu.year}-${edu.institution}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className="relative flex items-start gap-3 sm:gap-4"
            >
              {/* Ar (desktop) */}
              <div className="hidden sm:block flex-shrink-0 w-14 text-right pt-3.5">
                <span className="text-xs font-bold text-slate-700 tabular-nums">
                  {edu.year || '—'}
                </span>
              </div>

              {/* Prick pa linjen */}
              <div className="relative z-10 flex-shrink-0 mt-3.5">
                <div
                  className="w-4 h-4 rounded-full border-2 border-white"
                  style={{
                    background: 'linear-gradient(135deg, #F97316, #DC2626)',
                    boxShadow: '0 4px 8px -2px rgba(220, 38, 38, 0.4)',
                  }}
                />
              </div>

              {/* Kort till hoger */}
              <div className="flex-1 min-w-0 bg-white rounded-xl border border-slate-200 p-3 sm:p-4 hover:border-orange-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-slate-900 break-words">
                      {edu.degree}
                      {edu.field && (
                        <span className="font-normal text-slate-700"> — {edu.field}</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 break-words">
                      {edu.institution}
                    </p>
                  </div>
                  {/* Ar (mobil) */}
                  {edu.year && (
                    <span className="sm:hidden flex-shrink-0 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-bold tabular-nums">
                      {edu.year}
                    </span>
                  )}
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
