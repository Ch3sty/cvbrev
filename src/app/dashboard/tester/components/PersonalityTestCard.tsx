'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Crown, Lock, CheckCircle2 } from 'lucide-react';
import { TestCardThumbnail } from './illustrations/TesterHubIcons';
import { CategoryPill, LevelPill, type TestLevelLabel } from './TestCard';

export type PersonalityCardVariant = 'personality-grund' | 'personality-avancerad';

export interface PersonalityCardStats {
  hasProfile: boolean;
  lastCompletedAt: string | null;
  attempts: number;
}

interface Props {
  slug: 'personlighet-grund' | 'personlighet-avancerad';
  variant: PersonalityCardVariant;
  title: string;
  levelLabel: TestLevelLabel;
  questionCount: number;
  timeLabel: string;
  isPremiumLocked: boolean;
  isUserPremium: boolean;
  stats: PersonalityCardStats;
  index?: number;
}

export default function PersonalityTestCard({
  slug,
  variant,
  title,
  levelLabel,
  questionCount,
  timeLabel,
  isPremiumLocked,
  isUserPremium,
  stats,
  index = 0,
}: Props) {
  const router = useRouter();
  const showLock = isPremiumLocked && !isUserPremium;
  const hasProfile = stats.hasProfile;
  const href = showLock ? '/priser' : `/dashboard/tester/${slug}`;

  const handleClick = (e: React.MouseEvent) => {
    if (showLock) {
      e.preventDefault();
      router.push('/priser');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 + index * 0.04 }}
    >
      <Link
        href={href}
        onClick={handleClick}
        className="group relative block bg-white rounded-3xl border border-orange-100 overflow-hidden transition-all hover:-translate-y-0.5 hover:border-orange-200 touch-manipulation"
        style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.18)' }}
      >
        <div
          className="absolute top-0 inset-x-0 h-0.5"
          style={{
            background: hasProfile
              ? 'linear-gradient(90deg, #FB923C, #DC2626)'
              : 'linear-gradient(90deg, #CBD5E1, #94A3B8)',
          }}
        />

        {hasProfile && (
          <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-md z-10">
            <Crown className="w-4 h-4 text-white" strokeWidth={2.5} fill="white" />
          </div>
        )}

        <div className="p-3 sm:p-4">
          {/* Topp-rad: kategori + level + premium */}
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <CategoryPill label="Personlighet" />
            <LevelPill label={levelLabel} />
            <div className="flex-1" />
            {showLock && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.14em] bg-amber-100 text-amber-800 border border-amber-200">
                <Lock className="w-2.5 h-2.5" strokeWidth={2.5} />
                Premium
              </span>
            )}
          </div>

          {/* Header: ikon + titel */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0">
              <TestCardThumbnail className="w-11 h-11" variant={variant} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight tracking-tight truncate">
                {title}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 leading-tight truncate">
                Vad dina svar säger rekryteraren
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 tabular-nums">
                {questionCount} frågor · {timeLabel} min
              </p>
            </div>
          </div>

          {/* Personlig progress */}
          {hasProfile && !showLock && stats.lastCompletedAt && (
            <div
              className="rounded-xl p-2.5 mb-3 border"
              style={{
                background:
                  'linear-gradient(135deg, rgba(254, 243, 199, 0.4), rgba(254, 215, 170, 0.3))',
                borderColor: '#FED7AA',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" strokeWidth={2.5} />
                  <span className="text-xs font-bold text-slate-900">Profilen är klar</span>
                </div>
                <span className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                  {new Date(stats.lastCompletedAt).toLocaleDateString('sv-SE')}
                </span>
              </div>
              {stats.attempts > 1 && (
                <p className="text-[10px] text-slate-500 mt-1">
                  {stats.attempts} försök
                </p>
              )}
            </div>
          )}

          {/* CTA */}
          <div className="flex items-center justify-between gap-2">
            {showLock ? (
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-700">
                <Lock className="w-3.5 h-3.5" strokeWidth={2.5} />
                Lås upp med Premium
              </span>
            ) : hasProfile ? (
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-orange-700">
                Gör om testet
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-orange-700">
                Starta testet
              </span>
            )}
            <ArrowRight
              className="w-4 h-4 text-orange-700 group-hover:translate-x-0.5 transition-transform"
              strokeWidth={2.5}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
