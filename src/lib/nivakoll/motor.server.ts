// src/lib/nivakoll/motor.server.ts
// =============================================================================
// Nivåkollen för figurserier, deduktivt, verbalt och numeriskt (testplanen
// steg 1, 2026-11-09). Samma flöde som matrisens Nivåkoll: uppgifter från
// alla banknivåer, ingen återkoppling under tiden, nivån på skalan 1 till 10
// med samma räkning (src/lib/traning/niva.ts, se kalibreringen i niva.ts här
// bredvid), genomgången efteråt, och dagens pass väljs efter nivån.
//
// - Urval, fast och med det lättaste först: figurserier 3 + 3 + 3 (härnäst),
//   deduktivt 2 + 2 + 2, verbalt och numeriskt en text eller ett underlag ur
//   grund och ett ur avancerad (fyra uppgifter var; expert har ingen
//   passform). Det hon haft de senaste 30 dagarna väljs sist.
// - Servern dömer. Klienten får uppgifterna utan facit; facit, förklaring och
//   lösning kommer i vyn först när Nivåkollen är avslutad.
// - Gratis första gången per testtyp, som matrisens (GRATISNIVA.matningGratis).
//   En ny Nivåkoll kräver tests_above_base (beslutaTillgang). En per testtyp
//   och dag: en avslutad i dag visas i stället för att en ny skapas.
// - Avslutet går genom slutfor_traningssession: nivåpunkt med test_kind
//   typen, typ matning eller ommatning, frågestatistik typ matning (inte för
//   uppgifter hon haft inom 30 dagar). Matrisens nivå, kurva och dag
//   2-mejlet läser bara test_kind matris.
// - Alla skrivningar med service role, villkorade på user_id.
// =============================================================================

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { sparaTestsvar, unikaSvar, SVARSNYCKLAR } from '@/lib/tests/sparaSvar';
import { captureServer } from '@/lib/analytics/server';
import { dagSthlm, type Dag } from '@/lib/traning/datum';
import { matningsNiva } from '@/lib/traning/niva';
import { beslutaTillgang } from '@/lib/traning/tillgang';
import { lasBehorighet } from '@/lib/traning/motor.server';
import type { FragaStatistik } from '@/lib/traning/svarighet';
import { bedomFigur, genomgaFigur, hittaFigurFraga, visaFigur } from '@/lib/figurserierV1/fragor.server';
import { harnastPool } from '@/lib/figurserierV1/select';
import { serieFamiljNamn } from '@/lib/figurserierV1/familjer';
import { bedomDeduktivSvar, genomgaDeduktiv, hittaDeduktivFraga, visaDeduktiv } from '@/lib/deduktivV1/fragor.server';
import { DEDUKTIV_VERSION, poolFor as deduktivPool } from '@/lib/deduktivV1/select';
import { deduktivFamiljNamn } from '@/lib/deduktivV1/familjer';
import { familjForSvar, klientform, nycklarFor, passPool, ratta } from '@/lib/tester/pass-bank.server';
import { vnFamiljNamn } from '@/lib/tester/pass-copy';
import { valjFigurer } from '@/lib/tester/pass-figur';
import { tappadeFamiljer, valjUnderlag, type Sedda } from '@/lib/tester/pass-urval';
import {
  lasSeddaUnderlag,
  seddaDeduktivaUrRader,
  seddaDeduktivTestTyper,
  seddaFigurerUrRader,
  seddaFigurTestTyper,
  type SeddRad,
} from '@/lib/tester/sedda.server';
import { arOsett } from '@/lib/tester/pass-urval';
import type { VnUnderlag } from '@/lib/tester/pass-typer';
import { NIVAKOLL_TEST_TYPE, passNivaUrNiva, vantadAndel, type NivakollKind } from './niva';
import { pFor, pGrund, pNiva } from './las.server';
import type { BankNiva, NivakollGenomgang, NivakollResultat, NivakollUppgift, NivakollVy } from './typer';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Klient = SupabaseClient<any, any, any>;

