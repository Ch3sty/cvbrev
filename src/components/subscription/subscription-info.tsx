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
  Info
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
    // subscriptionLimits, // Kan tas bort om vi använder direkta props
    loading: profileLoading // För att visa laddningsstatus
  } = useProfile();

  // Använd de direkta propsen från useProfile för gränser
  // Fallback till 0 eller Infinity om de inte är definierade än (under laddning)
  const currentWeeklyLimit = !isFinite(weeklyLetterLimit) ? Infinity : weeklyLetterLimit ?? 0;
  const currentCvLimit = !isFinite(maxCvCount) ? Infinity : maxCvCount ?? 0;
  const currentSavedLettersLimit = !isFinite(maxSavedLetters) ? Infinity : maxSavedLetters ?? 0;


  // Visa laddningsindikator om profildata fortfarande hämtas
  if (profileLoading) {
    return (
       <div className="bg-navy-800 rounded-lg p-6 shadow-lg border border-gray-700/50 animate-pulse">
         {/* ... laddnings-JSX ... */}
          <div className="h-6 bg-gray-700 rounded w-3/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-4/5"></div>
          </div>
       </div>
    );
  }

  return (
    <div className="bg-navy-800 rounded-lg p-6 shadow-lg border border-gray-700/50">
      {/* Titel och status */}
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Crown className={`w-5 h-5 mr-2 ${subscriptionTier === 'premium' ? 'text-yellow-400' : 'text-gray-500'}`} />
          Din prenumerationsstatus
        </h2>
        <div className={`
          px-3 py-1 rounded-full text-xs font-semibold
          ${subscriptionTier === 'premium'
            ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 shadow-md'
            : 'bg-gray-700 text-gray-300'}
        `}>
          {subscriptionTier === 'premium' ? 'Premium' : 'Gratis'}
        </div>
      </div>

      {/* Begränsningar och användning */}
      <h3 className="text-md font-semibold text-gray-200 mb-4">Användning och gränser:</h3>
      <div className="space-y-1">

        {/* Veckolimit för brev */}
        <div className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-b-0">
          <div className="flex items-center text-sm">
            <MessageSquare className="w-4 h-4 mr-2 text-pink-400 flex-shrink-0" />
            <span className="text-gray-300">Brev per vecka</span>
          </div>
          <div className="text-sm font-medium">
            {/* Använder currentWeeklyLimit som nu är hämtad från useProfile */}
            {subscriptionTier === 'premium' || !isFinite(currentWeeklyLimit) ? (
              <div className="text-white flex items-center">
                <InfinityIcon className="w-4 h-4 mr-1 text-pink-400" />
                <span>Obegränsat</span>
              </div>
            ) : (
              // *** KORRIGERAD VISNING FÖR GRATIS ***
              <div className="text-white">
                <span className={(weeklyLetterCount ?? 0) >= currentWeeklyLimit ? 'text-red-400 font-semibold' : ''}>
                  {weeklyLetterCount ?? 0} {/* Visa X (aktuellt antal) */}
                </span> / {currentWeeklyLimit} {/* Visa Y (gränsen) */}
              </div>
              // *************************************
            )}
          </div>
        </div>

        {/* Sparade brev */}
        <div className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-b-0">
          <div className="flex items-center text-sm">
            <FileText className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0" />
            <span className="text-gray-300">Sparade personliga brev</span>
          </div>
          <div className="text-sm font-medium">
            {subscriptionTier === 'premium' || !isFinite(currentSavedLettersLimit) ? (
              <div className="text-white flex items-center">
                <InfinityIcon className="w-4 h-4 mr-1 text-blue-400" />
                <span>Obegränsat</span>
              </div>
            ) : (
              <div className="text-white">
                <span className={savedLettersCount >= currentSavedLettersLimit ? 'text-red-400 font-semibold' : ''}>
                  {savedLettersCount}
                </span> / {currentSavedLettersLimit}
              </div>
            )}
          </div>
        </div>

        {/* CV-gräns */}
        <div className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-b-0">
          <div className="flex items-center text-sm">
            <FileText className="w-4 h-4 mr-2 text-green-400 flex-shrink-0" />
            <span className="text-gray-300">Sparade CV:n</span>
          </div>
          <div className="text-sm font-medium">
             {subscriptionTier === 'premium' || !isFinite(currentCvLimit) ? (
              <div className="text-white flex items-center">
                <InfinityIcon className="w-4 h-4 mr-1 text-green-400" />
                <span>Obegränsat</span>
              </div>
            ) : (
              <div className="text-white">
                <span className={cvCount >= currentCvLimit ? 'text-red-400 font-semibold' : ''}>
                  {cvCount}
                </span> / {currentCvLimit}
              </div>
            )}
          </div>
        </div>

        {/* AI-tonalitet */}
        <div className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-b-0">
          <div className="flex items-center text-sm">
            <Sparkles className="w-4 h-4 mr-2 text-purple-400 flex-shrink-0" />
            <span className="text-gray-300">AI-optimerad tonalitet</span>
          </div>
          <div className="flex items-center">
            {subscriptionTier === 'premium' ? (
               <div className="flex items-center text-sm text-green-400">
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

       {/* Info-rutor (behålls) */}
       {subscriptionTier === 'premium' && (
         <div className="mt-6 p-3 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-lg border border-yellow-500/30">
            {/* ... premium info ... */}
            <div className="flex items-start">
                <Info className="w-4 h-4 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-200">
                    Som Premium-medlem har du tillgång till alla funktioner och obegränsad användning.
                </p>
            </div>
         </div>
       )}
       {subscriptionTier === 'free' && (
         <div className="mt-6 p-3 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/30">
            {/* ... gratis info ... */}
             <div className="flex items-start">
                <Info className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-200">
                    Du använder Gratis-planen. Uppgradera till Premium för att låsa upp alla funktioner och ta bort gränserna.
                </p>
            </div>
         </div>
       )}

    </div>
  );
}