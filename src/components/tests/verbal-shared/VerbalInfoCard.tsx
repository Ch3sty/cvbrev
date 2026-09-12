'use client';

import { motion } from 'framer-motion';
import { Target, Clock, BookOpen, CheckCircle2 } from 'lucide-react';

interface VerbalInfoCardProps {
  variant: 'v1' | 'v2';
}

export default function VerbalInfoCard({ variant }: VerbalInfoCardProps) {
  const isV2 = variant === 'v2';

  const features = [
    {
      icon: BookOpen,
      title: '12 passager',
      sub: '4 påståenden var',
    },
    {
      icon: Target,
      title: '48 påståenden',
      sub: '3 svarsalternativ',
    },
    {
      icon: Clock,
      title: 'Ca 25 min',
      sub: 'Tidsgräns',
    },
    {
      icon: CheckCircle2,
      title: isV2 ? 'Avancerad' : 'Grundnivå',
      sub: isV2 ? 'Mensa-nivå' : 'Rekryteringsnivå',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
      className="relative bg-white rounded-xl border border-orange-200/60 overflow-hidden"
    >
      <div className="p-5 sm:p-7 md:p-8">
        <div className="mb-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
            Om testet
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            {isV2 ? 'Avancerad textanalys' : 'Klassiskt rekryteringsformat'}
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 mt-2 leading-relaxed">
            {isV2
              ? 'Texterna är längre, påståendena mer subtila och slutsatserna kräver att du läser noggrant. Inom samhälle, vetenskap och kultur, perfekt för chefspositioner och kvalificerade roller.'
              : 'Du läser en passage, sedan avgör du om fyra påståenden är sanna, falska eller om det inte går att avgöra utifrån texten. Samma format som SHL och Saville använder.'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
          {features.map((feature, index) => (
            <FeaturePill key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        {/* Svarsalternativ-förklaring */}
        <div className="bg-orange-50/60 border border-orange-100 rounded-xl p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 mb-2.5">
            Tre svarsalternativ
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <AnswerExplain
              type="true"
              label="Sant"
              text="Påståendet följer logiskt av texten."
            />
            <AnswerExplain
              type="false"
              label="Falskt"
              text="Påståendet motsäger texten."
            />
            <AnswerExplain
              type="cannot"
              label="Kan ej avgöras"
              text="Texten ger inte tillräcklig info."
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function FeaturePill({
  feature,
  index,
}: {
  feature: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; title: string; sub: string };
  index: number;
}) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 + index * 0.05 }}
      className="p-3 sm:p-4 rounded-xl bg-orange-50/60 border border-orange-100/80"
    >
      <Icon className="w-5 h-5 text-neutral-700 mb-2.5" strokeWidth={2.25} />
      <div className="text-sm font-bold text-neutral-900 leading-tight">{feature.title}</div>
      <div className="text-xs sm:text-xs text-neutral-600 mt-0.5">{feature.sub}</div>
    </motion.div>
  );
}

function AnswerExplain({
  type,
  label,
  text,
}: {
  type: 'true' | 'false' | 'cannot';
  label: string;
  text: string;
}) {
  const styles = {
    true: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconBg: 'bg-emerald-500' },
    false: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', iconBg: 'bg-red-500' },
    cannot: { bg: 'bg-neutral-50', border: 'border-neutral-200', text: 'text-neutral-700', iconBg: 'bg-neutral-500' },
  }[type];

  return (
    <div className={`flex items-start gap-2 p-2.5 rounded-xl border ${styles.bg} ${styles.border}`}>
      <div className={`flex-shrink-0 w-5 h-5 rounded-full ${styles.iconBg} flex items-center justify-center`}>
        {type === 'true' && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
        {type === 'false' && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        {type === 'cannot' && (
          <span className="text-white text-xs font-semibold">?</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`text-xs font-bold ${styles.text}`}>{label}</div>
        <div className="text-xs text-neutral-600 leading-tight mt-0.5">{text}</div>
      </div>
    </div>
  );
}
