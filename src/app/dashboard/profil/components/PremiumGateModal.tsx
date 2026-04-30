'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { X, Check, ArrowRight, Camera, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { PremiumCrownIcon, LockedFieldIcon } from './illustrations/ProfileIcons';
import { SmartAutoToneIcon } from './illustrations/TonalityIcons';

export type PremiumFeature = 'photo' | 'linkedin' | 'smart-tone';

interface PremiumGateModalProps {
  feature: PremiumFeature | null;
  onClose: () => void;
}

const FEATURE_CONTENT: Record<
  PremiumFeature,
  { title: string; subtitle: string; bullets: string[] }
> = {
  photo: {
    title: 'Lägg till profilbild',
    subtitle:
      'Få ditt CV att stå ut visuellt med ett professionellt foto direkt på mallen.',
    bullets: [
      'Synlig på premium CV-mallar',
      'Ger ett mer personligt intryck',
      'Du bestämmer själv när den ska användas',
    ],
  },
  linkedin: {
    title: 'Visa LinkedIn-profil på CV:n',
    subtitle:
      'Knyt din digitala närvaro till CV:t och förbättra ATS-poängen.',
    bullets: [
      'Förbättrar ATS-optimering på ditt CV',
      'Rekryterare kan snabbt verifiera din profil',
      'Visas snyggt på alla premium-mallar',
    ],
  },
  'smart-tone': {
    title: 'Lås upp Smart val',
    subtitle:
      'Vi väljer den ton som passar varje annons bäst — automatiskt för varje brev.',
    bullets: [
      'AI analyserar tonen i varje annons',
      'Du slipper välja manuellt för varje brev',
      'Högre träffsäkerhet i dina ansökningar',
    ],
  },
};

export default function PremiumGateModal({ feature, onClose }: PremiumGateModalProps) {
  // Escape-tangent stänger
  useEffect(() => {
    if (!feature) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [feature, onClose]);

  // Lås body-scroll när modal är öppen
  useEffect(() => {
    if (feature) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [feature]);

  return (
    <AnimatePresence>
      {feature && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden"
            style={{
              boxShadow: '0 24px 64px -16px rgba(15, 23, 42, 0.35)',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="premium-gate-title"
          >
            {/* Top-band */}
            <div
              className="h-[3px]"
              style={{
                background:
                  'linear-gradient(90deg, #F97316, #DC2626, #BE185D)',
              }}
            />

            {/* Stäng-knapp */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Stäng"
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-orange-50 flex items-center justify-center text-slate-500 hover:text-orange-700 transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
            </button>

            {/* Hero */}
            <div
              className="relative px-5 sm:px-7 pt-6 pb-5"
              style={{
                background:
                  'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 50%, #FECACA 100%)',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <FeatureIcon feature={feature} />
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white"
                  style={{
                    background: 'linear-gradient(135deg, #FCD34D, #F59E0B)',
                    boxShadow: '0 3px 10px -2px rgba(245, 158, 11, 0.5)',
                  }}
                >
                  <PremiumCrownIcon className="w-3.5 h-3.5" />
                  Premium
                </span>
              </div>

              <h3
                id="premium-gate-title"
                className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight"
              >
                {FEATURE_CONTENT[feature].title}
              </h3>
              <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                {FEATURE_CONTENT[feature].subtitle}
              </p>
            </div>

            {/* Bullets */}
            <div className="px-5 sm:px-7 py-5 space-y-2.5">
              {FEATURE_CONTENT[feature].bullets.map((bullet, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white mt-0.5"
                    style={{
                      background:
                        'linear-gradient(135deg, #10B981, #059669)',
                    }}
                  >
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </div>
                  <span className="text-sm text-slate-700 leading-relaxed">
                    {bullet}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div
              className="px-5 sm:px-7 py-5 border-t"
              style={{
                background: 'rgba(255, 247, 237, 0.5)',
                borderColor: 'rgba(249, 115, 22, 0.15)',
                paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))',
              }}
            >
              <Link
                href="/dashboard/profil/prenumeration"
                onClick={onClose}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-white font-bold text-base min-h-[52px]"
                style={{
                  background: 'linear-gradient(135deg, #F97316, #DC2626)',
                  boxShadow: '0 12px 28px -8px rgba(220, 38, 38, 0.45)',
                }}
              >
                Testa Premium gratis i 7 dagar
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="w-full mt-2 inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-orange-700 transition-colors"
              >
                Kanske senare
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FeatureIcon({ feature }: { feature: PremiumFeature }) {
  if (feature === 'photo') {
    return (
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
        style={{
          background: 'linear-gradient(135deg, #F97316, #DC2626)',
          boxShadow: '0 6px 16px -4px rgba(220, 38, 38, 0.4)',
        }}
      >
        <Camera className="w-6 h-6" strokeWidth={2.25} />
      </div>
    );
  }
  if (feature === 'linkedin') {
    return (
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
        style={{
          background: 'linear-gradient(135deg, #F97316, #DC2626)',
          boxShadow: '0 6px 16px -4px rgba(220, 38, 38, 0.4)',
        }}
      >
        <Linkedin className="w-6 h-6" strokeWidth={2.25} />
      </div>
    );
  }
  // smart-tone — använd den fina SVG-illustrationen
  return <SmartAutoToneIcon className="w-14 h-14" />;
}

/* Använd LockedFieldIcon någonstans för att inte få "unused"-varning */
void LockedFieldIcon;
