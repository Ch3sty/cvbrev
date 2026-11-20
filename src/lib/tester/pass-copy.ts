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
  namn: (kind: VnKind) => (kind === 'verbal' ? 'Träna ord och text' : 'Träna siffror och tabeller'),
  topp: {
    /** Toppradens titel: passets namn, i riktat pass familjen. Aldrig den aktuella frågans typ. */
    titel: (kind: VnKind, familj: string | null) => vnFamiljNamn(familj) ?? (kind === 'verbal' ? 'Ord och text' : 'Siffror och tabeller'),
    rad: (kind: VnKind, niva: VnNiva, riktat: boolean) =>
      `${riktat ? 'Träna på mönstret' : 'Träna'}, ${NIVA_NAMN[niva].toLowerCase()}`,
    avsluta: 'Avsluta träningen',
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
    genomga: 'Gå igenom svaren',
    tillResultatet: 'Till resultatet',
    foregaende: 'Föregående',
    ovaTypen: 'Öva den här typen',
  },
  resultat: {
    eyebrow: (kind: VnKind, riktat: boolean) => (riktat ? 'Träningen på mönstret klar' : 'Träningen klar'),
    rubrik: (ratt: number, antal: number) => `${ratt} av ${antal} rätt.`,
    ringAria: (ratt: number, antal: number) => `${ratt} av ${antal} rätt`,
    tempoRubrik: 'Tempot',
    tempo: (tid: number, budget: number) =>
      tid <= budget ? 'Inom provets tid för underlaget.' : 'Över provets tid för underlaget. Tempot kommer med träningen.',
    tempoAria: (tid: number, budget: number) => `Tid ${tid} sekunder mot provets tid ${budget} sekunder`,
    tid: (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`,
    budgetEtikett: 'provets tid',
    tappadeRubrik: 'Var du tappade',
    tappadeMeta: (ratt: number, antal: number) => `${ratt} av ${antal} rätt i träningen`,
    upprepad: 'Du har haft det här underlaget förut. Det räknas inte i statistiken.',
    expertRad: 'Du är på expertnivå. Gör nivåtestet i stället.',
    imorgon: (kind: VnKind) => `I morgon: ny träning i ${kind === 'verbal' ? 'ord och text' : 'siffror och tabeller'}.`,
  },
  fel: {
    hamta: 'Träningen gick inte att hämta.',
    hamtaRad: 'Försök igen. Din träning är sparad, ingenting försvann.',
    svar: 'Svaret gick inte att spara. Inget är förlorat, försök igen.',
    avslut: 'Resultatet gick inte att räkna fram. Svaren är sparade, försök igen.',
    familj: 'Den typen har för få nya underlag på din nivå just nu.',
    familjRad: 'Träna blandat, så kommer typen tillbaka.',
    betalvagg: (kind: VnKind) => `Träning i ${kind === 'verbal' ? 'ord och text' : 'siffror och tabeller'} ingår i Premium.`,
    betalvaggRad: 'Träning på din nivå, med förklaring efter varje svar och övning på de typer du tappar i.',
  },
  laddar: {
    session: 'Hämtar uppgifterna',
    resultat: 'Räknar fram resultatet',
  },
  /** "två missar" i genomgångens knapp. */
  missar: (n: number) => (n === 1 ? 'en miss' : `${talord(n)} missar`),
  versal,
} as const;

/**
 * Figurpassets texter (copy-omgang3.md 2.2 och 2.3). Samma form som
 * VN_PASS_COPY; nivån står som ord i toppraden, aldrig som tal.
 */
export const FIGUR_PASS_COPY = {
  namn: 'Träna figurserier',
  topp: {
    titel: 'Figurserier',
    rad: (niva: VnNiva) => `Träna, ${NIVA_NAMN[niva].toLowerCase()}`,
    avsluta: 'Avsluta träningen',
  },
  fraga: {
    uppgift: (n: number, av: number) => `Uppgift ${n} av ${av}`,
    svarAria: 'Ditt svar',
    harnast: 'Vilken figur kommer härnäst?',
    bryter: 'Vilken figur bryter mönstret?',
    bryterHjalp: 'Fem följer samma regel. Ordningen spelar ingen roll.',
  },
  aterkoppling: {
    ratt: 'Rätt',
    fel: 'Inte rätt',
    regel: 'Regeln',
    misstag: 'Ditt misstag',
    vetInte: 'Vet inte, visa förklaringen',
    vetInteRad: 'Vet inte',
  },
  knapp: {
    nasta: 'Nästa',
    visaResultat: 'Visa resultatet',
    genomga: 'Gå igenom svaren',
    tillResultatet: 'Till resultatet',
    foregaende: 'Föregående',
    ovaFamiljen: 'Öva den här typen',
    tillbaka: 'Tillbaka till Rekryteringstester',
    forsokIgen: 'Försök igen',
  },
  fel: {
    hamta: 'Träningen gick inte att hämta.',
    hamtaRad: 'Försök igen. Din träning är sparad, ingenting försvann.',
    svar: 'Svaret gick inte att spara. Inget är förlorat, försök igen.',
    avslut: 'Resultatet gick inte att räkna fram. Svaren är sparade, försök igen.',
    betalvagg: 'Träning i figurserier ingår i Premium.',
    betalvaggRad: 'Fyra figurserier varje dag, med regeln förklarad efter varje svar.',
  },
  laddar: {
    session: 'Hämtar uppgifterna',
    resultat: 'Räknar fram resultatet',
  },
  resultat: {
    eyebrow: 'Träningen klar',
    rubrik: (ratt: number, antal: number) => `${ratt} av ${antal} rätt.`,
    ringAria: (ratt: number, antal: number) => `${ratt} av ${antal} rätt`,
    tempoRubrik: 'Tempot',
    tempo: (tid: number, budget: number) =>
      tid <= budget ? 'Inom tiden provet ger per uppgift.' : 'Över tiden provet ger per uppgift. Tempot växer med träningen.',
    tempoAria: (tidPer: number, budgetPer: number) => `Tid ${tidPer} sekunder per uppgift mot provets ${budgetPer}`,
    budgetEtikett: 'provets tid',
    tid: (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`,
    tappadeRubrik: 'Var du tappade',
    tappadeMeta: (ratt: number, antal: number) => `${ratt} av ${antal} rätt i träningen`,
    upprepad: 'Du har sett den här raden förut. Den räknas inte i statistiken.',
    expertRad: 'Du är på expertnivå. Gör nivåtestet i stället.',
    imorgon: 'I morgon: ny träning i figurserier.',
    ingenNiva: 'Träningen räknas i din nivå, högst ett halvt steg om dagen. Nivåtesten på en fast nivå flyttar den inte.',
  },
} as const;

