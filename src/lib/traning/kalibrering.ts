// src/lib/traning/kalibrering.ts
// =============================================================================
// Kalibreringsfrågan (riktlinjer-tester-v2 2.4): varje pass och varje
// övningsprov för Premium får en fråga med färre än 30 svar, vald bland de
// minst besvarade och placerad slumpmässigt bland de andra. Den visas och
// står i genomgången som alla andra, men räknas inte i nivån, tempot eller
// familjerna. Frågestatistiken får svaret, så att svårigheten blir uppmätt
// i stället för antagen. Så kalibrerar riktiga testleverantörer nya
// uppgifter.
//
// Frågan ersätter en av passets frågor, så att "nio uppgifter" och provets
// format står kvar. Ren och seedad.
// =============================================================================

import type { FragaStatistik } from './svarighet';

/** Färre svar än så: frågan är inte kalibrerad än. */
export const KALIBRERING_GRANS = 30;

function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Den minst besvarade frågan under gränsen, som inte redan står i passet.
 * Frågor hon inte sett går först. Lika antal avgörs seedat. Null när alla
 * frågor har 30 svar eller fler.
 */
export function valjKalibrering(args: {
  bank: readonly { id: string }[];
  statistik: ReadonlyMap<string, FragaStatistik>;
  /** Frågorna som redan står i passet. */
  utesluten: ReadonlySet<string>;
  /** Frågor hon sett tidigare. */
  sedda: ReadonlySet<string>;
  seed: string;
}): string | null {
  const kandidater = args.bank
    .filter((q) => !args.utesluten.has(q.id))
    .map((q) => ({ id: q.id, antal: args.statistik.get(q.id)?.antal ?? 0, sedd: args.sedda.has(q.id) ? 1 : 0 }))
    .filter((q) => q.antal < KALIBRERING_GRANS);
  if (kandidater.length === 0) return null;
  kandidater.sort((a, b) => a.sedd - b.sedd || a.antal - b.antal || hash(`${args.seed}:${a.id}`) - hash(`${args.seed}:${b.id}`));
  return kandidater[0].id;
}

/** Byter en av frågorna mot kalibreringsfrågan, på en seedad plats. */
export function placeraKalibrering(fragor: readonly string[], kalibrering: string, seed: string): string[] {
  if (fragor.length === 0) return [kalibrering];
  const plats = hash(`${seed}:plats`) % fragor.length;
  return fragor.map((id, i) => (i === plats ? kalibrering : id));
}
