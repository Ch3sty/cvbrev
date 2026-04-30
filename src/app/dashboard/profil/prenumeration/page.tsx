'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useProfile } from '@/hooks/use-profile';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';

import PrenumerationHero from './components/PrenumerationHero';
import PricingCard from './components/PricingCard';
import PremiumFeaturesGrid from './components/PremiumFeaturesGrid';
import UsageStats from './components/UsageStats';
import ManageSubscriptionCard from './components/ManageSubscriptionCard';
import AdminGrantedCard from './components/AdminGrantedCard';
import TrialCTACard from './components/TrialCTACard';
import PrenumerationFAQ from './components/PrenumerationFAQ';
import { PremiumCTAButton } from './components/PremiumCTAButton';

const PREMIUM_MONTHLY_PRICE_ID = 'price_1SQSVlPWMWdjmTDjx1yo9m00';
const PRICING_ANCHOR_ID = 'pricing';

export default function PrenumerationPage() {
  const {
    subscriptionTier,
    loading: profileLoading,
    premiumUntil,
    premiumSource,
    isTrialUser,
    isAdminGranted,
    weeklyLetterCount,
    cvCount,
    savedLettersCount,
  } = useProfile();

  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      setErrorMessage(decodeURIComponent(error));
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.pathname);
    }
  }, [searchParams]);

  const isPremium = subscriptionTier === 'premium';
  const isOnboardingReward = premiumSource === 'onboarding_completion';
  const isGuestInvitation = premiumSource === 'guest_invitation';
  const isTemporaryPremium = isTrialUser || isOnboardingReward || isGuestInvitation;
  const isPaidPremium = isPremium && !isTemporaryPremium && !isAdminGranted;

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (profileLoading) {
    return (
      <div className="container mx-auto py-6 px-3 sm:px-4 max-w-6xl">
        <div className="flex justify-center items-center p-8 bg-white rounded-3xl border border-orange-100">
          <motion.div
            className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-6xl">
      <div className="space-y-5 sm:space-y-6 lg:space-y-7">
        {/* Felmeddelande */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3"
          >
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">{errorMessage}</p>
              <p className="text-xs text-red-600 mt-1">
                Kontakta support@jobbcoach.ai om problemet kvarstår.
              </p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-red-600 transition-colors"
              aria-label="Stäng meddelande"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Hero */}
        <PrenumerationHero
          isPremium={isPremium}
          isTrialUser={isTrialUser}
          isAdminGranted={isAdminGranted}
          isOnboardingReward={isOnboardingReward}
          isGuestInvitation={isGuestInvitation}
          premiumUntil={premiumUntil}
          onScrollToPricing={scrollToPricing}
        />

        {/* Premium-läge */}
        {isPremium && (
          <>
            <UsageStats
              cvCount={cvCount}
              weeklyLetterCount={weeklyLetterCount}
              savedLettersCount={savedLettersCount}
            />

            {/* Trial/reward/guest — uppmuntra till uppgradering */}
            {isTemporaryPremium && (
              <TrialCTACard priceId={PREMIUM_MONTHLY_PRICE_ID} />
            )}

            <PremiumFeaturesGrid isPremium={true} />

            {/* Hantera prenumeration — endast för betalande */}
            {isPaidPremium && <ManageSubscriptionCard />}

            {/* Admin-granted info */}
            {isAdminGranted && <AdminGrantedCard />}
          </>
        )}

        {/* Free-läge — full konverteringssida */}
        {!isPremium && (
          <>
            <div ref={pricingRef}>
              <PricingCard
                priceId={PREMIUM_MONTHLY_PRICE_ID}
                scrollAnchorId={PRICING_ANCHOR_ID}
              />
            </div>

            <PremiumFeaturesGrid isPremium={false} />

            <PrenumerationFAQ />

            {/* Sista konverterings-belt */}
            <FinalCTA priceId={PREMIUM_MONTHLY_PRICE_ID} />
          </>
        )}
      </div>
    </div>
  );
}

/* --------- final CTA-belt för free-läge --------- */

function FinalCTA({ priceId }: { priceId: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl text-white"
      style={{
        background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        boxShadow: '0 20px 50px -16px rgba(220, 38, 38, 0.5)',
      }}
    >
      <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" aria-hidden="true">
        <pattern id="final-cta-dots" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="11" cy="11" r="0.8" fill="white" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#final-cta-dots)" />
      </svg>

      <div className="relative p-6 sm:p-8 md:p-10 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Redo att börja?
        </h2>
        <p className="text-sm sm:text-base opacity-95 mb-6 max-w-md mx-auto">
          7 dagar gratis. Ingen bindningstid. Avsluta när du vill.
        </p>

        <div className="max-w-sm mx-auto">
          <PremiumCTAButton
            priceId={priceId}
            apiEndpoint="/api/stripe/create-trial-upgrade-session"
            buttonText="Prova gratis i 7 dagar"
            variant="inverse"
          />
        </div>
      </div>
    </motion.section>
  );
}
