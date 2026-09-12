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
        <GraduationCap className="w-3.5 h-3.5 text-neutral-500" strokeWidth={2.25} />
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Utbildningar
        </span>
        <span className="px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-xs font-bold tabular-nums">
          {educations.length}
        </span>
      </header>

      <div className="relative pl-3 sm:pl-0">
        {/* Vertikal linje */}
        <div className="absolute left-[10px] sm:left-[68px] top-2 bottom-2 w-0.5 bg-orange-200 pointer-events-none" />

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
                <span className="text-xs font-bold text-neutral-700 tabular-nums">
                  {edu.year || '-'}
                </span>
              </div>

              {/* Prick pa linjen */}
              <div className="relative z-10 flex-shrink-0 mt-3.5">
                <div className="w-4 h-4 rounded-full border-2 border-white bg-orange-600" />
              </div>

              {/* Kort till hoger */}
              <div className="flex-1 min-w-0 bg-white rounded-xl border border-neutral-200 p-3 sm:p-4 hover:border-orange-300 transition-all">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-neutral-900 break-words">
                      {edu.degree}
                      {edu.field && (
                        <span className="font-normal text-neutral-700">, {edu.field}</span>
                      )}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5 break-words">
                      {edu.institution}
                    </p>
                  </div>
                  {/* Ar (mobil) */}
                  {edu.year && (
                    <span className="sm:hidden flex-shrink-0 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold tabular-nums">
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
