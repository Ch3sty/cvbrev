// src/lib/tester/steg2/pass.server.ts
// =============================================================================
// Motorn för passen i testplanens steg 2 (talserier, spatial förmåga och,
// när den finns, ordförråd). Syster till deduktivpassets motor
// (pass-deduktiv.server.ts):
//
// - Servern dömer. Klienten får uppgifterna utan facit; genomgången kommer i
//   svaret på varje svar.
// - Nivå: grund tills bästa grundtestet är minst SITTER_PROCENT, sedan
//   avancerad. Ingen Nivåkoll för de nya typerna än (briefen beslut 6).
// - Spatial förmåga: två uppgifter per form (A, B, C). Riktat pass: alla ur
//   en grupp (regelfamilj eller form).
// - Exponering: uppgifter sedda i nivåtest och pass de senaste 30 dagarna
//   väljs sist. Ett upprepat pass räknas inte i frågestatistiken.
// - Avslutet går genom slutfor_traningssession: ingen nivåpunkt,
//   frågestatistik med typens test_kind och typ pass.
// - Alla skrivningar med service role, villkorade på user_id.
// =============================================================================

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { sparaTestsvar, unikaSvar, SVARSNYCKLAR } from '@/lib/tests/sparaSvar';
import { captureServer } from '@/lib/analytics/server';
import { dagSthlm, type Dag } from '@/lib/traning/datum';
import { harVnPass } from '../pass.server';
import { passNiva, tappadeFamiljer } from '../pass-urval';
import { blandaSeedat, valjFigurer } from '../pass-figur';
import { steg2Motor, type Steg2Motor } from './motor.server';
import {
  STEG2_PASS_ANTAL,
  STEG2_PASS_TEST_TYPE,
  bastaGrundProcent,
  type Steg2Aterkoppling,
  type Steg2PassKind,
  type Steg2PassNiva,
  type Steg2PassResultat,
  type Steg2PassVy,
} from './pass';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Klient = SupabaseClient<any, any, any>;

export interface Steg2PassMeta {
  steg2pass: 1;
  test_kind: Steg2PassKind;
  niva: Steg2PassNiva;
  grupp: string | null;
  fragor: string[];
  version: number;
  upprepad: boolean;
  dag: Dag;
  antal: number;
  budget_s: number;
  ratt?: number;
  tid_s?: number;
  resultat?: Steg2PassResultat;
}

interface Rad {
  id: string;
  test_type: string | null;
  meta: unknown;
  answers: unknown;
  score?: number | null;
  created_at: string;
  started_at?: string | null;
  completed_at: string | null;
}

interface Svar {
  q_id: string;
  selected: number;
  visat: number | null;
  correct: boolean;
  time_spent: number;
}

const KOLUMNER = 'id, test_type, meta, answers, score, created_at, started_at, completed_at';
const GRUND_SLUG: Record<Steg2PassKind, string> = { talserie: 'talserier-grund', spatial: 'spatial-grund', ordforrad: 'ordforrad-grund' };
const NIVA_SLUGAR: Record<Steg2PassKind, string[]> = {
  talserie: ['talserier-grund', 'talserier-avancerad', 'talserier-expert'],
  spatial: ['spatial-grund', 'spatial-avancerad', 'spatial-expert'],
  ordforrad: ['ordforrad-grund', 'ordforrad-avancerad', 'ordforrad-expert'],
};

export function lasSteg2PassMeta(meta: unknown): Steg2PassMeta | null {
  const m = meta as Partial<Steg2PassMeta> | null;
  if (!m || m.steg2pass !== 1 || !Array.isArray(m.fragor) || !m.test_kind) return null;
  return m as Steg2PassMeta;
}

function lasSvar(answers: unknown): Svar[] {
  const lista = unikaSvar(Array.isArray(answers) ? answers : [], SVARSNYCKLAR.matris) as unknown[];
  return lista
    .filter((s): s is Svar => !!s && typeof (s as Svar).q_id === 'string' && typeof (s as Svar).selected === 'number')
    .map((s) => ({ ...s, visat: typeof s.visat === 'number' ? s.visat : null, time_spent: typeof s.time_spent === 'number' && s.time_spent > 0 ? Math.round(s.time_spent) : 0 }));
}

