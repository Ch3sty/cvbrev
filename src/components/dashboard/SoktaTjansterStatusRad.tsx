'use client';

// Slim statusrad för Sökta tjänster, i samma format som CvStatusCard.
// Visas när användaren har minst en loggad ansökan: håller funktionen
// levande på dashboarden efter första klicket.

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { IconSnabbSokta } from './illustrations/DashboardIcons';
import InfoPopover from '@/components/ui/InfoPopover';
import type { ApplicationsSummary } from '@/hooks/useApplicationsSummary';

export default function SoktaTjansterStatusRad({ summary }: { summary: ApplicationsSummary }) {
  if (!summary.loaded || summary.total === 0) return null;

  const parts: string[] = [`${summary.total} sökta`];
  if (summary.waitingCount > 0) parts.push(`${summary.waitingCount} väntar svar`);
  if (summary.interviewCount > 0) parts.push(`${summary.interviewCount} i intervjuprocess`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl bg-white border border-orange-100 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
      style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.12)' }}
    >
      <IconSnabbUpptacktWrapper />

      <div className="flex-1 min-w-0">
        <div className="flex items-center text-[10px] font-black uppercase tracking-[0.18em] text-orange-700">
          <span>Dina ansökningar</span>
          <InfoPopover title="Dina ansökningar">
            <p>
              Siffrorna kommer från jobben du loggat under Sökta tjänster:
              hur många du sökt, hur många som väntar på svar och var du är i
              intervjuprocess.
            </p>
            <p>
              Öppna för att se detaljer, statistik och månadsöversikten till
              Arbetsförmedlingen.
            </p>
          </InfoPopover>
        </div>
        <div className="font-black text-slate-900 text-base truncate">{parts.join(' · ')}</div>
        {summary.followUpCount > 0 && (
          <div className="text-[12px] text-slate-500 mt-0.5">
            {summary.followUpCount === 1
              ? '1 ansökan har varit tyst i över två veckor.'
              : `${summary.followUpCount} ansökningar har varit tysta i över två veckor.`}
          </div>
        )}
      </div>

      <Link
        href="/dashboard/sokta-tjanster"
        className="group inline-flex items-center justify-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-xl text-white flex-shrink-0 transition-all duration-200 hover:-translate-y-0.5 min-h-[40px]"
        style={{
          background: 'var(--jc-gradient-warm)',
          boxShadow: '0 4px 12px -4px rgba(220, 38, 38, 0.35)',
        }}
      >
        Öppna
        <ArrowRight
          className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
          strokeWidth={2.5}
        />
      </Link>
    </motion.div>
  );
}

function IconSnabbUpptacktWrapper() {
  return <IconSnabbSokta className="w-11 h-11 flex-shrink-0" />;
}
