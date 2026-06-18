'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Crown, Lock, CheckCircle2 } from 'lucide-react';
import { TestCardThumbnail } from './illustrations/TesterHubIcons';
import type { PerTestStats, TestSlug } from '@/hooks/use-all-test-stats';

export type TestCardVariant =
  | 'matrix-grund'
  | 'matrix-avancerad'
  | 'matrix-expert'
  | 'verbal-v1'
  | 'verbal-v2'
  | 'numerical-v1'
  | 'numerical-v2';

export type TestCategoryLabel = 'Logik' | 'Språk' | 'Siffror' | 'Personlighet';
export type TestLevelLabel = 'Grund' | 'Avancerad' | 'Expert';

interface TestCardProps {
  slug: TestSlug;
  variant: TestCardVariant;
  title: string;
  /** Metod/undertext, t.ex. "Mönsterigenkänning · matriser". */
  method?: string;
  categoryLabel: TestCategoryLabel;
  levelLabel: TestLevelLabel;
  questionCount: number;
  timeLabel: string;
  isPremiumLocked: boolean;
  isUserPremium: boolean;
  stats: PerTestStats;
  isBestOverall?: boolean;
  isRecommended?: boolean;
  index?: number;
}

export default function TestCard({
  slug,
  variant,
  title,
  method,
  categoryLabel,
  levelLabel,
  questionCount,
  timeLabel,
  isPremiumLocked,
  isUserPremium,
  stats,
  isBestOverall,
  isRecommended,
  index = 0,
}: TestCardProps) {
  const router = useRouter();
  const showLock = isPremiumLocked && !isUserPremium;
  const hasProgress = stats.attempts > 0;
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
      className="relative"
    >
      {/* Best overall crown – ligger utanför Link (som har overflow-hidden) så den inte klipps av de rundade hörnen */}
      {isBestOverall && hasProgress && (
        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-md z-20 pointer-events-none">
          <Crown className="w-4 h-4 text-white" strokeWidth={2.5} fill="white" />
        </div>
      )}

      <Link
        href={href}
        onClick={handleClick}
        className="group relative block bg-white rounded-3xl border border-orange-100 overflow-hidden transition-all hover:-translate-y-0.5 hover:border-orange-200 touch-manipulation"
        style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.18)' }}
      >
        {/* Gradient-strip topp */}
        <div
          className="absolute top-0 inset-x-0 h-0.5"
          style={{
            background: hasProgress
              ? 'linear-gradient(90deg, #FB923C, #DC2626)'
              : 'linear-gradient(90deg, #CBD5E1, #94A3B8)',
          }}
        />

        <div className="p-3 sm:p-4">
          {/* Topp-rad: kategori + level + premium */}
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <CategoryPill label={categoryLabel} />
            <LevelPill label={levelLabel} />
            <div className="flex-1" />
            {showLock && <PremiumPill />}
            {isRecommended && !showLock && !hasProgress && <RecommendedPill />}
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
              {method && (
                <p className="text-[10px] sm:text-[11px] text-slate-400 leading-tight truncate">
                  {method}
                </p>
              )}
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 tabular-nums">
                {questionCount} frågor · {timeLabel} min
              </p>
            </div>
          </div>

          {/* Personlig progress (kompakt) */}
          {hasProgress && !showLock && (
            <div
              className="rounded-xl p-2.5 mb-3 border"
              style={{
                background:
                  'linear-gradient(135deg, rgba(254, 243, 199, 0.4), rgba(254, 215, 170, 0.3))',
                borderColor: '#FED7AA',
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" strokeWidth={2.5} />
                  <span className="text-xs">
                    <span className="font-bold text-slate-900 tabular-nums">
                      {stats.bestScore} / {questionCount}
                    </span>
                    <span className="text-slate-600"> bäst</span>
                  </span>
                </div>
                <span className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                  {stats.bestPercentage}%
                </span>
              </div>
              <div className="h-1 bg-white/60 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${stats.bestPercentage}%`,
                    background: 'linear-gradient(90deg, #F97316, #DC2626)',
                  }}
                />
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex items-center justify-between gap-2">
            {showLock ? (
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-700">
                <Lock className="w-3.5 h-3.5" strokeWidth={2.5} />
                Lås upp med Premium
              </span>
            ) : hasProgress ? (
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

export function CategoryPill({ label }: { label: TestCategoryLabel }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.14em] bg-orange-50 text-orange-700 border border-orange-100">
      {label}
    </span>
  );
}

export function LevelPill({ label }: { label: TestLevelLabel }) {
  const cls =
    label === 'Expert'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : label === 'Avancerad'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-slate-50 text-slate-600 border-slate-200';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.14em] border ${cls}`}
    >
      {label}
    </span>
  );
}

function PremiumPill() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.14em] bg-amber-100 text-amber-800 border border-amber-200">
      <Lock className="w-2.5 h-2.5" strokeWidth={2.5} />
      Premium
    </span>
  );
}

function RecommendedPill() {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.14em] text-white"
      style={{
        background: 'linear-gradient(135deg, #F97316, #DC2626)',
        boxShadow: '0 4px 10px -3px rgba(220, 38, 38, 0.35)',
      }}
    >
      Rekommenderas
    </span>
  );
}