/** Provets tid per uppgift: figurserier 45, deduktivt 75, en text 150 på fyra påståenden, ett underlag 300 på fyra frågor. */
export const NIVAKOLL_BUDGET_S: Readonly<Record<NivakollKind, number>> = { figurserie: 45, deduktiv: 75, verbal: 37, numerisk: 75 };

/** Antal uppgifter per banknivå (figurserier, deduktivt) och antal underlag per nivå (verbalt, numeriskt). */
export const NIVAKOLL_URVAL = {
  figurserie: { grund: 3, avancerad: 3, expert: 3 },
  deduktiv: { grund: 2, avancerad: 2, expert: 2 },
  underlag: { grund: 1, avancerad: 1 },
} as const;

export interface NivakollMeta {
  nivakoll: 1;
  alternativ_blandade: true;
  test_kind: NivakollKind;
  typ: 'matning' | 'ommatning';
  /** Uppgifternas nycklar i ordning. */
  fragor: string[];
  /** Bankens nivå per nyckel. */
  nivaer: Record<string, BankNiva>;
  /** Verbalt och numeriskt: underlagens id (sedda.server läser delar). */
  delar?: string[];
  /** Uppgifter hon haft inom 30 dagar: räknas i nivån men inte i frågestatistiken. */
  upprepade: string[];
  fore: number | null;
  dag: Dag;
  antal: number;
  budget_s: number;
  deduktiv_version?: number;
  resultat?: NivakollResultat;
}

interface Rad {
  id: string;
  test_type: string | null;
  meta: unknown;
  answers: unknown;
  created_at: string;
  started_at?: string | null;
  completed_at: string | null;
}

interface Svar {
  q_id: string;
  svar: string | null;
  selected: number;
  correct: boolean;
  time_spent: number;
}

const KOLUMNER = 'id, test_type, meta, answers, created_at, started_at, completed_at';

export function lasNivakollMeta(meta: unknown): NivakollMeta | null {
  const m = meta as Partial<NivakollMeta> | null;
  if (!m || m.nivakoll !== 1 || !Array.isArray(m.fragor) || !m.test_kind) return null;
  return m as NivakollMeta;
}

function lasSvar(answers: unknown): Svar[] {
  const lista = unikaSvar(Array.isArray(answers) ? answers : [], SVARSNYCKLAR.matris) as unknown[];
  return lista
    .filter((s): s is Svar => !!s && typeof (s as Svar).q_id === 'string')
    .map((s) => ({
      ...s,
      svar: typeof s.svar === 'string' ? s.svar : null,
      selected: typeof s.selected === 'number' ? s.selected : -1,
      correct: s.correct === true,
      time_spent: typeof s.time_spent === 'number' && s.time_spent > 0 ? Math.round(s.time_spent) : 0,
    }));
}

/* --------------------------------- Urvalet -------------------------------- */

function underlagFor(kind: 'verbal' | 'numerisk', nyckel: string): string {
  if (kind === 'verbal') return nyckel.slice(0, nyckel.lastIndexOf(':'));
  // Numeriskt: frågans id; underlaget står i metans delar.
  return nyckel;
}

/** Urvalet: nycklarna i ordning, nivån per nyckel, underlagen och vilka hon haft inom 30 dagar. */
export function valjNivakoll(kind: NivakollKind, sedda: Sedda, idag: Dag, seed: string): { fragor: string[]; nivaer: Record<string, BankNiva>; delar?: string[]; upprepade: string[] } {
  const nivaer: Record<string, BankNiva> = {};
  const fragor: string[] = [];
  const upprepade: string[] = [];
  if (kind === 'figurserie' || kind === 'deduktiv') {
    const antal = NIVAKOLL_URVAL[kind];
    for (const n of ['grund', 'avancerad', 'expert'] as const) {
      const pool = kind === 'figurserie' ? harnastPool(n) : deduktivPool(n, DEDUKTIV_VERSION);
      const val = valjFigurer(pool, antal[n], sedda, idag, `${seed}:${n}`);
      for (const id of val.ids) {
        nivaer[id] = n;
        fragor.push(id);
        if (!arOsett(id, sedda, idag)) upprepade.push(id);
      }
    }
    return { fragor, nivaer, upprepade };
  }
  const delar: string[] = [];
  for (const n of ['grund', 'avancerad'] as const) {
    const u = valjUnderlag({ pool: passPool(kind, n), sedda, idag, seed: `${seed}:${n}` });
    if (!u) continue;
    delar.push(u.id);
    for (const nyckel of nycklarFor(kind, u.id)) {
      nivaer[nyckel] = n;
      fragor.push(nyckel);
      if (u.upprepad) upprepade.push(nyckel);
    }
  }
  return { fragor, nivaer, delar, upprepade };
}

