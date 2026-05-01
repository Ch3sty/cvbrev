'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check, UserCircle, Mail, Crown } from 'lucide-react';

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

  const cards = [
    {
      icon: <UserCircle className="w-5 h-5" strokeWidth={2} />,
      eyebrow: 'Personliga uppgifter',
      title: `${filledFields} av ${totalFields} ifyllda`,
      hint: filledFields === totalFields ? 'Allt på plats' : 'Komplettera nedan',
      anchor: '#personal-details',
      tone: 'orange' as const,
    },
    {
      icon: <Mail className="w-5 h-5" strokeWidth={2} />,
      eyebrow: 'Skrivton i brev',
      title: tonalityLabel,
      hint: 'Används i dina personliga brev',
      anchor: '#tonality',
      tone: 'orange' as const,
    },
    {
      icon: <Crown className="w-5 h-5" strokeWidth={2} />,
      eyebrow: 'Plan & konto',
      title: isPremium ? 'Premium aktiv' : 'Gratisplan',
      hint: isPremium ? 'Alla funktioner upplåsta' : 'Lås upp Premium',
      anchor: '#account',
      tone: isPremium ? ('emerald' as const) : ('orange' as const),
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl bg-white p-5 sm:p-6"
      style={{
        border: '1px solid rgba(249, 115, 22, 0.18)',
        boxShadow: '0 8px 32px -16px rgba(249, 115, 22, 0.18)',
      }}
      aria-label="Översikt av din profil"
    >
      {/* Subtilt prick-pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
        aria-hidden="true"
      >
        <pattern
          id="overview-dots"
          x="0"
          y="0"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="12" cy="12" r="1" fill="#FB923C" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#overview-dots)" />
      </svg>

      <div className="relative">
        <div className="mb-4 sm:mb-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700">
            Översikt
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
            Din profil i ett ögonkast
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {cards.map((card) => (
            <a
              key={card.eyebrow}
              href={card.anchor}
              className="group relative rounded-2xl p-4 transition-all hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              style={{
                background:
                  'linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(220, 38, 38, 0.03) 100%)',
                border: '1px solid rgba(249, 115, 22, 0.2)',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{
                    background:
                      card.tone === 'emerald'
                        ? 'linear-gradient(135deg, #10B981, #059669)'
                        : 'linear-gradient(135deg, #F97316, #DC2626)',
                    boxShadow:
                      card.tone === 'emerald'
                        ? '0 6px 14px -6px rgba(16, 185, 129, 0.4)'
                        : '0 6px 14px -6px rgba(220, 38, 38, 0.4)',
                  }}
                >
                  {card.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-700 mb-0.5">
                    {card.eyebrow}
                  </div>
                  <div className="text-sm font-bold text-slate-900 leading-tight mb-1 truncate">
                    {card.title}
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      card.tone === 'emerald' ? 'text-emerald-700' : 'text-slate-600'
                    }`}
                  >
                    {card.tone === 'emerald' ? (
                      <Check className="w-3 h-3 flex-shrink-0" strokeWidth={3} />
                    ) : null}
                    <span className="truncate">{card.hint}</span>
                  </div>
                </div>
                <ArrowRight
                  className="w-4 h-4 text-orange-500 flex-shrink-0 mt-1 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2.25}
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
