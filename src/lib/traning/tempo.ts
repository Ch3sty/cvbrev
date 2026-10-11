// src/lib/traning/tempo.ts
// =============================================================================
// Provformaten och tempot (spec-rummen 6 våg 3a och 3c, briefen avsnitt 8).
//
// Formaten står med "cirka" tills testansvarig verifierat dem mot
// leverantörernas sidor (spec 10.5). Matrigma klassisk 35 på 40 minuter är
// en tredjepartsuppgift och flaggad nedan. Texterna säger alltid "samma
// format som", aldrig "samma test".
//
// Tempot: huvudtalet är "antal över provets tid" på frågor nära nivån
// (|p − p_nivå| ≤ 0,15), snittet är undertext. Utan budget är en fråga
// långsam när den tog över 1,5 × medianen för frågor med samma svårighet.
// =============================================================================

import { TRANING_COPY } from './copy';
import { arNaraNivan, type Prior } from './svarighet';

export type Leverantor = 'matrigma' | 'alva' | 'shl' | 'aon' | 'annat';
export type Variant = 'klassisk' | 'adaptiv';

export type FormatNyckel =
  | 'matrigma_klassisk'
  | 'matrigma_adaptiv'
  | 'alva'
  | 'shl'
  | 'aon'
  | 'eget';

export interface Provformat {
  nyckel: FormatNyckel;
  /** Leverantören formatet efterliknar, null för vårt eget provläge. */
  leverantor: Exclude<Leverantor, 'annat'> | null;
  /** Namnet som får stå efter "samma format som". Null för vårt eget. */
  namn: string | null;
  /** Antal uppgifter i provet. */
  antal: number;
  /** Total tid i minuter. */
  minuter: number;
  /** Provets tid per uppgift i sekunder, nedåt till hela sekunder. */
  budget_s: number;
  /** Adaptivt (simuleras med mätningens tre band) eller fast. */
  adaptiv: boolean;
  /** Står med "cirka" i texten tills testansvarig verifierat siffrorna. */
  cirka: boolean;
  /** Verifierat av testansvarig (spec 10.5). Tills dess står formatet med "cirka". */
  verifierad: boolean;
  /** Var siffrorna kommer ifrån. */
  kalla: string;
  /**
   * Total tid för provet, eller en tidsgräns per uppgift (Alva). Med
   * per_uppgift går passet vidare när uppgiftens tid är ute (spec 14.4).
   */
  tidsform: 'total' | 'per_uppgift';
  /**
   * En mening under formatet när provet inte bara är matriser eller har en
   * annan uppgiftstyp (spec 14.4). Texten bor i copy.ts. Null för övriga.
   */
  anmarkning: string | null;
}

function budget(minuter: number, antal: number): number {
  return Math.floor((minuter * 60) / antal);
}

export const PROVFORMAT: Readonly<Record<FormatNyckel, Provformat>> = {
  matrigma_klassisk: {
    nyckel: 'matrigma_klassisk',
    leverantor: 'matrigma',
    namn: 'Matrigma',
    antal: 35,
    minuter: 40,
    budget_s: budget(40, 35), // 68
    adaptiv: false,
    cirka: true,
    verifierad: false,
    // FLAGGAD: tredjepartsuppgift (briefen avsnitt 2), inte Assessios egen sida.
    kalla: 'tredjepart',
    tidsform: 'total',
    anmarkning: null,
  },
  matrigma_adaptiv: {
    nyckel: 'matrigma_adaptiv',
    leverantor: 'matrigma',
    namn: 'Matrigma',
    // Briefen: "Adaptiv Matrigma cirka 12 min". Antalet är en simulering
    // (mätningens tolv frågor i tre band) och står med "cirka" tills
    // testansvarig verifierat det (3c). FLAGGAD.
    antal: 12,
    minuter: 12,
    // Spec 14.4: 12 minuter på 12 uppgifter, så att tidsraden säger 1:00.
    budget_s: 60,
    adaptiv: true,
    cirka: true,
    verifierad: false,
    kalla: 'tredjepart',
    tidsform: 'total',
    anmarkning: null,
  },
  alva: {
    nyckel: 'alva',
    leverantor: 'alva',
    namn: 'Alva Logic',
    antal: 20,
    // Övre gräns för tidsgrans_s; tiden gäller per uppgift (tidsform).
    minuter: 40,
    budget_s: 120,
    adaptiv: true,
    cirka: true,
    verifierad: false,
    kalla: 'leverantorens sida enligt briefen 2026-10-10',
    tidsform: 'per_uppgift',
    anmarkning: null,
  },
  shl: {
    nyckel: 'shl',
    leverantor: 'shl',
    namn: 'SHL Verify',
    // Spec 14.4: SHL Verify G+ blandar siffror, slutledning och figurer.
    // Provläget övar figurdelen: 18 uppgifter på 25 minuter.
    antal: 18,
    minuter: 25,
    budget_s: 90,
    adaptiv: false,
    cirka: true,
    verifierad: false,
    kalla: 'leverantorens sida enligt briefen 2026-10-10',
    tidsform: 'total',
    anmarkning: TRANING_COPY.format.anmarkning.shl,
  },
  aon: {
    nyckel: 'aon',
    leverantor: 'aon',
    namn: 'Aon scales ix',
    antal: 20,
    minuter: 5,
    budget_s: budget(5, 20), // 15
    adaptiv: false,
    cirka: true,
    verifierad: false,
    kalla: 'leverantorens sida enligt briefen 2026-10-10',
    tidsform: 'total',
    anmarkning: TRANING_COPY.format.anmarkning.aon,
  },
  eget: {
    nyckel: 'eget',
    leverantor: null,
    namn: null,
    antal: 18,
    minuter: 25,
    budget_s: budget(25, 18), // 83
    adaptiv: false,
    cirka: false,
    verifierad: true,
    kalla: 'eget',
    tidsform: 'total',
    anmarkning: null,
  },
};

