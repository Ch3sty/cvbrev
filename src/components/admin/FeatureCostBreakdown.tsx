'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface FeatureData {
  featureName: string;
  totalCalls: number;
  totalCostSek: number;
  totalTokens: number;
  avgCostPerCall: number;
  models: string[];
}

interface FeatureCostBreakdownProps {
  data: FeatureData[];
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

export default function FeatureCostBreakdown({ data }: FeatureCostBreakdownProps) {
  const chartData = data.map((item, index) => ({
    name: FEATURE_LABELS[item.featureName] || item.featureName,
    value: item.totalCostSek,
    percentage: 0, // Will be calculated after total
    color: COLORS[index % COLORS.length],
  }));

  const totalCost = chartData.reduce((sum, item) => sum + item.value, 0);

  chartData.forEach((item) => {
    item.percentage = (item.value / totalCost) * 100;
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Kostnad: {data.value.toFixed(2)} kr
          </p>
          <p className="text-sm text-gray-600">
            Andel: {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if slice is large enough
    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-full">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => {
                const item = chartData.find((d) => d.name === value);
                return `${value} (${item?.value.toFixed(2)} kr)`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed breakdown table */}
      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Funktion
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kostnad
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Andel
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {chartData
              .sort((a, b) => b.value - a.value)
              .map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                    {item.value.toFixed(2)} kr
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-600">
                    {item.percentage.toFixed(1)}%
                  </td>
                </tr>
              ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                Totalt
              </td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                {totalCost.toFixed(2)} kr
              </td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                100%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
