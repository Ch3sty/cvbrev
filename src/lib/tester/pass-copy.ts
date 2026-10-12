// src/lib/tester/pass-copy.ts
// =============================================================================
// Texterna i text- och sifferpassen (beställning omgång 2, B2). Aldrig i
// JSX. Regler: vi-form, svenska facktermer, inga tankstreck, inga procent i
// löptext ("Var du tappade" bär en liten stapel), aldrig "poäng".
// =============================================================================

import { talord, versal } from '@/lib/traning/copy';
import type { VnKind, VnNiva } from './pass-typer';

/** Familjernas namn: påståendetyp (verbalt) och misstagstyp (numeriskt). */
export const VN_FAMILJ_NAMN: Readonly<Record<string, string>> = {
  direkt: 'Det som står i texten',
  slutledning: 'Slutsatser ur texten',
  kvantor: 'Alla, inga och ibland',
  utanfor: 'Det texten inte säger',
  fel_rad: 'Rätt rad i tabellen',
  fel_kolumn: 'Rätt kolumn',
  steg_saknas: 'Alla räknesteg',
  fel_enhet: 'Enhetsbyten',
  fel_bas: 'Procent av rätt tal',
};

export function vnFamiljNamn(f: string | null | undefined): string | null {
  return f ? VN_FAMILJ_NAMN[f] ?? null : null;
}

const NIVA_NAMN: Record<VnNiva, string> = { grund: 'Grund', avancerad: 'Avancerad' };

export const VN_PASS_COPY = {
  namn: (kind: VnKind) => (kind === 'verbal' ? 'Textpass' : 'Sifferpass'),
  topp: {
    /** Toppradens titel: passets namn, i riktat pass familjen. Aldrig den aktuella frågans typ. */
    titel: (kind: VnKind, familj: string | null) => vnFamiljNamn(familj) ?? (kind === 'verbal' ? 'Textpass' : 'Sifferpass'),
    rad: (kind: VnKind, niva: VnNiva, riktat: boolean) =>
      `${riktat ? (kind === 'verbal' ? 'Extra textpass' : 'Extra sifferpass') : kind === 'verbal' ? 'Dagens textpass' : 'Dagens sifferpass'}, ${NIVA_NAMN[niva].toLowerCase()}`,
    avsluta: 'Avsluta passet',
  },
  niva: (niva: VnNiva) => NIVA_NAMN[niva],
  raknare: 'Räknare tillåten',
  fraga: {
    pastaende: (n: number, av: number) => `Påstående ${n} av ${av}`,
    fraga: (n: number, av: number) => `Fråga ${n} av ${av}`,
    svarAria: 'Ditt svar',
  },
  aterkoppling: {
    ratt: 'Rätt',
    fel: 'Inte rätt',
    rattSvar: (t: string) => `Rätt svar: ${t}`,
    forklaring: 'Förklaringen',
  },
  knapp: {
    nasta: 'Nästa',
    visaResultat: 'Visa resultatet',
    forsokIgen: 'Försök igen',
    tillbaka: 'Tillbaka till Rekryteringstester',
    genomga: 'Gå igenom passet',
    tillResultatet: 'Till resultatet',
    foregaende: 'Föregående',
    ovaTypen: 'Öva den här typen',
  },
  resultat: {
    eyebrow: (kind: VnKind, riktat: boolean) => (riktat ? 'Extrapasset klart' : kind === 'verbal' ? 'Textpasset klart' : 'Sifferpasset klart'),
    rubrik: (ratt: number, antal: number) => `${ratt} av ${antal} rätt.`,
    ringAria: (ratt: number, antal: number) => `${ratt} av ${antal} rätt`,
    tempoRubrik: 'Tempot',
    tempo: (tid: number, budget: number) =>
      tid <= budget ? 'Inom provets tid för underlaget.' : 'Över provets tid för underlaget. Tempot kommer med passen.',
    tempoAria: (tid: number, budget: number) => `Tid ${tid} sekunder mot provets tid ${budget} sekunder`,
    tid: (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`,
    budgetEtikett: 'provets tid',
    tappadeRubrik: 'Var du tappade',
    tappadeMeta: (ratt: number, antal: number) => `${ratt} av ${antal} rätt i passen`,
    upprepad: 'Du har haft det här underlaget förut. Det räknas inte i statistiken.',
    expertRad: 'Expertnivån: gör nivåtestet.',
    imorgon: (kind: VnKind) => `I morgon: ett nytt ${kind === 'verbal' ? 'textpass' : 'sifferpass'}.`,
  },
  fel: {
    hamta: 'Passet gick inte att hämta.',
    hamtaRad: 'Försök igen. Dina pass är sparade, ingenting försvann.',
    svar: 'Svaret gick inte att spara. Inget är förlorat, försök igen.',
    avslut: 'Resultatet gick inte att räkna fram. Svaren är sparade, försök igen.',
    familj: 'Den typen har för få nya underlag på din nivå just nu.',
    familjRad: 'Gör dagens pass, så kommer typen tillbaka.',
    betalvagg: (kind: VnKind) => `${kind === 'verbal' ? 'Textpasset' : 'Sifferpasset'} ingår i Premium.`,
    betalvaggRad: 'Ett kort pass varje dag, med förklaring efter varje svar och övning på de typer du tappar i.',
  },
  laddar: {
    session: 'Hämtar passet',
    resultat: 'Räknar fram resultatet',
  },
  /** "två missar" i genomgångens knapp. */
  missar: (n: number) => (n === 1 ? 'en miss' : `${talord(n)} missar`),
  versal,
} as const;
