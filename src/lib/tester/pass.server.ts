// src/lib/tester/pass.server.ts
// =============================================================================
// Motorn för text- och sifferpassen och deras riktade pass (beställning
// omgång 2, B2 och B3). Syster till övningsprovets motor
// (src/lib/ovningsprov/motor.server.ts): ett underlag, fyra uppgifter, ett
// svar i taget med rätt svar och förklaring efter svaret.
//
// - Servern dömer. Klienten får underlaget och uppgifterna utan facit;
//   facit och förklaring kommer i svaret på varje svar.
// - Nivå: grund tills bästa klassiska grundresultat är minst SITTER_PROCENT,
//   därefter avancerad (pass-urval.ts). Expert har ingen passform.
// - Exponering: sedda.server.ts, karensen 30 dagar. Ett upprepat underlag
//   räknas inte i frågestatistiken.
// - Avslutet går genom slutfor_traningssession (samma rpc som matrispassen):
//   ingen nivåpunkt, frågestatistiken med test_kind verbal eller numerisk och
//   typ enligt kalibreringskontraktet. Ingen kalibreringsfråga.
// - Alla skrivningar med service role, villkorade på user_id.
// =============================================================================

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { sparaTestsvar, unikaSvar, SVARSNYCKLAR } from '@/lib/tests/sparaSvar';
import { captureServer } from '@/lib/analytics/server';
import { getUserScope } from '@/lib/supabase/premiumAccess';
import { scopeHasFeature } from '@/lib/access/features';
import { dagSthlm, type Dag } from '@/lib/traning/datum';
import { totalForSession } from '@/app/dashboard/tester/testConfig';
import { UNDERLAG_VERSION, type UnderlagVersion } from './underlagVersion';
import { seddaTestTyper, seddaUrRader, type SeddRad } from './sedda.server';
import { passNiva, riktadeFamiljer, tappadeFamiljer, valjUnderlag, type Sedda } from './pass-urval';
import {
  familjForSvar,
  finnsUnderlag,
  harFamilj,
  klientform,
  nycklarFor,
  passPool,
  ratta,
} from './pass-bank.server';
import {
  VN_ANTAL,
  VN_BUDGET_S,
  VN_FAMILJER,
  VN_PASS_TEST_TYPE,
  arVnFamilj,
  kindForTestTyp,
  type VnAterkoppling,
  type VnKind,
  type VnNiva,
  type VnPassTyp,
  type VnPassVy,
  type VnResultat,
} from './pass-typer';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Klient = SupabaseClient<any, any, any>;

export interface VnPassMeta {
  /** Markerar text- och sifferpassen. Aldrig meta.traning: matrismotorn läser inte de här. */
  vnpass: 1;
  /** Svaren lagras som originalindex (frågestatistiken kräver flaggan). */
  alternativ_blandade: true;
  typ: VnPassTyp;
  test_kind: VnKind;
  niva: VnNiva;
  underlag_id: string;
  familj: string | null;
  underlag_version: UnderlagVersion;
  upprepad: boolean;
  dag: Dag;
  antal: number;
  budget_s: number;
  /** Avancerad sitter: "Expertnivån: gör nivåtestet". */
  expert_rad: boolean;
  /* Satt vid avslutet. */
  ratt?: number;
  tid_s?: number;
  resultat?: VnResultat;
}

export interface VnRad {
  id: string;
  test_type: string | null;
  meta: unknown;
  answers: unknown;
  score?: number | null;
  created_at: string;
  started_at?: string | null;
  completed_at: string | null;
}

interface VnSvar {
  q_id: string;
  svar: string;
  selected: number;
  visat: number;
  correct: boolean;
  time_spent: number;
}

const KOLUMNER = 'id, test_type, meta, answers, score, created_at, started_at, completed_at';

export function lasVnMeta(meta: unknown): VnPassMeta | null {
  const m = meta as Partial<VnPassMeta> | null;
  if (!m || m.vnpass !== 1 || (m.test_kind !== 'verbal' && m.test_kind !== 'numerisk') || typeof m.underlag_id !== 'string') return null;
  if (m.typ !== 'pass' && m.typ !== 'riktat') return null;
  return m as VnPassMeta;
}

function lasVnSvar(answers: unknown): VnSvar[] {
  const lista = unikaSvar(Array.isArray(answers) ? answers : [], SVARSNYCKLAR.matris) as unknown[];
  return lista.filter(
    (s): s is VnSvar => !!s && typeof (s as VnSvar).q_id === 'string' && typeof (s as VnSvar).svar === 'string'
  ).map((s) => ({ ...s, time_spent: typeof s.time_spent === 'number' && s.time_spent > 0 ? Math.round(s.time_spent) : 0 }));
}