/** Uppgifterna en session visade: passets meta, eller nivåtestets urval. */
function idsForRad(m: Steg2Motor, r: Rad): string[] {
  const pm = lasSteg2PassMeta(r.meta);
  if (pm) return pm.fragor;
  const meta = r.meta as { fragor?: unknown } | null;
  if (Array.isArray(meta?.fragor)) return meta!.fragor.filter((x): x is string => typeof x === 'string');
  if (m.arTestTyp(r.test_type)) return (m.innehall(r).fragor as { id: string }[]).map((f) => f.id);
  return [];
}

async function lasLage(admin: Klient, m: Steg2Motor, userId: string) {
  const kind = m.kind as Steg2PassKind;
  const { data, error } = await admin
    .from('logic_test_v4_sessions')
    .select(KOLUMNER)
    .eq('user_id', userId)
    .in('test_type', [...NIVA_SLUGAR[kind], STEG2_PASS_TEST_TYPE[kind]])
    .order('created_at', { ascending: false })
    .limit(300);
  if (error) throw error;
  const rader = (data ?? []) as Rad[];
  const sedda = new Map<string, Dag>();
  for (const r of rader) {
    const dag = dagSthlm(r.created_at);
    for (const id of idsForRad(m, r)) {
      const forra = sedda.get(id);
      if (!forra || forra < dag) sedda.set(id, dag);
    }
  }
  const niva = passNiva(bastaGrundProcent(rader, GRUND_SLUG[kind])) as Steg2PassNiva;
  return { rader, sedda, niva };
}

function tappadeAckumulerat(m: Steg2Motor, rader: readonly Rad[], extra: Rad | null): Steg2PassResultat['tappade'] {
  const svar: { familj: string | null; correct: boolean }[] = [];
  const pass = [...rader.filter((r) => r.completed_at && lasSteg2PassMeta(r.meta) && r.id !== extra?.id), ...(extra ? [extra] : [])];
  for (const r of pass) for (const s of lasSvar(r.answers)) svar.push({ familj: m.grupp(s.q_id), correct: s.correct });
  return tappadeFamiljer(svar);
}

function aterkopplingFor(m: Steg2Motor, rad: Rad, s: Svar): Steg2Aterkoppling | null {
  const g = m.genomga(s.q_id, rad.id);
  if (!g) return null;
  return { correct: s.correct, rattVisat: g.rattVisat, valtVisat: s.visat, genomgang: g, grupp: m.grupp(s.q_id) };
}

export function steg2PassVy(rad: Rad): Steg2PassVy | null {
  const meta = lasSteg2PassMeta(rad.meta);
  const m = meta ? steg2Motor(meta.test_kind) : null;
  if (!meta || !m) return null;
  const uppgifter = meta.fragor.map((id) => m.visa(id, rad.id));
  if (uppgifter.some((u) => !u)) return null;
  const besvarade: Steg2PassVy['besvarade'] = {};
  const aterkoppling: Steg2PassVy['aterkoppling'] = {};
  for (const s of lasSvar(rad.answers)) {
    besvarade[s.q_id] = { visat: s.visat, tid_s: s.time_spent };
    const at = aterkopplingFor(m, rad, s);
    if (at) aterkoppling[s.q_id] = at;
  }
  return {
    id: rad.id,
    kind: meta.test_kind,
    niva: meta.niva,
    grupp: meta.grupp,
    upprepad: meta.upprepad,
    budget_s: meta.budget_s,
    startad: rad.started_at ?? rad.created_at,
    avslutad: !!rad.completed_at,
    uppgifter: uppgifter.map((u, i) => ({ ...(u as Record<string, unknown>), nyckel: meta.fragor[i] })),
    besvarade,
    aterkoppling,
    resultat: rad.completed_at ? meta.resultat ?? null : null,
  };
}

export async function hamtaSteg2Pass(admin: Klient, userId: string, sessionId: string): Promise<Rad | null> {
  const { data, error } = await admin.from('logic_test_v4_sessions').select(KOLUMNER).eq('id', sessionId).eq('user_id', userId).maybeSingle();
  if (error) throw error;
  const rad = (data as Rad | null) ?? null;
  return rad && lasSteg2PassMeta(rad.meta) ? rad : null;
}

