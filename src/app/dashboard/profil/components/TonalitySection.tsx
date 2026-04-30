'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Crown,
  Lock,
  Briefcase,
  Palette,
  Trophy,
  Scale,
  Sparkle,
  Mail,
} from 'lucide-react';
import ProfileSection from './ProfileSection';
import type { PremiumFeature } from './PremiumGateModal';

export type TonalityValue =
  | 'professional'
  | 'creative'
  | 'enthusiastic'
  | 'confident'
  | 'balanced'
  | 'auto';

interface TonalityOption {
  value: TonalityValue;
  label: string;
  shortDescription: string;
  example: string;
  icon: React.ReactNode;
  premium?: boolean;
}

export const TONALITIES: TonalityOption[] = [
  {
    value: 'professional',
    label: 'Professionell',
    shortDescription: 'Formell och saklig — passar etablerade branscher.',
    example:
      'Med min bakgrund inom finans och tio års erfarenhet av riskanalys är jag väl rustad för rollen.',
    icon: <Briefcase className="w-5 h-5" strokeWidth={2} />,
  },
  {
    value: 'creative',
    label: 'Kreativ',
    shortDescription: 'Personlig och innovativ — passar reklam, design och media.',
    example:
      'När jag läste er annons kände jag direkt: det här är platsen där mitt nästa kapitel börjar.',
    icon: <Palette className="w-5 h-5" strokeWidth={2} />,
  },
  {
    value: 'confident',
    label: 'Självsäker',
    shortDescription: 'Bestämd och rakt på sak — passar ledarroller och säljpositioner.',
    example:
      'Jag vet vad som krävs för att leda ett team mot resultat. Det är därför jag söker den här rollen.',
    icon: <Trophy className="w-5 h-5" strokeWidth={2} />,
  },
  {
    value: 'balanced',
    label: 'Balanserad',
    shortDescription: 'Lagom formell och personlig — passar de flesta jobb.',
    example:
      'Som jag ser det handlar bra arbete om både kompetens och samarbetsförmåga, och båda har jag med mig.',
    icon: <Scale className="w-5 h-5" strokeWidth={2} />,
  },
  {
    value: 'auto',
    label: 'Smart val',
    shortDescription: 'Vi väljer ton automatiskt baserat på varje annons.',
    example:
      'AI:n analyserar varje annons och anpassar tonen så att brevet matchar arbetsgivarens stil.',
    icon: <Sparkle className="w-5 h-5" strokeWidth={2} />,
    premium: true,
  },
];

interface TonalitySectionProps {
  selected: TonalityValue;
  onChange: (value: TonalityValue) => void;
  subscriptionTier: 'free' | 'premium';
  onPremiumGate: (feature: PremiumFeature) => void;
}

