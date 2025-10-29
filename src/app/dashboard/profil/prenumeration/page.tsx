'use client';

import React from 'react';
import { useProfile } from '@/hooks/use-profile';
import { motion } from 'framer-motion';
import SubscriptionInfo from '@/components/subscription/subscription-info';
import { SubscribeButton } from '@/components/subscription/SubscribeButton';
import { ManageSubscriptionButton } from '@/components/subscription/ManageSubscriptionButton';
import { Crown, CheckCircle } from 'lucide-react';

export default function PrenumerationPage() {
  const { subscriptionTier, loading: profileLoading } = useProfile();

  // *** STRIPE PRICE ID (Månad) ***
  const premiumMonthlyPriceId = "price_1R7eyuAB6xHzwmWvtzFJdaOU";
  // ******************************

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
        ) : subscriptionTier === 'premium' ? (
          // PREMIUM-ANVÄNDARE: Vertikal layout (behåller original)
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
