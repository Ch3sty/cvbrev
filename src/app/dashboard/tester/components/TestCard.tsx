'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Crown, Lock, Target, Clock, Layers, CheckCircle2 } from 'lucide-react';
import { TestCardThumbnail } from './illustrations/TesterHubIcons';
import type { PerTestStats, TestSlug } from '@/hooks/use-all-test-stats';

export type TestCardVariant =
  | 'matrix-grund'
  | 'matrix-avancerad'
  | 'verbal-v1'
  | 'verbal-v2'
  | 'numerical-v1'
  | 'numerical-v2';

interface TestCardProps {
  slug: TestSlug;
  variant: TestCardVariant;
  title: string;
  description: string;
  questionCount: number;
  timeLabel: string;
  difficultyLabel: string;
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
  description,
  questionCount,
  timeLabel,
  difficultyLabel,
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
      transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
    >
      <Link
        href={href}
        onClick={handleClick}
        className="group relative block bg-white rounded-3xl border border-orange-100 overflow-hidden transition-all hover:-translate-y-0.5 hover:border-orange-200 touch-manipulation"
        style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.18)' }}
      >
        {/* Gradient-strip topp — orange/röd om besökt, grå annars */}
        <div
          className="absolute top-0 inset-x-0 h-0.5"
          style={{
            background: hasProgress
              ? 'linear-gradient(90deg, #FB923C, #DC2626)'
              : 'linear-gradient(90deg, #CBD5E1, #94A3B8)',
          }}
        />

        {/* Best overall crown */}
        {isBestOverall && hasProgress && (
          <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-md z-10">
            <Crown className="w-4 h-4 text-white" strokeWidth={2.5} fill="white" />
          </div>
        )}

        {/* Recommended-pill */}
        {isRecommended && !showLock && !hasProgress && (
          <div
            className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.12em] text-white z-10"
            style={{
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
              boxShadow: '0 4px 10px -3px rgba(220, 38, 38, 0.35)',
            }}
          >
            Rekommenderas
          </div>
        )}

        {/* Premium lock-pill */}
        {showLock && (
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.12em] bg-amber-100 text-amber-800 border border-amber-200 z-10">
            <Lock className="w-3 h-3" strokeWidth={2.5} />
            Premium
          </div>
        )}

        <div className="p-4 sm:p-5">
          {/* Header: ikon + titel */}
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0">
              <TestCardThumbnail
                className="w-12 h-12"
                variant={variant}
              />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight tracking-tight">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-snug">
                {description}
              </p>
            </div>
          </div>

          {/* Stat-rad */}
          <div className="flex items-center gap-3 mb-3 py-2 border-y border-orange-100/80">
            <CardStat
              icon={<Target className="w-3 h-3" strokeWidth={2.5} />}
              label={`${questionCount}`}
              sub="frågor"
            />
            <Divider />
            <CardStat
              icon={<Clock className="w-3 h-3" strokeWidth={2.5} />}
              label={timeLabel}
              sub="minuter"
            />
            <Divider />
            <CardStat
              icon={<Layers className="w-3 h-3" strokeWidth={2.5} />}
              label={difficultyLabel}
              sub="nivåer"
            />
          </div>

          {/* Personlig progress */}
          {hasProgress && !showLock && (
            <div
              className="rounded-2xl p-3 mb-3 border"
              style={{
                background:
                  'linear-gradient(135deg, rgba(254, 243, 199, 0.4), rgba(254, 215, 170, 0.3))',
                borderColor: '#FED7AA',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" strokeWidth={2.5} />
                  <span className="text-xs sm:text-sm">
                    <span className="font-bold text-slate-900 tabular-nums">
                      {stats.bestScore} / {questionCount}
                    </span>
                    <span className="text-slate-600"> bäst</span>
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs font-bold tabular-nums px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                  {stats.bestPercentage}%
                </span>
              </div>
              {/* Progress-bar */}
              <div className="mt-2 h-1 bg-white/60 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${stats.bestPercentage}%`,
                    background: 'linear-gradient(90deg, #F97316, #DC2626)',
                  }}
                />
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1.5">
                {stats.attempts} {stats.attempts === 1 ? 'försök' : 'försök'}
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="flex items-center justify-between gap-2 mt-1">
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

function CardStat({
  icon,
  label,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-slate-500">
        <span className="text-orange-600">{icon}</span>
        <span>{sub}</span>
      </div>
      <div className="text-sm font-bold text-slate-900 tabular-nums truncate">{label}</div>
    </div>
  );
}

function Divider() {
  return <span className="w-px self-stretch bg-orange-100" />;
}
