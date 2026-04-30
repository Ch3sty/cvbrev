'use client';

import { motion } from 'framer-motion';
import { Crown, Clock, Calendar, Shield, Check } from 'lucide-react';
import { PrenumerationHeroStack } from './illustrations/PrenumerationIcons';

interface HeroProps {
  isPremium: boolean;
  isTrialUser?: boolean;
  isAdminGranted?: boolean;
  isOnboardingReward?: boolean;
  isGuestInvitation?: boolean;
  premiumUntil?: Date | null;
  onScrollToPricing?: () => void;
}

export default function PrenumerationHero(props: HeroProps) {
  if (props.isPremium) {
    return <PremiumHero {...props} />;
  }
  return <FreeHero {...props} />;
}

/* ---------- FREE-HERO ---------- */

function FreeHero({ onScrollToPricing }: HeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl text-white"
      style={{
        background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        boxShadow: '0 20px 60px -20px rgba(220, 38, 38, 0.45)',
      }}
    >
      {/* Subtilt prick-pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" aria-hidden="true">
        <pattern id="hero-pn-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="14" cy="14" r="1" fill="white" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#hero-pn-dots)" />
      </svg>

      {/* Background stack */}
      <PrenumerationHeroStack className="absolute -right-10 -top-6 sm:-right-12 sm:-top-8 opacity-15 pointer-events-none hidden sm:block" />

      <div className="relative p-6 sm:p-8 md:p-10 lg:p-12">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white/20 backdrop-blur-sm mb-4">
            <Crown className="w-3.5 h-3.5" strokeWidth={2.5} />
            Premium
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-3">
            Lås upp hela jobbcoach.ai
          </h1>
          <p className="text-sm sm:text-base md:text-lg opacity-95 leading-relaxed mb-6 max-w-xl">
            Allt du behöver för att landa nästa jobb. Inga begränsningar, inga avbrott.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onScrollToPricing}
              className="inline-flex items-center justify-center gap-2 bg-white text-orange-700 px-5 py-3 rounded-xl font-bold text-sm sm:text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all touch-manipulation min-h-[48px]"
            >
              Prova gratis i 7 dagar
            </button>
            <button
              onClick={onScrollToPricing}
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/40 text-white px-5 py-3 rounded-xl font-semibold text-sm sm:text-base hover:bg-white/20 transition-all touch-manipulation min-h-[48px]"
            >
              Se vad som ingår
            </button>
          </div>

          {/* Trust-rad */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6 text-xs sm:text-sm opacity-90">
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-4 h-4" strokeWidth={3} />
              Ingen bindningstid
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-4 h-4" strokeWidth={3} />
              Avsluta när som helst
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-4 h-4" strokeWidth={3} />
              0 kr första 7 dagarna
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ---------- PREMIUM-HERO ---------- */

function PremiumHero({
  isTrialUser,
  isAdminGranted,
  isOnboardingReward,
  isGuestInvitation,
  premiumUntil,
}: HeroProps) {
  const timeRemaining = getTimeRemaining(premiumUntil);
  const isTemporary = isTrialUser || isOnboardingReward || isGuestInvitation;

  let statusLabel = 'Premium aktiv';
  if (isAdminGranted) statusLabel = 'Premium via Jobbcoach';
  else if (isTrialUser) statusLabel = 'Provperiod';
  else if (isOnboardingReward) statusLabel = 'Belönings-premium';
  else if (isGuestInvitation) statusLabel = 'Gäst-premium';

  const heading = isTemporary && timeRemaining && !timeRemaining.expired
    ? `${timeRemaining.days} ${timeRemaining.days === 1 ? 'dag' : 'dagar'} kvar av Premium`
    : 'Du är Premium';

  const subheading = isTemporary
    ? 'Förläng innan provperioden tar slut för att inte tappa åtkomst till funktionerna.'
    : isAdminGranted
    ? 'Din åtkomst är beviljad av administratör — ingen bindningstid, inget slutdatum.'
    : 'Allt är upplåst. Skapa, analysera och sök så mycket du vill.';

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl text-white"
      style={{
        background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        boxShadow: '0 20px 60px -20px rgba(220, 38, 38, 0.45)',
      }}
    >
      {/* Prick-pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" aria-hidden="true">
        <pattern id="hero-pn-dots-p" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="14" cy="14" r="1" fill="white" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#hero-pn-dots-p)" />
      </svg>

      <PrenumerationHeroStack className="absolute -right-10 -top-6 sm:-right-12 sm:-top-8 opacity-15 pointer-events-none hidden sm:block" />

      <div className="relative p-6 sm:p-8 md:p-10">
        <div className="flex items-start gap-4 sm:gap-5 mb-4">
          <div
            className="hidden sm:flex flex-shrink-0 w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/30 items-center justify-center"
            style={{ boxShadow: '0 8px 20px -8px rgba(0,0,0,0.25)' }}
          >
            <Crown className="w-8 h-8 text-white" strokeWidth={2.25} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white/20 backdrop-blur-sm mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white" aria-hidden="true" />
              {statusLabel}
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-tight mb-1.5">
              {heading}
            </h1>
            <p className="text-sm sm:text-base opacity-95 leading-relaxed max-w-xl">
              {subheading}
            </p>
          </div>
        </div>

        {/* Countdown för temporary premium */}
        {isTemporary && timeRemaining && !timeRemaining.expired && (
          <div className="mt-5 inline-flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
              <Clock className="w-4 h-4" strokeWidth={2.5} />
              {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m
            </span>
            <span className="hidden sm:inline w-px h-4 bg-white/30" />
            {premiumUntil && (
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm opacity-90">
                <Calendar className="w-3.5 h-3.5" strokeWidth={2.5} />
                Går ut{' '}
                {new Date(premiumUntil).toLocaleDateString('sv-SE', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>
        )}

        {isAdminGranted && (
          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 text-sm">
            <Shield className="w-4 h-4" strokeWidth={2.5} />
            <span className="font-semibold">Aktivt utan slutdatum</span>
          </div>
        )}
      </div>
    </motion.section>
  );
}

/* ---------- helpers ---------- */

function getTimeRemaining(premiumUntil?: Date | null) {
  if (!premiumUntil) return null;
  const now = new Date();
  const expiry = new Date(premiumUntil);
  const diffMs = expiry.getTime() - now.getTime();
  if (diffMs <= 0) return { expired: true, days: 0, hours: 0, minutes: 0 };
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return { expired: false, days, hours, minutes };
}

// Re-export så page.tsx kan använda samma helper
export { getTimeRemaining };
