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
      className="w-full rounded-xl border border-kant bg-panel px-4 py-3 text-left transition-[border-color] hover:border-kant-stark"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-kort text-ink-1">{application.job_title}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-meta text-ink-3">
            <span className="inline-flex min-w-0 items-center gap-1">
              <Building2 className="h-3.5 w-3.5 shrink-0 text-ink-3" strokeWidth={1.75} />
              <span className="truncate">{application.company}</span>
            </span>
            {application.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-ink-3" strokeWidth={1.75} />
                {application.location}
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0">
          <StatusPill status={application.current_status} />
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex items-center gap-x-2 text-meta text-ink-3">
          <span>Sökt {formatDateShort(application.applied_at)}</span>
          <span aria-hidden="true">·</span>
          <span>{CHANNEL_META[application.application_channel]?.short ?? 'Annons'}</span>
          {application.letter_id && (
            <>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <FileText className="h-3 w-3" strokeWidth={1.75} />
                Brev
              </span>
            </>
          )}
        </div>
        <ProgressDots status={application.current_status} />
      </div>

      {showNudge && silentDays !== null && (
        <div className="mt-2 rounded-lg border border-kant bg-insunken px-2.5 py-1.5 text-meta text-ink-2 shadow-insunken">
          Inget hört på {silentDays} dagar. Öppna för att uppdatera status.
        </div>
      )}
    </button>
  );
}
