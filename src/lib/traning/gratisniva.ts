// src/lib/traning/gratisniva.ts
// =============================================================================
// Vad som ingår utan paket i Rekryteringstester (spec-rummen avsnitt 17.2).
//
// ÄGARENS BESLUT 2026-10-11. Ersätter rekommendationen i beslut 6 och 14.9.
// Gratis är smakprovet (anonymt, fem frågor), nivåmätningen en gång per konto
// med full genomgång och ett grundpass samma dag som mätningen (dag 0).
// Därefter betalvägg på allt: dagens pass, riktade pass, ommätning, kurvans
// historik, provläget och generalrepetitionen ingår i Hela paketet. Resultat
// och genomgång av det man redan gjort är alltid öppna.
//
// Läses av sessionGate (featureForTestType), quotaService
// (DAILY_LIMIT_TEST_SESSIONS), tillgang.ts (passens gate), plan.ts (låsta
// dagar) och, från våg 2/3b, getTraningSummary och PaywallCard.
// Ändra ett värde, inget annat.
// =============================================================================

export const GRATISNIVA = {
  /** Grundpass (frågor under din nivå ur grundbanken) per dag utan paket. Med grundpassVarjeDag false gäller det bara dag 0. */
  grundpassPerDag: 1,
  /**
   * Grundpasset gratis varje dag. false = bara den första träningsdagen
   * (mätningens dag, dag 0); från dag 1 kräver passet Hela paketet (17.2).
   */
  grundpassVarjeDag: false,
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
