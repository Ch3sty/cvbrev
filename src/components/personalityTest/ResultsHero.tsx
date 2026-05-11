'use client';

import { motion } from 'framer-motion';
import { UserCircle2, Calendar } from 'lucide-react';
import type { PersonalityTestType } from '@/lib/personalityTest/types';

interface ResultsHeroProps {
  testType: PersonalityTestType;
  completedAt: string;
  timeSpent: number | null;
}

export default function ResultsHero({
  testType,
  completedAt,
  timeSpent,
}: ResultsHeroProps) {
  const minutes = timeSpent ? Math.round(timeSpent / 60) : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-3xl text-white"
      style={{
        background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        boxShadow: '0 20px 60px -20px rgba(220, 38, 38, 0.45)',
      }}
    >
      <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" aria-hidden="true">
        <pattern id="res-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="14" cy="14" r="1" fill="white" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#res-dots)" />
      </svg>

      <div className="relative p-6 sm:p-8 md:p-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white/20 backdrop-blur-sm mb-3">
          <UserCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
          {testType === 'personlighet-grund'
            ? 'Personlighetsprofil'
            : 'Avancerad personlighetsprofil'}
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-tight mb-2">
          Din Big Five-profil
        </h1>
        <p className="text-sm sm:text-base opacity-95 leading-relaxed max-w-xl">
          Så här ser dina personlighetsdrag ut på de fem grundläggande dimensionerna. Kom ihåg
          — det finns inga rätt eller fel värden, bara en beskrivning av vem du är.
        </p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 pt-5 border-t border-white/20 text-xs sm:text-sm">
          <span className="inline-flex items-center gap-1.5 font-medium opacity-95">
            <Calendar className="w-3.5 h-3.5" strokeWidth={2.5} />
            {new Date(completedAt).toLocaleDateString('sv-SE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          {minutes !== null && (
            <>
              <span className="w-px h-3 bg-white/30 hidden sm:inline-block" />
              <span className="font-medium opacity-95">{minutes} min</span>
            </>
          )}
        </div>
      </div>
    </motion.section>
  );
}
