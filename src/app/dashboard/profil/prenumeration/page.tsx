'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useProfile } from '@/hooks/use-profile';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';

import PrenumerationHero from './components/PrenumerationHero';
import PremiumFeaturesGrid from './components/PremiumFeaturesGrid';
import UsageStats from './components/UsageStats';
import ManageSubscriptionCard from './components/ManageSubscriptionCard';
import AdminGrantedCard from './components/AdminGrantedCard';
import TrialCTACard from './components/TrialCTACard';
import TidsbegransadPremiumCard from './components/TidsbegransadPremiumCard';
import PlanCards from '@/components/pricing/PlanCards';
import PrenumerationFAQ from './components/PrenumerationFAQ';
import GratisMotPremium from './components/GratisMotPremium';

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
    hasStripeSubscription,
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
  // En riktig Stripe-prenumeration slår alltid ut gratispremie-märkningen.
  // Annars fastnar den som uppgraderat efter onboarding i "temporär premium"
  // och ser varken portal eller uppsägning.
  const isTemporaryPremium =
    !hasStripeSubscription && (isTrialUser || isOnboardingReward || isGuestInvitation);
  const isPaidPremium = hasStripeSubscription || (isPremium && !isTemporaryPremium && !isAdminGranted);

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
            <UsageStats isPremium={isPremium} />

            {/* A8, tillstånd två: tidsbegränsad premium utan prenumeration.
                Dagar kvar, "Förläng" och historik från premium_grants. */}
            {isTemporaryPremium && premiumUntil && (
              <TidsbegransadPremiumCard
                premiumUntil={premiumUntil}
                premiumSource={premiumSource}
              />
            )}
            {/* Kvarvarande fall: temporär premium utan slutdatum (äldre
                belöningar). Den gamla CTA:n duger där. */}
            {isTemporaryPremium && !premiumUntil && (
              <TrialCTACard priceId={PREMIUM_MONTHLY_PRICE_ID} />
            )}

            <PremiumFeaturesGrid isPremium={true} />

            {/* Tidsbegränsad premium: visa vad gratisnivån ger, så det är
                tydligt vad som försvinner när perioden tar slut. */}
            {isTemporaryPremium && <GratisMotPremium />}

            {/* Hantera prenumeration — endast för betalande */}
            {isPaidPremium && <ManageSubscriptionCard />}

            {/* Admin-granted info */}
            {isAdminGranted && <AdminGrantedCard />}
          </>
        )}

        {/* Betalar men saknar premium-tier — visa alltid vägen till uppsägning.
            Utan detta blir den som debiteras men ligger kvar som 'free' helt
            utelåst från Stripe-portalen. */}
        {!isPremium && hasStripeSubscription && <ManageSubscriptionCard />}

        {/* Free-läge — full konverteringssida */}
        {!isPremium && !hasStripeSubscription && (
          <>
            {/* A8, tillstånd tre: kvotöversikt och de fyra produktkorten. */}
            <UsageStats isPremium={isPremium} />

            <div ref={pricingRef} id={PRICING_ANCHOR_ID}>
              <PlanCards className="py-0" />
            </div>

            <GratisMotPremium />

            <PrenumerationFAQ />
          </>
        )}
      </div>
    </div>
  );
}
