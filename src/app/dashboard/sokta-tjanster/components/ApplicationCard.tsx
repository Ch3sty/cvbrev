'use client';

// Kort i ansökningslistan: företag, tjänst, status-pill, tid sedan senaste
// händelse och progress-dots. Hela kortet är klickbart och öppnar detaljvyn.

import { Building2, MapPin, FileText } from 'lucide-react';
import {
  CHANNEL_META,
  shouldShowNoResponseNudge,
  type JobApplication,
} from '@/lib/applications/status';
import { StatusPill, ProgressDots, formatDateShort, daysSince } from './StatusBits';

interface ApplicationCardProps {
  application: JobApplication;
  onOpen: (id: string) => void;
}

export default function ApplicationCard({ application, onOpen }: ApplicationCardProps) {
  const lastActivity = application.status_updated_at ?? application.created_at;
  const showNudge = shouldShowNoResponseNudge(application.current_status, lastActivity);
  const silentDays = daysSince(lastActivity);

  return (
    <button
      type="button"
      onClick={() => onOpen(application.id)}
      className="w-full text-left bg-white rounded-2xl border border-orange-200/50 px-4 py-3.5 sm:px-5 sm:py-4 hover:border-orange-300 hover:shadow-md transition-all group"
      style={{ boxShadow: '0 2px 12px -6px rgba(249, 115, 22, 0.12)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-bold text-slate-900 leading-snug truncate group-hover:text-orange-700 transition-colors">
            {application.job_title}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] text-slate-600">
            <span className="inline-flex items-center gap-1 min-w-0">
              <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" strokeWidth={2.25} />
              <span className="truncate">{application.company}</span>
            </span>
            {application.location && (
              <span className="inline-flex items-center gap-1 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" strokeWidth={2.25} />
                {application.location}
              </span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <StatusPill status={application.current_status} />
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex items-center gap-x-2 text-[12px] text-slate-500">
          <span>Sökt {formatDateShort(application.applied_at)}</span>
          <span className="text-slate-300">·</span>
          <span>{CHANNEL_META[application.application_channel]?.short ?? 'Annons'}</span>
          {application.letter_id && (
            <>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1 text-orange-600 font-medium">
                <FileText className="w-3 h-3" strokeWidth={2.5} />
                Brev
              </span>
            </>
          )}
        </div>
        <ProgressDots status={application.current_status} />
      </div>

      {showNudge && silentDays !== null && (
        <div className="mt-2 text-[12px] text-slate-500 bg-slate-50 border border-slate-200/70 rounded-lg px-2.5 py-1.5">
          Inget hört på {silentDays} dagar. Öppna för att uppdatera status.
        </div>
      )}
    </button>
  );
}