async function lasSedda(admin: Klient, userId: string, kind: NivakollKind): Promise<Sedda> {
  if (kind === 'verbal' || kind === 'numerisk') return (await lasSeddaUnderlag(admin, userId, kind)).sedda;
  const typer = kind === 'figurserie' ? seddaFigurTestTyper() : seddaDeduktivTestTyper();
  const { data, error } = await admin
    .from('logic_test_v4_sessions')
    .select('id, test_type, meta, created_at')
    .eq('user_id', userId)
    .in('test_type', typer)
    .order('created_at', { ascending: false })
    .limit(300);
  if (error) throw error;
  const rader = (data ?? []) as SeddRad[];
  return kind === 'figurserie' ? seddaFigurerUrRader(rader) : seddaDeduktivaUrRader(rader);
}

/* ------------------------------- Klientformen ------------------------------ */

function uppgiftFor(kind: NivakollKind, nyckel: string, niva: BankNiva, sessionId: string, delar: readonly string[]): NivakollUppgift | null {
  if (kind === 'figurserie') {
    const q = hittaFigurFraga(nyckel);
    if (!q) return null;
    const v = visaFigur(q, sessionId);
    return { kind, nyckel, niva, form: v.form ?? 'harnast', rad: v.rad, options: v.options };
  }
  if (kind === 'deduktiv') {
    const q = hittaDeduktivFraga(nyckel);
    if (!q) return null;
    const v = visaDeduktiv(q, sessionId, true);
    return { kind, nyckel, niva, intro: v.intro, villkor: v.villkor, fraga: v.fraga, options: v.options, premisser: q.typ === 'D1' };
  }
  const underlag = kind === 'verbal' ? underlagFor(kind, nyckel) : delar.find((d) => nycklarFor(kind, d).includes(nyckel));
  if (!underlag) return null;
  const form = klientform(kind, underlag, sessionId);
  const p = form?.punkter.find((x) => x.nyckel === nyckel);
  if (!p) return null;
  return { kind, nyckel, niva, underlag, text: p.text, alternativ: p.alternativ };
}

/** Rättningen av ett svar (null = "Vet inte"): selected i originalindex, och genomgången. */
function bedom(kind: NivakollKind, u: NivakollUppgift, svar: string | null, sessionId: string): { selected: number; correct: boolean; genomgang: NivakollGenomgang } | null {
  if (kind === 'figurserie') {
    const q = hittaFigurFraga(u.nyckel);
    if (!q) return null;
    const b = bedomFigur(q, sessionId, svar === null ? null : Number(svar));
    if (!b) return null;
    const g = genomgaFigur(q, sessionId);
    return {
      selected: b.selected,
      correct: b.correct,
      genomgang: { correct: b.correct, ratt: String(g.rattVisat), valt: svar, forklaring: q.rule, misstag: !b.correct && b.visat !== null ? g.misstag[b.visat] || null : null },
    };
  }
  if (kind === 'deduktiv') {
    const q = hittaDeduktivFraga(u.nyckel);
    if (!q) return null;
    const b = svar === null ? { selected: -1, visat: null as number | null, correct: false } : bedomDeduktivSvar(q, sessionId, true, Number(svar));
    if (!b) return null;
    const g = genomgaDeduktiv(q, sessionId, true);
    return {
      selected: b.selected,
      correct: b.correct,
      genomgang: { correct: b.correct, ratt: String(g.rattVisat), valt: svar, forklaring: null, misstag: !b.correct && b.visat !== null ? g.misstag[b.visat] || null : null, losning: g.losning },
    };
  }
  if (u.kind !== 'verbal' && u.kind !== 'numerisk') return null;
  if (svar === null) {
    // "Vet inte": rätt svar ur rättningen av ett giltigt svar.
    const r = ratta(kind, u.underlag, u.nyckel, u.alternativ[0]?.id, sessionId);
    if (!r) return null;
    return { selected: -1, correct: false, genomgang: { correct: false, ratt: r.ratt, valt: null, forklaring: r.forklaring, misstag: null } };
  }
  const r = ratta(kind, u.underlag, u.nyckel, svar, sessionId);
  if (!r) return null;
  return { selected: r.selected, correct: r.correct, genomgang: { correct: r.correct, ratt: r.ratt, valt: svar, forklaring: r.forklaring, misstag: null } };
}

