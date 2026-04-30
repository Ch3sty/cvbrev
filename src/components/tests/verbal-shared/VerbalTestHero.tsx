'use client';

import { motion } from 'framer-motion';
import { BookOpen, Clock, Target, Layers } from 'lucide-react';
import { VerbalHeroIllustration } from './illustrations/VerbalIcons';

interface VerbalTestHeroProps {
  variant: 'v1' | 'v2';
  bestScore?: number;
  bestPercentage?: number;
  totalStatements?: number;
}

export default function VerbalTestHero({
  variant,
  bestScore,
  bestPercentage,
  totalStatements = 48,
}: VerbalTestHeroProps) {
  const eyebrowLabel = variant === 'v1' ? 'Verbalt resonemang' : 'Verbalt resonemang — avancerad';
  const title =
    variant === 'v1'
      ? 'Förstå texten — utan att gissa'
      : 'Avancerad textanalys på elit-nivå';
  const subtitle =
    variant === 'v1'
      ? 'Klassiskt rekryteringstest. Läs en passage och avgör om varje påstående är sant, falskt eller om det inte går att avgöra utifrån texten.'
      : 'Komplexa textstycken inom samhälle, vetenskap och kultur. Subtila slutledningar och nyanserade påståenden — tränad för Mensa-nivå.';
  const difficultyLabel = variant === 'v1' ? 'Grundnivå' : 'Avancerad';

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
      <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" aria-hidden="true">
        <pattern id={`hero-vrb-dots-${variant}`} x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="14" cy="14" r="1" fill="white" />
        </pattern>
        <rect width="100%" height="100%" fill={`url(#hero-vrb-dots-${variant})`} />
      </svg>

      <VerbalHeroIllustration className="absolute -right-10 -top-6 sm:-right-12 sm:-top-8 opacity-15 pointer-events-none hidden sm:block" />

      <div className="relative p-6 sm:p-8 md:p-10 lg:p-12">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white/20 backdrop-blur-sm mb-4">
            <BookOpen className="w-3.5 h-3.5" strokeWidth={2.5} />
            {eyebrowLabel}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-3">
            {title}
          </h1>
          <p className="text-sm sm:text-base md:text-lg opacity-95 leading-relaxed mb-6 max-w-xl">
            {subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-5 border-t border-white/20">
            <Stat icon={<Target className="w-3.5 h-3.5" strokeWidth={2.5} />} label={`${totalStatements} påståenden`} />
            <Divider />
            <Stat icon={<Clock className="w-3.5 h-3.5" strokeWidth={2.5} />} label="ca 25 min" />
            <Divider />
            <Stat icon={<Layers className="w-3.5 h-3.5" strokeWidth={2.5} />} label={difficultyLabel} />
            {bestScore !== undefined && bestScore > 0 && (
              <>
                <Divider />
                <Stat
                  icon={<Trophy />}
                  label={`Bästa: ${bestScore}/${totalStatements} (${bestPercentage}%)`}
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
    <span
      className={`inline-flex items-center gap-1.5 text-xs sm:text-sm ${
        highlight ? 'font-bold' : 'font-medium opacity-95'
      }`}
    >
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
