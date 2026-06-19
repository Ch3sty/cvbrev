'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Play, CheckCircle2, FileText, Clock } from 'lucide-react';
import { TestCardThumbnail } from './illustrations/TesterHubIcons';
import LevelDots from './LevelDots';
import type { TestLevelLabel } from './TestCard';

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
        className="group relative flex flex-col h-full bg-white rounded-3xl border border-orange-100 overflow-hidden transition-all hover:-translate-y-0.5 hover:border-orange-200 touch-manipulation"
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

        <div className="p-4 flex flex-col h-full">
          {/* Topprad: nivå-dots + status/premium */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <LevelDots level={levelLabel} showLabel />
            {showLock ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.14em] bg-amber-100 text-amber-800 border border-amber-200">
                <Lock className="w-2.5 h-2.5" strokeWidth={2.5} />
                Premium
              </span>
            ) : hasProfile ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.14em] bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-2.5 h-2.5" strokeWidth={2.5} />
                Klar
              </span>
            ) : null}
          </div>

          {/* Ikon + titel */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0">
              <TestCardThumbnail className="w-12 h-12" variant={variant} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight tracking-tight">
                {title}
              </h3>
              <div className="flex items-center gap-2.5 mt-1 text-[11px] text-slate-500 tabular-nums">
                <span className="inline-flex items-center gap-1">
                  <FileText className="w-3 h-3" strokeWidth={2.5} />
                  {questionCount}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" strokeWidth={2.5} />
                  {timeLabel} min
                </span>
              </div>
            </div>
          </div>

          {/* Status-rad om profil finns */}
          {hasProfile && !showLock && stats.lastCompletedAt ? (
            <div className="flex items-center justify-between gap-2 mb-3 rounded-xl bg-orange-50/50 border border-orange-100 px-3 py-2">
              <span className="text-xs font-bold text-slate-900">Profilen är klar</span>
              <span className="text-[10px] font-bold tabular-nums text-slate-500">
                {new Date(stats.lastCompletedAt).toLocaleDateString('sv-SE')}
              </span>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* CTA */}
          <div className="flex items-center justify-between gap-2 mt-auto">
            {showLock ? (
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-700">
                <Lock className="w-3.5 h-3.5" strokeWidth={2.5} />
                Lås upp med Premium
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-orange-700">
                <Play className="w-3.5 h-3.5" strokeWidth={2.5} fill="currentColor" />
                {hasProfile ? 'Gör om testet' : 'Starta testet'}
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
