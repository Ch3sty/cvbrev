// src/lib/traning/milstolpar.ts
// =============================================================================
// De fem märkena, med testansvarigs rättade definitioner (granskningen 3.2,
// spec-rummen bilaga Milstolparna):
//
// - Första mätningen: mätningen sparad.
// - Första veckan: sju dagar sedan mätningen med alla planerade dagar gjorda.
//   Vilodagen ingår (kräver inget), mätning och ommätning räknas inte som
//   pass, men en planerad ommätning ska vara gjord. K1: "Sju dagar sedan
//   mätningen, fem pass och en ommätning".
// - Nivån upp: första hela nivån över mätningens. 5,0 ger märket vid 6,0,
//   6,3 vid 7,0.
// - Generalrepetitionen: första slutförda.
// - Provdagen: passerad med satt datum (dagen efter provet).
//
// En rad i test_milstolpar när märket nås; visad_at när kvittot visats.
// Visas aldrig i Jobbsöket, Bli upptäckt eller mot rekryterare.
// =============================================================================

import { laggTill, dagarMellan, type Dag } from './datum';
import { byggPlan } from './plan';

export const MILSTOLPAR = [
  'forsta_matningen',
  'forsta_veckan',
  'nivan_upp',
  'generalrepetitionen',
  'provdagen',
] as const;

export type MilstolpeNyckel = (typeof MILSTOLPAR)[number];

export function arMilstolpe(s: unknown): s is MilstolpeNyckel {
  return typeof s === 'string' && (MILSTOLPAR as readonly string[]).includes(s);
}

export type Sessionstyp = 'matning' | 'ommatning' | 'pass' | 'riktat' | 'general';

export interface SlutfordSession {
  dag: Dag;
  typ: Sessionstyp;
}

export interface Nivapunkt {
  dag: Dag;
  niva: number;
  typ: 'matning' | 'pass' | 'ommatning' | 'general';
}

export interface MilstolparIn {
  sessioner: readonly SlutfordSession[];
  punkter: readonly Nivapunkt[];
  provdatum?: Dag | null;
  idag: Dag;
  /** Märken som redan finns i test_milstolpar. */
  redan?: readonly string[];
}

/** Första mätningens punkt (dag och nivå), eller null. */
export function forstaMatningen(punkter: readonly Nivapunkt[]): Nivapunkt | null {
  const m = punkter
    .filter((p) => p.typ === 'matning')
    .sort((a, b) => (a.dag < b.dag ? -1 : a.dag > b.dag ? 1 : 0));
  return m[0] ?? null;
}

/** Har Första veckan nåtts, givet sessionerna? */
export function forstaVeckanNadd(
  matningsdag: Dag,
  sessioner: readonly SlutfordSession[],
  idag: Dag,
  provdatum?: Dag | null
): boolean {
  const sjunde = laggTill(matningsdag, 7);
  if (idag < sjunde) return false;
  const plan = byggPlan({ start: matningsdag, prov: provdatum ?? null, idag: sjunde, rullandeDagar: 7 });
  const perDag = new Map<Dag, Set<Sessionstyp>>();
  for (const s of sessioner) {
    const set = perDag.get(s.dag) ?? new Set<Sessionstyp>();
    set.add(s.typ);
    perDag.set(s.dag, set);
  }
  const fonster = plan.filter((d) => {
    const n = dagarMellan(matningsdag, d.dag);
    return n >= 1 && n <= 7;
  });
  if (fonster.length === 0) return false;
  for (const d of fonster) {
    const gjort = perDag.get(d.dag);
    switch (d.typ) {
      case 'vila':
      case 'prov':
        break;
      case 'ommatning':
        if (!gjort?.has('ommatning')) return false;
        break;
      case 'general':
        if (!gjort?.has('general')) return false;
        break;
      default:
        // Ett pass: pass, riktat pass eller generalrepetition räknas. En
        // mätning eller ommätning räknas inte som pass.
        if (!gjort || !(gjort.has('pass') || gjort.has('riktat') || gjort.has('general'))) return false;
    }
  }
  return true;
}

/**
 * Märkena som nåtts men inte redan finns, i den ordning de ska visas.
 * Ren funktion: anroparen skriver dem (registrera_milstolpar).
 */
export function nyaMilstolpar(inp: MilstolparIn): MilstolpeNyckel[] {
  const redan = new Set(inp.redan ?? []);
  const nadda: MilstolpeNyckel[] = [];
  const m = forstaMatningen(inp.punkter);

  if (m) nadda.push('forsta_matningen');

  if (m && forstaVeckanNadd(m.dag, inp.sessioner, inp.idag, inp.provdatum)) {
    nadda.push('forsta_veckan');
  }

  if (m) {
    const mal = Math.floor(m.niva + 1e-9) + 1;
    if (inp.punkter.some((p) => p.dag >= m.dag && p.niva >= mal - 1e-9)) nadda.push('nivan_upp');
  }

  if (inp.sessioner.some((s) => s.typ === 'general')) nadda.push('generalrepetitionen');

  if (inp.provdatum && inp.idag > inp.provdatum) nadda.push('provdagen');

  return nadda.filter((k) => !redan.has(k));
}
