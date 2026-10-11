// src/lib/traning/rubrik.ts
// =============================================================================
// Rubriktabellen i Rekryteringstester (spec-rummen bilaga 11, konceptets notis
// "Rubrikerna när något saknas", våg 2). Inget tillstånd kräver ett
// leverantörsnamn: rubriken följer vad vi vet.
//
//   Med leverantör           14 dagar till Matrigma · I övermorgon: Matrigma ·
//                            I dag: Matrigma · Hur gick Matrigma?
//   Utan leverantör, typ     14 dagar till logiktestet (siffertestet, texttestet)
//   Utan både                14 dagar till provet · Hur gick provet?
//   Provdagen-raden          Samma format som Matrigma: 35 uppgifter, 40 minuter
//                            eller Vårt provläge: 18 uppgifter, 25 minuter.
//                            Vet du leverantören så byter vi format.
//   Utan datum               Rekryteringstester (17.1), raden "Sätt ett datum
//                            så räknar vi bakåt"
//   Bara personlighet        Personlighetstest den 24 oktober. Aldrig en
//                            nedräkning i träningston.
//
// Typen i rubriken: bara när exakt en kognitiv testtyp är vald. Två eller
// fler (figurer och siffror) blir "provet", eftersom vi inte vet vilket som
// kommer först. Ren, inga beroenden utom datum och tempo.
// =============================================================================

import { veckodagNamn, type Dag } from './datum';
import { formatText, type Provformat } from './tempo';

export type Testtyp = 'matris' | 'numerisk' | 'verbal' | 'personlighet';

/** Typerna i rubriken (bestämd form). */
export const TYP_I_RUBRIK: Record<Exclude<Testtyp, 'personlighet'>, string> = {
  matris: 'logiktestet',
  numerisk: 'siffertestet',
  verbal: 'texttestet',
};

/** Typerna i toppradens kontextlänk ("Logiktest, 24 okt"). */
export const TYP_I_KONTEXT: Record<Testtyp, string> = {
  matris: 'Logiktest',
  numerisk: 'Siffertest',
  verbal: 'Texttest',
  personlighet: 'Personlighet',
};

/** Rummets rubrik när datum saknas (ägarens beslut 17.1). */
export const RUM_RUBRIK = 'Rekryteringstester';

const MANADER = [
  'januari',
  'februari',
  'mars',
  'april',
  'maj',
  'juni',
  'juli',
  'augusti',
  'september',
  'oktober',
  'november',
  'december',
];
const MANADER_KORT = ['jan', 'feb', 'mars', 'apr', 'maj', 'juni', 'juli', 'aug', 'sep', 'okt', 'nov', 'dec'];

function delar(dag: Dag): { d: number; m: number; y: number } {
  const [y, m, d] = dag.split('-').map(Number);
  return { d, m, y };
}

/** "24 okt" */
export function kortDatum(dag: Dag): string {
  const { d, m } = delar(dag);
  return `${d} ${MANADER_KORT[m - 1]}`;
}

/** "24 oktober" */
export function datumText(dag: Dag): string {
  const { d, m } = delar(dag);
  return `${d} ${MANADER[m - 1]}`;
}

/** "lördag 24 oktober 2026" */
export function datumLangt(dag: Dag): string {
  const { y } = delar(dag);
  return `${veckodagNamn(dag)} ${datumText(dag)} ${y}`;
}

/** Månadens namn, för den stora provdagen ("24 okt" + "ober"). */
export function manadNamn(dag: Dag): string {
  return MANADER[delar(dag).m - 1];
}

export interface RubrikIn {
  /** Leverantörens namn ur formatet (Matrigma, Alva Logic ...), null för Annat och Vet inte. */
  leverantorNamn: string | null;
  testtyper: readonly string[];
}

/** De kognitiva typerna (inte personlighet), i vald ordning. */
export function kognitivaTyper(testtyper: readonly string[]): Exclude<Testtyp, 'personlighet'>[] {
  return testtyper.filter(
    (t): t is Exclude<Testtyp, 'personlighet'> => t === 'matris' || t === 'numerisk' || t === 'verbal'
  );
}

/** Bara personlighetstestet valt: ingen nedräkning, ingen ring, ingen kurva (1p). */
export function baraPersonlighet(testtyper: readonly string[]): boolean {
  return testtyper.includes('personlighet') && kognitivaTyper(testtyper).length === 0;
}

