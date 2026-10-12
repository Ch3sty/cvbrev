// src/lib/traning/copy.ts
// Texterna i rummet Rekryteringstester (spec-rummen 17.1; avsnitt 8: aldrig i JSX). Utkasten är
// art-directors ur konceptet och gäller tills svensk-ux-copywriter ersatt dem
// (avsnitt 9). Regler: vi-form, svenska facktermer, inga tankstreck, "samma
// format som", aldrig "samma test".

import type { MilstolpeNyckel } from './milstolpar';

export const TRANING_COPY = {
  imorgon: {
    familjUpp: 'samma mönster, ett steg svårare',
    nyFamilj: 'nytt mönster',
    pass: 'nästa pass',
    grundpass: 'nästa grundpass',
    ommatning: 'ny nivåkoll, 8 minuter',
    general: 'övningsprov',
    prov: 'provet. Bara tre uppvärmningsfrågor.',
    vila: (veckodag: string) => `${versal(veckodag)} är vilodag.`,
  },
  serie: {
    borjarOm: 'Dagarna i rad börjar om i dag',
    pausad: 'Dagarna i rad pausar, inget bryts.',
  },
  tema: {
    blandat: 'Blandade mönster',
  },
  milstolpar: {
    forsta_matningen: 'Första nivåkollen',
    forsta_veckan: 'Första veckan',
    nivan_upp: 'Nivån upp',
    generalrepetitionen: 'Övningsprovet',
    provdagen: 'Provdagen',
  } satisfies Record<MilstolpeNyckel, string>,
  /**
   * Kvittot K1 för Första veckan (spec 14.3), två varianter. Utkast:
   * copywritern har sista ordet.
   */
  forstaVeckan: {
    /** "Sju dagar sedan starten, fem pass, ingen missad dag" (copy-plan 3.9: samma text som gratis). */
    betalande: (pass: number) => `Sju dagar sedan starten, ${antalPass(pass)}, ingen missad dag`,
    /** "Sju dagar sedan starten, sex pass, ingen missad dag" */
    gratis: (pass: number) => `Sju dagar sedan starten, ${antalPass(pass)}, ingen missad dag`,
  },
  format: {
    /** Under formatet på provdagen-raden (1b/1c), spec 14.4. Nyckel per format. */
    anmarkning: {
      shl: 'SHL Verify G+ blandar siffror, slutledning och figurer. Övningsprovet övar figurdelen.',
      aon: 'scales ix har en annan uppgiftstyp, att hitta regeln bland rutnät. Övningsprovet övar tempot med matriser.',
      aonEget: 'Aon scales ix använder figurserier, inte rutnät. Övningsprovet i Aons format ligger under Figurserier.',
    },
  },
  fel: {
    passHamtas: 'Passet gick inte att hämta.',
    forsokIgen: 'Försök igen. Din nivå och dina pass är sparade, ingenting försvann.',
    familjSaknas: 'Det mönstret har för få uppgifter än så länge.',
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
