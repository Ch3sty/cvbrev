// src/lib/traning/copy.ts
// Testträningens texter (spec-rummen avsnitt 8: aldrig i JSX). Utkasten är
// art-directors ur konceptet och gäller tills svensk-ux-copywriter ersatt dem
// (avsnitt 9). Regler: vi-form, svenska facktermer, inga tankstreck, "samma
// format som", aldrig "samma test".

import type { MilstolpeNyckel } from './milstolpar';

export const TRANING_COPY = {
  imorgon: {
    familjUpp: 'samma familj en nivå upp',
    nyFamilj: 'ny familj',
    pass: 'nästa pass',
    grundpass: 'nästa grundpass',
    ommatning: 'ommätning, 8 minuter',
    general: 'generalrepetition',
    prov: 'provet. Tre uppvärmningsfrågor, inget mer.',
    vila: (veckodag: string) => `${versal(veckodag)} är vilodag.`,
  },
  serie: {
    borjarOm: 'Serien börjar om i dag',
    pausad: 'Serien pausar, inget bryts.',
  },
  tema: {
    blandat: 'Blandade mönster',
  },
  milstolpar: {
    forsta_matningen: 'Första mätningen',
    forsta_veckan: 'Första veckan',
    nivan_upp: 'Nivån upp',
    generalrepetitionen: 'Generalrepetitionen',
    provdagen: 'Provdagen',
  } satisfies Record<MilstolpeNyckel, string>,
  /**
   * Kvittot K1 för Första veckan (spec 14.3), två varianter. Utkast:
   * copywritern har sista ordet.
   */
  forstaVeckan: {
    /** "Sju dagar sedan mätningen, fem pass och en ommätning, ingen missad dag" */
    betalande: (pass: number, ommatningar: number) =>
      `Sju dagar sedan mätningen, ${antalPass(pass)} och ${talord(ommatningar, 'en')} ${ommatningar === 1 ? 'ommätning' : 'ommätningar'}, ingen missad dag`,
    /** "Sju dagar sedan mätningen, sex pass, ingen missad dag" */
    gratis: (pass: number) => `Sju dagar sedan mätningen, ${antalPass(pass)}, ingen missad dag`,
  },
  format: {
    /** Under formatet på provdagen-raden (1b/1c), spec 14.4. Nyckel per format. */
    anmarkning: {
      shl: 'SHL Verify G+ blandar siffror, slutledning och figurer. Provläget övar figurdelen.',
      aon: 'scales ix har en annan uppgiftstyp, att hitta regeln bland rutnät. Provläget övar tempot med matriser.',
    },
  },
  fel: {
    passHamtas: 'Passet gick inte att hämta.',
    forsokIgen: 'Försök igen. Din nivå och dina pass är sparade, ingenting försvann.',
    familjSaknas: 'Den familjen har inte tillräckligt många uppgifter än.',
    redanBesvarad: 'Frågan är redan besvarad.',
  },
} as const;

const TALORD = ['noll', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio'];

/** Tal som ord upp till tio, annars siffror. Ettan efter genus ("en ommätning", "ett pass"). */
export function talord(n: number, ett: 'en' | 'ett' = 'ett'): string {
  if (n === 1) return ett;
  return Number.isInteger(n) && n >= 0 && n < TALORD.length ? TALORD[n] : String(n);
}

function antalPass(n: number): string {
  return `${talord(n, 'ett')} pass`;
}

export function versal(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}