/** Vad rubriken räknar ner mot: leverantören, typen eller "provet". */
export function malet(inp: RubrikIn): string {
  if (inp.leverantorNamn) return inp.leverantorNamn;
  const k = kognitivaTyper(inp.testtyper);
  return k.length === 1 ? TYP_I_RUBRIK[k[0]] : 'provet';
}

/** Rubriken före provet: "14 dagar till Matrigma", "I övermorgon: Matrigma", "I dag: Matrigma". */
export function rubrikForeProv(inp: RubrikIn, dagarKvar: number): string {
  const mal = malet(inp);
  if (dagarKvar <= 0) return `I dag: ${mal}`;
  if (dagarKvar === 1) return `I morgon: ${mal}`;
  if (dagarKvar === 2) return `I övermorgon: ${mal}`;
  return `${dagarKvar} dagar till ${mal}`;
}

/** "Hur gick Matrigma?" */
export function rubrikEfterProv(inp: RubrikIn): string {
  return `Hur gick ${malet(inp)}?`;
}

/** "Personlighetstest den 24 oktober", utan datum bara "Personlighetstest". */
export function rubrikPersonlighet(provdatum: Dag | null): string {
  return provdatum ? `Personlighetstest den ${datumText(provdatum)}` : 'Personlighetstest';
}

/**
 * Toppradens kontextlänk: "Matrigma, 24 okt", "Logiktest, 24 okt",
 * "Matrigma, inget datum". Null när inget är valt alls.
 */
export function kontextText(inp: RubrikIn & { provdatum: Dag | null }): string | null {
  const k = kognitivaTyper(inp.testtyper);
  const namn =
    inp.leverantorNamn ??
    (k.length === 1
      ? TYP_I_KONTEXT[k[0]]
      : baraPersonlighet(inp.testtyper)
        ? TYP_I_KONTEXT.personlighet
        : k.length > 1
          ? 'Provet'
          : null);
  if (!namn && !inp.provdatum) return null;
  const d = inp.provdatum ? kortDatum(inp.provdatum) : 'inget datum';
  return namn ? `${namn}, ${d}` : `Provet, ${d}`;
}

export interface Provrad {
  /** "Samma format som Matrigma" eller "Vårt provläge". */
  titel: string;
  /** "35 uppgifter, 40 minuter, fast ordning." */
  format: string;
  /** Bara antal och tid, gemen: "cirka 35 uppgifter, 40 minuter". */
  antalTid: string;
  /** Leverantörens anmärkning (SHL, Aon), spec 14.4. */
  anmarkning: string | null;
  /** Leverantören är okänd: raden erbjuder att ange den. */
  utanLeverantor: boolean;
}

function versal(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

/**
 * Provdagen-raden (testansvarigs villkor 16.2: formatet i klartext, så att
 * värdet syns före köpet; aldrig "samma test").
 */
export function provrad(format: Pick<Provformat, 'namn' | 'antal' | 'minuter' | 'budget_s' | 'adaptiv' | 'cirka' | 'tidsform' | 'anmarkning'>): Provrad {
  const f = format as Provformat;
  if (!format.namn) {
    return {
      titel: 'Vårt provläge',
      format: `${versal(formatText(f))}. Vet du leverantören så byter vi format.`,
      antalTid: formatText(f),
      anmarkning: null,
      utanLeverantor: true,
    };
  }
  const ordning = format.adaptiv ? 'svårare efter rätt svar' : 'fast ordning';
  return {
    titel: `Samma format som ${format.namn}`,
    format: `${versal(formatText(f))}, ${ordning}.`,
    antalTid: formatText(f),
    anmarkning: format.anmarkning,
    utanLeverantor: false,
  };
}

/** Låst rad i ett ord för skärmläsaren: "Samma format som Matrigma. 35 uppgifter, 40 minuter. Låst, ingår i X." */
export function provradLabel(rad: Provrad, lastText: string | null): string {
  // Titeln saknar egen punkt ("Samma format som Matrigma"), så den får en här.
  return [`${rad.titel}.`, rad.format, lastText].filter(Boolean).join(' ');
}

/** Veckodag med versal: "Lördag". */
export function veckodagVersal(dag: Dag): string {
  return versal(veckodagNamn(dag));
}
