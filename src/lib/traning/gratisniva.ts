// src/lib/traning/gratisniva.ts
// =============================================================================
// Vad som ingår utan paket i Testträningen (spec-rummen avsnitt 0, beslut 6).
//
// DAGENS REKOMMENDATION, INTE ETT BESLUT. Vad som är gratis är en produkt- och
// prisfråga som ägaren bekräftar före release av våg 3. Värdena nedan är
// art-directors och testansvarigs rekommendation 2026-10-10: ett grundpass om
// dagen gratis varje dag, mätningen gratis en gång, resultat och genomgång
// alltid öppna; passet på din nivå, riktade pass, ommätning, kurvans historik,
// provläget och generalrepetitionen ingår i Hela paketet.
//
// Läses av sessionGate (featureForTestType), quotaService
// (DAILY_LIMIT_TEST_SESSIONS), tillgang.ts (passens gate), plan.ts (låsta
// dagar) och, från våg 2/3b, getTraningSummary och PaywallCard.
// Ändra ett värde, inget annat. Ska dag 2 låsas: sätt grundpassVarjeDag till
// false (då ritas bara 1f och W3 om, beslut 6).
// =============================================================================

export const GRATISNIVA = {
  /** Grundpass (frågor under din nivå ur grundbanken) per dag utan paket. */
  grundpassPerDag: 1,
  /**
   * Grundpasset gratis varje dag. false = bara den första träningsdagen
   * (mätningens dag); från dag 2 kräver passet Hela paketet.
   */
  grundpassVarjeDag: true,
  /** Nivåmätningen, en gång. */
  matningGratis: true,
  /** Ommätningen var sjunde dag. */
  ommatningGratis: false,
  /** Resultat och genomgång efter varje pass. Ska alltid vara true (briefen avsnitt 7). */
  genomgangGratis: true,
  /** Kurvans historik (mer än senaste punkten). */
  kurvaHistorikGratis: false,
  /** Provläget och generalrepetitionen i leverantörens format. */
  provlageGratis: false,
  /** Riktade pass per mönsterfamilj. */
  riktadePassGratis: false,
} as const;

export type Gratisniva = typeof GRATISNIVA;

/** För tester: samma form med andra värden. */
export type GratisnivaInstallning = { [K in keyof Gratisniva]: Gratisniva[K] extends boolean ? boolean : number };
