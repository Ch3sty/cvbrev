'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Flame } from 'lucide-react';

interface NextLevelCardProps {
  percentage: number;
  levelLabel: string;
  href: string;
}

// Progressionspuff på resultatsidan: uppmuntra nästa nivå efter ett starkt
// resultat, annars en mjukare formulering. Expert har ingen nästa nivå och
// renderar inte kortet alls.
export default function NextLevelCard({ percentage, levelLabel, href }: NextLevelCardProps) {
  const strongResult = percentage >= 70;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.18 }}
      className="relative bg-white rounded-3xl border border-orange-200/60 overflow-hidden"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.18)' }}
    >
      <div
        className="absolute top-0 inset-x-0 h-1"
        style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626, #BE185D)' }}
      />
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-white"
          style={{
            background: 'linear-gradient(135deg, #F97316, #DC2626)',
            boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.35)',
          }}
        >
          <Flame className="w-5 h-5" strokeWidth={2.25} />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            {strongResult ? 'Redo för nästa nivå?' : 'Nästa steg när du känner dig redo'}
          </h3>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            {strongResult
              ? `Starkt resultat. ${levelLabel} ger dig svårare mönster och en bättre bild av var taket ligger.`
              : `${levelLabel} väntar när du vill utmana dig med svårare mönster. Träna gärna om den här nivån först.`}
          </p>
        </div>
        <Link
          href={href}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 min-h-[48px] touch-manipulation flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #F97316, #DC2626)',
            boxShadow: '0 8px 20px -6px rgba(220, 38, 38, 0.4)',
          }}
        >
          Till {levelLabel.toLowerCase()}
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </Link>
      </div>
    </motion.section>
  );
}
