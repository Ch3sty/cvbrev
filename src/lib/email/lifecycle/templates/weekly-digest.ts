// src/lib/email/lifecycle/templates/weekly-digest.ts
// Veckosammanfattningen (docs/plan-inloggat-omdesign.md, avsnitt 8 och våg 1
// punkt 11).
//
// Det enda mail i systemet som ger innan det ber. Alla andra livscykelmail är
// kommersiella, och ett produktlöfte som bara hör av sig när det vill ha betalt
// läser som en säljmaskin mot en målgrupp som ofta är arbetslös. Därför finns
// här ingen prissida-CTA, ingen uppgraderingsrad och ingen förlustsummering.
//
// Innehållet kommer uteslutande ur job_applications och job_application_events,
// alltså ur användarens eget arbete. Statusreglerna delas med appen
// (src/lib/applications/status.ts) så mailet och Sökta tjänster aldrig kan
// säga olika saker om samma ansökan.

import type { LifecycleEmail, LifecycleContext } from '../types';
import { renderLayout, heading, paragraph, escapeHtml, firstName } from './layout';
import { unsubscribeDigestUrl } from '../../unsubscribe';
import {
  statusIsClosed,
  statusHasResponse,
  NO_RESPONSE_NUDGE_DAYS,
  type ApplicationEventType,
} from '@/lib/applications/status';

export const WEEKLY_DIGEST_TYPE = 'weekly_digest';

/** Hur många tysta ansökningar vi nämner vid namn. Fler blir en lista, inte ett råd. */
const MAX_FOLLOW_UPS = 2;

interface DigestApplication {
  job_title: string;
  company: string;
  applied_at: string;
  current_status: ApplicationEventType | null;
  status_updated_at: string | null;
  created_at: string;
}

export interface WeeklyDigestData {
  /** Sökta de senaste sju dygnen. */
  appliedThisWeek: number;
  /** Pågående utan svar ännu, oavsett när de söktes. */
  waiting: number;
  /** I intervjuprocess just nu. */
  interviews: number;
  /** Svar som kommit in de senaste sju dygnen. */
  repliesThisWeek: number;
  /** Tysta i NO_RESPONSE_NUDGE_DAYS dagar, de vi föreslår uppföljning på. */
  followUps: Array<{ title: string; company: string; days: number }>;
  /** Totalt antal ansökningar i loggen. */
  total: number;
}

const INTERVIEW_STATUSES: ApplicationEventType[] = [
  'interview_invited',
  'interview_completed',
  'trial_work_completed',
];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Senaste aktivitet på ansökan: statusändring om den finns, annars skapandet. */
function lastActivity(app: DigestApplication): number {
  const raw = app.status_updated_at ?? app.created_at;
  const time = new Date(raw).getTime();
  return Number.isNaN(time) ? Date.now() : time;
}

/**
 * Räknar veckan ur ansökningsloggen. Exporterad för att kunna testas och för
 * att shouldSend ska kunna avgöra om det finns något att berätta utan att
 * rendera hela mailet.
 */
export function summarize(
  apps: DigestApplication[],
  now: Date = new Date()
): WeeklyDigestData {
  const weekAgo = now.getTime() - 7 * DAY_MS;
  const nudgeMs = NO_RESPONSE_NUDGE_DAYS * DAY_MS;

  const data: WeeklyDigestData = {
    appliedThisWeek: 0,
    waiting: 0,
    interviews: 0,
    repliesThisWeek: 0,
    followUps: [],
    total: apps.length,
  };

  const candidates: Array<{ title: string; company: string; days: number }> = [];

  for (const app of apps) {
    const applied = new Date(app.applied_at).getTime();
    if (!Number.isNaN(applied) && applied >= weekAgo) data.appliedThisWeek += 1;

    const closed = statusIsClosed(app.current_status);
    const responded = statusHasResponse(app.current_status);

    if (!closed && !responded) data.waiting += 1;
    if (INTERVIEW_STATUSES.includes(app.current_status as ApplicationEventType)) {
      data.interviews += 1;
    }

    // Ett svar den här veckan: status bytte till något annat än sökt/inget svar.
    if (responded && app.status_updated_at) {
      const changed = new Date(app.status_updated_at).getTime();
      if (!Number.isNaN(changed) && changed >= weekAgo) data.repliesThisWeek += 1;
    }

    // Uppföljningskandidat: samma regel som nudgen i appen.
    if (!closed && !responded && app.current_status !== 'offer_received') {
      const silent = now.getTime() - lastActivity(app);
      if (silent >= nudgeMs) {
        candidates.push({
          title: app.job_title,
          company: app.company,
          days: Math.floor(silent / DAY_MS),
        });
      }
    }
  }

  // Längst tystnad först: den som väntat mest är den som brådskar mest.
  candidates.sort((a, b) => b.days - a.days);
  data.followUps = candidates.slice(0, MAX_FOLLOW_UPS);

  return data;
}

async function loadApplications(ctx: LifecycleContext): Promise<DigestApplication[]> {
  const { data, error } = await (ctx.admin as any)
    .from('job_applications')
    .select('job_title, company, applied_at, current_status, status_updated_at, created_at')
    .eq('user_id', ctx.userId);

  if (error) {
    console.error('[weekly_digest] kunde inte läsa ansökningar:', error.message);
    return [];
  }
  return (data ?? []) as DigestApplication[];
}

