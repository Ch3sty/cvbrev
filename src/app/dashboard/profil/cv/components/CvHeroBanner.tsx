'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Upload,
  PenTool,
  ArrowRight,
  CheckCircle2,
  PenLine,
  Briefcase,
  BarChart3,
  LayoutTemplate,
  Crown,
} from 'lucide-react';

type HeroMode = 'empty' | 'populated';

interface CvHeroBannerProps {
  mode: HeroMode;
  cvCount?: number;
  isPremium?: boolean;
  latestUploadedAt?: string | null;
  cvLimit?: number;
}

export default function CvHeroBanner({
  mode,
  cvCount = 0,
  isPremium = false,
  latestUploadedAt = null,
  cvLimit = 2,
}: CvHeroBannerProps) {
  if (mode === 'empty') {
    return <EmptyHero />;
  }
  return (
    <PopulatedHero
      cvCount={cvCount}
      isPremium={isPremium}
      latestUploadedAt={latestUploadedAt}
      cvLimit={cvLimit}
    />
  );
}

function EmptyHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl text-white"
      style={{
        background:
          'linear-gradient(135deg, #F97316 0%, #DC2626 60%, #BE185D 100%)',
        boxShadow: '0 20px 40px -12px rgba(220, 38, 38, 0.35)',
      }}
    >
      <BackgroundDocStack />

      <FloatingFeatureOrbs />

      <div className="relative p-6 sm:p-8 md:p-10 lg:p-12">
        <div className="max-w-xl">
          <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80 mb-3">
            Mina CV
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-3">
            Ladda upp ditt CV — vi gör resten
          </h1>
          <p className="text-sm sm:text-base opacity-90 leading-relaxed mb-6 max-w-lg">
            Ditt CV är hjärtat i jobbcoach.ai. Vi läser det, förstår vad du kan,
            och låser upp personliga brev, jobbmatchning, profilanalys och
            färdiga CV-mallar.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="#upload-zone"
              className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-5 py-3 rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all touch-manipulation min-h-[48px]"
            >
              <Upload className="w-4 h-4" strokeWidth={2.5} />
              Ladda upp CV
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </a>
            <Link
              href="/dashboard/skapa-cv"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white px-5 py-3 rounded-xl font-semibold text-sm sm:text-base hover:bg-white/20 transition-all touch-manipulation min-h-[48px]"
            >
              <PenTool className="w-4 h-4" strokeWidth={2.5} />
              Skapa CV från grunden
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function PopulatedHero({
  cvCount,
  isPremium,
  latestUploadedAt,
  cvLimit,
}: {
  cvCount: number;
  isPremium: boolean;
  latestUploadedAt: string | null;
  cvLimit: number;
}) {
  const heading =
    cvCount === 1 ? 'Ditt CV är aktivt och redo' : 'Dina CV är aktiva och redo';

  const planLabel = isPremium ? 'Premium ∞' : `Free ${cvCount}/${cvLimit}`;
  const lastUploadLabel = latestUploadedAt
    ? formatRelativeShort(latestUploadedAt)
    : '–';

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl text-white"
      style={{
        background:
          'linear-gradient(135deg, #F97316 0%, #DC2626 60%, #BE185D 100%)',
        boxShadow: '0 20px 40px -12px rgba(220, 38, 38, 0.35)',
      }}
    >
      <BackgroundDocStack compact />

      <div className="relative p-5 sm:p-6 md:p-7">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80 mb-1.5">
              Mina CV
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight tracking-tight">
              {heading}
            </h1>
            <p className="text-sm sm:text-base opacity-90 mt-1.5 max-w-lg">
              Skapa brev, hitta jobb och analysera din profil när du vill.
            </p>
          </div>

          <span className="hidden sm:inline-flex flex-shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold border border-white/30">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
            Klart
          </span>
        </div>

        <div className="flex flex-wrap items-stretch gap-x-5 sm:gap-x-7 gap-y-3 pt-4 border-t border-white/20">
          <Stat
            label={cvCount === 1 ? 'CV' : 'Sparade CV'}
            value={`${cvCount}`}
          />
          <Divider />
          <Stat
            label="Plan"
            value={planLabel}
            icon={isPremium ? <Crown className="w-3.5 h-3.5" /> : null}
          />
          <Divider />
          <Stat label="Senast uppladdat" value={lastUploadLabel} small />
        </div>
      </div>
    </motion.section>
  );
}

