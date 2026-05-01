'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Crown, ArrowDown } from 'lucide-react';

interface CvLimitBannerProps {
  cvCount: number;
  cvLimit: number;
  isPremium: boolean;
  onScrollToList?: () => void;
}

export default function CvLimitBanner({
  cvCount,
  cvLimit,
  isPremium,
  onScrollToList,
}: CvLimitBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden bg-white rounded-2xl border border-orange-200/60"
      style={{ boxShadow: '0 8px 24px -10px rgba(249, 115, 22, 0.18)' }}
    >
      <div
        className="absolute top-0 inset-x-0 h-0.5"
        style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626)' }}
      />

      <FilledStackBg />

      <div className="relative p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div
            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white"
            style={{
              background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
              boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.35)',
            }}
          >
            <Crown className="w-6 h-6" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
              Du har fyllt din kvot
            </h3>
            <p className="text-sm text-slate-600 leading-snug">
              {isPremium
                ? `Du har ${cvCount} sparade CV. Ta bort ett för att ladda upp ett nytt.`
                : `Du har ${cvCount} av ${cvLimit} sparade CV. Ta bort ett gammalt CV eller uppgradera för obegränsade uppladdningar.`}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-shrink-0">
          {onScrollToList && (
            <button
              onClick={onScrollToList}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:border-orange-300 hover:bg-orange-50/60 rounded-xl transition-all touch-manipulation min-h-[44px]"
            >
              <ArrowDown className="w-4 h-4" strokeWidth={2.5} />
              Hantera CV
            </button>
          )}
          {!isPremium && (
            <Link
              href="/dashboard/profil/prenumeration"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all touch-manipulation min-h-[44px]"
              style={{
                background: 'linear-gradient(90deg, #F97316, #DC2626)',
                boxShadow: '0 12px 24px -8px rgba(220, 38, 38, 0.4)',
              }}
            >
              <Crown className="w-4 h-4" strokeWidth={2.5} />
              Uppgradera till Premium
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function FilledStackBg() {
  return (
    <svg
      className="absolute right-2 sm:right-6 -top-2 opacity-[0.08] pointer-events-none hidden sm:block"
      width="160"
      height="120"
      viewBox="0 0 160 120"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="14"
        y="20"
        width="80"
        height="100"
        rx="8"
        stroke="#DC2626"
        strokeWidth="2"
        transform="rotate(-6 54 70)"
      />
      <rect
        x="40"
        y="16"
        width="80"
        height="100"
        rx="8"
        stroke="#DC2626"
        strokeWidth="2"
        fill="white"
        fillOpacity="0.5"
        transform="rotate(4 80 66)"
      />
      <line x1="56" y1="36" x2="104" y2="36" stroke="#DC2626" strokeWidth="2" transform="rotate(4 80 66)" />
      <line x1="56" y1="52" x2="96" y2="52" stroke="#DC2626" strokeWidth="2" transform="rotate(4 80 66)" />
      <line x1="56" y1="70" x2="104" y2="70" stroke="#DC2626" strokeWidth="2" transform="rotate(4 80 66)" />
    </svg>
  );
}
