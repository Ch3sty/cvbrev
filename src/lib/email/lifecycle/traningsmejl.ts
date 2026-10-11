// src/lib/email/lifecycle/traningsmejl.ts
// =============================================================================
// Träningsmejlen (riktlinjer tester v2, "Ägarbeslut 2026-10-11 kväll", som
// ersätter avsnitt 4.4). Högst två per användare, alla med avregistrering,
// via hjälpredans schema i morgonslotten. Ingen egen cron.
//
//   pass_dag2           dag 2 efter Nivåkollen, på vald tidpunkt
//   dagen_fore_provet   provdatum minus ett, 08:00
//   vecka_utan_datum    dag 7 efter Nivåkollen, utan provdatum
//
// Här bor det som både urvalet (runner.ts), mallarna (templates/traning.ts)
// och passets slutförande behöver: klockslagen i svensk tid, läsningarna av
// Nivåkollen, planen och redan skickade mejl, och avbrytSchemalagtPassmejl.
//
// test_planer läses med select('*') och pass_tid behandlas som null när
// kolumnen saknas: migreringen 20261012090000 är inte körd i prod.
// =============================================================================

import { Resend } from 'resend';
import type { AnySupabase } from './types';
import { cancelScheduled } from './schedule';
import { arGiltigDag, dagSthlm, laggTill, type Dag } from '@/lib/traning/datum';

export const PASS_DAG2_TYPE = 'pass_dag2';
export const DAGEN_FORE_PROVET_TYPE = 'dagen_fore_provet';
export const VECKA_UTAN_DATUM_TYPE = 'vecka_utan_datum';

export const TRANINGSMEJL_TYPER = [PASS_DAG2_TYPE, DAGEN_FORE_PROVET_TYPE, VECKA_UTAN_DATUM_TYPE] as const;
export type Traningsmejl = (typeof TRANINGSMEJL_TYPER)[number];

/** Ägarbeslutet: ingen får fler än två träningsmejl. */
export const MAX_TRANINGSMEJL = 2;

export type PassTid = 'morgon' | 'lunch' | 'kvall';

/** Klockslagen i svensk tid (migreringen 20261012090000). */
export const PASS_TID_KLOCKA: Readonly<Record<PassTid, string>> = {
  morgon: '07:00',
  lunch: '11:30',
  kvall: '18:00',
};

export const DAGEN_FORE_KLOCKA = '08:00';

/** Passets test_type som räknas som "dagens pass gjort" (samma som hemvyn). */
const PASS_TEST_TYPER = ['matrislogik-pass', 'matrislogik-riktat', 'matrislogik-general'];
/** Nivåkollen och ny nivåkoll har samma test_type. */
const NIVAKOLL_TEST_TYPE = 'matrislogik-matning';

export function lasPassTid(v: unknown): PassTid | null {
  return v === 'morgon' || v === 'lunch' || v === 'kvall' ? v : null;
}

/** Basmallen ur en email_type med dagsuffix, eller null. */
export function traningsmejlTyp(emailType: string): Traningsmejl | null {
  for (const t of TRANINGSMEJL_TYPER) {
    if (emailType === t || emailType.startsWith(`${t}_`)) return t;
  }
  return null;
}

/* ------------------------------ Svensk tid ------------------------------ */

/** Minuter Stockholm ligger före UTC vid ett ögonblick (60 eller 120). */
function stockholmOffsetMin(d: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Stockholm',
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(d);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const somUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'));
  return Math.round((somUtc - Math.floor(d.getTime() / 1000) * 1000) / 60000);
}

/**
 * Ett klockslag ("07:00") en viss dag i svensk tid, som ögonblick. Räknar
 * om förskjutningen två gånger så att dagarna kring sommartid och vintertid
 * blir rätt.
 */
export function stockholmKlockslag(dag: Dag, klocka: string): Date {
  const [y, m, d] = dag.split('-').map(Number);
  const [hh, mm] = klocka.split(':').map(Number);
  const naiv = Date.UTC(y, m - 1, d, hh, mm);
  let t = naiv - stockholmOffsetMin(new Date(naiv)) * 60000;
  t = naiv - stockholmOffsetMin(new Date(t)) * 60000;
  return new Date(t);
}

/** Dagen ur radens metadata, annars dagens datum i svensk tid. */
export function mejlDag(metadata: Record<string, unknown> | null | undefined, now: Date = new Date()): Dag {
  const dag = metadata?.dag;
  return arGiltigDag(dag) ? dag : dagSthlm(now);
}

/* ------------------------------ Läsningar ------------------------------ */

