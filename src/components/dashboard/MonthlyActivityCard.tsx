'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, PenTool, Search, Linkedin, ArrowRight } from 'lucide-react';

interface MonthlyActivityCardProps {
  letterCount: number;
  analysisCount: number;
  linkedInCount: number;
}

export default function MonthlyActivityCard({
  letterCount,
  analysisCount,
  linkedInCount
}: MonthlyActivityCardProps) {
  const totalActivity = letterCount + analysisCount + linkedInCount;

  return (
    <Link href="/dashboard/mina-brev" className="block group">
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl sm:rounded-2xl border border-emerald-200 p-4 sm:p-5 shadow-lg hover:shadow-xl transition-all h-full relative overflow-hidden"
      >
        {/* Bakgrundsdekor */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full -translate-y-8 translate-x-8" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Denna månad</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </div>

          {/* Main stat */}
          <div className="mb-3">
            <span className="text-3xl sm:text-4xl font-bold text-slate-900">{letterCount}</span>
            <span className="text-lg text-slate-600 ml-1">brev</span>
          </div>

          {/* Subtext with other activities */}
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <Search className="w-3 h-3" />
              {analysisCount} analyser
            </span>
            <span className="flex items-center gap-1">
              <Linkedin className="w-3 h-3" />
              {linkedInCount} LinkedIn
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
