'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
  funktioner: string[]; // funktioner som faktiskt har data (i ritordning)
  isLoading?: boolean;
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
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-[320px] bg-gray-100 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Aktivitet över tid</h3>
      <p className="text-xs text-gray-500 mb-4">Händelser per dag, senaste 30 dagar</p>
      {chartData.length === 0 ? (
        <div className="h-[320px] flex items-center justify-center text-gray-500">Ingen data</div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="dagFormatted" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '13px' }} />
            {funktioner.map((f) => {
              const hex = metaFor(f).hex;
              return (
                <Area
                  key={f}
                  type="monotone"
                  dataKey={f}
                  stackId="1"
                  stroke={hex}
                  fill={hex}
                  fillOpacity={0.6}
                  name={f}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
