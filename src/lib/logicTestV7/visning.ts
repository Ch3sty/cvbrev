// src/lib/logicTestV7/visning.ts
// =============================================================================
// En bankfråga till det klienten får se: alternativen i sessionens visade
// ordning, utan facit (VisadFraga), eller efter avslutat test med var rätt
// svar stod (GenomgangsFraga). Ingen frågebank importeras här, så filen går
// att använda från proxyn och andra ställen som inte ska dra in bankerna.
// =============================================================================

import { permutationForSession, tillVisat } from './blanda';
import type { GenomgangsFraga, LayeredQuestion, VisadFraga } from './layered.v7';

/** En fråga i visad ordning, utan facit. */
export function visaFraga(
  q: LayeredQuestion,
  seedId: string,
  blandade: boolean
): VisadFraga {
  const perm = permutationForSession(seedId, q, blandade);
  return {
    id: q.id,
    title: q.title,
    rule: q.rule,
    difficulty: q.difficulty,
    grid: q.grid,
    options: perm.map((orig) => q.options[orig]),
  };
}

/** En fråga i visad ordning, med var rätt svar stod. Bara efter avslutat test. */
export function genomgaFraga(
  q: LayeredQuestion,
  seedId: string,
  blandade: boolean
): GenomgangsFraga {
  const perm = permutationForSession(seedId, q, blandade);
  return {
    ...visaFraga(q, seedId, blandade),
    rattVisat: tillVisat(perm, q.correctAnswer),
  };
}
