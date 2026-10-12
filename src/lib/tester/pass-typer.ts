// src/lib/tester/pass-typer.ts
// =============================================================================
// Passformen för verbalt och numeriskt (beställning omgång 2, B2 och B3):
// textpasset och sifferpasset, ett underlag och fyra uppgifter per pass, och
// riktade pass per påståendetyp och misstagstyp. Typerna och konstanterna
// här är rena och får importeras av klienten; motorn bor i pass.server.ts.
//
// Passen ligger i logic_test_v4_sessions med egna test_type och utan
// meta.traning, så matrismotorns nivå, kurva och sträckregel aldrig läser
// dem. Dagsringen, serien och Första veckan räknar dem (motor.server.ts,
// andraPass).
// =============================================================================

export type VnKind = 'verbal' | 'numerisk';
export type VnPassTyp = 'pass' | 'riktat';
export type VnNiva = 'grund' | 'avancerad';

export const VN_PASS_TEST_TYPE: Readonly<Record<VnKind, Record<VnPassTyp, string>>> = {
  verbal: { pass: 'verbal-pass', riktat: 'verbal-riktat' },
  numerisk: { pass: 'numerisk-pass', riktat: 'numerisk-riktat' },
};

export const VN_PASS_TEST_TYPER = ['verbal-pass', 'verbal-riktat', 'numerisk-pass', 'numerisk-riktat'] as const;

export function arVnPassTestTyp(t: unknown): boolean {
  return typeof t === 'string' && (VN_PASS_TEST_TYPER as readonly string[]).includes(t);
}

export function kindForTestTyp(t: string | null | undefined): VnKind | null {
  if (t === 'verbal-pass' || t === 'verbal-riktat') return 'verbal';
  if (t === 'numerisk-pass' || t === 'numerisk-riktat') return 'numerisk';
  return null;
}

/** Tid per text eller underlag (B2): cirka tre respektive fem minuter. */
export const VN_BUDGET_S: Readonly<Record<VnKind, number>> = { verbal: 150, numerisk: 300 };

/** Uppgifter per pass: fyra påståenden eller fyra frågor. */
export const VN_ANTAL = 4;

/** Samma text eller underlag visas inte igen inom så många dagar (B2, exponering). */
export const VN_KARENS_DAGAR = 30;

/** Riktat pass visas när minst så många osedda underlag med typen finns inom nivån (B2). */
export const VN_RIKTAT_MINST_OSEDDA = 3;

/**
 * Minsta antal uppgifter av typen i ett underlag för att det ska räknas till
 * typens riktade pass. Beställningen säger två av fyra. Verbala parti 01 till
 * 03 har exakt ett påstående av varje typ per text och de frysta saknar typ,
 * så med två finns inget riktat textpass alls. Testansvarigs beslut
 * 2026-10-12: ett för verbalt, det typade påståendet först i passet
 * (pass-bank klientform); ett parti 04 med två av samma typ beställs senare.
 * Numeriskt följer beställningen.
 */
export const VN_MINST_AV_TYP: Readonly<Record<VnKind, number>> = { verbal: 1, numerisk: 2 };

/** Familjerna (påståendetyp och misstagstyp) som kan bli riktade pass. */
export const VN_FAMILJER: Readonly<Record<VnKind, readonly string[]>> = {
  verbal: ['direkt', 'slutledning', 'kvantor', 'utanfor'],
  numerisk: ['fel_rad', 'fel_kolumn', 'steg_saknas', 'fel_enhet', 'fel_bas'],
};

export function arVnFamilj(kind: VnKind, f: unknown): f is string {
  return typeof f === 'string' && VN_FAMILJER[kind].includes(f);
}

/** Verbalt svarar sant, falskt eller går inte att avgöra, i den ordningen. */
export const VERBALA_SVAR = ['true', 'false', 'cannot_say'] as const;
export type VerbaltSvar = (typeof VERBALA_SVAR)[number];

export interface VnPunkt {
  /** "underlagsId:index" för verbalt, frågans id för numeriskt. */
  nyckel: string;
  text: string;
  /** Verbalt: de tre svaren. Numeriskt: alternativen i sessionens blandade ordning. */
  alternativ: { id: string; text: string }[];
}

export interface VnTabell {
  headers: string[];
  rows: (string | number)[][];
  caption?: string;
  highlightLastRow?: boolean;
}

export interface VnUnderlag {
  id: string;
  titel: string;
  amne: string | null;
  /** Verbalt: texten. */
  text?: string;
  /** Numeriskt: inledningen, tabellen eller diagrammet. */
  kontext?: string;
  tabell?: VnTabell | null;
  diagram?: unknown | null;
}

export interface VnAterkoppling {
  correct: boolean;
  /** Rätt svar: verbalt true/false/cannot_say, numeriskt alternativets id. */
  ratt: string;
  forklaring: string | null;
}

export interface VnTappad {
  familj: string;
  ratt: number;
  antal: number;
  andel: number;
  /** Riktat pass finns för typen (minst tre osedda underlag). */
  riktat: boolean;
}

export interface VnResultat {
  ratt: number;
  antal: number;
  /** Summan av tiden på uppgifterna, sekunder. */
  tid_s: number;
  budget_s: number;
  /** Typerna hon tappade i, ackumulerat över passen av samma slag, svagast först. */
  tappade: VnTappad[];
}

export interface VnPassVy {
  id: string;
  typ: VnPassTyp;
  kind: VnKind;
  niva: VnNiva;
  familj: string | null;
  upprepad: boolean;
  budget_s: number;
  startad: string;
  avslutad: boolean;
  /** Avancerad sitter: raden "Expertnivån: gör nivåtestet". */
  expertRad: boolean;
  underlag: VnUnderlag;
  punkter: VnPunkt[];
  besvarade: Record<string, { svar: string; tid_s: number }>;
  aterkoppling: Record<string, VnAterkoppling>;
  resultat: VnResultat | null;
}
