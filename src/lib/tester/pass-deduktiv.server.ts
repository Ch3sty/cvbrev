// src/lib/tester/pass-deduktiv.server.ts
// =============================================================================
// Motorn för deduktivpasset (testplanen steg 1, 2026-11-09). Syster till
// figurpassets motor (pass-figur.server.ts): fyra uppgifter, ett svar i
// taget, lösningen och misstaget efter varje svar.
//
// - Servern dömer. Klienten får uppgifterna utan facit; facit, lösningen och
//   misstaget kommer i svaret på varje svar.
// - Nivå: Nivåkollen för deduktivt när den finns (src/lib/nivakoll), annars
//   grund tills bästa klassiska deduktiv-grund är minst SITTER_PROCENT.
//   Expert har ingen passform.
// - Exponering: sedda.server.ts, slaget deduktiv över klassiska test, pass,
//   Nivåkollen och övningsprovet, karensen 30 dagar. Ett upprepat pass räknas
//   inte i frågestatistiken.
// - Avslutet går genom slutfor_traningssession: ingen nivåpunkt,
//   frågestatistik med test_kind deduktiv och typ pass.
// - Passet ligger i logic_test_v4_sessions utan meta.traning: matrismotorns
//   nivå och kurva läser det aldrig. Dagsringen, serien och Första veckan
//   räknar det (motor.server.ts, andraPass).
// - Alla skrivningar med service role, villkorade på user_id.
// =============================================================================

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { sparaTestsvar, unikaSvar, SVARSNYCKLAR } from '@/lib/tests/sparaSvar';
import { captureServer } from '@/lib/analytics/server';
import { dagSthlm, type Dag } from '@/lib/traning/datum';
import { bedomDeduktivSvar, genomgaDeduktiv, hittaDeduktivFraga, visaDeduktiv } from '@/lib/deduktivV1/fragor.server';
import { DEDUKTIV_VERSION, poolFor } from '@/lib/deduktivV1/select';
import { passNivaFor, senasteNivakollNiva } from '@/lib/nivakoll/las.server';
import { harVnPass } from './pass.server';
import { passNiva, tappadeFamiljer } from './pass-urval';
import { valjFigurer } from './pass-figur';
import { seddaDeduktivaUrRader, seddaDeduktivTestTyper, type SeddRad } from './sedda.server';
import {
  DEDUKTIVPASS_TEST_TYPE,
  DEDUKTIV_ANTAL,
  DEDUKTIV_BUDGET_PER_UPPGIFT_S,
  bastaDeduktivGrundProcent,
  type DeduktivAterkoppling,
  type DeduktivPassNiva,
  type DeduktivPassVy,
  type DeduktivResultat,
} from './pass-deduktiv';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Klient = SupabaseClient<any, any, any>;

export interface DeduktivPassMeta {
  /** Markerar deduktivpasset. Aldrig meta.traning. */
  deduktivpass: 1;
  alternativ_blandade: true;
  test_kind: 'deduktiv';
  niva: DeduktivPassNiva;
  fragor: string[];
  deduktiv_version: typeof DEDUKTIV_VERSION;
  upprepad: boolean;
  dag: Dag;
  antal: number;
  budget_s: number;
  expert_rad: boolean;
  /** Nivån passet valdes efter (Nivåkollen), null när den saknades. */
  nivakoll: number | null;
  ratt?: number;
  tid_s?: number;
  resultat?: DeduktivResultat;
}

export interface DeduktivRad {
  id: string;
  test_type: string | null;
  meta: unknown;
  answers: unknown;
  score?: number | null;
  created_at: string;
  started_at?: string | null;
  completed_at: string | null;
}

interface DeduktivSvar {
  q_id: string;
  selected: number;
  visat: number | null;
  correct: boolean;
  time_spent: number;
}

const KOLUMNER = 'id, test_type, meta, answers, score, created_at, started_at, completed_at';

export function lasDeduktivMeta(meta: unknown): DeduktivPassMeta | null {
  const m = meta as Partial<DeduktivPassMeta> | null;
  if (!m || m.deduktivpass !== 1 || !Array.isArray(m.fragor)) return null;
  return m as DeduktivPassMeta;
}

