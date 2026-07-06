'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  sub?: string;
  delay?: number;
  headerExtra?: ReactNode;
  children: ReactNode;
}

/** Vitt sektionskort med orange accentlinje, samma mönster som tester-sidorna. */
export default function SectionCard({ title, sub, delay = 0, headerExtra, children }: SectionCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className="relative bg-white rounded-3xl border border-orange-100 p-4 sm:p-6 overflow-hidden"
      style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
    >
      <div
        className="absolute top-0 inset-x-0 h-0.5"
        style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626)' }}
        aria-hidden="true"
      />
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-[15px] sm:text-base font-bold text-slate-900">{title}</h2>
          {sub && <p className="text-[13px] text-slate-500 mt-0.5 leading-relaxed">{sub}</p>}
        </div>
        {headerExtra}
      </div>
      <div className="mt-4">{children}</div>
    </motion.section>
  );
}
