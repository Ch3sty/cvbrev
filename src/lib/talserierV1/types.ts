// src/lib/talserierV1/types.ts
// =============================================================================
// Talseriernas uppgifter (brief-tester-steg2-2026-11-09.md avsnitt 3). En rad
// tal och en lucka sist (grund) eller två luckor sist (avancerad och expert,
// I-provets form). Fem alternativ, sorterade stigande på första talet, så att
// listan läses som en tallinje. Alternativen blandas inte.
//
// Bankerna genereras av scripts/gen-talserier.mjs och kontrolleras av
// scripts/validate-talserier.mjs (TS1 till TS10). Ren typfil.
// =============================================================================

export type TalserieNiva = 'grund' | 'avancerad' | 'expert';

/** De åtta regelfamiljerna. */
export type TalserieFamilj =
  | 'aritmetisk'
  | 'geometrisk'
  | 'andra_ordningen'
  | 'vaxelvis'
  | 'varvad'
  | 'geodiff'
  | 'affin'
  | 'summa';

/**
 * Den dolda regeln ritad i genomgången: en båge från talen i `fran` till
 * talet `till` (index i raden där luckorna räknas in), med en kort etikett
 * som "+5", "×2" eller "summa". Varvade serier har `serie` 0 eller 1, så att
 * vyn kan färga varannan ruta (skissens beslut 6).
 */
export interface TalserieBage {
  fran: number[];
  till: number;
  text: string;
  serie?: 0 | 1;
}

export interface TalserieFraga {
  /** ts-<g|a|e>-<familj>-<nn> */
  id: string;
  niva: TalserieNiva;
  family: TalserieFamilj;
  /** Generatorns parametrar (visas aldrig, används av TS8 och för att återskapa raden). */
  params: Record<string, unknown>;
  difficulty: 1 | 2 | 3 | 4;
  p_prior: number;
  /** Regeln utan startvärde (TS8: samma regel högst två gånger per nivå). */
  regelnyckel: string;
  /** Regeln i klartext, ordagrant i genomgången. */
  regel: string;
  /** De visade talen, fem eller sex. */
  visade: number[];
  luckor: 1 | 2;
  /** Fem alternativ; varje alternativ har `luckor` tal (vänster lucka först). Sorterade stigande. */
  options: number[][];
  correctAnswer: number;
  /** Feltyp per alternativ, tom för facit. ['ratt', typ] betyder rätt första tal och fel andra. */
  typer: string[][];
  /** Misstagstext per alternativ, tom för facit. */
  misstag: string[];
  bagar: TalserieBage[];
  /** Bankversionen uppgiften kom med. */
  fran_version: 1;
  /** Väljs aldrig till nya sessioner från den här talserie_version. */
  pensionerad_fran?: number;
}

/** Uppgiften under testet: utan facit, regel och misstag. */
export interface VisadTalserie {
  id: string;
  difficulty: number;
  visade: number[];
  luckor: 1 | 2;
  options: number[][];
}

/** Uppgiften i genomgången. */
export interface GenomgangTalserie extends VisadTalserie {
  family: TalserieFamilj;
  regel: string;
  bagar: TalserieBage[];
  rattVisat: number;
  misstag: string[];
}
