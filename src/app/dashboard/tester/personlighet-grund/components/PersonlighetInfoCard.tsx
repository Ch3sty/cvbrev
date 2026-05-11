'use client';

import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Compass,
  HeartHandshake,
  Brain,
} from 'lucide-react';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Inget rätt eller fel',
    sub: 'Bara din profil',
  },
  {
    icon: Compass,
    title: 'Big Five-modellen',
    sub: 'Vetenskapligt grundad',
  },
  {
    icon: HeartHandshake,
    title: 'Konkreta insikter',
    sub: 'För karriär och intervju',
  },
  {
    icon: Brain,
    title: 'Sparas i din profil',
    sub: 'Används i CV och brev',
  },
];

export default function PersonlighetInfoCard({
  variant,
}: {
  variant: 'grund' | 'avancerad';
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
      className="relative bg-white rounded-3xl border border-indigo-200/60 overflow-hidden"
      style={{ boxShadow: '0 8px 32px -12px rgba(99, 102, 241, 0.18)' }}
    >
      <div
        className="absolute top-0 inset-x-0 h-1"
        style={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6, #EC4899)' }}
      />

      <div className="p-5 sm:p-7 md:p-8">
        <div className="mb-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700 mb-1.5">
            Om testet
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            En tydligare bild av dig själv
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
            {variant === 'grund'
              ? 'Big Five är den modell som forskningen vilar mest tungt på. Du svarar på 50 påståenden om dig själv på en skala från 1 till 5, och får sedan en profil över fem grundläggande personlighetsdimensioner — och vad de betyder för din karriär.'
              : 'Den avancerade versionen går djupare. 120 frågor mäter inte bara de fem huvuddimensionerna utan också 30 underliggande facetter — så du får en mer nyanserad bild av exakt vad som driver dig. Inkluderar AI-genererade karriärinsikter.'}
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
      className="p-3 sm:p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100/80"
    >
      <div
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-white mb-2.5"
        style={{
          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
          boxShadow: '0 6px 14px -4px rgba(139, 92, 246, 0.35)',
        }}
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.25} />
      </div>
      <div className="text-sm font-bold text-slate-900 leading-tight">{feature.title}</div>
      <div className="text-[11px] sm:text-xs text-slate-600 mt-0.5">{feature.sub}</div>
    </motion.div>
  );
}
