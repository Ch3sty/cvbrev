'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface FeatureData {
  featureName: string;
  totalCalls: number;
  totalCostSek: number;
  totalTokens: number;
  avgCostPerCall: number;
  models: string[];
}

interface FeatureUsageChartProps {
  data: FeatureData[];
  metric?: 'calls' | 'cost' | 'tokens';
}

const COLORS = [
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#6366f1', // indigo-500
  '#f97316', // orange-500
];

const FEATURE_LABELS: Record<string, string> = {
  'letter_generation': 'Personligt Brev',
  'cv_parsing': 'CV-parsning',
  'cv_improvement': 'CV-förbättring',
  'linkedin_optimization': 'LinkedIn-optimering',
  'group_improvements': 'Grupperade förbättringar',
  'cv_analysis': 'CV-analys',
  'competence_analysis': 'Kompetensanalys',
};

export default function FeatureUsageChart({ data, metric = 'calls' }: FeatureUsageChartProps) {
  const chartData = data.map((item) => ({
    name: FEATURE_LABELS[item.featureName] || item.featureName,
    value: metric === 'calls'
      ? item.totalCalls
      : metric === 'cost'
        ? item.totalCostSek
        : item.totalTokens,
    rawName: item.featureName,
  }));

  const getLabel = () => {
    switch (metric) {
      case 'calls':
        return 'Antal anrop';
      case 'cost':
        return 'Kostnad (SEK)';
      case 'tokens':
        return 'Tokens';
      default:
        return 'Värde';
    }
  };

  const formatValue = (value: number) => {
    if (metric === 'cost') {
      return `${value.toFixed(2)} kr`;
    }
    if (metric === 'tokens') {
      return value.toLocaleString('sv-SE');
    }
    return value.toString();
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{
              value: getLabel(),
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#374151', fontSize: 14 }
            }}
          />
          <Tooltip
            formatter={(value: number) => formatValue(value)}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
            }}
            labelStyle={{ color: '#111827', fontWeight: 600 }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={() => getLabel()}
          />
          <Bar
            dataKey="value"
            name={getLabel()}
            radius={[8, 8, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
