'use client';

import { motion } from 'framer-motion';
import { UserCircle2, Clock, Target } from 'lucide-react';

interface PersonlighetHeroProps {
  variant: 'grund' | 'avancerad';
  hasProfile?: boolean;
  lastCompletedAt?: string | null;
}

const COPY = {
  grund: {
    eyebrow: 'Personlighetstest',
    title: 'Förstå hur du fungerar i arbete',
    description:
      'Många arbetsgivare använder personlighetstester i rekryteringen. Här får du en egen profil byggd på Big Five, modellen som forskningen vilar på, plus konkreta tips inför skarpa tester.',
    questions: '50 frågor',
    time: 'ca 10 min',
    extra: '5 dimensioner',
  },
  avancerad: {
    eyebrow: 'Personlighetstest — avancerad',
    title: 'Din djupgående personlighetsprofil',
    description:
      'Utökad version med 120 frågor som mäter både huvuddimensioner och 30 underliggande facetter. Den djupaste profilen vi erbjuder, med personliga karriärinsikter.',
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
        background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        boxShadow: '0 20px 60px -20px rgba(220, 38, 38, 0.45)',
      }}
    >
      <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" aria-hidden="true">
        <pattern id="hero-pers-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="14" cy="14" r="1" fill="white" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#hero-pers-dots)" />
      </svg>

      {/* Bakgrunds-Big-Five-orbit */}
      <svg className="absolute -right-12 -bottom-12 opacity-20 pointer-events-none hidden sm:block" width="240" height="240" viewBox="0 0 240 240" aria-hidden="true">
        <circle cx="120" cy="120" r="96" fill="none" stroke="white" strokeWidth="1.2" strokeDasharray="2 5" />
        {[
          { cx: 120, cy: 24 },
          { cx: 211, cy: 91 },
          { cx: 176, cy: 198 },
          { cx: 64, cy: 198 },
          { cx: 29, cy: 91 },
        ].map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r="6" fill="white" opacity={0.9 - i * 0.1} />
        ))}
        <path
          d="M 120 24 L 211 91 L 176 198 L 64 198 L 29 91 Z"
          fill="none"
          stroke="white"
          strokeWidth="1.4"
          strokeLinejoin="round"
          opacity="0.5"
        />
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
