// src/lib/ovningsprov/motor.server.ts
// =============================================================================
// Övningsprov mot klockan i verbalt och numeriskt (riktlinjer-tester-v2 1.1
// till 1.9). Logikens övningsprov är testmotorns typ 'general'
// (src/lib/traning/motor.server.ts); här ligger verbalt och numeriskt, som
// väljer hela texter och underlag, aldrig lösa påståenden.
//
// - Urval (1.9): verbalt 8 texter, 4 ur grund och 4 ur avancerad (expert har
//   inte passformat), numeriskt 5 underlag, 2 grund, 2 avancerad och 1
//   expert. Fast ordning, de svåraste sist. Texter och underlag hon haft i
//   tidigare övningsprov väljs sist.
// - Servern dömer och håller tiden. Facit lämnar servern först efter
//   avslutet. Svar efter provets tid (plus tio sekunder för nätet) sparas
//   inte; obesvarade räknas som fel.
// - Svaren kan ändras så länge provet pågår (fast format: bakåt tillåtet).
//   Ett svar per punkt, atomärt i databasen (spara_testsvar_server).
// - Högst ett slutfört övningsprov per testtyp och dag (1.3). Ett pågående
//   prov återupptas i stället för att ett nytt skapas.
// - Alla skrivningar med service role, villkorade på user_id.
// =============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import { POOL_V1 as VERBAL_V1, POOL_V2 as VERBAL_V2 } from '@/lib/verbalTestProv/selectProv';
import { POOL_EXPERT as NUM_EXPERT, POOL_V1 as NUM_V1, POOL_V2 as NUM_V2 } from '@/lib/numericalTestProv/selectProv';
import type { Passage as VerbalPassage } from '@/lib/verbalTestV1/types.v1';
import type { Passage as NumeriskPassage } from '@/lib/numericalTest/types';
import { alternativSeed, blandaAlternativ } from '@/lib/logicTestV7/blanda';
import { sparaTestsvar, unikaSvar } from '@/lib/tests/sparaSvar';
import { captureServer } from '@/lib/analytics/server';
import { lasBehorighet } from '@/lib/traning/motor.server';
import { dagSthlm, type Dag } from '@/lib/traning/datum';
import { ovningsformat, ovningsformatUrNyckel } from './format';
import {
  OVNINGSPROV_TEST_TYPE,
  type Genomgangspunkt,
  type NumeriskDel,
  type OvningsTyp,
  type Ovningsresultat,
  type Ovningsvy,
  type Punkt,
  type VerbalDel,
  type VerbaltSvar,
} from './typer';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Klient = SupabaseClient<any, any, any>;

/** Marginal för nätet efter provets tid, som provläget. */
export const TIDSMARGINAL_MS = 10_000;
/** Svarens nyckel i answers: punktens nyckel. */
const NYCKLAR = ['nyckel'] as const;
const VERBALA_SVAR: readonly VerbaltSvar[] = ['true', 'false', 'cannot_say'];

export interface OvningsMeta {
  ovningsprov: 1;
  typ: OvningsTyp;
  format: string;
  antal: number;
  minuter: number;
  tidsgrans_s: number;
  budget_s: number;
  /** Tid per text eller underlag. */
  del_budget_s: number;
  /** Texternas eller underlagens id i provets ordning. */
  delar: string[];
  seed: string;
  dag: Dag;
  fran: 'hubb' | 'hem' | 'plan' | null;
  /** Satt vid avslutet. */
  ratt?: number;
  obesvarade?: number;
  tid_s?: number;
  av_tiden?: boolean;
}

interface SparatSvar {
  nyckel: string;
  svar: string;
  tid: number;
}

interface Rad {
  id: string;
  test_type: string;
  meta: unknown;
  answers: unknown;
  created_at: string;
  started_at?: string | null;
  completed_at: string | null;
}

/* ---------------------------------- Urval --------------------------------- */

