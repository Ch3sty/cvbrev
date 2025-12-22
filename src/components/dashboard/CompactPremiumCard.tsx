'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown, ArrowRight, Clock, Check } from 'lucide-react';

interface CompactPremiumCardProps {
  premiumUntil: string | null;
  premiumSource: string | null;
}

export default function CompactPremiumCard({
  premiumUntil,
  premiumSource
}: CompactPremiumCardProps) {
  // Beräkna premium-typ
  const isTrialUser = premiumSource === 'signup_trial' || premiumSource === 'oauth_signup_trial';
  const isOnboardingReward = premiumSource === 'onboarding_completion';
  const isGuestInvitation = premiumSource === 'guest_invitation';
  const isTemporaryPremium = (isTrialUser || isOnboardingReward || isGuestInvitation) && premiumUntil;

  // Beräkna dagar kvar för temporary premium
  const getDaysRemaining = (): number | null => {
    if (!premiumUntil) return null;
    const now = new Date();
    const until = new Date(premiumUntil);
    const diff = until.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const daysRemaining = getDaysRemaining();

  // Visa typ av premium
  const getPremiumLabel = () => {
    if (isTrialUser) return 'Provperiod';
    if (isOnboardingReward) return 'Belöning';
    if (isGuestInvitation) return 'Gästinbjudan';
    return 'Aktiv';
  };

  return (
    <Link href="/dashboard/profil/prenumeration" className="block group">
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-xl sm:rounded-2xl border border-amber-200 p-4 sm:p-5 shadow-lg hover:shadow-xl transition-all h-full relative overflow-hidden"
      >
        {/* Bakgrundsdekor */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full -translate-y-8 translate-x-8" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-md">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Premium</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
          </div>

          {/* Status */}
          <div className="mb-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">{getPremiumLabel()}</span>
          </div>

          {/* Subtext */}
          {isTemporaryPremium && daysRemaining !== null ? (
            <div className="flex items-center gap-1.5 text-sm text-amber-700">
              <Clock className="w-4 h-4" />
              <span>{daysRemaining} {daysRemaining === 1 ? 'dag' : 'dagar'} kvar</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-sm text-emerald-600">
              <Check className="w-4 h-4" />
              <span>Ingen bindningstid</span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
