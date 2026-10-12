// src/lib/tester/pass-figur.server.ts
// =============================================================================
// Motorn för figurpasset (beställning omgång 3, A3). Syster till text- och
// sifferpassets motor (pass.server.ts): fyra uppgifter, ett svar i taget,
// regeln och misstaget efter varje svar.
//
// - Servern dömer. Klienten får uppgifterna utan facit; facit, regel och
//   misstag kommer i svaret på varje svar.
// - Nivå: grund tills bästa klassiska figurserier-grund är minst
//   SITTER_PROCENT, därefter avancerad (passNiva). Expert har ingen passform.
// - Exponering: sedda.server.ts, slaget figurserie över klassiska test,
//   figurpass och övningsprov, karensen 30 dagar. Ett upprepat pass räknas
//   inte i frågestatistiken.
// - Avslutet går genom slutfor_traningssession: ingen nivåpunkt, frågestatistik
//   med test_kind figurserie och typ pass. Ingen kalibreringsfråga.
// - Passet ligger i logic_test_v4_sessions utan meta.traning: matrismotorns
//   nivå, kurva och sträckregel läser det aldrig. Dagsringen, serien och
//   Första veckan räknar det (motor.server.ts, andraPass).
// - Alla skrivningar med service role, villkorade på user_id.
// =============================================================================

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { sparaTestsvar, unikaSvar, SVARSNYCKLAR } from '@/lib/tests/sparaSvar';
import { captureServer } from '@/lib/analytics/server';
import { dagSthlm, type Dag } from '@/lib/traning/datum';
import { bedomFigur, genomgaFigur, hittaFigurFraga, visaFigur } from '@/lib/figurserierV1/fragor.server';
import { bryterPool, harnastPool, SERIE_VERSION } from '@/lib/figurserierV1/select';
import { harVnPass } from './pass.server';
import { passNiva, tappadeFamiljer } from './pass-urval';
import { seddaFigurerUrRader, seddaFigurTestTyper, type SeddRad } from './sedda.server';
import {
  FIGURPASS_TEST_TYPE,
  FIGUR_BUDGET_PER_UPPGIFT_S,
  bastaFigurGrundProcent,
  valjFigurpass,
  type FigurAterkoppling,
  type FigurNiva,
  type FigurPassVy,
  type FigurResultat,
} from './pass-figur';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Klient = SupabaseClient<any, any, any>;

export interface FigurPassMeta {
  /** Markerar figurpasset. Aldrig meta.traning. */
  figurpass: 1;
  /** Svaren lagras som originalindex (frågestatistiken kräver flaggan). */
  alternativ_blandade: true;
  test_kind: 'figurserie';
  niva: FigurNiva;
  /** Frågornas id i passets ordning. */
  fragor: string[];
  serie_version: typeof SERIE_VERSION;
  upprepad: boolean;
  dag: Dag;
  antal: number;
  budget_s: number;
  expert_rad: boolean;
  ratt?: number;
  tid_s?: number;
  resultat?: FigurResultat;
}

export interface FigurRad {
  id: string;
  test_type: string | null;
  meta: unknown;
  answers: unknown;
  score?: number | null;
  created_at: string;
  started_at?: string | null;
  completed_at: string | null;
}

interface FigurSvar {
  q_id: string;
  selected: number;
  visat: number | null;
  correct: boolean;
  time_spent: number;
}

const KOLUMNER = 'id, test_type, meta, answers, score, created_at, started_at, completed_at';

export function lasFigurMeta(meta: unknown): FigurPassMeta | null {
  const m = meta as Partial<FigurPassMeta> | null;
  if (!m || m.figurpass !== 1 || !Array.isArray(m.fragor)) return null;
  return m as FigurPassMeta;
}

function lasFigurSvar(answers: unknown): FigurSvar[] {
  const lista = unikaSvar(Array.isArray(answers) ? answers : [], SVARSNYCKLAR.matris) as unknown[];
  return lista
    .filter((s): s is FigurSvar => !!s && typeof (s as FigurSvar).q_id === 'string' && typeof (s as FigurSvar).selected === 'number')
    .map((s) => ({ ...s, visat: typeof s.visat === 'number' ? s.visat : null, time_spent: typeof s.time_spent === 'number' && s.time_spent > 0 ? Math.round(s.time_spent) : 0 }));
}

/* ------------------------------- Läget ------------------------------- */


async function lasFigurLage(admin: Klient, userId: string, idag: Dag) {
  const { data, error } = await admin
    .from('logic_test_v4_sessions')
    .select(KOLUMNER)
    .eq('user_id', userId)
    .in('test_type', seddaFigurTestTyper())
    .order('created_at', { ascending: false })
    .limit(300);
  if (error) throw error;
  const rader = (data ?? []) as FigurRad[];
  return { idag, niva: passNiva(bastaFigurGrundProcent(rader)) as FigurNiva, sedda: seddaFigurerUrRader(rader as SeddRad[]), rader };
}