function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function blanda<T>(lista: readonly T[], seed: string): T[] {
  const rng = mulberry32(hash(seed));
  const ut = [...lista];
  for (let i = ut.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [ut[i], ut[j]] = [ut[j], ut[i]];
  }
  return ut;
}

/** n ur poolen, seedat, de hon inte haft i ett övningsprov först. */
function valj<T extends { id: string }>(pool: readonly T[], n: number, seed: string, sedda: ReadonlySet<string>): T[] {
  const blandad = blanda(pool, seed);
  return [...blandad.filter((p) => !sedda.has(p.id)), ...blandad.filter((p) => sedda.has(p.id))].slice(0, n);
}

/** Antal texter och underlag per nivå (riktlinjerna 1.9). */
export const URVAL = {
  verbal: { grund: 4, avancerad: 4 },
  numerisk: { grund: 2, avancerad: 2, expert: 1 },
} as const;

/** Delarnas id i provets ordning, grund först och de svåraste sist. */
export function valjDelar(typ: OvningsTyp, seed: string, sedda: ReadonlySet<string> = new Set()): string[] {
  if (typ === 'verbal') {
    return [
      ...valj(VERBAL_V1, URVAL.verbal.grund, `${seed}:grund`, sedda),
      ...valj(VERBAL_V2, URVAL.verbal.avancerad, `${seed}:avancerad`, sedda),
    ].map((p) => p.id);
  }
  return [
    ...valj(NUM_V1, URVAL.numerisk.grund, `${seed}:grund`, sedda),
    ...valj(NUM_V2, URVAL.numerisk.avancerad, `${seed}:avancerad`, sedda),
    ...valj(NUM_EXPERT, URVAL.numerisk.expert, `${seed}:expert`, sedda),
  ].map((p) => p.id);
}

const VERBAL_PER_ID = new Map<string, VerbalPassage>([...VERBAL_V1, ...VERBAL_V2].map((p) => [p.id, p]));
const NUM_PER_ID = new Map<string, NumeriskPassage>([...NUM_V1, ...NUM_V2, ...NUM_EXPERT].map((p) => [p.id, p]));

/** "PASSAGE 1 — Sommaranställningar" blir "Sommaranställningar". */
export function rubrikUtanNummer(titel: string): string {
  return titel.replace(/^\s*passage\s+\d+\s*[—–:-]\s*/i, '').trim();
}

export function punkterFor(typ: OvningsTyp, delar: readonly string[]): Punkt[] {
  const ut: Punkt[] = [];
  delar.forEach((id, d) => {
    if (typ === 'verbal') {
      const p = VERBAL_PER_ID.get(id);
      p?.statements.forEach((_, i) => ut.push({ nyckel: `${id}:${i}`, del: id, punkt: String(i), delNr: d + 1, iDel: i + 1 }));
    } else {
      const p = NUM_PER_ID.get(id);
      p?.questions.forEach((q, i) => ut.push({ nyckel: `${id}:${q.id}`, del: id, punkt: q.id, delNr: d + 1, iDel: i + 1 }));
    }
  });
  return ut;
}

/** Klientens form av delarna, utan facit. Numeriska alternativ blandas per session och fråga. */
function klientDelar(typ: OvningsTyp, delar: readonly string[], seed: string): VerbalDel[] | NumeriskDel[] {
  if (typ === 'verbal') {
    return delar
      .map((id) => VERBAL_PER_ID.get(id))
      .filter((p): p is VerbalPassage => !!p)
      .map((p) => ({ id: p.id, titel: rubrikUtanNummer(p.title), text: p.text, pastaenden: p.statements.map((s) => s.text) }));
  }
  return delar
    .map((id) => NUM_PER_ID.get(id))
    .filter((p): p is NumeriskPassage => !!p)
    .map((p) => ({
      id: p.id,
      titel: p.title,
      kontext: p.contextText,
      tabell: p.dataTable ?? null,
      diagram: p.chartData ?? null,
      fragor: p.questions.map((q) => ({
        id: q.id,
        text: q.questionText,
        alternativ: blandaAlternativ(alternativSeed(seed, q.id), q).options.map((o) => ({ id: o.id, text: o.text })),
      })),
    }));
}

