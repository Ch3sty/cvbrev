'use client';

import { motion } from 'framer-motion';
import {
  Building2, Sparkles, Lightbulb, Trophy, Scale, Bot,
  Languages, Crown, Lock, FileText, Layout
} from 'lucide-react';
import { LETTER_TEMPLATES, type TemplateId } from '@/lib/letters/letter-templates';
import Image from 'next/image';

type Tonality = 'professional' | 'enthusiastic' | 'creative' | 'confident' | 'balanced' | 'auto';
type Language = 'sv' | 'en';

interface SettingsStepProps {
  tonality: Tonality;
  language: Language;
  templateId: string;
  onTonalityChange: (tonality: Tonality) => void;
  onLanguageChange: (language: Language) => void;
  onTemplateChange: (templateId: string) => void;
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
    premiumOnly: false
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

export default function SettingsStep({
  tonality,
  language,
  templateId,
  onTonalityChange,
  onLanguageChange,
  onTemplateChange,
  isPremium
}: SettingsStepProps) {
  return (
    <div className="space-y-8">
      {/* Template Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Välj brevmall</h3>
        <p className="text-sm text-gray-600 mb-4">
          Alla mallar är ATS-optimerade och fungerar perfekt för både PDF och Word-export
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(LETTER_TEMPLATES).map(([id, template]) => {
            const isSelected = templateId === id;
            const isLocked = template.tier === 'premium' && !isPremium;

            return (
              <motion.button
                key={id}
                onClick={() => !isLocked && onTemplateChange(id as TemplateId)}
                disabled={isLocked}
                className={`
                  relative p-4 rounded-xl border-2 transition-all
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
                {/* Premium Badge */}
                {template.tier === 'premium' && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className={`${isLocked ? 'bg-gray-800' : 'bg-gradient-to-r from-purple-600 to-pink-600'} text-white text-xs px-2 py-1 rounded-full flex items-center gap-1`}>
                      {isLocked ? <Lock className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
                      Premium
                    </div>
                  </div>
                )}

                {/* Selection Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center z-10"
                  >
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}

                {/* Template Preview - Live iframe preview */}
                <div className="relative w-full h-48 mb-3 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                  <iframe
                    src={`/images/templates/${id}-preview.html`}
                    className="w-full h-full pointer-events-none"
                    style={{
                      transform: 'scale(0.25)',
                      transformOrigin: 'top left',
                      width: '400%',
                      height: '400%'
                    }}
                    title={`Preview av ${template.name}`}
                  />
                  {/* Overlay för att indikera att detta är en preview */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent pointer-events-none" />
                </div>

                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    {template.name}
                    {template.tier === 'free' && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Gratis</span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {template.industries.slice(0, 2).map((industry, idx) => (
                      <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {industry}
                      </span>
                    ))}
                    {template.industries.length > 2 && (
                      <span className="text-xs text-gray-500">+{template.industries.length - 2}</span>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tonality Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Välj tonalitet</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tonalityOptions.map((option) => {
            const isSelected = tonality === option.id;
            const isLocked = option.premiumOnly && !isPremium;

            return (
              <motion.button
                key={option.id}
                onClick={() => !isLocked && onTonalityChange(option.id)}
                disabled={isLocked}
                className={`
                  relative p-4 rounded-xl border-2 transition-all
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
                {/* Premium Lock */}
                {isLocked && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Premium
                    </div>
                  </div>
                )}

                {/* Selection Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}

                <div className="text-left">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center mb-3`}>
                    <option.icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900">{option.label}</h4>
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  <p className="text-xs text-gray-500 mt-2">Bäst för: {option.recommendedFor}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Language Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Välj språk</h3>
        <div className="grid grid-cols-2 gap-4 max-w-md">
          {[
            { id: 'sv' as Language, label: 'Svenska', flag: '🇸🇪' },
            { id: 'en' as Language, label: 'English', flag: '🇬🇧' }
          ].map((lang) => (
            <motion.button
              key={lang.id}
              onClick={() => onLanguageChange(lang.id)}
              className={`
                p-4 rounded-xl border-2 transition-all
                ${language === lang.id
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{lang.label}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Languages className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-500">{lang.id.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

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
                Lås upp Premium-funktioner
              </h4>
              <p className="text-sm text-gray-700 mb-3">
                Få tillgång till Smart-anpassad tonalitet och andra avancerade funktioner som ger dina ansökningar extra kraft.
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