// src/lib/figurserierV1/familjer.ts
// =============================================================================
// Figurseriernas familjer (beställningen omgång 2, A3): vridning, vandring,
// antal, fyllning, vaxande, vaxelvis, flera. Egna namn, skilda från
// matrisernas familjer, så att "Var du tappade" talar om serier.
// Ren fil utan frågebank: får importeras från klienten.
// =============================================================================

import lista from './familjer.json';

export type SerieFamilj = 'vridning' | 'vandring' | 'antal' | 'fyllning' | 'vaxande' | 'vaxelvis' | 'flera';

export interface SerieFamiljInfo {
  id: SerieFamilj;
  namn: string;
  kort: string;
}

export const SERIE_FAMILJER = lista as SerieFamiljInfo[];
const PER_ID = new Map(SERIE_FAMILJER.map((f) => [f.id, f]));

/** Familjens namn, eller null för okänd familj. */
export function serieFamiljNamn(id: string | null | undefined): string | null {
  return id ? PER_ID.get(id as SerieFamilj)?.namn ?? null : null;
}
