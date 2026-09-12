// src/lib/notifications/followUp.ts
// Uppföljningsnotiser i appen (docs/plan-inloggat-omdesign.md, våg 2 punkt 20).
//
// Notisklockan hade tidigare bara innehåll för de konton som fick
// rekryterarintresse, alltså nästan ingen: en klocka som aldrig ringer är en
// tom yta i headern. Den här jobbet ger den innehåll för alla som loggar
// ansökningar, och gör det på något användaren faktiskt vill veta: att en
// ansökan har blivit liggande.
//
// Regeln är densamma som nudgen i appen (NO_RESPONSE_NUDGE_DAYS), så notisen
// och Sökta tjänster aldrig kan säga olika saker om samma ansökan.

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  statusIsClosed,
  statusHasResponse,
  NO_RESPONSE_NUDGE_DAYS,
  type ApplicationEventType,
} from '@/lib/applications/status';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any, any, any>;

export const FOLLOW_UP_NOTIFICATION_TYPE = 'application_follow_up';

/**
 * Hur länge en notis om samma ansökan räknas som redan skickad. Tystnaden
 * fortsätter ju varje dag, så utan spärr skulle samma ansökan ge en notis per
 * dygn tills den stängs. En påminnelse i månaden räcker.
 */
const RENOTIFY_DAYS = 30;

/** Tak per körning, så en stor backlog inte fyller någons klocka på en gång. */
const MAX_PER_RUN = 200;
/** Tak per användare och körning, av samma skäl men på individnivå. */
const MAX_PER_USER = 3;

interface ApplicationRow {
  id: string;
  user_id: string;
  job_title: string;
  company: string;
  current_status: ApplicationEventType | null;
  status_updated_at: string | null;
  created_at: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function silentDays(app: ApplicationRow, now: Date): number {
  const raw = app.status_updated_at ?? app.created_at;
  const time = new Date(raw).getTime();
  if (Number.isNaN(time)) return 0;
  return Math.floor((now.getTime() - time) / DAY_MS);
}

export interface FollowUpResult {
  candidates: number;
  created: number;
  skipped: number;
}

/**
 * Skapar en notis per ansökan som varit tyst i NO_RESPONSE_NUDGE_DAYS dagar.
 * Körs i cronens morgonslot. Idempotent via kontroll mot befintliga notiser:
 * samma ansökan ger inte en ny notis inom RENOTIFY_DAYS.
 */
export async function createFollowUpNotifications(
  admin: AnySupabase,
  now: Date = new Date()
): Promise<FollowUpResult> {
  const result: FollowUpResult = { candidates: 0, created: 0, skipped: 0 };

  // Bara pågående ansökningar är intressanta. Vi filtrerar på status i koden
  // i stället för i frågan, eftersom "har fått svar" och "avslutad" är
  // härledda begrepp som bor i status.ts och inte ska dupliceras i SQL.
  const cutoff = new Date(now.getTime() - NO_RESPONSE_NUDGE_DAYS * DAY_MS).toISOString();

  const { data, error } = await (admin as any)
    .from('job_applications')
    .select('id, user_id, job_title, company, current_status, status_updated_at, created_at')
    .or(`status_updated_at.lte.${cutoff},and(status_updated_at.is.null,created_at.lte.${cutoff})`)
    .limit(1000);

  if (error) {
    console.error('[followUp] kunde inte läsa ansökningar:', error.message);
    return result;
  }

  const rows = (data ?? []) as ApplicationRow[];

  const candidates = rows.filter((app) => {
    if (statusIsClosed(app.current_status)) return false;
    if (statusHasResponse(app.current_status)) return false;
    if (app.current_status === 'offer_received') return false;
    return silentDays(app, now) >= NO_RESPONSE_NUDGE_DAYS;
  });

  result.candidates = candidates.length;
  if (candidates.length === 0) return result;

  // Redan notifierade ansökningar inom fönstret. En fråga för hela körningen
  // i stället för en per ansökan.
  const since = new Date(now.getTime() - RENOTIFY_DAYS * DAY_MS).toISOString();
  const { data: existing } = await (admin as any)
    .from('notifications')
    .select('metadata')
    .eq('type', FOLLOW_UP_NOTIFICATION_TYPE)
    .gte('created_at', since)
    .limit(5000);

  const alreadyNotified = new Set<string>(
    (existing ?? [])
      .map((row: any) => row?.metadata?.applicationId)
      .filter((id: unknown): id is string => typeof id === 'string')
  );

  const perUser = new Map<string, number>();
  const toInsert: Array<Record<string, unknown>> = [];

  // Längst tystnad först: den som väntat mest är den som brådskar mest.
  const sorted = [...candidates].sort((a, b) => silentDays(b, now) - silentDays(a, now));

  for (const app of sorted) {
    if (toInsert.length >= MAX_PER_RUN) break;
    if (alreadyNotified.has(app.id)) {
      result.skipped += 1;
      continue;
    }

    const used = perUser.get(app.user_id) ?? 0;
    if (used >= MAX_PER_USER) {
      result.skipped += 1;
      continue;
    }
    perUser.set(app.user_id, used + 1);

    const days = silentDays(app, now);
    toInsert.push({
      user_id: app.user_id,
      type: FOLLOW_UP_NOTIFICATION_TYPE,
      title: `${app.company} har inte hört av sig`,
      message: `Din ansökan som ${app.job_title} har varit tyst i ${days} dagar. Ett kort mejl som frågar hur processen ligger till räcker.`,
      action_url: `/dashboard/sokta-tjanster/${app.id}`,
      metadata: { applicationId: app.id, silentDays: days },
    });
  }

  if (toInsert.length === 0) return result;

  const { error: insertError } = await (admin as any).from('notifications').insert(toInsert);
  if (insertError) {
    console.error('[followUp] kunde inte skapa notiser:', insertError.message);
    return result;
  }

  result.created = toInsert.length;
  console.log(
    `[followUp] kandidater=${result.candidates} skapade=${result.created} hoppade=${result.skipped}`
  );
  return result;
}
