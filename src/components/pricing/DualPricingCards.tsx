'use client'

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Check, Sparkles, Zap, TrendingUp, Star, Crown,
  FileText, Target, Users, Award, Infinity
} from 'lucide-react';

interface DualPricingCardsProps {
  showPricing?: boolean; // Om månadspriset ska visas
}

const DualPricingCards: React.FC<DualPricingCardsProps> = ({ showPricing = true }) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
        {/* Premium Trial Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Premium Badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1.5">
              <Crown className="w-4 h-4" />
              Populärast
            </div>
          </div>

          {/* Card */}
          <div className="relative h-full bg-white rounded-2xl border-2 border-transparent bg-clip-padding shadow-xl hover:shadow-2xl transition-all duration-300">
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 -z-10 blur-sm opacity-50"></div>
            <div className="absolute inset-0 rounded-2xl border-2 border-gradient-to-r from-pink-600 to-purple-600"></div>

            <div className="relative bg-white rounded-2xl p-8">
              {/* Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  7 dagar att testa allt
                </h3>
                <p className="text-gray-600">
                  Prova alla verktyg utan kostnad. Du avgör om du vill fortsätta.
                </p>
              </div>

              {/* Pricing */}
              {showPricing && (
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                      149 kr
                    </span>
                    <span className="text-gray-600">/månad</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">efter provperioden</p>
                </div>
              )}

              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full">
                    <Check className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-gray-700 flex-1">Obegränsad tillgång till alla funktioner</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full">
                    <Check className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-gray-700 flex-1">Skapa personliga brev för varje ansökan</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full">
                    <Check className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-gray-700 flex-1">Få detaljerad CV-feedback när du behöver</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full">
                    <Check className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-gray-700 flex-1">Använd alla CV-mallar och LinkedIn-verktyg</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full">
                    <Check className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-gray-700 flex-1">Tillgång till alla 6 rekryteringstester</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full">
                    <Check className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-gray-700 flex-1">Helt obegränsad jobbmatchning</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full">
                    <Check className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-gray-700 flex-1">Avsluta direkt i appen – inga krångel</span>
                </div>
              </div>

              {/* CTA */}
              <Link
                href="/trial-signup"
                className="block w-full py-4 px-6 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-xl text-center hover:from-pink-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Prova gratis i 7 dagar
              </Link>

              {/* Disclaimer */}
              <p className="text-xs text-gray-500 text-center mt-4">
                Betalkort krävs, men du debiteras först efter 7 dagar om du väljer att fortsätta.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Free Tier Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="h-full"
        >
          <div className="h-full bg-white rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 p-8 mt-8 md:mt-0">
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Alltid gratis att testa
              </h3>
              <p className="text-gray-600">
                Börja skapa bättre ansökningar direkt, inget betalkort behövs.
              </p>
            </div>

            {/* Pricing */}
            {showPricing && (
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">
                    0 kr
                  </span>
                  <span className="text-gray-600">/månad</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">alltid gratis</p>
              </div>
            )}

            {/* Features */}
            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1 bg-gray-100 rounded-full">
                  <Check className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-gray-700 flex-1">
                  <strong>7 personliga brev</strong> varje vecka – anpassade till varje jobb
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1 bg-gray-100 rounded-full">
                  <Check className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-gray-700 flex-1">
                  <strong>1 CV-analys</strong> per vecka med konkreta tips
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1 bg-gray-100 rounded-full">
                  <Check className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-gray-700 flex-1">
                  <strong>2 uppladdade CV:n</strong> att arbeta med
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1 bg-gray-100 rounded-full">
                  <Check className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-gray-700 flex-1">
                  <strong>1 LinkedIn-optimering</strong> per månad
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1 bg-gray-100 rounded-full">
                  <Check className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-gray-700 flex-1">
                  <strong>3 rekryteringstester</strong> att prova
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1 bg-gray-100 rounded-full">
                  <Check className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-gray-700 flex-1">
                  <strong>Begränsad jobbmatchning</strong>
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1 bg-gray-100 rounded-full">
                  <Check className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-gray-700 flex-1">
                  <strong>2 gratis CV-mallar</strong> att ladda ner
                </span>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/register"
              className="block w-full py-4 px-6 bg-gray-900 text-white font-bold rounded-xl text-center hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Börja utan kostnad
            </Link>

            {/* Extra text */}
            <p className="text-xs text-gray-500 text-center mt-4">
              Perfekt för att komma igång. Uppgradera när du vill öka tempot i jobbsökningen.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DualPricingCards;
