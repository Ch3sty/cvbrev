'use client';

import React from 'react';
import { useProfile } from '@/hooks/use-profile';
import { motion } from 'framer-motion';
import SubscriptionInfo from '@/components/subscription/subscription-info';
import { SubscribeButton } from '@/components/subscription/SubscribeButton';
import { ManageSubscriptionButton } from '@/components/subscription/ManageSubscriptionButton';
import { Crown, CheckCircle, Clock, Gift, Shield, Calendar, Zap, Info } from 'lucide-react';

export default function PrenumerationPage() {
  const {
    subscriptionTier,
    loading: profileLoading,
    premiumUntil,
    premiumSource,
    isTrialUser,
    isAdminGranted
  } = useProfile();

  // *** STRIPE PRICE ID (Månad) ***
  const premiumMonthlyPriceId = "price_1R7eyuAB6xHzwmWvtzFJdaOU";
  // ******************************

  // Helper function to calculate time remaining
  const getTimeRemaining = () => {
    if (!premiumUntil) return null;

    const now = new Date();
    const expiry = new Date(premiumUntil);
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) return { expired: true, days: 0, hours: 0, minutes: 0 };

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return { expired: false, days, hours, minutes };
  };

  const timeRemaining = getTimeRemaining();

  // Determine subscription UI type
  const isStripePremium = subscriptionTier === 'premium' && !isTrialUser && !isAdminGranted;
  const isOnboardingReward = premiumSource === 'onboarding_completion';

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 sm:mb-6 md:mb-8"
      >
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="p-3 sm:p-4 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0">
            <Crown className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent truncate">
              Prenumeration
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1 font-medium">Hantera din prenumeration och betalning</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4 sm:space-y-6">
        {/* Loading state */}
        {profileLoading ? (
          <div className="flex justify-center items-center p-4 sm:p-6 md:p-8 bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-gray-200/50">
            <motion.div
              className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-pink-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : subscriptionTier === 'free' ? (
          // GRATIS-ANVÄNDARE: Side-by-side layout
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Vänster kolumn: Prenumerationsstatus */}
            <div>
              <SubscriptionInfo />
            </div>

            {/* Höger kolumn: Uppgradera till Premium */}
            <div className="h-fit">
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-pink-500/30 shadow-2xl"
            >
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-pink-600 to-purple-600 rounded-lg sm:rounded-xl mr-2 sm:mr-3 flex-shrink-0">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">Uppgradera till Premium</h3>
            </div>

            {/* Kompakt lista med alla premium-funktioner */}
            <div className="space-y-2 sm:space-y-2.5 mb-4 sm:mb-6">
              {/* Obegränsat användande */}
              <div className="flex items-start gap-2 sm:gap-2.5">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700"><strong>Obegränsade personliga brev</strong></span>
              </div>
              <div className="flex items-start gap-2 sm:gap-2.5">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700"><strong>Obegränsade CV-analyser</strong></span>
              </div>
              <div className="flex items-start gap-2 sm:gap-2.5">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700"><strong>50 uppladdade CV</strong></span>
              </div>
              <div className="flex items-start gap-2 sm:gap-2.5">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700"><strong>Obegränsade sparade brev</strong></span>
              </div>

              {/* Separator */}
              <div className="h-2 sm:h-3"></div>

              {/* Premium CV-mallar */}
              <div className="flex items-start gap-2 sm:gap-2.5">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700"><strong>8 Premium CV-mallar</strong></span>
              </div>

              {/* Avancerade tester */}
              <div className="flex items-start gap-2 sm:gap-2.5">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700"><strong>3 Avancerade kognitiva tester</strong></span>
              </div>

              {/* Separator */}
              <div className="h-2 sm:h-3"></div>

              {/* Smarta funktioner */}
              <div className="flex items-start gap-2 sm:gap-2.5">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700"><strong>Automatisk tonalitetsanpassning</strong> (5+1 val)</span>
              </div>
              <div className="flex items-start gap-2 sm:gap-2.5">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700"><strong>Obegränsad lagring</strong> av brev och analyser</span>
              </div>
            </div>
            <SubscribeButton
              priceId={premiumMonthlyPriceId}
              planName="Premium Månad"
              className="w-full touch-manipulation"
            />
            <p className="text-center text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4">
              149 kr/månad • Ingen bindningstid • Avsluta när du vill
            </p>
              </div>
            </div>
          </div>
        ) : isTrialUser ? (
          // TRIAL-ANVÄNDARE: Prova på med countdown
          <>
            <div>
              <SubscriptionInfo />
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80 rounded-2xl p-6 md:p-8 border border-blue-200/40 shadow-xl shadow-blue-500/10">
              {/* Animated gradient orb background */}
              <motion.div
                className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.15, 0.25, 0.15]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut'
                }}
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Header with gradient icon */}
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mr-3 flex-shrink-0 shadow-lg">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Du testar Premium gratis!
                  </h3>
                </div>

                {/* Countdown with glassmorphism */}
                {timeRemaining && !timeRemaining.expired && (
                  <div className="bg-white/80 backdrop-blur-xl rounded-xl p-5 mb-6 border border-blue-200/30 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Clock className="w-5 h-5 text-blue-600" />
                        </motion.div>
                        <span className="font-semibold text-slate-900">Tid kvar av provperioden</span>
                      </div>
                    </div>
                    <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                      {timeRemaining.days}d {timeRemaining.hours}h
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Går ut: {premiumUntil && new Date(premiumUntil).toLocaleDateString('sv-SE', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Benefits list - clean checkmarks */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700">Tillgång till <strong>alla premium-funktioner</strong> under provperioden</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700">Efter provperioden <strong>återgår du till gratis nivå</strong></span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700"><strong>Inget kreditkort krävs</strong> - ingen automatisk debitering</span>
                  </div>
                </div>

                {/* Source badge - subtle */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50/80 rounded-full border border-blue-200/50 mb-6">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">
                    Aktiverades via: <strong>{premiumSource === 'signup_trial' ? 'Registrering' : 'Google-inloggning'}</strong>
                  </span>
                </div>

                {/* CTA button - consistent with landing page */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-6 h-6 flex-shrink-0" />
                    <h4 className="font-bold text-lg">Fortsätt med Premium utan avbrott</h4>
                  </div>
                  <p className="text-white/90 text-sm mb-4">
                    Uppgradera nu och behåll alla dina premium-funktioner. Ingen bindningstid - avsluta när du vill.
                  </p>
                  <SubscribeButton
                    priceId={premiumMonthlyPriceId}
                    planName="Premium Månad"
                    className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold touch-manipulation"
                  />
                  <p className="text-center text-white/80 text-xs mt-3">
                    149 kr/månad • Ingen bindningstid
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : isOnboardingReward ? (
          // ONBOARDING REWARD: 1-dagars belöning från introduktionen
          <>
            <div>
              <SubscriptionInfo />
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-green-50/80 via-emerald-50/60 to-teal-50/80 rounded-2xl p-6 md:p-8 border border-green-200/40 shadow-xl shadow-green-500/10">
              {/* Animated gradient orb background */}
              <motion.div
                className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-green-400/20 to-teal-400/20 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.15, 0.25, 0.15]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut'
                }}
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Header with gradient icon */}
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mr-3 flex-shrink-0 shadow-lg">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Grattis! Din introduktionsbelöning är aktiv
                  </h3>
                </div>

                {/* Countdown with glassmorphism */}
                {timeRemaining && !timeRemaining.expired && (
                  <div className="bg-white/80 backdrop-blur-xl rounded-xl p-5 mb-6 border border-green-200/30 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Clock className="w-5 h-5 text-green-600" />
                        </motion.div>
                        <span className="font-semibold text-slate-900">Tid kvar av din belöning</span>
                      </div>
                    </div>
                    <div className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                      {timeRemaining.days > 0 ? `${timeRemaining.days}d ` : ''}{timeRemaining.hours}h {timeRemaining.minutes}m
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Går ut: {premiumUntil && new Date(premiumUntil).toLocaleDateString('sv-SE', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Benefits list - clean checkmarks */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700">Tillgång till <strong>alla premium-funktioner</strong> under belöningsperioden</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700">Efter belöningsperioden <strong>återgår du till gratis nivå</strong></span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700"><strong>Inget kreditkort krävs</strong> - ingen automatisk debitering</span>
                  </div>
                </div>

                {/* Source badge - subtle */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50/80 rounded-full border border-green-200/50 mb-6">
                  <Info className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700">
                    Aktiverades via: <strong>Slutförd introduktion (6/6 steg)</strong>
                  </span>
                </div>

                {/* CTA button - consistent with landing page */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-6 h-6 flex-shrink-0" />
                    <h4 className="font-bold text-lg">Fortsätt med Premium utan avbrott</h4>
                  </div>
                  <p className="text-white/90 text-sm mb-4">
                    Uppgradera nu och behåll alla dina premium-funktioner. Ingen bindningstid - avsluta när du vill.
                  </p>
                  <SubscribeButton
                    priceId={premiumMonthlyPriceId}
                    planName="Premium Månad"
                    className="w-full bg-white text-green-600 hover:bg-green-50 font-bold touch-manipulation"
                  />
                  <p className="text-center text-white/80 text-xs mt-3">
                    149 kr/månad • Ingen bindningstid
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : isAdminGranted ? (
          // ADMIN-GRANTED PREMIUM: Utan slutdatum
          <>
            <div>
              <SubscriptionInfo />
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-blue-500/30 shadow-2xl">
              <div className="flex items-center mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg sm:rounded-xl mr-2 sm:mr-3 flex-shrink-0">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Du har Premium via admin</h3>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700"><strong>Aktivt utan slutdatum</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Din premium-åtkomst har beviljats av en administratör</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700 mb-2">
                      Kontakta support om du har frågor om din premium-åtkomst.
                    </p>
                    <a
                      href="mailto:support@jobbcoach.ai"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
                    >
                      support@jobbcoach.ai
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : isStripePremium ? (
          // STRIPE-KÖPT PREMIUM: Original design
          <>
            <div>
              <SubscriptionInfo />
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-yellow-500/30 shadow-2xl">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg sm:rounded-xl mr-2 sm:mr-3 flex-shrink-0">
                  <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Hantera din Premium-prenumeration</h3>
              </div>
              <p className="text-xs sm:text-sm md:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed">
                Via Stripes kundportal kan du se dina fakturor, uppdatera din betalningsmetod eller avsluta din prenumeration.
              </p>
              <ManageSubscriptionButton className="w-full touch-manipulation" />
            </div>
          </>
        ) : (
          // Fallback om status är okänd
          <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-200/50">
            <p className="text-xs sm:text-sm text-gray-600 text-center">Kunde inte ladda prenumerationsstatus.</p>
          </div>
        )}
      </div>
    </div>
  );
}