function familjNamn(kind: NivakollKind, u: NivakollUppgift, svar: string | null): string | null {
  if (kind === 'figurserie') return serieFamiljNamn(hittaFigurFraga(u.nyckel)?.family) ?? null;
  if (kind === 'deduktiv') return deduktivFamiljNamn(hittaDeduktivFraga(u.nyckel)?.family) ?? null;
  return vnFamiljNamn(familjForSvar(kind, u.nyckel, svar ?? (kind === 'numerisk' ? null : 'true')));
}

export function nivakollVy(rad: Rad): NivakollVy | null {
  const meta = lasNivakollMeta(rad.meta);
  if (!meta) return null;
  const kind = meta.test_kind;
  const delar = meta.delar ?? [];
  const uppgifter = meta.fragor.map((n) => uppgiftFor(kind, n, meta.nivaer[n] ?? 'grund', rad.id, delar));
  if (uppgifter.some((u) => !u)) return null;
  const underlag: Record<string, VnUnderlag> = {};
  if (kind === 'verbal' || kind === 'numerisk') {
    for (const d of delar) {
      const f = klientform(kind, d, rad.id);
      if (f) underlag[d] = f.underlag;
    }
  }
  const svar = lasSvar(rad.answers);
  const besvarade: NivakollVy['besvarade'] = {};
  for (const s of svar) besvarade[s.q_id] = { svar: s.svar, tid_s: s.time_spent };
  let genomgang: NivakollVy['genomgang'] = null;
  if (rad.completed_at) {
    genomgang = {};
    for (const u of uppgifter as NivakollUppgift[]) {
      const b = bedom(kind, u, besvarade[u.nyckel]?.svar ?? null, rad.id);
      if (b) genomgang[u.nyckel] = besvarade[u.nyckel] ? b.genomgang : { ...b.genomgang, valt: null, correct: false, misstag: null };
    }
  }
  return {
    id: rad.id,
    kind,
    typ: meta.typ,
    startad: rad.started_at ?? rad.created_at,
    avslutad: !!rad.completed_at,
    budget_s: meta.budget_s,
    uppgifter: uppgifter as NivakollUppgift[],
    underlag,
    besvarade,
    genomgang,
    resultat: rad.completed_at ? meta.resultat ?? null : null,
  };
}

export async function hamtaNivakoll(admin: Klient, userId: string, sessionId: string): Promise<Rad | null> {
  const { data, error } = await admin.from('logic_test_v4_sessions').select(KOLUMNER).eq('id', sessionId).eq('user_id', userId).maybeSingle();
  if (error) throw error;
  const rad = (data as Rad | null) ?? null;
  return rad && lasNivakollMeta(rad.meta) ? rad : null;
}

/* ---------------------------------- Skapa ---------------------------------- */

export type SkapaNivakoll = { ok: true; vy: NivakollVy } | { ok: false; status: 402 | 422; fel: string };

