'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FeaturePopularity {
  featureName: string;
  totalCalls: number;
  uniqueUsers: number;
  callsByDate: Record<string, number>;
  firstUsage: string;
  lastUsage: string;
}

interface FeaturePopularityChartProps {
  data: FeaturePopularity[];
  selectedFeatures?: string[];
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

export default function FeaturePopularityChart({ data, selectedFeatures }: FeaturePopularityChartProps) {
  // Get all unique dates across all features
  const allDates = new Set<string>();
  data.forEach(feature => {
    Object.keys(feature.callsByDate).forEach(date => allDates.add(date));
  });

  // Sort dates
  const sortedDates = Array.from(allDates).sort();

  // Transform data for chart
  const chartData = sortedDates.map(date => {
    const dataPoint: any = {
      date: new Date(date).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' }),
      fullDate: date,
    };

    // Add data for each feature
    const featuresToShow = selectedFeatures && selectedFeatures.length > 0
      ? data.filter(f => selectedFeatures.includes(f.featureName))
      : data;

    featuresToShow.forEach(feature => {
      dataPoint[feature.featureName] = feature.callsByDate[date] || 0;
    });

    return dataPoint;
  });

  const featuresToDisplay = selectedFeatures && selectedFeatures.length > 0
    ? data.filter(f => selectedFeatures.includes(f.featureName))
    : data.slice(0, 5); // Show top 5 by default

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload
            .sort((a: any, b: any) => b.value - a.value)
            .map((entry: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {FEATURE_LABELS[entry.name] || entry.name}: {entry.value} anrop
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
              value: 'Antal anrop',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#374151', fontSize: 14 }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value: string) => FEATURE_LABELS[value] || value}
          />

          {featuresToDisplay.map((feature) => (
            <Line
              key={feature.featureName}
              type="monotone"
              dataKey={feature.featureName}
              name={FEATURE_LABELS[feature.featureName] || feature.featureName}
              stroke={COLORS[feature.featureName] || '#6b7280'}
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
