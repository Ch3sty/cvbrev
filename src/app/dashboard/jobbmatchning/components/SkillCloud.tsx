'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, ChevronDown, ChevronUp } from 'lucide-react';

interface SkillCloudProps {
  skills: string[];
  /** Antal kompetenser som visas innan "Visa alla" trycks. */
  initialCount?: number;
}

/**
 * Kompetens-cloud med gradient-djup pa pillerna. De forsta N visas direkt,
 * resten dyker upp via "Visa alla". Pillerna far en orange tinge som tonar
 * fran starkare till svagare for att skapa visuellt djup.
 */
export default function SkillCloud({ skills, initialCount = 8 }: SkillCloudProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? skills : skills.slice(0, initialCount);
  const hasMore = skills.length > initialCount;

  return (
    <section>
      <header className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Wrench className="w-3.5 h-3.5 text-slate-500" strokeWidth={2.25} />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Kompetenser
          </span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold tabular-nums">
            {skills.length}
          </span>
        </div>
      </header>

      <div className="flex flex-wrap gap-1.5">
        {visible.map((skill, i) => {
          // Gradient-djup: forsta 5 starkare orange, sen avtagande till slate
          const intensity = computeIntensity(i, skills.length);
          return (
            <motion.span
              key={`${skill}-${i}`}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.02, 0.3), duration: 0.2 }}
              className="px-2.5 py-1 rounded-full text-xs font-medium border"
              style={{
                background: intensity.bg,
                color: intensity.text,
                borderColor: intensity.border,
              }}
            >
              {skill}
            </motion.span>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              Visa färre
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              Visa alla {skills.length}
            </>
          )}
        </button>
      )}
    </section>
  );
}

function computeIntensity(index: number, _total: number) {
  // De forsta 5: stark orange. 5-10: medel. resten: neutral slate.
  if (index < 5) {
    return {
      bg: 'rgba(249, 115, 22, 0.12)', // orange-500 @ 12%
      text: '#C2410C', // orange-700
      border: 'rgba(249, 115, 22, 0.3)',
    };
  }
  if (index < 10) {
    return {
      bg: 'rgba(249, 115, 22, 0.06)',
      text: '#9A3412', // orange-800 men dimmer
      border: 'rgba(249, 115, 22, 0.18)',
    };
  }
  return {
    bg: '#F1F5F9', // slate-100
    text: '#475569', // slate-600
    border: '#E2E8F0', // slate-200
  };
}
