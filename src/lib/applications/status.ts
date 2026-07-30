// src/lib/applications/status.ts
// Statusmodellen för Sökta tjänster. Klientsäker (inga server-beroenden).
//
// Sanningskällan är händelseloggen (job_application_events). En ansökans
// "aktuella status" är alltid den senaste händelsen och sätts av en
// databastrigger, aldrig av användaren direkt. "Ej svar" loggas inte manuellt
// utan visas som en mjuk nudge efter NO_RESPONSE_NUDGE_DAYS dagars tystnad.

export type ApplicationEventType =
  | 'applied'
  | 'no_response'
  | 'rejected'
  | 'interview_invited'
  | 'interview_completed'
  | 'trial_work_completed'
  | 'offer_received'
  | 'accepted'
  | 'declined';

export type ApplicationChannel = 'ad' | 'unsolicited' | 'network';

export interface JobApplication {
  id: string;
  user_id: string;
  job_title: string;
  company: string;
  location: string | null;
  application_channel: ApplicationChannel;
  job_ad_url: string | null;
  letter_id: string | null;
  cv_id: string | null;
  notes: string | null;
  applied_at: string;
  current_status: ApplicationEventType | null;
  status_updated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobApplicationEvent {
  id: string;
  application_id: string;
  event_type: ApplicationEventType;
  interview_round: number | null;
  note: string | null;
  occurred_at: string;
  created_at: string;
}

/** Antal dagars tystnad innan "inget hört än"-nudgen visas. */
export const NO_RESPONSE_NUDGE_DAYS = 12;

interface StatusMeta {
  /** Kort etikett för pills och chips. */
  label: string;
  /** Etikett i tidslinjen, kan skilja sig från pill-etiketten. */
  timelineLabel: string;
  /** Tailwind-klasser för status-pill (bakgrund + text). Återhållsamma toner:
   *  avslag är slate, inte larmröd - processen ska inte kännas som ett straff. */
  pillClass: string;
  /** Punktfärg i tidslinje och progress-dots. */
  dotClass: string;
}

export const STATUS_META: Record<ApplicationEventType, StatusMeta> = {
  applied: {
    label: 'Sökt',
    timelineLabel: 'Ansökan skickad',
    pillClass: 'bg-orange-50 text-orange-700 border border-orange-200',
    dotClass: 'bg-orange-500',
  },
  no_response: {
    label: 'Inget svar',
    timelineLabel: 'Inget svar',
    pillClass: 'bg-slate-100 text-slate-600 border border-slate-200',
    dotClass: 'bg-slate-400',
  },
  rejected: {
    label: 'Avslag',
    timelineLabel: 'Fick avslag',
    pillClass: 'bg-slate-100 text-slate-600 border border-slate-200',
    dotClass: 'bg-slate-400',
  },
  interview_invited: {
    label: 'Kallad till intervju',
    timelineLabel: 'Kallad till intervju',
    pillClass: 'bg-blue-50 text-blue-700 border border-blue-200',
    dotClass: 'bg-blue-500',
  },
  interview_completed: {
    label: 'Intervju genomförd',
    timelineLabel: 'Genomförde intervju',
    pillClass: 'bg-blue-50 text-blue-700 border border-blue-200',
    dotClass: 'bg-blue-500',
  },
  trial_work_completed: {
    label: 'Provjobbat',
    timelineLabel: 'Provjobbade',
    pillClass: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    dotClass: 'bg-indigo-500',
  },
  offer_received: {
    label: 'Erbjudande',
    timelineLabel: 'Fick erbjudande',
    pillClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  accepted: {
    label: 'Tackade ja',
    timelineLabel: 'Tackade ja till jobbet',
    pillClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  declined: {
    label: 'Tackade nej',
    timelineLabel: 'Tackade nej till erbjudandet',
    pillClass: 'bg-slate-100 text-slate-600 border border-slate-200',
    dotClass: 'bg-slate-400',
  },
};

export const CHANNEL_META: Record<ApplicationChannel, { label: string; short: string }> = {
  ad: { label: 'Svar på annons', short: 'Annons' },
  unsolicited: { label: 'Spontanansökan', short: 'Spontan' },
  network: { label: 'Via kontakt eller nätverk', short: 'Nätverk' },
};

/** Händelsetyper användaren kan logga manuellt ("Ej svar" är beräknat, inte loggat). */
export const LOGGABLE_EVENT_TYPES: ApplicationEventType[] = [
  'interview_invited',
  'interview_completed',
  'trial_work_completed',
  'offer_received',
  'accepted',
  'declined',
  'rejected',
];

const INTERVIEW_STAGE: ApplicationEventType[] = [
  'interview_invited',
  'interview_completed',
  'trial_work_completed',
];
const OFFER_STAGE: ApplicationEventType[] = ['offer_received', 'accepted', 'declined'];

/** Har ansökan fått någon form av svar (utifrån aktuell status)? */
export function statusHasResponse(status: ApplicationEventType | null): boolean {
  return status !== null && status !== 'applied' && status !== 'no_response';
}

/** Är processen avslutad (inget mer väntas hända)? */
export function statusIsClosed(status: ApplicationEventType | null): boolean {
  return status === 'rejected' || status === 'accepted' || status === 'declined';
}

/**
 * Steg 0-3 för progress-dots på ansökningskortet:
 * Sökt -> Svar -> Intervju -> Erbjudande.
 */
export function statusProgressStep(status: ApplicationEventType | null): number {
  if (status === null || status === 'applied' || status === 'no_response') return 0;
  if (OFFER_STAGE.includes(status)) return 3;
  if (INTERVIEW_STAGE.includes(status)) return 2;
  return 1; // rejected: fick svar men kom inte vidare
}

/** Ska "inget hört än"-nudgen visas för den här ansökan? */
export function shouldShowNoResponseNudge(
  status: ApplicationEventType | null,
  lastActivityIso: string | null,
  now: Date = new Date()
): boolean {
  if (statusIsClosed(status)) return false;
  if (status === 'offer_received') return false;
  if (!lastActivityIso) return false;
  const last = new Date(lastActivityIso).getTime();
  if (Number.isNaN(last)) return false;
  const days = (now.getTime() - last) / (1000 * 60 * 60 * 24);
  return days >= NO_RESPONSE_NUDGE_DAYS;
}

/** Utfallsklasser från statistik-RPC:ns byOutcome (bygger tratt och Sankey). */
export type ApplicationOutcome =
  | 'accepted'
  | 'declined'
  | 'offer_pending'
  | 'rejected_after_interview'
  | 'rejected_no_interview'
  | 'in_interview'
  | 'awaiting';

export interface ApplicationStats {
  totalApplications: number;
  respondedCount: number;
  interviewedCount: number;
  offerCount: number;
  acceptedCount: number;
  byOutcome: { outcome: ApplicationOutcome; applications: number }[];
  byMonth: { month: string; applications: number }[];
  byWeek: { week: string; applications: number }[];
  byChannel: { channel: ApplicationChannel; applications: number }[];
}
