// src/lib/deduktivV1/types.ts
// =============================================================================
// Deduktiv slutledning (beställningen omgång 3, B1). Tre uppgiftstyper:
//   D1 premisskedja (grund): premisser, "Vad måste gälla?", fyra alternativ.
//   D2 schemapussel (grund, avancerad): personer eller saker på plats 1 till n,
//      villkor, en fråga, fem alternativ.
//   D3 villkor i rörelse (expert): som D2 plus ett antagande i frågan.
// Uppgifterna byggs av scripts/gen-deduktiv.mjs (lösare, spärrar DD1 till DD5).
// Ren typfil, får importeras från klienten.
// =============================================================================

export type DeduktivNiva = 'grund' | 'avancerad' | 'expert';
export type DeduktivTyp = 'D1' | 'D2' | 'D3';
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
  | 'rorelse';

export interface DeduktivFraga {
  /** dd-<g|a|e>-<d1|d2|d3>-<nn> */
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
  /** Lösarens form (visas aldrig). */
  formell?: unknown;
  fran_version: 1;
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
}
