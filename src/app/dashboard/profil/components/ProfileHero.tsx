'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import Image from 'next/image';
import { ProfileHeroOrb } from './illustrations/ProfileIcons';

interface ProfileHeroProps {
  fullName: string;
  email: string;
  profilePhotoUrl?: string;
  subscriptionTier: 'free' | 'premium';
  isTrialUser?: boolean;
  isAdminGranted?: boolean;
  premiumUntil?: Date | null;
  hasActiveTrialOrPremium?: boolean;
}

export default function ProfileHero(props: ProfileHeroProps) {
  if (props.subscriptionTier === 'premium') {
    return <PremiumHero {...props} />;
  }
  return <FreeHero {...props} />;
}

/* ---------- FREE-VARIANT ---------- */

function FreeHero({
  fullName,
  email,
  profilePhotoUrl,
}: ProfileHeroProps) {
  const benefits = [
    'Obegränsade brev och CV-analyser',
    'Spara så många CV:n du vill',
    'Premium-mallar och Smart val',
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl"
      style={{
        background:
          'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 45%, #FECACA 100%)',
        border: '1px solid rgba(249, 115, 22, 0.22)',
        boxShadow: '0 20px 60px -24px rgba(220, 38, 38, 0.25)',
      }}
    >
      {/* Subtilt prick-pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
        aria-hidden="true"
      >
        <pattern id="hero-free-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="14" cy="14" r="1" fill="#FB923C" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#hero-free-dots)" />
      </svg>

      <div className="relative p-5 sm:p-7 md:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-7">
          {/* Vänster: avatar + namn */}
          <div className="flex-shrink-0 text-center sm:text-left">
            <div className="relative inline-block">
              {profilePhotoUrl ? (
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-4 ring-white" style={{ boxShadow: '0 8px 24px -8px rgba(220, 38, 38, 0.3)' }}>
                  <Image src={profilePhotoUrl} alt={fullName || 'Profilbild'} fill className="object-cover" />
                </div>
              ) : (
                <ProfileHeroOrb className="w-20 h-20 sm:w-24 sm:h-24" />
              )}
            </div>
          </div>

          {/* Höger: text + CTA */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
              Din profil
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight mb-1">
              {fullName || 'Hej där'}
            </h1>
            <p className="text-sm text-slate-700 mb-4 truncate">{email}</p>

            {/* Premium-CTA-kort — utan Crown-ikon för att undvika dubbla cirklar med ProfileHeroOrb */}
            <div
              className="rounded-2xl p-4 sm:p-5"
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(249, 115, 22, 0.22)',
              }}
            >
              <div className="mb-3 text-left">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-1">
                  <span>Gratisplan</span>
                  <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
                  <span className="text-amber-700">Premium</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Testa Premium gratis i 7 dagar
                </div>
              </div>

              <ul className="space-y-1.5 mb-4">
                {benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-2 text-sm text-slate-700"
                  >
                    <Check
                      className="flex-shrink-0 w-4 h-4 text-emerald-600 mt-0.5"
                      strokeWidth={3}
                    />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/dashboard/profil/prenumeration"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-sm min-h-[48px]"
                style={{
                  background: 'linear-gradient(135deg, #F97316, #DC2626)',
                  boxShadow: '0 8px 20px -6px rgba(220, 38, 38, 0.45)',
                }}
              >
                Starta gratisperioden
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ---------- PREMIUM-VARIANT ---------- */

function PremiumHero({
  fullName,
  email,
  profilePhotoUrl,
  isTrialUser,
  isAdminGranted,
  premiumUntil,
  hasActiveTrialOrPremium,
}: ProfileHeroProps) {
  // Beräkna tid kvar för trial
  const formatTimeUntil = (date: Date): string => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    if (diffMs <= 0) return 'snart slut';
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (diffDays > 0) return `${diffDays} dag${diffDays > 1 ? 'ar' : ''} kvar`;
    if (diffHours > 0) return `${diffHours} tim kvar`;
    return 'snart slut';
  };

  const subStatus =
    isTrialUser && premiumUntil && hasActiveTrialOrPremium
      ? `Provperiod — ${formatTimeUntil(premiumUntil)}`
      : isAdminGranted
      ? 'Premium via Jobbcoach'
      : 'Premium aktiv';

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl text-white"
      style={{
        background:
          'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        boxShadow: '0 20px 60px -20px rgba(220, 38, 38, 0.45)',
      }}
    >
      {/* Subtilt prick-pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
        aria-hidden="true"
      >
        <pattern id="hero-premium-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="14" cy="14" r="1" fill="white" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#hero-premium-dots)" />
      </svg>

      {/* Profilformulär-stack i högerkanten — matchar Mina CV:s dokument-stack-DNA */}
      <ProfileFormStackBg />

      <div className="relative p-5 sm:p-7 md:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-7">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="relative">
              {profilePhotoUrl ? (
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-4 ring-white/30" style={{ boxShadow: '0 8px 24px -8px rgba(0, 0, 0, 0.3)' }}>
                  <Image src={profilePhotoUrl} alt={fullName || 'Profilbild'} fill className="object-cover" />
                </div>
              ) : (
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm ring-4 ring-white/30"
                  style={{ boxShadow: '0 8px 24px -8px rgba(0, 0, 0, 0.25)' }}
                >
                  <span className="text-3xl sm:text-4xl font-bold text-white">
                    {(fullName || email)[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Text + CTA */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white/20 backdrop-blur-sm mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white" aria-hidden="true" />
              {subStatus}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight mb-1">
              {fullName || 'Hej där'}
            </h1>
            <p className="text-sm opacity-90 mb-4 truncate">{email}</p>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link
                href="/dashboard/profil/prenumeration"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-orange-700 font-bold text-sm bg-white hover:bg-orange-50 transition-colors min-h-[44px]"
              >
                Hantera prenumeration
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
              {isTrialUser && (
                <Link
                  href="/dashboard/profil/prenumeration"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm border border-white/40 hover:bg-white/10 transition-colors min-h-[44px]"
                >
                  Fortsätt med Premium
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/**
 * Bakgrundsstack av profilformulär-papper. Inspirerad av CvHeroBanner:s
 * BackgroundDocStack men anpassad till profil — porträtt-cirkel + fält-rader.
 * Visas endast på desktop (sm+) och ligger absolut-positionerad i högerkanten.
 */
function ProfileFormStackBg() {
  return (
    <svg
      className="absolute -right-10 -top-6 sm:-right-12 sm:-top-8 opacity-15 pointer-events-none hidden sm:block"
      width="320"
      height="320"
      viewBox="0 0 320 320"
      fill="none"
      aria-hidden="true"
    >
      {/* Bakre kort, roterat */}
      <g transform="rotate(-8 150 170)">
        <rect x="80" y="80" width="140" height="180" rx="14" stroke="white" strokeWidth="2" opacity="0.5" />
        <circle cx="105" cy="110" r="10" stroke="white" strokeWidth="1.5" opacity="0.4" fill="none" />
        <line x1="125" y1="105" x2="195" y2="105" stroke="white" strokeWidth="2" opacity="0.35" />
        <line x1="125" y1="115" x2="180" y2="115" stroke="white" strokeWidth="1.5" opacity="0.3" />
      </g>

      {/* Mitten-kort */}
      <g transform="rotate(4 170 160)">
        <rect x="100" y="70" width="140" height="180" rx="14" stroke="white" strokeWidth="2" opacity="0.7" />
        <circle cx="125" cy="100" r="11" stroke="white" strokeWidth="1.75" opacity="0.55" fill="none" />
        <line x1="146" y1="95" x2="220" y2="95" stroke="white" strokeWidth="2" opacity="0.45" />
        <line x1="146" y1="106" x2="200" y2="106" stroke="white" strokeWidth="1.5" opacity="0.4" />
      </g>

      {/* Främre kort (huvud) */}
      <g>
        <rect x="120" y="60" width="140" height="180" rx="14" fill="white" fillOpacity="0.08" stroke="white" strokeWidth="2" opacity="0.9" />
        {/* Profilcirkel */}
        <circle cx="148" cy="92" r="13" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="1.75" />
        <circle cx="148" cy="89" r="4.5" fill="white" opacity="0.85" />
        <path d="M139 99 Q139 95 148 95 Q157 95 157 99 L157 102 L139 102 Z" fill="white" opacity="0.85" />
        {/* Namn-rad */}
        <rect x="170" y="84" width="74" height="4" rx="2" fill="white" opacity="0.7" />
        <rect x="170" y="93" width="50" height="3" rx="1.5" fill="white" opacity="0.5" />
        {/* Fält-rader */}
        <rect x="138" y="125" width="14" height="14" rx="3" fill="white" opacity="0.18" />
        <line x1="158" y1="129" x2="244" y2="129" stroke="white" strokeWidth="2" opacity="0.4" />
        <line x1="158" y1="137" x2="220" y2="137" stroke="white" strokeWidth="1.5" opacity="0.3" />

        <rect x="138" y="153" width="14" height="14" rx="3" fill="white" opacity="0.18" />
        <line x1="158" y1="157" x2="240" y2="157" stroke="white" strokeWidth="2" opacity="0.35" />
        <line x1="158" y1="165" x2="210" y2="165" stroke="white" strokeWidth="1.5" opacity="0.28" />

        <rect x="138" y="181" width="14" height="14" rx="3" fill="white" opacity="0.18" />
        <line x1="158" y1="185" x2="234" y2="185" stroke="white" strokeWidth="2" opacity="0.32" />
        <line x1="158" y1="193" x2="200" y2="193" stroke="white" strokeWidth="1.5" opacity="0.25" />

        <rect x="138" y="209" width="14" height="14" rx="3" fill="white" opacity="0.18" />
        <line x1="158" y1="213" x2="240" y2="213" stroke="white" strokeWidth="2" opacity="0.28" />
      </g>

      {/* Subtila prickar */}
      <circle cx="50" cy="240" r="3" fill="white" opacity="0.3" />
      <circle cx="65" cy="265" r="2" fill="white" opacity="0.25" />
      <circle cx="38" cy="215" r="2" fill="white" opacity="0.2" />
    </svg>
  );
}
