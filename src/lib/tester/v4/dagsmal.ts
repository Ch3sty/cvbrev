// src/lib/tester/v4/dagsmal.ts
// Dagsmål och dagar i rad (planen 2.2 punkt 6): slutförda sessioner i dag
// (alla slag) mot test_planer.dagsmal, dagar i rad med raknaSerie. Ren.

import { dagSthlm, type Dag } from '@/lib/traning/datum';
import { raknaSerie } from '@/lib/traning/serie';
import type { DagsmalLage } from './typer';

export function arDagsmal(v: unknown): v is 1 | 2 | 3 {
  return v === 1 || v === 2 || v === 3;
}

export function dagsmalLage(args: {
  mal: unknown;
  /** completed_at för alla slutförda sessioner, eller dagar. */
  slutforda: readonly (string | Date)[];
  idag: Dag;
  provdatum?: Dag | null;
}): DagsmalLage {
  const dagar = args.slutforda.map((t) => (typeof t === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t) ? t : dagSthlm(t)));
  const gjortIdag = dagar.filter((d) => d === args.idag).length;
  const serie = raknaSerie({ aktivaDagar: [...new Set(dagar)], idag: args.idag, provdatum: args.provdatum ?? null });
  return { mal: arDagsmal(args.mal) ? args.mal : null, gjortIdag, dagarIRad: serie.dagar };
}
