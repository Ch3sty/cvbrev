// src/components/session/copy.ts
// =============================================================================
// Sessionsramens ord (plan-testflode-2026-11-20 avsnitt 1, 2, 4, 5 och 6
// Ordlista). En term per sak: uppgift, Nästa, Svara, Lämna in, Visa
// resultatet, Förklaringen, provets tid. Inga talstreck, aldrig ordet för
// en träningsomgång som produkten slutat använda. Ren, går att importera
// från klienten.
// =============================================================================

import { NIVA_ORD } from '@/lib/traning/rubrik';
import type { Lage } from './lagesregler';

/** Objektet i avbryt-dialogens rubrik: "Avbryta nivåtestet?". */
const OBJEKT: Record<Lage, string> = {
  nivakoll: 'Nivåkollen',
  nivatest: 'nivåtestet',
  trana: 'träningen',
  ovningsprov: 'övningsprovet',
  iprov: 'övningsprovet',
  personlighet: 'testet',
};

/** Konsekvensraden under rubriken (avsnitt 1, Avbryt-dialogen). */
const KONSEKVENS: Record<Lage, string> = {
  nivakoll: 'Du kan fortsätta senare i dag.',
  nivatest: 'Dina svar sparas. Du kan fortsätta från startsidan.',
  trana: 'Svaren hittills sparas.',
  ovningsprov: 'Avbryter du sparas inget resultat.',
  iprov: 'Avbryter du sparas inget resultat.',
  personlighet: 'Dina svar sparas. Du kan fortsätta från startsidan.',
};

/** Lägets namn i undertiteln och på startskärmens topprad. */
export const LAGESNAMN: Record<Lage, string> = {
  nivakoll: 'Nivåkollen',
  nivatest: 'Nivåtest',
  trana: 'Träna',
  ovningsprov: 'Övningsprov',
  iprov: 'I-provet',
  personlighet: 'Personlighetstest',
};

/** "[Läget] klart" som eyebrow på resultatet (Ordlistan, Klart). */
export const KLART: Record<Lage, string> = {
  nivakoll: 'Nivåkollen klar',
  nivatest: 'Nivåtestet klart',
  trana: 'Träningen klar',
  ovningsprov: 'Övningsprovet klart',
  iprov: 'Övningsprovet klart',
  personlighet: 'Testet klart',
};

export type NivaNamn = keyof typeof NIVA_ORD;

const TAL = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv'];
/** "Fyra" och "15": ord upp till tolv, siffror därefter (skrivregeln i copyn). */
export function antalOrd(n: number, versal = false): string {
  const s = n >= 0 && n < TAL.length ? TAL[n] : String(n);
  return versal ? s[0].toUpperCase() + s.slice(1) : s;
}

