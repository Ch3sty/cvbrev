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
  Wand2,
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
    shortDescription: 'Formell och saklig, passar etablerade branscher.',
    example:
      'Med min bakgrund inom finans och tio års erfarenhet av riskanalys är jag väl rustad för rollen.',
    icon: <Briefcase className="w-5 h-5" strokeWidth={2} />,
  },
  {
    value: 'creative',
    label: 'Kreativ',
    shortDescription: 'Personlig och innovativ, passar reklam, design och media.',
    example:
      'När jag läste er annons kände jag direkt: det här är platsen där mitt nästa kapitel börjar.',
    icon: <Palette className="w-5 h-5" strokeWidth={2} />,
  },
  {
    value: 'confident',
    label: 'Självsäker',
    shortDescription: 'Bestämd och rakt på sak, passar ledarroller och säljpositioner.',
    example:
      'Jag vet vad som krävs för att leda ett team mot resultat. Det är därför jag söker den här rollen.',
    icon: <Trophy className="w-5 h-5" strokeWidth={2} />,
  },
  {
    value: 'balanced',
    label: 'Balanserad',
    shortDescription: 'Lagom formell och personlig, passar de flesta jobb.',
    example:
      'Som jag ser det handlar bra arbete om både kompetens och samarbetsförmåga, och båda har jag med mig.',
    icon: <Scale className="w-5 h-5" strokeWidth={2} />,
  },
  {
    value: 'auto',
    label: 'Smart val',
    shortDescription: 'Vi väljer ton automatiskt baserat på varje annons.',
    example:
      'Vi läser varje annons och anpassar tonen så att brevet matchar arbetsgivarens stil.',
    icon: <Wand2 className="w-5 h-5" strokeWidth={2} />,
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
              aria-label={`${tonality.label}, ${tonality.shortDescription}`}
              className="relative text-left rounded-xl p-4 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 overflow-hidden"
              style={
                isSelected
                  ? {
                      background: 'white',
                      border: '2px solid #10B981',
                    }
                  : isLocked
                  ? {
                      background:
                        'transparent',
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
                    background: '#059669',
                  }}
                >
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </motion.div>
              )}

              {/* Premium-badge i hörnet */}
              {isLocked && (
                <span
                  className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider text-white z-10"
                  style={{
                    background: '#F59E0B',
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
                      ? 'transparent'
                      : '#EA580C',
                  }}
                >
                  {tonality.icon}
                </div>
                {isLocked && (
                  <div
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center bg-white"
                    >
                    <Lock className="w-3 h-3 text-orange-600" strokeWidth={3} />
                  </div>
                )}
              </div>

              {/* Text */}
              <h4 className="text-sm sm:text-base font-bold text-neutral-900 leading-tight pr-6">
                {tonality.label}
              </h4>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                {tonality.shortDescription}
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* "Så låter det", mini-brev-mockup */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeOption.value}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="mt-5"
        >
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700 mb-2 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-orange-500" aria-hidden="true" />
            Så låter det i ditt brev
          </div>

          <div className="relative">
            {/* Liten papper-skugga bakom */}
            <div
              className="absolute -bottom-1 -right-1 left-2 top-2 rounded-xl"
              style={{
                background:
                  'transparent',
                transform: 'rotate(0.6deg)',
              }}
              aria-hidden="true"
            />

            <div
              className="relative rounded-xl bg-white p-5 sm:p-6"
              style={{
                border: '1px solid rgba(249, 115, 22, 0.25)',
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
                  className="flex-shrink-0 w-9 h-11 rounded-md flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider"
                  style={{
                    background:
                      '#EA580C',
                    border: '2px dashed rgba(255, 255, 255, 0.6)',
                  }}
                  aria-hidden="true"
                >
                  ABC
                </div>
              </div>

              {/* Brev-text (citat) */}
              <p className="text-sm sm:text-base text-neutral-800 leading-relaxed italic">
                &ldquo;{activeOption.example}&rdquo;
              </p>

              {/* Tonality-tagg */}
              <div className="mt-4 pt-3 border-t border-orange-100 flex items-center justify-between gap-2">
                <span className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">
                  Ton
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white"
                  style={{
                    background: '#EA580C',
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