function Stat({
  label,
  value,
  small,
  icon,
}: {
  label: string;
  value: string;
  small?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">
        {label}
      </div>
      <div
        className={`font-bold tabular-nums flex items-center gap-1.5 ${
          small
            ? 'text-sm sm:text-base truncate max-w-[160px] sm:max-w-[200px]'
            : 'text-xl sm:text-2xl md:text-3xl'
        }`}
      >
        {icon}
        {value}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="w-px self-stretch bg-white/20 hidden sm:block" />;
}

function BackgroundDocStack({ compact = false }: { compact?: boolean }) {
  const size = compact ? 240 : 340;
  return (
    <svg
      className={`absolute pointer-events-none ${
        compact
          ? '-right-10 -top-6 opacity-15'
          : '-right-12 -top-8 opacity-15'
      }`}
      width={size}
      height={size}
      viewBox="0 0 320 320"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="80"
        y="80"
        width="140"
        height="180"
        rx="14"
        stroke="white"
        strokeWidth="2"
        opacity="0.5"
        transform="rotate(-8 150 170)"
      />
      <rect
        x="100"
        y="70"
        width="140"
        height="180"
        rx="14"
        stroke="white"
        strokeWidth="2"
        opacity="0.7"
        transform="rotate(4 170 160)"
      />
      <rect
        x="120"
        y="60"
        width="140"
        height="180"
        rx="14"
        fill="white"
        fillOpacity="0.08"
        stroke="white"
        strokeWidth="2"
        opacity="0.9"
      />
      <line x1="138" y1="92" x2="240" y2="92" stroke="white" strokeWidth="2" opacity="0.4" />
      <line x1="138" y1="110" x2="220" y2="110" stroke="white" strokeWidth="2" opacity="0.3" />
      <line x1="138" y1="135" x2="240" y2="135" stroke="white" strokeWidth="2" opacity="0.3" />
      <line x1="138" y1="153" x2="210" y2="153" stroke="white" strokeWidth="2" opacity="0.25" />
      <line x1="138" y1="175" x2="235" y2="175" stroke="white" strokeWidth="2" opacity="0.25" />
      <line x1="138" y1="195" x2="225" y2="195" stroke="white" strokeWidth="2" opacity="0.2" />
      <circle cx="50" cy="240" r="3" fill="white" opacity="0.3" />
      <circle cx="65" cy="265" r="2" fill="white" opacity="0.25" />
      <circle cx="38" cy="215" r="2" fill="white" opacity="0.2" />
    </svg>
  );
}

function FloatingFeatureOrbs() {
  const orbs = [
    { Icon: PenLine, top: '14%', right: '24%', delay: 0 },
    { Icon: Briefcase, top: '36%', right: '8%', delay: 0.4 },
    { Icon: BarChart3, top: '62%', right: '28%', delay: 0.8 },
    { Icon: LayoutTemplate, top: '78%', right: '14%', delay: 1.2 },
  ];

  return (
    <div className="absolute inset-0 hidden lg:block pointer-events-none" aria-hidden="true">
      {orbs.map(({ Icon, top, right, delay }, i) => (
        <motion.div
          key={i}
          className="absolute w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white"
          style={{ top, right }}
          animate={{ y: [0, -8, 0], opacity: [0.55, 0.85, 0.55] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay,
            ease: 'easeInOut',
          }}
        >
          <Icon className="w-5 h-5" strokeWidth={2} />
        </motion.div>
      ))}
    </div>
  );
}

function formatRelativeShort(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Idag';
  if (diffDays === 1) return 'Igår';
  if (diffDays < 7) return `${diffDays} dgr sedan`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} v sedan`;
  return d.toLocaleDateString('sv-SE');
}
