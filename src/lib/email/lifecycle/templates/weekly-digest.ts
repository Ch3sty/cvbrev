// src/lib/email/lifecycle/templates/weekly-digest.ts
// Veckosammanfattningen (docs/plan-inloggat-omdesign.md, avsnitt 8 och våg 1
// punkt 11).
//
// Det enda mail i systemet som ger innan det ber. Alla andra livscykelmail är
// kommersiella, och ett produktlöfte som bara hör av sig när det vill ha betalt
// läser som en säljmaskin mot en målgrupp som ofta är arbetslös. Därför finns
// här ingen prissida-CTA, ingen uppgraderingsrad och ingen förlustsummering.
//
// Innehållet kommer uteslutande ur job_applications, job_application_events och
// job_application_followups, alltså ur användarens eget arbete. Statusreglerna
// delas med appen (src/lib/applications/status.ts) så mailet och Sökta
// tjänster aldrig kan säga olika saker om samma ansökan.
//
// Tystnaden räknas med Jobbsökets motor (src/lib/jobbsok/tystnad.ts): senaste
// händelsen eller senast loggade uppföljningen, inte status_updated_at. En
// tjänst som användaren har följt upp nämns alltså inte förrän nästa
// påminnelse (nastaPaminnelse). Saknas uppföljningstabellen faller läsningen
// tillbaka till status_updated_at som förut.
//
// Intervjulägena (Jobbsöket omgång 2, byggspec 2.7): en genomförd intervju
// eller ett genomfört provjobb utan besked på sju dagar nämns i ett eget
// stycke ("Här väntar du på besked:"). En kallelse, med eller utan tid, nämns
// aldrig i rutan, och shouldSend ändras inte av besked-raderna.

import type { LifecycleEmail, LifecycleContext } from '../types';
import { renderLayout, heading, paragraph, escapeHtml, firstName } from './layout';
import { withUtm } from '../schedule';
import { unsubscribeDigestUrl } from '../../unsubscribe';
import {
  statusIsClosed,
  statusHasResponse,
  NO_RESPONSE_NUDGE_DAYS,
  type ApplicationEventType,
} from '@/lib/applications/status';
import { tjanstHref } from '@/lib/jobbsok/adress';
import { langDag } from '@/lib/jobbsok/datum';
import type { Dag } from '@/lib/jobbsok/typer';
import { arSchemaFel } from '@/lib/jobbsok/schema';
import { HISTORIK_SELECT, harHistorik, tystnadFor, type RadMedHistorik } from '@/lib/jobbsok/tystnad';

export const WEEKLY_DIGEST_TYPE = 'weekly_digest';

/** Hur många tysta ansökningar vi nämner vid namn. Fler blir en lista, inte ett råd. */
const MAX_FOLLOW_UPS = 2;
/** Hur många tjänster som väntar besked efter intervju eller provjobb vi nämner vid namn. */
const MAX_BESKED = 2;
/** Högst tre rader i rutan totalt: besked först, tysta ansökningar fyller upp. */
const MAX_RADER = 3;

export interface DigestApplication extends RadMedHistorik {
  id?: string;
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
  followUps: Array<{ id?: string; title: string; company: string; days: number }>;
  /**
   * Genomförd intervju eller provjobb utan besked i sju dagar (motorn säger
   * tyst och sorten är intervju eller provjobb), längst väntan först, högst
   * två. `dag` är intervjudagen eller provjobbsdagen, 'YYYY-MM-DD'.
   */
  besked: Array<{ id?: string; title: string; company: string; dag: Dag; moment: 'intervju' | 'provjobb' }>;
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
    besked: [],
    total: apps.length,
  };

  const candidates: WeeklyDigestData['followUps'] = [];
  const beskedKandidater: Array<WeeklyDigestData['besked'][number] & { days: number }> = [];

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

    // Väntar besked efter intervju eller provjobb: bara med historiken, och
    // bara när motorn säger tyst med den sorten. En kallelse blir aldrig tyst.
    if (!closed && harHistorik(app) && (app.current_status === 'interview_completed' || app.current_status === 'trial_work_completed')) {
      const t = tystnadFor(app, now);
      if (t.tyst && (t.typ === 'intervju' || t.typ === 'provjobb') && t.momentDag) {
        beskedKandidater.push({ id: app.id, title: app.job_title, company: app.company, dag: t.momentDag, moment: t.typ, days: t.dagarTyst });
      }
    }

    // Uppföljningskandidat: bara de som väntar på första svaret (som förut),
    // tystnaden med motorns regler när historiken är inläst.
    if (!closed && !responded && app.current_status !== 'offer_received') {
      if (harHistorik(app)) {
        const t = tystnadFor(app, now);
        if (t.tyst) candidates.push({ id: app.id, title: app.job_title, company: app.company, days: t.dagarTyst });
      } else {
        const silent = now.getTime() - lastActivity(app);
        if (silent >= nudgeMs) {
          candidates.push({
            id: app.id,
            title: app.job_title,
            company: app.company,
            days: Math.floor(silent / DAY_MS),
          });
        }
      }
    }
  }

  // Längst tystnad först: den som väntat mest är den som brådskar mest.
  // Besked räknas först; tysta ansökningar fyller upp till MAX_RADER.
  beskedKandidater.sort((a, b) => b.days - a.days);
  data.besked = beskedKandidater.slice(0, MAX_BESKED).map(({ days: _days, ...rest }) => rest);
  candidates.sort((a, b) => b.days - a.days);
  data.followUps = candidates.slice(0, Math.min(MAX_FOLLOW_UPS, MAX_RADER - data.besked.length));

  return data;
}

