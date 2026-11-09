// src/lib/tester/steg2/copy.ts
// =============================================================================
// Passens texter i testplanens steg 2 (skissen, flikarna Talserier och
// Spatial förmåga). Samma ord som de andra passen: pass, Premium, Nivåkollen.
// Ren fil.
// =============================================================================

import type { Steg2PassKind } from './pass';

const NAMN: Record<Steg2PassKind, string> = { talserie: 'Talseriepass', spatial: 'Spatialpass', ordforrad: 'Ordpass' };
const TYP: Record<Steg2PassKind, string> = { talserie: 'Talserier', spatial: 'Spatial förmåga', ordforrad: 'Ordförråd' };

export function steg2PassCopy(kind: Steg2PassKind) {
  return {
    namn: NAMN[kind],
    topp: {
      titel: TYP[kind],
      rad: (niva: 'grund' | 'avancerad', grupp: string | null, n: number, av: number) =>
        `${grupp ? `Riktat pass, ${grupp.toLowerCase()}` : 'Dagens pass'}, uppgift ${n} av ${av}${niva === 'avancerad' ? ', avancerad' : ''}`,
      radUtan: grupp0(),
      avsluta: 'Avsluta passet',
    },
    knapp: {
      svara: 'Svara',
      nasta: 'Nästa uppgift',
      visaResultat: 'Visa resultatet',
      genomga: 'Gå igenom passet',
      tillResultatet: 'Till resultatet',
      foregaende: 'Föregående',
      tillbaka: 'Tillbaka till Rekryteringstester',
      forsokIgen: 'Försök igen',
    },
    vetInte: kind === 'talserie' ? 'Vet inte, visa regeln' : 'Vet inte, visa lösningen',
    fel: {
      hamta: 'Passet gick inte att hämta.',
      hamtaRad: 'Försök igen. Dina pass är sparade, ingenting försvann.',
      svar: 'Svaret gick inte att spara. Inget är förlorat, försök igen.',
      avslut: 'Resultatet gick inte att räkna fram. Svaren är sparade, försök igen.',
      betalvagg: `${NAMN[kind]}et ingår i Premium.`,
      betalvaggRad:
        kind === 'spatial'
          ? 'Sex uppgifter varje dag, två vridna figurer, två pappersvikningar och två tärningar, med lösningen efter varje svar.'
          : 'Sex talserier varje dag, med regeln efter varje svar.',
    },
    laddar: { session: 'Hämtar passet', resultat: 'Räknar fram resultatet' },
    resultat: {
      eyebrow: 'Klart',
      rubrik: (ratt: number, antal: number) => `${ratt} av ${antal} rätt`,
      ringAria: (ratt: number, antal: number) => `${ratt} av ${antal} rätt`,
      tempoRubrik: 'Tempo',
      tempo: (tid: number, budget: number) => `${tid} sekunder per uppgift mot provets ${budget}.`,
      tempoAria: (tidPer: number, budgetPer: number) => `Tid ${tidPer} sekunder per uppgift mot provets ${budgetPer}`,
      budgetEtikett: 'provets tid',
      tid: (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`,
      tappadeRubrik: 'Var du tappar',
      tappadeMeta: (ratt: number, antal: number) => `${ratt} av ${antal} rätt i passen`,
      upprepad: 'Du har haft de här uppgifterna förut. De räknas inte i statistiken.',
      imorgon: (svagast: string | null) => (svagast ? `I morgon: riktat pass på ${svagast.toLowerCase()}.` : `I morgon: ett nytt ${NAMN[kind].toLowerCase()}.`),
      riktat: 'Riktat pass',
      ingenNiva: 'Passet ändrar inte din nivå på skalan.',
    },
  };
}

function grupp0() {
  return 'Dagens pass';
}
