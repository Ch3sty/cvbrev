// src/lib/traning/plan.ts
// =============================================================================
// Planen från mätningens dag till provet (spec-rummen 6 våg 3a, E3 och 1a).
//
// - Mätningens dag: mätning.
// - Provdagen: prov (vila, inga pass).
// - Två dagar och en dag före provet: generalrepetition.
// - Var sjunde dag från mätningen: ommätning.
// - Söndag: vila.
// - Övriga dagar: pass.
// Krockar avgörs i den ordningen (prov, generalrepetition, ommätning, vila,
// pass). 14 dagar från en lördag ger åtta pass, två vilodagar, en ommätning
// och två generalrepetitioner.
//
// Utan datum: rullande, till och med sju dagar efter i dag, med ommätning var
// sjunde dag från mätningen (1h).
//
// Status per dag: gjord (något slutfört den dagen, eller en passerad vila),
// idag, kvar, last (ingår inte i gratisnivån), missad (passerad utan pass).
// =============================================================================

import { arSondag, dagarIntervall, dagarMellan, laggTill, type Dag } from './datum';
import { GRATISNIVA } from './gratisniva';

export type PlanTyp = 'matning' | 'pass' | 'vila' | 'ommatning' | 'general' | 'prov';
export type PlanStatus = 'gjord' | 'idag' | 'kvar' | 'last' | 'missad';

export interface PlanDag {
  dag: Dag;
  typ: PlanTyp;
  status: PlanStatus;
}

export interface PlanIn {
  /** Mätningens dag (första mätningen). */
  start: Dag;
  /** Provdatum, om satt och inte före mätningen. */
  prov?: Dag | null;
  idag: Dag;
  /** Dagar med något slutfört (mätning, pass, ommätning, generalrepetition). */
  aktivaDagar?: readonly Dag[];
  /** Har användaren Hela paketet (eller Dagspasset)? Styr "last". */
  betalande?: boolean;
  /** Gratisnivån, för tester. */
  gratis?: { ommatningGratis: boolean; provlageGratis: boolean; grundpassVarjeDag?: boolean };
  /** Dagar framåt utan datum. */
  rullandeDagar?: number;
}

/** Dagens typ i planen, utan status. */
export function planTyp(dag: Dag, start: Dag, prov?: Dag | null): PlanTyp {
  if (dag === start) return 'matning';
  if (prov) {
    const kvar = dagarMellan(dag, prov);
    if (kvar === 0) return 'prov';
    if (kvar === 1 || kvar === 2) return 'general';
  }
  const franStart = dagarMellan(start, dag);
  if (franStart > 0 && franStart % 7 === 0) return 'ommatning';
  if (arSondag(dag)) return 'vila';
  return 'pass';
}

export function byggPlan(inp: PlanIn): PlanDag[] {
  const { start, idag } = inp;
  const prov = inp.prov && inp.prov >= start ? inp.prov : null;
  const slut = prov ?? laggTill(idag >= start ? idag : start, inp.rullandeDagar ?? 7);
  const aktiva = new Set(inp.aktivaDagar ?? []);
  const gratis = inp.gratis ?? GRATISNIVA;
  const last = (typ: PlanTyp): boolean =>
    !inp.betalande &&
    ((typ === 'ommatning' && !gratis.ommatningGratis) ||
      (typ === 'general' && !gratis.provlageGratis) ||
      // 17.2: passdagarna efter mätningens dag ingår inte när grundpasset bara gäller dag 0.
      (typ === 'pass' && gratis.grundpassVarjeDag === false));

  return dagarIntervall(start, slut).map((dag) => {
    const typ = planTyp(dag, start, prov);
    let status: PlanStatus;
    if (aktiva.has(dag)) status = 'gjord';
    else if (dag < idag) status = typ === 'vila' || typ === 'prov' ? 'gjord' : 'missad';
    else if (last(typ)) status = 'last';
    else if (dag === idag) status = 'idag';
    else status = 'kvar';
    return { dag, typ, status };
  });
}

export interface Planrakning {
  pass: number;
  vila: number;
  ommatning: number;
  general: number;
}

/** Räknar planens dagar efter mätningen (E3: "åtta pass, två vilodagar ..."). */
export function raknaPlan(plan: readonly PlanDag[]): Planrakning {
  const r: Planrakning = { pass: 0, vila: 0, ommatning: 0, general: 0 };
  for (const d of plan) {
    if (d.typ === 'pass' || d.typ === 'vila' || d.typ === 'ommatning' || d.typ === 'general') r[d.typ] += 1;
  }
  return r;
}

/** Planens dag för ett datum, eller null utanför planen. */
export function planForDag(plan: readonly PlanDag[], dag: Dag): PlanDag | null {
  return plan.find((p) => p.dag === dag) ?? null;
}
