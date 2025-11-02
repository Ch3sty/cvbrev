'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { CreditCard, Shield, Users } from 'lucide-react';

interface PremiumDataPoint {
  date: string;
  stripe: number;
  admin: number;
  guest: number;
}

interface PremiumBreakdownChartProps {
  data: PremiumDataPoint[];
  isLoading?: boolean;
  totals?: {
    stripe: number;
    admin: number;
    guest: number;
  };
}

export default function PremiumBreakdownChart({ data, isLoading, totals }: PremiumBreakdownChartProps) {
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      dateFormatted: format(new Date(item.date), 'd MMM', { locale: sv })
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Premium-användare fördelning</h3>
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          Ingen data tillgänglig
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Premium-användare fördelning</h3>

        {totals && (
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span className="text-gray-600">Stripe:</span>
              <span className="font-semibold text-gray-900">{totals.stripe}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-gray-600">Admin:</span>
              <span className="font-semibold text-gray-900">{totals.admin}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-gray-600">Gästinbjudan:</span>
              <span className="font-semibold text-gray-900">{totals.guest}</span>
            </div>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="dateFormatted"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            allowDecimals={false}
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
            iconType="rect"
          />
          <Bar dataKey="stripe" fill="#10b981" name="Stripe (betalande)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="admin" fill="#3b82f6" name="Admin (manuella)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="guest" fill="#8b5cf6" name="Gästinbjudan (inbjudna)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