export async function skapaNivakoll(args: { supabase: Klient; admin: Klient; userId: string; kind: NivakollKind; idag?: Dag }): Promise<SkapaNivakoll> {
  const idag = args.idag ?? dagSthlm();
  const [beh, sessRes, punktRes, sedda] = await Promise.all([
    lasBehorighet(args.supabase, args.userId).catch(() => ({ harOvanGrund: false, harProvlage: false, harHistorik: false })),
    args.admin
      .from('logic_test_v4_sessions')
      .select(KOLUMNER)
      .eq('user_id', args.userId)
      .eq('test_type', NIVAKOLL_TEST_TYPE[args.kind])
      .order('created_at', { ascending: false })
      .limit(50),
    args.admin
      .from('test_nivapunkter')
      .select('niva, dag, skapad_at')
      .eq('user_id', args.userId)
      .eq('test_kind', args.kind)
      .order('dag', { ascending: false })
      .order('skapad_at', { ascending: false })
      .limit(1),
    lasSedda(args.admin, args.userId, args.kind).catch((e) => {
      console.error('[nivakoll] sedda', e);
      return new Map() as Sedda;
    }),
  ]);
  if (sessRes.error) throw sessRes.error;
  const rader = (sessRes.data ?? []) as Rad[];

  // En påbörjad i dag återupptas, en avslutad i dag visas (en per typ och dag).
  const idagRad = rader.find((r) => lasNivakollMeta(r.meta)?.dag === idag);
  if (idagRad) {
    const vy = nivakollVy(idagRad);
    if (vy) return { ok: true, vy };
  }

  const slutforda = rader.filter((r) => r.completed_at).length;
  const beslut = beslutaTillgang({ begard: 'matning', harOvanGrund: beh.harOvanGrund, harProvlage: beh.harProvlage, matningarSlutforda: slutforda, passSlutfordaIdag: 0 });
  if (!beslut.tillatet) return { ok: false, status: 402, fel: 'betalvagg' };

  const forePunkt = punktRes.error ? null : Number((punktRes.data ?? [])[0]?.niva);
  const fore = forePunkt != null && Number.isFinite(forePunkt) && forePunkt > 0 ? forePunkt : null;
  const seed = `${args.userId}:${idag}:${rader.length}:nivakoll:${args.kind}`;
  const val = valjNivakoll(args.kind, sedda, idag, seed);
  if (val.fragor.length === 0) return { ok: false, status: 422, fel: 'banken_tom' };

  const meta: NivakollMeta = {
    nivakoll: 1,
    alternativ_blandade: true,
    test_kind: args.kind,
    typ: slutforda > 0 || fore != null ? 'ommatning' : 'matning',
    fragor: val.fragor,
    nivaer: val.nivaer,
    ...(val.delar ? { delar: val.delar } : {}),
    upprepade: val.upprepade,
    fore,
    dag: idag,
    antal: val.fragor.length,
    budget_s: NIVAKOLL_BUDGET_S[args.kind],
    ...(args.kind === 'deduktiv' ? { deduktiv_version: DEDUKTIV_VERSION } : {}),
  };
  const { data, error } = await args.admin
    .from('logic_test_v4_sessions')
    .insert({ user_id: args.userId, test_type: NIVAKOLL_TEST_TYPE[args.kind], answers: [], meta })
    .select(KOLUMNER)
    .single();
  if (error || !data) throw error ?? new Error('Nivåkollen skapades inte');
  const vy = nivakollVy(data as Rad);
  if (!vy) throw new Error('Nivåkollens meta gick inte att läsa');
  return { ok: true, vy };
}

/* ---------------------------------- Svaret --------------------------------- */

export type SvarNivakoll = { ok: true; besvarade: number; antal: number; klar: boolean } | { ok: false; status: 400 | 404 | 409; fel: string };