export interface Nivakollen {
  /** Första Nivåkollens dag, svensk tid. */
  forsta: Dag;
  /** Har en ny nivåkoll (ommätning) gjorts efter den första? */
  fler: boolean;
  /** Senaste nivån (senaste nivåpunkten), eller null. */
  niva: number | null;
}

function numeriskt(v: unknown): number | null {
  const n = typeof v === 'string' ? Number(v) : v;
  return typeof n === 'number' && Number.isFinite(n) ? n : null;
}

/**
 * Nivåkollen per användare: nivåpunkterna (typ matning och ommatning) och,
 * för sessioner utan punkt, de slutförda sessionerna med test_type
 * matrislogik-matning. Två frågor för hela urvalet.
 */
export async function lasNivakollar(admin: AnySupabase, userIds: readonly string[]): Promise<Map<string, Nivakollen>> {
  const ut = new Map<string, Nivakollen>();
  if (userIds.length === 0) return ut;
  const ids = [...userIds];

  const [punktRes, sessRes] = await Promise.all([
    (admin as any)
      .from('test_nivapunkter')
      .select('user_id, dag, typ, niva, skapad_at')
      .in('user_id', ids)
      .eq('test_kind', 'matris')
      .limit(10000),
    (admin as any)
      .from('logic_test_v4_sessions')
      .select('user_id, completed_at')
      .in('user_id', ids)
      .eq('test_type', NIVAKOLL_TEST_TYPE)
      .not('completed_at', 'is', null)
      .limit(10000),
  ]);
  if (punktRes.error) throw punktRes.error;
  if (sessRes.error) throw sessRes.error;

  const perUser = new Map<string, { kollar: Dag[]; ommatning: boolean; punkter: { dag: Dag; skapad: number; niva: number }[]; sessioner: Dag[] }>();
  const hamta = (id: string) => {
    let u = perUser.get(id);
    if (!u) {
      u = { kollar: [], ommatning: false, punkter: [], sessioner: [] };
      perUser.set(id, u);
    }
    return u;
  };

  for (const p of (punktRes.data ?? []) as Record<string, unknown>[]) {
    const id = String(p.user_id);
    const dag = p.dag;
    if (!arGiltigDag(dag)) continue;
    const u = hamta(id);
    const niva = numeriskt(p.niva);
    if (niva !== null && niva > 0) {
      u.punkter.push({ dag, skapad: p.skapad_at ? new Date(String(p.skapad_at)).getTime() : 0, niva });
    }
    if (p.typ === 'matning' || p.typ === 'ommatning') u.kollar.push(dag);
    if (p.typ === 'ommatning') u.ommatning = true;
  }
  for (const s of (sessRes.data ?? []) as Record<string, unknown>[]) {
    if (!s.completed_at) continue;
    hamta(String(s.user_id)).sessioner.push(dagSthlm(String(s.completed_at)));
  }

  for (const [id, u] of perUser) {
    const alla = [...u.kollar, ...u.sessioner].sort();
    if (alla.length === 0) continue;
    const forsta = alla[0];
    const sorterade = [...u.punkter].sort((a, b) => (a.dag < b.dag ? -1 : a.dag > b.dag ? 1 : a.skapad - b.skapad));
    ut.set(id, {
      forsta,
      // En ny nivåkoll: en ommätningspunkt, mer än en slutförd session, eller
      // en Nivåkoll en senare dag än den första.
      fler: u.ommatning || u.sessioner.length > 1 || alla.some((d) => d > forsta),
      niva: sorterade.length ? sorterade[sorterade.length - 1].niva : null,
    });
  }
  return ut;
}

export interface Traningsplan {
  provdatum: Dag | null;
  passTid: PassTid | null;
  testtyper: string[];
  leverantor: string | null;
  variant: string | null;
}

export function tolkaPlan(rad: Record<string, unknown> | null | undefined): Traningsplan | null {
  if (!rad) return null;
  return {
    provdatum: arGiltigDag(rad.provdatum) ? rad.provdatum : null,
    // Saknas kolumnen (migreringen inte körd) blir det null: ingen påminnelse.
    passTid: lasPassTid(rad.pass_tid),
    testtyper: Array.isArray(rad.testtyper) ? (rad.testtyper as string[]) : [],
    leverantor: (rad.leverantor as string | null | undefined) ?? null,
    variant: (rad.variant as string | null | undefined) ?? null,
  };
}

export async function lasPlaner(admin: AnySupabase, userIds: readonly string[]): Promise<Map<string, Traningsplan>> {
  const ut = new Map<string, Traningsplan>();
  if (userIds.length === 0) return ut;
  const { data, error } = await (admin as any).from('test_planer').select('*').in('user_id', [...userIds]);
  if (error) throw error;
  for (const rad of (data ?? []) as Record<string, unknown>[]) {
    const plan = tolkaPlan(rad);
    if (plan) ut.set(String(rad.user_id), plan);
  }
  return ut;
}

