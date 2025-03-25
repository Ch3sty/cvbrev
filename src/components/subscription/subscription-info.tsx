'use client';

import React, { useState } from 'react';
import { useProfile } from '@/hooks/use-profile';
import { 
  Crown, 
  CheckCircle, 
  FileText, 
  MessageSquare, 
  Sparkles,
  ChevronRight,
  AlertTriangle,
  Lock,
  Infinity as InfinityIcon
} from 'lucide-react';

export default function SubscriptionInfo() {
  const { 
    subscriptionTier, 
    weeklyLetterCount,
    remainingWeeklyLetters,
    cvCount,
    maxCvCount,
    savedLettersCount,
    maxSavedLetters,
    subscriptionLimits,
    formatLimit,
    isUpgrading,
    upgradeSubscription,
    downgradeSubscription // Bara för testning
  } = useProfile();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Hantera uppgradering
  const handleUpgrade = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // I en riktig implementation skulle detta öppna ett betalningsformulär/modal
      // För nu simulerar vi en enkel uppgradering
      const success = await upgradeSubscription('premium');
      
      if (success) {
        setSuccessMessage('Grattis! Du har nu uppgraderat till Premium!');
        
        // Dölj framgångsmeddelandet efter 5 sekunder
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        setError('Det gick inte att uppgradera. Försök igen senare.');
      }
    } catch (error: any) {
      setError(error.message || 'Ett fel uppstod vid uppgradering');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Bara för testning - i en riktig app skulle detta vara en del av inställningarna
  const handleDowngrade = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      const success = await downgradeSubscription();
      
      if (success) {
        setSuccessMessage('Du har nedgraderat till gratisplanen.');
        
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        setError('Det gick inte att nedgradera. Försök igen senare.');
      }
    } catch (error: any) {
      setError(error.message || 'Ett fel uppstod vid nedgradering');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="bg-navy-800 rounded-lg p-6 shadow-lg">
      {/* Titel och status */}
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Crown className="w-5 h-5 mr-2 text-yellow-400" />
          Din prenumeration
        </h2>
        
        <div className={`
          px-3 py-1 rounded-full text-xs font-semibold
          ${subscriptionTier === 'premium' 
            ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900' 
            : 'bg-gray-700 text-gray-300'}
        `}>
          {subscriptionTier === 'premium' ? 'Premium' : 'Gratis'}
        </div>
      </div>
      
      {/* Felmeddelande */}
      {error && (
        <div className="bg-red-900/30 border-l-4 border-red-500 p-3 rounded-r mb-4 text-sm text-red-200">
          <div className="flex items-start">
            <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {/* Framgångsmeddelande */}
      {successMessage && (
        <div className="bg-green-900/30 border-l-4 border-green-500 p-3 rounded-r mb-4 text-sm text-green-200">
          <div className="flex items-start">
            <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
            <p>{successMessage}</p>
          </div>
        </div>
      )}
      
      {/* Begränsningar och användning */}
      <div className="space-y-4 mb-6">
        {/* Veckolimit för brev */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="w-4 h-4 mr-2 text-pink-400" />
            <span className="text-gray-300">Brevgenerering per vecka</span>
          </div>
          <div className="flex items-center">
            {subscriptionTier === 'premium' ? (
              <div className="text-white flex items-center">
                <InfinityIcon className="w-4 h-4 mr-1 text-pink-400" />
                <span>Obegränsat</span>
              </div>
            ) : (
              <div className="text-white">
                <span className={weeklyLetterCount >= subscriptionLimits.free.weeklyLetterLimit ? 'text-red-400' : ''}>
                  {weeklyLetterCount}
                </span> / {subscriptionLimits.free.weeklyLetterLimit}
              </div>
            )}
          </div>
        </div>
        
        {/* Sparade brev */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="w-4 h-4 mr-2 text-blue-400" />
            <span className="text-gray-300">Sparade brev</span>
          </div>
          <div className="flex items-center">
            {subscriptionTier === 'premium' ? (
              <div className="text-white flex items-center">
                <InfinityIcon className="w-4 h-4 mr-1 text-blue-400" />
                <span>Obegränsat</span>
              </div>
            ) : (
              <div className="text-white">
                <span className={savedLettersCount >= subscriptionLimits.free.maxSavedLetters ? 'text-red-400' : ''}>
                  {savedLettersCount}
                </span> / {subscriptionLimits.free.maxSavedLetters}
              </div>
            )}
          </div>
        </div>
        
        {/* CV-gräns */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="w-4 h-4 mr-2 text-green-400" />
            <span className="text-gray-300">CV-uppladdningar</span>
          </div>
          <div className="flex items-center">
            {subscriptionTier === 'premium' ? (
              <div className="text-white flex items-center">
                <InfinityIcon className="w-4 h-4 mr-1 text-green-400" />
                <span>Obegränsat</span>
              </div>
            ) : (
              <div className="text-white">
                <span className={cvCount >= subscriptionLimits.free.maxCVCount ? 'text-red-400' : ''}>
                  {cvCount}
                </span> / {subscriptionLimits.free.maxCVCount}
              </div>
            )}
          </div>
        </div>
        
        {/* AI-tonalitet */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
            <span className="text-gray-300">AI-optimerad tonalitet</span>
          </div>
          <div className="flex items-center">
            {subscriptionTier === 'premium' ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <Lock className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </div>
      </div>
      
      {/* Uppgraderingsknapp eller Medlemskapsinformation */}
      {subscriptionTier === 'free' ? (
        <div>
          <div className="p-4 bg-gradient-to-r from-navy-700 to-navy-800 rounded-lg mb-4">
            <h3 className="text-lg font-semibold text-white mb-2">Uppgradera till Premium</h3>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-400 mt-1 mr-2 flex-shrink-0" />
                <span className="text-gray-300">Obegränsade genererade brev</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-400 mt-1 mr-2 flex-shrink-0" />
                <span className="text-gray-300">Obegränsade sparade brev</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-400 mt-1 mr-2 flex-shrink-0" />
                <span className="text-gray-300">Obegränsade CV-uppladdningar</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-400 mt-1 mr-2 flex-shrink-0" />
                <span className="text-gray-300">Tillgång till AI-optimerad tonalitet</span>
              </li>
            </ul>
            
            <div className="bg-pink-500/20 rounded-lg p-3 mb-4">
              <p className="text-pink-300 text-sm">Med Premium blir ditt jobbsökande enklare och får en högre svarsfrekvens!</p>
            </div>
            
            <button
              onClick={handleUpgrade}
              disabled={isProcessing}
              className="w-full flex items-center justify-center px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Bearbetar...
                </span>
              ) : (
                <span className="flex items-center">
                  <Crown className="mr-2 h-4 w-4" />
                  Bli Premium (169 kr/månad)
                  <ChevronRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </button>
          </div>
          
          {/* Ingen bindningstid info */}
          <p className="text-center text-xs text-gray-400">
            Ingen bindningstid. Avsluta när du vill.
          </p>
        </div>
      ) : (
        <div>
          <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-lg mb-4 border border-yellow-500/30">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
              <Crown className="w-5 h-5 mr-2 text-yellow-400" />
              Premium-medlem
            </h3>
            <p className="text-gray-300 mb-2">
              Du har tillgång till alla premium-funktioner. Tack för ditt stöd!
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-400 mt-1 mr-2 flex-shrink-0" />
                <span className="text-gray-300">Obegränsat antal brev och CV</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-400 mt-1 mr-2 flex-shrink-0" />
                <span className="text-gray-300">Tillgång till alla avancerade funktioner</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-400 mt-1 mr-2 flex-shrink-0" />
                <span className="text-gray-300">Prioriterad support</span>
              </li>
            </ul>
          </div>
          
          {/* Bara för testning */}
          <div className="mt-4">
            <button
              onClick={handleDowngrade}
              className="text-xs text-gray-500 hover:text-gray-400"
            >
              Nedgradera till gratis (enbart för testning)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}