// src/lib/nivakoll/niva.ts
// =============================================================================
// Nivåkollen för figurserier, deduktivt, verbalt och numeriskt (testplanen
// steg 1, 2026-11-09): samma skala 1 till 10 och samma räkning som
// matrislogikens Nivåkoll (src/lib/traning/niva.ts), aldrig en egen norm.
//
// Kalibreringen, i en mening var:
// - Varje uppgift ligger på nivå b = 1 + 9 × (1 − p), där p är andelen som
//   klarar den: uppmätt i fraga_statistik från 30 svar, annars bankens
//   p_prior, annars priorn för bankens svårighet (svarighet.ts).
// - Nivån är den θ där väntat antal rätt (1 / (1 + e^−(θ − b)) per uppgift)
//   är lika med faktiskt antal rätt, med samma stöd på 5,5 som matrisen
//   (beraknaNiva). Taket 7,5 gäller tills banken är kalibrerad.
// - Dagens pass: avancerad när väntad andel rätt på typens grundbank vid
//   nivån är minst SITTER_PROCENT (85), samma gräns som "sitter" i de
//   klassiska testen. Annars grund.
//
// Ren fil: får importeras av klienten och vitest.
// =============================================================================

import { chansRatt } from '@/lib/traning/niva';
import { SITTER_PROCENT } from '@/lib/tester/resultat';

export type NivakollKind = 'figurserie' | 'deduktiv' | 'verbal' | 'numerisk';
export const NIVAKOLL_KINDS: readonly NivakollKind[] = ['figurserie', 'deduktiv', 'verbal', 'numerisk'];

export function arNivakollKind(v: unknown): v is NivakollKind {
  return typeof v === 'string' && (NIVAKOLL_KINDS as readonly string[]).includes(v);
}

/** test_type i logic_test_v4_sessions. */
export const NIVAKOLL_TEST_TYPE: Readonly<Record<NivakollKind, string>> = {
  figurserie: 'figurserie-nivakoll',
  deduktiv: 'deduktiv-nivakoll',
  verbal: 'verbal-nivakoll',
  numerisk: 'numerisk-nivakoll',
};

export const NIVAKOLL_TEST_TYPER = Object.values(NIVAKOLL_TEST_TYPE);

export function kindForNivakollTestTyp(t: unknown): NivakollKind | null {
  const k = NIVAKOLL_KINDS.find((x) => NIVAKOLL_TEST_TYPE[x] === t);
  return k ?? null;
}

/** Väntad andel rätt på uppgifter med andelarna p för någon på nivån. */
export function vantadAndel(niva: number, p: readonly number[]): number {
  if (!p.length) return 0;
  return p.reduce((s, x) => s + chansRatt(niva, x), 0) / p.length;
}

/** Passets nivå ur Nivåkollens nivå och grundbankens andelar. */
export function passNivaUrNiva(niva: number, pGrund: readonly number[]): 'grund' | 'avancerad' {
  return vantadAndel(niva, pGrund) * 100 >= SITTER_PROCENT ? 'avancerad' : 'grund';
}

/** Lägsta nivå (en decimal) där passet blir avancerat, för rapporten och testerna. */
export function gransForAvancerad(pGrund: readonly number[]): number {
  for (let n = 10; n <= 100; n++) if (passNivaUrNiva(n / 10, pGrund) === 'avancerad') return n / 10;
  return 10;
}
