// src/lib/ordforradV1/status.ts
// =============================================================================
// Om ordförrådet får visas. Briefen kräver minst 40 verifierade uppgifter per
// nivå och typ (240) före live. Vyn ska fråga ordforradRedo() och dölja
// testet (och I-prov-provets två orddeltest) tills banken räcker. Bara
// serverkod: läser bankerna.
// =============================================================================

import grund from './bankGrund.json';
import avancerad from './bankAvancerad.json';
import expert from './bankExpert.json';
import type { OrdFraga, OrdNiva, OrdTyp } from './types';

export const MINST_PER_NIVA_OCH_TYP = 40;

const BANK: Record<OrdNiva, OrdFraga[]> = {
  grund: grund as unknown as OrdFraga[],
  avancerad: avancerad as unknown as OrdFraga[],
  expert: expert as unknown as OrdFraga[],
};

/** Antal uppgifter per nivå och typ. */
export function ordforradAntal(): Record<OrdNiva, Record<OrdTyp, number>> {
  const r = (n: OrdNiva, t: OrdTyp) => BANK[n].filter((q) => q.typ === t && !q.pensionerad_fran).length;
  return {
    grund: { synonym: r('grund', 'synonym'), antonym: r('grund', 'antonym') },
    avancerad: { synonym: r('avancerad', 'synonym'), antonym: r('avancerad', 'antonym') },
    expert: { synonym: r('expert', 'synonym'), antonym: r('expert', 'antonym') },
  };
}

/** Sant när nivån har minst 40 av varje typ. Utan nivå: alla tre nivåerna. */
export function ordforradRedo(niva?: OrdNiva): boolean {
  const a = ordforradAntal();
  const nivaer = niva ? [niva] : (['grund', 'avancerad', 'expert'] as const);
  return nivaer.every((n) => a[n].synonym >= MINST_PER_NIVA_OCH_TYP && a[n].antonym >= MINST_PER_NIVA_OCH_TYP);
}
