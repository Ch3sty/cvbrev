// src/lib/traning/tillgang.ts
// =============================================================================
// Vem får starta vilken träningssession (spec-rummen beslut 6, 6.3 och
// briefen avsnitt 7). Ren funktion: rutten slår upp behörigheterna och
// antalet sessioner, den här avgör.
//
// - Mätningen: gratis en gång (GRATISNIVA.matningGratis). En mätning när en
//   redan är gjord är en ommätning och kräver tests_above_base, om inte
//   ommatningGratis.
// - Dagens pass: med tests_above_base passet på din nivå, obegränsat. Utan:
//   grundpass, GRATISNIVA.grundpassPerDag per dag (429 när kvoten är slut);
//   med grundpassVarjeDag = false bara första träningsdagen (402 därefter).
// - Riktat pass: tests_above_base, om inte riktadePassGratis.
// - Generalrepetitionen: test_exam_mode, om inte provlageGratis.
// =============================================================================

import type { Feature } from '@/lib/access/features';
import { GRATISNIVA } from './gratisniva';

/** Vad klienten ber om. Ommätning är en mätning när en redan finns. */
export type Begard = 'matning' | 'pass' | 'riktat' | 'general';

/** Vad sessionen blir. */
export type Traningstyp = 'matning' | 'ommatning' | 'pass' | 'riktat' | 'general';

/** test_type i logic_test_v4_sessions per träningstyp. */
export const TEST_TYPE: Readonly<Record<Traningstyp, string>> = {
  matning: 'matrislogik-matning',
  ommatning: 'matrislogik-matning',
  pass: 'matrislogik-pass',
  riktat: 'matrislogik-riktat',
  general: 'matrislogik-general',
};

/** Alla nya test_type-värden. Uppvärmningen sparas inte och har ingen. */
export const TRANINGS_TEST_TYPER = [
  'matrislogik-matning',
  'matrislogik-pass',
  'matrislogik-riktat',
  'matrislogik-general',
] as const;

export function arTraningsTestTyp(t: unknown): boolean {
  return typeof t === 'string' && (TRANINGS_TEST_TYPER as readonly string[]).includes(t);
}

/**
 * Featuren varje ny test_type kräver för att alls få starta, för
 * sessionGate.featureForTestType. Mätning och pass har ingen: där avgör
 * beslutaTillgang (en gratis mätning, grundpasset).
 */
export function featureForTraningsTyp(
  testType: string,
  gratis: { riktadePassGratis: boolean; provlageGratis: boolean } = GRATISNIVA
): Feature | null {
  if (testType === 'matrislogik-riktat') return gratis.riktadePassGratis ? null : 'tests_above_base';
  if (testType === 'matrislogik-general') return gratis.provlageGratis ? null : 'test_exam_mode';
  return null;
}

export interface TillgangIn {
  begard: Begard;
  /** tests_above_base (Hela paketet, Dagspasset, eller äldre paket med tester). */
  harOvanGrund: boolean;
  /** test_exam_mode. */
  harProvlage: boolean;
  /** Antal slutförda mätningar (mätning + ommätning) totalt. */
  matningarSlutforda: number;
  /** Antal slutförda pass (test_type matrislogik-pass) i dag, svensk tid. */
  passSlutfordaIdag: number;
  /** Första dagen med en slutförd träningssession, och i dag. Bara för grundpassVarjeDag = false. */
  forstaTraningsdag?: string | null;
  idag?: string;
  gratis?: typeof GRATISNIVA | Record<keyof typeof GRATISNIVA, boolean | number>;
}

export type TillgangBeslut =
  | { tillatet: true; typ: Traningstyp; variant: 'grund' | 'niva' }
  | { tillatet: false; typ: Traningstyp; skal: 'betalvagg'; feature: Feature }
  | { tillatet: false; typ: Traningstyp; skal: 'kvot'; anvant: number; grans: number };

export function beslutaTillgang(inp: TillgangIn): TillgangBeslut {
  const g = (inp.gratis ?? GRATISNIVA) as Record<keyof typeof GRATISNIVA, boolean | number>;
  switch (inp.begard) {
    case 'matning': {
      if (inp.matningarSlutforda === 0) {
        return g.matningGratis || inp.harOvanGrund
          ? { tillatet: true, typ: 'matning', variant: 'niva' }
          : { tillatet: false, typ: 'matning', skal: 'betalvagg', feature: 'tests_above_base' };
      }
      return g.ommatningGratis || inp.harOvanGrund
        ? { tillatet: true, typ: 'ommatning', variant: 'niva' }
        : { tillatet: false, typ: 'ommatning', skal: 'betalvagg', feature: 'tests_above_base' };
    }
    case 'pass': {
      if (inp.harOvanGrund) return { tillatet: true, typ: 'pass', variant: 'niva' };
      if (!g.grundpassVarjeDag && inp.forstaTraningsdag && inp.idag && inp.forstaTraningsdag < inp.idag) {
        return { tillatet: false, typ: 'pass', skal: 'betalvagg', feature: 'tests_above_base' };
      }
      const grans = Number(g.grundpassPerDag);
      if (inp.passSlutfordaIdag >= grans) {
        return { tillatet: false, typ: 'pass', skal: 'kvot', anvant: inp.passSlutfordaIdag, grans };
      }
      return { tillatet: true, typ: 'pass', variant: 'grund' };
    }
    case 'riktat':
      return g.riktadePassGratis || inp.harOvanGrund
        ? { tillatet: true, typ: 'riktat', variant: 'niva' }
        : { tillatet: false, typ: 'riktat', skal: 'betalvagg', feature: 'tests_above_base' };
    case 'general':
      return g.provlageGratis || inp.harProvlage
        ? { tillatet: true, typ: 'general', variant: 'niva' }
        : { tillatet: false, typ: 'general', skal: 'betalvagg', feature: 'test_exam_mode' };
  }
}
