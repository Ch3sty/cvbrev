'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, Clock } from 'lucide-react';

interface TestStatsCardProps {
  completedTestCount: number;
  totalTestCount: number;
  averageBestPercentage: number;
  totalTimeSeconds: number;
}

export default function TestStatsCard({
  completedTestCount,
  totalTestCount,
  averageBestPercentage,
  totalTimeSeconds,
}: TestStatsCardProps) {
  const totalMinutes = Math.round(totalTimeSeconds / 60);
  const timeLabel =
    totalMinutes >= 60
      ? `${Math.floor(totalMinutes / 60)}t ${totalMinutes % 60}m`
      : `${totalMinutes} min`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="relative bg-white rounded-3xl border border-orange-100 p-4 sm:p-5 overflow-hidden"
      style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
    >
      <div
        className="absolute top-0 inset-x-0 h-0.5"
        style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626)' }}
      />

      <div className="grid grid-cols-3 gap-2 sm:gap-4 divide-x divide-orange-100">
        <Stat
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />}
          label="Slutförda"
          value={`${completedTestCount} / ${totalTestCount}`}
        />
        <Stat
          icon={<TrendingUp className="w-4 h-4 text-orange-600" strokeWidth={2.5} />}
          label="Bästa snitt"
          value={`${averageBestPercentage}%`}
        />
        <Stat
          icon={<Clock className="w-4 h-4 text-blue-600" strokeWidth={2.5} />}
          label="Total tid"
          value={timeLabel}
        />
      </div>
    </motion.section>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-2 sm:px-3 text-center">
      <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-wider font-semibold text-slate-500">
        {icon}
        {label}
      </div>
      <div className="text-sm sm:text-lg font-bold text-slate-900 tabular-nums">{value}</div>
    </div>
  );
}