/** Passets uppgifter: spatial två per form i ordningen A, B, C; övriga seedat ur poolen. Riktat: en grupp. */
function valjUppgifter(m: Steg2Motor, niva: Steg2PassNiva, grupp: string | null, sedda: Map<string, Dag>, idag: Dag, seed: string) {
  const pool = m.pool(niva).filter((q) => !grupp || m.gruppNyckel(q.id) === grupp);
  if (m.kind === 'spatial' && !grupp) {
    const ids: string[] = [];
    let upprepad = false;
    for (const form of ['A', 'B', 'C']) {
      const v = valjFigurer(pool.filter((q) => m.gruppNyckel(q.id) === form), 2, sedda, idag, `${seed}:${form}`);
      ids.push(...v.ids);
      upprepad = upprepad || v.upprepad;
    }
    // Aldrig två av samma form i följd: A, B, C, A, B, C.
    const ordning = [0, 2, 4, 1, 3, 5].map((i) => ids[i]).filter(Boolean);
    return { ids: ordning, upprepad };
  }
  const v = valjFigurer(pool, STEG2_PASS_ANTAL, sedda, idag, seed);
  return { ids: blandaSeedat(v.ids, `${seed}:ordning`), upprepad: v.upprepad };
}

export type SkapaSteg2Pass = { ok: true; vy: Steg2PassVy } | { ok: false; status: 403 | 404 | 422; fel: string };

export async function skapaSteg2Pass(args: {
  supabase: Klient;
  admin: Klient;
  userId: string;
  kind: string;
  grupp?: string | null;
  idag?: Dag;
}): Promise<SkapaSteg2Pass> {
  const m = steg2Motor(args.kind);
  if (!m) return { ok: false, status: 404, fel: 'okand_typ' };
  const kind = m.kind as Steg2PassKind;
  const idag = args.idag ?? dagSthlm();
  const grupp = args.grupp ?? null;
  const [har, lage] = await Promise.all([harVnPass(args.supabase, args.userId), lasLage(args.admin, m, args.userId)]);
  if (!har) return { ok: false, status: 403, fel: 'betalvagg' };

  // Ett påbörjat pass i dag (samma grupp) återupptas.
  const pagaende = lage.rader.find((r) => {
    const pm = lasSteg2PassMeta(r.meta);
    return !r.completed_at && pm && pm.dag === idag && (pm.grupp ?? null) === grupp;
  });
  if (pagaende) {
    const vy = steg2PassVy(pagaende);
    if (vy) return { ok: true, vy };
  }

  const seed = `${args.userId}:${idag}:${lage.rader.length}:${kind}`;
  const val = valjUppgifter(m, lage.niva, grupp, lage.sedda, idag, seed);
  if (val.ids.length === 0) return { ok: false, status: 422, fel: 'banken_tom' };

  const meta: Steg2PassMeta = {
    steg2pass: 1,
    test_kind: kind,
    niva: lage.niva,
    grupp,
    fragor: val.ids,
    version: m.version,
    upprepad: val.upprepad,
    dag: idag,
    antal: val.ids.length,
    budget_s: val.ids.reduce((s, id) => s + m.budget(id), 0),
  };
  const { data, error } = await args.admin
    .from('logic_test_v4_sessions')
    .insert({ user_id: args.userId, test_type: STEG2_PASS_TEST_TYPE[kind], answers: [], meta })
    .select(KOLUMNER)
    .single();
  if (error || !data) throw error ?? new Error('passet skapades inte');
  const vy = steg2PassVy(data as Rad);
  if (!vy) throw new Error('passets meta gick inte att läsa');
  return { ok: true, vy };
}

export type SvarSteg2Pass =
  | { ok: true; nyckel: string; aterkoppling: Steg2Aterkoppling; besvarade: number; antal: number; klar: boolean }
  | { ok: false; status: 400 | 404 | 409; fel: string };

