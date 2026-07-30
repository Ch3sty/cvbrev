'use client';

// Slim statusrad för Bli upptäckt EFTER aktivering. Tidigare försvann
// säljkortet spårlöst när profilen blev synlig; nu ersätts det av en
// bekräftelse med intressesiffror. Indigo-accent enligt regeln: indigo
// tillhör uteslutande rekryterarytan.

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { RadarChip } from './illustrations/DashboardIcons';
import { useCandidateInterests } from '@/hooks/useCandidateInterests';

export default function BliUpptacktStatusRad() {
  const { isVisible, loaded, pending, unread, total } = useCandidateInterests();

  if (!loaded || !isVisible) return null;

  const hasNews = pending > 0 || unread > 0;
  const subtitle =
    pending > 0
      ? pending === 1
        ? '1 rekryterare väntar på ditt svar'
        : `${pending} rekryterare väntar på ditt svar`
      : unread > 0
        ? unread === 1
          ? '1 oläst meddelande från rekryterare'
          : `${unread} olästa meddelanden från rekryterare`
        : total > 0
          ? 'Rekryterare kan hitta dig i kandidatpoolen'
          : 'Din profil är sökbar för rekryterare';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-3xl bg-white border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 ${
        hasNews ? 'border-indigo-200' : 'border-slate-100'
      }`}
      style={{
        boxShadow: hasNews
          ? '0 4px 16px -8px rgba(79, 70, 229, 0.2)'
          : '0 4px 16px -8px rgba(15, 23, 42, 0.08)',
      }}
    >
      <RadarChip className="w-11 h-11 flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-700">
            Bli upptäckt
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 py-px">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            Synlig
          </span>
        </div>
        <div className="font-black text-slate-900 text-base truncate">{subtitle}</div>
      </div>

      <Link
        href={hasNews ? '/dashboard/meddelanden' : '/dashboard/bli-upptackt'}
        className={`group inline-flex items-center justify-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-xl flex-shrink-0 transition-all duration-200 hover:-translate-y-0.5 min-h-[40px] ${
          hasNews
            ? 'text-white'
            : 'text-indigo-700 border border-indigo-200 bg-white hover:bg-indigo-50/50'
        }`}
        style={
          hasNews
            ? {
                background: 'linear-gradient(135deg, #4F46E5, #3730A3)',
                boxShadow: '0 4px 12px -4px rgba(79, 70, 229, 0.4)',
              }
            : undefined
        }
      >
        {hasNews ? 'Svara' : 'Visa profil'}
        <ArrowRight
          className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
          strokeWidth={2.5}
        />
      </Link>
    </motion.div>
  );
}
