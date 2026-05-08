'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface CvMallarLayoutProps {
  children: ReactNode;
}

export default function CvMallarLayout({ children }: CvMallarLayoutProps) {
  return (
    <div className="relative max-w-6xl mx-auto pb-32 sm:pb-20">
      {/* Mjuk orange radial-glow uppe (matchar /linkedin-optimizer-stilen) */}
      <div
        className="absolute inset-x-0 top-0 h-[40vh] -z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(249, 115, 22, 0.10) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Topbar med tillbaka-lank + breadcrumb */}
      <div className="flex items-center justify-between pt-2 pb-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-orange-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2.4} />
          <span className="hidden sm:inline">Tillbaka till Dashboard</span>
          <span className="sm:hidden">Tillbaka</span>
        </Link>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700">
          <span
            className="w-1 h-3 rounded-sm"
            style={{
              background: 'linear-gradient(180deg, #F97316 0%, #DC2626 100%)',
            }}
            aria-hidden="true"
          />
          Byt design pa CV
        </div>
      </div>

      {/* Innehall */}
      <div className="space-y-7 sm:space-y-9 pt-2 sm:pt-4">
        {children}
      </div>
    </div>
  );
}