/** Formatet för planens leverantör och variant. "Vet inte" och Annat ger vårt eget. */
export function formatForPlan(
  leverantor: Leverantor | string | null | undefined,
  variant?: Variant | string | null
): Provformat {
  switch (leverantor) {
    case 'matrigma':
      // "Vet inte" på Matrigma-varianten: klassisk ("Det täcker båda formaten").
      return variant === 'adaptiv' ? PROVFORMAT.matrigma_adaptiv : PROVFORMAT.matrigma_klassisk;
    case 'alva':
      return PROVFORMAT.alva;
    case 'shl':
      return PROVFORMAT.shl;
    case 'aon':
      return PROVFORMAT.aon;
    default:
      return PROVFORMAT.eget;
  }
}

/** Provets tid per uppgift för planen. */
export function tempobudget(leverantor?: string | null, variant?: string | null): number {
  return formatForPlan(leverantor, variant).budget_s;
}

/**
 * "35 uppgifter, 40 minuter", eller "20 uppgifter, 2 minuter per uppgift"
 * för per_uppgift, med "cirka" före när siffrorna inte är verifierade.
 */
export function formatText(f: Provformat): string {
  const tid =
    f.tidsform === 'per_uppgift'
      ? `${Math.round(f.budget_s / 60)} minuter per uppgift`
      : `${f.minuter} minuter`;
  const text = `${f.antal} uppgifter, ${tid}`;
  return f.cirka ? `cirka ${text}` : text;
}

/* ---------------------------------- Tempo --------------------------------- */

export interface TempoSvar {
  p: number;
  /** Sekunder på frågan. */
  tid_s: number;
  correct: boolean;
  /** Svårigheten, för medianen när budget saknas. */
  prior?: Prior;
}

export interface Tempo {
  /** Antal frågor nära nivån som tog längre än provets tid. Huvudtalet. */
  over_tid: number;
  /** Antal frågor nära nivån (nämnaren: "2 av 9 över provets tid"). */
  antal_nara: number;
  /** Snittid i hela sekunder på frågorna nära nivån. Null utan sådana. */
  snitt_s: number | null;
  /** Index (i svarslistan) för de långsamma frågorna nära nivån. */
  langsamma: number[];
  budget_s: number | null;
}

export function median(tal: readonly number[]): number | null {
  if (tal.length === 0) return null;
  const s = [...tal].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Är frågan långsam? Över budget, eller över 1,5 × medianen när budget saknas. */
export function arLangsam(
  tid_s: number,
  budget_s: number | null,
  medianForSvarighet?: number | null
): boolean {
  if (budget_s != null && budget_s > 0) return tid_s > budget_s;
  if (medianForSvarighet != null && medianForSvarighet > 0) return tid_s > 1.5 * medianForSvarighet;
  return false;
}

/**
 * Tempot för ett pass eller en mätning. Utan nivå (ingen mätning gjord)
 * räknas alla frågor som nära.
 */
export function raknaTempo(
  svar: readonly TempoSvar[],
  niva: number | null,
  budget_s: number | null,
  medianer?: Partial<Record<Prior, number>>
): Tempo {
  const nara = svar
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => niva == null || arNaraNivan(s.p, niva));
  const langsamma = nara
    .filter(({ s }) => arLangsam(s.tid_s, budget_s, s.prior ? medianer?.[s.prior] : null))
    .map(({ i }) => i);
  const snitt =
    nara.length > 0 ? Math.round(nara.reduce((sum, { s }) => sum + s.tid_s, 0) / nara.length) : null;
  return {
    over_tid: langsamma.length,
    antal_nara: nara.length,
    snitt_s: snitt,
    langsamma,
    budget_s,
  };
}
