// src/lib/tester/v4/bana.ts
// Banan i Plan inför provet (planen 2.2 punkt 5): från planens start till
// provdatumet, gjorda dagar ur alla slutförda sessioner, föreslagen Nivåkoll
// sju dagar efter den senaste och föreslaget övningsprov två dagar före
// provet. Utan datum: öppet slut tio dagar fram. Ren.

import { dagarMellan, laggTill, type Dag } from '@/lib/traning/datum';
import type { BanaDag } from './typer';

export const NIVAKOLL_INTERVALL_DAGAR = 7;
export const OVNINGSPROV_FORE_PROVET = 2;
export const OPPET_SLUT_DAGAR = 10;
/** Banan ritas högst så här många dagar bakåt, så att en gammal plan inte trycker ihop den. */
export const BANA_MAX_BAKAT = 21;

export function foreslagenNivakoll(senasteNivakoll: Dag | null, idag: Dag): Dag {
  if (!senasteNivakoll) return idag;
  const dag = laggTill(senasteNivakoll, NIVAKOLL_INTERVALL_DAGAR);
  return dag < idag ? idag : dag;
}

export function foreslagetOvningsprov(provdatum: Dag | null, idag: Dag): Dag | null {
  if (!provdatum) return null;
  const dag = laggTill(provdatum, -OVNINGSPROV_FORE_PROVET);
  if (dag >= idag) return dag;
  return provdatum > idag ? idag : null;
}

export function byggBana(args: {
  planStart: Dag;
  provdatum: Dag | null;
  idag: Dag;
  gjordaDagar: readonly Dag[];
  senasteNivakoll: Dag | null;
}): BanaDag[] {
  const { idag, provdatum } = args;
  let start = args.planStart > idag ? idag : args.planStart;
  if (dagarMellan(start, idag) > BANA_MAX_BAKAT) start = laggTill(idag, -BANA_MAX_BAKAT);
  const slut = provdatum && provdatum >= idag ? provdatum : laggTill(idag, OPPET_SLUT_DAGAR);
  const gjorda = new Set(args.gjordaDagar);
  const nk = foreslagenNivakoll(args.senasteNivakoll, idag);
  const ov = foreslagetOvningsprov(provdatum, idag);

  const ut: BanaDag[] = [];
  for (let d = start; d <= slut; d = laggTill(d, 1)) {
    let status: BanaDag['status'];
    if (provdatum && d === provdatum) status = 'prov';
    else if (d === idag) status = 'idag';
    else if (d < idag) status = gjorda.has(d) ? 'gjord' : 'kommande';
    else status = 'kommande';
    const rad: BanaDag = { dag: d, status };
    if (d >= idag && status !== 'prov') {
      if (ov && d === ov) rad.forslag = 'ovningsprov';
      else if (d === nk && d > idag) rad.forslag = 'nivakoll';
    }
    ut.push(rad);
  }
  return ut;
}

/** "Dag N av M" räknat från planens start, aldrig från första nivåkollen. Null utan datum. */
export function dagAvPlan(planStart: Dag, provdatum: Dag | null, idag: Dag): { dag: number; av: number } | null {
  if (!provdatum) return null;
  const av = Math.max(1, dagarMellan(planStart, provdatum));
  const dag = Math.min(av, Math.max(1, dagarMellan(planStart, idag) + 1));
  return { dag, av };
}
