'use client';

import { motion } from 'framer-motion';
import { History, Crown, Clock } from 'lucide-react';
import {
  NumericalCardThumbnail,
  NumericalEmptyIllustration,
} from './illustrations/NumericalIcons';

interface SessionResult {
  id: string;
  score: number | null;
  time_spent: number | null;
  completed_at: string;
}

interface NumericalPreviousResultsProps {
  variant: 'v1' | 'v2' | 'expert';
  sessions: SessionResult[];
  bestScore: number;
  totalQuestions: number;
}

export default function NumericalPreviousResults({
  variant,
  sessions,
  bestScore,
  totalQuestions,
}: NumericalPreviousResultsProps) {
  if (sessions.length === 0) {
    return <EmptyState />;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2, ease: 'easeOut' }}
      className="relative bg-white rounded-3xl border border-orange-200/60 overflow-hidden"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.15)' }}
    >
      <div className="p-5 sm:p-6 md:p-7">
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
              boxShadow: '0 4px 10px -3px rgba(220, 38, 38, 0.35)',
            }}
          >
            <History className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Tidigare resultat
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Dina senaste {Math.min(sessions.length, 5)} försök
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {sessions.slice(0, 5).map((session, index) => (
            <ResultRow
              key={session.id}
              variant={variant}
              session={session}
              isBest={bestScore > 0 && session.score === bestScore}
              totalQuestions={totalQuestions}
              index={index}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function ResultRow({
  variant,
  session,
  isBest,
  totalQuestions,
  index,
}: {
  variant: 'v1' | 'v2' | 'expert';
  session: SessionResult;
  isBest: boolean;
  totalQuestions: number;
  index: number;
}) {
  const score = session.score ?? 0;
  const percentage = Math.min(100, Math.round((score / totalQuestions) * 100));
  const timeSpent = session.time_spent ?? 0;
  const mins = Math.floor(timeSpent / 60);
  const secs = timeSpent % 60;
  const timeLabel = `${mins}:${secs.toString().padStart(2, '0')}`;

  const getPercentColor = () => {
    if (percentage >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (percentage >= 60) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.25 + index * 0.05 }}
      className={`relative flex items-center gap-3 p-3 sm:p-4 rounded-2xl border transition-colors ${
        isBest
          ? 'bg-gradient-to-r from-amber-50 via-orange-50 to-orange-50/50 border-amber-200'
          : 'bg-orange-50/40 border-orange-100/80 hover:bg-orange-50/70'
      }`}
    >
      {isBest && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-md">
          <Crown className="w-3.5 h-3.5 text-white" strokeWidth={2.5} fill="white" />
        </div>
      )}

      <div className="flex-shrink-0">
        <NumericalCardThumbnail variant={variant === 'expert' ? 'v2' : variant} className="w-10 h-7 sm:w-12 sm:h-9" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">
            {score} / {totalQuestions}
          </span>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getPercentColor()} tabular-nums`}
          >
            {percentage}%
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>
            {new Date(session.completed_at).toLocaleDateString('sv-SE', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
          <span className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" strokeWidth={2.5} />
            {timeLabel}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2 }}
      className="bg-white rounded-3xl border border-orange-200/60 p-6 sm:p-8 text-center"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.12)' }}
    >
      <div className="flex justify-center mb-3">
        <NumericalEmptyIllustration className="w-24 h-24 sm:w-28 sm:h-28" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
        Inga resultat än
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
        Dina avklarade test samlas här. Starta första testet ovan så ser du dina poäng utvecklas.
      </p>
    </motion.section>
  );
}