export default function TonalitySection({
  selected,
  onChange,
  subscriptionTier,
  onPremiumGate,
}: TonalitySectionProps) {
  const isFree = subscriptionTier === 'free';
  const activeOption =
    TONALITIES.find((t) => t.value === selected) || TONALITIES[0];

  return (
    <ProfileSection
      eyebrow="Min skrivställning"
      title="Hur ska vi låta i dina brev?"
      description="Välj en grundton som vi använder när vi skriver brev åt dig. Du kan alltid byta för enskilda brev senare."
      icon={<Mail className="w-6 h-6" strokeWidth={2} />}
      delay={0.1}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TONALITIES.map((tonality) => {
          const isSelected = selected === tonality.value;
          const isLocked = tonality.premium && isFree;

          return (
            <motion.button
              key={tonality.value}
              type="button"
              whileHover={!isLocked ? { y: -2 } : undefined}
              whileTap={!isLocked ? { scale: 0.98 } : undefined}
              onClick={() => {
                if (isLocked) {
                  onPremiumGate('smart-tone');
                } else {
                  onChange(tonality.value);
                }
              }}
              aria-pressed={isSelected}
              aria-label={`${tonality.label} — ${tonality.shortDescription}`}
              className="relative text-left rounded-2xl p-4 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 overflow-hidden"
              style={
                isSelected
                  ? {
                      background: 'white',
                      border: '2px solid #10B981',
                      boxShadow:
                        '0 0 0 4px rgba(16, 185, 129, 0.12), 0 8px 24px -8px rgba(16, 185, 129, 0.25)',
                    }
                  : isLocked
                  ? {
                      background:
                        'linear-gradient(135deg, rgba(249, 115, 22, 0.06) 0%, rgba(220, 38, 38, 0.04) 100%)',
                      border: '2px dashed rgba(249, 115, 22, 0.4)',
                    }
                  : {
                      background: 'white',
                      border: '2px solid rgba(249, 115, 22, 0.18)',
                    }
              }
            >
              {/* Selected check i hörnet */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center z-10"
                  style={{
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    boxShadow: '0 4px 10px -2px rgba(16, 185, 129, 0.5)',
                  }}
                >
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </motion.div>
              )}

              {/* Premium-badge i hörnet */}
              {isLocked && (
                <span
                  className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-white z-10"
                  style={{
                    background: 'linear-gradient(135deg, #FCD34D, #F59E0B)',
                    boxShadow: '0 3px 8px -2px rgba(245, 158, 11, 0.45)',
                  }}
                >
                  <Crown className="w-2.5 h-2.5" strokeWidth={2.5} />
                  Premium
                </span>
              )}

              {/* Ikon-chip */}
              <div className="relative mb-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
                  style={{
                    background: isLocked
                      ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.6), rgba(220, 38, 38, 0.5))'
                      : 'linear-gradient(135deg, #F97316, #DC2626)',
                    boxShadow: '0 6px 14px -6px rgba(220, 38, 38, 0.4)',
                  }}
                >
                  {tonality.icon}
                </div>
                {isLocked && (
                  <div
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center bg-white"
                    style={{
                      boxShadow: '0 2px 6px -1px rgba(15, 23, 42, 0.25)',
                    }}
                  >
                    <Lock className="w-3 h-3 text-orange-600" strokeWidth={3} />
                  </div>
                )}
              </div>

              {/* Text */}
              <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-tight pr-6">
                {tonality.label}
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {tonality.shortDescription}
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* "Så låter det" — mini-brev-mockup */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeOption.value}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="mt-5"
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-2 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-orange-500" aria-hidden="true" />
            Så låter det i ditt brev
          </div>

          <div className="relative">
            {/* Liten papper-skugga bakom */}
            <div
              className="absolute -bottom-1 -right-1 left-2 top-2 rounded-2xl"
              style={{
                background:
                  'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(220, 38, 38, 0.08) 100%)',
                transform: 'rotate(0.6deg)',
              }}
              aria-hidden="true"
            />

            <div
              className="relative rounded-2xl bg-white p-5 sm:p-6"
              style={{
                border: '1px solid rgba(249, 115, 22, 0.25)',
                boxShadow: '0 12px 32px -16px rgba(220, 38, 38, 0.18)',
              }}
            >
              {/* Brev-header (frimärke + adressrader) */}
              <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-orange-100">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="h-1.5 rounded-full bg-orange-100 w-24 max-w-full" />
                  <div className="h-1.5 rounded-full bg-orange-50 w-32 max-w-full" />
                  <div className="h-1.5 rounded-full bg-orange-50 w-20 max-w-full" />
                </div>
                <div
                  className="flex-shrink-0 w-9 h-11 rounded-md flex items-center justify-center text-white text-[9px] font-bold uppercase tracking-wider"
                  style={{
                    background:
                      'linear-gradient(135deg, #F97316, #DC2626)',
                    border: '2px dashed rgba(255, 255, 255, 0.6)',
                  }}
                  aria-hidden="true"
                >
                  ABC
                </div>
              </div>

              {/* Brev-text (citat) */}
              <p className="text-sm sm:text-base text-slate-800 leading-relaxed italic">
                &ldquo;{activeOption.example}&rdquo;
              </p>

              {/* Tonality-tagg */}
              <div className="mt-4 pt-3 border-t border-orange-100 flex items-center justify-between gap-2">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  Ton
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #F97316, #DC2626)',
                  }}
                >
                  {activeOption.icon}
                  {activeOption.label}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </ProfileSection>
  );
}
