// src/lib/traning/bank.server.ts
// =============================================================================
// Bank för rummet Rekryteringstester: V7-bankernas frågor med de fält motorn behöver.
// Bara server: bankerna har facit (src/lib/logicTestV7/fragor.server.ts).
//
// Fälten från våg 3c läses defensivt, eftersom bankerna fylls på parallellt:
// - family: text, saknas = null (frågan räknas inte i "Var du tappar" och
//   väljs aldrig till ett riktat pass);
// - misstag: en text per alternativ på ORIGINALINDEX, tom för det rätta.
//   Fel längd eller annat än text = inga misstag (Regelpanel visar bara
//   regeln, aldrig en påhittad mening);
// - svarighet_prior: 1..4, saknas = dagens difficulty.
// =============================================================================

import {
  ALLA_AVANCERAD,
  ALLA_EXPERT,
  ALLA_GRUND,
  BANK_VERSION,
  valbarI,
  type Versionsfalt,
} from '@/lib/logicTestV7/selectQuestions.v7';
import type { LayeredQuestion } from '@/lib/logicTestV7/layered.v7';
import { lasFamilj } from './familjer';
import type { BankFragaInfo, Bankkalla } from './passgenerator';
import { pForFraga, svarighetPrior, type FragaStatistik, type Prior } from './svarighet';

/** En bankfråga med våg 3c:s fält, alla frivilliga. */
export type TraningsFraga = LayeredQuestion & {
  family?: unknown;
  misstag?: unknown;
  svarighet_prior?: unknown;
  /** Frivillig andel rätt i [0,05, 0,95] när generatorn kan gradera (spec 14.1 punkt 4). */
  p_prior?: unknown;
  /** Mallen frågan byggdes ur (bank_version 3), för exponeringsreglerna. */
  recept?: unknown;
  kalla: Bankkalla;
} & Versionsfalt;

function medKalla(pool: readonly LayeredQuestion[], kalla: Bankkalla): TraningsFraga[] {
  return pool.map((q) => ({ ...(q as TraningsFraga), kalla }));
}

/** Hela matrisbanken med källa, pensionerade inräknade (för gamla sessioner). */
const HELA_BANKEN: readonly TraningsFraga[] = [
  ...medKalla(ALLA_GRUND, 'grund'),
  ...medKalla(ALLA_AVANCERAD, 'avancerad'),
  ...medKalla(ALLA_EXPERT, 'expert'),
];

/**
 * Alla matrisfrågor motorn får välja bland: de som är valbara i den
 * bankversion nya sessioner får (BANK_VERSION, plan-facit-genvag A2). I
 * version 3 är de 157 frågorna med pensionerad_fran: 3 borta och V3-filerna
 * och plus-bandet med. Passen sparar sitt urval i meta, så ett pågående pass
 * med en pensionerad fråga fortsätter som vanligt. V5 ingår inte.
 */
export const TRANINGSBANK: readonly TraningsFraga[] = HELA_BANKEN.filter((q) => valbarI(q, BANK_VERSION));

const PER_ID = new Map(HELA_BANKEN.map((q) => [q.id, q]));
const VALBARA_ID = new Set(TRANINGSBANK.map((q) => q.id));

/**
 * Frågan ur hela banken, pensionerade inräknade: en session som redan har
 * frågan ska kunna visa och rätta den.
 */
export function hittaTraningsfraga(id: string): TraningsFraga | undefined {
  return PER_ID.get(id);
}

/** Finns frågan bland dem motorn får välja (TRANINGSBANK)? */
export function arValbarTraningsfraga(id: string): boolean {
  return VALBARA_ID.has(id);
}

export function familjFor(q: { family?: unknown }): string | null {
  return lasFamilj(q.family);
}

export function priorFor(q: { svarighet_prior?: unknown; difficulty?: unknown }): Prior {
  return svarighetPrior(q.svarighet_prior ?? q.difficulty);
}

/** Misstaget för ett valt alternativ (originalindex), eller null. */
export function misstagFor(q: { misstag?: unknown; options: readonly unknown[] }, original: number): string | null {
  const m = q.misstag;
  if (!Array.isArray(m) || m.length !== q.options.length) return null;
  const t = m[original];
  return typeof t === 'string' && t.trim().length > 0 ? t.trim() : null;
}

/**
 * Primitivgruppen ur första cellen (samma tabell som PRIMITIV i
 * scripts/lib/matris/celler.mjs). Passets exponeringsregel: högst två frågor
 * per primitiv och pass (tillägget om variation 2.1 punkt 3).
 */
const PRIMITIV: Record<string, string> = {
  vector: 'pil', orbital: 'orbital', ray: 'stralar', sectorwheel: 'sektorhjul', tile: 'block3x3', lattice: 'ruta2x2',
  stack: 'grundform', poly: 'grundform', ring: 'ringar', balanceline: 'balanslinje', tally: 'rakning', dotsorbit: 'orbital',
};
export function primitivFor(q: { grid: unknown }): string {
  const c = (q.grid as unknown[][])?.[0]?.[0] as { kind?: string } | unknown[] | null | undefined;
  if (!c || Array.isArray(c)) return 'lager';
  return PRIMITIV[c.kind ?? ''] ?? c.kind ?? 'okand';
}

/** Bankens frågor med p ur statistiken (30 svar) eller priorn. */
export function bankInfo(statistik?: ReadonlyMap<string, FragaStatistik>): BankFragaInfo[] {
  return TRANINGSBANK.map((q) => {
    const prior = priorFor(q);
    const family = familjFor(q);
    return {
      id: q.id,
      prior,
      p: pForFraga(prior, statistik?.get(q.id), q.p_prior as number | null | undefined),
      family,
      kalla: q.kalla,
      // Frågor utan recept räknas som recept = family (tillägget 2.1 punkt 2).
      recept: typeof q.recept === 'string' && q.recept ? q.recept : family,
      primitiv: primitivFor(q),
    };
  });
}

/** Familjerna banken har, med antal frågor. Tom tills våg 3c fyllt i fältet. */
export function bankensFamiljer(): { family: string; antal: number }[] {
  const m = new Map<string, number>();
  for (const q of TRANINGSBANK) {
    const f = familjFor(q);
    if (f) m.set(f, (m.get(f) ?? 0) + 1);
  }
  return [...m.entries()]
    .map(([family, antal]) => ({ family, antal }))
    .sort((a, b) => a.family.localeCompare(b.family, 'sv'));
}