/**
 * Skickade träningsmejl per användare (basmallarna, en gång per skickad
 * rad). Räknar email_schedule-rader med sent_at och utan canceled_at: ett
 * passmejl som avbröts hos Resend (avbrytSchemalagtPassmejl) räknas inte.
 */
export async function lasSkickade(admin: AnySupabase, userIds: readonly string[]): Promise<Map<string, Traningsmejl[]>> {
  const ut = new Map<string, Traningsmejl[]>();
  if (userIds.length === 0) return ut;
  const { data, error } = await (admin as any)
    .from('email_schedule')
    .select('user_id, email_type')
    .in('user_id', [...userIds])
    .not('sent_at', 'is', null)
    .is('canceled_at', null)
    .limit(10000);
  if (error) throw error;
  for (const rad of (data ?? []) as { user_id: string; email_type: string }[]) {
    const typ = traningsmejlTyp(String(rad.email_type));
    if (!typ) continue;
    const lista = ut.get(rad.user_id) ?? [];
    lista.push(typ);
    ut.set(rad.user_id, lista);
  }
  return ut;
}

/** Ryms ett mejl till av den här typen? Högst två totalt, varje typ en gång. */
export function rymsTill(skickade: readonly Traningsmejl[], typ: Traningsmejl): boolean {
  return skickade.length < MAX_TRANINGSMEJL && !skickade.includes(typ);
}

/** Har användaren slutfört dagens pass (pass, riktat pass eller övningsprov) den dagen? */
export async function passGjortDag(admin: AnySupabase, userId: string, dag: Dag): Promise<boolean> {
  const fran = stockholmKlockslag(dag, '00:00').toISOString();
  const till = stockholmKlockslag(laggTill(dag, 1), '00:00').toISOString();
  const { data, error } = await (admin as any)
    .from('logic_test_v4_sessions')
    .select('id')
    .eq('user_id', userId)
    .in('test_type', PASS_TEST_TYPER)
    .gte('completed_at', fran)
    .lt('completed_at', till)
    .limit(1);
  if (error) throw error;
  return (data ?? []).length > 0;
}

/* --------------------------------- Urvalet -------------------------------- */

export interface Traningsurval {
  userId: string;
  typ: Traningsmejl;
  emailType: string;
  metadata: Record<string, unknown>;
}

/**
 * Dagens kandidater. Ett träningsmejl per användare och dag, i den ordning
 * de väger: dagen före provet, passet dag 2, veckan utan datum. Fem frågor
 * för hela urvalet:
 *
 *   1. Nivåpunkter typ matning i går och för sju dagar sedan.
 *   2. Slutförda Nivåkoll-sessioner de senaste sju dagarna (sessioner utan punkt).
 *   3. Planer med provdatum i morgon.
 *   4 och 5. Nivåkollen, planen och skickade mejl för kandidaterna.
 */
export async function valjTraningsmejl(admin: AnySupabase, now: Date = new Date()): Promise<Traningsurval[]> {
  const idag = dagSthlm(now);
  const igar = laggTill(idag, -1);
  const veckaSedan = laggTill(idag, -7);
  const imorgon = laggTill(idag, 1);

  const [punktRes, sessRes, provRes] = await Promise.all([
    (admin as any)
      .from('test_nivapunkter')
      .select('user_id, dag')
      .eq('typ', 'matning')
      .in('dag', [igar, veckaSedan])
      .limit(5000),
    (admin as any)
      .from('logic_test_v4_sessions')
      .select('user_id, completed_at')
      .eq('test_type', NIVAKOLL_TEST_TYPE)
      .gte('completed_at', stockholmKlockslag(veckaSedan, '00:00').toISOString())
      .lt('completed_at', stockholmKlockslag(idag, '00:00').toISOString())
      .limit(5000),
    (admin as any).from('test_planer').select('*').eq('provdatum', imorgon).limit(5000),
  ]);
  for (const r of [punktRes, sessRes, provRes]) {
    if (r.error) throw r.error;
  }

  const kandidater = new Set<string>();
  for (const p of (punktRes.data ?? []) as { user_id: string }[]) kandidater.add(String(p.user_id));
  for (const s of (sessRes.data ?? []) as { user_id: string; completed_at: string | null }[]) {
    if (!s.completed_at) continue;
    const dag = dagSthlm(s.completed_at);
    if (dag === igar || dag === veckaSedan) kandidater.add(String(s.user_id));
  }
  for (const p of (provRes.data ?? []) as { user_id: string }[]) kandidater.add(String(p.user_id));
  if (kandidater.size === 0) return [];

  const ids = [...kandidater];
  const [kollar, planer, skickade] = await Promise.all([
    lasNivakollar(admin, ids),
    lasPlaner(admin, ids),
    lasSkickade(admin, ids),
  ]);

  const ut: Traningsurval[] = [];
  for (const userId of ids) {
    const sent = skickade.get(userId) ?? [];
    const plan = planer.get(userId) ?? null;
    const koll = kollar.get(userId) ?? null;

    if (plan?.provdatum === imorgon && rymsTill(sent, DAGEN_FORE_PROVET_TYPE)) {
      ut.push({
        userId,
        typ: DAGEN_FORE_PROVET_TYPE,
        emailType: `${DAGEN_FORE_PROVET_TYPE}_${idag}`,
        metadata: { dag: idag, provdatum: imorgon },
      });
      continue;
    }
    // Skiss 5: den som inte väljer tidpunkt får ingen påminnelse.
    if (koll?.forsta === igar && plan?.passTid && rymsTill(sent, PASS_DAG2_TYPE)) {
      ut.push({
        userId,
        typ: PASS_DAG2_TYPE,
        emailType: `${PASS_DAG2_TYPE}_${idag}`,
        metadata: { dag: idag, pass_tid: plan.passTid },
      });
      continue;
    }
    if (koll?.forsta === veckaSedan && !koll.fler && !plan?.provdatum && rymsTill(sent, VECKA_UTAN_DATUM_TYPE)) {
      ut.push({
        userId,
        typ: VECKA_UTAN_DATUM_TYPE,
        emailType: `${VECKA_UTAN_DATUM_TYPE}_${idag}`,
        metadata: { dag: idag },
      });
    }
  }
  return ut;
}

