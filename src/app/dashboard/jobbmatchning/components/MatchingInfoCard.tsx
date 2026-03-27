'use client';

import { motion } from 'framer-motion';
import { Sparkles, Target, Zap, TrendingUp, Info } from 'lucide-react';

export default function MatchingInfoCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 shadow-sm hover:shadow-md transition-all"
    >
      {/* Badge */}
      <div className="absolute top-4 right-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
          <Info className="w-4 h-4" />
          Information
        </div>
      </div>

      {/* Header */}
      <div className="mb-4 pr-24">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Smart Jobbmatchning
          </h3>
        </div>
        <p className="text-sm text-gray-700 font-medium">
          Vi jämför din profil mot varje jobb och visar hur väl du matchar
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Value Proposition */}
        <div className="p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-indigo-100">
          <p className="text-sm text-gray-700 leading-relaxed">
            Vår intelligenta matchningsalgoritm analyserar ditt CV och söker inte bara efter din senaste
            yrkestitel – den identifierar även <span className="font-semibold text-indigo-600">närliggande roller</span>,
            <span className="font-semibold text-purple-600"> branschövergångar</span> och
            <span className="font-semibold text-pink-600"> dolda möjligheter</span> som du annars skulle missa.
          </p>
        </div>

        {/* Key Benefits */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-start gap-3 p-3 bg-white/40 backdrop-blur-sm rounded-lg">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shrink-0">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Hierar​kisk Matchning</h4>
              <p className="text-xs text-gray-600">
                Matchar exakt titel, yrkesgrupp och yrkesområde – hittar både specifika och bredare roller
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/40 backdrop-blur-sm rounded-lg">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Kompetensbaserad Analys</h4>
              <p className="text-xs text-gray-600">
                Identifierar dina överförbara färdigheter och matchar mot kravprofiler
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/40 backdrop-blur-sm rounded-lg">
            <div className="p-2 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shrink-0">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Geografisk Intelligens</h4>
              <p className="text-xs text-gray-600">
                Prioriterar jobb i din närhet och identifierar distansarbeten automatiskt
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-4 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white">
          <p className="text-sm font-medium text-center">
            ✨ Aktivera ett CV för att börja upptäcka din nästa karriärmöjlighet
          </p>
        </div>
      </div>
    </motion.div>
  );
}