/** "3 sökta" men "1 sökt". Svenska räkneord ska inte skava. */
function count(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

/** Sifferraden som en tabell, eftersom Outlook inte kan flexbox. */
function statsRow(data: WeeklyDigestData): string {
  const cells = [
    { value: data.appliedThisWeek, label: data.appliedThisWeek === 1 ? 'sökt jobb' : 'sökta jobb' },
    { value: data.waiting, label: 'väntar på svar' },
    { value: data.interviews, label: data.interviews === 1 ? 'intervju' : 'intervjuer' },
  ];

  const tds = cells
    .map(
      (cell) =>
        `<td width="33%" style="padding:0 6px;text-align:center;vertical-align:top;">
           <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:1.2;font-weight:700;color:#0F172A;">${cell.value}</p>
           <p style="margin:2px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;color:#64748B;">${cell.label}</p>
         </td>`
    )
    .join('');

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${tds}</tr></table>`;
}

/**
 * Veckans text. Tre lägen, eftersom samma mening inte kan bära både "du sökte
 * sju jobb" och "du sökte inget". Vi påpekar aldrig en tom vecka som ett
 * misslyckande: den som varit sjuk eller haft en tung vecka ska inte få det
 * skrivet på näsan av sin jobbsökartjänst.
 */
function weekSentence(data: WeeklyDigestData, greeting: string): string {
  if (data.appliedThisWeek > 0 && data.repliesThisWeek > 0) {
    return `${greeting} den här veckan sökte du ${count(data.appliedThisWeek, 'jobb', 'jobb')} och fick ${count(data.repliesThisWeek, 'svar', 'svar')}.`;
  }
  if (data.appliedThisWeek > 0) {
    return `${greeting} den här veckan sökte du ${count(data.appliedThisWeek, 'jobb', 'jobb')}.`;
  }
  if (data.repliesThisWeek > 0) {
    return `${greeting} du sökte inget nytt den här veckan, men ${data.repliesThisWeek === 1 ? 'ett svar kom in' : `${data.repliesThisWeek} svar kom in`}.`;
  }
  return `${greeting} lugn vecka i loggen. Dina ${count(data.waiting, 'ansökan', 'ansökningar')} ligger kvar och väntar.`;
}

/** Uppföljningsrutan, det enda råd mailet ger. */
function followUpNote(data: WeeklyDigestData): string | undefined {
  if (data.followUps.length === 0) return undefined;

  const rows = data.followUps
    .map(
      (item) =>
        `<p style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#475569;">
           <strong style="color:#0F172A;">${escapeHtml(item.title)}</strong> hos ${escapeHtml(item.company)}, tyst i ${item.days} dagar
         </p>`
    )
    .join('');

  const intro =
    data.followUps.length === 1
      ? 'Den här har det varit tyst om ett tag:'
      : 'De här har det varit tyst om ett tag:';

  return `<p style="margin:0 0 10px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;font-weight:600;color:#0F172A;">${intro}</p>${rows}<p style="margin:10px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#64748B;">Ett kort mejl som frågar hur processen ligger till räcker. Det är inte påträngande, det är att visa intresse.</p>`;
}

export const weeklyDigest: LifecycleEmail = {
  type: WEEKLY_DIGEST_TYPE,

  /**
   * Skickas bara till den som har något att sammanfatta. Ett veckobrev om
   * ingenting är precis den sortens utskick som lär folk att ignorera oss.
   * Avregistreringen och fyraveckorsregeln kontrolleras i urvalet
   * (scheduleWeeklyDigests), men dubbelkollas här eftersom raden kan ha legat
   * i kön över en avregistrering.
   */
  shouldSend: async (ctx) => {
    if (ctx.profile.weekly_digest_opt_out === true) return false;
    const apps = await loadApplications(ctx);
    if (apps.length === 0) return false;

    const data = summarize(apps);
    return data.appliedThisWeek > 0 || data.waiting > 0 || data.repliesThisWeek > 0;
  },

  render: async (ctx) => {
    const apps = await loadApplications(ctx);
    const data = summarize(apps);
    const name = firstName(ctx.profile.full_name);
    const greeting = name ? `Hej ${name},` : 'Hej,';

    const subject =
      data.appliedThisWeek > 0
        ? `Din vecka: ${count(data.appliedThisWeek, 'sökt jobb', 'sökta jobb')}`
        : 'Din vecka i jobbsökandet';

    const preheader =
      data.followUps.length > 0
        ? `${count(data.followUps.length, 'ansökan', 'ansökningar')} som är värd en påminnelse.`
        : `${count(data.waiting, 'ansökan', 'ansökningar')} väntar fortfarande på svar.`;

    return {
      subject,
      preheader,
      html: renderLayout({
        type: WEEKLY_DIGEST_TYPE,
        userId: ctx.userId,
        preheader,
        body:
          heading('Din vecka i jobbsökandet') +
          paragraph(weekSentence(data, greeting)) +
          statsRow(data),
        note: followUpNote(data),
        ctaLabel: 'Öppna dina ansökningar',
        ctaUrl: '/dashboard/sokta-tjanster',
        footNote:
          'Du får den här sammanfattningen varje söndag så länge du har ansökningar igång.',
        unsubscribe: {
          url: unsubscribeDigestUrl(ctx.userId),
          label: 'Stäng av veckosammanfattningen',
          consentLine:
            'Du får det här mailet för att du loggar ansökningar på jobbcoach.ai.',
        },
      }),
    };
  },
};