/** Rätt svar och förklaring för en punkt. */
function facit(typ: OvningsTyp, p: Punkt): { ratt: string; forklaring: string | null } | null {
  if (typ === 'verbal') {
    const s = VERBAL_PER_ID.get(p.del)?.statements[Number(p.punkt)];
    return s ? { ratt: s.correctAnswer, forklaring: s.explanation ?? null } : null;
  }
  const q = NUM_PER_ID.get(p.del)?.questions.find((x) => x.id === p.punkt);
  return q ? { ratt: q.correctAnswerId, forklaring: q.explanation ?? null } : null;
}

/** Är svaret ett giltigt svar på punkten? */
export function giltigtSvar(typ: OvningsTyp, p: Punkt, svar: unknown): svar is string {
  if (typeof svar !== 'string') return false;
  if (typ === 'verbal') return (VERBALA_SVAR as readonly string[]).includes(svar);
  const q = NUM_PER_ID.get(p.del)?.questions.find((x) => x.id === p.punkt);
  return !!q && q.options.some((o) => o.id === svar);
}

/* ---------------------------------- Läsning -------------------------------- */

export function lasMeta(v: unknown): OvningsMeta | null {
  const m = v as Partial<OvningsMeta> | null;
  if (!m || m.ovningsprov !== 1 || (m.typ !== 'verbal' && m.typ !== 'numerisk') || !Array.isArray(m.delar)) return null;
  return m as OvningsMeta;
}

function lasSvar(answers: unknown): SparatSvar[] {
  return unikaSvar(Array.isArray(answers) ? answers : [], NYCKLAR).filter(
    (s): s is SparatSvar => !!s && typeof (s as SparatSvar).nyckel === 'string' && typeof (s as SparatSvar).svar === 'string'
  );
}

const SVARSTYP_NAMN: Record<string, string> = {
  true: 'Påståenden som är sanna',
  false: 'Påståenden som är falska',
  cannot_say: 'Går inte att avgöra',
};

const UNDERLAGSTYP_NAMN: Record<string, string> = {
  table: 'Tabeller',
  graph: 'Diagram',
  word_problem: 'Textuppgifter',
  series: 'Talserier',
  conversion: 'Omräkningar',
};

