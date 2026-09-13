'use client';

// Statistikfliken: KPI-grid, aktivitet över tid och trattvy.
// Sober stil (paneler, tabular-nums) eftersom siffrorna kan komma att
// visas för en handläggare. Ghost-läge under 3 loggade ansökningar.

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ApplicationStats, JobApplication } from '@/lib/applications/status';
import CvComparisonCard from './CvComparisonCard';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';

interface StatsTabProps {
  totalCount: number;
  /** Hela listan: CV-jämförelsen räknar svar per använt CV. */
  applications: JobApplication[];
  isLoading?: boolean;
}

type Granularity = 'week' | 'month';

function pct(numerator: number, denominator: number): string {
  if (denominator === 0) return '–';
  return `${Math.round((numerator / denominator) * 100)}%`;
}

/**
 * Fast höjd och fast radhöjd: kortet ska ha samma mått med "–" som med "100 %",
 * annars hoppar rutnätet när siffrorna landar.
 */
function KpiCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-h-[6rem] rounded-xl border border-kant bg-panel p-4">
      <div className="text-tal tabular-nums text-ink-1">{value}</div>
      <div className="mt-1 text-meta text-ink-3">{label}</div>
    </div>
  );
}

function SectionBox({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-kant bg-panel p-4">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-kort text-ink-1">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function StatsTab({ totalCount, applications, isLoading }: StatsTabProps) {
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [granularity, setGranularity] = useState<Granularity>('week');

  useEffect(() => {
    fetch('/api/applications/stats')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setStats(json.data as ApplicationStats);
      })
      .catch(() => undefined);
  }, [totalCount]);

  if (!stats) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl border border-kant bg-insunken" />
          ))}
        </div>
        <LoadingSkeleton variant="card" label="Läser in statistiken" />
      </div>
    );
  }

  const activityData = (granularity === 'week' ? stats.byWeek : stats.byMonth).map((row) => {
    const iso = granularity === 'week' ? (row as { week: string }).week : (row as { month: string }).month;
    const date = new Date(iso);
    const label =
      granularity === 'week'
        ? new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short' }).format(date)
        : new Intl.DateTimeFormat('sv-SE', { month: 'short' }).format(date);
    return { label, applications: row.applications };
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard value={String(stats.totalApplications)} label="Sökta totalt" />
        <KpiCard value={pct(stats.respondedCount, stats.totalApplications)} label="Svarsfrekvens" />
        <KpiCard value={pct(stats.interviewedCount, stats.totalApplications)} label="Intervjufrekvens" />
        <KpiCard value={String(stats.offerCount)} label="Erbjudanden" />
      </div>

      <SectionBox
        title="Aktivitet över tid"
        action={
          <div className="flex items-center gap-0.5 rounded-lg border border-kant bg-insunken p-0.5 shadow-insunken">
            {(['week', 'month'] as Granularity[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGranularity(g)}
                className={`px-3 py-1.5 min-h-[44px] rounded-md text-xs font-medium transition-colors ${
                  granularity === g ? 'bg-panel text-ink-1' : 'text-ink-3'
                }`}
              >
                {g === 'week' ? 'Vecka' : 'Månad'}
              </button>
            ))}
          </div>
        }
      >
        {activityData.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-ink-3">
            Ingen aktivitet att visa ännu.
          </div>
        ) : (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 8, right: 4, bottom: 0, left: -22 }}>
                <CartesianGrid vertical={false} stroke="#DBD2C4" strokeDasharray="0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#6B645E' }}
                  axisLine={{ stroke: '#DBD2C4' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#6B645E' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(28, 25, 23, 0.06)' }}
                  formatter={(value: number) => [`${value} ansökningar`, '']}
                  separator=""
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #DBD2C4',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="applications" fill="#57534E" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </SectionBox>

      {/* Svar per CV. Den enda insikten i produkten som kräver vår egen
          historik, och därför den ingen konkurrent kan kopiera. */}
      <CvComparisonCard applications={applications} isLoading={isLoading} />
    </div>
  );
}
