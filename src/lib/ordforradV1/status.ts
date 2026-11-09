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
/**
 * Expert (ägarens beslut 2026-11-09): svåra ord saknar ofta ett entydigt
 * motsatsord, så expert får färre motsatsord om nivån totalt har minst 40
 * uppgifter. Det som fattas fylls med svåra synonymer.
 */
export const EXPERT_MINST_TOTALT = 40;
export const EXPERT_MINST_MOTSATS = 5;

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

/** Kravet för en nivå: grund och avancerad 40 av varje typ, expert 40 totalt och minst 5 motsatsord. */
export function nivaRedo(n: OrdNiva, a: Record<OrdTyp, number>): boolean {
  if (n === 'expert') return a.synonym + a.antonym >= EXPERT_MINST_TOTALT && a.antonym >= EXPERT_MINST_MOTSATS;
  return a.synonym >= MINST_PER_NIVA_OCH_TYP && a.antonym >= MINST_PER_NIVA_OCH_TYP;
}

/** Sant när nivån når sitt krav. Utan nivå: alla tre nivåerna. */
export function ordforradRedo(niva?: OrdNiva): boolean {
  const a = ordforradAntal();
  const nivaer = niva ? [niva] : (['grund', 'avancerad', 'expert'] as const);
  return nivaer.every((n) => nivaRedo(n, a[n]));
}