function lasDeduktivSvar(answers: unknown): DeduktivSvar[] {
  const lista = unikaSvar(Array.isArray(answers) ? answers : [], SVARSNYCKLAR.matris) as unknown[];
  return lista
    .filter((s): s is DeduktivSvar => !!s && typeof (s as DeduktivSvar).q_id === 'string' && typeof (s as DeduktivSvar).selected === 'number')
    .map((s) => ({ ...s, visat: typeof s.visat === 'number' ? s.visat : null, time_spent: typeof s.time_spent === 'number' && s.time_spent > 0 ? Math.round(s.time_spent) : 0 }));
}

/* ------------------------------- Läget ------------------------------- */

async function lasDeduktivLage(admin: Klient, userId: string, idag: Dag) {
  const [sessRes, nivakoll] = await Promise.all([
    admin
      .from('logic_test_v4_sessions')
      .select(KOLUMNER)
      .eq('user_id', userId)
      .in('test_type', seddaDeduktivTestTyper())
      .order('created_at', { ascending: false })
      .limit(300),
    senasteNivakollNiva(admin, userId, 'deduktiv').catch((e) => {
      console.error('[deduktivpass] Nivåkollens nivå', e);
      return null;
    }),
  ]);
  if (sessRes.error) throw sessRes.error;
  const rader = (sessRes.data ?? []) as DeduktivRad[];
  const reserv = passNiva(bastaDeduktivGrundProcent(rader)) as DeduktivPassNiva;
  return { idag, nivakoll, niva: passNivaFor('deduktiv', nivakoll, reserv), sedda: seddaDeduktivaUrRader(rader as SeddRad[]), rader };
}

function tappadeAckumulerat(rader: readonly DeduktivRad[], extra: DeduktivRad | null): DeduktivResultat['tappade'] {
  const svar: { familj: string | null; correct: boolean }[] = [];
  const pass = [...rader.filter((r) => r.completed_at && lasDeduktivMeta(r.meta) && r.id !== extra?.id), ...(extra ? [extra] : [])];
  for (const r of pass) for (const s of lasDeduktivSvar(r.answers)) svar.push({ familj: hittaDeduktivFraga(s.q_id)?.family ?? null, correct: s.correct });
  return tappadeFamiljer(svar);
}

/* ----------------------------- Klientvyn ----------------------------- */

function aterkopplingFor(rad: DeduktivRad, s: DeduktivSvar): DeduktivAterkoppling | null {
  const q = hittaDeduktivFraga(s.q_id);
  if (!q) return null;
  const g = genomgaDeduktiv(q, rad.id, true);
  return {
    correct: s.correct,
    rattVisat: g.rattVisat,
    valtVisat: s.visat,
    losning: g.losning,
    misstag: !s.correct && s.visat !== null ? g.misstag[s.visat] || null : null,
    familj: q.family,
  };
}

export function deduktivPassVy(rad: DeduktivRad): DeduktivPassVy | null {
  const meta = lasDeduktivMeta(rad.meta);
  if (!meta) return null;
  const fragor = meta.fragor.map(hittaDeduktivFraga);
  if (fragor.some((q) => !q)) return null;
  const svar = lasDeduktivSvar(rad.answers);
  const besvarade: DeduktivPassVy['besvarade'] = {};
  const aterkoppling: DeduktivPassVy['aterkoppling'] = {};
  for (const s of svar) {
    besvarade[s.q_id] = { visat: s.visat, tid_s: s.time_spent };
    const at = aterkopplingFor(rad, s);
    if (at) aterkoppling[s.q_id] = at;
  }
  return {
    id: rad.id,
    niva: meta.niva,
    upprepad: meta.upprepad,
    budget_s: meta.budget_s,
    startad: rad.started_at ?? rad.created_at,
    avslutad: !!rad.completed_at,
    expertRad: meta.expert_rad,
    uppgifter: fragor.map((q) => ({ ...visaDeduktiv(q!, rad.id, true), nyckel: q!.id, premisser: q!.typ === 'D1' })),
    besvarade,
    aterkoppling,
    resultat: rad.completed_at ? meta.resultat ?? null : null,
  };
}

