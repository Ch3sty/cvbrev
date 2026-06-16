'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
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

function BarTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as FunctionRow;
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-slate-900">{row.funktion}</p>
      <p className="text-slate-600 tabular-nums">{row.totalt} händelser · {row.unika_anv} unika</p>
    </div>
  );
}

export default function ActivityByFunctionChart({ data, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-[300px] bg-slate-50 rounded-lg animate-pulse" />;
  }
  const sorted = [...data].sort((a, b) => b.totalt - a.totalt);
  if (sorted.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-sm text-slate-400">Ingen data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 36, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="funktion"
          stroke="#64748b"
          tickLine={false}
          axisLine={false}
          style={{ fontSize: '12px' }}
          width={108}
        />
        <Tooltip content={<BarTooltip />} cursor={{ fill: '#f8fafc' }} />
        <Bar dataKey="totalt" radius={[0, 6, 6, 0]} barSize={22}>
          {sorted.map((row) => (
            <Cell key={row.funktion} fill={metaFor(row.funktion).hex} />
          ))}
          <LabelList dataKey="totalt" position="right" style={{ fontSize: '12px', fill: '#475569', fontWeight: 600 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
