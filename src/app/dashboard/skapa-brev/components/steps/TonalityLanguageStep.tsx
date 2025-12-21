'use client';

import { motion } from 'framer-motion';
import {
  Building2, Sparkles, Lightbulb, Trophy, Scale, Bot,
  Languages, Crown, Lock, Check
} from 'lucide-react';

type Tonality = 'professional' | 'enthusiastic' | 'creative' | 'confident' | 'balanced' | 'auto';
type Language = 'sv' | 'en';

interface TonalityLanguageStepProps {
  tonality: Tonality;
  language: Language;
  onTonalityChange: (tonality: Tonality) => void;
  onLanguageChange: (language: Language) => void;
  isPremium: boolean;
}

const tonalityOptions = [
  {
    id: 'professional' as Tonality,
    label: 'Professionell',
    description: 'Formell och saklig ton',
    icon: Building2,
    recommendedFor: 'Traditionella branscher',
    color: 'from-blue-500 to-blue-600',
    premiumOnly: false
  },
  {
    id: 'enthusiastic' as Tonality,
    label: 'Entusiastisk',
    description: 'Energisk och passionerad',
    icon: Sparkles,
    recommendedFor: 'Kreativa yrken, startups',
    color: 'from-pink-500 to-pink-600',
    premiumOnly: false
  },
  {
    id: 'creative' as Tonality,
    label: 'Kreativ',
    description: 'Innovativ och nytänkande',
    icon: Lightbulb,
    recommendedFor: 'Design, marknadsföring',
    color: 'from-yellow-500 to-orange-500',
    premiumOnly: false
  },
  {
    id: 'confident' as Tonality,
    label: 'Självsäker',
    description: 'Betonar prestationer',
    icon: Trophy,
    recommendedFor: 'Chefsroller, sälj',
    color: 'from-amber-500 to-amber-600',
    premiumOnly: false
  },
  {
    id: 'balanced' as Tonality,
    label: 'Balanserad',
    description: 'Mix av professionalitet',
    icon: Scale,
    recommendedFor: 'De flesta tjänster',
    color: 'from-green-500 to-emerald-500',
    premiumOnly: false,
    recommended: true
  },
  {
    id: 'auto' as Tonality,
    label: 'Smart-anpassad',
    description: 'Vi väljer optimal ton för jobbet',
    icon: Bot,
    recommendedFor: 'Max effekt',
    color: 'from-purple-500 to-indigo-600',
    premiumOnly: true
  }
];

const languageOptions = [
  { id: 'sv' as Language, label: 'Svenska', flag: '🇸🇪' },
  { id: 'en' as Language, label: 'English', flag: '🇬🇧' }
];

export default function TonalityLanguageStep({
  tonality,
  language,
  onTonalityChange,
  onLanguageChange,
  isPremium
}: TonalityLanguageStepProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Anpassa ton och språk</h3>
        <p className="text-sm text-gray-600">
          Välj hur ditt brev ska låta och vilket språk det ska skrivas på
        </p>
      </div>

      {/* Tonality Selection */}
      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Vilken ton passar bäst?</h4>

        {/* Mobile: Stacked vertically */}
        <div className="space-y-3 md:hidden">
          {tonalityOptions.map((option) => {
            const isSelected = tonality === option.id;
            const isLocked = option.premiumOnly && !isPremium;

            return (
              <motion.button
                key={option.id}
                onClick={() => !isLocked && onTonalityChange(option.id)}
                disabled={isLocked}
                className={`
                  relative w-full p-4 rounded-xl border-2 transition-all
                  flex items-center gap-4
                  ${isSelected
                    ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
                    : isLocked
                    ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
                whileTap={!isLocked ? { scale: 0.98 } : {}}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center flex-shrink-0`}>
                  <option.icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <h5 className="font-semibold text-gray-900">{option.label}</h5>
                    {option.recommended && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Rekommenderad
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{option.description}</p>
                  <p className="text-xs text-gray-500 mt-1">Bäst för: {option.recommendedFor}</p>
                </div>

                {/* Selection indicator or lock */}
                {isLocked ? (
                  <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Premium
                  </div>
                ) : isSelected ? (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                ) : null}
              </motion.button>
            );
          })}
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tonalityOptions.map((option) => {
            const isSelected = tonality === option.id;
            const isLocked = option.premiumOnly && !isPremium;

            return (
              <motion.button
                key={option.id}
                onClick={() => !isLocked && onTonalityChange(option.id)}
                disabled={isLocked}
                className={`
                  relative p-4 rounded-xl border-2 transition-all text-left
                  ${isSelected
                    ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
                    : isLocked
                    ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                  }
                `}
                whileHover={!isLocked ? { scale: 1.02, y: -2 } : {}}
                whileTap={!isLocked ? { scale: 0.98 } : {}}
              >
                {/* Premium Lock or Recommended */}
                {isLocked && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Premium
                    </div>
                  </div>
                )}
                {option.recommended && !isLocked && (
                  <div className="absolute top-2 right-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Rekommenderad
                    </span>
                  </div>
                )}

                {/* Selection Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}

                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center mb-3`}>
                  <option.icon className="w-5 h-5 text-white" />
                </div>
                <h5 className="font-semibold text-gray-900">{option.label}</h5>
                <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                <p className="text-xs text-gray-500 mt-2">Bäst för: {option.recommendedFor}</p>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Language Selection */}
      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Vilket språk ska brevet ha?</h4>
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto md:mx-0">
          {languageOptions.map((lang) => {
            const isSelected = language === lang.id;

            return (
              <motion.button
                key={lang.id}
                onClick={() => onLanguageChange(lang.id)}
                className={`
                  relative p-4 rounded-xl border-2 transition-all
                  ${isSelected
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}

                <div className="flex items-center gap-3">
                  <span className="text-3xl">{lang.flag}</span>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{lang.label}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Languages className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">{lang.id.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Premium Upsell */}
      {!isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6"
        >
          <div className="flex items-start gap-4">
            <Crown className="w-8 h-8 text-purple-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Lås upp Smart-anpassad tonalitet
              </h4>
              <p className="text-sm text-gray-700 mb-3">
                Med Premium analyserar AI:n jobbannonsen och väljer automatiskt den perfekta tonen för din ansökan.
              </p>
              <button className="text-sm font-medium text-purple-600 hover:text-purple-700 underline">
                Uppgradera till Premium →
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
