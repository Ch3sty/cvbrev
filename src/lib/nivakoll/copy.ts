// src/lib/nivakoll/copy.ts
// =============================================================================
// Texterna i Nivåkollen för figurserier, deduktivt, verbalt och numeriskt
// (testplanen steg 1). Aldrig i JSX. Regler: vi-form, inga talstreck, inga
// mittpunkter mellan fakta, inga procent i löptext, nivån som heltal stort
// och decimalen bara på skalan. Meningen om nivån säger vad modellen väntar
// sig på bankens nivåer, aldrig en jämförelse med andra (inga normer).
// Priset ur plans.
// =============================================================================

import { kopKnapp, paketKort, prisPeriod, SALD_PLAN } from '@/lib/plans/plans';
import { nivaKort } from '@/lib/traning/pass-copy';
import type { NivakollKind } from './niva';
import type { BankNiva, NivakollResultat } from './typer';

export const KIND_NAMN: Record<NivakollKind, string> = {
  figurserie: 'Figurserier',
  deduktiv: 'Deduktivt',
  verbal: 'Verbalt',
  numerisk: 'Numeriskt',
};

const KIND_GEMEN: Record<NivakollKind, string> = {
  figurserie: 'figurserier',
  deduktiv: 'deduktivt',
  verbal: 'verbalt',
  numerisk: 'numeriskt',
};

/** Vad varje banknivå gör, samma ord som Alla tester (NIVA_GOR). */
const NIVA_GOR: Record<NivakollKind, Partial<Record<BankNiva, string>>> = {
  figurserie: { grund: 'en regel', avancerad: 'två regler', expert: 'tre regler' },
  deduktiv: { grund: 'tre villkor', avancerad: 'fem villkor', expert: 'villkor i rörelse' },
  verbal: { grund: 'svaret står i texten', avancerad: 'två ståndpunkter' },
  numerisk: { grund: 'läs av och räkna', avancerad: 'flera räknesteg', expert: 'prognos och marginal' },
};

const NIVA_ORD: Record<BankNiva, string> = { grund: 'grundnivå', avancerad: 'avancerad nivå', expert: 'expertnivå' };

/** Passets namn per typ. */
export const PASS_NAMN: Record<NivakollKind, string> = {
  figurserie: 'Figurpasset',
  deduktiv: 'Deduktivpasset',
  verbal: 'Textpasset',
  numerisk: 'Sifferpasset',
};

/** Cirka-tiden per typ på startraderna. */
export const MINUTER: Record<NivakollKind, number> = { figurserie: 7, deduktiv: 8, verbal: 5, numerisk: 10 };

function grad(andel: number): string {
  if (andel >= 0.85) return 'sitter';
  if (andel >= 0.6) return 'blir det oftare rätt än fel';
  if (andel >= 0.4) return 'blir det rätt ungefär varannan gång';
  return 'blir det oftast fel än så länge';
}

/**
 * Meningen under nivån: vad modellen väntar sig på bankens nivåer vid hennes
 * nivå. Grundnivån först, sedan den första nivån som inte sitter.
 */
export function nivaMening(kind: NivakollKind, vantat: NivakollResultat['vantat']): string {
  const nivaer = (['grund', 'avancerad', 'expert'] as const).filter((n) => vantat[n] != null && NIVA_GOR[kind][n]);
  const delar: string[] = [];
  for (const n of nivaer) {
    const a = vantat[n] as number;
    const gor = NIVA_GOR[kind][n];
    if (a >= 0.85) {
      delar.push(n === 'grund' ? 'Grundnivån sitter.' : `${n === 'avancerad' ? 'Avancerad nivå' : 'Expertnivån'} sitter också.`);
      continue;
    }
    delar.push(`På ${NIVA_ORD[n]}, ${gor}, ${grad(a)}.`);
    break;
  }
  if (delar.length === nivaer.length && nivaer.every((n) => (vantat[n] as number) >= 0.85)) delar.push('Det som är kvar att träna är tempot.');
  return delar.join(' ');
}

