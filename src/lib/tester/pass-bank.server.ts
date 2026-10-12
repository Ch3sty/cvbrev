// src/lib/tester/pass-bank.server.ts
// =============================================================================
// Banken bakom text- och sifferpassen: poolerna per nivå i
// underlagsversionen, uppslaget över alla versioner, familjerna per underlag
// och klientens form utan facit. Bara servern: bankerna och facit ska inte
// ligga i klientpaketet.
// =============================================================================

import 'server-only';
import { POOL_V4 as VERBAL_GRUND } from '@/lib/verbalTestV1/selectPassages.v1';
import { POOL_V4 as VERBAL_AVANCERAD } from '@/lib/verbalTestV2/selectPassages.v2';
import { getAllPassages as numGrund } from '@/lib/numericalTest/validator';
import { getAllPassages as numAvancerad } from '@/lib/numericalTestV2/validator';
import { PROV_MERGED_BANK as VERBAL_ALLA } from '@/lib/verbalTestProv/selectProv';
import { PROV_MERGED_BANK as NUM_ALLA } from '@/lib/numericalTestProv/selectProv';
import { alternativSeed, blandaAlternativ } from '@/lib/logicTestV7/blanda';
import { visningstitel } from './titel';
import {
  VERBALA_SVAR,
  VN_FAMILJER,
  VN_MINST_AV_TYP,
  type VnKind,
  type VnNiva,
  type VnPunkt,
  type VnUnderlag,
} from './pass-typer';

export interface VerbalPastaende {
  text: string;
  correctAnswer: string;
  explanation?: string;
  typ?: string;
}
export interface VerbalText {
  id: string;
  title: string;
  topic?: string;
  text: string;
  statements: VerbalPastaende[];
}
export interface NumAlternativ {
  id: string;
  text: string;
  isCorrect?: boolean;
  misstag?: { typ?: string };
}
export interface NumFraga {
  id: string;
  questionText: string;
  options: NumAlternativ[];
  correctAnswerId: string;
  explanation?: string;
}
export interface NumUnderlag {
  id: string;
  title: string;
  topic?: string;
  type?: string;
  contextText?: string;
  dataTable?: VnUnderlag['tabell'];
  chartData?: unknown;
  questions: NumFraga[];
}

const POOLER: Record<VnKind, Record<VnNiva, readonly { id: string }[]>> = {
  verbal: { grund: VERBAL_GRUND as unknown as VerbalText[], avancerad: VERBAL_AVANCERAD as unknown as VerbalText[] },
  numerisk: { grund: numGrund(3) as unknown as NumUnderlag[], avancerad: numAvancerad(3) as unknown as NumUnderlag[] },
};

const VERBAL_PER_ID = new Map<string, VerbalText>((VERBAL_ALLA as unknown as VerbalText[]).map((p) => [p.id, p]));
const NUM_PER_ID = new Map<string, NumUnderlag>((NUM_ALLA as unknown as NumUnderlag[]).map((p) => [p.id, p]));
const NUM_FRAGA = new Map<string, NumFraga>([...NUM_PER_ID.values()].flatMap((p) => p.questions.map((q) => [q.id, q] as const)));

/** Passets pool: nivåns underlag i underlagsversion 4 (verbalt med parti 04, numeriskt som version 3). */
export function passPool(kind: VnKind, niva: VnNiva): readonly { id: string }[] {
  return POOLER[kind][niva];
}

export function verbalText(id: string): VerbalText | null {
  return VERBAL_PER_ID.get(id) ?? null;
}

export function numUnderlag(id: string): NumUnderlag | null {
  return NUM_PER_ID.get(id) ?? null;
}

export function finnsUnderlag(kind: VnKind, id: string): boolean {
  return kind === 'verbal' ? VERBAL_PER_ID.has(id) : NUM_PER_ID.has(id);
}

/**
 * Familjerna per uppgift i underlaget, i ordning. Verbalt: påståendets typ
 * (frysta texter saknar fältet: 'okand'). Numeriskt: distraktorernas
 * misstagstyper (en fråga kan ha flera).
 */
export function familjerPerUppgift(kind: VnKind, id: string): string[][] {
  if (kind === 'verbal') return (verbalText(id)?.statements ?? []).map((s) => [s.typ ?? 'okand']);
  return (numUnderlag(id)?.questions ?? []).map((q) => [
    ...new Set(q.options.map((o) => o.misstag?.typ).filter((t): t is string => typeof t === 'string')),
  ]);
}

/** Antal uppgifter i underlaget av familjen. */
export function antalAvFamilj(kind: VnKind, id: string, familj: string): number {
  return familjerPerUppgift(kind, id).filter((f) => f.includes(familj)).length;
}

/** Har underlaget minst VN_MINST_AV_TYP uppgifter av familjen? */
export function harFamilj(kind: VnKind, id: string, familj: string): boolean {
  return familjerPerUppgift(kind, id).filter((f) => f.includes(familj)).length >= VN_MINST_AV_TYP[kind];
}

