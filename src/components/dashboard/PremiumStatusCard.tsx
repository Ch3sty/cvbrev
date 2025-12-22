'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Crown,
  Check,
  ArrowRight,
  Sparkles,
  Star,
  Trophy,
  Gift,
  Clock
} from 'lucide-react';

interface PremiumStatusCardProps {
  isPremium: boolean;
  premiumUntil: string | null;
  premiumSource: string | null;
  currentLevel: number;
  levelTitle: string;
}

export default function PremiumStatusCard({
  isPremium,
  premiumUntil,
  premiumSource,
  currentLevel,
  levelTitle
}: PremiumStatusCardProps) {
  // Beräkna premium-typ
  const isTrialUser = premiumSource === 'signup_trial' || premiumSource === 'oauth_signup_trial';
  const isOnboardingReward = premiumSource === 'onboarding_completion';
  const isGuestInvitation = premiumSource === 'guest_invitation';
  const isTemporaryPremium = (isTrialUser || isOnboardingReward || isGuestInvitation) && premiumUntil;

  // Formatera datum
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Beräkna dagar kvar för temporary premium
  const getDaysRemaining = (): number | null => {
    if (!premiumUntil) return null;
    const now = new Date();
    const until = new Date(premiumUntil);
    const diff = until.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const daysRemaining = getDaysRemaining();

  // Premium-fördelar
  const premiumBenefits = [
    'Obegränsade personliga brev',
    'Obegränsade CV-analyser',
    'LinkedIn-optimering utan begränsning',
    'Prioriterad support'
  ];

  // Free-fördelar
  const freeBenefits = [
    '7 personliga brev/vecka',
    '1 CV-analys/vecka',
    '1 LinkedIn-optimering/vecka',
    'Grundläggande funktioner'
  ];

  if (isPremium) {
    return (
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-xl sm:rounded-2xl border-2 border-amber-200 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden h-full">
        {/* Bakgrundsdekor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-200/30 to-amber-200/30 rounded-full translate-y-8 -translate-x-8" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Premium</h2>
                {isTemporaryPremium && (
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-medium rounded-full">
                    {isTrialUser ? 'Provperiod' : isOnboardingReward ? 'Belöning' : 'Gäst'}
                  </span>
                )}
              </div>
              <p className="text-sm text-amber-700 font-medium">
                {isTemporaryPremium ? (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {daysRemaining} {daysRemaining === 1 ? 'dag' : 'dagar'} kvar
                  </span>
                ) : (
                  'Aktiv prenumeration'
                )}
              </p>
            </div>
          </div>

          {/* Level Badge */}
          <div className="flex items-center gap-2 mb-4 p-3 bg-white/60 rounded-xl border border-amber-100">
            <Trophy className="w-5 h-5 text-amber-600" />
            <div>
              <span className="text-sm font-bold text-slate-900">Level {currentLevel}</span>
              <span className="text-slate-500 text-sm"> - {levelTitle}</span>
            </div>
          </div>

          {/* Benefits List */}
          <ul className="space-y-2 mb-4">
            {premiumBenefits.map((benefit, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="flex items-center gap-2 text-sm text-slate-700"
              >
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                {benefit}
              </motion.li>
            ))}
          </ul>

          {/* CTA */}
          <Link
            href="/dashboard/profil/prenumeration"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white hover:bg-amber-50 border border-amber-200 text-amber-700 font-medium rounded-xl transition-colors text-sm touch-manipulation"
          >
            {isTemporaryPremium ? 'Uppgradera till fullständig' : 'Hantera prenumeration'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Free User Card
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden h-full">
      {/* Bakgrundsdekor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-100/50 to-purple-100/50 rounded-full -translate-y-12 translate-x-12" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 shadow-lg">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Gratis</h2>
            <p className="text-sm text-slate-500">Grundläggande funktioner</p>
          </div>
        </div>

        {/* Level Badge */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <Trophy className="w-5 h-5 text-slate-400" />
          <div>
            <span className="text-sm font-bold text-slate-900">Level {currentLevel}</span>
            <span className="text-slate-500 text-sm"> - {levelTitle}</span>
          </div>
        </div>

        {/* Current Limits */}
        <ul className="space-y-2 mb-4">
          {freeBenefits.map((benefit, index) => (
            <li
              key={index}
              className="flex items-center gap-2 text-sm text-slate-600"
            >
              <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex-shrink-0" />
              {benefit}
            </li>
          ))}
        </ul>

        {/* Upgrade CTA */}
        <Link
          href="/priser"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all text-sm touch-manipulation"
        >
          <Sparkles className="w-4 h-4" />
          Uppgradera till Premium
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
