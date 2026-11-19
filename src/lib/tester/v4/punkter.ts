// src/lib/tester/v4/punkter.ts
// Punkterna per testtyp för grafen (planen 2.2 punkt 1). Slår ihop
// test_nivapunkter (alla test_kind) med sessionsraderna i
// logic_test_v4_sessions. Nivåkoll = ring med nivå. Träning = punkt, nivån ur
// nivåpunkten typ pass samma dag och typ (annars null, ritas på tidslinjen).
// Övningsprov = fyrkant med resultat, aldrig omräknat till nivå. Ren.

import { dagSthlm, type Dag } from '@/lib/traning/datum';
import { arTestTypId, type PunktSlag, type TestTypId, type UtvecklingsPunkt } from './typer';
import { genomgangHref } from './rutter';

/** test_type → typ och slag. Nivåtesten (fasta nivåer) är inga punkter. */
const KLASS: Readonly<Record<string, { typ: TestTypId; slag: PunktSlag; provNamn?: string }>> = {
  'matrislogik-matning': { typ: 'matris', slag: 'nivakoll' },
  'matrislogik-pass': { typ: 'matris', slag: 'trana' },
  'matrislogik-riktat': { typ: 'matris', slag: 'trana' },
  'matrislogik-general': { typ: 'matris', slag: 'ovningsprov', provNamn: 'Övningsprov mot klockan' },
  'matrislogik-prov': { typ: 'matris', slag: 'ovningsprov', provNamn: 'Övningsprov mot klockan' },
  'figurserie-nivakoll': { typ: 'figurserie', slag: 'nivakoll' },
  'figurserie-pass': { typ: 'figurserie', slag: 'trana' },
  'figurserie-prov': { typ: 'figurserie', slag: 'ovningsprov', provNamn: 'Övningsprov, figurserier' },
  'deduktiv-nivakoll': { typ: 'deduktiv', slag: 'nivakoll' },
  'deduktiv-pass': { typ: 'deduktiv', slag: 'trana' },
  'deduktiv-prov': { typ: 'deduktiv', slag: 'ovningsprov', provNamn: 'Övningsprov, deduktiv slutledning' },
  'verbal-nivakoll': { typ: 'verbal', slag: 'nivakoll' },
  'verbal-pass': { typ: 'verbal', slag: 'trana' },
  'verbal-riktat': { typ: 'verbal', slag: 'trana' },
  'verbal-general': { typ: 'verbal', slag: 'ovningsprov', provNamn: 'Övningsprov, ord och text' },
  'verbal-resonemang-prov': { typ: 'verbal', slag: 'ovningsprov', provNamn: 'Övningsprov, ord och text' },
  'numerisk-nivakoll': { typ: 'numerisk', slag: 'nivakoll' },
  'numerisk-pass': { typ: 'numerisk', slag: 'trana' },
  'numerisk-riktat': { typ: 'numerisk', slag: 'trana' },
  'numerisk-general': { typ: 'numerisk', slag: 'ovningsprov', provNamn: 'Övningsprov, siffror och tabeller' },
  'numerical-reasoning-prov': { typ: 'numerisk', slag: 'ovningsprov', provNamn: 'Övningsprov, siffror och tabeller' },
  'talserie-nivakoll': { typ: 'talserie', slag: 'nivakoll' },
  'talserie-pass': { typ: 'talserie', slag: 'trana' },
  'spatial-nivakoll': { typ: 'spatial', slag: 'nivakoll' },
  'spatial-pass': { typ: 'spatial', slag: 'trana' },
  'ordforrad-nivakoll': { typ: 'ordforrad', slag: 'nivakoll' },
  'ordforrad-pass': { typ: 'ordforrad', slag: 'trana' },
};

/** Alla test_type som ger punkter, för hämtningens .in(). Iprovet tillkommer. */
export const PUNKT_TEST_TYPER: readonly string[] = [...Object.keys(KLASS), 'iprov-prov'];

export function klassa(testType: string): { typ: TestTypId; slag: PunktSlag; provNamn?: string } | null {
  return KLASS[testType] ?? null;
}

export interface NivapunktRad {
  test_kind: string;
  dag: Dag;
  typ: string;
  niva: number | string;
  session_id?: string | null;
}

export interface SessionRad {
  id: string;
  test_type: string;
  meta?: unknown;
  score?: number | null;
  created_at: string;
  completed_at: string | null;
  answers?: unknown;
}

const ZON_TEXT: Readonly<Record<string, string>> = { grund: 'grundnivå', avancerad: 'avancerad nivå', expert: 'expertnivå' };

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj | null => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : null);
const tal = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/** Rätt och antal ur metan, oavsett motor: meta.resultat först, sedan meta, sedan score. */
export function resultatUr(rad: SessionRad): { ratt: number; antal: number } | null {
  const m = obj(rad.meta);
  const r = obj(m?.resultat);
  const ratt = tal(r?.ratt) ?? tal(m?.ratt) ?? tal(rad.score);
  const antal = tal(r?.antal) ?? tal(m?.antal) ?? (Array.isArray(rad.answers) ? rad.answers.length : null);
  if (ratt == null || antal == null || antal <= 0) return null;
  return { ratt, antal };
}

