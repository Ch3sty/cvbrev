'use client';

/**
 * Ett tests utveckling: panel med testets rad, tre tal, sparkline och en
 * utfällbar lista över alla försök. Inget rörelsebibliotek: listan renderas
 * direkt när den fälls ut.
 */

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import TestLevelBadge from '@/components/tests/shared/TestLevelBadge';
import { getTestConfig } from '../testConfig';
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

export default function TestProgressCard({ def, stats }: Props) {
  const cfg = getTestConfig(def.slug);
  const [expanded, setExpanded] = useState(false);

  const latest = stats.history[stats.history.length - 1];
  const latestPct = latest?.percentage ?? 0;
  const { delta, kind } = trend(stats.history);
  const totalMinutes = Math.round(stats.totalTimeSeconds / 60);
  const listId = `forsok-${def.slug}`;

  return (
    <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
      {/* Testets rad */}
      <div className="flex items-center gap-3">
        {cfg ? <TestLevelBadge kind={cfg.kind} level={cfg.level} iconOnly /> : null}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-kort text-ink-1">
            {def.title}, {def.levelLabel.toLowerCase()}
          </h3>
          <p className="text-meta text-ink-3">
            <TrendText delta={delta} kind={kind} singleAttempt={stats.attempts < 2} />
          </p>
        </div>
      </div>

      {/* Tre tal */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <Metric value={`${latestPct} %`} label={`Senaste, ${latest?.score ?? 0} av ${def.questionCount}`} />
        <Metric value={`${stats.bestPercentage} %`} label={`Bästa, ${stats.bestScore} av ${def.questionCount}`} />
        <Metric value={`${stats.attempts}`} label={`Försök, ${totalMinutes} min`} />
      </div>

      {/* Utvecklingen över tid */}
      <div className="mt-4">
        <Sparkline values={stats.history.map((h) => h.percentage)} height={48} />
      </div>

      {/* Alla försök */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={listId}
        className="mt-2 flex min-h-11 w-full items-center justify-between gap-2 text-sm font-medium text-ink-2 hover:text-ink-1"
      >
        {expanded ? 'Dölj försöken' : `Visa alla ${stats.attempts} försök`}
        <ChevronDown
          aria-hidden="true"
          className={`h-5 w-5 text-ink-3 transition-transform duration-[120ms] ${expanded ? 'rotate-180' : ''}`}
          strokeWidth={1.75}
        />
      </button>

      {expanded ? (
        <ul id={listId} className="divide-y divide-kant border-t border-kant">
          {[...stats.history].reverse().map((h, i) => (
            <HistoryRow
              key={`${h.completedAt}-${i}`}
              attempt={h}
              questionCount={def.questionCount}
              isBest={h.score === stats.bestScore && stats.bestScore > 0}
            />
          ))}
        </ul>
      ) : null}

      <div className="mt-3 border-t border-kant pt-3">
        <Link
          href={`/dashboard/tester/${def.slug}`}
          className="inline-flex min-h-11 items-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1"
        >
          Gör om testet
        </Link>
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0">
      <p className="text-tal tabular-nums text-ink-1">{value}</p>
      <p className="mt-1 text-meta tabular-nums text-ink-3">{label}</p>
    </div>
  );
}

function TrendText({
  delta,
  kind,
  singleAttempt,
}: {
  delta: number;
  kind: 'up' | 'down' | 'flat';
  singleAttempt: boolean;
}) {
  if (singleAttempt) return <>Första försöket</>;
  if (kind === 'flat') return <>Jämnt mot tidigare försök</>;
  if (kind === 'up') {
    return (
      <span className="text-positiv tabular-nums">
        +{delta} procentenheter mot tidigare snitt
      </span>
    );
  }
  return <span className="tabular-nums">{delta} procentenheter mot tidigare snitt</span>;
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

  return (
    <li className="flex min-h-11 items-center justify-between gap-3 py-2">
      <span className="min-w-0">
        <span className="text-sm font-medium tabular-nums text-ink-1">
          {attempt.score} av {questionCount}
        </span>
        <span className="ml-2 text-sm tabular-nums text-ink-2">{attempt.percentage} %</span>
        {isBest ? <span className="ml-2 text-sm text-positiv">Bäst</span> : null}
      </span>
      <span className="shrink-0 text-meta tabular-nums text-ink-3">
        {new Date(attempt.completedAt).toLocaleDateString('sv-SE', {
          day: 'numeric',
          month: 'short',
        })}
        {' · '}
        {timeLabel}
      </span>
    </li>
  );
}
