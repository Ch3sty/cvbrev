'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Play, CheckCircle2, Trophy, FileText, Clock } from 'lucide-react';
import { TestCardThumbnail, type TestType } from './illustrations/TesterHubIcons';
import LevelDots from './LevelDots';
import Sparkline from './Sparkline';
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
  /** Testtyp för ikonen (en ikon per typ). Härleds från variant om utelämnad. */
  type?: TestType;
  title: string;
  categoryLabel: TestCategoryLabel;
  levelLabel: TestLevelLabel;
  questionCount: number;
  timeLabel: string;
  isPremiumLocked: boolean;
  isUserPremium: boolean;
  stats: PerTestStats;
  /** Ditt bästa test totalt — får en subtil accent (ersätter kronan). */
  isBestOverall?: boolean;
  isRecommended?: boolean;
  index?: number;
}

export default function TestCard({
  slug,
  variant,
  type,
  title,
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
  const showBestAccent = isBestOverall && hasProgress;

  const handleClick = (e: React.MouseEvent) => {
    if (showLock) {
      e.preventDefault();
      router.push('/priser');
    }
  };

  const trend = stats.history.map((h) => h.percentage);

  // Topp-strip i nivåns färg (slate/amber/rose) — kommunicerar svårighet utan text.
  const levelStrip =
    levelLabel === 'Expert'
      ? 'linear-gradient(90deg, #FB7185, #E11D48)'
      : levelLabel === 'Avancerad'
      ? 'linear-gradient(90deg, #FBBF24, #F59E0B)'
      : 'linear-gradient(90deg, #CBD5E1, #94A3B8)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 + index * 0.04 }}
    >
      <Link
        href={href}
        onClick={handleClick}
        className={`group relative flex flex-col h-full bg-white rounded-3xl border overflow-hidden transition-all hover:-translate-y-0.5 touch-manipulation ${
          showBestAccent
            ? 'border-amber-300 hover:border-amber-400'
            : 'border-orange-100 hover:border-orange-200'
        }`}
        style={{
          boxShadow: showBestAccent
            ? '0 6px 20px -8px rgba(245, 158, 11, 0.35)'
            : '0 4px 16px -8px rgba(249, 115, 22, 0.18)',
        }}
      >
        {/* Topp-strip i nivåns färg — visar svårighet utan text. */}
        <div className="absolute top-0 inset-x-0 h-1" style={{ background: levelStrip }} />

        <div className="p-3 sm:p-4 flex flex-col h-full">
          {/* Topprad: nivå-dots vänster, status/premium höger */}
          <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3">
            <LevelDots level={levelLabel} showLabel />
            {showLock ? (
              <PremiumPill />
            ) : showBestAccent ? (
              <BestBadge />
            ) : hasProgress ? (
              <DoneBadge />
            ) : isRecommended ? (
              <RecommendedPill />
            ) : null}
          </div>

          {/* Ikon + titel */}
          <div className="flex items-center gap-3 mb-2.5 sm:mb-3">
            <div className="flex-shrink-0">
              <TestCardThumbnail className="w-10 h-10 sm:w-12 sm:h-12" variant={variant} type={type} />
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

          {/* Status-zon: en rad. Stor bästa-% + mini-sparkline om gjort. */}
          {hasProgress && !showLock ? (
            <div className="flex items-center gap-3 mb-2.5 sm:mb-3 rounded-xl bg-orange-50/50 border border-orange-100 px-3 py-1.5 sm:py-2">
              <div className="flex flex-col leading-none">
                <span
                  className="text-2xl font-black tabular-nums leading-none"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #EA580C, #DC2626)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {stats.bestPercentage}%
                </span>
                <span className="text-[10px] text-slate-500 tabular-nums mt-1">
                  {stats.bestScore}/{questionCount} bäst
                </span>
              </div>
              <div className="flex-1 min-w-0">
                {trend.length > 1 ? (
                  <Sparkline values={trend} height={24} />
                ) : (
                  <div className="h-1.5 bg-white/70 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${stats.bestPercentage}%`,
                        background: 'linear-gradient(90deg, #F97316, #DC2626)',
                      }}
                    />
                  </div>
                )}
              </div>
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
                {hasProgress ? 'Gör om testet' : 'Starta testet'}
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

/** Subtil markör för ditt bästa test (ersätter kronan). */
function BestBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.14em] bg-amber-100 text-amber-800 border border-amber-200">
      <Trophy className="w-2.5 h-2.5" strokeWidth={2.5} />
      Ditt bästa
    </span>
  );
}

/** Visar att testet är avklarat. */
function DoneBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.14em] bg-emerald-50 text-emerald-700 border border-emerald-200">
      <CheckCircle2 className="w-2.5 h-2.5" strokeWidth={2.5} />
      Klar
    </span>
  );
}