/** Familjen per besvarad fråga, för "Var du tappade". */
function tappadeAckumulerat(rader: readonly FigurRad[], extra: FigurRad | null): FigurResultat['tappade'] {
  const svar: { familj: string | null; correct: boolean }[] = [];
  const pass = [...rader.filter((r) => r.completed_at && lasFigurMeta(r.meta) && r.id !== extra?.id), ...(extra ? [extra] : [])];
  for (const r of pass) for (const s of lasFigurSvar(r.answers)) svar.push({ familj: hittaFigurFraga(s.q_id)?.family ?? null, correct: s.correct });
  return tappadeFamiljer(svar);
}

/* ----------------------------- Klientvyn ----------------------------- */

function aterkopplingFor(rad: FigurRad, s: FigurSvar): FigurAterkoppling | null {
  const q = hittaFigurFraga(s.q_id);
  if (!q) return null;
  const g = genomgaFigur(q, rad.id);
  return {
    correct: s.correct,
    rattVisat: g.rattVisat,
    valtVisat: s.visat,
    regel: q.rule,
    misstag: !s.correct && s.visat !== null ? g.misstag[s.visat] || null : null,
    familj: q.family,
  };
}

export function figurPassVy(rad: FigurRad): FigurPassVy | null {
  const meta = lasFigurMeta(rad.meta);
  if (!meta) return null;
  const fragor = meta.fragor.map(hittaFigurFraga);
  if (fragor.some((q) => !q)) return null;
  const svar = lasFigurSvar(rad.answers);
  const besvarade: FigurPassVy['besvarade'] = {};
  const aterkoppling: FigurPassVy['aterkoppling'] = {};
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
    uppgifter: fragor.map((q) => {
      const v = visaFigur(q!, rad.id);
      return { nyckel: q!.id, form: v.form ?? 'harnast', rad: v.rad, options: v.options };
    }),
    besvarade,
    aterkoppling,
    resultat: rad.completed_at ? meta.resultat ?? null : null,
  };
}

export async function hamtaFigurPass(admin: Klient, userId: string, sessionId: string): Promise<FigurRad | null> {
  const { data, error } = await admin.from('logic_test_v4_sessions').select(KOLUMNER).eq('id', sessionId).eq('user_id', userId).maybeSingle();
  if (error) throw error;
  const rad = (data as FigurRad | null) ?? null;
  return rad && lasFigurMeta(rad.meta) ? rad : null;
}

/* ------------------------------- Skapa ------------------------------- */

export type SkapaFigurPass = { ok: true; vy: FigurPassVy } | { ok: false; status: 403 | 422; fel: string };

export async function skapaFigurPass(args: { supabase: Klient; admin: Klient; userId: string; idag?: Dag }): Promise<SkapaFigurPass> {
  const idag = args.idag ?? dagSthlm();
  const [har, lage] = await Promise.all([harVnPass(args.supabase, args.userId), lasFigurLage(args.admin, args.userId, idag)]);
  if (!har) return { ok: false, status: 403, fel: 'betalvagg' };

  // Ett påbörjat figurpass i dag återupptas.
  const pagaende = lage.rader.find((r) => {
    const m = lasFigurMeta(r.meta);
    return !r.completed_at && m && m.dag === idag;
  });
  if (pagaende) {
    const vy = figurPassVy(pagaende);
    if (vy) return { ok: true, vy };
  }

  const seed = `${args.userId}:${idag}:${lage.rader.length}:figurserie`;
  const val = valjFigurpass({ harnast: harnastPool(lage.niva), bryter: bryterPool(lage.niva), sedda: lage.sedda, idag, seed });
  if (val.ids.length === 0) return { ok: false, status: 422, fel: 'banken_tom' };

  const meta: FigurPassMeta = {
    figurpass: 1,
    alternativ_blandade: true,
    test_kind: 'figurserie',
    niva: lage.niva,
    fragor: val.ids,
    serie_version: SERIE_VERSION,
    upprepad: val.upprepad,
    dag: idag,
    antal: val.ids.length,
    budget_s: val.ids.length * FIGUR_BUDGET_PER_UPPGIFT_S,
    expert_rad: lage.niva === 'avancerad',
  };
  const { data, error } = await args.admin
    .from('logic_test_v4_sessions')
    .insert({ user_id: args.userId, test_type: FIGURPASS_TEST_TYPE, answers: [], meta })
    .select(KOLUMNER)
    .single();
  if (error || !data) throw error ?? new Error('figurpasset skapades inte');
  const vy = figurPassVy(data as FigurRad);
  if (!vy) throw new Error('figurpassets meta gick inte att läsa');
  return { ok: true, vy };
}

