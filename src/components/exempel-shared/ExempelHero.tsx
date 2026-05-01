'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Eye, Layers, ShieldCheck, Clock, Gift } from 'lucide-react';
import OgLetterMockup from '@/components/og-preview/OgLetterMockup';
import OgCvMockup from '@/components/og-preview/OgCvMockup';

interface ExempelHeroProps {
  variant: 'letter' | 'cv';
  yrke: string;
  intro: string;
  primaryCtaHref: string;
  primaryCtaLabel: string;
  secondaryCtaTargetId?: string;
  secondaryCtaLabel?: string;
}

export default function ExempelHero({
  variant,
  yrke,
  intro,
  primaryCtaHref,
  primaryCtaLabel,
  secondaryCtaTargetId = 'preview',
  secondaryCtaLabel = 'Se exemplet',
}: ExempelHeroProps) {
  const eyebrowLabel =
    variant === 'letter' ? 'Personligt brev exempel' : 'CV exempel';

  const titleLength = yrke.length;
  const titleSizeClass =
    titleLength > 18
      ? 'text-3xl sm:text-4xl md:text-5xl'
      : 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl';

  const handleScrollToPreview = () => {
    if (typeof document === 'undefined') return;
    const el = document.getElementById(secondaryCtaTargetId);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl text-white"
      style={{
        background:
          'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        boxShadow: '0 20px 60px -20px rgba(220, 38, 38, 0.45)',
      }}
    >
      {/* Prick-pattern overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
        aria-hidden="true"
      >
        <pattern
          id={`hero-exempel-dots-${variant}`}
          x="0"
          y="0"
          width="28"
          height="28"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="14" cy="14" r="1" fill="white" />
        </pattern>
        <rect width="100%" height="100%" fill={`url(#hero-exempel-dots-${variant})`} />
      </svg>

      {/* Vinjett-glöd från höger */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 100% 50%, rgba(0,0,0,0.18) 0%, transparent 55%)',
        }}
      />

      <div className="relative p-6 sm:p-8 md:p-10 lg:p-12">
        <div className="grid lg:grid-cols-[1fr_auto] gap-8 lg:gap-10 items-center">
          {/* Vänster: text */}
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white/20 backdrop-blur-sm mb-4">
              <span
                className="w-1.5 h-1.5 rounded-full bg-yellow-300"
                aria-hidden="true"
              />
              {eyebrowLabel}
            </div>

            {/* H1 */}
            <h1
              className={`${titleSizeClass} font-black leading-[1.05] tracking-tight mb-4`}
              style={{ textShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
            >
              {yrke}
            </h1>

            {/* Intro */}
            <p className="text-sm sm:text-base md:text-lg opacity-95 leading-relaxed mb-6 max-w-xl">
              {intro}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link href={primaryCtaHref} className="block">
                <button className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-white text-orange-700 font-bold hover:bg-orange-50 hover:shadow-2xl transition-all flex items-center justify-center gap-2 group">
                  {primaryCtaLabel}
                  <ArrowRight
                    className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                    strokeWidth={2.5}
                  />
                </button>
              </Link>
              <button
                onClick={handleScrollToPreview}
                className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl border-2 border-white/50 bg-white/10 backdrop-blur-sm text-white font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" strokeWidth={2.5} />
                {secondaryCtaLabel}
              </button>
            </div>

            {/* Stat-rad */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-5 border-t border-white/20">
              <Stat
                icon={<Gift className="w-3.5 h-3.5" strokeWidth={2.5} />}
                label={
                  variant === 'letter'
                    ? 'Skapa ditt eget brev — helt gratis'
                    : 'Skapa ditt eget CV — helt gratis'
                }
                highlight
              />
              <Divider />
              <Stat
                icon={<ShieldCheck className="w-3.5 h-3.5" strokeWidth={2.5} />}
                label="ATS-optimerat"
              />
              <Divider />
              <Stat
                icon={<Clock className="w-3.5 h-3.5" strokeWidth={2.5} />}
                label="60 sek"
              />
              <Divider />
              <Stat
                icon={<Layers className="w-3.5 h-3.5" strokeWidth={2.5} />}
                label={variant === 'letter' ? '6 mallar' : '8+ mallar'}
              />
            </div>
          </div>

          {/* Höger: mockup-illustration */}
          <div className="hidden lg:flex items-center justify-center">
            <div
              className="relative"
              style={{
                width: 380,
                height: 380,
                transform: 'scale(0.7)',
                transformOrigin: 'center',
              }}
            >
              {/* Skala ner OgFrame's mockup till hero-storlek */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {variant === 'letter' ? <OgLetterMockup /> : <OgCvMockup />}
              </div>
            </div>
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
  return (
    <span className="w-px h-3 bg-white/30 hidden sm:inline-block" aria-hidden="true" />
  );
}