/* ------------------------------- Läget ------------------------------- */

/** Klassiska grundtestets test_type och slug per slag, för nivån. */
const GRUND: Record<VnKind, { typer: string[]; slug: string }> = {
  verbal: { typer: ['verbal-resonemang', 'verbal-reasoning'], slug: 'verbal-resonemang' },
  numerisk: { typer: ['numerical-reasoning', 'numeriskt-test'], slug: 'numeriskt-test' },
};

/** Bästa slutförda klassiska grundresultat i procent, null utan försök. Ren. */
export function bastaGrundProcent(kind: VnKind, rader: readonly VnRad[]): number | null {
  const g = GRUND[kind];
  let bast: number | null = null;
  for (const r of rader) {
    if (!r.completed_at || !g.typer.includes(r.test_type ?? '') || typeof r.score !== 'number') continue;
    const total = totalForSession(g.slug, r.meta);
    if (!total) continue;
    const p = Math.max(0, Math.min(100, Math.round((r.score / total) * 100)));
    bast = bast == null ? p : Math.max(bast, p);
  }
  return bast;
}

export interface VnLage {
  idag: Dag;
  niva: VnNiva;
  sedda: Sedda;
  rader: VnRad[];
}

async function lasVnLage(admin: Klient, userId: string, kind: VnKind, idag: Dag): Promise<VnLage> {
  const { data, error } = await admin
    .from('logic_test_v4_sessions')
    .select(KOLUMNER)
    .eq('user_id', userId)
    .in('test_type', seddaTestTyper(kind))
    .order('created_at', { ascending: false })
    .limit(300);
  if (error) throw error;
  const rader = (data ?? []) as VnRad[];
  return { idag, niva: passNiva(bastaGrundProcent(kind, rader)), sedda: seddaUrRader(kind, rader as SeddRad[]), rader };
}

/** Familjerna med ett riktat pass på hennes nivå. */
function riktadeIdag(kind: VnKind, lage: VnLage): Set<string> {
  return new Set(
    riktadeFamiljer({
      familjer: VN_FAMILJER[kind],
      pool: passPool(kind, lage.niva),
      harFamilj: (id, f) => harFamilj(kind, id, f),
      sedda: lage.sedda,
      idag: lage.idag,
    }).map((f) => f.familj)
  );
}

/** Passens svar per familj, ackumulerat över hennes slutförda pass av slaget. */
function tappadeAckumulerat(kind: VnKind, rader: readonly VnRad[], extra: VnRad | null, riktade: ReadonlySet<string>): VnResultat['tappade'] {
  const svar: { familj: string | null; correct: boolean }[] = [];
  const sessioner = [...rader.filter((r) => r.completed_at && lasVnMeta(r.meta)?.test_kind === kind && r.id !== extra?.id), ...(extra ? [extra] : [])];
  for (const r of sessioner) {
    for (const s of lasVnSvar(r.answers)) svar.push({ familj: familjForSvar(kind, s.q_id, s.svar), correct: s.correct });
  }
  return tappadeFamiljer(svar).map((f) => ({ ...f, riktat: riktade.has(f.familj) }));
}

/* ----------------------------- Klientvyn ----------------------------- */

export function vnPassVy(rad: VnRad): VnPassVy | null {
  const meta = lasVnMeta(rad.meta);
  if (!meta) return null;
  const form = klientform(meta.test_kind, meta.underlag_id, rad.id, meta.typ === 'riktat' ? meta.familj : null);
  if (!form) return null;
  const svar = lasVnSvar(rad.answers);
  const besvarade: VnPassVy['besvarade'] = {};
  const aterkoppling: Record<string, VnAterkoppling> = {};
  for (const s of svar) {
    besvarade[s.q_id] = { svar: s.svar, tid_s: s.time_spent };
    const r = ratta(meta.test_kind, meta.underlag_id, s.q_id, s.svar, rad.id);
    if (r) aterkoppling[s.q_id] = { correct: r.correct, ratt: r.ratt, forklaring: r.forklaring };
  }
  return {
    id: rad.id,
    typ: meta.typ,
    kind: meta.test_kind,
    niva: meta.niva,
    familj: meta.familj,
    upprepad: meta.upprepad,
    budget_s: meta.budget_s,
    startad: rad.started_at ?? rad.created_at,
    avslutad: !!rad.completed_at,
    expertRad: meta.expert_rad,
    underlag: form.underlag,
    punkter: form.punkter,
    besvarade,
    aterkoppling,
    resultat: rad.completed_at ? meta.resultat ?? null : null,
  };
}

