'use client';

import { motion } from 'framer-motion';
import { UserCircle2, Clock, Target, Sparkles as _S } from 'lucide-react';

interface PersonlighetHeroProps {
  variant: 'grund' | 'avancerad';
  hasProfile?: boolean;
  lastCompletedAt?: string | null;
}

const COPY = {
  grund: {
    eyebrow: 'Personlighetstest',
    title: 'Förstå din personlighet',
    description:
      'Big Five-baserat test med 50 frågor som visar din profil på fem grundläggande personlighetsdimensioner — inget rätt eller fel, bara du.',
    questions: '50 frågor',
    time: 'ca 10 min',
    extra: '5 dimensioner',
  },
  avancerad: {
    eyebrow: 'Personlighetstest — avancerad',
    title: 'Din djupgående personlighetsprofil',
    description:
      'Utökat Big Five-test med 120 frågor som mäter både huvuddimensioner och 30 underfacetter — den djupaste profilen vi erbjuder.',
    questions: '120 frågor',
    time: 'ca 25 min',
    extra: '30 facetter',
  },
};

export default function PersonlighetHero({
  variant,
  hasProfile,
  lastCompletedAt,
}: PersonlighetHeroProps) {
  const copy = COPY[variant];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl text-white"
      style={{
        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
        boxShadow: '0 20px 60px -20px rgba(139, 92, 246, 0.45)',
      }}
    >
      <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" aria-hidden="true">
        <pattern id="hero-pers-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="14" cy="14" r="1" fill="white" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#hero-pers-dots)" />
      </svg>

      <div className="relative p-6 sm:p-8 md:p-10 lg:p-12">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white/20 backdrop-blur-sm mb-4">
            <UserCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
            {copy.eyebrow}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-3">
            {copy.title}
          </h1>
          <p className="text-sm sm:text-base md:text-lg opacity-95 leading-relaxed mb-6 max-w-xl">
            {copy.description}
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-5 border-t border-white/20">
            <Stat icon={<Target className="w-3.5 h-3.5" strokeWidth={2.5} />} label={copy.questions} />
            <Divider />
            <Stat icon={<Clock className="w-3.5 h-3.5" strokeWidth={2.5} />} label={copy.time} />
            <Divider />
            <Stat label={copy.extra} />
            {hasProfile && lastCompletedAt && (
              <>
                <Divider />
                <Stat
                  label={`Senast: ${new Date(lastCompletedAt).toLocaleDateString('sv-SE')}`}
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
  icon?: React.ReactNode;
  label: string;
  highlight?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs sm:text-sm ${
        highlight ? 'font-bold' : 'font-medium opacity-95'
      }`}
    >
      {icon && <span className={highlight ? 'text-yellow-200' : 'opacity-80'}>{icon}</span>}
      {label}
    </span>
  );
}

function Divider() {
  return <span className="w-px h-3 bg-white/30 hidden sm:inline-block" />;
}
