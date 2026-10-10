// src/lib/traning/historik.ts
// =============================================================================
// Läser träningssessionerna ur logic_test_v4_sessions-rader: vad som är en
// träningssession, vilka frågor hon sett och när, vilka dagar hon tränat.
// Ren, så att motorn och testerna delar samma tolkning.
// =============================================================================

import { dagSthlm, type Dag } from './datum';
import type { SlutfordSession, Sessionstyp } from './milstolpar';
import type { Pooler, Sammansattning, Sedd } from './passgenerator';
import type { FormatNyckel } from './tempo';
import type { Nasta } from './imorgon';

/** Sessionens meta för en träningssession. Sätts när sessionen skapas. */
export interface TraningsMeta {
  alternativ_blandade: true;
  /** Markerar att sessionen hör till testmotorn. */
  traning: 1;
  typ: Sessionstyp;
  test_kind: 'matris';
  /** Grundpass (gratis) eller passet på din nivå. */
  variant: 'grund' | 'niva';
  /** Dagen sessionen skapades, svensk tid. */
  dag: Dag;
  antal: number;
  adaptiv: boolean;
  /** Fasta sessioner: frågorna i ordning. */
  fragor?: string[];
  /** Adaptiva sessioner: poolerna per band. */
  pooler?: Pooler;
  tema: string | null;
  family: string | null;
  sammansattning: Sammansattning | null;
  format: FormatNyckel;
  /** Provets tid per uppgift. */
  budget_s: number;
  /** Total tid för generalrepetitionen, sekunder. Null för övriga. */
  tidsgrans_s: number | null;
  niva_fore: number | null;
  malniva: number | null;
  ateranvanda: number;
  /**
   * Frågor hon sett inom 14 dagar före sessionens dag. Räknas i "rätt av
   * antal" och visas i genomgången, men inte mot nivån, tempot, familjerna
   * eller frågestatistiken (spec-rummen 14.1 punkt 3). Saknas i sessioner
   * skapade före ändringen: tolkas som tom.
   */
  upprepade: string[];
  /* Satt av complete: */
  niva_efter?: number | null;
  ratt?: number;
  over_tid?: number;
  snitt_s?: number | null;
  nasta?: Nasta | null;
}

export interface SessionRad {
  id: string;
  test_type: string | null;
  meta: unknown;
  answers: unknown;
  created_at: string;
  completed_at: string | null;
}

export interface SparatSvar {
  q_id: string;
  /** Originalindex, -1 för "Vet inte". */
  selected: number;
  visat: number | null;
  correct: boolean;
  time_spent: number;
  vet_inte?: boolean;
  /** Uppgiftens tid tog slut (generalrepetition med tid per uppgift, spec 14.4). */
  tiden_ute?: boolean;
}

const TYPER: readonly Sessionstyp[] = ['matning', 'ommatning', 'pass', 'riktat', 'general'];

export function lasTraningsmeta(meta: unknown): TraningsMeta | null {
  if (!meta || typeof meta !== 'object') return null;
  const m = meta as Partial<TraningsMeta>;
  if (m.traning !== 1 || !m.typ || !TYPER.includes(m.typ)) return null;
  return m as TraningsMeta;
}

/** Svaren som SparatSvar, ogiltiga rader bort. */
export function lasSvar(answers: unknown): SparatSvar[] {
  if (!Array.isArray(answers)) return [];
  const ut: SparatSvar[] = [];
  for (const a of answers) {
    if (!a || typeof a !== 'object') continue;
    const r = a as Record<string, unknown>;
    if (typeof r.q_id !== 'string') continue;
    ut.push({
      q_id: r.q_id,
      selected: typeof r.selected === 'number' ? r.selected : -1,
      visat: typeof r.visat === 'number' ? r.visat : null,
      correct: r.correct === true,
      time_spent: typeof r.time_spent === 'number' && r.time_spent > 0 ? Math.round(r.time_spent) : 0,
      vet_inte: r.vet_inte === true ? true : undefined,
      tiden_ute: r.tiden_ute === true ? true : undefined,
    });
  }
  return ut;
}

/**
 * Frågorna hon sett och dagen hon senast såg dem: alla besvarade frågor i
 * matrissessioner, och i fasta träningssessioner även de som visades men
 * inte besvarades.
 */
export function seddaFragor(rader: readonly SessionRad[]): Sedd[] {
  const ut: Sedd[] = [];
  for (const r of rader) {
    const dag = dagSthlm(r.created_at);
    for (const s of lasSvar(r.answers)) ut.push({ id: s.q_id, dag });
    const m = lasTraningsmeta(r.meta);
    for (const id of m?.fragor ?? []) ut.push({ id, dag });
  }
  return ut;
}

export type SlutfordRad = SlutfordSession & { id: string; meta: TraningsMeta; slut: string };

/** Slutförda träningssessioner med dag (svensk tid) och typ, äldst först. */
export function slutfordaSessioner(rader: readonly SessionRad[]): SlutfordRad[] {
  const ut: SlutfordRad[] = [];
  for (const r of rader) {
    if (!r.completed_at) continue;
    const m = lasTraningsmeta(r.meta);
    if (!m) continue;
    ut.push({ id: r.id, dag: dagSthlm(r.completed_at), typ: m.typ, meta: m, slut: r.completed_at });
  }
  return ut.sort((a, b) => new Date(a.slut).getTime() - new Date(b.slut).getTime());
}

export function aktivaDagar(sessioner: readonly SlutfordSession[]): Dag[] {
  return [...new Set(sessioner.map((s) => s.dag))].sort();
}

/** Slutförda dagens pass (test_type matrislogik-pass) i dag. Kvoten för grundpasset. */
export function passIdag(sessioner: readonly SlutfordSession[], idag: Dag): number {
  return sessioner.filter((s) => s.typ === 'pass' && s.dag === idag).length;
}

export function antalMatningar(sessioner: readonly SlutfordSession[]): number {
  return sessioner.filter((s) => s.typ === 'matning' || s.typ === 'ommatning').length;
}

/** "3 pass gjorda, två ommätningar, två generalrepetitioner". Mätningen är inget pass. */
export function raknaAktivitet(sessioner: readonly SlutfordSession[]): {
  pass: number;
  ommatningar: number;
  generalrepetitioner: number;
  matningar: number;
} {
  const r = { pass: 0, ommatningar: 0, generalrepetitioner: 0, matningar: 0 };
  for (const s of sessioner) {
    if (s.typ === 'pass' || s.typ === 'riktat') r.pass++;
    else if (s.typ === 'ommatning') r.ommatningar++;
    else if (s.typ === 'general') r.generalrepetitioner++;
    else r.matningar++;
  }
  return r;
}

/** Förra passets tema och vad "I morgon" lovade. */
export function forraPasset(
  sessioner: readonly (SlutfordSession & { meta: TraningsMeta })[]
): { tema: string | null; nasta: Nasta | null } | null {
  const pass = sessioner.filter((s) => s.typ === 'pass');
  const sista = pass[pass.length - 1];
  return sista ? { tema: sista.meta.tema ?? null, nasta: sista.meta.nasta ?? null } : null;
}