export async function hamtaDeduktivPass(admin: Klient, userId: string, sessionId: string): Promise<DeduktivRad | null> {
  const { data, error } = await admin.from('logic_test_v4_sessions').select(KOLUMNER).eq('id', sessionId).eq('user_id', userId).maybeSingle();
  if (error) throw error;
  const rad = (data as DeduktivRad | null) ?? null;
  return rad && lasDeduktivMeta(rad.meta) ? rad : null;
}

/* ------------------------------- Skapa ------------------------------- */

export type SkapaDeduktivPass = { ok: true; vy: DeduktivPassVy } | { ok: false; status: 403 | 422; fel: string };

export async function skapaDeduktivPass(args: { supabase: Klient; admin: Klient; userId: string; idag?: Dag }): Promise<SkapaDeduktivPass> {
  const idag = args.idag ?? dagSthlm();
  const [har, lage] = await Promise.all([harVnPass(args.supabase, args.userId), lasDeduktivLage(args.admin, args.userId, idag)]);
  if (!har) return { ok: false, status: 403, fel: 'betalvagg' };

  // Ett påbörjat deduktivpass i dag återupptas.
  const pagaende = lage.rader.find((r) => {
    const m = lasDeduktivMeta(r.meta);
    return !r.completed_at && m && m.dag === idag;
  });
  if (pagaende) {
    const vy = deduktivPassVy(pagaende);
    if (vy) return { ok: true, vy };
  }

  const seed = `${args.userId}:${idag}:${lage.rader.length}:deduktiv`;
  const val = valjFigurer(poolFor(lage.niva, DEDUKTIV_VERSION), DEDUKTIV_ANTAL, lage.sedda, idag, seed);
  if (val.ids.length === 0) return { ok: false, status: 422, fel: 'banken_tom' };

  const meta: DeduktivPassMeta = {
    deduktivpass: 1,
    alternativ_blandade: true,
    test_kind: 'deduktiv',
    niva: lage.niva,
    fragor: val.ids,
    deduktiv_version: DEDUKTIV_VERSION,
    upprepad: val.upprepad,
    dag: idag,
    antal: val.ids.length,
    budget_s: val.ids.length * DEDUKTIV_BUDGET_PER_UPPGIFT_S,
    expert_rad: lage.niva === 'avancerad',
    nivakoll: lage.nivakoll,
  };
  const { data, error } = await args.admin
    .from('logic_test_v4_sessions')
    .insert({ user_id: args.userId, test_type: DEDUKTIVPASS_TEST_TYPE, answers: [], meta })
    .select(KOLUMNER)
    .single();
  if (error || !data) throw error ?? new Error('deduktivpasset skapades inte');
  const vy = deduktivPassVy(data as DeduktivRad);
  if (!vy) throw new Error('deduktivpassets meta gick inte att läsa');
  return { ok: true, vy };
}

/* ------------------------------- Svaret ------------------------------ */

export type SvarDeduktivPass =
  | { ok: true; nyckel: string; aterkoppling: DeduktivAterkoppling; besvarade: number; antal: number; klar: boolean }
  | { ok: false; status: 400 | 404 | 409; fel: string };

