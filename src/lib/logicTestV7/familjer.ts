// src/lib/logicTestV7/familjer.ts
// =============================================================================
// Mönsterfamiljerna i matrislogiken (våg 3c). Källan är familjer.json, som
// också valideringsskripten läser. Taxonomin och hur den härleddes står i
// docs/tester/matris-familjer.md.
//
// Ren fil utan frågebank: får importeras från klienten (namnen visas i
// genomgången och i "var du tappar").
// =============================================================================

import lista from './familjer.json';

export type MatrisFamilj =
  | 'vridning'
  | 'monsterrotation'
  | 'vandring'
  | 'rotation-med-byte'
  | 'tva-rorelser'
  | 'latin-antal'
  | 'latin-form'
  | 'latin-flera'
  | 'overlagring'
  | 'spegling'
  | 'antal-andras';

export interface FamiljInfo {
  id: MatrisFamilj;
  /** Namnet i gränssnittet, till exempel "Vrider sig och byter utseende". */
  namn: string;
  /** En mening om vad familjen går ut på. */
  kort: string;
  /** Formaten familjen förekommer i, för testansvarig och genomgången. */
  format: string[];
}

export const FAMILJER = lista as FamiljInfo[];

const PER_ID = new Map(FAMILJER.map((f) => [f.id, f]));

export function arMatrisFamilj(id: unknown): id is MatrisFamilj {
  return typeof id === 'string' && PER_ID.has(id as MatrisFamilj);
}

/** Familjens namn, eller null för okänd familj (gamla V5-frågor). */
export function familjNamn(id: string | null | undefined): string | null {
  return id && arMatrisFamilj(id) ? PER_ID.get(id)!.namn : null;
}

export function familjInfo(id: string | null | undefined): FamiljInfo | null {
  return id && arMatrisFamilj(id) ? PER_ID.get(id)! : null;
}
