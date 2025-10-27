'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface DataPoint {
  date: string;
  new_letters: number;
  total_letters: number;
}

interface LetterGenerationChartProps {
  data: DataPoint[];
  isLoading?: boolean;
}

export default function LetterGenerationChart({ data, isLoading }: LetterGenerationChartProps) {
  const chartData = useMemo(() => {
    // Format based on data length
    const formatPattern = data.length > 90 ? 'MMM yyyy' : data.length > 30 ? 'd MMM' : 'd MMM';

    return data.map(item => ({
      ...item,
      dateFormatted: format(new Date(item.date), formatPattern, { locale: sv })
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-[300px] bg-gray-100 rounded"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Brevgenerering över tid</h3>
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          Ingen data tillgänglig
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Brevgenerering över tid</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="dateFormatted"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '14px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="total_letters"
            stroke="#ec4899"
            strokeWidth={3}
            name="Totalt antal brev"
            dot={{ fill: '#ec4899', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="new_letters"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Nya brev (per dag)"
            dot={{ fill: '#3b82f6', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
