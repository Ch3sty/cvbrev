'use client';

/**
 * Premiumluckan: öppnas när någon klickar ett låst fält. Bygger på
 * shell/Sheet (scroll-lås, Escape, safe area, fokus). Marginalplattan bär
 * vyns enda illustration, handlingen är en ink-knapp och det sekundära en
 * textlänk. Ingen framer-motion, ingen gradient.
 */

import Link from 'next/link';
import Sheet from '@/components/shell/Sheet';
import MarginPlate from '@/components/shell/MarginPlate';
import { IlluPlattaPremium, IlluPlattaSmartTon } from '@/components/illustrations/TradenScener';

export type PremiumFeature = 'photo' | 'linkedin' | 'smart-tone';

interface PremiumGateModalProps {
  feature: PremiumFeature | null;
  onClose: () => void;
}

const FEATURE_CONTENT: Record<PremiumFeature, { title: string; subtitle: string; bullets: string[] }> = {
  photo: {
    title: 'Lägg till profilbild',
    subtitle: 'Få ditt CV att stå ut visuellt med ett professionellt foto direkt på mallen.',
    bullets: [
      'Synlig på premium CV-mallar',
      'Ger ett mer personligt intryck',
      'Du bestämmer själv när den ska användas',
    ],
  },
  linkedin: {
    title: 'Visa LinkedIn-profil på CV:n',
    subtitle: 'Knyt din digitala närvaro till CV:t och förbättra ATS-poängen.',
    bullets: [
      'Förbättrar ATS-optimering på ditt CV',
      'Rekryterare kan snabbt verifiera din profil',
      'Visas snyggt på alla premium-mallar',
    ],
  },
  'smart-tone': {
    title: 'Automatiskt tonval ingår i Premium',
    subtitle: 'Vi läser annonsens språk och bransch och väljer tonen åt dig, brev för brev.',
    bullets: [
      'Vi läser tonen i varje annons',
      'Du slipper välja manuellt för varje brev',
      'Samma ton som arbetsgivaren använder i annonsen',
    ],
  },
};

export default function PremiumGateModal({ feature, onClose }: PremiumGateModalProps) {
  const content = feature ? FEATURE_CONTENT[feature] : null;
  const Illu = feature === 'smart-tone' ? IlluPlattaSmartTon : IlluPlattaPremium;

  return (
    <Sheet
      open={feature !== null}
      onClose={onClose}
      title={content?.title ?? 'Premium'}
      footer={
        <div className="flex flex-col items-center gap-1">
          <Link
            href="/dashboard/profil/prenumeration"
            onClick={onClose}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover"
          >
            Se vad Premium kostar
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1"
          >
            Kanske senare
          </button>
        </div>
      }
    >
      {content ? (
        <div className="flex items-start gap-3">
          <MarginPlate>
            <Illu size={48} />
          </MarginPlate>
          <div className="min-w-0 flex-1">
            <p className="text-steg uppercase text-accent-ink">Ingår i Premium</p>
            <p className="mt-1 text-sm leading-[22px] text-ink-2">{content.subtitle}</p>
            <ul className="mt-3 space-y-1.5">
              {content.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2 text-sm leading-[22px] text-ink-2">
                  <svg
                    viewBox="0 0 20 20"
                    width="16"
                    height="16"
                    className="mt-[3px] shrink-0 text-positiv"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 10.5l4 4 8-9" />
                  </svg>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <span className="sr-only">Premium</span>
      )}
    </Sheet>
  );
}
