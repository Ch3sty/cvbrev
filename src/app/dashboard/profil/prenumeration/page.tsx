'use client';

import React from 'react';
import { useProfile } from '@/hooks/use-profile';
import { motion } from 'framer-motion';
import SubscriptionInfo from '@/components/subscription/subscription-info';
import { SubscribeButton } from '@/components/subscription/SubscribeButton';
import { ManageSubscriptionButton } from '@/components/subscription/ManageSubscriptionButton';
import { Crown } from 'lucide-react';

export default function PrenumerationPage() {
  const { subscriptionTier, loading: profileLoading } = useProfile();

  // *** STRIPE PRICE ID (Månad) ***
  const premiumMonthlyPriceId = "price_1R7eyuAB6xHzwmWvtzFJdaOU";
  // ******************************

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl shadow-lg">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
              Prenumeration
            </h1>
            <p className="text-slate-600 mt-1 font-medium">Hantera din prenumeration och betalning</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* 1. Visa aktuell prenumerationsinformation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SubscriptionInfo />
        </motion.div>

        {/* 2. Visa knapp för att uppgradera ELLER hantera prenumeration */}
        {profileLoading ? (
          <div className="flex justify-center items-center p-8 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50">
            <motion.div
              className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : subscriptionTier === 'free' ? (
          // ANVÄNDAREN HAR GRATISPLAN
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8 border-2 border-pink-500/30 shadow-2xl"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl mr-3">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Uppgradera till Premium</h3>
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Lås upp obegränsad tillgång till brevgenerering, sparade brev, CV-uppladdningar, CV-analyser och smarta tonalitetsval för att maximera dina jobbchanser.
            </p>
            <SubscribeButton
              priceId={premiumMonthlyPriceId}
              planName="Premium Månad"
              className="w-full"
            />
            <p className="text-center text-sm text-gray-600 mt-4">
              149 kr/månad • Ingen bindningstid • Avsluta när du vill
            </p>
          </motion.div>
        ) : subscriptionTier === 'premium' ? (
          // ANVÄNDAREN HAR PREMIUM
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-8 border-2 border-yellow-500/30 shadow-2xl"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl mr-3">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Hantera din Premium-prenumeration</h3>
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Via Stripes kundportal kan du se dina fakturor, uppdatera din betalningsmetod eller avsluta din prenumeration.
            </p>
            <ManageSubscriptionButton className="w-full" />
          </motion.div>
        ) : (
          // Fallback om status är okänd
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50">
            <p className="text-gray-600 text-center">Kunde inte ladda prenumerationsstatus.</p>
          </div>
        )}
      </div>
    </div>
  );
}
