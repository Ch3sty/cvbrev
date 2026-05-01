'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PenTool, Search, FileText } from 'lucide-react';

interface CompactQuotaCardProps {
  weeklyLetterCount: number;
  weeklyAnalysisCount: number;
  cvCount: number;
}

/**
 * Kompakt vertikal kvota-vy för sidokolumn (free-users).
 * Visar Brev, CV-analys och Sparade CV med tunna progress-bars.
 * Innehåller en "Uppgradera"-CTA längst ner.
 */
export default function CompactQuotaCard({
  weeklyLetterCount,
  weeklyAnalysisCount,
  cvCount,
}: CompactQuotaCardProps) {
  const rows: {
    icon: typeof PenTool;
    label: string;
    used: number;
    limit: number;
    color: string;
  }[] = [
    {
      icon: PenTool,
      label: 'Personliga brev',
      used: weeklyLetterCount,
      limit: 7,
      color: 'bg-pink-500',
    },
    {
      icon: Search,
      label: 'CV-analys',
      used: weeklyAnalysisCount,
      limit: 1,
      color: 'bg-emerald-500',
    },
    {
      icon: FileText,
      label: 'Sparade CV',
      used: cvCount,
      limit: 2,
      color: 'bg-blue-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl border border-slate-200 p-5 h-full flex flex-col"
    >
      <h3 className="font-semibold text-slate-900 mb-4">Veckokvoter</h3>

      <ul className="space-y-3 flex-1">
        {rows.map((row, i) => {
          const Icon = row.icon;
          const pct = row.limit === 0 ? 0 : Math.min(100, Math.round((row.used / row.limit) * 100));
          return (
            <li key={i}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-slate-500" strokeWidth={2.25} />
                  <span className="text-sm text-slate-700">{row.label}</span>
                </div>
                <span className="text-xs font-semibold text-slate-500 tabular-nums">
                  {row.used}/{row.limit}
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full rounded-full ${row.color}`}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <Link
        href="/dashboard/profil/prenumeration"
        className="mt-5 block text-center text-sm font-semibold px-4 py-2.5 rounded-xl text-white shadow-sm hover:shadow-md transition-all"
        style={{ background: 'linear-gradient(90deg, #DB2777, #9333EA)' }}
      >
        Uppgradera för obegränsat
      </Link>
    </motion.div>
  );
}
