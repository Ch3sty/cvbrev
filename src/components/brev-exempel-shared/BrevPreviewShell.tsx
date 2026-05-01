'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, ArrowRight, Zap } from 'lucide-react';

interface BrevPreviewShellProps {
  yrke: string;
  children: ReactNode;
}

/**
 * Premium-shell runt InteractiveLetterPreview.
 *
 * Lägger orange/röd-DNA ramar (eyebrow, status-prick, gradient-strip topp,
 * footer-CTA) RUNT befintlig preview-komponent utan att ändra dess innehåll.
 */
export default function BrevPreviewShell({ yrke, children }: BrevPreviewShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border border-orange-200/60 bg-white"
      style={{
        boxShadow: '0 12px 40px -12px rgba(249, 115, 22, 0.22)',
      }}
    >
      {/* Gradient-strip topp */}
      <div
        className="h-1.5"
        style={{
          background:
            'linear-gradient(90deg, #FB923C 0%, #DC2626 50%, #BE185D 100%)',
        }}
      />

      {/* Header-rad */}
      <div className="px-5 sm:px-6 md:px-8 py-4 sm:py-5 border-b border-orange-100 bg-orange-50/40 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="absolute w-3 h-3 rounded-full bg-orange-500 opacity-70 animate-ping" />
            <span className="relative w-2.5 h-2.5 rounded-full bg-orange-600" />
          </div>
          <div>
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700">
              Live förhandsvisning
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-900">
              Personligt brev — {yrke}
            </div>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em] shadow-sm">
          <Eye className="w-3 h-3" strokeWidth={2.5} />
          Interaktiv
        </span>
      </div>

      {/* Children: själva InteractiveLetterPreview */}
      <div className="p-3 sm:p-4 md:p-5">{children}</div>

      {/* Footer-CTA */}
      <div
        className="px-5 sm:px-6 md:px-8 py-5 sm:py-6 text-white relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
          aria-hidden="true"
        >
          <pattern
            id="brev-shell-dots"
            x="0"
            y="0"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="12" cy="12" r="1" fill="white" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#brev-shell-dots)" />
        </svg>

        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-[11px] font-bold uppercase tracking-[0.18em] mb-1 opacity-90">
              <Zap className="w-3.5 h-3.5" strokeWidth={2.5} />
              60 sekunder
            </div>
            <div className="font-bold text-base sm:text-lg leading-tight">
              Imponerad? Skapa ditt eget personliga brev
            </div>
          </div>
          <Link href="/dashboard/skapa-brev" className="block w-full sm:w-auto">
            <button className="w-full sm:w-auto min-h-[48px] px-5 py-3 rounded-xl bg-white text-orange-700 font-bold hover:bg-orange-50 hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group">
              Kom igång gratis
              <ArrowRight
                className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                strokeWidth={2.5}
              />
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
