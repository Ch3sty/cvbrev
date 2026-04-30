'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  PenLine,
  SlidersHorizontal,
  LayoutTemplate,
  BarChart3,
  Briefcase,
  LifeBuoy,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface PremiumFeaturesGridProps {
  isPremium: boolean;
}

interface Feature {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description: string;
  href?: string;
}

const FEATURES: Feature[] = [
  {
    icon: PenLine,
    title: 'Obegränsade brev',
    description: 'Skriv ett vasst brev till varje annons utan att räkna.',
    href: '/dashboard/skapa-brev',
  },
  {
    icon: SlidersHorizontal,
    title: 'Smart ton för varje roll',
    description:
      'Vi anpassar språket efter företaget — formellt, kreativt eller mitt emellan.',
    href: '/dashboard/profil',
  },
  {
    icon: LayoutTemplate,
    title: 'Alla CV-mallar',
    description: 'Byt design på en kvart. Innehållet följer med.',
    href: '/dashboard/cv-mallar',
  },
  {
    icon: BarChart3,
    title: 'CV-analyser i realtid',
    description: 'Se exakt vad rekryteraren ser — och förbättra det innan du söker.',
    href: '/dashboard/profil/cv',
  },
  {
    icon: Briefcase,
    title: 'Profil & jobbmatchning',
    description: 'Vi matchar dig mot annonser som faktiskt passar.',
    href: '/dashboard/jobbmatch',
  },
  {
    icon: LifeBuoy,
    title: 'Prioriterad support',
    description: 'Snabbare svar när du behöver hjälp.',
  },
];

export default function PremiumFeaturesGrid({ isPremium }: PremiumFeaturesGridProps) {
  return (
    <section>
      <div className="mb-5 sm:mb-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
          Vad ingår
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          Allt du behöver för att landa nästa jobb
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {FEATURES.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            feature={feature}
            isPremium={isPremium}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  isPremium,
  index,
}: {
  feature: Feature;
  isPremium: boolean;
  index: number;
}) {
  const Icon = feature.icon;

  const content = (
    <>
      {/* Gradient-strip top */}
      <div
        className="absolute top-0 inset-x-0 h-0.5"
        style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626)' }}
      />

      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Ikon-bubble */}
          <div
            className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white"
            style={{
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
              boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.35)',
            }}
          >
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.25} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1 leading-tight">
              {feature.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {feature.description}
            </p>
          </div>
        </div>

        {/* Status-rad i botten */}
        <div className="mt-3 pt-3 border-t border-orange-100/80 flex items-center justify-between">
          {isPremium && feature.href ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 group-hover:gap-1.5 transition-all">
              Använd nu
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </span>
          ) : isPremium ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              Aktiverat
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Lock className="w-3 h-3" strokeWidth={2.5} />
              Kräver Premium
            </span>
          )}
        </div>
      </div>
    </>
  );

  const cardClasses =
    'group relative bg-white rounded-2xl border border-orange-100 overflow-hidden transition-all hover:-translate-y-0.5';
  const cardStyle = {
    boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.18)',
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
    >
      {isPremium && feature.href ? (
        <Link
          href={feature.href}
          className={cardClasses + ' hover:border-orange-300 block'}
          style={cardStyle}
        >
          {content}
        </Link>
      ) : (
        <div className={cardClasses} style={cardStyle}>
          {content}
        </div>
      )}
    </motion.div>
  );
}
