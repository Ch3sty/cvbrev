'use client';

import { useMemo } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface DataPoint {
  date: string;
  daily_cost_usd: number;
  daily_cost_sek: number;
  cumulative_cost_usd: number;
  cumulative_cost_sek: number;
}

interface LetterCostChartProps {
  data: DataPoint[];
  isLoading?: boolean;
  showCurrency?: 'SEK' | 'USD';
}

export default function LetterCostChart({ data, isLoading, showCurrency = 'SEK' }: LetterCostChartProps) {
  const chartData = useMemo(() => {
    // Format based on data length
    const formatPattern = data.length > 90 ? 'MMM yyyy' : data.length > 30 ? 'd MMM' : 'd MMM';

    return data.map(item => ({
      ...item,
      dateFormatted: format(new Date(item.date), formatPattern, { locale: sv }),
      // Round to 2 decimals for display
      daily_cost: showCurrency === 'SEK' ? item.daily_cost_sek : item.daily_cost_usd,
      cumulative_cost: showCurrency === 'SEK' ? item.cumulative_cost_sek : item.cumulative_cost_usd
    }));
  }, [data, showCurrency]);

  // Calculate total cost
  const totalCost = useMemo(() => {
    if (!data || data.length === 0) return 0;
    const lastDay = data[data.length - 1];
    return showCurrency === 'SEK' ? lastDay.cumulative_cost_sek : lastDay.cumulative_cost_usd;
  }, [data, showCurrency]);

  const currencySymbol = showCurrency === 'SEK' ? 'kr' : '$';

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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Kostnad över tid</h3>
        <p className="text-sm text-gray-500 mb-4">Total: 0 {currencySymbol}</p>
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          Ingen data tillgänglig
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Kostnad över tid</h3>
          <p className="text-sm text-gray-500 mt-1">
            Total: {totalCost.toFixed(2)} {currencySymbol}
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="dateFormatted"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${value.toFixed(0)} ${currencySymbol}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: any) => `${parseFloat(value).toFixed(2)} ${currencySymbol}`}
          />
          <Legend
            wrapperStyle={{ fontSize: '14px' }}
            iconType="rect"
          />
          <Area
            type="monotone"
            dataKey="daily_cost"
            stroke="#f97316"
            strokeWidth={2}
            fill="url(#colorCost)"
            name="Kostnad per dag"
          />
          <Area
            type="monotone"
            dataKey="cumulative_cost"
            stroke="#ec4899"
            strokeWidth={3}
            fill="url(#colorCumulative)"
            name="Kumulativ kostnad"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