/**
 * Deduktivpassets texter (testplanen steg 1). Samma form som
 * FIGUR_PASS_COPY; nivån står som ord i toppraden, aldrig som tal.
 */
export const DEDUKTIV_PASS_COPY = {
  namn: 'Träna deduktiv slutledning',
  topp: {
    titel: 'Deduktiv slutledning',
    rad: (niva: VnNiva) => `Träna, ${NIVA_NAMN[niva].toLowerCase()}`,
    avsluta: 'Avsluta träningen',
  },
  fraga: {
    uppgift: (n: number, av: number) => `Uppgift ${n} av ${av}`,
  },
  aterkoppling: {
    vetInte: 'Vet inte, visa förklaringen',
  },
  knapp: {
    svara: 'Svara',
    nasta: 'Nästa',
    visaResultat: 'Visa resultatet',
    genomga: 'Gå igenom svaren',
    tillResultatet: 'Till resultatet',
    foregaende: 'Föregående',
    tillbaka: 'Tillbaka till Rekryteringstester',
    forsokIgen: 'Försök igen',
  },
  fel: {
    hamta: 'Träningen gick inte att hämta.',
    hamtaRad: 'Försök igen. Din träning är sparad, ingenting försvann.',
    svar: 'Svaret gick inte att spara. Inget är förlorat, försök igen.',
    avslut: 'Resultatet gick inte att räkna fram. Svaren är sparade, försök igen.',
    betalvagg: 'Träning i deduktiv slutledning ingår i Premium.',
    betalvaggRad: 'Fyra uppgifter varje dag, med lösningen steg för steg efter varje svar.',
  },
  laddar: {
    session: 'Hämtar uppgifterna',
    resultat: 'Räknar fram resultatet',
  },
  resultat: {
    eyebrow: 'Träningen klar',
    rubrik: (ratt: number, antal: number) => `${ratt} av ${antal} rätt.`,
    ringAria: (ratt: number, antal: number) => `${ratt} av ${antal} rätt`,
    tempoRubrik: 'Tempot',
    tempo: (tid: number, budget: number) =>
      tid <= budget ? 'Inom tiden provet ger per uppgift.' : 'Över tiden provet ger per uppgift. Tempot växer med träningen.',
    tempoAria: (tidPer: number, budgetPer: number) => `Tid ${tidPer} sekunder per uppgift mot provets ${budgetPer}`,
    budgetEtikett: 'provets tid',
    tid: (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`,
    tappadeRubrik: 'Var du tappade',
    tappadeMeta: (ratt: number, antal: number) => `${ratt} av ${antal} rätt i träningen`,
    upprepad: 'Du har haft den här uppgiften förut. Den räknas inte i statistiken.',
    expertRad: 'Du är på expertnivå. Gör nivåtestet i stället.',
    imorgon: 'I morgon: ny träning i deduktiv slutledning.',
    ingenNiva: 'Träningen räknas i din nivå, högst ett halvt steg om dagen. Nivåtesten på en fast nivå flyttar den inte.',
  },
} as const;
