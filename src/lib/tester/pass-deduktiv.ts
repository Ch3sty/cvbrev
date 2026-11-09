// src/lib/tester/pass-deduktiv.ts
// =============================================================================
// Deduktivpasset (testplanen steg 1, 2026-11-09): passraden för deduktiv
// slutledning, i samma form som textpasset och figurpasset. Fyra uppgifter,
// en i taget, och lösningen (stegen, remsan och misstaget) efter varje svar.
// Nivån sätts av Nivåkollen för deduktivt (src/lib/nivakoll), annars av det
// bästa klassiska grundresultatet. Matrisnivån och matriskurvan läser aldrig
// passet.
//
// Rena typer och konstanter: får importeras av klienten och vitest. Motorn
// bor i pass-deduktiv.server.ts.
// =============================================================================

import type { DeduktivFamilj, DeduktivLosning, VisadDeduktiv } from '@/lib/deduktivV1/types';

export const DEDUKTIVPASS_TEST_TYPE = 'deduktiv-pass';
export const DEDUKTIV_ANTAL = 4;
/** Provets tid per uppgift: 15 minuter för 12 i de klassiska testen. */
export const DEDUKTIV_BUDGET_PER_UPPGIFT_S = 75;

export type DeduktivPassNiva = 'grund' | 'avancerad';

export function arDeduktivpassTestTyp(t: unknown): boolean {
  return t === DEDUKTIVPASS_TEST_TYPE;
}

/** En uppgift som klienten ser: utan facit och lösning. */
export interface DeduktivPassUppgift extends VisadDeduktiv {
  nyckel: string;
  /** D1 har premisser, D2 och D3 villkor. */
  premisser: boolean;
}

export interface DeduktivAterkoppling {
  correct: boolean;
  /** Rätt alternativ, visat index. */
  rattVisat: number;
  /** Hennes val (visat index), null för "Vet inte". */
  valtVisat: number | null;
  losning: DeduktivLosning;
  /** Misstaget för hennes val, null när rätt eller "Vet inte". */
  misstag: string | null;
  familj: DeduktivFamilj;
}

export interface DeduktivTappad {
  familj: string;
  ratt: number;
  antal: number;
  andel: number;
}

export interface DeduktivResultat {
  ratt: number;
  antal: number;
  tid_s: number;
  budget_s: number;
  /** Villkorstyperna hon tappade i, ackumulerat över deduktivpassen, svagast först. */
  tappade: DeduktivTappad[];
}

export interface DeduktivPassVy {
  id: string;
  niva: DeduktivPassNiva;
  upprepad: boolean;
  budget_s: number;
  startad: string;
  avslutad: boolean;
  /** Sitter på avancerad: "Du är på expertnivå. Gör nivåtestet i stället." */
  expertRad: boolean;
  uppgifter: DeduktivPassUppgift[];
  besvarade: Record<string, { visat: number | null; tid_s: number }>;
  aterkoppling: Record<string, DeduktivAterkoppling>;
  resultat: DeduktivResultat | null;
}

/** Bästa slutförda klassiska deduktiv-grund i procent, null utan försök. */
export function bastaDeduktivGrundProcent(
  rader: readonly { test_type: string | null; meta: unknown; score?: number | null; completed_at: string | null }[]
): number | null {
  let bast: number | null = null;
  for (const r of rader) {
    if (!r.completed_at || r.test_type !== 'deduktiv-grund' || typeof r.score !== 'number') continue;
    const antal = Number((r.meta as { antal?: unknown } | null)?.antal) || 12;
    const p = Math.max(0, Math.min(100, Math.round((r.score / antal) * 100)));
    bast = bast == null ? p : Math.max(bast, p);
  }
  return bast;
}