/* ------------------------------ Avbryt passmejlet ------------------------------ */

interface ResendAvbryt {
  emails: { cancel(id: string): Promise<{ error?: { message?: string } | null } | unknown> };
}

/**
 * Passet gjordes mellan morgonkörningen och den valda tiden: avbryt dagens
 * schemalagda pass_dag2 hos Resend. Anropas från passets slutförande.
 *
 * Kastar aldrig. Returnerar true när ett schemalagt mejl avbröts hos Resend
 * (då markeras raden canceled_at och räknas inte mot taket på två), annars
 * false. En rad som ännu inte skickats avbryts i email_schedule.
 */
export async function avbrytSchemalagtPassmejl(
  admin: AnySupabase,
  userId: string,
  opts: { now?: Date; resend?: ResendAvbryt } = {}
): Promise<boolean> {
  try {
    const dag = dagSthlm(opts.now ?? new Date());
    const emailType = `${PASS_DAG2_TYPE}_${dag}`;

    // Inte skickad än (morgonkörningen har inte gått, eller försöker igen).
    await cancelScheduled(admin, userId, [emailType], 'pass_gjort');

    const { data, error } = await (admin as any)
      .from('email_log')
      .select('resend_id')
      .eq('user_id', userId)
      .eq('email_type', emailType)
      .not('resend_id', 'is', null)
      .limit(5);
    if (error) {
      console.error('[traningsmejl] kunde inte läsa email_log:', error.message);
      return false;
    }
    const idn = ((data ?? []) as { resend_id: string | null }[]).map((r) => r.resend_id).filter((id): id is string => !!id);
    if (idn.length === 0) return false;

    const resend: ResendAvbryt = opts.resend ?? (new Resend(process.env.RESEND_API_KEY) as unknown as ResendAvbryt);
    let avbrutet = false;
    for (const id of idn) {
      try {
        const svar = (await resend.emails.cancel(id)) as { error?: { message?: string } | null } | undefined;
        if (svar?.error) {
          // Vanligast: mejlet har redan gått iväg. Inget att göra.
          console.warn(`[traningsmejl] Resend avbröt inte ${id}:`, svar.error.message ?? 'okänt fel');
          continue;
        }
        avbrutet = true;
      } catch (e: any) {
        console.warn(`[traningsmejl] Resend-fel vid avbrott av ${id}:`, e?.message ?? e);
      }
    }

    if (avbrutet) {
      const { error: updError } = await (admin as any)
        .from('email_schedule')
        .update({ canceled_at: new Date().toISOString(), cancel_reason: 'pass_gjort_avbrutet_hos_resend' })
        .eq('user_id', userId)
        .eq('email_type', emailType)
        .not('sent_at', 'is', null);
      if (updError) console.error('[traningsmejl] kunde inte markera raden:', updError.message);
    }
    return avbrutet;
  } catch (e: any) {
    console.error('[traningsmejl] avbrytSchemalagtPassmejl:', e?.message ?? e);
    return false;
  }
}