function tidText(sek: number): string {
  const s = Math.max(0, Math.round(sek));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export const SESSION = {
  /** Undertiteln: "Nivåtest, grundnivå", "Träna, avancerad nivå", "Nivåkollen". */
  undertitel: (lage: Lage, niva?: NivaNamn | null, format?: string | null): string => {
    if (format) return `${LAGESNAMN[lage]}, samma format som ${format}`;
    if (niva) return `${LAGESNAMN[lage]}, ${NIVA_ORD[niva]}`;
    return LAGESNAMN[lage];
  },
  genomgangUndertitel: (lage: Lage) => `${LAGESNAMN[lage]}, genomgång`,

  avbryt: {
    aria: 'Avbryt',
    titel: (lage: Lage) => `Avbryta ${OBJEKT[lage]}?`,
    text: (lage: Lage) => KONSEKVENS[lage],
    fortsatt: 'Fortsätt',
    avbryt: 'Avbryt',
  },
  lamnaIn: {
    titel: 'Lämna in?',
    text: (obesvarade: number) =>
      obesvarade === 0
        ? 'Alla uppgifter är besvarade.'
        : obesvarade === 1
          ? 'En uppgift är obesvarad och räknas som fel.'
          : `${obesvarade} uppgifter är obesvarade och räknas som fel.`,
    bekrafta: 'Lämna in',
    fortsatt: 'Fortsätt',
  },
  knapp: {
    nasta: 'Nästa',
    svara: 'Svara',
    lamnaIn: 'Lämna in',
    visaResultat: 'Visa resultatet',
    vetInte: 'Vet inte, visa förklaringen',
    vetInteKort: 'Vet inte',
    forsokIgen: 'Försök igen',
    tillResultatet: 'Till resultatet',
    sparar: 'Sparar',
  },
  raknare: {
    aria: (nr: number, antal: number) => `Uppgift ${nr} av ${antal}`,
    oppna: (nr: number, antal: number) => `Uppgift ${nr} av ${antal}. Visa alla uppgifter`,
  },
  foregaende: 'Föregående uppgift',
  framstegAria: (nr: number, antal: number) => `Uppgift ${nr} av ${antal}`,
  ark: {
    rubrik: 'Uppgifter',
    rad: (besvarade: number, antal: number) => `${besvarade} av ${antal} besvarade`,
    stang: 'Stäng',
    cell: (nr: number, lage: 'besvarad' | 'aktuell' | 'hoppad' | 'kvar') =>
      `Uppgift ${nr}${lage === 'besvarad' ? ', besvarad' : lage === 'aktuell' ? ', den du står på' : lage === 'hoppad' ? ', obesvarad' : ''}`,
  },
  klocka: {
    kvar: (sek: number) => {
      const s = Math.max(0, Math.ceil(sek));
      if (s >= 120) return `${Math.ceil(s / 60)} minuter kvar av provets tid`;
      return `${tidText(s)} kvar av provets tid`;
    },
    over: (sek: number) => `${tidText(sek)} över provets tid`,
    referens: (sek: number, budget: number) => `${Math.round(sek)} sekunder på uppgiften, provets tid ${budget} sekunder`,
  },
  sparfel: {
    rad: 'Ett svar sparades inte.',
    flera: (n: number) => `${n} svar sparades inte.`,
    knapp: 'Försök igen',
    blockerat: 'Svaret gick inte att spara. Inget är förlorat, försök igen.',
    lamnaIn: 'Svaren gick inte att lämna in. Kontrollera uppkopplingen och försök igen.',
  },
  forklaring: {
    eyebrow: 'Förklaringen',
    ratt: 'Rätt',
    fel: 'Inte den här',
    vetInte: 'Förklaringen',
    obesvarad: 'Obesvarad',
    misstag: 'Ditt misstag',
    tid: (sek: number, budget: number | null) => (budget ? `${Math.round(sek)} s, provets tid ${budget} s` : `${Math.round(sek)} s`),
  },
  laddar: {
    session: 'Hämtar uppgifterna',
    resultat: 'Räknar fram resultatet',
  },
  fel: {
    start: 'Det gick inte att starta. Försök igen om en stund.',
    natet: 'Det gick inte att nå oss. Kontrollera uppkopplingen och försök igen.',
    hamta: 'Uppgifterna gick inte att hämta.',
    hamtaRad: 'Försök igen. Det du har svarat är sparat.',
    avslut: 'Resultatet gick inte att räkna fram. Svaren är sparade, försök igen.',
  },
  start: {
    tillbaka: 'Tillbaka',
    reglerAria: 'Det här gäller',
    starta: {
      nivakoll: 'Starta Nivåkollen',
      nivatest: 'Starta testet',
      trana: 'Starta träningen',
      ovningsprov: 'Starta övningsprovet',
      iprov: 'Starta övningsprovet',
      personlighet: 'Starta testet',
    } as Record<Lage, string>,
    fortsatt: {
      nivakoll: 'Fortsätt Nivåkollen',
      nivatest: 'Fortsätt testet',
      trana: 'Fortsätt träningen',
      ovningsprov: 'Fortsätt övningsprovet',
      iprov: 'Fortsätt övningsprovet',
      personlighet: 'Fortsätt testet',
    } as Record<Lage, string>,
    gorOm: 'Gör om testet',
    startar: 'Startar',
    kvar: (n: number) => (n === 1 ? 'Du har en uppgift kvar.' : `Du har ${n} uppgifter kvar.`),
    kryssruta: 'Förklaring efter varje svar',
    kryssrutaPa: 'Rätt svar och förklaringen direkt efter svaret.',
    kryssrutaAv: 'Svara i provets tempo, facit i genomgången.',
  },
  resultat: {
    stang: 'Stäng',
    rattAv: (ratt: number, antal: number) => `${ratt} av ${antal} rätt`,
    ringAria: (ratt: number, antal: number) => `${ratt} av ${antal} rätt`,
    genomgang: 'Genomgång',
    gaIgenom: 'Gå igenom',
    visaAlla: 'Visa alla',
    tappade: 'Var du tappade',
    tempo: 'Tempo mot provets tid',
    nastaSteg: 'Nästa steg',
    tillbaka: 'Tillbaka till Rekryteringstester',
    genomgangTitel: (n: number) =>
      n === 0 ? 'Allt rätt' : n === 1 ? 'En uppgift att titta på' : `${antalOrd(n, true)} uppgifter att titta på`,
    genomgangAllaTitel: (n: number) => `${antalOrd(n, true)} uppgifter att titta på`,
    overTid: (sek: number) => {
      const min = Math.max(1, Math.round(sek / 60));
      return `${min} min över provets tid`;
    },
    inomTid: 'Inom provets tid',
  },
} as const;

export { tidText };
