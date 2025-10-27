'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TimeSeriesDataPoint {
  date: string;
  totalCostSek: number;
  totalCostUsd: number;
  totalTokens: number;
  totalCalls: number;
  byFeature: Record<string, {
    costSek: number;
    calls: number;
    tokens: number;
  }>;
}

interface CostTimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
  groupBy: 'day' | 'week' | 'month';
  features?: string[];
}

const COLORS: Record<string, string> = {
  'letter_generation': '#3b82f6', // blue-500
  'cv_parsing': '#8b5cf6', // violet-500
  'cv_improvement': '#ec4899', // pink-500
  'linkedin_optimization': '#f59e0b', // amber-500
  'group_improvements': '#10b981', // emerald-500
  'cv_analysis': '#6366f1', // indigo-500
  'competence_analysis': '#f97316', // orange-500
};

const FEATURE_LABELS: Record<string, string> = {
  'letter_generation': 'Personligt Brev',
  'cv_parsing': 'CV-parsning',
  'cv_improvement': 'CV-förbättring',
  'linkedin_optimization': 'LinkedIn-optimering',
  'group_improvements': 'Grupperade förbättringar',
  'cv_analysis': 'CV-analys',
  'competence_analysis': 'Kompetensanalys',
};

export default function CostTimeSeriesChart({ data, groupBy, features = [] }: CostTimeSeriesChartProps) {
  // Transform data for chart
  const chartData = data.map((point) => {
    const transformed: any = {
      date: formatDate(point.date, groupBy),
      total: point.totalCostSek,
    };

    // Add per-feature costs if features are specified
    if (features.length > 0) {
      features.forEach((feature) => {
        transformed[feature] = point.byFeature[feature]?.costSek || 0;
      });
    }

    return transformed;
  });

  function formatDate(dateStr: string, groupBy: 'day' | 'week' | 'month'): string {
    const date = new Date(dateStr);

    if (groupBy === 'month') {
      return date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'short' });
    } else if (groupBy === 'week') {
      return `v${getWeekNumber(date)} ${date.getFullYear()}`;
    } else {
      return date.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' });
    }
  }

  function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)} kr
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{
              value: 'Kostnad (SEK)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#374151', fontSize: 14 }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value: string) => {
              if (value === 'total') return 'Total kostnad';
              return FEATURE_LABELS[value] || value;
            }}
          />

          {/* Total cost line - always shown */}
          <Line
            type="monotone"
            dataKey="total"
            name="Total kostnad"
            stroke="#111827"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />

          {/* Per-feature lines - only if features specified */}
          {features.map((feature) => (
            <Line
              key={feature}
              type="monotone"
              dataKey={feature}
              name={FEATURE_LABELS[feature] || feature}
              stroke={COLORS[feature] || '#6b7280'}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
