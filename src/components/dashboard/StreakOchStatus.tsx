'use client';

/**
 * StreakOchStatus
 * ---------------
 * Kvot- och premiumöversikt: faktainfo, inte en säljyta.
 *
 * Streaken flyttade till DashboardStatusRow som en siffra bland de andra
 * (docs/plan-konvertering.md, B4), och den firande helskärmsvarianten är
 * borttagen. Kvar står bara den ljusa statuswidgeten.
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Crown, Check, ArrowRight } from 'lucide-react';
import InfoPopover from '@/components/ui/InfoPopover';

const FREE_LIMITS = { letters: 7, analyses: 1, linkedin: 1 };

interface StreakOchStatusProps {
  dailyStreak: number;
  longestStreak: number;
  dailyXpEarned: number;
  currentLevel: number;
  levelTitle: string;
  /** Senaste 28 dagarnas XP; de sista 7 driver momentum-remsan. */
  dailyXp: { date: string; xp: number }[];
  isPremium: boolean;
  weeklyLetterCount: number;
  weeklyAnalysisCount: number;
  weeklyLinkedInCount: number;
  letterResetDate?: Date;
  premiumUntil?: string | null;
  premiumSource?: string | null;
}

/**
 * Streaken bor numera som en siffra i DashboardStatusRow (B4). Den firande
 * helskärmsvarianten är borttagen. Kvar står kvot- och premiumöversikten.
 */
export default function StreakOchStatus(props: StreakOchStatusProps) {
  return <DinStatusWidget {...props} />;
}

// =============================================================
// Din status: kvoter eller premium, faktabaserad widget
// =============================================================

function DinStatusWidget({
  isPremium,
  weeklyLetterCount,
  weeklyAnalysisCount,
  weeklyLinkedInCount,
  letterResetDate,
  premiumUntil,
  premiumSource,
}: StreakOchStatusProps) {
  const isTrialUser =
    premiumSource === 'signup_trial' ||
    premiumSource === 'oauth_signup_trial' ||
    premiumSource === 'onboarding_completion' ||
    premiumSource === 'guest_invitation';
  const daysRemaining = getDaysRemaining(premiumUntil);

  const rows = [
    { label: 'Brev', used: weeklyLetterCount, limit: FREE_LIMITS.letters },
    { label: 'CV-analys', used: weeklyAnalysisCount, limit: FREE_LIMITS.analyses },
    { label: 'LinkedIn', used: weeklyLinkedInCount, limit: FREE_LIMITS.linkedin },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="bg-white rounded-3xl border border-orange-100 p-4 sm:p-5 flex flex-col"
      style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.12)' }}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center text-[10px] font-black uppercase tracking-[0.18em] text-orange-700">
          <span>Din status</span>
          <InfoPopover title="Din status">
            {isPremium ? (
              <p>
                Med Premium har du obegränsad tillgång till personliga brev,
                CV-analys och LinkedIn-optimering. Här ser du när perioden
                förnyas eller löper ut.
              </p>
            ) : (
              <p>
                Så mycket har du kvar av veckans gratiskvot. Den nollställs
                varje vecka, och med Premium slipper du taket helt.
              </p>
            )}
          </InfoPopover>
        </div>
        {isPremium && (
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
            <Crown className="w-3 h-3" strokeWidth={2.5} />
            Premium
          </span>
        )}
      </div>

      {isPremium ? (
        <>
          <div className="flex-1 space-y-2">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-slate-700">{row.label}</span>
                <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  Obegränsat
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11.5px] text-slate-500">
            {isTrialUser && daysRemaining !== null
              ? `${daysRemaining} ${daysRemaining === 1 ? 'dag' : 'dagar'} kvar av provperioden`
              : premiumUntil
                ? `Förnyas ${formatDate(premiumUntil)}`
                : 'Obegränsad åtkomst'}
            {isTrialUser && (
              <>
                {' · '}
                <Link
                  href="/dashboard/profil/prenumeration"
                  className="font-bold text-orange-700 hover:text-orange-800"
                >
                  Hantera
                </Link>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 space-y-2.5">
            {rows.map((row) => {
              const pct =
                row.limit === 0 ? 0 : Math.min(100, Math.round((row.used / row.limit) * 100));
              return (
                <div key={row.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-bold text-slate-700">{row.label}</span>
                    <span className="text-[11.5px] font-black text-slate-500 tabular-nums">
                      {row.used}
                      <span className="text-slate-400">/{row.limit}</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-orange-50 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: 'var(--jc-gradient-warm)' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-400">
              {letterResetDate ? `Nollställs ${relativeDateLabel(letterResetDate)}` : 'Veckans gratiskvot'}
            </span>
            <Link
              href="/dashboard/profil/prenumeration"
              className="group inline-flex items-center gap-1 text-[12px] font-black text-orange-700 hover:text-orange-800"
            >
              Lås upp obegränsat
              <ArrowRight
                className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                strokeWidth={2.5}
              />
            </Link>
          </div>
        </>
      )}
    </motion.div>
  );
}

function getDaysRemaining(premiumUntil?: string | null): number | null {
  if (!premiumUntil) return null;
  const diff = new Date(premiumUntil).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}

function relativeDateLabel(date: Date): string {
  const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'idag';
  if (days === 1) return 'imorgon';
  if (days < 7) return `om ${days} dagar`;
  return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}
