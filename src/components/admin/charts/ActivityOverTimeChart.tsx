'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { metaFor } from '@/app/admin/activity/functionMeta';

// Pivoterad rad: { dag: '2026-06-16', Brev: 3, Logiktest: 2, ... }
export interface DailyPivotRow {
  dag: string;
  [funktion: string]: string | number;
}

interface Props {
  data: DailyPivotRow[];
  funktioner: string[]; // funktioner som faktiskt har data (ritordning)
  isLoading?: boolean;
}

// Custom tooltip: svensk talformat, döljer nollor, summerar dagen.
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const rows = payload.filter((p: any) => p.value > 0);
  const total = rows.reduce((s: number, p: any) => s + p.value, 0);
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-slate-900 mb-1">{label} · {total} st</p>
      {rows.map((p: any) => (
        <p key={p.dataKey} className="flex items-center gap-1.5 text-slate-600">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          {p.dataKey}: <span className="font-medium tabular-nums">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function ActivityOverTimeChart({ data, funktioner, isLoading }: Props) {
  const chartData = useMemo(
    () =>
      data.map((row) => ({
        ...row,
        dagFormatted: format(new Date(row.dag as string), 'd MMM', { locale: sv }),
      })),
    [data]
  );

  if (isLoading) {
    return <div className="h-[300px] bg-slate-50 rounded-lg animate-pulse" />;
  }
  if (chartData.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-sm text-slate-400">Ingen aktivitet i perioden</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 5, right: 12, left: -10, bottom: 0 }}>
        <defs>
          {funktioner.map((f) => {
            const hex = metaFor(f).hex;
            return (
              <linearGradient key={f} id={`grad-${f}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={hex} stopOpacity={0.5} />
                <stop offset="100%" stopColor={hex} stopOpacity={0.05} />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="dagFormatted" stroke="#94a3b8" tickLine={false} axisLine={false} style={{ fontSize: '11px' }} minTickGap={24} />
        <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} style={{ fontSize: '11px' }} allowDecimals={false} width={28} />
        <Tooltip content={<ChartTooltip />} />
        {funktioner.map((f) => {
          const hex = metaFor(f).hex;
          return (
            <Area
              key={f}
              type="monotone"
              dataKey={f}
              stackId="1"
              stroke={hex}
              strokeWidth={1.5}
              fill={`url(#grad-${f})`}
              name={f}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}