/* ------------------------------- Svaret ------------------------------ */

export type SvarFigurPass =
  | { ok: true; nyckel: string; aterkoppling: FigurAterkoppling; besvarade: number; antal: number; klar: boolean }
  | { ok: false; status: 400 | 404 | 409; fel: string };

export async function svaraFigurPass(args: {
  admin: Klient;
  userId: string;
  sessionId: string;
  nyckel: unknown;
  /** Visat index, eller null för "Vet inte, visa regeln". */
  visat: unknown;
  tid: unknown;
}): Promise<SvarFigurPass> {
  const rad = await hamtaFigurPass(args.admin, args.userId, args.sessionId);
  const meta = rad ? lasFigurMeta(rad.meta) : null;
  if (!rad || !meta) return { ok: false, status: 404, fel: 'session_saknas' };
  if (rad.completed_at) return { ok: false, status: 409, fel: 'avslutad' };
  if (typeof args.nyckel !== 'string' || !meta.fragor.includes(args.nyckel)) return { ok: false, status: 400, fel: 'fel_punkt' };
  const tidigare = lasFigurSvar(rad.answers);
  if (tidigare.some((s) => s.q_id === args.nyckel)) return { ok: false, status: 409, fel: 'redan_besvarad' };
  const q = hittaFigurFraga(args.nyckel);
  const b = q ? bedomFigur(q, rad.id, args.visat ?? null) : null;
  if (!q || !b) return { ok: false, status: 400, fel: 'ogiltigt_svar' };
  const tid = typeof args.tid === 'number' && Number.isFinite(args.tid) && args.tid > 0 ? Math.min(Math.round(args.tid), 3600) : 0;
  const svar: FigurSvar = { q_id: q.id, selected: b.selected, visat: b.visat, correct: b.correct, time_spent: tid };
  const n = await sparaTestsvar(args.admin, { userId: args.userId, tabell: 'logic_test_v4_sessions', sessionId: rad.id, nycklar: SVARSNYCKLAR.matris, svar: { ...svar } });
  if (n === null) return { ok: false, status: 409, fel: 'avslutad' };
  const at = aterkopplingFor(rad, svar);
  if (!at) return { ok: false, status: 400, fel: 'ogiltigt_svar' };
  const besvarade = tidigare.length + 1;
  return { ok: true, nyckel: q.id, aterkoppling: at, besvarade, antal: meta.antal, klar: besvarade >= meta.antal };
}

/* ------------------------------- Avslutet ---------------------------- */

export type SlutforFigurPass = { ok: true; vy: FigurPassVy } | { ok: false; status: 400 | 404 | 409; fel: string };

export async function slutforFigurPass(args: { admin: Klient; userId: string; sessionId: string; idag?: Dag }): Promise<SlutforFigurPass> {
  const idag = args.idag ?? dagSthlm();
  const rad = await hamtaFigurPass(args.admin, args.userId, args.sessionId);
  const meta = rad ? lasFigurMeta(rad.meta) : null;
  if (!rad || !meta) return { ok: false, status: 404, fel: 'session_saknas' };
  if (rad.completed_at) {
    const vy = figurPassVy(rad);
    return vy ? { ok: true, vy } : { ok: false, status: 409, fel: 'redan_avslutad' };
  }
  const svar = lasFigurSvar(rad.answers);
  if (svar.length === 0) return { ok: false, status: 400, fel: 'inga_svar' };

  const lage = await lasFigurLage(args.admin, args.userId, idag);
  const ratt = svar.filter((s) => s.correct).length;
  const tid_s = svar.reduce((sum, s) => sum + s.time_spent, 0);
  const resultat: FigurResultat = { ratt, antal: meta.antal, tid_s, budget_s: meta.budget_s, tappade: tappadeAckumulerat(lage.rader, rad) };

  // Kalibreringskontraktet: typ pass, aldrig för ett upprepat pass.
  const statistik = meta.upprepad
    ? null
    : svar.map((s) => ({ fraga_id: s.q_id, test_kind: 'figurserie', correct: s.correct, tid_s: s.time_spent, selected: s.selected, typ: 'pass' }));

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
    test_kind: 'figurserie',
    typ: 'pass',
    variant: 'niva',
    niva: meta.niva,
    familj: null,
    niva_fore: null,
    niva_efter: null,
    ratt,
    antal: meta.antal,
    over_tid: tid_s > meta.budget_s ? 1 : 0,
    tid_s,
    ateranvanda: meta.upprepad ? 1 : 0,
    raknade: meta.upprepad ? 0 : svar.length,
    band_ratt: null,
  });

  const efter = await hamtaFigurPass(args.admin, args.userId, rad.id);
  const vy = efter ? figurPassVy(efter) : null;
  return vy ? { ok: true, vy } : { ok: false, status: 404, fel: 'session_saknas' };
}
