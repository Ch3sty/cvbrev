'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Wand2,
  Lightbulb,
  Trophy,
  Scale,
  Bot,
  Languages,
  Crown,
  Lock,
  Check,
} from 'lucide-react';
import LetterFlowStepHeader from '../LetterFlowStepHeader';

type Tonality =
  | 'professional'
  | 'enthusiastic'
  | 'creative'
  | 'confident'
  | 'balanced'
  | 'auto';
type Language = 'sv' | 'en';

interface TonalityLanguageStepProps {
  tonality: Tonality;
  language: Language;
  onTonalityChange: (tonality: Tonality) => void;
  onLanguageChange: (language: Language) => void;
  isPremium: boolean;
  isActive: boolean;
  registerRef?: (el: HTMLElement | null) => void;
}

const standardTonalityOptions = [
  {
    id: 'professional' as Tonality,
    label: 'Professionell',
    description: 'Formell och saklig ton',
    icon: Building2,
    recommendedFor: 'Traditionella branscher',
  },
  {
    id: 'enthusiastic' as Tonality,
    label: 'Entusiastisk',
    description: 'Energisk och passionerad',
    icon: Wand2,
    recommendedFor: 'Kreativa yrken, startups',
  },
  {
    id: 'creative' as Tonality,
    label: 'Kreativ',
    description: 'Innovativ och nytänkande',
    icon: Lightbulb,
    recommendedFor: 'Design, marknadsföring',
  },
  {
    id: 'confident' as Tonality,
    label: 'Självsäker',
    description: 'Betonar prestationer',
    icon: Trophy,
    recommendedFor: 'Chefsroller, sälj',
  },
  {
    id: 'balanced' as Tonality,
    label: 'Balanserad',
    description: 'Mix av professionalitet och personlighet',
    icon: Scale,
    recommendedFor: 'De flesta tjänster',
  },
];

const languageOptions = [
  { id: 'sv' as Language, label: 'Svenska', flag: '🇸🇪' },
  { id: 'en' as Language, label: 'English', flag: '🇬🇧' },
];

export default function TonalityLanguageStep({
  tonality,
  language,
  onTonalityChange,
  onLanguageChange,
  isPremium,
  isActive,
  registerRef,
}: TonalityLanguageStepProps) {
  useEffect(() => {
    if (isPremium && tonality === 'balanced') {
      onTonalityChange('auto');
    }
  }, [isPremium]);

  const isAutoSelected = tonality === 'auto';

  const FeaturedCard = () => {
    const isLocked = !isPremium;

    if (isLocked) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border-2 border-dashed border-fuchsia-300 bg-gradient-to-br from-fuchsia-50 via-purple-50 to-pink-50 p-5 sm:p-6"
        >
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 opacity-70"
              style={{
                background:
                  'linear-gradient(135deg, #D946EF, #9333EA, #DB2777)',
              }}
            >
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h5 className="font-bold text-slate-800">Smart-anpassad</h5>
                <div className="bg-slate-800 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Premium
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                Vi matchar tonen mot företagets kultur och branschens
                förväntningar. Inte bara annonsen.
              </p>
              <a
                href="/dashboard/installningar"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-700"
              >
                <Crown className="w-4 h-4" />
                Uppgradera för att låsa upp
              </a>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.button
        type="button"
        onClick={() => onTonalityChange('auto')}
        className="relative w-full overflow-hidden rounded-3xl text-left transition-all"
        style={{
          background:
            'linear-gradient(135deg, #D946EF 0%, #9333EA 50%, #DB2777 100%)',
          boxShadow: isAutoSelected
            ? '0 20px 40px -12px rgba(168, 85, 247, 0.5)'
            : '0 12px 28px -8px rgba(168, 85, 247, 0.35)',
        }}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        aria-pressed={isAutoSelected}
      >
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Bot className="w-7 h-7 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h5 className="font-bold text-lg text-white">Smart-anpassad</h5>
                <span className="bg-yellow-300/95 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Bäst resultat
                </span>
              </div>
              <p className="text-sm text-white/90 mb-3 leading-relaxed">
                Vi matchar tonen mot företagets kultur och branschens
                förväntningar.
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/80">
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-green-300" strokeWidth={2.75} />
                  Djupanalys av krav
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-green-300" strokeWidth={2.75} />
                  Branschanpassad ton
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-green-300" strokeWidth={2.75} />
                  Högre svarsfrekvens
                </span>
              </div>
            </div>

            {isAutoSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
              >
                <Check className="w-5 h-5 text-purple-600" strokeWidth={3} />
              </motion.div>
            )}
          </div>
        </div>
      </motion.button>
    );
  };

  const StandardCard = ({
    option,
  }: {
    option: typeof standardTonalityOptions[0];
  }) => {
    const isSelected = tonality === option.id;
    const Icon = option.icon;

    return (
      <motion.button
        type="button"
        onClick={() => onTonalityChange(option.id)}
        className={`relative w-full rounded-2xl border-2 transition-all text-left p-4 focus:outline-none ${
          isSelected
            ? 'border-orange-400 bg-orange-50/50'
            : 'border-slate-200 bg-white hover:border-orange-300'
        }`}
        style={
          isSelected
            ? { boxShadow: '0 8px 20px -6px rgba(249, 115, 22, 0.3)' }
            : undefined
        }
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        aria-pressed={isSelected}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={
              isSelected
                ? {
                    background:
                      'linear-gradient(135deg, #F97316, #DC2626)',
                  }
                : { background: '#F1F5F9' }
            }
          >
            <Icon
              className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-500'}`}
              strokeWidth={2.25}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h5 className="font-bold text-slate-900 text-sm">{option.label}</h5>
            <p className="text-xs text-slate-600 mt-0.5">
              {option.description}
            </p>
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={
                  isSelected
                    ? { background: '#F97316' }
                    : { background: '#CBD5E1' }
                }
              />
              {option.recommendedFor}
            </p>
          </div>

          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #F97316, #DC2626)',
              }}
            >
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </motion.div>
          )}
        </div>
      </motion.button>
    );
  };

  return (
    <motion.section
      ref={registerRef}
      data-flow-section="tone"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white rounded-3xl border border-orange-200/50 p-5 sm:p-7"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.15)' }}
    >
      <LetterFlowStepHeader
        stepNumber={4}
        title="Ton & språk"
        description="Välj hur brevet ska låta."
        isDone={!!tonality}
        isActive={isActive}
      />

      <div className="space-y-5">
        <FeaturedCard />

        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-500 font-medium">
            eller välj manuellt
          </span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {standardTonalityOptions.map((option) => (
            <StandardCard key={option.id} option={option} />
          ))}
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mt-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                <Languages className="w-5 h-5 text-slate-600" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 text-sm">
                  Brevets språk
                </h4>
                <p className="text-xs text-slate-500">
                  Vilket språk ska brevet skrivas på?
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {languageOptions.map((lang) => {
                const isSelected = language === lang.id;
                return (
                  <motion.button
                    key={lang.id}
                    type="button"
                    onClick={() => onLanguageChange(lang.id)}
                    className={`px-4 py-2.5 rounded-xl border-2 transition-all flex items-center gap-2 min-h-[44px] focus:outline-none ${
                      isSelected
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-slate-200 bg-white hover:border-orange-300'
                    }`}
                    whileTap={{ scale: 0.95 }}
                    aria-pressed={isSelected}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="font-semibold text-slate-900 text-sm">
                      {lang.label}
                    </span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-orange-600" strokeWidth={3} />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