/** Resultatet ur svaren och tiden. Ren, för tester. */
export function raknaResultat(args: {
  typ: OvningsTyp;
  meta: Pick<OvningsMeta, 'delar' | 'tidsgrans_s' | 'del_budget_s'>;
  svar: readonly SparatSvar[];
  startad: string;
  avslutad: string;
}): { resultat: Ovningsresultat; genomgang: Genomgangspunkt[] } {
  const { typ, meta } = args;
  const punkter = punkterFor(typ, meta.delar);
  const perNyckel = new Map(args.svar.map((s) => [s.nyckel, s]));
  const genomgang: Genomgangspunkt[] = [];
  const grupper = new Map<string, { ratt: number; antal: number }>();
  const delar = new Map<string, { ratt: number; antal: number; obesvarade: number; tid_s: number }>();

  for (const p of punkter) {
    const f = facit(typ, p);
    if (!f) continue;
    const s = perNyckel.get(p.nyckel) ?? null;
    const korrekt = !!s && s.svar === f.ratt;
    genomgang.push({ nyckel: p.nyckel, svar: s?.svar ?? null, ratt: f.ratt, korrekt, forklaring: f.forklaring, tid_s: s?.tid ?? 0 });
    const grupp =
      typ === 'verbal' ? SVARSTYP_NAMN[f.ratt] : UNDERLAGSTYP_NAMN[NUM_PER_ID.get(p.del)?.type ?? ''] ?? 'Underlag';
    const g = grupper.get(grupp) ?? { ratt: 0, antal: 0 };
    g.antal += 1;
    if (korrekt) g.ratt += 1;
    grupper.set(grupp, g);
    const d = delar.get(p.del) ?? { ratt: 0, antal: 0, obesvarade: 0, tid_s: 0 };
    d.antal += 1;
    if (korrekt) d.ratt += 1;
    if (!s) d.obesvarade += 1;
    d.tid_s += s?.tid ?? 0;
    delar.set(p.del, d);
  }

  const start = new Date(args.startad).getTime();
  const slut = new Date(args.avslutad).getTime();
  const tid_s = Math.max(0, Math.min(meta.tidsgrans_s, Math.round((slut - start) / 1000)));
  const ratt = genomgang.filter((g) => g.korrekt).length;
  const titel = (id: string) =>
    typ === 'verbal' ? rubrikUtanNummer(VERBAL_PER_ID.get(id)?.title ?? id) : NUM_PER_ID.get(id)?.title ?? id;

  return {
    genomgang,
    resultat: {
      ratt,
      antal: genomgang.length,
      obesvarade: genomgang.filter((g) => g.svar === null).length,
      tid_s,
      avTiden: slut - start >= meta.tidsgrans_s * 1000 - 2000,
      delar: meta.delar.map((id) => {
        const d = delar.get(id) ?? { ratt: 0, antal: 0, obesvarade: 0, tid_s: 0 };
        return { id, titel: titel(id), ...d, budget_s: meta.del_budget_s };
      }),
      tappade: [...grupper.entries()]
        .filter(([, g]) => g.ratt < g.antal)
        .map(([namn, g]) => ({ namn, ...g }))
        .sort((a, b) => a.ratt / a.antal - b.ratt / b.antal)
        .slice(0, 2),
    },
  };
}

export function ovningsvy(rad: Rad): Ovningsvy | null {
  const meta = lasMeta(rad.meta);
  if (!meta) return null;
  const svar = lasSvar(rad.answers);
  const startad = rad.started_at ?? rad.created_at;
  const avslutad = !!rad.completed_at;
  const rakning = avslutad
    ? raknaResultat({ typ: meta.typ, meta, svar, startad, avslutad: rad.completed_at as string })
    : null;
  const f = ovningsformatUrNyckel(meta.typ, meta.format);
  return {
    id: rad.id,
    typ: meta.typ,
    format: f,
    startad,
    tidsgrans_s: meta.tidsgrans_s,
    avslutad,
    delar: klientDelar(meta.typ, meta.delar, meta.seed),
    punkter: punkterFor(meta.typ, meta.delar),
    svar: Object.fromEntries(svar.map((s) => [s.nyckel, s.svar])),
    tider: Object.fromEntries(svar.map((s) => [s.nyckel, s.tid])),
    genomgang: rakning?.genomgang ?? null,
    resultat: rakning
      ? // Tiden som sparades vid avslutet gäller, så att genomgången visar samma tal som resultatet.
        { ...rakning.resultat, tid_s: typeof meta.tid_s === 'number' ? meta.tid_s : rakning.resultat.tid_s, avTiden: meta.av_tiden ?? rakning.resultat.avTiden }
      : null,
  };
}

/* ---------------------------------- Skapa --------------------------------- */

export type SkapaOvning =
  | { ok: true; vy: Ovningsvy }
  | { ok: false; status: 402 | 429 | 500; fel: string };

const KOLUMNER = 'id, test_type, meta, answers, created_at, started_at, completed_at';

