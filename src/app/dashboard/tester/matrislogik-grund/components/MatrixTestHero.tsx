'use client';

import { motion } from 'framer-motion';
import { Brain, Clock, Target, Layers } from 'lucide-react';
import { MatrixHeroIllustration } from './illustrations/MatrixIcons';

interface MatrixTestHeroProps {
  bestScore?: number;
  bestPercentage?: number;
}

export default function MatrixTestHero({ bestScore, bestPercentage }: MatrixTestHeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl text-white"
      style={{
        background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        boxShadow: '0 20px 60px -20px rgba(220, 38, 38, 0.45)',
      }}
    >
      {/* Prick-pattern overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" aria-hidden="true">
        <pattern id="hero-mx-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="14" cy="14" r="1" fill="white" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#hero-mx-dots)" />
      </svg>

      {/* Bakgrunds-illustration */}
      <MatrixHeroIllustration className="absolute -right-10 -top-6 sm:-right-12 sm:-top-8 opacity-15 pointer-events-none hidden sm:block" />

      <div className="relative p-6 sm:p-8 md:p-10 lg:p-12">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white/20 backdrop-blur-sm mb-4">
            <Brain className="w-3.5 h-3.5" strokeWidth={2.5} />
            Kognitivt test
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-3">
            Logiskt matristest
          </h1>
          <p className="text-sm sm:text-base md:text-lg opacity-95 leading-relaxed mb-6 max-w-xl">
            Träna inför rekryteringstester. 15 frågor som mäter din förmåga att se mönster i visuella matriser.
          </p>

          {/* Stat-pills */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-5 border-t border-white/20">
            <Stat icon={<Target className="w-3.5 h-3.5" strokeWidth={2.5} />} label="15 frågor" />
            <Divider />
            <Stat icon={<Clock className="w-3.5 h-3.5" strokeWidth={2.5} />} label="ca 20 min" />
            <Divider />
            <Stat icon={<Layers className="w-3.5 h-3.5" strokeWidth={2.5} />} label="3 svårighetsnivåer" />
            {bestScore !== undefined && bestScore > 0 && (
              <>
                <Divider />
                <Stat
                  icon={<Trophy />}
                  label={`Bästa: ${bestScore}/15 (${bestPercentage}%)`}
                  highlight
                />
              </>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function Stat({
  icon,
  label,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  highlight?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs sm:text-sm ${highlight ? 'font-bold' : 'font-medium opacity-95'}`}>
      <span className={highlight ? 'text-yellow-200' : 'opacity-80'}>{icon}</span>
      {label}
    </span>
  );
}

function Divider() {
  return <span className="w-px h-3 bg-white/30 hidden sm:inline-block" />;
}

function Trophy() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2 L14.5 8.5 L21.5 9 L16 13.5 L18 20.5 L12 16.5 L6 20.5 L8 13.5 L2.5 9 L9.5 8.5 Z" />
    </svg>
  );
}
