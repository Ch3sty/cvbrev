// src/lib/deduktivV1/types.ts
// =============================================================================
// Deduktiv slutledning (beställningen omgång 3, B1). Tre uppgiftstyper:
//   D1 premisskedja (grund): premisser, "Vad måste gälla?", fyra alternativ.
//   D2 schemapussel (grund, avancerad): personer eller saker på plats 1 till n,
//      villkor, en fråga, fem alternativ.
//   D3 villkor i rörelse (expert): som D2 plus ett antagande i frågan.
//   D4 nya familjer (alla nivåer, bankversion 5): villkorskedjor med om och
//      så, syllogismer, sanningssägare och lögnare, tabellpussel och
//      schemapussel med flera lösningar. Fem alternativ, ingen remsa.
// Uppgifterna byggs av scripts/gen-deduktiv.mjs (lösare, spärrar DD1 till DD5).
// Ren typfil, får importeras från klienten.
// =============================================================================

export type DeduktivNiva = 'grund' | 'avancerad' | 'expert';
export type DeduktivTyp = 'D1' | 'D2' | 'D3' | 'D4';
export type DeduktivFamilj =
  | 'premiss'
  | 'plats'
  | 'inte_plats'
  | 'granne'
  | 'inte_granne'
  | 'vanster_om'
  | 'direkt_vanster_om'
  | 'ordning'
  | 'samma_grupp'
  | 'rorelse'
  | 'om_sa'
  | 'kvantor'
  | 'sanning'
  | 'tabell'
  | 'kan_inte';

export interface DeduktivFraga {
  /** dd-<g|a|e>-<d1|d2|d3|d4>-<nn>, från omgång 2 (version 4) även tre siffror */
  id: string;
  niva: DeduktivNiva;
  typ: DeduktivTyp;
  family: DeduktivFamilj;
  difficulty: number;
  p_prior: number;
  /** Raden som sätter scenen (D2, D3); null för D1. */
  intro: string | null;
  /** Villkoren eller premisserna, i den ordning de visas. */
  villkor: string[];
  fraga: string;
  options: string[];
  correctAnswer: number;
  /** En etikett per alternativ i genomgången (copy 4.3), på originalindex. */
  etiketter: string[];
  /** Misstaget per alternativ (deduktiv-spec 2.3), tomt för facit. */
  misstag: string[];
  /** Lösningsgången och remsan ur lösaren (DD5, DV1). */
  losning: DeduktivLosning;
  /**
   * Lösarens form (visas aldrig). Från omgång 3 kan den bära korta namn på
   * leden för gränssnittet, se DeduktivLedNamn.
   */
  formell?: unknown;
  fran_version: 1 | 2 | 3 | 4 | 5;
  /** Bankversionen uppgiften pensioneras från (DD7, DD8); gamla sessioner läser den ändå. */
  pensionerad_fran?: 2 | 4;
  /** Lösningstexten är omskriven av testansvarig och får avvika från lösarens ordalydelse. */
  losning_granskad?: true;
  /** Den pensionerade uppgift som den här lagade kopian ersätter. */
  ersatter?: string;
}

/**
 * Valfria namn på leden i premisskedjor, i `formell` (omgång 3): `termnamn`
 * per term-id i `formell.termer` (D1 och D4 kvantor), `atomnamn` per atom i
 * `formell.atomer` (D4 om_sa), i jakande form. Högst fyra ord, orden står i
 * premisserna (böjning tillåten). Kontrolleras av scripts/lib/facit-kontroll.mjs.
 */
export interface DeduktivLedNamn {
  termnamn?: Record<string, string>;
  atomnamn?: string[];
}

/** Ett steg i lösningsgången: villkorens nummer i märket ('Om' för antagandet), villkoren ordagrant och följden. */
export interface DeduktivSteg {
  markor: (number | 'Om' | 'Kvar')[];
  villkor: string[];
  foljd: string;
}

/** Remsan: namnen per plats (flera när platsen är öppen), kopparns och antagandets plats (1-indexerade). */
export interface DeduktivSchema {
  namn: string[][];
  koppar: number | null;
  antagande: number | null;
}

export interface DeduktivLosning {
  steg: DeduktivSteg[];
  /** Null för D1: premisskedjan har ingen remsa. */
  schema: DeduktivSchema | null;
}

/** Uppgiften under testet: alternativen i visad ordning, utan facit. */
export interface VisadDeduktiv {
  id: string;
  difficulty: number;
  intro: string | null;
  villkor: string[];
  fraga: string;
  options: string[];
  /** Antal platser när uppgiften har en remsa (D2, D3), annars null. Remsan ritas tom i uppgiften (omgång 2, B1). */
  platser?: number | null;
  /** Villkorens form för bilderna och kladdytorna (omgång 3, steg 2b), utan alternativ och roller. Se struktur.ts. */
  struktur?: import('./struktur').DeduktivStruktur | null;
}

/** Uppgiften i genomgången: visad ordning, rätt svar, etiketterna och lösningsgången. */
export interface GenomgangDeduktiv extends VisadDeduktiv {
  typ: DeduktivTyp;
  family: DeduktivFamilj;
  rattVisat: number;
  /** Etiketten per visat index. */
  etiketter: string[];
  /** Misstaget per visat index, tomt för facit. */
  misstag: string[];
  losning: DeduktivLosning;
  /** Kedjans namn på leden (omgång 3, steg 2b), bara med facit. */
  ledNamn?: DeduktivLedNamn | null;
}