export async function svaraNivakoll(args: { admin: Klient; userId: string; sessionId: string; nyckel: unknown; svar: unknown; tid: unknown }): Promise<SvarNivakoll> {
  const rad = await hamtaNivakoll(args.admin, args.userId, args.sessionId);
  const meta = rad ? lasNivakollMeta(rad.meta) : null;
  if (!rad || !meta) return { ok: false, status: 404, fel: 'session_saknas' };
  if (rad.completed_at) return { ok: false, status: 409, fel: 'avslutad' };
  if (typeof args.nyckel !== 'string' || !meta.fragor.includes(args.nyckel)) return { ok: false, status: 400, fel: 'fel_punkt' };
  const tidigare = lasSvar(rad.answers);
  if (tidigare.some((s) => s.q_id === args.nyckel)) return { ok: false, status: 409, fel: 'redan_besvarad' };
  const svar = args.svar === null || args.svar === undefined ? null : typeof args.svar === 'string' ? args.svar : null;
  if (args.svar != null && svar === null) return { ok: false, status: 400, fel: 'ogiltigt_svar' };
  const u = uppgiftFor(meta.test_kind, args.nyckel, meta.nivaer[args.nyckel] ?? 'grund', rad.id, meta.delar ?? []);
  const b = u ? bedom(meta.test_kind, u, svar, rad.id) : null;
  if (!u || !b) return { ok: false, status: 400, fel: 'ogiltigt_svar' };
  const tid = typeof args.tid === 'number' && Number.isFinite(args.tid) && args.tid > 0 ? Math.min(Math.round(args.tid), 3600) : 0;
  const n = await sparaTestsvar(args.admin, {
    userId: args.userId,
    tabell: 'logic_test_v4_sessions',
    sessionId: rad.id,
    nycklar: SVARSNYCKLAR.matris,
    svar: { q_id: u.nyckel, svar, selected: b.selected, correct: b.correct, time_spent: tid, ...(svar === null ? { vet_inte: true } : {}) },
  });
  if (n === null) return { ok: false, status: 409, fel: 'avslutad' };
  const besvarade = tidigare.length + 1;
  return { ok: true, besvarade, antal: meta.antal, klar: besvarade >= meta.antal };
}

/* -------------------------------- Avslutet --------------------------------- */

/** Resultatet ur svaren. Ren, för tester. */
export function raknaNivakoll(args: {
  kind: NivakollKind;
  uppgifter: readonly NivakollUppgift[];
  svar: readonly Svar[];
  fore: number | null;
  budget_s: number;
  p: (nyckel: string) => number;
  pBank: Record<BankNiva, readonly number[]>;
  pGrund: readonly number[];
}): NivakollResultat {
  const per = new Map(args.svar.map((s) => [s.q_id, s]));
  const nivaSvar = args.uppgifter.map((u) => ({ p: args.p(u.nyckel), correct: per.get(u.nyckel)?.correct === true }));
  const { niva, delta } = matningsNiva(nivaSvar, args.fore);
  const perNiva = (['grund', 'avancerad', 'expert'] as const)
    .map((n) => {
      const us = args.uppgifter.filter((u) => u.niva === n);
      return { niva: n, antal: us.length, ratt: us.filter((u) => per.get(u.nyckel)?.correct).length };
    })
    .filter((x) => x.antal > 0);
  const tappade = tappadeFamiljer(args.uppgifter.map((u) => ({ familj: familjNamn(args.kind, u, per.get(u.nyckel)?.svar ?? null), correct: per.get(u.nyckel)?.correct === true }))).map(
    (f) => ({ namn: f.familj, ratt: f.ratt, antal: f.antal, andel: f.andel })
  );
  const tid_s = args.svar.reduce((s, x) => s + x.time_spent, 0);
  return {
    niva,
    fore: args.fore,
    delta,
    ratt: nivaSvar.filter((x) => x.correct).length,
    antal: args.uppgifter.length,
    tid_s,
    budget_s: args.budget_s * args.uppgifter.length,
    over_tid: args.svar.filter((s) => s.time_spent > args.budget_s).length,
    perNiva,
    tappade,
    passNiva: passNivaUrNiva(niva, args.pGrund),
    vantat: {
      grund: args.pBank.grund.length ? vantadAndel(niva, args.pBank.grund) : null,
      avancerad: args.pBank.avancerad.length ? vantadAndel(niva, args.pBank.avancerad) : null,
      expert: args.pBank.expert.length ? vantadAndel(niva, args.pBank.expert) : null,
    },
  };
}

