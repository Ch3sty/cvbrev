'use client';

// Statistikfliken: KPI-grid, aktivitet över tid och trattvy.
// Sober stil (vita kort, tabular-nums) eftersom siffrorna kan komma att
// visas för en handläggare. Ghost-läge under 3 loggade ansökningar.

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ApplicationStats } from '@/lib/applications/status';
import FunnelBars from './FunnelBars';

interface StatsTabProps {
  totalCount: number;
}

type Granularity = 'week' | 'month';

function pct(numerator: number, denominator: number): string {
  if (denominator === 0) return '–';
  return `${Math.round((numerator / denominator) * 100)}%`;
}

function KpiCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white rounded-2xl border border-orange-200/50 p-4 sm:p-5">
      <div className="text-2xl sm:text-3xl font-semibold text-slate-900 tabular-nums leading-none">
        {value}
      </div>
      <div className="text-[12.5px] text-slate-500 mt-1.5">{label}</div>
    </div>
  );
}

function SectionBox({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-orange-200/50 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-[14.5px] font-bold text-slate-900">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function StatsTab({ totalCount }: StatsTabProps) {
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
            <div key={i} className="bg-white rounded-2xl border border-orange-200/50 p-5 animate-pulse h-24" />
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-orange-200/50 p-6 animate-pulse h-56" />
      </div>
    );
  }

  const tooThin = stats.totalApplications < 3;

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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard value={String(stats.totalApplications)} label="Sökta totalt" />
        <KpiCard value={pct(stats.respondedCount, stats.totalApplications)} label="Svarsfrekvens" />
        <KpiCard value={pct(stats.interviewedCount, stats.totalApplications)} label="Intervjufrekvens" />
        <KpiCard value={String(stats.offerCount)} label="Erbjudanden" />
      </div>

      <SectionBox
        title="Aktivitet över tid"
        action={
          <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
            {(['week', 'month'] as Granularity[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGranularity(g)}
                className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all ${
                  granularity === g ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                {g === 'week' ? 'Vecka' : 'Månad'}
              </button>
            ))}
          </div>
        }
      >
        {activityData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-[13px] text-slate-400">
            Ingen aktivitet att visa ännu.
          </div>
        ) : (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 8, right: 4, bottom: 0, left: -22 }}>
                <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(234, 88, 12, 0.06)' }}
                  formatter={(value: number) => [`${value} ansökningar`, '']}
                  separator=""
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    fontSize: 12,
                    boxShadow: '0 4px 16px -8px rgba(15, 23, 42, 0.15)',
                  }}
                />
                <Bar dataKey="applications" fill="#EA580C" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </SectionBox>

      <SectionBox title="Din process">
        <FunnelBars stats={stats} ghost={tooThin} />
        {tooThin && (
          <p className="mt-3 text-[13px] text-slate-500 text-center">
            Logga fler ansökningar så tar din statistik form. Så här kan den se ut.
          </p>
        )}
      </SectionBox>
    </motion.div>
  );
}
