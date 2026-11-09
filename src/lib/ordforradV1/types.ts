// src/lib/ordforradV1/types.ts
// =============================================================================
// Ordförråd (kind 'ordforrad', brief-tester-steg2-2026-11-09.md avsnitt 4):
// synonymer och motsatsord. Ett ord i versaler (vyn sätter versalerna) och fem
// alternativ. En kuraterad bank, inte en generator: Gemini föreslår, varje
// facit är verifierat mot Svensk ordbok eller SAOL (fältet `kalla`) och
// spärrarna OF1 till OF8 håller (scripts/validate-ordforrad.mjs).
// Ren typfil.
// =============================================================================

export type OrdNiva = 'grund' | 'avancerad' | 'expert';
export type OrdTyp = 'synonym' | 'antonym';

/** Distraktorns typ, styr misstagstexten. Tom för facit. */
export type OrdDistraktor = '' | 'samma_falt' | 'nara' | 'antonym' | 'synonym' | 'falsk_van' | 'annan';

export interface OrdKalla {
  /** "SO", "SAOL", "SO och Wiktionary" och så vidare. */
  verifierad_mot: string;
  /** Beläggen i klartext, till exempel "SO generös: synonym frikostig". */
  belagg: string[];
  /** SO:s lemma-id för uppslagsordet. */
  so_id: string | null;
  /** Dagen beläggen hämtades. */
  hamtad: string;
}

export interface OrdFraga {
  /** of-<g|a|e>-<s|m>-<nn> (s synonym, m motsatsord) */
  id: string;
  niva: OrdNiva;
  typ: OrdTyp;
  /** Uppslagsordet i gemener; vyn visar det i versaler. */
  ord: string;
  ordklass: 'substantiv' | 'verb' | 'adjektiv' | 'adverb';
  /** Fem alternativ i gemener, ordning före sessionens blandning. */
  options: string[];
  correctAnswer: number;
  typer: OrdDistraktor[];
  /** Misstagstext per alternativ (SO:s definition av distraktorn), tom för facit. */
  misstag: string[];
  /** SO:s definition av facit, till genomgången. */
  facit_betyder: string;
  /** En mening med uppslagsordet, till genomgången. */
  exempel: string;
  kalla: OrdKalla;
  /** SO:s popularitetstal för uppslagsordet (frekvensbandet). */
  popularitet: number;
  /** Granskningsfälten för OF2, OF3 och OF6. */
  granskning: { of2_ordklass: string; of3_parvis: string; of6_stil: string; kandidat_fran: string };
  fran_version: 1;
  pensionerad_fran?: number;
}

/** Uppgiften under testet: alternativen i visad ordning, utan facit. */
export interface VisadOrd {
  id: string;
  typ: OrdTyp;
  ord: string;
  options: string[];
}

/** Uppgiften i genomgången. */
export interface GenomgangOrd extends VisadOrd {
  rattVisat: number;
  misstag: string[];
  facit_betyder: string;
  exempel: string;
  /** Per visat alternativ: sant när distraktorn är motsatsen (raden "det är motsatsen", OF8). */
  arMotsats: boolean[];
}