/** Andel svar över provets tid ur metan (meta.over_budget eller resultat.over_tid) mot antalet. */
export function overTidUr(rad: SessionRad, antal: number | null): number | null {
  const m = obj(rad.meta);
  const r = obj(m?.resultat);
  const over = tal(m?.over_budget) ?? tal(r?.over_tid) ?? tal(r?.overTid);
  if (over == null || !antal) return null;
  return Math.max(0, Math.min(1, over / antal));
}

/** Nivån en nivåkoll gav, ur metan (meta.resultat.niva) när nivåpunkten saknas. */
function nivaUrMeta(rad: SessionRad): number | null {
  const m = obj(rad.meta);
  return tal(obj(m?.resultat)?.niva) ?? tal(m?.niva_efter) ?? null;
}

/**
 * Bygger punkterna. Bara slutförda sessioner. Nivåkoller: den första samma
 * dag och typ räknas, resten får raknas false ("övning, räknas inte").
 * Gratis (historikLast): bara senaste punkten per typ.
 */
export function byggPunkter(args: {
  nivapunkter: readonly NivapunktRad[];
  sessioner: readonly SessionRad[];
  historikLast?: boolean;
  /**
   * Nivån ur ett fast nivåtest för typerna utan Nivåkoll (steg2-niva.server.ts).
   * Null för sessioner som inte är ett sådant test.
   */
  nivatest?: (rad: SessionRad) => { typ: TestTypId; niva: number | null; zon: string } | null;
}): UtvecklingsPunkt[] {
  const nivaPa = new Map<string, number>();
  const nivaSession = new Map<string, number>();
  for (const n of args.nivapunkter) {
    const v = typeof n.niva === 'string' ? Number(n.niva) : n.niva;
    if (!Number.isFinite(v) || !arTestTypId(n.test_kind)) continue;
    const slag = n.typ === 'pass' ? 'trana' : n.typ === 'general' ? 'ovningsprov' : 'nivakoll';
    nivaPa.set(`${n.test_kind}|${n.dag}|${slag}`, v);
    if (n.session_id) nivaSession.set(n.session_id, v);
  }

  const ut: UtvecklingsPunkt[] = [];
  const sorterade = [...args.sessioner]
    .filter((s) => s.completed_at)
    .sort((a, b) => (a.completed_at! < b.completed_at! ? -1 : a.completed_at! > b.completed_at! ? 1 : 0));
  const nivakollDag = new Set<string>();
  const sistaTranaPerDag = new Map<string, number>();

  for (const s of sorterade) {
    const dag = dagSthlm(s.completed_at!);
    const nt = !klassa(s.test_type) && args.nivatest ? args.nivatest(s) : null;
    if (nt) {
      const nyckel = `${nt.typ}|${dag}`;
      const raknas = nt.niva != null && !nivakollDag.has(nyckel);
      if (raknas) nivakollDag.add(nyckel);
      const resultat = resultatUr(s);
      ut.push({ id: s.id, typ: nt.typ, dag, slag: 'nivakoll', niva: nt.niva, raknas, resultat, overTid: null, provNamn: `Nivåtest, ${ZON_TEXT[nt.zon] ?? nt.zon}`, kalla: 'nivatest', href: null });
      continue;
    }
    const k = s.test_type === 'iprov-prov' ? { typ: 'talserie' as TestTypId, slag: 'ovningsprov' as PunktSlag, provNamn: 'Övningsprov I-provet' } : klassa(s.test_type);
    if (!k) continue;
    const resultat = resultatUr(s);
    const p: UtvecklingsPunkt = {
      id: s.id,
      typ: k.typ,
      dag,
      slag: k.slag,
      niva: null,
      raknas: true,
      resultat,
      overTid: overTidUr(s, resultat?.antal ?? null),
      href: genomgangHref(s.id),
      ...(k.provNamn ? { provNamn: k.provNamn } : {}),
    };
    if (k.slag === 'nivakoll') {
      const nyckel = `${k.typ}|${dag}`;
      p.raknas = !nivakollDag.has(nyckel);
      nivakollDag.add(nyckel);
      p.niva = nivaSession.get(s.id) ?? (p.raknas ? nivaPa.get(`${k.typ}|${dag}|nivakoll`) ?? nivaUrMeta(s) : null);
    } else if (k.slag === 'trana') {
      p.niva = nivaSession.get(s.id) ?? null;
      if (p.niva == null) sistaTranaPerDag.set(`${k.typ}|${dag}`, ut.length);
      else sistaTranaPerDag.delete(`${k.typ}|${dag}`);
    }
    ut.push(p);
  }

  // Nivåpunkten typ pass utan session_id hör till dagens sista träning i typen.
  for (const [nyckel, i] of sistaTranaPerDag) {
    const [typ, dag] = nyckel.split('|');
    const v = nivaPa.get(`${typ}|${dag}|trana`);
    if (v != null && ut[i].niva == null) ut[i].niva = v;
  }

  if (!args.historikLast) return ut;
  const senaste = new Map<TestTypId, UtvecklingsPunkt>();
  for (const p of ut) senaste.set(p.typ, p);
  return ut.filter((p) => senaste.get(p.typ) === p);
}

/** Punkterna för en typ. */
export function punkterFor(punkter: readonly UtvecklingsPunkt[], typ: TestTypId): UtvecklingsPunkt[] {
  return punkter.filter((p) => p.typ === typ);
}
