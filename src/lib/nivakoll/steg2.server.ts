// src/lib/nivakoll/steg2.server.ts
// =============================================================================
// Nivåkollen för talserier, spatial förmåga och ordförråd
// (plan-testflode-2026-11-20 avsnitt 10, etapp 6). Samma flöde och samma
// räkning som de andra Nivåkollerna (motor.server.ts): den här filen ger bara
// urvalet, uppgiften och rättningen ur steg2-motorerna
// (src/lib/tester/steg2/motor.server.ts), som redan äger bankerna, facit och
// genomgången.
//
// - Urval, fast och med det lättaste först: talserier 3 + 3 + 3 (olika
//   regelfamiljer inom nivån), spatial 3 + 3 + 3 (en uppgift per form, vriden
//   figur först), ordförråd 4 + 4 + 4 (två synonymer och två motsatsord per
//   nivå, synonymer i stället där motsatsorden tar slut). Det hon haft de
//   senaste 30 dagarna (nivåtest, Träna, Nivåkollen) väljs sist.
// - Kalibreringen: p ur fraga_statistik från 30 svar, annars bankens p_prior
//   (talserier och spatial har den), annars priorn för banknivån
//   (steg2-niva.server.ts: grund 0,7, avancerad 0,55, expert 0,4). Ordförrådet
//   saknar p_prior och går på nivåpriorn tills banken har statistik.
// - Provets tid per uppgift ur motorn: talserier 60 s, spatial per form (30
//   eller 45 s), ordförråd 20 s.
// Bara servern: bankerna har facit.
// =============================================================================

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { dagSthlm, type Dag } from '@/lib/traning/datum';
import { pForFraga, svarighetPrior, type FragaStatistik } from '@/lib/traning/svarighet';
import { steg2Motor, type Steg2Motor } from '@/lib/tester/steg2/motor.server';
import { STEG2_PASS_TEST_TYPE } from '@/lib/tester/steg2/pass';
import { valjFigurer } from '@/lib/tester/pass-figur';
import { settInomFonstret, type Sedda } from '@/lib/tester/pass-urval';
import { pSteg2 } from '@/lib/tester/v4/steg2-niva.server';
import { NIVAKOLL_TEST_TYPE, type Steg2NivakollKind } from './niva';
import type { BankNiva, NivakollGenomgang, NivakollUppgift } from './typer';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Klient = SupabaseClient<any, any, any>;

const NIVAER: readonly BankNiva[] = ['grund', 'avancerad', 'expert'];

/** Antal uppgifter per banknivå. */
export const STEG2_NIVAKOLL_URVAL: Readonly<Record<Steg2NivakollKind, Readonly<Record<BankNiva, number>>>> = {
  talserie: { grund: 3, avancerad: 3, expert: 3 },
  spatial: { grund: 3, avancerad: 3, expert: 3 },
  ordforrad: { grund: 4, avancerad: 4, expert: 4 },
};

/** Spatial: formerna per nivå i ordning (vriden figur, pappersvikning eller uppvikning, tärningar). */
export const SPATIAL_NIVAKOLL_FORMER: Readonly<Record<BankNiva, readonly string[]>> = {
  grund: ['A', 'D', 'C'],
  avancerad: ['A', 'B', 'C'],
  expert: ['A', 'D', 'C'],
};

/** Ordförrådet: synonym och motsatsord växelvis. */
const ORD_ORDNING = ['synonym', 'antonym', 'synonym', 'antonym'] as const;

/** Nivåtestens sluggar per typ (de sessioner som visat uppgifter i typen). */
const NIVATEST_SLUGAR: Readonly<Record<Steg2NivakollKind, readonly string[]>> = {
  talserie: ['talserier-grund', 'talserier-avancerad', 'talserier-expert'],
  spatial: ['spatial-grund', 'spatial-avancerad', 'spatial-expert'],
  ordforrad: ['ordforrad-grund', 'ordforrad-avancerad', 'ordforrad-expert'],
};

export function motorFor(kind: Steg2NivakollKind): Steg2Motor {
  const m = steg2Motor(kind);
  if (!m) throw new Error(`steg2-motorn saknas för ${kind}`);
  return m;
}

/**
 * Plockar n ur en ordning (osedda först, seedat) där gruppen inte redan finns
 * i `upptagna`; fyller med resten om grupperna tar slut.
 */
function plockaOlika(ordning: readonly string[], n: number, grupp: (id: string) => string | null, upptagna: Set<string>): string[] {
  const ut: string[] = [];
  for (const id of ordning) {
    if (ut.length >= n) break;
    const g = grupp(id) ?? id;
    if (upptagna.has(g)) continue;
    upptagna.add(g);
    ut.push(id);
  }
  for (const id of ordning) {
    if (ut.length >= n) break;
    if (!ut.includes(id)) ut.push(id);
  }
  return ut;
}

