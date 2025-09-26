'use client';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import PremiumCard from './PremiumCard';

interface StatsWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'pink' | 'blue' | 'green' | 'purple' | 'orange';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

const colorVariants = {
  pink: {
    bg: 'bg-pink-50',
    icon: 'text-pink-600',
    gradient: 'from-pink-600 to-purple-600',
    border: 'border-pink-200'
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    gradient: 'from-blue-600 to-indigo-600',
    border: 'border-blue-200'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    gradient: 'from-green-600 to-emerald-600',
    border: 'border-green-200'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    gradient: 'from-purple-600 to-indigo-600',
    border: 'border-purple-200'
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    gradient: 'from-orange-600 to-red-600',
    border: 'border-orange-200'
  }
};

export default function StatsWidget({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
  onClick
}: StatsWidgetProps) {
  const colors = colorVariants[color];

  return (
    <PremiumCard onClick={onClick} hover={!!onClick} className="p-4 sm:p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-slate-600 text-sm font-medium mb-2"
          >
            {title}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 200 }}
            className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1"
          >
            {value}
          </motion.div>

          {subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-slate-500 text-xs"
            >
              {subtitle}
            </motion.p>
          )}

          {trend && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <span>{trend.isPositive ? '↗' : '↘'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-slate-500">från förra veckan</span>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, duration: 0.8, type: "spring", stiffness: 200 }}
          className={`${colors.bg} p-3 rounded-xl border ${colors.border}`}
        >
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </motion.div>
      </div>

      {/* Subtle animated background gradient */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ delay: 0.5, duration: 1 }}
        className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} rounded-xl pointer-events-none`}
      />
    </PremiumCard>
  );
}