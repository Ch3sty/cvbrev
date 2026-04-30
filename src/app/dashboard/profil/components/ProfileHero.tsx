'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, Check, Crown } from 'lucide-react';
import Image from 'next/image';
import { ProfileHeroOrb, PremiumCrownIcon } from './illustrations/ProfileIcons';

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

            {/* Premium-CTA-kort */}
            <div
              className="rounded-2xl p-4 sm:p-5"
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(249, 115, 22, 0.22)',
              }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{
                    background: 'linear-gradient(135deg, #FCD34D, #F59E0B)',
                    boxShadow: '0 6px 16px -4px rgba(245, 158, 11, 0.4)',
                  }}
                >
                  <Crown className="w-5 h-5" strokeWidth={2.25} />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-0.5">
                    Du är på gratis-planen
                  </div>
                  <div className="text-base font-bold text-slate-900 leading-tight">
                    Testa Premium gratis i 7 dagar
                  </div>
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
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"
                  style={{ boxShadow: '0 8px 24px -8px rgba(0, 0, 0, 0.25)' }}
                >
                  <span className="text-3xl sm:text-4xl font-bold text-white">
                    {(fullName || email)[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
              {/* Premium-krona i hörnet */}
              <div className="absolute -top-1 -right-1">
                <PremiumCrownIcon className="w-9 h-9 sm:w-10 sm:h-10" />
              </div>
            </div>
          </div>

          {/* Text + CTA */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm mb-2">
              <Sparkles className="w-3 h-3" strokeWidth={2.5} />
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
