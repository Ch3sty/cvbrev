'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronDown,
  Crown,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { TestCardThumbnail } from './illustrations/TesterHubIcons';
import { CategoryPill, LevelPill } from './TestCard';
import Sparkline from './Sparkline';
import type { CognitiveTestDef } from './testCatalog';
import type { PerTestStats } from '@/hooks/use-all-test-stats';

interface Props {
  def: CognitiveTestDef;
  stats: PerTestStats;
  index: number;
}

function trend(history: PerTestStats['history']): { delta: number; kind: 'up' | 'down' | 'flat' } {
  if (history.length < 2) return { delta: 0, kind: 'flat' };
  const latest = history[history.length - 1].percentage;
  const prior = history.slice(0, -1);
  const priorAvg = Math.round(prior.reduce((a, h) => a + h.percentage, 0) / prior.length);
  const delta = latest - priorAvg;
  return { delta, kind: delta > 1 ? 'up' : delta < -1 ? 'down' : 'flat' };
}

export default function TestProgressCard({ def, stats, index }: Props) {
  const [expanded, setExpanded] = useState(false);

  const latest = stats.history[stats.history.length - 1];
  const latestPct = latest?.percentage ?? 0;
  const { delta, kind } = trend(stats.history);
  const totalMinutes = Math.round(stats.totalTimeSeconds / 60);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 + index * 0.05 }}
      className="relative bg-white rounded-3xl border border-orange-100 overflow-hidden"
      style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
    >
      <div
        className="absolute top-0 inset-x-0 h-0.5"
        style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626)' }}
      />

      <div className="p-4 sm:p-5">
        {/* Rubrik-rad */}
        <div className="flex items-center gap-3 mb-3">
          <TestCardThumbnail className="w-10 h-10 flex-shrink-0" variant={def.variant} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
              <CategoryPill label={def.categoryLabel} />
              <LevelPill label={def.levelLabel} />
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-tight truncate">
              {def.title}
            </h3>
          </div>
        </div>

        {/* Nyckeltal */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <Metric
            label="Senaste"
            value={`${latest?.score ?? 0}/${def.questionCount}`}
            sub={`${latestPct}%`}
          />
          <Metric
            label="Bästa"
            value={`${stats.bestScore}/${def.questionCount}`}
            sub={`${stats.bestPercentage}%`}
            highlight
          />
          <Metric
            label="Försök"
            value={`${stats.attempts}`}
            sub={totalMinutes > 0 ? `${totalMinutes} min` : '—'}
          />
        </div>

        {/* Sparkline + trend */}
        <div className="rounded-2xl border border-orange-100/80 bg-orange-50/30 p-3 mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Utveckling
            </span>
            <TrendBadge delta={delta} kind={kind} singleAttempt={stats.attempts < 2} />
          </div>
          <Sparkline values={stats.history.map((h) => h.percentage)} height={48} />
        </div>

        {/* Expandera full historik */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between gap-2 text-xs font-bold text-orange-700 py-1 touch-manipulation"
        >
          {expanded ? 'Dölj försök' : `Visa alla ${stats.attempts} försök`}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
            strokeWidth={2.5}
          />
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="space-y-1.5 pt-2">
                {[...stats.history].reverse().map((h, i) => (
                  <HistoryRow
                    key={`${h.completedAt}-${i}`}
                    attempt={h}
                    questionCount={def.questionCount}
                    isBest={h.score === stats.bestScore && stats.bestScore > 0}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <div className="mt-3 pt-3 border-t border-orange-100/70">
          <Link
            href={`/dashboard/tester/${def.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 hover:gap-2 transition-all"
          >
            Gör om testet
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function Metric({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-2 text-center border ${
        highlight ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50/70 border-slate-100'
      }`}
    >
      <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
        {label}
      </div>
      <div className="text-sm font-bold text-slate-900 tabular-nums leading-none">{value}</div>
      <div
        className={`text-[10px] font-bold tabular-nums mt-0.5 ${
          highlight ? 'text-emerald-700' : 'text-slate-500'
        }`}
      >
        {sub}
      </div>
    </div>
  );
}

function TrendBadge({
  delta,
  kind,
  singleAttempt,
}: {
  delta: number;
  kind: 'up' | 'down' | 'flat';
  singleAttempt: boolean;
}) {
  if (singleAttempt) {
    return <span className="text-[10px] font-medium text-slate-400">Första försöket</span>;
  }
  const cfg = {
    up: { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', Icon: TrendingUp, sign: '+' },
    down: { cls: 'bg-slate-100 text-slate-600 border-slate-200', Icon: TrendingDown, sign: '' },
    flat: { cls: 'bg-slate-100 text-slate-500 border-slate-200', Icon: Minus, sign: '' },
  }[kind];
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums border ${cfg.cls}`}
    >
      <cfg.Icon className="w-3 h-3" strokeWidth={2.5} />
      {kind === 'flat' ? 'Jämnt' : `${cfg.sign}${delta} p.e.`}
    </span>
  );
}

function HistoryRow({
  attempt,
  questionCount,
  isBest,
}: {
  attempt: PerTestStats['history'][number];
  questionCount: number;
  isBest: boolean;
}) {
  const mins = Math.floor(attempt.timeSpent / 60);
  const secs = attempt.timeSpent % 60;
  const timeLabel = `${mins}:${secs.toString().padStart(2, '0')}`;
  const pctColor =
    attempt.percentage >= 80
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : attempt.percentage >= 60
      ? 'bg-orange-100 text-orange-700 border-orange-200'
      : 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <div
      className={`relative flex items-center justify-between gap-2 px-3 py-2 rounded-xl border ${
        isBest ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50/60 border-slate-100'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {isBest && <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" strokeWidth={2.5} fill="currentColor" />}
        <span className="text-sm font-bold text-slate-900 tabular-nums">
          {attempt.score}/{questionCount}
        </span>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border tabular-nums ${pctColor}`}>
          {attempt.percentage}%
        </span>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-shrink-0">
        <span>
          {new Date(attempt.completedAt).toLocaleDateString('sv-SE', {
            day: 'numeric',
            month: 'short',
          })}
        </span>
        <span className="text-slate-300">·</span>
        <span className="inline-flex items-center gap-1 tabular-nums">
          <Clock className="w-3 h-3" strokeWidth={2.5} />
          {timeLabel}
        </span>
      </div>
    </div>
  );
}
