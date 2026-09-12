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
import { nextAfReportDeadline, type AfReportDeadline } from '@/lib/applications/afReport';

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
  /** Sökta den här veckan (måndag till nu, svensk tid). Progression på hemskärmen. */
  weekCount: number;
  /** Ansökningar som fått svar (inte bara väntar). */
  replyCount: number;
  /** De mest tidskänsliga pågående ansökningarna, redan sorterade. */
  pipeline: PipelineItem[];
  /**
   * Svarsfrekvens i hela procent, eller null när underlaget är för tunt.
   * Bor på ansökningssidan, aldrig på hemskärmen: en arbetslös med 0 svar på
   * 20 ansökningar ska inte mötas av ett underkänt betyg varje morgon.
   */
  replyRate: number | null;
  /** Nästa aktivitetsrapport till Arbetsförmedlingen, med deadline. */
  afReport: AfReportDeadline;
  /** Hela listan, för ytor som räknar själva (CV-jämförelsen). */
  applications: JobApplication[];
}

/** Under så här många ansökningar är svarsfrekvens brus, inte insikt. */
const MIN_APPLICATIONS_FOR_RATE = 5;

export interface PipelineItem {
  id: string;
  jobTitle: string;
  company: string;
  status: JobApplication["current_status"];
  /** Dagar sedan senaste händelse. */
  days: number;
  /** true när ansökan är tyst över gränsen och bör följas upp. */
  needsFollowUp: boolean;
}

const EMPTY: ApplicationsSummary = {
  loaded: false,
  total: 0,
  waitingCount: 0,
  interviewCount: 0,
  followUpCount: 0,
  prevMonthCount: 0,
  weekCount: 0,
  replyCount: 0,
  pipeline: [],
  replyRate: null,
  afReport: nextAfReportDeadline(),
  applications: [],
};

const INTERVIEW_STATUSES = ['interview_invited', 'interview_completed', 'trial_work_completed'];

/** Mandag 00:00 i innevarande vecka, svensk tid. */
function startOfWeekStockholm(now: Date): Date {
  const sv = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(now);
  const midnight = new Date(`${sv}T00:00:00`);
  // getDay: 0 = sondag. Vi vill ha mandag som forsta dag.
  const weekday = (midnight.getDay() + 6) % 7;
  midnight.setDate(midnight.getDate() - weekday);
  return midnight;
}

/** Hur manga dygn sedan senaste handelse. */
function daysSince(iso: string | null, now: Date): number {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 0;
  return Math.max(0, Math.floor((now.getTime() - t) / 86400000));
}

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
        let weekCount = 0;
        let replyCount = 0;

        const weekStart = startOfWeekStockholm(now).getTime();
        const open: PipelineItem[] = [];

        for (const app of apps) {
          const closed = statusIsClosed(app.current_status);
          if (!closed && !statusHasResponse(app.current_status)) waitingCount++;
          if (INTERVIEW_STATUSES.includes(app.current_status ?? '')) interviewCount++;
          if (statusHasResponse(app.current_status)) replyCount++;

          const lastIso = app.status_updated_at ?? app.created_at;
          const last = new Date(lastIso).getTime();
          const silent =
            !closed &&
            app.current_status !== 'offer_received' &&
            !Number.isNaN(last) &&
            now.getTime() - last >= nudgeMs;
          if (silent) followUpCount++;

          if (app.applied_at?.startsWith(prevMonthKey)) prevMonthCount++;

          const appliedAt = new Date(app.applied_at ?? app.created_at).getTime();
          if (!Number.isNaN(appliedAt) && appliedAt >= weekStart) weekCount++;

          // Pagar nu: bara oppna arenden, de avslutade har ingen handling kvar.
          if (!closed) {
            open.push({
              id: app.id,
              jobTitle: app.job_title,
              company: app.company,
              status: app.current_status,
              days: daysSince(lastIso, now),
              needsFollowUp: silent,
            });
          }
        }

        // Mest tidskansligt forst: tysta, sedan intervjuer, sedan aldst.
        open.sort((a, b) => {
          if (a.needsFollowUp !== b.needsFollowUp) return a.needsFollowUp ? -1 : 1;
          const ai = INTERVIEW_STATUSES.includes(a.status ?? '');
          const bi = INTERVIEW_STATUSES.includes(b.status ?? '');
          if (ai !== bi) return ai ? -1 : 1;
          return b.days - a.days;
        });

        setSummary({
          loaded: true,
          total: apps.length,
          waitingCount,
          interviewCount,
          followUpCount,
          prevMonthCount,
          weekCount,
          replyCount,
          pipeline: open.slice(0, 3),
          // Under fem ansökningar säger procenten mer om slumpen än om
          // sökandet, så då visar vi ingen siffra alls.
          replyRate:
            apps.length >= MIN_APPLICATIONS_FOR_RATE
              ? Math.round((replyCount / apps.length) * 100)
              : null,
          afReport: nextAfReportDeadline(now),
          applications: apps,
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