export async function svaraDeduktivPass(args: {
  admin: Klient;
  userId: string;
  sessionId: string;
  nyckel: unknown;
  /** Visat index, eller null för "Vet inte, visa lösningen". */
  visat: unknown;
  tid: unknown;
}): Promise<SvarDeduktivPass> {
  const rad = await hamtaDeduktivPass(args.admin, args.userId, args.sessionId);
  const meta = rad ? lasDeduktivMeta(rad.meta) : null;
  if (!rad || !meta) return { ok: false, status: 404, fel: 'session_saknas' };
  if (rad.completed_at) return { ok: false, status: 409, fel: 'avslutad' };
  if (typeof args.nyckel !== 'string' || !meta.fragor.includes(args.nyckel)) return { ok: false, status: 400, fel: 'fel_punkt' };
  const tidigare = lasDeduktivSvar(rad.answers);
  if (tidigare.some((s) => s.q_id === args.nyckel)) return { ok: false, status: 409, fel: 'redan_besvarad' };
  const q = hittaDeduktivFraga(args.nyckel);
  if (!q) return { ok: false, status: 400, fel: 'ogiltigt_svar' };
  const vetInte = args.visat === null || args.visat === undefined;
  const b = vetInte ? { selected: -1, visat: null, correct: false } : bedomDeduktivSvar(q, rad.id, true, args.visat);
  if (!b) return { ok: false, status: 400, fel: 'ogiltigt_svar' };
  const tid = typeof args.tid === 'number' && Number.isFinite(args.tid) && args.tid > 0 ? Math.min(Math.round(args.tid), 3600) : 0;
  const svar: DeduktivSvar = { q_id: q.id, selected: b.selected, visat: b.visat, correct: b.correct, time_spent: tid };
  const n = await sparaTestsvar(args.admin, { userId: args.userId, tabell: 'logic_test_v4_sessions', sessionId: rad.id, nycklar: SVARSNYCKLAR.matris, svar: { ...svar } });
  if (n === null) return { ok: false, status: 409, fel: 'avslutad' };
  const at = aterkopplingFor(rad, svar);
  if (!at) return { ok: false, status: 400, fel: 'ogiltigt_svar' };
  const besvarade = tidigare.length + 1;
  return { ok: true, nyckel: q.id, aterkoppling: at, besvarade, antal: meta.antal, klar: besvarade >= meta.antal };
}

/* ------------------------------- Avslutet ---------------------------- */

export type SlutforDeduktivPass = { ok: true; vy: DeduktivPassVy } | { ok: false; status: 400 | 404 | 409; fel: string };

export async function slutforDeduktivPass(args: { admin: Klient; userId: string; sessionId: string; idag?: Dag }): Promise<SlutforDeduktivPass> {
  const idag = args.idag ?? dagSthlm();
  const rad = await hamtaDeduktivPass(args.admin, args.userId, args.sessionId);
  const meta = rad ? lasDeduktivMeta(rad.meta) : null;
  if (!rad || !meta) return { ok: false, status: 404, fel: 'session_saknas' };
  if (rad.completed_at) {
    const vy = deduktivPassVy(rad);
    return vy ? { ok: true, vy } : { ok: false, status: 409, fel: 'redan_avslutad' };
  }
  const svar = lasDeduktivSvar(rad.answers);
  if (svar.length === 0) return { ok: false, status: 400, fel: 'inga_svar' };

  const lage = await lasDeduktivLage(args.admin, args.userId, idag);
  const ratt = svar.filter((s) => s.correct).length;
  const tid_s = svar.reduce((sum, s) => sum + s.time_spent, 0);
  const resultat: DeduktivResultat = { ratt, antal: meta.antal, tid_s, budget_s: meta.budget_s, tappade: tappadeAckumulerat(lage.rader, rad) };

  const statistik = meta.upprepad
    ? null
    : svar.map((s) => ({ fraga_id: s.q_id, test_kind: 'deduktiv', correct: s.correct, tid_s: s.time_spent, selected: s.selected, typ: 'pass' }));

  const { data, error } = await args.admin.rpc('slutfor_traningssession', {
    p_session: rad.id,
    p_user: args.userId,
    p_score: ratt,
    p_time_spent: tid_s,
    p_meta: { ratt, tid_s, resultat },
    p_nivapunkt: null,
    p_statistik: statistik,
    p_milstolpar: [],
  });
  if (error) throw error;
  const res = (data ?? {}) as { slutford?: boolean };
  if (!res.slutford) return { ok: false, status: 409, fel: 'redan_avslutad' };

  void captureServer('pass_klart', args.userId, {
    test_kind: 'deduktiv',
    typ: 'pass',
    variant: 'niva',
    niva: meta.niva,
    familj: null,
    niva_fore: meta.nivakoll,
    niva_efter: null,
    ratt,
    antal: meta.antal,
    over_tid: tid_s > meta.budget_s ? 1 : 0,
    tid_s,
    ateranvanda: meta.upprepad ? 1 : 0,
    raknade: meta.upprepad ? 0 : svar.length,
    band_ratt: null,
  });

  const efter = await hamtaDeduktivPass(args.admin, args.userId, rad.id);
  const vy = efter ? deduktivPassVy(efter) : null;
  return vy ? { ok: true, vy } : { ok: false, status: 404, fel: 'session_saknas' };
}
