// src/lib/deduktivV1/familjer.ts
// =============================================================================
// "Var du tappade" per villkorstyp (copy-omgang3.md 4.6). Ren fil, får
// importeras från klienten.
// =============================================================================

import type { DeduktivFamilj } from './types';

export const DEDUKTIV_FAMILJ_NAMN: Record<DeduktivFamilj, string> = {
  premiss: 'Alla, inga och några',
  plats: 'Fast plats',
  inte_plats: 'Utesluten plats',
  granne: 'Bredvid varandra',
  inte_granne: 'Inte bredvid varandra',
  vanster_om: 'Till vänster om',
  direkt_vanster_om: 'Direkt till vänster om',
  ordning: 'Före och efter',
  samma_grupp: 'Samma grupp',
  rorelse: 'Villkor i rörelse',
};

export function deduktivFamiljNamn(id: string | null | undefined): string | null {
  return id && id in DEDUKTIV_FAMILJ_NAMN ? DEDUKTIV_FAMILJ_NAMN[id as DeduktivFamilj] : null;
}