/** Urvalet: nycklarna i ordning, nivån per nyckel och vilka hon haft inom 30 dagar. */
export function valjSteg2Nivakoll(
  kind: Steg2NivakollKind,
  sedda: Sedda,
  idag: Dag,
  seed: string,
  motor: Steg2Motor = motorFor(kind)
): { fragor: string[]; nivaer: Record<string, BankNiva>; upprepade: string[] } {
  const fragor: string[] = [];
  const nivaer: Record<string, BankNiva> = {};
  const upprepade: string[] = [];
  for (const n of NIVAER) {
    const antal = STEG2_NIVAKOLL_URVAL[kind][n];
    const pool = motor.pool(n);
    const s = `${seed}:${n}`;
    let val: string[];
    if (kind === 'spatial') {
      val = [];
      for (const form of SPATIAL_NIVAKOLL_FORMER[n]) {
        const v = valjFigurer(pool.filter((q) => motor.gruppNyckel(q.id) === form), 1, sedda, idag, `${s}:${form}`, new Set(val));
        val.push(...v.ids);
      }
      if (val.length < antal) val.push(...valjFigurer(pool, antal - val.length, sedda, idag, `${s}:rest`, new Set(val)).ids);
    } else if (kind === 'ordforrad') {
      val = [];
      for (const [i, typ] of ORD_ORDNING.slice(0, antal).entries()) {
        const v = valjFigurer(pool.filter((q) => motor.gruppNyckel(q.id) === typ), 1, sedda, idag, `${s}:${typ}:${i}`, new Set(val));
        // Expert har få motsatsord: fyll med en synonym.
        val.push(...(v.ids.length ? v.ids : valjFigurer(pool, 1, sedda, idag, `${s}:fyll:${i}`, new Set(val)).ids));
      }
    } else {
      const ordning = valjFigurer(pool, pool.length, sedda, idag, s).ids;
      val = plockaOlika(ordning, antal, (id) => motor.gruppNyckel(id), new Set());
    }
    for (const id of val.slice(0, antal)) {
      nivaer[id] = n;
      fragor.push(id);
      if (settInomFonstret(id, sedda, idag)) upprepade.push(id);
    }
  }
  return { fragor, nivaer, upprepade };
}

/** Uppgifterna hon sett i typen: nivåtesten, Träna och Nivåkollen. */
export async function lasSeddaSteg2(admin: Klient, userId: string, kind: Steg2NivakollKind): Promise<Sedda> {
  const m = motorFor(kind);
  const { data, error } = await admin
    .from('logic_test_v4_sessions')
    .select('id, test_type, meta, created_at, completed_at')
    .eq('user_id', userId)
    .in('test_type', [...NIVATEST_SLUGAR[kind], STEG2_PASS_TEST_TYPE[kind], NIVAKOLL_TEST_TYPE[kind]])
    .order('created_at', { ascending: false })
    .limit(300);
  if (error) throw error;
  const sedda = new Map<string, Dag>();
  for (const r of (data ?? []) as { id: string; test_type: string | null; meta: unknown; created_at: string; completed_at: string | null }[]) {
    const dag = dagSthlm(r.created_at);
    const fr = (r.meta as { fragor?: unknown } | null)?.fragor;
    const ids = Array.isArray(fr)
      ? fr.filter((x): x is string => typeof x === 'string')
      : m.arTestTyp(r.test_type)
        ? (m.innehall(r).fragor as { id: string }[]).map((f) => f.id)
        : [];
    for (const id of ids) {
      const forra = sedda.get(id);
      if (!forra || forra < dag) sedda.set(id, dag);
    }
  }
  return sedda;
}

/** Uppgiften i klientens form, utan facit. Spatial och ordförrådet blandar alternativen per session. */
export function steg2Uppgift(kind: Steg2NivakollKind, nyckel: string, niva: BankNiva, sessionId: string): NivakollUppgift | null {
  const v = motorFor(kind).visa(nyckel, sessionId);
  if (!v) return null;
  return { kind, nyckel, niva, v: v as Record<string, unknown> };
}

/** Rättningen av ett svar (visat index som text, null = obesvarad) och genomgången. */
export function bedomSteg2(
  kind: Steg2NivakollKind,
  nyckel: string,
  svar: string | null,
  sessionId: string
): { selected: number; correct: boolean; genomgang: NivakollGenomgang } | null {
  const m = motorFor(kind);
  let b: { selected: number; visat: number | null; correct: boolean } | null;
  if (svar === null) b = { selected: -1, visat: null, correct: false };
  else {
    const visat = Number(svar);
    if (!Number.isInteger(visat)) return null;
    b = m.bedom(nyckel, sessionId, true, visat);
  }
  if (!b) return null;
  const g = m.genomga(nyckel, sessionId) as { rattVisat: number; misstag?: string[]; regel?: string; forklaring?: string };
  if (!g) return null;
  const forklaring = kind === 'talserie' ? g.regel ?? null : kind === 'spatial' ? g.forklaring ?? null : null;
  const misstag = !b.correct && b.visat != null ? g.misstag?.[b.visat] || null : null;
  return {
    selected: b.selected,
    correct: b.correct,
    genomgang: { correct: b.correct, ratt: String(g.rattVisat), valt: svar, forklaring, misstag, data: g },
  };
}

/** Gruppen för "Var du tappade": regelfamiljen, formen eller synonym och motsatsord. */
export function steg2Grupp(kind: Steg2NivakollKind, nyckel: string): string | null {
  return motorFor(kind).grupp(nyckel);
}

/** Provets tid per uppgift i sekunder. */
export function steg2Budget(kind: Steg2NivakollKind, nyckel: string): number {
  return motorFor(kind).budget(nyckel);
}

/** p för en uppgift: uppmätt från 30 svar, annars p_prior, annars banknivåns prior. */
export function pSteg2Nivakoll(kind: Steg2NivakollKind, nyckel: string, stat?: FragaStatistik | null): number {
  return pForFraga(svarighetPrior(3), stat ?? null, pSteg2(kind, nyckel));
}

/** En banknivås andelar (de aktiva uppgifterna). */
export function pNivaSteg2(kind: Steg2NivakollKind, niva: BankNiva): number[] {
  const m = steg2Motor(kind);
  return m ? m.pool(niva).map((q) => pSteg2(kind, q.id, niva)) : [];
}
