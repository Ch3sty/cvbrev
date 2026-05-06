'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText,
  PenLine,
  Briefcase,
  BarChart3,
  LayoutTemplate,
  ArrowRight,
} from 'lucide-react';

interface CvUnlocksFlowProps {
  variant?: 'full' | 'compact';
}

interface FeatureNode {
  id: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  icon: typeof PenLine;
}

const FEATURES: FeatureNode[] = [
  {
    id: 'letter',
    title: 'Personliga brev',
    body: 'Personliga brev som matchar varje annons',
    cta: 'Skapa brev',
    href: '/dashboard/skapa-brev',
    icon: PenLine,
  },
  {
    id: 'jobs',
    title: 'Jobbmatchning',
    body: 'Jobb du faktiskt matchar',
    cta: 'Hitta jobb',
    href: '/dashboard/jobbmatchning',
    icon: Briefcase,
  },
  {
    id: 'analysis',
    title: 'Förbättra CV',
    body: 'Få feedback på 30 sekunder',
    cta: 'Analysera CV',
    href: '/dashboard/cv-analys',
    icon: BarChart3,
  },
  {
    id: 'templates',
    title: 'Snygga CV-mallar',
    body: 'Färdiga mallar att ladda ner',
    cta: 'Bläddra mallar',
    href: '/dashboard/cv-mallar',
    icon: LayoutTemplate,
  },
];

export default function CvUnlocksFlow({ variant = 'full' }: CvUnlocksFlowProps) {
  const isCompact = variant === 'compact';

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      className="relative overflow-hidden bg-white rounded-3xl border border-orange-200/50 p-5 sm:p-7"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.15)' }}
    >
      <DotPatternBg />

      <div className="relative">
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 mb-1.5">
            {isCompact ? 'Aktiverat' : 'Det här låser ditt CV upp'}
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            {isCompact
              ? 'Du har låst upp 4 funktioner'
              : 'Fyra funktioner, ett CV'}
          </h2>
          {!isCompact && (
            <p className="text-sm text-slate-600 mt-1.5 max-w-md mx-auto">
              När ditt CV är på plats kan du börja skapa, söka och analysera
              direkt.
            </p>
          )}
        </div>

        {/* Desktop horizontal flow with SVG connectors */}
        <div className="hidden md:block">
          <DesktopFlow features={FEATURES} compact={isCompact} />
        </div>

        {/* Mobile vertical stack */}
        <div className="md:hidden">
          <MobileFlow features={FEATURES} compact={isCompact} />
        </div>
      </div>
    </motion.section>
  );
}

function DesktopFlow({
  features,
  compact,
}: {
  features: FeatureNode[];
  compact: boolean;
}) {
  const cvSize = compact ? 60 : 80;
  return (
    <div className="relative">
      <div className="flex justify-center mb-6">
        <CvHubNode size={cvSize} pulse={!compact} />
      </div>

      <svg
        className="absolute left-0 right-0 mx-auto pointer-events-none"
        style={{
          top: cvSize + 12,
          height: 60,
          width: '90%',
          left: '5%',
        }}
        viewBox="0 0 800 60"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {[100, 333, 567, 700].map((x, i) => (
          <motion.line
            key={i}
            x1="400"
            y1="0"
            x2={x}
            y2="60"
            stroke="#FB923C"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: 0.3 + i * 0.1 }}
          />
        ))}
      </svg>

      <div className="grid grid-cols-4 gap-4 pt-12">
        {features.map((feature, i) => (
          <FeatureCard
            key={feature.id}
            feature={feature}
            index={i}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}

function MobileFlow({
  features,
  compact,
}: {
  features: FeatureNode[];
  compact: boolean;
}) {
  const cvSize = compact ? 56 : 72;
  return (
    <div className="relative">
      <div className="flex justify-center mb-4">
        <CvHubNode size={cvSize} pulse={!compact} />
      </div>

      <div className="space-y-3 pt-2">
        {features.map((feature, i) => (
          <FeatureRow
            key={feature.id}
            feature={feature}
            index={i}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}

function CvHubNode({ size, pulse }: { size: number; pulse: boolean }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {pulse && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'linear-gradient(135deg, #F97316, #DC2626)',
            }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.35, 0, 0.35] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'linear-gradient(135deg, #F97316, #DC2626)',
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.15, 0.5] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: 'easeOut',
              delay: 0.4,
            }}
          />
        </>
      )}
      <div
        className="relative w-full h-full rounded-full flex items-center justify-center text-white"
        style={{
          background:
            'linear-gradient(135deg, #F97316 0%, #DC2626 60%, #BE185D 100%)',
          boxShadow: '0 12px 28px -6px rgba(220, 38, 38, 0.45)',
        }}
      >
        <FileText
          className={size > 70 ? 'w-9 h-9' : 'w-7 h-7'}
          strokeWidth={2}
        />
      </div>
    </div>
  );
}

function FeatureCard({
  feature,
  index,
  compact,
}: {
  feature: FeatureNode;
  index: number;
  compact: boolean;
}) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.4 + index * 0.08 }}
    >
      <Link
        href={feature.href}
        className="group block h-full p-4 rounded-2xl border border-slate-200 bg-white hover:border-orange-300 hover:-translate-y-1 transition-all"
        style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3"
          style={{
            background: 'linear-gradient(135deg, #FB923C 0%, #DC2626 100%)',
            boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.35)',
          }}
        >
          <Icon className="w-5 h-5" strokeWidth={2.25} />
        </div>
        <h4 className="text-sm sm:text-base font-semibold text-slate-900 leading-tight mb-1">
          {feature.title}
        </h4>
        {!compact && (
          <p className="text-xs sm:text-sm text-slate-600 leading-snug mb-3">
            {feature.body}
          </p>
        )}
        <div className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 group-hover:text-orange-800">
          <span>{feature.cta}</span>
          <ArrowRight
            className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
            strokeWidth={2.5}
          />
        </div>
      </Link>
    </motion.div>
  );
}

function FeatureRow({
  feature,
  index,
  compact,
}: {
  feature: FeatureNode;
  index: number;
  compact: boolean;
}) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.3 + index * 0.08 }}
    >
      <Link
        href={feature.href}
        className="group flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-orange-300 transition-all touch-manipulation min-h-[64px]"
      >
        <div
          className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white"
          style={{
            background: 'linear-gradient(135deg, #FB923C 0%, #DC2626 100%)',
            boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.35)',
          }}
        >
          <Icon className="w-5 h-5" strokeWidth={2.25} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-900 leading-tight">
            {feature.title}
          </h4>
          {!compact && (
            <p className="text-xs text-slate-600 leading-snug mt-0.5">
              {feature.body}
            </p>
          )}
        </div>
        <ArrowRight
          className="w-4 h-4 text-orange-500 flex-shrink-0 transition-transform group-hover:translate-x-0.5"
          strokeWidth={2.5}
        />
      </Link>
    </motion.div>
  );
}

function DotPatternBg() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
      aria-hidden="true"
    >
      <pattern
        id="unlocks-flow-dots"
        x="0"
        y="0"
        width="32"
        height="32"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="16" cy="16" r="1" fill="#FB923C" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#unlocks-flow-dots)" opacity="0.4" />
    </svg>
  );
}
