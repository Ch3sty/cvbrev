'use client';

import React from 'react';
import { useProfile } from '@/hooks/use-profile';
import { motion } from 'framer-motion';
import SubscriptionInfo from '@/components/subscription/subscription-info';
import { SubscribeButton } from '@/components/subscription/SubscribeButton';
import { ManageSubscriptionButton } from '@/components/subscription/ManageSubscriptionButton';
import { Crown, PenTool, Search, GraduationCap, FileText, Brain, Palette, Lightbulb, Save } from 'lucide-react';

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
            <div className="space-y-6 mb-6">
              {/* Sektion 1: Obegränsat användande */}
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-3">
                  Obegränsat användande:
                </h4>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <PenTool className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Obegränsade personliga brev</strong> – Ansök till alla jobb du vill (gratis: 7/vecka)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Search className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Obegränsade CV-analyser</strong> – Få AI-feedback när du behöver (gratis: 1/vecka)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <GraduationCap className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Obegränsad kompetensutveckling</strong> – Personliga lärandevägar (gratis: 1/vecka)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span><strong>50 uppladdade CV</strong> – Hantera alla dina CV-versioner (gratis: 2st)</span>
                  </li>
                </ul>
              </div>

              {/* Sektion 2: Premium CV-mallar */}
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-3">
                  Premium CV-mallar (8st totalt):
                </h4>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <Palette className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span><strong>6 exklusiva premium-mallar:</strong> Clean Corporate, Creative Edge, Executive Premium, Nordic Professional, Platinum Executive, Creative Minimal</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Palette className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                    <span>2 gratis-mallar: Modern Minimal, Classic Professional</span>
                  </li>
                </ul>
              </div>

              {/* Sektion 3: Avancerade kognitiva tester */}
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-3">
                  Avancerade kognitiva tester:
                </h4>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Matrislogik Avancerad</strong> – Nivå 2-3 med komplexa mönster</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Verbalt Resonemang v2</strong> – Kritisk läsning, nivå 1-3</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Numeriskt Test v2</strong> – Grafanalys med diagram</span>
                  </li>
                </ul>
              </div>

              {/* Sektion 4: Smarta funktioner */}
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-3">
                  Smarta funktioner:
                </h4>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Automatisk tonalitetsanpassning</strong> – 5+1 tonaliteter (inkl. Auto)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Obegränsad lagring</strong> – Spara alla brev och analyser</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Save className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Professionell export</strong> – Word & PDF-format</span>
                  </li>
                </ul>
              </div>
            </div>
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
