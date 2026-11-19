// src/lib/tester/v4/niva-lage.ts
// Nivåbandets läge per typ (planen 2.2 punkt 2) och nivån efter en träning
// för typerna som saknar matrisens passnivå (A4). Ren.

import { nivaTak } from '@/lib/traning/flaggor';
import { avrunda, passUppdatering, PASS_TAK, type NivaSvar } from '@/lib/traning/niva';
import type { NivaLage, UtvecklingsPunkt } from './typer';

/** Mätningens standardfel: tolv uppgifter ger cirka 0,6 nivåer. */
export const NIVA_OSAKERHET = 0.6;
/** Antal uppgifter i en hel Nivåkoll. */
export const NIVAKOLL_ANTAL = 12;

/**
 * Läget ur typens punkter. Påbörjad nivåkoll går före allt: bandet visar
 * "8 av 12 svar" utan tal. Annars den senaste punkten som räknas och har en
 * nivå (nivåkoll eller träning), i tidsordning. Övningsprov har aldrig nivå.
 */
export function nivaLage(
  punkter: readonly UtvecklingsPunkt[],
  paborjad?: { besvarade: number; antal: number } | null,
  tak = nivaTak()
): NivaLage {
  const bas = { osakerhet: NIVA_OSAKERHET, tak };
  const senaste = senasteNiva(punkter);
  if (paborjad && paborjad.besvarade < paborjad.antal) {
    return { ...bas, status: 'paborjad', niva: senaste, svar: { besvarade: paborjad.besvarade, antal: paborjad.antal } };
  }
  if (senaste == null) return { ...bas, status: 'omatt', niva: null };
  return { ...bas, status: 'matt', niva: Math.min(tak, senaste) };
}

/**
 * Senaste nivån som räknas, eller null. Nivåkoll och träning går före
 * nivåtestets skattning; den används bara när typen inte har någon annan.
 */
export function senasteNiva(punkter: readonly UtvecklingsPunkt[]): number | null {
  const egna = punkter.filter((p) => p.kalla !== 'nivatest' && p.niva != null && p.raknas && p.slag !== 'ovningsprov');
  return senasteAv(egna.length ? egna : punkter);
}

function senasteAv(punkter: readonly UtvecklingsPunkt[]): number | null {
  let bast: UtvecklingsPunkt | null = null;
  for (const p of punkter) {
    if (p.niva == null || !p.raknas || p.slag === 'ovningsprov') continue;
    if (!bast || p.dag > bast.dag || (p.dag === bast.dag && p.slag === 'trana' && bast.slag !== 'trana')) bast = p;
  }
  return bast ? bast.niva : null;
}

export interface TraningsSvar extends NivaSvar {
  /** Uppgiften är osedd (eller räknas enligt karens.ts). Bara de flyttar nivån. */
  raknas: boolean;
}

/**
 * Nivån efter en träning i figurserie, deduktiv, verbal, numerisk, talserie,
 * spatial och ordförråd. Samma räkning som matrisens passnivå
 * (passUppdatering, tak ±0,5 per träning), bara uppgifter som räknas, och
 * dagstak 0,5 mot nivån vid dagens första träning. Null utan nivå före (en
 * träning sätter aldrig en första nivå; det gör Nivåkollen) eller utan
 * uppgifter som räknas.
 */
export function nivaEfterTraning(args: {
  fore: number | null;
  svar: readonly TraningsSvar[];
  /** Nivån före dagens första träning i typen; null om detta är den första. */
  dagensStart?: number | null;
  tak?: number;
}): { niva: number; delta: number } | null {
  const { fore } = args;
  if (fore == null) return null;
  const raknade = args.svar.filter((s) => s.raknas);
  if (raknade.length === 0) return null;
  const tak = args.tak ?? nivaTak();
  const steg = passUppdatering(fore, raknade);
  const start = args.dagensStart ?? fore;
  const lag = Math.max(1, start - PASS_TAK);
  const hog = Math.min(tak, start + PASS_TAK);
  const niva = avrunda(Math.min(hog, Math.max(lag, steg.niva)));
  return { niva, delta: avrunda(niva - fore) };
}
