'use client';

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  subtitle?: string;
  iconBgColor?: string;
  iconColor?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  iconBgColor = 'bg-pink-100',
  iconColor = 'text-pink-600'
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>

          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}

          {trend && (
            <div className="flex items-center mt-2">
              {trend.value >= 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-600 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                trend.value >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {trend.value >= 0 ? '+' : ''}{trend.value}
              </span>
              <span className="text-sm text-gray-600 ml-1">{trend.label}</span>
            </div>
          )}
        </div>

        <div className={`${iconBgColor} p-3 rounded-lg flex-shrink-0`}>
          <div className={iconColor}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