export type SlutforNivakoll = { ok: true; vy: NivakollVy } | { ok: false; status: 400 | 404 | 409; fel: string };

export async function slutforNivakoll(args: { admin: Klient; userId: string; sessionId: string }): Promise<SlutforNivakoll> {
  const rad = await hamtaNivakoll(args.admin, args.userId, args.sessionId);
  const meta = rad ? lasNivakollMeta(rad.meta) : null;
  if (!rad || !meta) return { ok: false, status: 404, fel: 'session_saknas' };
  if (rad.completed_at) {
    const vy = nivakollVy(rad);
    return vy ? { ok: true, vy } : { ok: false, status: 409, fel: 'redan_avslutad' };
  }
  const svar = lasSvar(rad.answers);
  if (svar.length === 0) return { ok: false, status: 400, fel: 'inga_svar' };
  const vy0 = nivakollVy(rad);
  if (!vy0) return { ok: false, status: 404, fel: 'session_saknas' };
  const kind = meta.test_kind;

  const { data: statData } = await args.admin.from('fraga_statistik').select('fraga_id, antal, ratt').eq('test_kind', kind).in('fraga_id', meta.fragor);
  const stat = new Map<string, FragaStatistik>(((statData ?? []) as { fraga_id: string; antal: number; ratt: number }[]).map((s) => [s.fraga_id, { antal: s.antal, ratt: s.ratt }]));
  const resultat = raknaNivakoll({
    kind,
    uppgifter: vy0.uppgifter,
    svar,
    fore: meta.fore,
    budget_s: meta.budget_s,
    p: (n) => pFor(kind, n, stat.get(n)),
    pBank: { grund: pNiva(kind, 'grund'), avancerad: pNiva(kind, 'avancerad'), expert: kind === 'verbal' ? [] : pNiva(kind, 'expert') },
    pGrund: pGrund(kind),
  });

  const upprepade = new Set(meta.upprepade);
  const statistik = svar
    .filter((s) => !upprepade.has(s.q_id))
    .map((s) => ({ fraga_id: s.q_id, test_kind: kind, correct: s.correct, tid_s: s.time_spent, selected: s.selected, typ: 'matning' }));

  const { data, error } = await args.admin.rpc('slutfor_traningssession', {
    p_session: rad.id,
    p_user: args.userId,
    p_score: resultat.ratt,
    p_time_spent: resultat.tid_s,
    p_meta: { ratt: resultat.ratt, tid_s: resultat.tid_s, niva_efter: resultat.niva, resultat },
    p_nivapunkt: { test_kind: kind, dag: meta.dag, typ: meta.typ, niva: resultat.niva },
    p_statistik: statistik.length ? statistik : null,
    p_milstolpar: [],
  });
  if (error) throw error;
  const res = (data ?? {}) as { slutford?: boolean };
  if (!res.slutford) return { ok: false, status: 409, fel: 'redan_avslutad' };

  // Händelserna heter som matrisens Nivåkoll, med test_kind för typen.
  if (meta.typ === 'matning') {
    void captureServer('nivamatning_klar', args.userId, {
      niva: resultat.niva,
      over_tid: resultat.over_tid,
      familjer: resultat.tappade.map((t) => t.namn),
      tid_s: resultat.tid_s,
      smakprov: 0,
      test_kind: kind,
    });
  } else {
    void captureServer('ommatning_klar', args.userId, { niva: resultat.niva, delta: resultat.delta, test_kind: kind });
  }

  const efter = await hamtaNivakoll(args.admin, args.userId, rad.id);
  const vy = efter ? nivakollVy(efter) : null;
  return vy ? { ok: true, vy } : { ok: false, status: 404, fel: 'session_saknas' };
}
