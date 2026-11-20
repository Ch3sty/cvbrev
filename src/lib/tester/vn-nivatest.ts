// src/lib/tester/vn-nivatest.ts
// =============================================================================
// Nivåtestens klientform för Ord och text och Siffror och tabeller
// (plan-testflode-2026-11-20 etapp 2): uppgifterna levereras från servern,
// utan facit, så att frågebankerna lämnar klientpaketet. Urvalet är samma
// seedade urval som testvyn gjorde i klienten (selectPassagesForSession med
// sessionens id och underlagsversion), bara flyttat till servern.
//
// Ren typfil plus små rena hjälpare, går att importera från klienten.
// =============================================================================

export type VnTestKind = 'verbal' | 'numerisk';

/** Ett underlag: texten, argumentet eller tabellen och diagrammet. */
export interface VnVisatUnderlag {
  id: string;
  typ: 'text' | 'argument' | 'siffror';
  titel: string;
  amne: string | null;
  /** Texten (verbalt) eller argumentet (verbalt expert). */
  text?: string;
  /** Numeriskt: inledningen, tabellen och diagrammet. */
  kontext?: string | null;
  tabell?: { headers: string[]; rows: (string | number)[][]; caption?: string; highlightLastRow?: boolean } | null;
  diagram?: unknown | null;
}

/** En uppgift: ett påstående eller en fråga, utan facit. */
export interface VnVisadUppgift {
  /** Verbalt "passageId:index", annars frågans id. */
  nyckel: string;
  /** Underlagets id (passageId i POST-kroppen). */
  del: string;
  /** Verbalt: påståendets index som text. Annars frågans id. */
  punkt: string;
  text: string;
  /** Verbalt: true, false, cannot_say. Annars alternativen i sessionens ordning. */
  alternativ: { id: string; text: string }[];
  form: 'tre' | 'rader';
  /** Ettbaserat nummer i underlaget och antal i underlaget. */
  iDel: number;
  delAntal: number;
}

export interface VnNivatestInnehall {
  underlag: Record<string, VnVisatUnderlag>;
  uppgifter: VnVisadUppgift[];
}

/** En uppgift i genomgången: rätt svar och förklaringen, och hennes svar. */
export interface VnGenomgangPunkt {
  nyckel: string;
  ratt: string;
  forklaring: string | null;
  valt: string | null;
  tid_s: number | null;
}

export interface VnNivatestGenomgang extends VnNivatestInnehall {
  punkter: VnGenomgangPunkt[];
}

/** Verbalt svarar sant, falskt eller går inte att avgöra, i den ordningen. */
export const VN_TRE = [
  { id: 'true', text: 'Sant' },
  { id: 'false', text: 'Falskt' },
  { id: 'cannot_say', text: 'Går inte att avgöra' },
] as const;

interface SparatSvar {
  passageId?: unknown;
  statementIndex?: unknown;
  answer?: unknown;
  questionId?: unknown;
  q_id?: unknown;
  selectedAnswerId?: unknown;
  selected?: unknown;
  timeSpent?: unknown;
  time_spent?: unknown;
}

/**
 * Hennes sparade svar per uppgiftsnyckel, i svarsvärdets form (true/false/
 * cannot_say eller alternativets id). Sista svaret vinner.
 */
export function sparadeVnSvar(answers: unknown, uppgifter: readonly VnVisadUppgift[]): Map<string, { varde: string; tid_s: number | null }> {
  const ut = new Map<string, { varde: string; tid_s: number | null }>();
  const lista = Array.isArray(answers) ? (answers as SparatSvar[]) : [];
  const nycklar = new Set(uppgifter.map((u) => u.nyckel));
  for (const a of lista) {
    if (!a || typeof a !== 'object') continue;
    const tid = typeof a.timeSpent === 'number' ? a.timeSpent : typeof a.time_spent === 'number' ? a.time_spent : null;
    if (typeof a.passageId === 'string' && typeof a.statementIndex === 'number' && typeof a.answer === 'string') {
      const k = `${a.passageId}:${a.statementIndex}`;
      if (nycklar.has(k)) ut.set(k, { varde: a.answer, tid_s: tid });
      continue;
    }
    const q = typeof a.questionId === 'string' ? a.questionId : typeof a.q_id === 'string' ? a.q_id : null;
    const v = typeof a.selectedAnswerId === 'string' ? a.selectedAnswerId : typeof a.selected === 'string' ? a.selected : null;
    if (q && v && nycklar.has(q)) ut.set(q, { varde: v, tid_s: tid });
  }
  return ut;
}

/** Svarsvärdet till visat index, null när det saknas. */
export function vnIndex(u: VnVisadUppgift, varde: string | null | undefined): number | null {
  if (varde == null) return null;
  const i = u.alternativ.findIndex((a) => a.id === varde);
  return i < 0 ? null : i;
}
