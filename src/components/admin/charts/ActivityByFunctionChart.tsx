'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { metaFor } from '@/app/admin/activity/functionMeta';

interface FunctionRow {
  funktion: string;
  totalt: number;
  slutforda: number;
  unika_anv: number;
}

interface Props {
  data: FunctionRow[];
  isLoading?: boolean;
}

export default function ActivityByFunctionChart({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-[320px] bg-gray-100 rounded"></div>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.totalt - a.totalt);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Användning per funktion</h3>
      <p className="text-xs text-gray-500 mb-4">Totalt antal händelser, alla tider</p>
      {sorted.length === 0 ? (
        <div className="h-[320px] flex items-center justify-center text-gray-500">Ingen data</div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="funktion"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              width={110}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: number, _name, props: any) => {
                const row = props?.payload as FunctionRow;
                return [`${value} händelser · ${row?.unika_anv ?? 0} unika`, row?.funktion ?? ''];
              }}
            />
            <Bar dataKey="totalt" radius={[0, 6, 6, 0]}>
              {sorted.map((row) => (
                <Cell key={row.funktion} fill={metaFor(row.funktion).hex} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
