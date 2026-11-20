// src/lib/tester/steg2/copy.ts
// =============================================================================
// Passens texter i testplanens steg 2 (skissen, flikarna Talserier och
// Spatial förmåga). Samma ord som de andra passen: pass, Premium, Nivåkollen.
// Ren fil.
// =============================================================================

import { paketKort } from '@/lib/plans/plans';
import type { Steg2PassKind } from './pass';

const NAMN: Record<Steg2PassKind, string> = { talserie: 'Träna talserier', spatial: 'Träna spatial förmåga', ordforrad: 'Träna ordförråd' };
/** Betalväggens rubrik, hel mening per typ: böjning byggs aldrig med interpolation. */
const BETALVAGG: Record<Steg2PassKind, string> = {
  talserie: 'Träna i talserier',
  spatial: 'Träna i spatial förmåga',
  ordforrad: 'Träna i ordförråd',
};
const TYP: Record<Steg2PassKind, string> = { talserie: 'Talserier', spatial: 'Spatial förmåga', ordforrad: 'Ordförråd' };

export function steg2PassCopy(kind: Steg2PassKind) {
  return {
    namn: NAMN[kind],
    topp: {
      titel: TYP[kind],
      rad: (niva: 'grund' | 'avancerad', grupp: string | null, n: number, av: number) =>
        `${grupp ? `Träna på mönstret, ${grupp.toLowerCase()}` : 'Träna'}, uppgift ${n} av ${av}${niva === 'avancerad' ? ', avancerad' : ''}`,
      radUtan: grupp0(),
      avsluta: 'Avsluta träningen',
    },
    knapp: {
      svara: 'Svara',
      nasta: 'Nästa uppgift',
      visaResultat: 'Visa resultatet',
      genomga: 'Gå igenom svaren',
      tillResultatet: 'Till resultatet',
      foregaende: 'Föregående',
      tillbaka: 'Tillbaka till Rekryteringstester',
      forsokIgen: 'Försök igen',
    },
    vetInte: 'Vet inte, visa förklaringen',
    fel: {
      hamta: 'Träningen gick inte att hämta.',
      hamtaRad: 'Försök igen. Din träning är sparad, ingenting försvann.',
      svar: 'Svaret gick inte att spara. Inget är förlorat, försök igen.',
      avslut: 'Resultatet gick inte att räkna fram. Svaren är sparade, försök igen.',
      // Priset står på raden under (PremiumPrisradText), som följer kampanjen.
      betalvagg: `${BETALVAGG[kind]} ingår i ${paketKort()}.`,
      betalvaggRad:
        kind === 'spatial'
          ? 'Sex uppgifter varje dag, två vridna figurer, tre pappersvikningar och en tärning, med lösningen efter varje svar.'
          : 'Sex talserier varje dag, med regeln efter varje svar.',
    },
    laddar: { session: 'Hämtar uppgifterna', resultat: 'Räknar fram resultatet' },
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
      tappadeMeta: (ratt: number, antal: number) => `${ratt} av ${antal} rätt i träningen`,
      upprepad: 'Du har haft de här uppgifterna förut. De räknas inte i statistiken.',
      imorgon: (svagast: string | null) => (svagast ? `I morgon: träning på ${svagast.toLowerCase()}.` : `I morgon: ny träning i ${TYP[kind].toLowerCase()}.`),
      riktat: 'Träning på mönstret',
      ingenNiva: 'Träningen räknas i din nivå, högst ett halvt steg om dagen. Nivåtesten på en fast nivå flyttar den inte.',
    },
  };
}

function grupp0() {
  return 'Träna';
}
