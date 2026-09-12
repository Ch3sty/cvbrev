'use client';

import { motion } from 'framer-motion';
import { Calculator, Clock, Target, Layers } from 'lucide-react';
import { NumericalHeroIllustration } from './illustrations/NumericalIcons';

interface NumericalTestHeroProps {
  variant: 'v1' | 'v2' | 'expert';
  bestScore?: number;
  bestPercentage?: number;
  totalQuestions?: number;
}

export default function NumericalTestHero({
  variant,
  bestScore,
  bestPercentage,
  totalQuestions = 24,
}: NumericalTestHeroProps) {
  const eyebrowLabel =
    variant === 'v1'
      ? 'Numerisk analys'
      : variant === 'v2'
      ? 'Numerisk analys, avancerad'
      : 'Numerisk analys, expert';
  const title =
    variant === 'v1'
      ? 'Tolka siffror utan att gissa'
      : variant === 'v2'
      ? 'Avancerad sifferanalys på elit-nivå'
      : 'Beslutsstödsmatte på expertnivå';
  const subtitle =
    variant === 'v1'
      ? 'Klassiskt rekryteringstest. Tolka tabeller, läs grafer, lös talserier och hantera procent och konvertering, det rekryterare faktiskt mäter.'
      : variant === 'v2'
      ? 'Komplexa beräkningar med flera steg, sammansatta procentförändringar och avancerade dataset, för dig som vill nå topprocenten.'
      : 'Investeringskalkyl, optimering och känslighetsanalys. Flera datakällor och beslut under osäkerhet, den tuffaste numeriska nivån.';
  const difficultyLabel =
    variant === 'v1' ? 'Grundnivå' : variant === 'v2' ? 'Avancerad' : 'Expert';
  const timeLabel = variant === 'v1' ? 'ca 25 min' : variant === 'v2' ? 'ca 35 min' : 'ca 35 min';

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-xl bg-white border border-neutral-200 text-neutral-900"
    >
      <NumericalHeroIllustration className="absolute -right-10 -top-6 sm:-right-12 sm:-top-8 opacity-15 pointer-events-none hidden sm:block" />

      <div className="relative p-6 sm:p-8 md:p-10 lg:p-12">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 mb-4">
            <Calculator className="w-3.5 h-3.5" strokeWidth={2.5} />
            {eyebrowLabel}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-3">
            {title}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-neutral-600 leading-relaxed mb-6 max-w-xl">
            {subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-5 border-t border-neutral-200">
            <Stat icon={<Target className="w-3.5 h-3.5" strokeWidth={2.5} />} label={`${totalQuestions} frågor`} />
            <Divider />
            <Stat icon={<Clock className="w-3.5 h-3.5" strokeWidth={2.5} />} label={timeLabel} />
            <Divider />
            <Stat icon={<Layers className="w-3.5 h-3.5" strokeWidth={2.5} />} label={difficultyLabel} />
            {bestScore !== undefined && bestScore > 0 && (
              <>
                <Divider />
                <Stat
                  icon={<Trophy />}
                  label={`Bästa: ${bestScore}/${totalQuestions} (${bestPercentage}%)`}
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
        highlight ? 'font-bold text-orange-700' : 'font-medium text-neutral-600'
      }`}
    >
      <span className={highlight ? 'text-amber-500' : 'text-neutral-500'}>{icon}</span>
      {label}
    </span>
  );
}

function Divider() {
  return <span className="w-px h-3 bg-neutral-200 hidden sm:inline-block" />;
}

function Trophy() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2 L14.5 8.5 L21.5 9 L16 13.5 L18 20.5 L12 16.5 L6 20.5 L8 13.5 L2.5 9 L9.5 8.5 Z" />
    </svg>
  );
}
