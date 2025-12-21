'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Sparkles, Lightbulb, Trophy, Scale, Bot,
  Languages, Crown, Lock, Check, Zap
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

// Standard tonality options (excluding auto/Smart-anpassad)
const standardTonalityOptions = [
  {
    id: 'professional' as Tonality,
    label: 'Professionell',
    description: 'Formell och saklig ton',
    icon: Building2,
    recommendedFor: 'Traditionella branscher'
  },
  {
    id: 'enthusiastic' as Tonality,
    label: 'Entusiastisk',
    description: 'Energisk och passionerad',
    icon: Sparkles,
    recommendedFor: 'Kreativa yrken, startups'
  },
  {
    id: 'creative' as Tonality,
    label: 'Kreativ',
    description: 'Innovativ och nytänkande',
    icon: Lightbulb,
    recommendedFor: 'Design, marknadsföring'
  },
  {
    id: 'confident' as Tonality,
    label: 'Självsäker',
    description: 'Betonar prestationer',
    icon: Trophy,
    recommendedFor: 'Chefsroller, sälj'
  },
  {
    id: 'balanced' as Tonality,
    label: 'Balanserad',
    description: 'Mix av professionalitet och personlighet',
    icon: Scale,
    recommendedFor: 'De flesta tjänster'
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
  // Auto-select "auto" for premium users if they haven't selected anything yet
  useEffect(() => {
    if (isPremium && tonality === 'balanced') {
      onTonalityChange('auto');
    }
  }, [isPremium]);

  const isAutoSelected = tonality === 'auto';

  // Featured card component for Smart-anpassad
  const FeaturedCard = ({ isMobile = false }: { isMobile?: boolean }) => {
    const isLocked = !isPremium;

    if (isLocked) {
      // Locked state for non-premium users
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
            relative overflow-hidden rounded-2xl border-2 border-dashed border-purple-300
            bg-gradient-to-br from-purple-50 to-pink-50
            ${isMobile ? 'p-5' : 'p-6'}
          `}
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 opacity-60">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h5 className="font-bold text-gray-700">Smart-anpassad</h5>
                <div className="bg-gray-800 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Premium
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                AI analyserar jobbannonsen och väljer automatiskt den perfekta tonen
              </p>
              <a
                href="/dashboard/installningar"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700"
              >
                <Crown className="w-4 h-4" />
                Uppgradera för att låsa upp
              </a>
            </div>
          </div>
        </motion.div>
      );
    }

    // Premium user - full featured card
    return (
      <motion.button
        onClick={() => onTonalityChange('auto')}
        className={`
          relative w-full overflow-hidden rounded-2xl transition-all text-left
          ${isAutoSelected
            ? 'ring-4 ring-pink-300/50 shadow-xl shadow-pink-500/20'
            : 'hover:shadow-lg hover:shadow-pink-500/10'
          }
        `}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        aria-label="Välj Smart-anpassad tonalitet"
        aria-pressed={isAutoSelected}
      >
        {/* Gradient background */}
        <div className={`
          absolute inset-0 bg-gradient-to-br from-pink-600 to-purple-600
          ${isAutoSelected ? 'opacity-100' : 'opacity-90'}
        `} />

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />

        {/* Content */}
        <div className={`relative ${isMobile ? 'p-5' : 'p-6'}`}>
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Bot className="w-7 h-7 text-white" />
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h5 className="font-bold text-lg text-white">Smart-anpassad</h5>
                <span className="bg-yellow-400/90 text-yellow-900 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  AI
                </span>
              </div>
              <p className="text-sm text-white/90">
                AI analyserar jobbannonsen och väljer automatiskt den perfekta tonen för maximal effekt
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-300" />
                <span className="text-xs text-white/80 font-medium">Rekommenderad för premium-användare</span>
              </div>
            </div>

            {/* Selection indicator */}
            {isAutoSelected && (
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <Check className="w-5 h-5 text-pink-600" />
              </div>
            )}
          </div>
        </div>
      </motion.button>
    );
  };

  // Standard tonality card component
  const StandardCard = ({
    option,
    isMobile = false
  }: {
    option: typeof standardTonalityOptions[0];
    isMobile?: boolean;
  }) => {
    const isSelected = tonality === option.id;
    const Icon = option.icon;

    return (
      <motion.button
        onClick={() => onTonalityChange(option.id)}
        className={`
          relative w-full rounded-xl border-2 transition-all text-left
          focus:outline-none focus:ring-4 focus:ring-pink-500/20
          ${isMobile ? 'p-4' : 'p-5'}
          ${isSelected
            ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
          }
        `}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        aria-label={`Välj ${option.label} tonalitet`}
        aria-pressed={isSelected}
      >
        <div className="flex items-start gap-3">
          {/* Icon - neutral design */}
          <div className={`
            w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0
            ${isSelected ? 'bg-pink-100' : 'bg-gray-100'}
          `}>
            <Icon className={`w-5 h-5 ${isSelected ? 'text-pink-600' : 'text-gray-600'}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h5 className={`font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
              {option.label}
            </h5>
            <p className="text-sm text-gray-600 mt-0.5">{option.description}</p>
            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-pink-400' : 'bg-gray-400'}`} />
              {option.recommendedFor}
            </p>
          </div>

          {/* Selection indicator */}
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <Check className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </div>
      </motion.button>
    );
  };

  return (
    <div className="space-y-8">
      {/* Tonality Selection */}
      <section>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Vilken ton passar bäst?</h4>

        {/* Mobile Layout */}
        <div className="space-y-3 md:hidden">
          {/* Featured card first */}
          <FeaturedCard isMobile />

          {/* Divider */}
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-500 font-medium">eller välj manuellt</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Standard options */}
          {standardTonalityOptions.map((option) => (
            <StandardCard key={option.id} option={option} isMobile />
          ))}
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block space-y-5">
          {/* Featured card */}
          <FeaturedCard />

          {/* Divider */}
          <div className="flex items-center gap-4 py-1">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-500 font-medium">eller välj manuellt</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Standard options in grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {standardTonalityOptions.map((option) => (
              <StandardCard key={option.id} option={option} />
            ))}
          </div>
        </div>
      </section>

      {/* Language Selection - Compact integrated design */}
      <section className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
              <Languages className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Brevets språk</h4>
              <p className="text-xs text-gray-500">Vilket språk ska brevet skrivas på?</p>
            </div>
          </div>

          <div className="flex gap-2">
            {languageOptions.map((lang) => {
              const isSelected = language === lang.id;
              return (
                <motion.button
                  key={lang.id}
                  onClick={() => onLanguageChange(lang.id)}
                  className={`
                    px-4 py-2.5 rounded-lg border-2 transition-all flex items-center gap-2
                    focus:outline-none focus:ring-4 focus:ring-pink-500/20
                    ${isSelected
                      ? 'border-pink-500 bg-white shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                  `}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Välj ${lang.label}`}
                  aria-pressed={isSelected}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="font-medium text-gray-900 text-sm">{lang.label}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-pink-500" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