export async function svaraSteg2Pass(args: { admin: Klient; userId: string; sessionId: string; nyckel: unknown; visat: unknown; tid: unknown }): Promise<SvarSteg2Pass> {
  const rad = await hamtaSteg2Pass(args.admin, args.userId, args.sessionId);
  const meta = rad ? lasSteg2PassMeta(rad.meta) : null;
  const m = meta ? steg2Motor(meta.test_kind) : null;
  if (!rad || !meta || !m) return { ok: false, status: 404, fel: 'session_saknas' };
  if (rad.completed_at) return { ok: false, status: 409, fel: 'avslutad' };
  if (typeof args.nyckel !== 'string' || !meta.fragor.includes(args.nyckel)) return { ok: false, status: 400, fel: 'fel_punkt' };
  const tidigare = lasSvar(rad.answers);
  if (tidigare.some((s) => s.q_id === args.nyckel)) return { ok: false, status: 409, fel: 'redan_besvarad' };
  const vetInte = args.visat === null || args.visat === undefined;
  const b = vetInte ? { selected: -1, visat: null, correct: false } : m.bedom(args.nyckel, rad.id, true, args.visat);
  if (!b) return { ok: false, status: 400, fel: 'ogiltigt_svar' };
  const tid = typeof args.tid === 'number' && Number.isFinite(args.tid) && args.tid > 0 ? Math.min(Math.round(args.tid), 3600) : 0;
  const svar: Svar = { q_id: args.nyckel, selected: b.selected, visat: b.visat, correct: b.correct, time_spent: tid };
  const n = await sparaTestsvar(args.admin, { userId: args.userId, tabell: 'logic_test_v4_sessions', sessionId: rad.id, nycklar: SVARSNYCKLAR.matris, svar: { ...svar } });
  if (n === null) return { ok: false, status: 409, fel: 'avslutad' };
  const at = aterkopplingFor(m, rad, svar);
  if (!at) return { ok: false, status: 400, fel: 'ogiltigt_svar' };
  const besvarade = tidigare.length + 1;
  return { ok: true, nyckel: args.nyckel, aterkoppling: at, besvarade, antal: meta.antal, klar: besvarade >= meta.antal };
}

export type SlutforSteg2Pass = { ok: true; vy: Steg2PassVy } | { ok: false; status: 400 | 404 | 409; fel: string };

export async function slutforSteg2Pass(args: { admin: Klient; userId: string; sessionId: string }): Promise<SlutforSteg2Pass> {
  const rad = await hamtaSteg2Pass(args.admin, args.userId, args.sessionId);
  const meta = rad ? lasSteg2PassMeta(rad.meta) : null;
  const m = meta ? steg2Motor(meta.test_kind) : null;
  if (!rad || !meta || !m) return { ok: false, status: 404, fel: 'session_saknas' };
  if (rad.completed_at) {
    const vy = steg2PassVy(rad);
    return vy ? { ok: true, vy } : { ok: false, status: 409, fel: 'redan_avslutad' };
  }
  const svar = lasSvar(rad.answers);
  if (svar.length === 0) return { ok: false, status: 400, fel: 'inga_svar' };

  const lage = await lasLage(args.admin, m, args.userId);
  const ratt = svar.filter((s) => s.correct).length;
  const tid_s = svar.reduce((sum, s) => sum + s.time_spent, 0);
  const resultat: Steg2PassResultat = { ratt, antal: meta.antal, tid_s, budget_s: meta.budget_s, tappade: tappadeAckumulerat(m, lage.rader, rad) };
  const statistik = meta.upprepad
    ? null
    : (m.statistik(svar.filter((s) => s.selected >= 0)) as Record<string, unknown>[]).map((r) => ({ ...r, typ: 'pass' }));

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
  if (!((data ?? {}) as { slutford?: boolean }).slutford) return { ok: false, status: 409, fel: 'redan_avslutad' };

  void captureServer('pass_klart', args.userId, {
    test_kind: meta.test_kind,
    typ: meta.grupp ? 'riktat' : 'pass',
    variant: 'niva',
    niva: meta.niva,
    familj: meta.grupp,
    niva_fore: null,
    niva_efter: null,
    ratt,
    antal: meta.antal,
    over_tid: tid_s > meta.budget_s ? 1 : 0,
    tid_s,
    ateranvanda: meta.upprepad ? 1 : 0,
    raknade: meta.upprepad ? 0 : svar.length,
    band_ratt: null,
  } as never);

  const efter = await hamtaSteg2Pass(args.admin, args.userId, rad.id);
  const vy = efter ? steg2PassVy(efter) : null;
  return vy ? { ok: true, vy } : { ok: false, status: 404, fel: 'session_saknas' };
}