/** Familjen ett svar räknas i för "Var du tappade": påståendets typ, eller det valda alternativets misstag. */
export function familjForSvar(kind: VnKind, nyckel: string, svar: string | null): string | null {
  if (kind === 'verbal') {
    const [id, i] = splitNyckel(nyckel);
    const typ = verbalText(id)?.statements[Number(i)]?.typ;
    return typ && VN_FAMILJER.verbal.includes(typ) ? typ : null;
  }
  const q = NUM_FRAGA.get(nyckel);
  if (q) {
    const vald = q.options.find((o) => o.id === svar);
    const typ = vald?.misstag?.typ;
    if (typ && VN_FAMILJER.numerisk.includes(typ)) return typ;
    // Rätt svar: frågans första misstagstyp i familjelistan, så att också rätt räknas in.
    if (svar === q.correctAnswerId) {
      return q.options.map((o) => o.misstag?.typ).find((t): t is string => !!t && VN_FAMILJER.numerisk.includes(t)) ?? null;
    }
    return null;
  }
  return null;
}

function splitNyckel(nyckel: string): [string, string] {
  const i = nyckel.lastIndexOf(':');
  return i < 0 ? [nyckel, ''] : [nyckel.slice(0, i), nyckel.slice(i + 1)];
}

const VERBALA_ETIKETTER: Record<string, string> = { true: 'Sant', false: 'Falskt', cannot_say: 'Går inte att avgöra' };

/**
 * Underlaget och uppgifterna i klientens form, utan facit. Numeriska
 * alternativ blandas per session och fråga. Riktat textpass: påståendena av
 * familjens typ först (testansvarig 2026-10-12), övriga i textens ordning.
 */
export function klientform(kind: VnKind, id: string, sessionId: string, familj: string | null = null): { underlag: VnUnderlag; punkter: VnPunkt[] } | null {
  if (kind === 'verbal') {
    const p = verbalText(id);
    if (!p) return null;
    const ordning = p.statements.map((s, i) => ({ s, i }));
    if (familj) ordning.sort((a, b) => Number(b.s.typ === familj) - Number(a.s.typ === familj) || a.i - b.i);
    return {
      underlag: { id: p.id, titel: visningstitel(p.title), amne: p.topic ?? null, text: p.text },
      punkter: ordning.map(({ s, i }) => ({
        nyckel: `${p.id}:${i}`,
        text: s.text,
        alternativ: VERBALA_SVAR.map((v) => ({ id: v, text: VERBALA_ETIKETTER[v] })),
      })),
    };
  }
  const p = numUnderlag(id);
  if (!p) return null;
  return {
    underlag: {
      id: p.id,
      titel: visningstitel(p.title),
      amne: p.topic ?? null,
      kontext: p.contextText ?? '',
      tabell: p.dataTable ?? null,
      diagram: p.chartData ?? null,
    },
    punkter: p.questions.map((q) => ({
      nyckel: q.id,
      text: q.questionText,
      alternativ: blandaAlternativ(alternativSeed(sessionId, q.id), q).options.map((o) => ({ id: o.id, text: o.text })),
    })),
  };
}

/** Nycklarna i underlaget, i ordning. */
export function nycklarFor(kind: VnKind, id: string): string[] {
  if (kind === 'verbal') return (verbalText(id)?.statements ?? []).map((_, i) => `${id}:${i}`);
  return (numUnderlag(id)?.questions ?? []).map((q) => q.id);
}

/**
 * Rättningen av ett svar: rätt svar, förklaringen och originalindex (för
 * frågestatistiken). Null när nyckeln inte hör till underlaget eller svaret
 * inte är ett giltigt svar.
 */
export function ratta(
  kind: VnKind,
  underlagId: string,
  nyckel: string,
  svar: unknown,
  sessionId: string
): { correct: boolean; ratt: string; forklaring: string | null; selected: number; visat: number } | null {
  if (typeof svar !== 'string') return null;
  if (kind === 'verbal') {
    const [id, i] = splitNyckel(nyckel);
    if (id !== underlagId) return null;
    const s = verbalText(id)?.statements[Number(i)];
    const idx = (VERBALA_SVAR as readonly string[]).indexOf(svar);
    if (!s || idx < 0) return null;
    return { correct: svar === s.correctAnswer, ratt: s.correctAnswer, forklaring: s.explanation ?? null, selected: idx, visat: idx };
  }
  const q = numUnderlag(underlagId)?.questions.find((x) => x.id === nyckel);
  if (!q) return null;
  const selected = q.options.findIndex((o) => o.id === svar);
  if (selected < 0) return null;
  const { permutation } = blandaAlternativ(alternativSeed(sessionId, q.id), q);
  return {
    correct: svar === q.correctAnswerId,
    ratt: q.correctAnswerId,
    forklaring: q.explanation ?? null,
    selected,
    visat: permutation.indexOf(selected),
  };
}
