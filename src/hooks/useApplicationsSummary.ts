// src/hooks/useApplicationsSummary.ts
// Lätt sammanfattning av Sökta tjänster för dashboarden: totaler, väntande,
// uppföljningsbara (14+ dagars tystnad) och föregående månads antal (för
// AF-rapportpåminnelsen). Hämtas EN gång per dashboard-mount och delas via
// props till NastaSteg och statusraden, så vi inte får parallella fetches.

'use client';

import { useEffect, useState } from 'react';
import {
  statusIsClosed,
  statusHasResponse,
  NO_RESPONSE_NUDGE_DAYS,
  type JobApplication,
} from '@/lib/applications/status';

export interface ApplicationsSummary {
  loaded: boolean;
  total: number;
  /** Pågående utan svar ännu (applied/no_response, ej avslutade). */
  waitingCount: number;
  /** I intervjuprocess just nu. */
  interviewCount: number;
  /** Pågående ansökningar med 14+ dagars tystnad: uppföljningskandidater. */
  followUpCount: number;
  /** Antal sökta föregående kalendermånad (AF-rapporten avser den). */
  prevMonthCount: number;
}

const EMPTY: ApplicationsSummary = {
  loaded: false,
  total: 0,
  waitingCount: 0,
  interviewCount: 0,
  followUpCount: 0,
  prevMonthCount: 0,
};

const INTERVIEW_STATUSES = ['interview_invited', 'interview_completed', 'trial_work_completed'];

export function useApplicationsSummary(): ApplicationsSummary {
  const [summary, setSummary] = useState<ApplicationsSummary>(EMPTY);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/applications')
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json.success) {
          if (!cancelled) setSummary({ ...EMPTY, loaded: true });
          return;
        }
        const apps = json.data as JobApplication[];
        const now = new Date();
        const nudgeMs = NO_RESPONSE_NUDGE_DAYS * 24 * 60 * 60 * 1000;

        const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;

        let waitingCount = 0;
        let interviewCount = 0;
        let followUpCount = 0;
        let prevMonthCount = 0;

        for (const app of apps) {
          const closed = statusIsClosed(app.current_status);
          if (!closed && !statusHasResponse(app.current_status)) waitingCount++;
          if (INTERVIEW_STATUSES.includes(app.current_status ?? '')) interviewCount++;
          if (!closed && app.current_status !== 'offer_received') {
            const last = new Date(app.status_updated_at ?? app.created_at).getTime();
            if (!Number.isNaN(last) && now.getTime() - last >= nudgeMs) followUpCount++;
          }
          if (app.applied_at?.startsWith(prevMonthKey)) prevMonthCount++;
        }

        setSummary({
          loaded: true,
          total: apps.length,
          waitingCount,
          interviewCount,
          followUpCount,
          prevMonthCount,
        });
      })
      .catch(() => {
        if (!cancelled) setSummary({ ...EMPTY, loaded: true });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return summary;
}
