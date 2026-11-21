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
// och Sökta tjänster aldrig kan säga olika saker om samma ansökan. Tystnaden
// räknas med Jobbsökets motor (src/lib/jobbsok/tystnad.ts): senaste händelsen
// eller senast loggade uppföljningen, inte status_updated_at (som triggern
// sätter även när bara intervjutiden ändras). En loggad uppföljning flyttar
// fram nästa notis till nastaPaminnelse. Saknas uppföljningstabellen räknas
// det som förut, på status_updated_at.

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  statusIsClosed,
  statusHasResponse,
  NO_RESPONSE_NUDGE_DAYS,
  type ApplicationEventType,
} from '@/lib/applications/status';
import { tjanstHref } from '@/lib/jobbsok/adress';
import { dagFor } from '@/lib/jobbsok/datum';
import { arSchemaFel } from '@/lib/jobbsok/schema';
import { HISTORIK_SELECT, harHistorik, tystnadFor, type RadMedHistorik } from '@/lib/jobbsok/tystnad';

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

export interface ApplicationRow extends RadMedHistorik {
  id: string;
  user_id: string;
  job_title: string;
  company: string;
  current_status: ApplicationEventType | null;
  status_updated_at: string | null;
  created_at: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Det gamla sättet, bara när historiken inte gick att läsa. */
function silentDaysFallback(app: ApplicationRow, now: Date): number {
  const raw = app.status_updated_at ?? app.created_at;
  const time = new Date(raw).getTime();
  if (Number.isNaN(time)) return 0;
  return Math.floor((now.getTime() - time) / DAY_MS);
}

export interface Kandidat {
  app: ApplicationRow;
  days: number;
  /** Dagen tystnaden började (motorn); null i reservläget. */
  tystSedan: string | null;
}

/**
 * Urvalet: pågående ansökningar utan svar som är tysta. Med historiken
 * avgör motorn (tystnadFor), annars det gamla sättet. Ren, för testerna.
 */
export function followUpCandidates(rows: readonly ApplicationRow[], now: Date): Kandidat[] {
  const ut: Kandidat[] = [];
  for (const app of rows) {
    if (statusIsClosed(app.current_status)) continue;
    if (statusHasResponse(app.current_status)) continue;
    if (app.current_status === 'offer_received') continue;
    if (harHistorik(app)) {
      const t = tystnadFor(app, now);
      if (t.tyst) ut.push({ app, days: t.dagarTyst, tystSedan: t.tystSedan });
    } else {
      const days = silentDaysFallback(app, now);
      if (days >= NO_RESPONSE_NUDGE_DAYS) ut.push({ app, days, tystSedan: null });
    }
  }
  // Längst tystnad först: den som väntat mest är den som brådskar mest.
  return ut.sort((a, b) => b.days - a.days);
}

/**
 * Har ansökan redan fått en notis för den här tystnaden? En notis inom
 * RENOTIFY_DAYS räknas, utom när den skickades innan den nuvarande tystnaden
 * började: då har användaren följt upp (eller något hänt) efter notisen, och
 * nästa påminnelse gäller från nastaPaminnelse.
 */
export function redanNotifierad(k: Kandidat, notiser: readonly string[]): boolean {
  if (notiser.length === 0) return false;
  if (!k.tystSedan) return true;
  return notiser.some((iso) => {
    const dag = dagFor(iso);
    return !dag || dag >= k.tystSedan!;
  });
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

  // Bara pågående ansökningar är intressanta. Regeln bor i status.ts och
  // tillämpas i koden (followUpCandidates); statusfiltret i frågan är samma
  // mängd och finns bara för att hålla frågan liten under taket på 1000 rader.
  const cutoff = new Date(now.getTime() - NO_RESPONSE_NUDGE_DAYS * DAY_MS).toISOString();
  const cutoffDag = dagFor(cutoff);

  // En samlad fråga för alla konton, med händelserna och uppföljningarna
  // inbäddade (inget per rad). Bara lägen som kan få notisen (ingen status,
  // sökt, inget svar: samma mängd som filtret nedan) och bara de som kan ha
  // varit tysta i NO_RESPONSE_NUDGE_DAYS: sökta före gränsen, eller med en
  // gammal statusändring som förut.
  const COLUMNS = 'id, user_id, job_title, company, current_status, status_updated_at, applied_at, created_at';
  const oldFilter = `status_updated_at.lte.${cutoff},and(status_updated_at.is.null,created_at.lte.${cutoff})`;
  let { data, error } = await (admin as any)
    .from('job_applications')
    .select(`${COLUMNS}, ${HISTORIK_SELECT}`)
    .or('current_status.is.null,current_status.in.(applied,no_response)')
    .or(`applied_at.lte.${cutoffDag},${oldFilter}`)
    .limit(1000);

  // Saknas tabellen eller kolumnen: dagens fråga och dagens regel.
  if (error && arSchemaFel(error)) {
    ({ data, error } = await (admin as any)
      .from('job_applications')
      .select('id, user_id, job_title, company, current_status, status_updated_at, created_at')
      .or(oldFilter)
      .limit(1000));
  }

  if (error) {
    console.error('[followUp] kunde inte läsa ansökningar:', error.message);
    return result;
  }

  const rows = (data ?? []) as ApplicationRow[];
  const sorted = followUpCandidates(rows, now);

  result.candidates = sorted.length;
  if (sorted.length === 0) return result;

  // Redan notifierade ansökningar inom fönstret. En fråga för hela körningen
  // i stället för en per ansökan.
  const since = new Date(now.getTime() - RENOTIFY_DAYS * DAY_MS).toISOString();
  const { data: existing } = await (admin as any)
    .from('notifications')
    .select('metadata, created_at')
    .eq('type', FOLLOW_UP_NOTIFICATION_TYPE)
    .gte('created_at', since)
    .limit(5000);

  const notiserPerAnsokan = new Map<string, string[]>();
  for (const row of (existing ?? []) as Array<{ metadata?: { applicationId?: unknown } | null; created_at?: string }>) {
    const id = row?.metadata?.applicationId;
    if (typeof id !== 'string') continue;
    const lista = notiserPerAnsokan.get(id) ?? [];
    lista.push(row.created_at ?? '');
    notiserPerAnsokan.set(id, lista);
  }

  const perUser = new Map<string, number>();
  const toInsert: Array<Record<string, unknown>> = [];

  for (const kandidat of sorted) {
    const { app, days } = kandidat;
    if (toInsert.length >= MAX_PER_RUN) break;
    if (redanNotifierad(kandidat, notiserPerAnsokan.get(app.id) ?? [])) {
      result.skipped += 1;
      continue;
    }

    const used = perUser.get(app.user_id) ?? 0;
    if (used >= MAX_PER_USER) {
      result.skipped += 1;
      continue;
    }
    perUser.set(app.user_id, used + 1);

    toInsert.push({
      user_id: app.user_id,
      type: FOLLOW_UP_NOTIFICATION_TYPE,
      title: `${app.company} har inte hört av sig`,
      message: `Din ansökan som ${app.job_title} har varit tyst i ${days} dagar. Ett kort mejl som frågar hur processen ligger till räcker.`,
      action_url: tjanstHref(app.id, 'folj-upp'),
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