export async function hamtaOvningsprov(admin: Klient, userId: string, sessionId: string): Promise<Rad | null> {
  const { data, error } = await admin
    .from('logic_test_v4_sessions')
    .select(KOLUMNER)
    .eq('id', sessionId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  const rad = (data as Rad | null) ?? null;
  return rad && lasMeta(rad.meta) ? rad : null;
}

function pagar(rad: Rad, nu = Date.now()): boolean {
  const meta = lasMeta(rad.meta);
  if (!meta || rad.completed_at) return false;
  const start = new Date(rad.started_at ?? rad.created_at).getTime();
  return nu <= start + meta.tidsgrans_s * 1000 + TIDSMARGINAL_MS;
}

export async function skapaOvningsprov(args: {
  supabase: Klient;
  admin: Klient;
  userId: string;
  typ: OvningsTyp;
  fran?: OvningsMeta['fran'];
  idag?: Dag;
}): Promise<SkapaOvning> {
  const idag = args.idag ?? dagSthlm();
  const [beh, planRes, sessRes] = await Promise.all([
    lasBehorighet(args.supabase, args.userId),
    args.admin.from('test_planer').select('*').eq('user_id', args.userId).maybeSingle(),
    args.admin
      .from('logic_test_v4_sessions')
      .select(KOLUMNER)
      .eq('user_id', args.userId)
      .eq('test_type', OVNINGSPROV_TEST_TYPE[args.typ])
      .order('created_at', { ascending: false })
      .limit(20),
  ]);
  // Övningsprovet ingår i Premium på alla tre testtyper (riktlinjerna 1.7).
  if (!beh.harProvlage) return { ok: false, status: 402, fel: 'betalvagg' };
  if (sessRes.error) throw sessRes.error;
  const rader = (sessRes.data ?? []) as Rad[];

  // Ett pågående prov återupptas: en omladdning eller ett andra tryck ger aldrig mer tid.
  const pagaende = rader.find((r) => pagar(r));
  if (pagaende) {
    const vy = ovningsvy(pagaende);
    if (vy) return { ok: true, vy };
  }
  // Högst ett per testtyp och dag (riktlinjerna 1.3).
  if (rader.some((r) => r.completed_at && dagSthlm(r.completed_at) === idag)) {
    return { ok: false, status: 429, fel: 'ett_per_dag' };
  }

  const plan = (planRes.error ? null : planRes.data) as { leverantor?: string | null; variant?: string | null } | null;
  const f = ovningsformat(args.typ, plan?.leverantor ?? null, plan?.variant ?? null);
  const sedda = new Set(rader.flatMap((r) => lasMeta(r.meta)?.delar ?? []));
  const seed = `${args.userId}:${idag}:${rader.length}:${args.typ}`;
  const delar = valjDelar(args.typ, seed, sedda);
  const meta: OvningsMeta = {
    ovningsprov: 1,
    typ: args.typ,
    format: f.nyckel,
    antal: punkterFor(args.typ, delar).length,
    minuter: f.minuter,
    tidsgrans_s: f.minuter * 60,
    budget_s: f.budget_s,
    del_budget_s: f.delar?.budget_s ?? f.budget_s * 4,
    delar,
    seed,
    dag: idag,
    fran: args.fran ?? null,
  };

  const { data, error } = await args.admin
    .from('logic_test_v4_sessions')
    .insert({ user_id: args.userId, test_type: OVNINGSPROV_TEST_TYPE[args.typ], answers: [], meta })
    .select(KOLUMNER)
    .single();
  if (error || !data) throw error ?? new Error('övningsprovet skapades inte');
  const vy = ovningsvy(data as Rad);
  if (!vy) throw new Error('övningsprovets meta gick inte att läsa');
  return { ok: true, vy };
}

/* ---------------------------------- Svaret --------------------------------- */

export type SvarOvning = { ok: true; besvarade: number } | { ok: false; status: 400 | 404 | 409 | 410; fel: string };

export async function svaraOvningsprov(args: {
  admin: Klient;
  userId: string;
  sessionId: string;
  nyckel: unknown;
  svar: unknown;
  tid: unknown;
}): Promise<SvarOvning> {
  const rad = await hamtaOvningsprov(args.admin, args.userId, args.sessionId);
  const meta = rad ? lasMeta(rad.meta) : null;
  if (!rad || !meta) return { ok: false, status: 404, fel: 'session_saknas' };
  if (rad.completed_at) return { ok: false, status: 409, fel: 'avslutad' };
  if (!pagar(rad)) return { ok: false, status: 410, fel: 'tiden_ute' };
  const p = punkterFor(meta.typ, meta.delar).find((x) => x.nyckel === args.nyckel);
  if (!p) return { ok: false, status: 400, fel: 'fel_punkt' };
  if (!giltigtSvar(meta.typ, p, args.svar)) return { ok: false, status: 400, fel: 'ogiltigt_svar' };
  const tid = typeof args.tid === 'number' && Number.isFinite(args.tid) && args.tid > 0 ? Math.min(Math.round(args.tid), meta.tidsgrans_s) : 0;
  const n = await sparaTestsvar(args.admin, {
    userId: args.userId,
    tabell: 'logic_test_v4_sessions',
    sessionId: rad.id,
    nycklar: NYCKLAR,
    svar: { nyckel: p.nyckel, svar: args.svar, tid },
  });
  if (n === null) return { ok: false, status: 409, fel: 'avslutad' };
  return { ok: true, besvarade: n };
}

/* --------------------------------- Avslutet -------------------------------- */

export type SlutforOvning = { ok: true; vy: Ovningsvy } | { ok: false; status: 404 | 409; fel: string };

export async function slutforOvningsprov(args: {
  admin: Klient;
  userId: string;
  sessionId: string;
  nu?: Date;
}): Promise<SlutforOvning> {
  const rad = await hamtaOvningsprov(args.admin, args.userId, args.sessionId);
  const meta = rad ? lasMeta(rad.meta) : null;
  if (!rad || !meta) return { ok: false, status: 404, fel: 'session_saknas' };
  if (rad.completed_at) {
    const vy = ovningsvy(rad);
    return vy ? { ok: true, vy } : { ok: false, status: 409, fel: 'redan_avslutad' };
  }
  const nu = args.nu ?? new Date();
  const startad = rad.started_at ?? rad.created_at;
  // Lämnas provet in efter tiden (klienten var stängd) räknas tiden som full.
  const slut = new Date(Math.min(nu.getTime(), new Date(startad).getTime() + meta.tidsgrans_s * 1000));
  const svar = lasSvar(rad.answers);
  const { resultat } = raknaResultat({ typ: meta.typ, meta, svar, startad, avslutad: slut.toISOString() });

  const { data, error } = await args.admin
    .from('logic_test_v4_sessions')
    .update({
      completed_at: nu.toISOString(),
      score: resultat.ratt,
      time_spent: resultat.tid_s,
      meta: { ...meta, ratt: resultat.ratt, obesvarade: resultat.obesvarade, tid_s: resultat.tid_s, av_tiden: resultat.avTiden },
    })
    .eq('id', rad.id)
    .eq('user_id', args.userId)
    .is('completed_at', null)
    .select(KOLUMNER);
  if (error) throw error;
  const uppdaterad = ((data ?? []) as Rad[])[0];
  if (!uppdaterad) return { ok: false, status: 409, fel: 'redan_avslutad' };

  // Händelsen behåller namnet i koden; etiketten i admin är "Övningsprov klart" (1.8).
  void captureServer('generalrepetition_klar', args.userId, {
    test_kind: meta.typ,
    format: meta.format,
    ratt: resultat.ratt,
    antal: resultat.antal,
    obesvarade: resultat.obesvarade,
    fran: meta.fran,
  });
  const vy = ovningsvy(uppdaterad);
  return vy ? { ok: true, vy } : { ok: false, status: 404, fel: 'session_saknas' };
}