export async function hamtaVnPass(admin: Klient, userId: string, sessionId: string): Promise<VnRad | null> {
  const { data, error } = await admin
    .from('logic_test_v4_sessions')
    .select(KOLUMNER)
    .eq('id', sessionId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  const rad = (data as VnRad | null) ?? null;
  return rad && lasVnMeta(rad.meta) ? rad : null;
}

/* ------------------------------- Skapa ------------------------------- */

export type SkapaVnPass = { ok: true; vy: VnPassVy } | { ok: false; status: 403 | 422; fel: string };

/** Har kontot passen? test_daily_pass (Premium). */
export async function harVnPass(supabase: Klient, userId: string): Promise<boolean> {
  return scopeHasFeature(await getUserScope(supabase, userId), 'test_daily_pass');
}

export async function skapaVnPass(args: {
  supabase: Klient;
  admin: Klient;
  userId: string;
  kind: VnKind;
  familj?: string | null;
  idag?: Dag;
}): Promise<SkapaVnPass> {
  const idag = args.idag ?? dagSthlm();
  const familj = args.familj ?? null;
  if (familj != null && !arVnFamilj(args.kind, familj)) return { ok: false, status: 422, fel: 'okand_familj' };
  const typ: VnPassTyp = familj ? 'riktat' : 'pass';
  const [har, lage] = await Promise.all([harVnPass(args.supabase, args.userId), lasVnLage(args.admin, args.userId, args.kind, idag)]);
  if (!har) return { ok: false, status: 403, fel: 'betalvagg' };

  // Ett påbörjat pass av samma slag i dag återupptas: en omladdning eller ett andra tryck skapar inget nytt.
  const pagaende = lage.rader.find((r) => {
    const m = lasVnMeta(r.meta);
    return !r.completed_at && m && m.typ === typ && m.familj === familj && m.dag === idag;
  });
  if (pagaende) {
    const vy = vnPassVy(pagaende);
    if (vy) return { ok: true, vy };
  }

  let pool = passPool(args.kind, lage.niva);
  if (familj) {
    if (!riktadeIdag(args.kind, lage).has(familj)) return { ok: false, status: 422, fel: 'familj_for_liten' };
    pool = pool.filter((p) => harFamilj(args.kind, p.id, familj));
  }
  const seed = `${args.userId}:${idag}:${lage.rader.length}:${args.kind}:${familj ?? ''}`;
  const val = valjUnderlag({ pool, sedda: lage.sedda, idag, seed });
  if (!val) return { ok: false, status: 422, fel: 'banken_tom' };

  const meta: VnPassMeta = {
    vnpass: 1,
    alternativ_blandade: true,
    typ,
    test_kind: args.kind,
    niva: lage.niva,
    underlag_id: val.id,
    familj,
    underlag_version: UNDERLAG_VERSION,
    upprepad: val.upprepad,
    dag: idag,
    antal: nycklarFor(args.kind, val.id).length || VN_ANTAL,
    budget_s: VN_BUDGET_S[args.kind],
    expert_rad: lage.niva === 'avancerad',
  };
  const { data, error } = await args.admin
    .from('logic_test_v4_sessions')
    .insert({ user_id: args.userId, test_type: VN_PASS_TEST_TYPE[args.kind][typ], answers: [], meta })
    .select(KOLUMNER)
    .single();
  if (error || !data) throw error ?? new Error('passet skapades inte');
  const vy = vnPassVy(data as VnRad);
  if (!vy) throw new Error('passets meta gick inte att läsa');
  return { ok: true, vy };
}

/* ------------------------------- Svaret ------------------------------ */

export type SvarVnPass =
  | { ok: true; nyckel: string; aterkoppling: VnAterkoppling; besvarade: number; antal: number; klar: boolean }
  | { ok: false; status: 400 | 404 | 409; fel: string };

export async function svaraVnPass(args: {
  admin: Klient;
  userId: string;
  sessionId: string;
  nyckel: unknown;
  svar: unknown;
  tid: unknown;
}): Promise<SvarVnPass> {
  const rad = await hamtaVnPass(args.admin, args.userId, args.sessionId);
  const meta = rad ? lasVnMeta(rad.meta) : null;
  if (!rad || !meta) return { ok: false, status: 404, fel: 'session_saknas' };
  if (rad.completed_at) return { ok: false, status: 409, fel: 'avslutad' };
  if (typeof args.nyckel !== 'string' || !nycklarFor(meta.test_kind, meta.underlag_id).includes(args.nyckel)) {
    return { ok: false, status: 400, fel: 'fel_punkt' };
  }
  const tidigare = lasVnSvar(rad.answers);
  if (tidigare.some((s) => s.q_id === args.nyckel)) return { ok: false, status: 409, fel: 'redan_besvarad' };
  const r = ratta(meta.test_kind, meta.underlag_id, args.nyckel, args.svar, rad.id);
  if (!r) return { ok: false, status: 400, fel: 'ogiltigt_svar' };
  const tid = typeof args.tid === 'number' && Number.isFinite(args.tid) && args.tid > 0 ? Math.min(Math.round(args.tid), 3600) : 0;
  const n = await sparaTestsvar(args.admin, {
    userId: args.userId,
    tabell: 'logic_test_v4_sessions',
    sessionId: rad.id,
    nycklar: SVARSNYCKLAR.matris,
    svar: { q_id: args.nyckel, svar: args.svar as string, selected: r.selected, visat: r.visat, correct: r.correct, time_spent: tid },
  });
  if (n === null) return { ok: false, status: 409, fel: 'avslutad' };
  const besvarade = tidigare.length + 1;
  return {
    ok: true,
    nyckel: args.nyckel,
    aterkoppling: { correct: r.correct, ratt: r.ratt, forklaring: r.forklaring },
    besvarade,
    antal: meta.antal,
    klar: besvarade >= meta.antal,
  };
}

/* ------------------------------- Avslutet ---------------------------- */

export type SlutforVnPass = { ok: true; vy: VnPassVy } | { ok: false; status: 400 | 404 | 409; fel: string };

export async function slutforVnPass(args: { admin: Klient; userId: string; sessionId: string; idag?: Dag }): Promise<SlutforVnPass> {
  const idag = args.idag ?? dagSthlm();
  const rad = await hamtaVnPass(args.admin, args.userId, args.sessionId);
  const meta = rad ? lasVnMeta(rad.meta) : null;
  if (!rad || !meta) return { ok: false, status: 404, fel: 'session_saknas' };
  if (rad.completed_at) {
    const vy = vnPassVy(rad);
    return vy ? { ok: true, vy } : { ok: false, status: 409, fel: 'redan_avslutad' };
  }
  const svar = lasVnSvar(rad.answers);
  if (svar.length === 0) return { ok: false, status: 400, fel: 'inga_svar' };

  const lage = await lasVnLage(args.admin, args.userId, meta.test_kind, idag);
  const ratt = svar.filter((s) => s.correct).length;
  const tid_s = svar.reduce((sum, s) => sum + s.time_spent, 0);
  const resultat: VnResultat = {
    ratt,
    antal: meta.antal,
    tid_s,
    budget_s: meta.budget_s,
    tappade: tappadeAckumulerat(meta.test_kind, lage.rader, rad, riktadeIdag(meta.test_kind, lage)),
  };

  // Frågestatistiken enligt kalibreringskontraktet: typ = meta.typ, aldrig för upprepade underlag.
  const statistik = meta.upprepad
    ? null
    : svar.map((s) => ({ fraga_id: s.q_id, test_kind: meta.test_kind, correct: s.correct, tid_s: s.time_spent, selected: s.selected, typ: meta.typ }));

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

  void captureServer(meta.typ === 'riktat' ? 'riktat_klart' : 'pass_klart', args.userId, {
    test_kind: meta.test_kind,
    typ: meta.typ,
    variant: 'niva',
    niva: meta.niva,
    familj: meta.familj,
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

  const efter = await hamtaVnPass(args.admin, args.userId, rad.id);
  const vy = efter ? vnPassVy(efter) : null;
  return vy ? { ok: true, vy } : { ok: false, status: 404, fel: 'session_saknas' };
}

/* ------------------------------- Hemvyn ------------------------------ */

export interface VnPassStatus {
  kind: VnKind;
  gjordIdag: boolean;
  /** Riktade pass hon kan starta i dag (familjerna med minst tre osedda underlag). */
  riktade: string[];
}

/** Slagets typ ur en rad, för hemvyns räkning. Ren. */
export function vnPassDag(rad: { test_type: string | null; meta: unknown; completed_at: string | null }): { kind: VnKind; typ: VnPassTyp; dag: Dag } | null {
  const kind = kindForTestTyp(rad.test_type);
  const meta = lasVnMeta(rad.meta);
  if (!kind || !meta || !rad.completed_at) return null;
  return { kind, typ: meta.typ, dag: dagSthlm(rad.completed_at) };
}

export function finnsVnUnderlag(kind: VnKind, id: string): boolean {
  return finnsUnderlag(kind, id);
}