export const NIVAKOLL_COPY = {
  topp: {
    titel: 'Nivåkollen',
    rad: (kind: NivakollKind, typ: 'matning' | 'ommatning') => `${typ === 'ommatning' ? 'Ny nivåkoll' : 'Nivåkollen'}, ${KIND_GEMEN[kind]}`,
    avsluta: 'Avsluta Nivåkollen',
  },
  fraga: {
    uppgift: (n: number, av: number) => `Uppgift ${n} av ${av}`,
    forsta: 'Ingen återkoppling under tiden. Rätt svar och förklaringar kommer i genomgången.',
    vetInte: 'Vet inte',
    svara: 'Svara',
    nasta: 'Nästa',
  },
  knapp: {
    forsokIgen: 'Försök igen',
    tillbaka: 'Tillbaka till Rekryteringstester',
    genomga: 'Gå igenom Nivåkollen',
    tillResultatet: 'Till resultatet',
    foregaende: 'Föregående',
    nasta: 'Nästa',
    startaPass: (kind: NivakollKind) => `Starta ${PASS_NAMN[kind].toLowerCase()}`,
  },
  laddar: { session: 'Hämtar Nivåkollen', resultat: 'Räknar fram din nivå' },
  fel: {
    hamta: 'Nivåkollen gick inte att hämta.',
    hamtaRad: 'Försök igen. Inget du svarat har försvunnit.',
    svar: 'Svaret gick inte att spara. Inget är förlorat, försök igen.',
    avslut: 'Nivån gick inte att räkna fram. Svaren är sparade, försök igen.',
    betalvagg: 'En ny nivåkoll ingår i Premium.',
    betalvaggRad: () => `Den första Nivåkollen i varje test är gratis. Med ${paketKort()}, ${prisPeriod(SALD_PLAN)}, kollar du nivån igen när passen har flyttat dig.`,
    kop: () => kopKnapp(SALD_PLAN),
  },
  resultat: {
    label: 'Resultatet av Nivåkollen',
    kontext: (kind: NivakollKind) => `Nivåkollen sparad, ${KIND_GEMEN[kind]}`,
    eyebrow: (kind: NivakollKind) => `Din nivå i ${KIND_GEMEN[kind]}`,
    av10: 'av 10',
    skalaAria: (niva: number, fore: number | null) =>
      `Nivåskala 1 till 10. Din nivå ${nivaKort(niva)}.${fore != null ? ` Förra nivåkollen ${nivaKort(fore)}.` : ''}`,
    tal: {
      ratt: (r: number, a: number) => `${r} av ${a}`,
      rattEtikett: 'rätt',
      overTid: 'över provets tid',
      sekunder: (s: number) => `${s} s`,
      snitt: (budget: number) => `per uppgift, provet ger ${budget}`,
    },
    foreRad: (fore: number, delta: number) =>
      delta > 0 ? `Förra nivåkollen: ${nivaKort(fore)}. Du har gått upp.` : delta < 0 ? `Förra nivåkollen: ${nivaKort(fore)}.` : `Förra nivåkollen: ${nivaKort(fore)}. Samma nivå.`,
    pass: {
      eyebrow: 'Dagens pass',
      titel: (kind: NivakollKind, niva: 'grund' | 'avancerad') => `${PASS_NAMN[kind]} på ${niva === 'grund' ? 'grundnivå' : 'avancerad nivå'}`,
      text: (kind: NivakollKind, niva: 'grund' | 'avancerad') =>
        niva === 'grund'
          ? `Fyra uppgifter på grundnivå med förklaringen efter varje svar. Sitter grunden flyttar Nivåkollen upp passen.`
          : `Grundnivån sitter, så passen tar uppgifterna på avancerad nivå, ${NIVA_GOR[kind].avancerad}.`,
      last: () => `Passen ingår i ${paketKort()}, ${prisPeriod(SALD_PLAN)}. Nivåkollen och genomgången är dina ändå.`,
      kop: () => kopKnapp(SALD_PLAN),
    },
    varDuTappade: 'Var du tappade i Nivåkollen',
    ingaFamiljer: 'Inget du tappade på i Nivåkollen. Passen börjar på din nivå.',
    familjMeta: (r: number, a: number) => `${r} av ${a} rätt.`,
  },
  genomgang: {
    rattSvar: (t: string) => `Rätt svar: ${t}`,
    ditt: (t: string) => `Ditt svar: ${t}`,
    vetInte: 'Vet inte',
    obesvarad: 'Inte besvarad',
    ratt: 'Rätt',
    fel: 'Inte den här',
    forklaring: 'Förklaringen',
    regel: 'Regeln',
    nivaEtikett: (n: BankNiva) => (n === 'grund' ? 'Grundnivå' : n === 'avancerad' ? 'Avancerad nivå' : 'Expertnivå'),
  },
  /** Startraden i Alla tester och Fler kurvor. */
  rad: {
    titel: 'Nivåkollen',
    text: (kind: NivakollKind) => `Kolla din nivå på cirka ${MINUTER[kind]} minuter. Dagens pass väljs efter den.`,
    /** Logikens rad leder till matrisens Nivåkoll. */
    textMatris: 'Kolla din nivå på cirka åtta minuter. Dagens pass väljs efter den.',
    gjord: (niva: number) => `Senaste nivån ${nivaKort(niva)}. Dagens pass väljs efter den.`,
    knapp: 'Kolla min nivå',
  },
} as const;
