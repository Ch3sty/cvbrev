'use client';

/**
 * Översikt av profilen (docs/plan-inloggat-saljflode.md, punkt 9).
 *
 * Omgjord enligt designsystemet: rounded-xl, border i stället för skugga,
 * font-semibold som tyngst, inga gradientytor och inga gradientcirklar bakom
 * ikoner. Illustrationerna kommer från primitives-systemet, aldrig lucide i
 * en gradientruta.
 *
 * Korten är navigation, inte säljytor. Plankortet pekar på prenumerationen
 * men fylls aldrig orange: en fylld yta per skärm, och den hör hemma i den
 * primära handlingen.
 */

import { motion } from 'framer-motion';
import {
  IlluProfilUppgifter,
  IlluSkrivton,
  IlluPlan,
} from '@/components/illustrations/ProfileIllustrations';

interface ProfileOverviewCardsProps {
  /** Hur många personliga uppgifter som är ifyllda */
  filledFields: number;
  totalFields: number;
  /** Aktuell skrivton-rubrik (t.ex. "Smart val") */
  tonalityLabel: string;
  /** Status: free / premium / trial / admin */
  subscriptionTier: 'free' | 'premium';
  hasActiveTrialOrPremium?: boolean;
}

export default function ProfileOverviewCards({
  filledFields,
  totalFields,
  tonalityLabel,
  subscriptionTier,
  hasActiveTrialOrPremium,
}: ProfileOverviewCardsProps) {
  const isPremium = subscriptionTier === 'premium' || !!hasActiveTrialOrPremium;
  const allFilled = filledFields === totalFields;

  const cards = [
    {
      Illu: IlluProfilUppgifter,
      eyebrow: 'Personliga uppgifter',
      title: `${filledFields} av ${totalFields} ifyllda`,
      hint: allFilled ? 'Allt på plats' : 'Komplettera nedan',
      href: '#personal-details',
      tabularTitle: true,
    },
    {
      Illu: IlluSkrivton,
      eyebrow: 'Skrivton i brev',
      title: tonalityLabel,
      hint: 'Används i dina personliga brev',
      href: '#tonality',
      tabularTitle: false,
    },
    {
      Illu: IlluPlan,
      eyebrow: 'Plan och konto',
      title: isPremium ? 'Premium aktiv' : 'Gratisplan',
      hint: isPremium ? 'Alla funktioner upplåsta' : 'Se vad Premium ger',
      href: '/dashboard/profil/prenumeration',
      tabularTitle: false,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      aria-label="Översikt av din profil"
    >
      <h2 className="text-lg font-semibold text-neutral-900 tracking-tight mb-4">
        Din profil i ett ögonkast
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => {
          const { Illu } = card;
          return (
            <a
              key={card.eyebrow}
              href={card.href}
              className="group bg-white rounded-xl border border-neutral-200 p-4 transition-colors hover:border-neutral-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <div className="flex items-start gap-3">
                <span className="shrink-0 text-neutral-900" aria-hidden="true">
                  <Illu size={40} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-neutral-500 mb-0.5">{card.eyebrow}</div>
                  <div
                    className={`text-sm font-semibold text-neutral-900 leading-snug truncate ${
                      card.tabularTitle ? 'tabular-nums' : ''
                    }`}
                  >
                    {card.title}
                  </div>
                  <div className="text-xs text-neutral-600 truncate mt-0.5">
                    {card.hint}
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </motion.section>
  );
}
