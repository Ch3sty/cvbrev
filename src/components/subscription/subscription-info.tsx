// src/components/subscription/subscription-info.tsx
// KORRIGERAD: Hämtar weeklyLetterCount/Limit och visar "X / Y" korrekt.

'use client';

import React from 'react';
import { useProfile } from '@/hooks/use-profile';
import {
  Crown,
  CheckCircle,
  FileText,
  PenTool,
  Lightbulb,
  Lock,
  Infinity as InfinityIcon,
  Info,
  Search,
  GraduationCap,
  Palette,
  Brain
} from 'lucide-react';

export default function SubscriptionInfo() {
  // Hämta nödvändig data, INKLUSIVE weeklyLetterCount och weeklyLetterLimit
  const {
    subscriptionTier,
    weeklyLetterCount,
    weeklyLetterLimit,
    cvCount,
    maxCvCount,
    savedLettersCount,
    maxSavedLetters,
    remainingWeeklyAnalyses,
    weeklyAnalysisLimit,
    weeklyCompetenceCount,
    weeklyCompetenceLimit,
    loading: profileLoading
  } = useProfile();

  // Använd de direkta propsen från useProfile för gränser
  // Fallback till 0 eller Infinity om de inte är definierade än (under laddning)
  const currentWeeklyLimit = !isFinite(weeklyLetterLimit) ? Infinity : weeklyLetterLimit ?? 0;
  const currentCvLimit = !isFinite(maxCvCount) ? Infinity : maxCvCount ?? 0;
  const currentSavedLettersLimit = !isFinite(maxSavedLetters) ? Infinity : maxSavedLetters ?? 0;
  const currentAnalysisLimit = !isFinite(weeklyAnalysisLimit) ? Infinity : weeklyAnalysisLimit ?? 0;
  const currentCompetenceLimit = !isFinite(weeklyCompetenceLimit) ? Infinity : weeklyCompetenceLimit ?? 0;


  // Visa laddningsindikator om profildata fortfarande hämtas
  if (profileLoading) {
    return (
       <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-gray-200/50 animate-pulse">
          <div className="h-8 bg-gray-200 rounded-xl w-3/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-5 bg-gray-200 rounded-lg w-full"></div>
            <div className="h-5 bg-gray-200 rounded-lg w-5/6"></div>
            <div className="h-5 bg-gray-200 rounded-lg w-full"></div>
            <div className="h-5 bg-gray-200 rounded-lg w-4/5"></div>
          </div>
       </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-gray-200/50">
      {/* Titel och status */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center">
          <div className={`p-3 rounded-xl mr-3 ${
            subscriptionTier === 'premium'
              ? 'bg-gradient-to-br from-yellow-500 to-amber-500'
              : 'bg-gradient-to-br from-gray-400 to-gray-500'
          }`}>
            <Crown className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Din prenumerationsstatus
          </h2>
        </div>
        <div className={`
          px-4 py-2 rounded-xl text-xs font-semibold shadow-sm
          ${subscriptionTier === 'premium'
            ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900'
            : 'bg-gray-100 text-gray-600'}
        `}>
          {subscriptionTier === 'premium' ? 'Premium' : 'Gratis'}
        </div>
      </div>

      {/* Begränsningar och användning */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Användning och gränser:</h3>
      <div className="space-y-1">

        {/* 1. Skapade personliga brev - 7/vecka gratis */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div className="flex items-center text-sm">
            <PenTool className="w-4 h-4 mr-3 text-pink-600 flex-shrink-0" />
            <span className="text-gray-700 font-medium">Skapade personliga brev (per vecka)</span>
          </div>
          <div className="text-sm font-semibold">
            {subscriptionTier === 'premium' ? (
              <div className="text-gray-900 flex items-center">
                <InfinityIcon className="w-4 h-4 mr-1 text-pink-600" />
                <span>Obegränsat</span>
              </div>
            ) : (
              <div className="text-gray-900">
                <span className={(weeklyLetterCount ?? 0) >= 7 ? 'text-red-600 font-bold' : ''}>
                  {weeklyLetterCount ?? 0}
                </span> / 7
              </div>
            )}
          </div>
        </div>

        {/* 2. CV-analyser - 1/vecka gratis */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div className="flex items-center text-sm">
            <Search className="w-4 h-4 mr-3 text-blue-600 flex-shrink-0" />
            <span className="text-gray-700 font-medium">CV-analyser (per vecka)</span>
          </div>
          <div className="text-sm font-semibold">
            {subscriptionTier === 'premium' ? (
              <div className="text-gray-900 flex items-center">
                <InfinityIcon className="w-4 h-4 mr-1 text-blue-600" />
                <span>Obegränsat</span>
              </div>
            ) : (
              <div className="text-gray-900">
                <span className={(1 - (remainingWeeklyAnalyses ?? 1)) >= 1 ? 'text-red-600 font-bold' : ''}>
                  {1 - (remainingWeeklyAnalyses ?? 1)}
                </span> / 1
              </div>
            )}
          </div>
        </div>

        {/* 3. Kompetensutveckling - 1/vecka gratis */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div className="flex items-center text-sm">
            <GraduationCap className="w-4 h-4 mr-3 text-purple-600 flex-shrink-0" />
            <span className="text-gray-700 font-medium">Kompetensutveckling (per vecka)</span>
          </div>
          <div className="text-sm font-semibold">
            {subscriptionTier === 'premium' ? (
              <div className="text-gray-900 flex items-center">
                <InfinityIcon className="w-4 h-4 mr-1 text-purple-600" />
                <span>Obegränsat</span>
              </div>
            ) : (
              <div className="text-gray-900">
                <span className={(weeklyCompetenceCount ?? 0) >= currentCompetenceLimit ? 'text-red-600 font-bold' : ''}>
                  {weeklyCompetenceCount ?? 0}
                </span> / {currentCompetenceLimit}
              </div>
            )}
          </div>
        </div>

        {/* 4. Uppladdade CV - 2 gratis, 50 premium */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div className="flex items-center text-sm">
            <FileText className="w-4 h-4 mr-3 text-indigo-600 flex-shrink-0" />
            <span className="text-gray-700 font-medium">Uppladdade CV</span>
          </div>
          <div className="text-sm font-semibold">
            {subscriptionTier === 'premium' ? (
              <div className="text-gray-900">
                <span className={(cvCount ?? 0) >= 50 ? 'text-red-600 font-bold' : ''}>
                  {cvCount ?? 0}
                </span> / 50
              </div>
            ) : (
              <div className="text-gray-900">
                <span className={(cvCount ?? 0) >= 2 ? 'text-red-600 font-bold' : ''}>
                  {cvCount ?? 0}
                </span> / 2
              </div>
            )}
          </div>
        </div>

        {/* 5. Sparade brev - 2 gratis, obegränsat premium */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div className="flex items-center text-sm">
            <FileText className="w-4 h-4 mr-3 text-emerald-600 flex-shrink-0" />
            <span className="text-gray-700 font-medium">Sparade brev</span>
          </div>
          <div className="text-sm font-semibold">
            {subscriptionTier === 'premium' || maxSavedLetters === Infinity ? (
              <div className="text-gray-900 flex items-center">
                <InfinityIcon className="w-4 h-4 mr-1 text-emerald-600" />
                <span>Obegränsat</span>
              </div>
            ) : (
              <div className="text-gray-900">
                <span className={(savedLettersCount ?? 0) >= 2 ? 'text-red-600 font-bold' : ''}>
                  {savedLettersCount ?? 0}
                </span> / 2
              </div>
            )}
          </div>
        </div>

        {/* 6. Automatisk tonalitetsanpassning */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div className="flex items-center text-sm">
            <Lightbulb className="w-4 h-4 mr-3 text-yellow-600 flex-shrink-0" />
            <span className="text-gray-700 font-medium">Automatisk tonalitetsanpassning</span>
          </div>
          <div className="flex items-center">
            {subscriptionTier === 'premium' ? (
              <div className="flex items-center text-sm text-green-600 font-semibold">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>Tillgänglig</span>
              </div>
            ) : (
              <div className="flex items-center text-sm text-gray-500">
                <Lock className="w-4 h-4 mr-1" />
                <span>Endast Premium</span>
              </div>
            )}
          </div>
        </div>

        {/* 7. Premium CV-mallar - 6st premium + 2 gratis */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div className="flex items-center text-sm">
            <Palette className="w-4 h-4 mr-3 text-amber-600 flex-shrink-0" />
            <span className="text-gray-700 font-medium">Premium CV-mallar</span>
          </div>
          <div className="flex items-center">
            {subscriptionTier === 'premium' ? (
              <div className="flex items-center text-sm text-green-600 font-semibold">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>8 mallar tillgängliga</span>
              </div>
            ) : (
              <div className="flex items-center text-sm text-gray-500">
                <Lock className="w-4 h-4 mr-1" />
                <span>2 gratis, 6 premium</span>
              </div>
            )}
          </div>
        </div>

        {/* 8. Avancerade kognitiva tester - 3st premium */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div className="flex items-center text-sm">
            <Brain className="w-4 h-4 mr-3 text-orange-600 flex-shrink-0" />
            <span className="text-gray-700 font-medium">Avancerade kognitiva tester</span>
          </div>
          <div className="flex items-center">
            {subscriptionTier === 'premium' ? (
              <div className="flex items-center text-sm text-green-600 font-semibold">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>3 avancerade tester</span>
              </div>
            ) : (
              <div className="flex items-center text-sm text-gray-500">
                <Lock className="w-4 h-4 mr-1" />
                <span>Endast Premium</span>
              </div>
            )}
          </div>
        </div>

        {/* 9. Obegränsad tillgång till alla funktioner - Endast Premium */}
        <div className="flex items-center justify-between py-3 border-t border-gray-200 mt-3 pt-3">
          <div className="flex items-center text-sm">
            <Crown className="w-4 h-4 mr-3 text-yellow-600 flex-shrink-0" />
            <span className="text-gray-700 font-medium">Obegränsad tillgång till alla funktioner</span>
          </div>
          <div className="flex items-center">
            {subscriptionTier === 'premium' ? (
              <div className="flex items-center text-sm text-green-600 font-semibold">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>Aktiverad</span>
              </div>
            ) : (
              <div className="flex items-center text-sm text-gray-500">
                <Lock className="w-4 h-4 mr-1" />
                <span>Endast Premium</span>
              </div>
            )}
          </div>
        </div>
      </div>

       {/* Info-rutor */}
       {subscriptionTier === 'premium' && (
         <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="flex items-start">
                <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                  <Info className="w-4 h-4 text-yellow-600" />
                </div>
                <p className="text-sm text-yellow-800">
                    Som Premium-medlem har du tillgång till alla funktioner och obegränsad användning.
                </p>
            </div>
         </div>
       )}
       {subscriptionTier === 'free' && (
         <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
             <div className="flex items-start">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Info className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-sm text-blue-800">
                    Du använder Gratis-planen. Uppgradera till Premium för att låsa upp alla funktioner och ta bort gränserna.
                </p>
            </div>
         </div>
       )}

    </div>
  );
}