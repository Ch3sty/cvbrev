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
  fel: {
    passHamtas: 'Passet gick inte att hämta.',
    forsokIgen: 'Försök igen. Din nivå och dina pass är sparade, ingenting försvann.',
    familjSaknas: 'Den familjen har inte tillräckligt många uppgifter än.',
    redanBesvarad: 'Frågan är redan besvarad.',
  },
} as const;

export function versal(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}