const DIGEST_COLUMNS = 'id, job_title, company, applied_at, current_status, status_updated_at, created_at';

async function loadApplications(ctx: LifecycleContext): Promise<DigestApplication[]> {
  // Händelserna och uppföljningarna bäddas in i samma fråga. Saknas
  // tabellen eller kolumnen läses raderna som förut, utan historik.
  let { data, error } = await (ctx.admin as any)
    .from('job_applications')
    .select(`${DIGEST_COLUMNS}, ${HISTORIK_SELECT}`)
    .eq('user_id', ctx.userId);
  if (error && arSchemaFel(error)) {
    ({ data, error } = await (ctx.admin as any)
      .from('job_applications')
      .select(DIGEST_COLUMNS)
      .eq('user_id', ctx.userId));
  }

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

/**
 * Uppföljningsrutan, det enda råd mailet ger. Tjänstetiteln länkar till
 * uppföljningen på den sökta tjänsten (utkastet), med samma utm som knappen.
 */
export function followUpNote(data: WeeklyDigestData): string | undefined {
  const besked = beskedNote(data, data.followUps.length > 0);
  if (data.followUps.length === 0) return besked;

  const rows = data.followUps
    .map((item) => {
      const titel = `<strong style="color:#0F172A;">${escapeHtml(item.title)}</strong>`;
      const lank = item.id
        ? `<a href="${escapeHtml(withUtm(tjanstHref(item.id, 'folj-upp'), WEEKLY_DIGEST_TYPE))}" target="_blank" style="color:#0F172A;text-decoration:underline;">${titel}</a>`
        : titel;
      return `<p style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#475569;">
           ${lank} hos ${escapeHtml(item.company)}, tyst i ${item.days} dagar
         </p>`;
    })
    .join('');

  const intro =
    data.followUps.length === 1
      ? 'Den här har det varit tyst om ett tag:'
      : 'De här har det varit tyst om ett tag:';

  const tyst = `<p style="margin:0 0 10px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;font-weight:600;color:#0F172A;">${intro}</p>${rows}<p style="margin:10px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#64748B;">Ett kort mejl som frågar hur processen ligger till räcker. Det är inte påträngande, det är att visa intresse.</p>`;
  return besked ? `${besked}<div style="height:18px;line-height:18px;">&nbsp;</div>${tyst}` : tyst;
}

/** Titeln länkad till uppföljningen på den sökta tjänsten, med samma utm som knappen. */
function titelLank(item: { id?: string; title: string }): string {
  const titel = `<strong style="color:#0F172A;">${escapeHtml(item.title)}</strong>`;
  return item.id
    ? `<a href="${escapeHtml(withUtm(tjanstHref(item.id, 'folj-upp'), WEEKLY_DIGEST_TYPE))}" target="_blank" style="color:#0F172A;text-decoration:underline;">${titel}</a>`
    : titel;
}

/**
 * Stycket om tjänster som väntar besked efter intervju eller provjobb, eller
 * undefined. `medTysta`: stycket om tysta ansökningar visas också, och då står
 * meningen om mejlet bara i dess avslutning.
 */
export function beskedNote(data: Pick<WeeklyDigestData, 'besked'>, medTysta = false): string | undefined {
  if (!data.besked || data.besked.length === 0) return undefined;
  const rows = data.besked
    .map((item) => {
      const moment = item.moment === 'intervju' ? 'intervjun' : 'provjobbet';
      return `<p style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#475569;">
           ${titelLank(item)} hos ${escapeHtml(item.company)}, ${moment} var den ${escapeHtml(langDag(item.dag))}
         </p>`;
    })
    .join('');
  return `<p style="margin:0 0 10px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;font-weight:600;color:#0F172A;">Här väntar du på besked:</p>${rows}<p style="margin:10px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#64748B;">${medTysta ? 'Fråga när du kan vänta besked.' : 'Fråga när du kan vänta besked. Ett kort mejl räcker.'}</p>`;
}

/** Preheadern: om besked när någon tjänst väntar besked, annars som förut. */
export function digestPreheader(data: WeeklyDigestData): string {
  if (data.besked.length > 0) return 'Dags att fråga om besked.';
  return data.followUps.length > 0
    ? `${count(data.followUps.length, 'ansökan', 'ansökningar')} som är värd en påminnelse.`
    : `${count(data.waiting, 'ansökan', 'ansökningar')} väntar fortfarande på svar.`;
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

    const preheader = digestPreheader(data);

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
