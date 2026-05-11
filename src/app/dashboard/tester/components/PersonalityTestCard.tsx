'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Crown, Lock, Target, Clock, Layers, CheckCircle2 } from 'lucide-react';
import { TestCardThumbnail } from './illustrations/TesterHubIcons';

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
  description: string;
  questionCount: number;
  timeLabel: string;
  extraLabel: string;
  isPremiumLocked: boolean;
  isUserPremium: boolean;
  stats: PersonalityCardStats;
  index?: number;
}

export default function PersonalityTestCard({
  slug,
  variant,
  title,
  description,
  questionCount,
  timeLabel,
  extraLabel,
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
      transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
    >
      <Link
        href={href}
        onClick={handleClick}
        className="group relative block bg-white rounded-3xl border border-indigo-100 overflow-hidden transition-all hover:-translate-y-0.5 hover:border-indigo-200 touch-manipulation"
        style={{ boxShadow: '0 4px 16px -8px rgba(99, 102, 241, 0.18)' }}
      >
        <div
          className="absolute top-0 inset-x-0 h-0.5"
          style={{
            background: hasProfile
              ? 'linear-gradient(90deg, #6366F1, #8B5CF6, #EC4899)'
              : 'linear-gradient(90deg, #CBD5E1, #94A3B8)',
          }}
        />

        {hasProfile && (
          <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-md z-10">
            <Crown className="w-4 h-4 text-white" strokeWidth={2.5} fill="white" />
          </div>
        )}

        {showLock && (
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.12em] bg-amber-100 text-amber-800 border border-amber-200 z-10">
            <Lock className="w-3 h-3" strokeWidth={2.5} />
            Premium
          </div>
        )}

        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0">
              <TestCardThumbnail className="w-12 h-12" variant={variant} />
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

          <div className="flex items-center gap-3 mb-3 py-2 border-y border-indigo-100/80">
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
              label={extraLabel}
              sub="dimensioner"
            />
          </div>

          {hasProfile && !showLock && stats.lastCompletedAt && (
            <div
              className="rounded-2xl p-3 mb-3 border"
              style={{
                background:
                  'linear-gradient(135deg, rgba(224, 231, 255, 0.5), rgba(243, 232, 255, 0.4))',
                borderColor: '#C7D2FE',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" strokeWidth={2.5} />
                  <span className="text-xs sm:text-sm">
                    <span className="font-bold text-slate-900">
                      Profilen är klar
                    </span>
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs font-bold tabular-nums px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                  {new Date(stats.lastCompletedAt).toLocaleDateString('sv-SE')}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1.5">
                {stats.attempts} {stats.attempts === 1 ? 'gjort försök' : 'gjorda försök'}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 mt-1">
            {showLock ? (
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-700">
                <Lock className="w-3.5 h-3.5" strokeWidth={2.5} />
                Lås upp med Premium
              </span>
            ) : hasProfile ? (
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-indigo-700">
                Gör om testet
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-indigo-700">
                Starta testet
              </span>
            )}
            <ArrowRight
              className="w-4 h-4 text-indigo-700 group-hover:translate-x-0.5 transition-transform"
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
        <span className="text-indigo-600">{icon}</span>
        <span>{sub}</span>
      </div>
      <div className="text-sm font-bold text-slate-900 tabular-nums truncate">{label}</div>
    </div>
  );
}

function Divider() {
  return <span className="w-px self-stretch bg-indigo-100" />;
}
