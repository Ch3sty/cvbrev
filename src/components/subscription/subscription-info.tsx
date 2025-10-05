// src/components/subscription/subscription-info.tsx
// KORRIGERAD: Hämtar weeklyLetterCount/Limit och visar "X / Y" korrekt.

'use client';

import React from 'react';
import { useProfile } from '@/hooks/use-profile';
import {
  Crown,
  CheckCircle,
  FileText,
  MessageSquare,
  Sparkles,
  Lock,
  Infinity as InfinityIcon,
  Info,
  SearchCheck // Importera SearchCheck för CV-analys
} from 'lucide-react';

export default function SubscriptionInfo() {
  // Hämta nödvändig data, INKLUSIVE weeklyLetterCount och weeklyLetterLimit
  const {
    subscriptionTier,
    weeklyLetterCount,    // <--- HÄMTA DENNA
    weeklyLetterLimit,    // <--- OCH DENNA
    cvCount,
    maxCvCount,           // Kan också hämtas direkt
    savedLettersCount,
    maxSavedLetters,      // Kan också hämtas direkt
    // CV-analys värden
    remainingWeeklyAnalyses,
    weeklyAnalysisLimit,
    // subscriptionLimits, // Kan tas bort om vi använder direkta props
    loading: profileLoading // För att visa laddningsstatus
  } = useProfile();

  // Använd de direkta propsen från useProfile för gränser
  // Fallback till 0 eller Infinity om de inte är definierade än (under laddning)
  const currentWeeklyLimit = !isFinite(weeklyLetterLimit) ? Infinity : weeklyLetterLimit ?? 0;
  const currentCvLimit = !isFinite(maxCvCount) ? Infinity : maxCvCount ?? 0;
  const currentSavedLettersLimit = !isFinite(maxSavedLetters) ? Infinity : maxSavedLetters ?? 0;
  const currentAnalysisLimit = !isFinite(weeklyAnalysisLimit) ? Infinity : weeklyAnalysisLimit ?? 0;


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

        {/* Veckolimit för brev */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
          <div className="flex items-center text-sm">
            <MessageSquare className="w-4 h-4 mr-3 text-pink-600 flex-shrink-0" />
            <span className="text-gray-700 font-medium">Brev per vecka</span>
          </div>
          <div className="text-sm font-semibold">
            {subscriptionTier === 'premium' || !isFinite(currentWeeklyLimit) ? (
              <div className="text-gray-900 flex items-center">
                <InfinityIcon className="w-4 h-4 mr-1 text-pink-600" />
                <span>Obegränsat</span>
              </div>
            ) : (
              <div className="text-gray-900">
                <span className={(weeklyLetterCount ?? 0) >= currentWeeklyLimit ? 'text-red-600 font-bold' : ''}>
                  {weeklyLetterCount ?? 0}
                </span> / {currentWeeklyLimit}
              </div>
            )}
          </div>
        </div>

        {/* CV-analyser per vecka */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
          <div className="flex items-center text-sm">
            <SearchCheck className="w-4 h-4 mr-3 text-purple-600 flex-shrink-0" />
            <span className="text-gray-700 font-medium">CV-analyser per vecka</span>
          </div>
          <div className="text-sm font-semibold">
            {subscriptionTier === 'premium' || !isFinite(currentAnalysisLimit) ? (
              <div className="text-gray-900 flex items-center">
                <InfinityIcon className="w-4 h-4 mr-1 text-purple-600" />
                <span>Obegränsat</span>
              </div>
            ) : (
              <div className="text-gray-900">
                <span className={(currentAnalysisLimit - (remainingWeeklyAnalyses ?? 0) >= currentAnalysisLimit) ? 'text-red-600 font-bold' : ''}>
                  {currentAnalysisLimit - (remainingWeeklyAnalyses ?? 0)}
                </span> / {currentAnalysisLimit}
              </div>
            )}
          </div>
        </div>

        {/* Sparade brev */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
          <div className="flex items-center text-sm">
            <FileText className="w-4 h-4 mr-3 text-blue-600 flex-shrink-0" />
            <span className="text-gray-700 font-medium">Sparade personliga brev</span>
          </div>
          <div className="text-sm font-semibold">
            {subscriptionTier === 'premium' || !isFinite(currentSavedLettersLimit) ? (
              <div className="text-gray-900 flex items-center">
                <InfinityIcon className="w-4 h-4 mr-1 text-blue-600" />
                <span>Obegränsat</span>
              </div>
            ) : (
              <div className="text-gray-900">
                <span className={savedLettersCount >= currentSavedLettersLimit ? 'text-red-600 font-bold' : ''}>
                  {savedLettersCount}
                </span> / {currentSavedLettersLimit}
              </div>
            )}
          </div>
        </div>

        {/* CV-gräns */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
          <div className="flex items-center text-sm">
            <FileText className="w-4 h-4 mr-3 text-green-600 flex-shrink-0" />
            <span className="text-gray-700 font-medium">Sparade CV:n</span>
          </div>
          <div className="text-sm font-semibold">
             {subscriptionTier === 'premium' || !isFinite(currentCvLimit) ? (
              <div className="text-gray-900 flex items-center">
                <InfinityIcon className="w-4 h-4 mr-1 text-green-600" />
                <span>Obegränsat</span>
              </div>
            ) : (
              <div className="text-gray-900">
                <span className={cvCount >= currentCvLimit ? 'text-red-600 font-bold' : ''}>
                  {cvCount}
                </span> / {currentCvLimit}
              </div>
            )}
          </div>
        </div>

        {/* AI-tonalitet */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
          <div className="flex items-center text-sm">
            <Sparkles className="w-4 h-4 mr-3 text-amber-600 flex-shrink-0" />
            <span className="text-gray-700 font-medium">Smarta tonalitetsval</span>
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