'use client';

import { motion } from 'framer-motion';
import { Target, Clock, ArrowLeftRight } from 'lucide-react';
import { LogicPatternIcon } from './illustrations/MatrixIcons';

const FEATURES = [
  {
    icon: Target,
    title: '15 frågor',
    sub: 'Tre svårighetsnivåer',
  },
  {
    icon: Clock,
    title: 'Ca 20 min',
    sub: 'Ingen tidsgräns',
  },
  {
    icon: ArrowLeftRight,
    title: 'Hoppa fritt',
    sub: 'Mellan frågor',
  },
  {
    icon: LogicPatternIcon,
    title: 'Visuell logik',
    sub: 'Mönsterigenkänning',
  },
];

export default function TestInfoCard() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
      className="relative bg-white rounded-3xl border border-orange-200/60 overflow-hidden"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.18)' }}
    >
      {/* Gradient-strip top */}
      <div
        className="absolute top-0 inset-x-0 h-1"
        style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626, #BE185D)' }}
      />

      <div className="p-5 sm:p-7 md:p-8">
        <div className="mb-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
            Om testet
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Mät din analytiska förmåga
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
            Detta test används ofta i rekryteringsprocesser för att bedöma analytisk förmåga
            och mönsterigenkänning. Träna i din egen takt — ingen tidsgräns, du kan pausa när du vill.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          {FEATURES.map((feature, index) => (
            <FeaturePill key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function FeaturePill({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
}) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 + index * 0.05 }}
      className="p-3 sm:p-4 rounded-2xl bg-orange-50/60 border border-orange-100/80"
    >
      <div
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-white mb-2.5"
        style={{
          background: 'linear-gradient(135deg, #F97316, #DC2626)',
          boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.35)',
        }}
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.25} />
      </div>
      <div className="text-sm font-bold text-slate-900 leading-tight">{feature.title}</div>
      <div className="text-[11px] sm:text-xs text-slate-600 mt-0.5">{feature.sub}</div>
    </motion.div>
  );
}
