'use client';

import { motion } from 'framer-motion';
import { FileText, PenLine, Mail, Infinity as InfinityIcon } from 'lucide-react';

interface UsageStatsProps {
  cvCount: number;
  weeklyLetterCount: number;
  savedLettersCount: number;
}

export default function UsageStats({
  cvCount,
  weeklyLetterCount,
  savedLettersCount,
}: UsageStatsProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="bg-white rounded-3xl border border-orange-100 p-5 sm:p-6"
      style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
    >
      <div className="flex items-center gap-3 mb-4 sm:mb-5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #F97316, #DC2626)',
            boxShadow: '0 4px 10px -3px rgba(220, 38, 38, 0.35)',
          }}
        >
          <InfinityIcon className="w-5 h-5" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            Din användning
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Inga gränser — bara översikt över vad du gjort.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatItem
          icon={<FileText className="w-4 h-4" strokeWidth={2.25} />}
          label="Sparade CV"
          value={`${cvCount}`}
          sub={`av 50`}
        />
        <StatItem
          icon={<PenLine className="w-4 h-4" strokeWidth={2.25} />}
          label="Brev denna vecka"
          value={`${weeklyLetterCount}`}
          sub="Obegränsat"
        />
        <StatItem
          icon={<Mail className="w-4 h-4" strokeWidth={2.25} />}
          label="Sparade brev"
          value={`${savedLettersCount}`}
          sub="Obegränsat"
        />
      </div>
    </motion.section>
  );
}

function StatItem({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl bg-orange-50/60 border border-orange-100/80">
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white border border-orange-200 flex items-center justify-center text-orange-600">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-0.5">
          {label}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums leading-none">
            {value}
          </span>
          <span className="text-xs text-slate-500 truncate">{sub}</span>
        </div>
      </div>
    </div>
  );
}
